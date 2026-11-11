/**
 * Trạng thái của một ca làm và các thông điệp vào ra của engine.
 *
 * Mọi thứ ở đây là dữ liệu JSON thuần: không hàm, không Set/Map. Nhờ vậy
 * trạng thái lưu được, so được, và dựng lại được bằng cách fold chuỗi sự
 * kiện (CLAUDE.md: run là chuỗi sự kiện append-only).
 */
import type { Beat, Channel, CheckQuestion, Expression } from './schema.js';

/* ── Đầu vào ─────────────────────────────────────────────────────────── */

/** Việc người chơi làm. */
export type PlayerInput =
  | { type: 'START' }
  /** Mọi hành động trong danh sách: trò chuyện, mở tài liệu, viết, chạy thử, bấm nút… */
  | {
      type: 'ACTION';
      key: string;
      fields?: Record<string, string>;
      ticks?: string[];
    }
  | { type: 'SAY'; text: string }
  | { type: 'END_CONVERSATION' }
  | { type: 'CHOOSE'; option: string; elapsedMs?: number }
  | { type: 'TIMEOUT' }
  | {
      type: 'SAVE_ARTEFACT';
      artefact: string;
      fields: Record<string, string>;
      ticks?: string[];
    }
  | { type: 'CONFIRM_END' }
  | { type: 'CANCEL_END' }
  | { type: 'HINT' };

/** Nguồn gốc của một output model: lưu cùng sự kiện, không bao giờ tính lại. */
export interface Provenance {
  adapter: string;
  model?: string;
  promptVersion?: string;
  latencyMs?: number;
  costUsd?: number;
}

export type CheckAnswerValue = 'yes' | 'no' | 'unclear';

export interface CheckAnswer {
  flag: string;
  answer: CheckAnswerValue;
  /** Câu trích nguyên văn lời người chơi làm chứng cho "có". */
  quote?: string;
  extracted?: { time?: string; event?: string; channel?: Channel };
}

/** Kết quả AI quay về engine. */
export type AiInput =
  | {
      type: 'NARRATION';
      requestId: string;
      beats: Beat[];
      provenance?: Provenance;
    }
  | {
      type: 'CHECKS';
      requestId: string;
      answers: CheckAnswer[];
      provenance?: Provenance;
    };

export type ShiftInput = PlayerInput | AiInput;

/* ── Yêu cầu gửi AI ──────────────────────────────────────────────────── */

export type NarrateTask = 'reply' | 'bridge' | 'reaction' | 'probe';

/**
 * Hồ sơ đã lọc cho AI-4 (C2): chỉ điều slot đang nói biết, không có câu
 * kiểm, `observes` hay `signs`.
 */
export interface NarrateRequest {
  requestId: string;
  task: NarrateTask;
  slot: string;
  present: string[];
  channel: Channel;
  maxBeats: number;
  hook?: string;
  /** Hướng viết thêm do engine giao (ví dụ lý do hoãn duyệt). */
  guidance?: string;
  scene: { time: string; channel: Channel };
  company: { name: string; profile: string };
  profile: {
    name: string;
    relation: string;
    want: string;
    pressure: string;
    stance: string;
    expertise: number;
    disclosure_style: string;
    voice: string;
    beliefs: string[];
    concerns: string[];
  };
  knownFacts: Array<{ id: string; text: string }>;
  /** Dữ kiện slot được phép lộ ở lượt này: tối đa một (B2). */
  mayReveal: Array<{ id: string; text: string }>;
  /** Dữ kiện AI biết để giữ nhất quán, chỉ xác nhận khi người chơi tự nói ra. */
  confirmOnly: Array<{ id: string; text: string }>;
  limits: { not_allowed: string[]; need_approval: string[] };
  flags: string[];
  recent: Array<{ speaker: string; text: string }>;
  ambient?: string;
  playerText?: string;
}

export interface CheckRequest {
  requestId: string;
  questions: Array<
    CheckQuestion & { events?: Array<{ id: string; text: string }> }
  >;
  /** Chỉ phần vừa xong, chỉ lời người chơi (A12). */
  scope: string;
  source: string;
}

/* ── Đầu ra ──────────────────────────────────────────────────────────── */

export interface TranscriptLine {
  seq: number;
  /** Số điểm đã dùng lúc dòng hiện ra. */
  at: number;
  kind: 'npc' | 'scene' | 'player' | 'system';
  speaker: string;
  text: string;
  expression?: Expression;
  channel?: Channel;
  /** `conv:<id>`, `node:<id>`, `review:<id>`, `action:<key>`, `hint`. */
  context: string;
}

export type Effect =
  | { type: 'show'; lines: TranscriptLine[] }
  | { type: 'narrate'; request: NarrateRequest }
  | { type: 'check'; request: CheckRequest }
  | { type: 'await'; await: AwaitState };

/* ── Trạng thái ──────────────────────────────────────────────────────── */

