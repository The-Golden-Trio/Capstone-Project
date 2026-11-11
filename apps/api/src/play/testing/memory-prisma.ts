/**
 * Prisma giả trong bộ nhớ, chỉ đủ cho luồng ca làm (ShiftRunService,
 * ShiftLogService, ShiftTurnProcessor). Giữ ràng buộc unique của `run_event`
 * theo `(runId, seq)`: trùng thì ném lỗi mã `P2002` như Prisma thật. Khoá
 * dòng (`$queryRaw … FOR UPDATE`) và rollback không giả lập.
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

const pick = (row: Row, select?: Row): Row =>
  select
    ? Object.fromEntries(Object.keys(select).map((k) => [k, row[k]]))
    : { ...row };

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
  async createMany({ data }: { data: Row[] }) {
    for (const d of data) await this.create({ data: d });
    return { count: data.length };
  }
  async findUnique({ where, select }: { where: Row; select?: Row }) {
    const row = this.rows.find((r) => matchesWhere(r, where));
    return row ? pick(row, select) : null;
  }
  async findFirst(args: { where?: Row; orderBy?: Row; select?: Row }) {
    return (await this.findMany(args))[0] ?? null;
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
    for (const [k, v] of Object.entries(data))
      row[k] =
        v && typeof v === 'object' && 'increment' in v
          ? (row[k] ?? 0) + v.increment
          : v;
    return { ...row };
  }
}

export function memoryPrisma() {
  let runId = 0;
  let eventId = 0n;
  const now = () => new Date();
  const db = {
    scenarioRun: new Table(() => ({
      id: `run-${++runId}`,
      status: 'IN_PROGRESS',
      flow: 'replay',
      completedAt: null,
      startedAt: now(),
      currentActivityKey: null,
    })),
    runEvent: new Table(
      () => ({ id: ++eventId, createdAt: now() }),
      (a, b) => a.runId === b.runId && a.seq === b.seq,
    ),
    aiJob: new Table(() => ({
      status: 'QUEUED',
      attempts: 0,
      queuedAt: now(),
      finishedAt: null,
      lastError: null,
    })),
    user: new Table(() => ({})),
    shiftSeedDoc: new Table(
      () => ({}),
      () => false,
    ),
    async $queryRaw() {
      return [];
    },
    async $transaction(arg: any) {
      if (typeof arg === 'function') return arg(db);
      return Promise.all(arg);
    },
  };
  return db;
}
