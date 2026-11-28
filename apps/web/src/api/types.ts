/**
 * Hợp đồng dữ liệu của explorer app, theo game design đã chốt (Hồ sơ JobQuest
 * cơ chế game khối A–G, Seed scenario, Luật dẫn truyện) và openapi.yaml.
 *
 * Phần nào backend đã có thì `live/` gọi thật; phần chưa có thì `demo/` trả
 * dữ liệu mẫu cùng hình dạng. Chỗ lệch openapi ghi ở
 * `docs/plans/2026-11-16_explorer-ui-data-contract.md` cho người làm API.
 */
import type { profile, shift } from '@datn/game-core';

export type SoftSkillId = profile.SoftSkillId;
export type RiasecAxis = profile.RiasecAxis;
export type LikeLevel = profile.LikeLevel;

/* ── Tài khoản ─────────────────────────────────────────────────────── */

export type Role =
  'EXPLORER' | 'DOMAIN_EXPERT' | 'CONTENT_ADMIN' | 'SYSTEM_ADMIN';

/** openapi `Me` (+ username, dateOfBirth, stage theo khối A). */
export interface Me {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string;
  roles: Role[];
  hasGoogle: boolean;
  quizDone: boolean;
  dateOfBirth: string | null;
  /** Giai đoạn đang ở (khối A). */
  stage: LifeStage | null;
}

export type LifeStage = 'hoc_sinh' | 'sinh_vien' | 'moi_di_lam' | 'chuyen_nghe';

export interface Session {
  accessToken: string;
  refreshToken: string;
  user?: Me;
}

export interface RegisterInput {
  email: string;
  password: string;
  displayName: string;
  dateOfBirth?: string;
}

/* ── Danh mục nghề, bản đồ ngân hà ─────────────────────────────────── */

export type RegionId =
  'ky_thuat' | 'suc_khoe' | 'kinh_doanh' | 'cong_nghe' | 'sang_tao' | 'dich_vu';

export interface Region {
  id: RegionId;
  name: string;
  /** Câu thẻ cụm 3 của Get to know me. */
  card: string;
}

export interface OccupationGroup {
  /** Tên nhóm nghề (23 nhóm), cũng là khoá. */
  name: string;
  regionId: RegionId;
}

export type PlayStatus = 'NEW' | 'PLAYING' | 'COMPLETED';

export interface CatalogueOccupation {
  code: string;
  /** Tên đầy đủ. */
  name: string;
  /** Tên ngắn trên bản đồ (bỏ phần sau "/"). */
  shortName: string;
  group: string;
  regionId: RegionId;
  isIt: boolean;
  /** Mã sở thích O*NET, ví dụ "CIA". Chỉ dùng nội bộ, không hiện cho người chơi. */
  interestCode: string | null;
  summary: string;
  levelCount: number;
  /** Có màn chơi đã xuất bản không. Nghề chưa có vẫn hiện hồ sơ. */
  playable: boolean;
  /** D-121: nghề cấp cao, chuyển ngang cần xong nghề đi trước. */
  gate:
    | { kind: 'OPEN' }
    | {
        kind: 'PREREQUISITE';
        band: string;
        roles: Array<{ code: string; name: string }>;
      };
  my: {
    status: PlayStatus;
    currentLevel: number | null;
    highestCompleted: number | null;
  };
}

export interface Catalogue {
  regions: Region[];
  groups: OccupationGroup[];
  occupations: CatalogueOccupation[];
}

/* ── Hồ sơ nghề ────────────────────────────────────────────────────── */

export type LevelAccess = 'OPEN' | 'LOCKED' | 'ENROLLED' | 'COMPLETED';

export interface KeywordRef {
  id: string;
  name: string;
  /** 1 Làm quen · 2 Thành thạo · 3 Chuyên sâu. */
  level: 1 | 2 | 3;
}

export interface LevelSummary {
  levelNo: number;
  band: string;
  /** Band để so với nghề khác (G). */
  bandEquivalent: string;
  title: string;
  years: string;
  coreOutput: string | null;
  tasks: string[];
  /** Hai nhóm trọng tâm của cấp. */
  focus: SoftSkillId[];
  /** Bậc soft skill cần để vào cấp (60% quỹ các cấp trước). */
  requirement: Partial<Record<SoftSkillId, number>>;
  entryKeywords: KeywordRef[];
  outputKeywords: KeywordRef[];
  access: LevelAccess;
  /** Lý do khoá, bằng lời cho người chơi. */
  lockedReason: string | null;
  enrolmentId: string | null;
  /** Số màn chính đã xuất bản ở cấp này. */
  questCount: number;
}

export interface PayInfo {
  /** "Lương theo ITviec", "Lương rao trên tin tuyển dụng"… */
  basisLabel: string;
  low: number | null;
  median: number | null;
  high: number | null;
  byYears: Array<{ years: string; median: number }>;
  source: string;
  dataYear: string;
  note: string | null;
  publicSector: {
    label: string;
    low: number;
    high: number;
    source: string;
  } | null;
}