/** Engine đang chờ gì từ người chơi. */
export type AwaitState =
  | { kind: 'start' }
  | { kind: 'phase' }
  | { kind: 'conversation'; conversation: string }
  | { kind: 'node_reply'; node: string }
  | { kind: 'node_choice'; node: string }
  | { kind: 'node_artefact'; node: string; artefact: string }
  | { kind: 'probe_answer'; node?: string; review?: string }
  | { kind: 'confirm_end'; node: string }
  | { kind: 'ai' }
  | { kind: 'ended' };

export interface Conversation {
  id: string;
  slots: string[];
  channel: Channel;
  openedAt: number;
  byNpc: boolean;
  turns: number;
}

export interface PromiseRecord {
  id: string;
  to: string;
  channel: Channel;
  /** Hứa theo giờ: mốc tính bằng điểm. */
  dueAt?: number;
  /** Hứa theo sự kiện. */
  event?: string;
  madeAt: number;
  status: 'open' | 'kept' | 'late' | 'carried';
  remindedAt?: number;
  label: string;
}

export interface SavedArtefact {
  fields: Record<string, string>;
  ticks: string[];
  /** Bị cắt ngang giữa chừng thì là nháp: chưa lưu, chưa chạy bộ phán (A1b). */
  status: 'draft' | 'saved';
  savedAt?: number;
  /** Cờ đã bật từ lần lưu này; sửa lại thì tính lại (A12). */
  flags: string[];
  /** Dòng kết quả (artefact `result`). */
  lines?: string[];
}

export interface NodeProgress {
  /** `skipped`: chưa tới vì hết thời gian, không xét (D2). */
  status: 'pending' | 'active' | 'done' | 'skipped';
  via?: 'start' | 'time' | 'player' | 'fallback';
  openedAt?: number;
  doneAt?: number;
  choice?: string;
  timedOut?: boolean;
  elapsedMs?: number;
  hookUsed?: string;
  approved?: boolean;
}

/** Một bước việc trong hàng đợi của engine. Toàn dữ liệu, không closure. */
export type Op =
  | { op: 'show'; beats: Beat[]; context: string; channel?: Channel }
  | { op: 'scene'; text: string; context: string }
  | {
      op: 'narrate';
      task: NarrateTask;
      slot: string;
      maxBeats: number;
      context: string;
      hook?: string;
      guidance?: string;
      /** Hiện thêm nhịp này sau phần AI viết (ví dụ `approval_line`). */
      after?: Beat[];
      /** Câu kiểm theo lượt vừa trả "có" cho cờ này thì chỉ 1 nhịp, rồi `approval_line` (A13). */
      approvalFlag?: string;
      channel?: Channel;
    }
  | {
      op: 'check';
      questions: CheckQuestion[];
      scope: string;
      source: string;
      channel?: Channel;
    }
  | { op: 'advance'; points: number; key?: string; resume?: boolean }
  | { op: 'due' }
  | {
      op: 'open_conversation';
      slots: string[];
      channel: Channel;
      byNpc: boolean;
    }
  | { op: 'close_conversation' }
  | { op: 'complete_action'; key: string }
  | {
      op: 'open_node';
      node: string;
      via: 'start' | 'time' | 'player' | 'fallback';
    }
  | { op: 'node'; node: string; step: NodeStep }
  | { op: 'await'; await: AwaitState }
  | { op: 'review'; index: number; picked: string[] }
  | { op: 'refresh' }
  | { op: 'end' };

export type NodeStep = 'lead' | 'probe' | 'checks' | 'closing' | 'finish';

export interface ShiftState {
  seedId: string;
  seedVersion: number;
  points: number;
  flags: string[];
  /** Dữ kiện người chơi đã biết, theo thứ tự mở (sổ tay, khối M). */
  facts: Array<{ id: string; at: number }>;
  /** Dữ kiện đổi theo đồng hồ (timeline). */
  factText: Record<string, string>;
  opened: string[];
  artefacts: Record<string, SavedArtefact>;
  conversation: Conversation | null;
  conversationCount: number;
  nodes: Record<string, NodeProgress>;
  activeNode: string | null;
  /** Đã qua nút kết: bỏ cảnh timeline, nhịp báo hết giờ; lời hứa treo chuyển sang "Nhìn lại ca". */
  shiftOver: boolean;
  timelineDone: number[];
  ambientUsed: string[];
  warned: boolean;
  promises: PromiseRecord[];
  events: Array<{ name: string; at: number }>;
  /** Liên lạc thẳng với từng slot (để xét giữ lời hứa). */
  contacts: Array<{ slot: string; at: number; channel: Channel }>;
  channelMessages: number[];
  transcript: TranscriptLine[];
  /** Nhật ký hành động có mã (bằng chứng cho judge). */
  actionLog: Array<{ at: number; key: string; points: number; cut?: boolean }>;
  /** Hành động dài đang dở vì bị chen ngang. */
  suspended: { key: string; remaining: number } | null;
  hints: Array<{ at: number; tier: 1 | 2; text: string }>;
  reviewAsked: string[];
  /** Kết quả câu kiểm theo lượt gần nhất. */
  realtime: Record<string, CheckAnswerValue>;
  agenda: Op[];
  await: AwaitState;
  pending: { requestId: string; kind: 'narrate' | 'check'; op: Op } | null;
  nextRequest: number;
  ended: boolean;
}
