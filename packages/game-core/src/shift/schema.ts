/**
 * Khuôn dữ liệu của một ca làm (seed v2) và gói cấp, theo Game Design W45:
 * `research/reports/Seed scenario JobQuest.md` (khối A, G, B, C, D) và
 * `research/reports/Luật dẫn truyện JobQuest.md` (A1–A13, bản 3).
 *
 * Khác seed cũ (`data/schema.ts`): màn không còn là chuỗi `activities` nối
 * bằng `forward_to`, mà là các nút canon (mở, giữa, kết) xen pha xử lý tự do
 * tốn điểm thời gian. Hai khuôn sống song song tới khi luồng cũ được bỏ.
 *
 * Phần chấm (`observes`, `signs`, profile phương án) chưa có trong seed mẫu
 * bản 4, nên ở đây chỉ giữ chỗ.
 */
import { z } from 'zod';

/* ── Mảnh dùng chung ─────────────────────────────────────────────────── */

/** Bộ 8 biểu cảm có asset (khối C3, luật A5). */
export const EXPRESSIONS = [
  'binh_thuong',
  'vui',
  'cuoi_lon',
  'ngac_nhien',
  'suy_nghi',
  'lo_lang',
  'kho_chiu',
  'buon',
] as const;
export const ExpressionSchema = z.enum(EXPRESSIONS);
export type Expression = z.infer<typeof ExpressionSchema>;

/** Giờ trong truyện, dạng "HH:MM". */
export const ClockTimeSchema = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, 'Giờ phải có dạng HH:MM');

/** `canh` là lời cảnh (ngôi thứ hai, không hỏi); còn lại là mã slot NPC. */
export const SCENE_SPEAKER = 'canh';

/** Một nhịp thoại: một ý, 1–2 câu, một biểu cảm (C3). */
export const BeatSchema = z.object({
  speaker: z.string().min(1),
  text: z.string().min(1),
  expression: ExpressionSchema.default('binh_thuong'),
});
export type Beat = z.infer<typeof BeatSchema>;

/**
 * Điều kiện trên cờ truyện. Rỗng là luôn đúng.
 * `all`: mọi cờ đều bật · `any`: ít nhất một cờ bật · `none`: không cờ nào bật.
 */
export const FlagExprSchema = z.object({
  all: z.array(z.string()).optional(),
  any: z.array(z.string()).optional(),
  none: z.array(z.string()).optional(),
});
export type FlagExpr = z.infer<typeof FlagExprSchema>;

export const ChannelSchema = z.enum(['chat', 'call', 'meet', 'group']);
export type Channel = z.infer<typeof ChannelSchema>;

/** Câu kiểm có/không (A12). `extract` chỉ đứng sau một câu có/không. */
export const CheckQuestionSchema = z.object({
  flag: z.string().min(1),
  q: z.string().min(1),
  extract: z
    .object({
      /** Giá trị cần chép nguyên văn: giờ, sự kiện, kênh. */
      fields: z.array(z.enum(['time', 'event', 'channel'])).min(1),
      /** Có thì ghi thành lời hứa với slot này (A1b). */
      promise_to: z.string().optional(),
    })
    .optional(),
});
export type CheckQuestion = z.infer<typeof CheckQuestionSchema>;

/** Nhãn cho phần nội dung soạn nháp, chưa qua chuyên gia (BR-05). */
const DraftNote = z.string().optional();

/* ── Gói cấp (khối G) ────────────────────────────────────────────────── */

export const LevelRuleSchema = z.object({
  id: z.string(),
  text: z.string(),
  /** Nút, slide hay tài liệu nói ra quy định này (A2). */
  told_at: z.string(),
});

export const LevelPackSchema = z.object({
  id: z.string(),
  company: z.object({ name: z.string(), profile: z.string() }),
  workplace: z.string(),
  team: z.string().optional(),
  level_scope: z.string(),
  resident_npcs: z.array(z.string()),
  rules: z.array(LevelRuleSchema),
  honest_note: z.string().optional(),
  shared_facts: z.array(z.string()).default([]),
  /** Một điểm thời gian bằng bao nhiêu phút (A1). */
  minutes_per_point: z.number().int().positive(),
  /** Trần câu hỏi thêm mỗi nút, thay cho `followupCap()` viết cứng (D4). */
  followup_cap: z.number().int().nonnegative().default(1),
  _draft: DraftNote,
});
export type LevelPack = z.infer<typeof LevelPackSchema>;

/* ── Fact sheet và tài liệu (khối B) ─────────────────────────────────── */