export interface RatingSummary {
  responseCount: number;
  /** Ẩn khi quần thể quá nhỏ (NFR-06). */
  withheld: boolean;
  /** Trung bình 1–5 của từng tiêu chí, theo `code` tiêu chí. */
  averages: Record<string, number>;
}

export interface OccupationProfile {
  code: string;
  name: string;
  nameEn: string | null;
  group: string;
  regionId: RegionId;
  isIt: boolean;
  summary: string;
  fitSummary: string | null;
  /** Mặt không hay của nghề (BR-07): luôn hiện, không giấu. */
  downsides: string[];
  workFacts: string[];
  settings: string[];
  /** `weight` là phần trăm 0–100 (dữ liệu nghề ghi tỷ trọng theo %). */
  environments: Array<{ name: string; weight: number }>;
  education: {
    preparation: string | null;
    note: string | null;
    university: string[];
    vocational: string[];
    licence: string | null;
  };
  levels: LevelSummary[];
  path: Array<{
    stage: string;
    label: string;
    roles: Array<{ code: string; name: string }>;
  }>;
  similar: Array<{ code: string; name: string; why: string }>;
  pay: PayInfo | null;
  outlook: { level: string; openPostings: number; source: string } | null;
  keywords: KeywordRef[];
  /** Nghề cần nhóm nào hơn mức thường gặp (z O*NET); chỉ để sắp, không hiện số. */
  softEmphasis: Array<{ id: SoftSkillId; z: number }>;
  ratings: RatingSummary;
  gate: CatalogueOccupation['gate'];
  playable: boolean;
  attribution: string[];
}

/* ── Vào cấp, bản đồ đảo ───────────────────────────────────────────── */

export interface Company {
  name: string;
  kind: string;
  blurb: string;
}

export interface QuestCard {
  taskId: string;
  title: string;
  situation: string;
  goal: string;
  minutes: number;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE';
  runId: string | null;
  bestScore: number | null;
}

export interface SideQuestCard {
  id: string;
  title: string;
  prompt: string;
  done: boolean;
}

export interface OnboardSlide {
  title: string;
  /** Khung 4C (Bauer 2010) của slide. */
  frame: string;
  lines: string[];
}

export interface IslandMap {
  enrolmentId: string;
  occupationCode: string;
  occupationName: string;
  regionId: RegionId;
  level: LevelSummary;
  company: Company;
  onboard: {
    slides: OnboardSlide[];
    hrOpen: string;
    hrClose: string;
    seen: boolean;
  };
  mainQuests: QuestCard[];
  sideQuests: SideQuestCard[];
  /** Màn chính đã xong trên tổng. */
  progress: { done: number; total: number };
}

/* ── Chơi một ca (shift-runs) ──────────────────────────────────────── */

export type SceneView = shift.SceneView & {
  paused?: boolean;
  pendingTurnId?: string | null;
};
export type TranscriptLine = shift.TranscriptLine;

export interface ShiftRun {
  runId: string;
  taskId: string;
  title: string;
  goal: string;
  role: string;
  scene: string | null;
  cast: Array<{ slot: string; name: string; relation: string }>;
  glossary: Array<{ term: string; plain: string }>;
  paused: boolean;
  ended: boolean;
  occupationCode: string | null;
  levelNo: number | null;
  enrolmentId: string | null;
}

export type TurnInput =
  | {
      kind: 'action';
      key: string;
      fields?: Record<string, string>;
      ticks?: string[];
    }
  | { kind: 'say'; text: string }
  | { kind: 'end_conversation' }
  | { kind: 'choose'; option: string; elapsedMs?: number }
  | { kind: 'timeout' }
  | {
      kind: 'save_artefact';
      artefact: string;
      fields: Record<string, string>;
      ticks?: string[];
    }
  | { kind: 'confirm_end' }
  | { kind: 'cancel_end' }
  | { kind: 'hint' };

export interface TurnResult {
  turnId: string;
  lines: TranscriptLine[];
  /** Có khi lượt xong ngay; khi AI còn chạy thì `pending`. */
  scene: SceneView | null;
  pending: boolean;
}

/** Câu "thích tới đâu" sau scenario (khối B): 2–3 việc có gắn trục. */
export interface ReflectionPrompt {
  key: string;
  /** Một dòng nhắc lại việc đã làm. */
  recap: string;
}

export interface SoftSkillDelta {
  id: SoftSkillId;
  delta: number;
  /** Phần cộng từ chòm sao, đã gồm trong `delta`. */
  zodiacBonus: number;
  pointsAfter: number;
  tierBefore: number;
  tierAfter: number;
}

