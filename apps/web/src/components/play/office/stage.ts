/**
 * Đạo diễn cảnh: ai đứng đâu, đi đâu, và người chơi phải gặp ai ở từng bước.
 *
 * Kịch bản (`@datn/game-core`) nói *chuyện gì xảy ra* — câu hỏi, lời thoại,
 * cách chấm. Tệp này nói *nó diễn ra ở đâu trong văn phòng*: Hà từ bàn QA đi
 * sang, An trong phòng họp bước ra pantry rồi về bàn. Engine chấm điểm không
 * biết gì về những chuyện này; cảnh chỉ là một cách bày ra, thay cho khung
 * chat.
 *
 * Mỗi kịch bản có sân khấu riêng, tra theo `scenarioKey`. Kịch bản chưa dựng
 * sân khấu thì vẫn chơi bằng giao diện chat như cũ.
 */
import type { Facing, Tile } from './world';

export type NpcId = 'an' | 'ha';

/** Điểm đến của một NPC, kèm các mốc phải đi qua để không xuyên bàn. */
export interface Placement {
  at: Tile;
  facing: Facing;
  via?: Tile[];
}

/** Điểm tương tác không phải người: bàn máy, cửa… */
export interface Spot {
  at: Tile;
  /** Hiện khi người chơi đứng cạnh: "Ngồi vào máy". */
  prompt: string;
}

export type Trigger =
  /** Lại gần NPC và bấm E. NPC phải đã tới nơi. */
  | { kind: 'talk'; npc: NpcId }
  /** Lại gần một điểm và bấm E. */
  | { kind: 'use'; spot: string }
  /**
   * Chỉ cần đi tới một điểm: một NPC sẽ tự đi tới chỗ người chơi, và tới nơi
   * thì bắt chuyện. Dùng cho cảnh "Hà ghé bàn" — người chơi không đi tìm Hà,
   * Hà tìm người chơi.
   */
  | {
      kind: 'reach';
      spot: string;
      then: { npc: NpcId; to: Placement; objective: string };
    };

export interface Step {
  /** Việc phải làm, hiện ở góc màn hình. */
  objective: string;
  /** NPC nào đổi chỗ khi bước này bắt đầu. NPC không nhắc tới thì đứng yên. */
  moves: Partial<Record<NpcId, Placement>>;
  trigger: Trigger;
}

export interface Stage {
  map: readonly string[];
  spawn: Tile;
  spawnFacing: Facing;
  /** Chỗ đứng ban đầu của từng NPC. */
  cast: Record<NpcId, Placement>;
  spots: Record<string, Spot>;
  /** Nhãn khu vực vẽ lên sàn. */
  labels: Array<{ text: string; at: Tile }>;
  /** Một bước cho mỗi `activity_id` của kịch bản. */
  steps: Record<string, Step>;
  /** Sự kiện xen ngang do ai nói (tra theo `event_id`); không có thì là dẫn truyện. */
  eventSpeaker: Record<string, NpcId>;
}

/* ── SWE_BACKEND_L1: ngày đầu, năm bug ưu tiên thấp ───────────────── */

/**
 * Văn phòng 22×14 ô. Ký tự thường đi được, ký tự hoa là vật cản.
 *
 *   , thảm phòng họp   G kính   d cửa kính   W bảng trắng
 *   T S bàn (màn hình / bàn phím)   M bàn họp   c ghế
 *   P cây   K quầy pantry   B kệ sách   e cửa ra vào
 */
const L1_MAP = [
  '##WWW#################',
  '#,,,,,,,,G....K.K...P#',
  '#,,,,,,,,G...........#',
  '#,,MMM,,,G...........#',
  '#,,MMM,,,G....TS..TS.#',
  '#,,,,,,,,G....cc..cc.#',
  '#GGGGdGGGG...........#',
  '#....................#',
  '#..TS..TS.....TS..TS.#',
  '#..cc..cc.....cc..cc.#',
  '#....................#',
  '#..TS..TS.....B.....P#',
  '#..cc..cc............#',
  '#########ee###########',
] as const;

