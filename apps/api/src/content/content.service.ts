import { Injectable, NotFoundException } from '@nestjs/common';
import {
  GameDataSchema,
  createGameIndex,
  type FollowupLine,
  type GameData,
  type GameIndex,
} from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';

/** Những gì máy khách cần ngay khi vào app. */
export interface ContentBootstrap {
  version: number;
  data: GameData;
  /**
   * Lời đào sâu, khoá là `"<scenarioKey>:<activityId>"`.
   *
   * Đi kèm bootstrap chứ không để máy khách tự giữ một bản: sự tồn tại của
   * lời thoại chính là điều kiện mở lượt đào sâu, nên hai bên mà lệch nhau
   * thì lượt chơi ở máy khách rẽ một nhánh còn lượt chạy lại ở máy chủ rẽ
   * nhánh khác, và điểm ra khác.
   */
  followups: Record<string, FollowupLine>;
}

/** Bản đồ ngân hà 3D — chỉ trang bản đồ cần, nên tách riêng. */
export interface GalaxyContent {
  version: number;
  groups: unknown[];
  nodes: unknown[];
  edges: unknown;
}

/** Một kịch bản kèm lời đào sâu của chính nó. */
export interface ScenarioContent {
  version: number;
  key: string;
  scenario: unknown;
  followups: Record<string, FollowupLine>;
}

/**
 * Nội dung game, đọc từ database.
 *
 * Trước đây nội dung nằm trong `packages/game-core/src/data` và được nạp lúc
 * khởi động. Giờ nó ở trong DB, nhưng tính chất quan trọng nhất vẫn giữ
 * nguyên: **một phiên bản là một ảnh chụp bất biến**. Không ai sửa hàng của
 * một phiên bản đã seed — muốn đổi nội dung thì seed phiên bản mới.
 *
 * Nhờ vậy cache ở đây an toàn tuyệt đối: đã đọc phiên bản N một lần thì không
 * bao giờ phải đọc lại, và lượt chơi đang dở vẫn chấm được bằng đúng bản nó
 * đã chơi dù phiên bản mới đã lên.
 */