export const FactSchema = z.object({
  id: z.string(),
  text: z.string(),
  /** Số và tên riêng tách ra cho máy kiểm R1, và để nhận ra lúc NPC đã nói. */
  values: z.array(z.string()).default([]),
  visibility: z.enum(['shown', 'on_ask', 'ai_only']),
  /** Mở bằng cách hỏi slot nào, hoặc mở tài liệu nào. */
  unlock: z
    .object({
      by: z.enum(['ask', 'artefact']),
      slots: z.array(z.string()).optional(),
      artefact: z.string().optional(),
    })
    .optional(),
  known_by: z.array(z.string()).default([]),
  required: z.boolean().default(false),
  /** Chỉ được lộ từ nút này trở đi. */
  reserved_for: z.string().optional(),
  _draft: DraftNote,
});
export type Fact = z.infer<typeof FactSchema>;

export const ArtefactFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export const ArtefactBranchSchema = z.object({
  if: FlagExprSchema.default({}),
  /** Dòng hiện ra khi chạy. */
  lines: z.array(z.string()).min(1),
  /** Sự kiện phát ra lần đầu nhánh này chạy (lời hứa theo sự kiện, A1b). */
  emits: z.string().optional(),
});

export const ArtefactSchema = z.object({
  id: z.string(),
  title: z.string(),
  /**
   * `document`: tài liệu đọc được · `form`: mẫu người chơi gõ vào ·
   * `result`: kết quả do engine chọn theo cờ (A8, D7).
   */
  kind: z.enum(['document', 'form', 'result']),
  body: z.array(z.string()).optional(),
  fields: z.array(ArtefactFieldSchema).optional(),
  ticks: z.array(ArtefactFieldSchema).optional(),
  /** Câu kiểm chạy lúc lưu (A12). */
  checks: z.array(CheckQuestionSchema).default([]),
  /** Ô tick bật cờ trực tiếp: `{ h4: "gc.h4" }`. */
  tick_flags: z.record(z.string(), z.string()).default({}),
  /** Kênh chung: lưu tin là nói trước mặt mọi slot trong kênh (A12, D4). */
  channel_members: z.array(z.string()).optional(),
  /** Dành cho `result`: xét từ trên xuống, nhánh đầu khớp thì dùng. */
  branches: z.array(ArtefactBranchSchema).optional(),
  unlocks: z.array(z.string()).default([]),
  _draft: DraftNote,
});
export type Artefact = z.infer<typeof ArtefactSchema>;

/* ── Cast (khối C) ───────────────────────────────────────────────────── */

export const ConcernSchema = z.object({
  id: z.string(),
  text: z.string(),
  /** `null`: không gỡ được trong màn này. */
  resolve_when: FlagExprSchema.nullable(),
  /** Giấu khỏi AI-4 tới nút này, và chỉ xét gỡ ở nút này (A13). */
  hold_until: z.string().optional(),
});

export const BeliefSchema = z.object({
  text: z.string(),
  /** Cờ này bật thì NPC bỏ niềm tin (A12). */
  drop_when: z.string(),
});

export const CastSlotSchema = z.object({
  slot: z.string(),
  /** Bản 1 điền cố định; hệ tarot (C1) để sau. */
  name: z.string(),
  relation: z.string(),
  source: z.enum(['resident', 'guest']),
  want: z.string(),
  pressure: z.string(),
  stance: z.string(),
  concerns: z.array(ConcernSchema).default([]),
  default_channel: ChannelSchema,
  expertise: z.number().int().min(0).max(3),
  beliefs: z.array(BeliefSchema).default([]),
  disclosure_style: z.string(),
  voice: z.string(),
  /** Câu đáp khi người chơi xin duyệt giữa pha (A13). */
  approval_line: BeatSchema.optional(),
  present_at_end: z.boolean().default(true),
});
export type CastSlot = z.infer<typeof CastSlotSchema>;

/** Câu kiểm đọc từ hội thoại với một hay nhiều slot (A12). */
export const ConversationCheckSchema = CheckQuestionSchema.extend({
  slots: z.array(z.string()).min(1),
  /** Chạy sau từng lượt của người chơi, cho việc NPC phải đáp ngay. */
  realtime: z.boolean().default(false),
  /** Câu này cũng đọc tin ở kênh chung có slot đó. */
  in_channel: z.boolean().default(true),
  /** "Có" ở lượt này thì NPC đáp tối đa 1 nhịp rồi nói `approval_line` (A13). */
  on_yes: z.enum(['approval_line']).optional(),
});
export type ConversationCheck = z.infer<typeof ConversationCheckSchema>;