const t = (col: number, row: number): Tile => ({ col, row });

/** Các mốc quen thuộc, đặt tên để lộ trình đọc được như chỉ đường. */
const HALLWAY_ROW = 7;
const MEETING_DOOR = t(5, 6);
const MEETING_SEAT = t(6, 4);
const PANTRY = t(15, 2);
const HA_SEAT = t(19, 5);
const AN_SEAT = t(8, 12);
/** Cạnh ghế người chơi, chỗ Hà đứng khi ghé bàn. */
const BESIDE_PLAYER = t(5, 12);

const L1_STAGE: Stage = {
  map: L1_MAP,
  spawn: t(9, 12),
  spawnFacing: 'up',

  cast: {
    an: { at: MEETING_SEAT, facing: 'left' },
    ha: { at: HA_SEAT, facing: 'up' },
  },

  spots: {
    'my-desk': { at: { col: 3.5, row: 12 }, prompt: 'Ngồi vào máy' },
  },

  labels: [
    { text: 'PHÒNG HỌP', at: t(1, 2) },
    { text: 'PANTRY', at: t(17, 2) },
    { text: 'QA', at: t(16, 4) },
    { text: 'BÀN CỦA BẠN', at: t(1, 10) },
  ],

  steps: {
    // Hà ghé bàn giao năm bug — người chơi chỉ cần về chỗ ngồi.
    a1: {
      objective: 'Đi tới bàn làm việc của bạn — góc dưới bên trái.',
      moves: {},
      trigger: {
        kind: 'reach',
        spot: 'my-desk',
        then: {
          npc: 'ha',
          to: {
            via: [t(19, HALLWAY_ROW), t(5, HALLWAY_ROW)],
            at: BESIDE_PLAYER,
            facing: 'left',
          },
          objective: 'Hà đang đi tới chỗ bạn…',
        },
      },
    },

    // Tự ngồi sửa bug /profile. Hà về lại bàn QA.
    a2: {
      objective: 'Ngồi vào máy và mở ticket /profile.',
      moves: {
        ha: { via: [t(5, HALLWAY_ROW), t(19, HALLWAY_ROW)], at: HA_SEAT, facing: 'up' },
      },
      trigger: { kind: 'use', spot: 'my-desk' },
    },

    // An ra khỏi phòng họp 5 phút, đứng ở pantry.
    a3: {
      objective: 'An vừa ra khỏi phòng họp, đang ở pantry — tới gặp anh ấy.',
      moves: {
        an: {
          via: [t(6, 5), t(5, 5), MEETING_DOOR, t(5, HALLWAY_ROW), t(12, HALLWAY_ROW), t(12, 2)],
          at: PANTRY,
          facing: 'up',
        },
      },
      trigger: { kind: 'talk', npc: 'an' },
    },

    // An ghé lại phòng họp lấy đồ rồi về bàn — họp xong.
    a4: {
      objective: 'An đã xong họp và đang về bàn — qua báo cáo với anh ấy.',
      moves: {
        an: {
          via: [
            t(12, 2),
            t(12, HALLWAY_ROW),
            t(5, HALLWAY_ROW),
            MEETING_DOOR,
            t(5, 5),
            t(6, 5),
            t(5, 5),
            MEETING_DOOR,
            t(5, HALLWAY_ROW),
            t(9, HALLWAY_ROW),
            t(9, 12),
          ],
          at: AN_SEAT,
          facing: 'up',
        },
      },
      trigger: { kind: 'talk', npc: 'an' },
    },
  },

  eventSpeaker: {
    re_ha_them_bug: 'ha',
  },
};

/** Sân khấu theo kịch bản. Không có nghĩa là kịch bản đó chơi bằng khung chat. */
export const OFFICE_STAGES: Record<string, Stage> = {
  SWE_BACKEND_L1_S_EXEC: L1_STAGE,
};

export const stageFor = (scenarioKey: string): Stage | undefined =>
  OFFICE_STAGES[scenarioKey];