export interface RunSummary {
  runId: string;
  title: string;
  occupationCode: string | null;
  occupationName: string | null;
  levelNo: number | null;
  enrolmentId: string | null;
  story: shift.ShiftSummary;
  reflection: { prompts: ReflectionPrompt[]; answered: boolean };
  /** `null` khi chưa chấm (AI-5 chạy ở worker) hoặc chưa có luật chấm. */
  grade: {
    status: 'PENDING' | 'READY' | 'NOT_AVAILABLE';
    score: number | null;
    ending: {
      type: 'GOOD' | 'PARTIAL' | 'BAD' | 'SECRET';
      title: string;
      text: string;
    } | null;
    /** FR-07: ba phần riêng. */
    feedback: { result: string; comment: string; improve: string } | null;
    softSkills: SoftSkillDelta[];
    keywordsGained: KeywordRef[];
    /**
     * Chấm theo checklist của AI-5 (luồng ca làm): mức 0–2 từng mục con và cờ.
     * Chưa có điểm số vì chưa có trần nhóm của từng màn. Chỉ có ở live.
     */
    checklist?: ChecklistGrade;
  };
}

export interface ChecklistGrade {
  subs: Array<{
    sub: string;
    name: string;
    group: number;
    /** Trung bình các đoạn, 0–2; `null` khi mọi đoạn không xét. */
    level: number | null;
  }>;
  flags: Array<{ code: string; name: string; group: number; quote: string }>;
}

/* ── Get to know me ────────────────────────────────────────────────── */

export interface QuizCard {
  id: string;
  cluster: 1 | 2 | 3;
  text: string;
  /** Trục RIASEC (cụm 1, 2) hoặc vùng (cụm 3). Không hiện cho người chơi. */
  axis?: RiasecAxis;
  regionId?: RegionId;
}

export interface GoalQuestion {
  id: string;
  question: string;
  /** Nhãn ngắn trên thẻ "Mục tiêu của bạn". */
  label: string;
  options: string[];
}

export interface QuizForm {
  cards: QuizCard[];
  interests: string[];
  goals: GoalQuestion[];
}

export interface QuizAnswers {
  cards: Record<string, LikeLevel>;
  interests: string[];
  goals: Record<string, { picked: string[]; note: string }>;
}

export interface CareerSuggestion {
  code: string;
  name: string;
  group: string;
  regionId: RegionId;
  /** Một dòng lý do (khối E); không phần trăm, không "phù hợp". */
  reason: string;
  playable: boolean;
}

export interface QuizResult {
  /** Vạch "tự kể", 1–3 trên mỗi trục. */
  selfReported: Record<RiasecAxis, number>;
  flat: boolean;
  /** Hai ba vùng nên thử trước. */
  regions: RegionId[];
  goals: QuizAnswers['goals'];
  interests: string[];
  suggestions: CareerSuggestion[];
}

/* ── Hồ sơ người chơi ──────────────────────────────────────────────── */

export interface SoftSkillState {
  id: SoftSkillId;
  points: number;
  /** Bậc cao nhất từng đạt (bậc không tụt). */
  reachedTier: number;
  /** Số scenario đã chấm nhóm này. */
  scenarios: number;
  history: Array<{
    runId: string;
    title: string;
    path: string;
    date: string;
    delta: number;
    zodiacBonus: number;
    total: number;
  }>;
}

export interface PlayingRow {
  occupationCode: string;
  occupationName: string;
  group: string;
  regionId: RegionId;
  levelNo: number;
  levelTitle: string;
  enrolmentId: string;
  done: number;
  total: number;
  nextLevel: {
    levelNo: number;
    conditions: Array<{ label: string; met: boolean }>;
  } | null;
  lastPlayedAt: string;
}

export interface EarnedKeyword extends KeywordRef {
  group: string;
  regionId: RegionId;
}

export interface Achievement {
  code: string;
  name: string;
  description: string;
  kind: 'kham_pha' | 'thanh_thao' | 'tien_bo' | 'tu_soi' | 'kien_tri';
  earnedAt: string | null;
  pinned: boolean;
}

export interface JournalEntry {
  runId: string;
  date: string;
  path: string;
  index: number;
  title: string;
  score: number | null;
  deltas: Array<{ id: SoftSkillId; delta: number }>;
}

export interface PlayerRecord {
  softSkills: SoftSkillState[];
  riasec: {
    self: Record<RiasecAxis, number> | null;
    afterTrying: Record<RiasecAxis, { mean: number | null; count: number }>;
  };
  goals: QuizAnswers['goals'] | null;
  interests: string[];
  playing: PlayingRow[];
  keywords: EarnedKeyword[];
  stats: {
    scenarios: number;
    minutes: number;
    occupationsTried: number;
    occupationsTotal: number;
    groupsVisited: number;
    minutesByRegion: Partial<Record<RegionId, number>>;
    favouriteTasks: Array<{ text: string; likes: number }>;
  };
  achievements: Achievement[];
  journal: JournalEntry[];
}

/* ── Đánh giá nghề, góp ý ──────────────────────────────────────────── */

export interface RatingCriterion {
  code: string;
  name: string;
  /** Nhãn hai đầu thang 1–5. */
  low: string;
  high: string;
}

export interface RatingForm {
  occupationCode: string;
  occupationName: string;
  locked: boolean;
  lockedReason: string | null;
  criteria: RatingCriterion[];
  mine: Record<string, number> | null;
  summary: RatingSummary;
}

export interface AppFeedbackInput {
  category: 'bug' | 'idea' | 'content' | 'other';
  message: string;
  page?: string;
}