/* ── Hành động, nhịp nền, mốc giờ (khối D, A1, A1b, A10) ─────────────── */

export const ActionSchema = z.object({
  key: z.string(),
  label: z.string(),
  points: z.number().int().nonnegative(),
  kind: z.enum([
    'talk',
    'open',
    'write',
    'rewrite',
    'run',
    'message',
    'meeting',
    'wait',
    'trigger',
  ]),
  /** Slot (talk), tài liệu (open, write, run, message) hay nút (trigger). */
  target: z.string().optional(),
  /** Các slot dự họp (meeting). */
  slots: z.array(z.string()).optional(),
  /** Chỉ hiện khi điều kiện này đúng. */
  requires: FlagExprSchema.optional(),
  /** Cờ bật khi hành động xong. */
  sets: z.array(z.string()).default([]),
  /** Mở lại không tốn điểm (xem lại tài liệu). */
  free_on_repeat: z.boolean().default(false),
});
export type Action = z.infer<typeof ActionSchema>;

export const AmbientSchema = z.object({
  id: z.string(),
  text: z.string(),
  before: ClockTimeSchema.optional(),
  after: ClockTimeSchema.optional(),
});

export const TimelineItemSchema = z.object({
  at: ClockTimeSchema,
  /** `silent`: chỉ đổi dữ kiện, không hiện, không cắt hành động. */
  kind: z.enum(['silent', 'scene']),
  text: z.string().optional(),
  fact_update: z.object({ fact: z.string(), text: z.string() }).optional(),
});

export const PromiseReminderSchema = z.object({
  to: z.string(),
  channel: ChannelSchema,
  beats: z.array(BeatSchema).min(1),
  /** Biến thể khi người chơi đã nhắn kênh chung sau lúc hứa. */
  after_channel_message: z.array(BeatSchema).optional(),
});

/* ── Nút canon (D1, D5, A6, A7, A11, A13) ────────────────────────────── */

export const AdaptSchema = z.object({
  if: FlagExprSchema.default({}),
  beats: z.array(BeatSchema).min(1),
});

export const ProbeHookSchema = z.object({
  /** Nhánh: hook chỉ dùng khi điều kiện đúng. */
  if: FlagExprSchema.default({}),
  text: z.string(),
  /** Cờ đã bật nghĩa là người chơi tự nói ý này rồi: bỏ qua hook (A7). */
  answered_if: z.string().optional(),
});

export const NodeOptionSchema = z.object({
  key: z.string(),
  text: z.string(),
  reaction: z.array(BeatSchema).min(1),
  sets: z.array(z.string()).default([]),
  /** Phương án là lời hứa theo giờ (A1b). */
  promise: z
    .object({
      to: z.string(),
      at: ClockTimeSchema.optional(),
      event: z.string().optional(),
      channel: ChannelSchema,
    })
    .optional(),
  _draft: DraftNote,
});

export const NodeSchema = z.object({
  id: z.string(),
  kind: z.enum(['open', 'mid', 'end']),
  trigger: z.object({
    by: z.enum(['start', 'time', 'player']),
    at: ClockTimeSchema.optional(),
    /** Nút do người chơi bật: tới giờ này mà chưa bấm thì NPC nhắc và nút bật. */
    fallback_at: ClockTimeSchema.optional(),
    /** Hành động bấm bật nút. */
    action: z.string().optional(),
  }),
  speaker: z.string(),
  channel: ChannelSchema,
  /** Lõi cố định của nút (D-67, D-89); không hiện, để người soạn và AI-4 đọc. */
  core: z.string(),
  /** Lời dẫn: xét từ trên xuống. `when` giới hạn theo cách nút bật. */
  adapt: z
    .array(
      AdaptSchema.extend({
        when: z
          .enum(['any', 'start', 'time', 'player', 'fallback'])
          .default('any'),
      }),
    )
    .default([]),
  format: z.enum(['free_reply', 'timed_choice', 'choice', 'artefact']),
  prompt: z.string().optional(),
  time_limit_seconds: z.number().int().positive().optional(),
  options: z.array(NodeOptionSchema).default([]),
  /** Hết giờ ở câu đếm giờ: mức 0, không cờ (D-86). */
  timeout: z
    .object({
      reaction: z.array(BeatSchema).min(1),
      sets: z.array(z.string()).default([]),
    })
    .optional(),
  artefact: z.string().optional(),
  /** Sau reaction, người chơi nói thêm một lượt tự do trong nút. */
  free_turn_after_reaction: z.boolean().default(false),
  /** Nhịp reaction soạn sẵn hiện trước phần AI-4 viết. */
  reaction_beats: z.array(BeatSchema).default([]),
  /** AI-4 viết thêm tối đa bấy nhiêu nhịp reaction (0 là không gọi). */
  reaction_ai_beats: z.number().int().nonnegative().default(0),
  probe: z
    .object({
      by: z.string(),
      direction: z.string(),
      hooks: z.array(ProbeHookSchema).min(1),
    })
    .optional(),
  /** Câu kiểm cả nút: chạy sau lượt cuối của người chơi, trước nhịp chốt. */
  node_checks: z.array(CheckQuestionSchema).default([]),
  /** Chạy lại câu kiểm hội thoại của các slot này trên chữ trong nút. */
  recheck_conversation_of: z.array(z.string()).default([]),
  /** Nút kết chốt theo khúc mắc (A13). */
  closing: z
    .object({
      concern: z.string(),
      approve_beats: z.array(BeatSchema).min(1),
      /** Hoãn: AI-4 viết theo hướng này, không dặn cách làm. */
      defer_hint: z.string(),
      approve_event: z.string().optional(),
    })
    .optional(),
  points: z.number().int().nonnegative().default(1),
});
export type ShiftNode = z.infer<typeof NodeSchema>;

