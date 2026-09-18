/**
 * Hình dạng của `game-data.json` — sinh bởi `node docs/data/build.mjs`.
 *
 * Kiểm ở biên: dữ liệu chỉ được kiểm một lần duy nhất tại `gameData.ts`.
 * Sau điểm đó cả app dùng kiểu suy ra từ đây, không cast, không `any`.
 * Dataset đổi hình -> Zod báo đúng đường dẫn field ngay lúc khởi động,
 * thay vì `undefined` nổ ở ba màn hình sau.
 */
import { z } from 'zod';

/** 8 chiều fit: INTERRUPT, DEEP_WORK, … Giá trị là mô tả tiếng Việt. */
export const FitDimensionsSchema = z.record(z.string(), z.string());

/** Vector tín hiệu: chiều -> điểm cộng/trừ. Thiếu chiều nghĩa là 0. */
export const SignalSchema = z.record(z.string(), z.number());

/** Ba mốc hành vi dùng để chấm mọi hoạt động. */
export const AnchorSchema = z.enum(['+2', '0', '-1']);

const AnchorTextSchema = z.object({
  '+2': z.string(),
  '0': z.string(),
  '-1': z.string(),
});

/**
 * Hồ sơ hợp nghề: vector 8 chiều kèm cờ `_derived`. Cờ bị lọc bỏ khi parse
 * nên downstream chỉ nhận `Record<string, number>`.
 */
export const FitProfileSchema = z
  .record(z.string(), z.union([z.number(), z.boolean()]))
  .transform((raw) =>
    Object.fromEntries(
      Object.entries(raw).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number',
      ),
    ),
  );

/* ── Nghề ──────────────────────────────────────────────────────────── */

export const SalaryBandSchema = z.object({
  band: z.string(),
  label: z.string().nullish(),
  salary_avg: z.number().nullish(),
  evidence_level: z.string().nullish(),
});

export const SimilarRoleSchema = z.object({
  role_code: z.string(),
  role_name: z.string().nullish(),
  weight: z.number(),
  why: z.string().nullish(),
  shared_skills_top: z.array(z.string()).default([]),
});

export const ReasonToLeaveSchema = z.object({
  label: z.string(),
  pct: z.number(),
});

/** Sự kiện ngắn — "nhiệm vụ phụ". Chỉ hé lộ tính cách, không cho điểm kỹ năng. */
export const GameEventSchema = z.object({
  event_id: z.string(),
  role_code: z.string().nullable(),
  scope: z.string().nullish(),
  title: z.string(),
  setup: z.string(),
  measures: z.array(z.string()).default([]),
  band_range: z.array(z.string()).default([]),
  frequency: z.string().nullish(),
  evidence_level: z.string().nullish(),
  source_note: z.string().nullish(),
  choices: z.array(
    z.object({
      text: z.string(),
      outcome: z.string(),
      signal: SignalSchema.default({}),
    }),
  ),
});

export const RoleSchema = z.object({
  role_code: z.string(),
  role_name: z.string(),
  role_name_vn: z.string(),
  role_group: z.string(),
  experience: z.string(),
  archetype: z.string().nullish(),
  bands: z.string(),
  band_start: z.string(),
  band_end: z.string(),
  salary_by_band: z.array(SalaryBandSchema).default([]),
  salary_note: z.string().nullable(),
  reasons_to_leave: z.array(ReasonToLeaveSchema).default([]),
  work_life_evidence: z.string().nullable(),
  similar_ranked: z.array(SimilarRoleSchema).default([]),
  progresses_to: z.array(z.string()).default([]),
  events: z.array(GameEventSchema).default([]),
  /**
   * Suy ra từ chính sự kiện của nghề — xem `fitProfile()` trong build.mjs.
   * Dataset gắn kèm cờ `_derived: true` để không ai nhầm đây là số đo thật;
   * bỏ cờ ra ở đây để phần còn lại của app chỉ thấy một vector số sạch.
   */
  fit_profile: FitProfileSchema,
});

/* ── Kịch bản sâu ──────────────────────────────────────────────────── */

/** Kỹ năng cứng (kỹ thuật) hay mềm (cách làm việc với người). */
export const SkillTypeSchema = z.enum(['hard', 'soft']);

const ObserveSchema = z.object({
  skill_type: SkillTypeSchema,
  skill: z.string(),
  anchors: AnchorTextSchema,
});

const HintSchema = z.object({
  text: z.string(),
  costs_ceiling: z.boolean().default(true),
});

const ChoiceItemSchema = z.object({
  item_id: z.string(),
  text: z.string(),
  note: z.string().nullish(),
});

/**
 * Bốn kiểu hoạt động dùng chung phần lớn field. Dataset để `null` cho field
 * không dùng thay vì bỏ hẳn, nên dùng base + refine theo `type` thay cho
 * discriminated union — union sẽ bắt buộc phải liệt kê `null` ở mọi nhánh.
 */
export const ActivityTypeSchema = z.enum([
  'CHOICE',
  'ORDERING',
  'PRIORITIZING',
  'FREETEXT',
]);

