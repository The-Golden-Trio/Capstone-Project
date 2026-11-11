/**
 * Prisma giả trong bộ nhớ, chỉ đủ cho luồng ca làm (RunService, RunStore,
 * TurnProcessor). Giữ đúng một ràng buộc quan trọng: `run_event` unique theo
 * `(runId, seq)` — trùng thì ném lỗi mã `P2002` như Prisma thật.
 * Không có rollback: test không dựa vào giao dịch bị huỷ giữa chừng.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

type Row = Record<string, any>;

function matchesWhere(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (
      cond &&
      typeof cond === 'object' &&
      !(cond instanceof Date) &&
      'in' in cond
    )
      return (cond.in as unknown[]).includes(row[key]);
    return row[key] === cond;
  });
}

function pick(row: Row, select?: Row): Row {
  if (!select) return { ...row };
  return Object.fromEntries(Object.keys(select).map((k) => [k, row[k]]));
}

class Table {
  rows: Row[] = [];
  constructor(
    private readonly defaults: () => Row,
    private readonly unique: (a: Row, b: Row) => boolean = (a, b) =>
      a.id !== undefined && a.id === b.id,
  ) {}

  async create({ data, select }: { data: Row; select?: Row }) {
    const row = { ...this.defaults(), ...data };
    if (this.rows.some((r) => this.unique(r, row)))
      throw Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    this.rows.push(row);
    return pick(row, select);
  }
  async findUnique({ where, select }: { where: Row; select?: Row }) {
    const flat = Object.assign(
      {},
      ...Object.values(where).map((v) => (v && typeof v === 'object' ? v : {})),
      where,
    );
    const keys = Object.fromEntries(
      Object.entries(flat).filter(([, v]) => typeof v !== 'object'),
    );
    const row = this.rows.find((r) => matchesWhere(r, keys));
    return row ? pick(row, select) : null;
  }
  async findFirst({
    where,
    orderBy,
    select,
  }: {
    where?: Row;
    orderBy?: Row;
    select?: Row;
  }) {
    return (await this.findMany({ where, orderBy, select }))[0] ?? null;
  }
  async findMany({
    where,
    orderBy,
    select,
  }: { where?: Row; orderBy?: Row; select?: Row } = {}) {
    let rows = this.rows.filter((r) => matchesWhere(r, where));
    if (orderBy) {
      const [key, dir] = Object.entries(orderBy)[0] as [string, 'asc' | 'desc'];
      rows = [...rows].sort(
        (a, b) =>
          (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) *
          (dir === 'desc' ? -1 : 1),
      );
    }
    return rows.map((r) => pick(r, select));
  }
  async update({ where, data }: { where: Row; data: Row }) {
    const row = this.rows.find((r) => matchesWhere(r, where));
    if (!row) throw new Error(`Không có hàng ${JSON.stringify(where)}`);
    Object.assign(row, data);
    return { ...row };
  }
  async upsert({
    where,
    create,
    update,
  }: {
    where: Row;
    create: Row;
    update: Row;
  }) {
    const row = this.rows.find((r) => matchesWhere(r, where));
    if (row) return Object.assign(row, update);
    return this.create({ data: create });
  }
}

export function memoryPrisma() {
  let eventId = 0n;
  const now = () => new Date();
  const db = {
    scenarioRun: new Table(() => ({
      status: 'IN_PROGRESS',
      isPlaytest: false,
      pausedAt: null,
      completedAt: null,
      startedAt: now(),
      currentNodeId: null,
      enrolmentId: null,
    })),
    runEvent: new Table(
      () => ({ id: ++eventId, createdAt: now() }),
      (a, b) => a.runId === b.runId && a.seq === b.seq,
    ),
    answer: new Table(() => ({
      submittedAt: now(),
      completedAt: null,
      lineTo: null,
      jobId: null,
    })),
    scenarioFeedback: new Table(
      () => ({ createdAt: now() }),
      (a, b) => a.runId === b.runId,
    ),
    playerNote: new Table(() => ({
      id: `note-${Math.random()}`,
      createdAt: now(),
    })),
    contentFlag: new Table(() => ({
      id: `flag-${Math.random()}`,
      status: 'OPEN',
      createdAt: now(),
    })),
    enrollment: new Table(() => ({})),
    user: new Table(() => ({})),
    async $transaction(arg: any) {
      if (typeof arg === 'function') return arg(db);
      return Promise.all(arg);
    },
  };
  return db;
}

export type MemoryPrisma = ReturnType<typeof memoryPrisma>;