export const ReviewItemSchema = z.object({
  id: z.string(),
  /** Điều kiện: cờ, hoặc còn lời hứa treo. */
  if: FlagExprSchema.default({}),
  when_promise_open: z.boolean().default(false),
  by: z.string(),
  channel: ChannelSchema,
  hook: z.string(),
});

/* ── Seed ────────────────────────────────────────────────────────────── */

export const ShiftSeedSchema = z.object({
  id: z.string().regex(/^[A-Z0-9_]+\.L\d+\.m\d+$/, 'id dạng NGHỀ.CẤP.mN'),
  version: z.number().int().positive(),
  level_ref: z.string(),
  title: z.string(),
  task_ref: z.string(),
  player_role: z.string(),
  limits: z.object({
    decide_alone: z.array(z.string()),
    need_approval: z.array(
      z.object({
        action: z.string(),
        approver: z.string(),
        told_at: z.string(),
      }),
    ),
    not_allowed: z.array(z.object({ action: z.string(), told_at: z.string() })),
  }),
  situation: z.string(),
  goal: z.string(),
  stakes: z.string(),
  clock: z.object({
    start: ClockTimeSchema,
    deadline: ClockTimeSchema,
    budget: z.number().int().positive(),
    /** Còn bấy nhiêu điểm thì có nhịp báo sắp hết giờ (A1b). */
    warn_remaining: z.number().int().positive(),
    warning: BeatSchema,
  }),
  glossary: z.array(z.object({ term: z.string(), plain: z.string() })),
  facts: z.array(FactSchema),
  artefacts: z.array(ArtefactSchema),
  cast: z.array(CastSlotSchema).min(1),
  conversation_checks: z.array(ConversationCheckSchema).default([]),
  story_flags: z.array(z.string()),
  actions: z.array(ActionSchema),
  ambient: z.array(AmbientSchema).default([]),
  /** Chèn ambient sau hành động tốn từ bấy nhiêu điểm (A10, D6). */
  ambient_min_points: z.number().int().positive().default(2),
  timeline: z.array(TimelineItemSchema).default([]),
  promise_reminders: z.array(PromiseReminderSchema).default([]),
  /** Sự kiện mà lời hứa có thể gắn vào ("có tin duyệt em báo chị"). */
  promise_events: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .default([]),
  /** "Tạm làm việc khác" hiện khi nút lõi kế theo giờ còn cách tối đa bấy nhiêu điểm. */
  wait_window: z.number().int().positive().default(6),
  nodes: z.array(NodeSchema).min(2),
  review: z.array(ReviewItemSchema).default([]),
  review_max: z.number().int().positive().default(2),
  /** Giữ chỗ cho khối E; seed mẫu bản 4 chưa có. */
  observes: z.array(z.unknown()).optional(),
  _draft: DraftNote,
});
export type ShiftSeed = z.infer<typeof ShiftSeedSchema>;

/** Bộ dữ liệu ca làm mà bước build xuất ra. */
export const ShiftDataSchema = z.object({
  packs: z.record(z.string(), LevelPackSchema),
  seeds: z.record(z.string(), ShiftSeedSchema),
});
export type ShiftData = z.infer<typeof ShiftDataSchema>;
