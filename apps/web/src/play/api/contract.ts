/**
 * Cổng của màn chơi tới máy chủ: đúng các thao tác của nhóm Play trong
 * `reports/master/api/openapi.yaml` (E10 · E11 · E12, SD-01, SD-02, SD-08).
 *
 * Hai bản hiện thực:
 * - `mock`: chạy ngay trong trình duyệt, một kịch bản mẫu. Dùng để demo khi
 *   chưa có máy chủ. Mọi màn hình trong chế độ này ghi rõ "Dữ liệu mẫu".
 * - `http`: gọi `/api/v1` bằng Bearer token, nghe `/stream` bằng `fetch`.
 *
 * Chọn bản nào: xem `playApi.ts`.
 */
import type { Scenario } from '@datn/game-core';
import type {
  ActivityView,
  AnswerInput,
  AnswerResult,
  FlagContentInput,
  JobAccepted,
  PlayStreamEvent,
  Problem,
  Run,
  ScenarioSummary,
  StartRunInput,
  ViewHintResult,
} from './types';

/** `submitAnswer` và `finishRun` trả hai kiểu tuỳ mã HTTP; giữ cả mã để phân biệt. */
export type Accepted<T> =
  { status: 200 | 201; body: T } | { status: 202; body: JobAccepted };

export interface PlayApi {
  readonly mode: 'mock' | 'http';

  /** `POST /runs` — mở lượt mới hoặc trả lại lượt đang dở của cùng nhiệm vụ. */
  startRun(input: StartRunInput): Promise<Run>;
  /** `GET /runs/{runId}` */
  getRun(runId: string): Promise<Run>;
  /** `GET /runs/{runId}/activity` */
  getCurrentActivity(runId: string): Promise<ActivityView>;
  /** `POST /runs/{runId}/answers` — đóng: 200, tự luận: 202 rồi kết quả về `/stream`. */
  submitAnswer(
    runId: string,
    input: AnswerInput,
  ): Promise<Accepted<AnswerResult>>;
  /** `POST /runs/{runId}/hints` — chỉ ghi nhận, không hạ điểm (FR-13). */
  viewHint(runId: string, activityKey: string): Promise<ViewHintResult>;
  /** `POST /runs/{runId}/flags` */
  flagContent(runId: string, input: FlagContentInput): Promise<void>;
  /** `POST /runs/{runId}/finish` */
  finishRun(runId: string): Promise<Accepted<ScenarioSummary>>;
  /** `GET /runs/{runId}/summary` */
  getRunSummary(runId: string): Promise<ScenarioSummary>;
  /** `GET /stream` — trả về hàm đóng luồng. */
  openEventStream(onEvent: (event: PlayStreamEvent) => void): () => void;

  /**
   * Bản phát hành của kịch bản (tên, vai, NPC, kỹ năng đo) mà màn chơi bày
   * quanh hoạt động. Không phải endpoint: `Run.releaseVersion` là khoá của tệp
   * phát hành trên CDN (§5.3.1).
   */
  loadRelease(run: Run): Promise<Scenario>;
}

/** Lỗi theo RFC 9457 (`Problem`) mà máy chủ trả về. */
export class PlayApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly errors: NonNullable<Problem['errors']>;

  constructor(problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = 'PlayApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.errors = problem.errors ?? [];
  }
}

export const isPlayApiError = (err: unknown): err is PlayApiError =>
  err instanceof PlayApiError;
