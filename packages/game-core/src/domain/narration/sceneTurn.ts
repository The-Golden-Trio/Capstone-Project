/**
 * Đầu vào một lượt AI-4 theo nhịp: thứ engine gửi, đã lọc xong.
 *
 * Luật dẫn truyện C1: AI-4 nhận việc (task), cảnh hiện tại, hồ sơ nhân vật
 * đang nói đã lọc theo C2 (chỉ điều nhân vật đó biết), cờ truyện đã bật, 8 lượt
 * gần nhất, ambient chưa dùng và câu người chơi. Mọi việc chọn lọc (dữ kiện
 * nào slot biết, khúc mắc nào còn giấu, hook nào, `adapt` nào) là của engine
 * (phần B); kiểu dữ liệu này chỉ chở kết quả.
 */
import type { NarrationTask } from './beats.js';
import type { WorkCard } from './npcCard.js';

/** Người nói trong diễn biến: slot NPC, lời cảnh, hoặc người chơi. */
export const PLAYER_SPEAKER = 'nguoi_choi';

/** Luật dẫn truyện C1: gửi 8 lượt gần nhất. */
export const RECENT_TURNS_MAX = 8;

export interface SceneLine {
  /** `npc_id` của slot, `canh`, hoặc `nguoi_choi`. */
  speaker: string;
  text: string;
  /** Biểu cảm của nhịp, nếu có (lời soạn sẵn của seed luôn có). */
  expression?: string;
}

export interface SceneTurn {
  task: NarrationTask;
  /** Nhân vật engine giao lượt này; với probe là `by` của hook. */
  lead: string;

  /** Phần cố định của màn (seed B1, A2): ai cũng thấy như nhau, đặt trước điểm cache. */
  stage: {
    title?: string;
    situation?: string;
    goal?: string;
    /** Chỉ nhân vật được giao mới nói, khi hợp. */
    stakes?: string;
    /** Giới hạn riêng của màn: chỉ AI-4 đọc, để NPC chặn đúng trong vai. */
    limits?: string;
  };
  /** Hồ sơ công ty đang được random (seed G): không phải dữ liệu cá nhân. */
  company?: string;
  /**
   * Thẻ các nhân vật có mặt, dựng theo Hồ sơ NPC mục 6.1. Giữ một thứ tự cố
   * định suốt cảnh để prompt cache trúng; người được giao ghi ở `lead`.
   */
  cards: readonly WorkCard[];

  /** Cảnh hiện tại. Người có mặt = người chơi cùng các slot có thẻ. */
  scene: { time: string; place: string; channel?: string };
  storyFlags: readonly string[];
  /** Các lượt gần nhất, cũ trước mới sau. Quá `RECENT_TURNS_MAX` thì chỉ gửi phần cuối. */
  recent: readonly SceneLine[];
  /** Câu người chơi vừa gõ hay việc vừa khai. Bridge có thể không có. */
  playerLine?: string;
  /** Ambient engine giao cho lượt này (A10): AI-4 chỉ được chèn đúng những câu này. */
  ambient?: readonly string[];

  /** Probe: vì sao nhân vật hỏi, tính trong truyện (A7). */
  hook?: string;
  /** Reaction: phương án người chơi chọn, nguyên chữ. */
  choice?: string;
  /** Reaction: lời đáp seed viết sẵn cho phương án đó (A6), AI-4 viết lại cho khớp lượt chơi. */
  seedReaction?: readonly SceneLine[];
  /** Bridge: chuyện sắp diễn ra, theo lõi của nút kế. */
  bridgeTo?: string;

  /** Engine cho hỏi ở lượt này không (mặc định có). Probe luôn hỏi. */
  questionAllowed?: boolean;
  /** Tối đa bao nhiêu nhịp (mặc định `BEATS_MAX`). Ví dụ 1 nhịp trước `approval_line` (A13). */
  maxBeats?: number;

  /** Chữ AI-4 không được nói ra (R3): rubric, observes, signs, khúc mắc chưa tới, dữ kiện slot không biết. */
  hidden: readonly string[];
}

/** Phần diễn biến gửi đi: 8 lượt cuối. */
export const recentLines = (turn: SceneTurn): readonly SceneLine[] =>
  turn.recent.slice(-RECENT_TURNS_MAX);

/**
 * Mọi chữ của lượt này mà AI-4 được thấy: nguồn của R1 và phần trừ ra ở R3.
 * Phải đúng với những gì bộ ghép prompt gửi đi; test của bộ ghép kiểm điều đó.
 */
export function sceneTurnTexts(turn: SceneTurn): string[] {
  return [
    ...Object.values(turn.stage).filter(
      (t): t is string => typeof t === 'string',
    ),
    turn.company ?? '',
    ...turn.cards.map((c) => c.text),
    turn.scene.time,
    turn.scene.place,
    turn.scene.channel ?? '',
    ...turn.storyFlags,
    ...recentLines(turn).map((l) => l.text),
    turn.playerLine ?? '',
    ...(turn.ambient ?? []),
    turn.hook ?? '',
    turn.choice ?? '',
    ...(turn.seedReaction ?? []).map((l) => l.text),
    turn.bridgeTo ?? '',
  ].filter((t) => t.trim().length > 0);
}
