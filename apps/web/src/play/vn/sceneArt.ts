/**
 * Tranh của cảnh visual novel (D-05: cảnh kiểu visual novel).
 *
 * Bản demo: tranh cắt từ bảng thiết kế nhân vật, nằm ở `public/vn/`. Theo
 * thiết kế, ảnh NPC đến từ `ActivityView.npc.avatarUrl` và bản phát hành của
 * kịch bản; khi có hai nguồn đó, bảng tra dưới đây thay bằng dữ liệu thật.
 */

export type Expression =
  | 'neutral'
  | 'smile'
  | 'laugh'
  | 'surprised'
  | 'skeptical'
  | 'worried'
  | 'angry'
  | 'tired';

export interface CharacterArt {
  /** Dáng đứng, nền trong suốt, cắt ngang hông ở mép dưới. */
  standing: string;
  /** Chân dung theo biểu cảm, hiện trong khung hội thoại. */
  faces: Partial<Record<Expression, string>>;
}

export interface SceneArt {
  /** Nền của từng hoạt động; hoạt động không có thì dùng `defaultBackground`. */
  backgrounds: Record<string, string>;
  defaultBackground: string;
  characters: Record<string, CharacterArt>;
}

const BASE = '/vn';
const BG_OFFICE = `${BASE}/bg-office.webp`;
const BG_MEETING = `${BASE}/bg-meeting.webp`;

const EXPRESSIONS: Expression[] = [
  'neutral',
  'smile',
  'laugh',
  'surprised',
  'skeptical',
  'worried',
  'angry',
  'tired',
];

const character = (key: string): CharacterArt => ({
  standing: `${BASE}/${key}-standing.webp`,
  faces: Object.fromEntries(
    EXPRESSIONS.map((e) => [e, `${BASE}/${key}-face-${e}.webp`]),
  ),
});

const BY_SCENARIO: Record<string, SceneArt> = {
  SWE_BACKEND_L1_S_EXEC: {
    // a4: An vừa họp xong, bạn báo cáo trong phòng họp.
    backgrounds: { a4: BG_MEETING },
    defaultBackground: BG_OFFICE,
    // Mới có tranh của Hà (QA). An chưa có tranh: chỉ hiện tên trong khung thoại.
    characters: { ha: character('ha') },
  },
};

const FALLBACK: SceneArt = {
  backgrounds: {},
  defaultBackground: BG_OFFICE,
  characters: {},
};

export const sceneArtFor = (scenarioKey: string): SceneArt =>
  BY_SCENARIO[scenarioKey] ?? FALLBACK;

/** Mọi ảnh của một cảnh, để tải trước khi người chơi tới. */
export const allImages = (art: SceneArt): string[] => [
  art.defaultBackground,
  ...Object.values(art.backgrounds),
  ...Object.values(art.characters).flatMap((c) => [
    c.standing,
    ...Object.values(c.faces),
  ]),
];
