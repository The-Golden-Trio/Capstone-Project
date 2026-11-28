/**
 * Cổng dữ liệu của explorer app. Màn hình chỉ gọi qua interface này (qua
 * hook ở `hooks.ts`), không gọi fetch trực tiếp. Hai bản cài đặt:
 *
 * - `live/`: gọi API thật cho phần backend đã có;
 * - `demo/`: dữ liệu mẫu trong trình duyệt cho phần backend chưa có, và cho
 *   chế độ xem thử không cần máy chủ (engine ca làm thật của game-core, AI
 *   giả). Chỉ bật ở dev hoặc khi `VITE_API_MODE=demo`.
 *
 * Mỗi nhóm hàm là một "dịch vụ" để `index.ts` chọn live hay demo riêng.
 */
import type {
  AppFeedbackInput,
  Catalogue,
  IslandMap,
  LikeLevel,
  Me,
  OccupationProfile,
  PlayerRecord,
  QuizAnswers,
  QuizForm,
  QuizResult,
  RatingForm,
  RegisterInput,
  RunSummary,
  SceneView,
  Session,
  ShiftRun,
  TranscriptLine,
  TurnInput,
  TurnResult,
} from './types';

export interface AuthService {
  register(input: RegisterInput): Promise<Session>;
  signIn(identifier: string, password: string): Promise<Session>;
  signInWithGoogle(credential: string): Promise<Session>;
  refresh(refreshToken: string): Promise<Session>;
  signOut(refreshToken: string | null): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  confirmPasswordReset(token: string, newPassword: string): Promise<void>;
}

export interface AccountService {
  me(): Promise<Me>;
  updateMe(patch: { displayName?: string; stage?: Me['stage'] }): Promise<Me>;
  changePassword(
    currentPassword: string | undefined,
    newPassword: string,
  ): Promise<void>;
  deleteAccount(): Promise<void>;
}

export interface CatalogueService {
  catalogue(): Promise<Catalogue>;
  occupation(code: string): Promise<OccupationProfile>;
}

export interface QuizService {
  form(): Promise<QuizForm>;
  submit(answers: QuizAnswers): Promise<QuizResult>;
  /** `null` khi chưa làm. */
  current(): Promise<QuizResult | null>;
  /** Rút đồng ý và xoá phần "kể về bạn" (Luật 91/2025 Điều 24 khoản 3). */
  deleteAboutMe(): Promise<void>;
}

export interface ProgressService {
  enrol(occupationCode: string, levelNo: number): Promise<IslandMap>;
  island(enrolmentId: string): Promise<IslandMap>;
  markOnboardSeen(enrolmentId: string): Promise<void>;
  record(): Promise<PlayerRecord>;
  updateGoals(goals: QuizAnswers['goals']): Promise<void>;
  pinAchievements(codes: string[]): Promise<void>;
}

export interface PlayService {
  /** Mở lượt (hoặc trả lượt đang dở của cùng nhiệm vụ). */
  start(taskId: string, enrolmentId: string | null): Promise<ShiftRun>;
  run(runId: string): Promise<ShiftRun>;
  scene(runId: string): Promise<SceneView>;
  transcript(runId: string, after?: number): Promise<TranscriptLine[]>;
  turn(runId: string, input: TurnInput, turnId?: string): Promise<TurnResult>;
  resume(runId: string): Promise<void>;
  addNote(runId: string, text: string): Promise<void>;
  notes(runId: string): Promise<Array<{ text: string; at: string }>>;
  flag(runId: string, activityKey: string, reason: string): Promise<void>;
  /**
   * Đăng ký nhận tin của lượt (SSE `/stream` ở live). Trả hàm huỷ.
   * Tin `lines` có dòng thoại mới; `done` có cảnh sau lượt.
   */
  subscribe(runId: string, onEvent: (event: PlayEvent) => void): () => void;
  reflect(
    runId: string,
    answers: Record<string, LikeLevel>,
    realism: number | null,
  ): Promise<void>;
  summary(runId: string): Promise<RunSummary>;
}

export type PlayEvent =
  | { type: 'lines'; turnId: string; lines: TranscriptLine[] }
  | { type: 'done'; turnId: string; scene: SceneView; ended: boolean }
  | { type: 'delay'; turnId: string; waitingFor: 'narration' | 'checks' }
  | { type: 'paused'; turnId: string; reason: string };

export function createTurnId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface FeedbackService {
  ratingForm(occupationCode: string): Promise<RatingForm>;
  rate(
    occupationCode: string,
    scores: Record<string, number>,
    comment?: string,
  ): Promise<void>;
  sendAppFeedback(input: AppFeedbackInput): Promise<void>;
}

export interface ExplorerApi {
  auth: AuthService;
  account: AccountService;
  catalogue: CatalogueService;
  quiz: QuizService;
  progress: ProgressService;
  play: PlayService;
  feedback: FeedbackService;
}

/** Lỗi theo RFC 9457 (`Problem` của API), dùng chung cho live và demo. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