@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  /** version -> bảng tra. Không bao giờ phải dọn, vì phiên bản là bất biến. */
  private readonly indexes = new Map<number, Promise<GameIndex>>();
  private readonly followups = new Map<number, Promise<Map<string, FollowupLine>>>();

  /** Phiên bản đang phục vụ. Hỏi lại mỗi lần vì seed có thể vừa lật cờ. */
  async activeVersion(): Promise<number> {
    const release = await this.prisma.contentRelease.findFirst({
      where: { active: true },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    if (!release) {
      throw new NotFoundException(
        'Chưa có nội dung nào trong database. Chạy: nx run @datn/api:seed-content',
      );
    }
    return release.version;
  }

  /** Bảng tra của phiên bản đang phục vụ. */
  async index(): Promise<GameIndex> {
    return this.indexAt(await this.activeVersion());
  }

  /**
   * Bảng tra của một phiên bản cụ thể.
   *
   * Đây là đường mà việc chấm điểm đi qua: lượt chơi đã ghim phiên bản nào thì
   * chạy lại bằng đúng phiên bản ấy.
   */
  indexAt(version: number): Promise<GameIndex> {
    const cached = this.indexes.get(version);
    if (cached) return cached;

    // Lưu chính Promise chứ không phải kết quả: hai yêu cầu đến cùng lúc lúc
    // máy chủ vừa khởi động sẽ dùng chung một lần đọc, không đọc hai lần.
    const building = this.buildIndex(version);
    this.indexes.set(version, building);
    // Đọc hỏng thì bỏ khỏi cache để lần sau thử lại, chứ không giữ lỗi mãi.
    building.catch(() => this.indexes.delete(version));
    return building;
  }

  private async buildIndex(version: number): Promise<GameIndex> {
    const [roles, scenarios, sharedEvents, quiz, meta] = await Promise.all([
      this.prisma.roleDoc.findMany({
        where: { version },
        orderBy: { roleCode: 'asc' },
        select: { body: true },
      }),
      this.prisma.scenarioDoc.findMany({
        where: { version },
        select: { key: true, body: true },
      }),
      this.prisma.sharedEventDoc.findMany({
        where: { version },
        orderBy: { eventId: 'asc' },
        select: { body: true },
      }),
      this.prisma.quizQuestionDoc.findMany({
        where: { version },
        orderBy: { ordinal: 'asc' },
        select: { body: true },
      }),
      this.prisma.metaDoc.findMany({
        where: { version },
        select: { key: true, body: true },
      }),
    ]);

    const metaByKey = new Map(meta.map((m) => [m.key, m.body]));

    const raw = {
      _meta: metaByKey.get('_meta'),
      fit_dimensions: metaByKey.get('fit_dimensions'),
      all_roles: metaByKey.get('all_roles'),
      quiz: { questions: quiz.map((q) => q.body) },
      roles: roles.map((r) => r.body),
      shared_events: sharedEvents.map((e) => e.body),
      scenarios: Object.fromEntries(scenarios.map((s) => [s.key, s.body])),
    };

    // Kiểm ngay ở đây chứ không tin DB. Hàng trong DB do script seed ghi, mà
    // script ấy cũng có thể sai — và một bộ dữ liệu khuyết thì lỗi sẽ lộ ra ở
    // một màn chơi nào đó chứ không phải ở chỗ nạp.
    const result = GameDataSchema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join('.') || '(gốc)'}: ${i.message}`)
        .join('; ');
      throw new Error(`Nội dung phiên bản ${version} hỏng — ${issues}`);
    }

    return createGameIndex(result.data);
  }

  /* ── Lời đào sâu ─────────────────────────────────────────────────── */

  private followupsAt(version: number): Promise<Map<string, FollowupLine>> {
    const cached = this.followups.get(version);
    if (cached) return cached;

    const building = this.prisma.followupDoc
      .findMany({
        where: { version },
        select: { scenarioKey: true, activityId: true, who: true, text: true },
      })
      .then(
        (rows) =>
          new Map(
            rows.map((r) => [
              `${r.scenarioKey}:${r.activityId}`,
              { who: r.who, text: r.text },
            ]),
          ),
      );

    this.followups.set(version, building);
    building.catch(() => this.followups.delete(version));
    return building;
  }

  /**
   * Hàm tra lời đào sâu cho engine, ở một phiên bản cụ thể.
   *
   * Có lời mới được mở lượt đào sâu, nên đây vừa là nội dung vừa là điều kiện
   * của luật chơi — và vì thế nó cũng phải theo phiên bản đã ghim.
   */
  async followupLookup(
    version: number,
    scenarioKey: string,
  ): Promise<(activityId: string) => FollowupLine | undefined> {
    const lines = await this.followupsAt(version);
    return (activityId) => lines.get(`${scenarioKey}:${activityId}`);
  }

  /* ── Tải cho máy khách ───────────────────────────────────────────── */

  async bootstrap(): Promise<ContentBootstrap> {
    const version = await this.activeVersion();
    const [index, followups] = await Promise.all([
      this.indexAt(version),
      this.followupsAt(version),
    ]);
    return {
      version,
      data: index.data,
      followups: Object.fromEntries(followups),
    };
  }

  async galaxy(): Promise<GalaxyContent> {
    const version = await this.activeVersion();
    const rows = await this.prisma.galaxyDoc.findMany({
      where: { version },
      orderBy: { key: 'asc' },
      select: { kind: true, key: true, body: true },
    });

    if (rows.length === 0) {
      throw new NotFoundException('Phiên bản này chưa có dữ liệu ngân hà');
    }

    return {
      version,
      groups: rows.filter((r) => r.kind === 'group').map((r) => r.body),
      nodes: rows.filter((r) => r.kind === 'node').map((r) => r.body),
      edges: rows.find((r) => r.kind === 'edges')?.body ?? [],
    };
  }

  async scenario(key: string): Promise<ScenarioContent> {
    const version = await this.activeVersion();
    const index = await this.indexAt(version);

    const entry = index.findScenarioByKey(key);
    if (!entry) throw new NotFoundException('Không có kịch bản này');

    const lines = await this.followupsAt(version);
    const prefix = `${key}:`;
    const followups = Object.fromEntries(
      [...lines.entries()]
        .filter(([id]) => id.startsWith(prefix))
        .map(([id, line]) => [id.slice(prefix.length), line]),
    );

    return { version, key, scenario: entry.scenario, followups };
  }
}
