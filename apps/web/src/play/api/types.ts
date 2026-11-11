/**
 * Kiểu của luồng chơi, lấy thẳng từ hợp đồng API (`openapi.d.ts`).
 *
 * Màn chơi chỉ nói chuyện với máy chủ qua những kiểu này, nên đổi từ bản giả
 * (`mock/`) sang máy chủ thật không phải sửa màn hình nào.
 */
import type { components } from './openapi';

type Schemas = components['schemas'];

export type Run = Schemas['Run'];
export type StartRunInput = Schemas['StartRunInput'];
export type ActivityView = Schemas['ActivityView'];
export type ActivityItem = NonNullable<ActivityView['items']>[number];
export type TaskType = Schemas['TaskType'];
export type AnswerInput = Schemas['AnswerInput'];
export type AnswerResult = Schemas['AnswerResult'];
export type JobAccepted = Schemas['JobAccepted'];
export type ViewHintResult = Schemas['ViewHintResult'];
export type FlagContentInput = Schemas['FlagContentInput'];
export type ScenarioSummary = Schemas['ScenarioSummary'];
export type Score = Schemas['Score'];
export type Problem = Schemas['Problem'];
export type StreamEventType = Schemas['StreamEvent']['type'];

/**
 * Phần `payload` của các sự kiện người chơi nhận trên `/stream`.
 *
 * Hợp đồng để `payload` là object tự do (chỉ có ví dụ `followupNo`,
 * `question`). Các field dưới đây dùng lại đúng tên của `AnswerResult` và
 * `ActivityView`; đây là cách bản giả đọc hợp đồng và cần được chốt cùng
 * phía máy chủ khi làm SD-01.
 */
export interface StreamPayloads {
  'answer.graded': {
    answerId: string;
    activityKey: string;
    followupNo: number;
    score: Score;
    /** Câu tự luận có dấu hiệu phản tác dụng (D-116): bị trừ thêm. */
    counterproductive: boolean;
  };
  'followup.asked': {
    activityKey: string;
    followupNo: number;
    npcKey: string;
    name: string;
    question: string;
  };
  'activity.closed': {
    activityKey: string;
    closingLine: string;
    nextActivityKey: string | null;
  };
  'provider.delay': {
    /** Việc đang chờ: chấm câu trả lời hay soạn nhận xét cuối màn. */
    waitingFor: 'grading' | 'summary';
  };
  'summary.ready': Record<string, never>;
}

export type PlayStreamEvent = {
  [K in keyof StreamPayloads]: {
    type: K;
    runId: string;
    jobId?: string;
    payload: StreamPayloads[K];
  };
}[keyof StreamPayloads];