export const ActivitySchema = z.object({
  activity_id: z.string(),
  type: ActivityTypeSchema,
  summary: z.string().nullish(),
  choice_reason: z.string().nullish(),
  isOrigin: z.boolean().default(false),
  /** `activity_id` kế tiếp, hoặc chuỗi "END". */
  forward_to: z.string(),
  context: z.record(z.string(), z.unknown()).nullish(),
  setup: z.string(),
  npc_line: z.string().nullable(),
  input_prompt: z.string().nullable(),
  closing_prompt: z.string(),
  observes: z.array(ObserveSchema).min(1),
  hints: z.array(HintSchema).default([]),
  limitFollowup: z.number().default(0),
  followup_goal: z.string().nullish(),
  /** Có đếm ngược không, và bao nhiêu giây. */
  quick_action: z.boolean().default(false),
  time_limit_seconds: z.number().nullish(),

  // CHOICE
  options: z.array(z.string()).nullable(),
  optionGrade: z.array(AnchorSchema).nullish(),
  optionWhy: z.array(z.string()).nullish(),

  // ORDERING + PRIORITIZING
  items: z.array(ChoiceItemSchema).nullish(),
  correct_order: z.array(z.string()).nullish(),
  pick_count: z.number().nullish(),
  must_pick: z.array(z.string()).nullish(),
  should_pick: z.array(z.string()).nullish(),
  must_not_pick: z.array(z.string()).nullish(),
});

export const RandomEventSchema = z.object({
  event_id: z.string(),
  chance: z.number(),
  after_activity: z.string(),
  condition: z
    .object({
      min_plus2: z.number().nullish(),
      max_minus1: z.number().nullish(),
      min_minus1: z.number().nullish(),
    })
    .nullable(),
  text: z.string(),
  /** DIVERT = chơi tiếp; EARLY_END = nhảy thẳng tới `early_ending_id`. */
  outcome: z.string(),
  divert_note: z.string().nullable(),
  early_ending_id: z.string().nullable(),
});

export const EndingSchema = z.object({
  ending_id: z.string(),
  type: z.enum(['GOOD', 'BAD', 'PARTIAL', 'SECRET']),
  /** Số nhỏ được xét trước. */
  priority: z.number(),
  condition: z.object({
    min_plus2: z.number().nullish(),
    max_minus1: z.number().nullish(),
    /** Có mô tả nghĩa là kết cục này chỉ mở khi người chơi chạm "bí mật". */
    extra: z.string().nullish(),
  }),
  text: z.string(),
  reveals: z.string().nullish(),
  reachable_by_event: z.boolean().default(false),
});

export const ScenarioSchema = z.object({
  scenario_title: z.string(),
  /**
   * Tên gọn để in trên bản đồ, cạnh ký hiệu địa điểm.
   *
   * Nhan đề đầy đủ là cả một câu nên không đặt cạnh ký hiệu được. Thiếu trường
   * này thì giao diện tự rút gọn nhan đề, nhưng máy cắt bao giờ cũng thua
   * người đặt tên.
   */
  shortname: z.string().nullish(),
  job: z.object({
    role_code: z.string(),
    role_name_vn: z.string(),
    band: z.string(),
    title_vn: z.string().nullish(),
    years_experience: z.string().nullish(),
    user_context: z.string().nullish(),
    core_output: z.string().nullish(),
  }),
  context: z.object({
    scenario_archetype: z.string(),
    task: z.string().nullish(),
    situation: z.string().nullish(),
    stakes: z.string().nullish(),
    time_pressure: z.string().nullish(),
    estimated_minutes: z.number(),
    skills_hard: z.array(z.string()).default([]),
    skills_soft: z.array(z.string()).default([]),
  }),
  cast: z.array(
    z.object({
      npc_id: z.string(),
      role_in_scene: z.string(),
      pressure: z.string(),
      voice: z.string().nullish(),
    }),
  ),
  activities: z.array(ActivitySchema).min(1),
  random_events: z.array(RandomEventSchema).default([]),
  endings: z.array(EndingSchema).min(1),
  evidence_level: z.string().nullish(),
});

/* ── Bộ câu hỏi tự vấn ─────────────────────────────────────────────── */

export const QuizSchema = z.object({
  questions: z.array(
    z.object({
      question_id: z.string(),
      prompt: z.string(),
      options: z.array(
        z.object({
          option_id: z.string(),
          text: z.string(),
          signal: SignalSchema.default({}),
        }),
      ),
    }),
  ),
});

/* ── Gói dữ liệu ───────────────────────────────────────────────────── */

export const GameDataSchema = z.object({
  _meta: z.object({
    generated_at: z.string(),
    source_dataset: z.string(),
    group: z.string(),
    note: z.string().nullish(),
  }),
  fit_dimensions: FitDimensionsSchema,
  /** Cả 22 nghề, chỉ tên — gợi ý chuyển ngang hay trỏ ra ngoài nhóm chơi được. */
  all_roles: z.record(
    z.string(),
    z.object({
      name_vn: z.string(),
      group: z.string(),
      bands: z.string(),
    }),
  ),
  quiz: QuizSchema,
  roles: z.array(RoleSchema).min(1),
  shared_events: z.array(GameEventSchema).default([]),
  scenarios: z.record(z.string(), ScenarioSchema),
});

export type Anchor = z.infer<typeof AnchorSchema>;
export type SkillType = z.infer<typeof SkillTypeSchema>;
export type Signal = z.infer<typeof SignalSchema>;
export type SalaryBand = z.infer<typeof SalaryBandSchema>;
export type SimilarRole = z.infer<typeof SimilarRoleSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
export type Observe = z.infer<typeof ObserveSchema>;
export type RandomEvent = z.infer<typeof RandomEventSchema>;
export type Ending = z.infer<typeof EndingSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
