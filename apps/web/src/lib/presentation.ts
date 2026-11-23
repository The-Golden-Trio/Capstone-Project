/**
 * Trình bày riêng của từng seed: seed chưa có trường ảnh, nên bối cảnh và
 * ảnh bot theo ca nằm ở đây, khoá bằng mã seed. Seed không có trong bảng dùng
 * bối cảnh theo kênh như cũ (`backdropFor`).
 */
import botDeploy from '../assets/toon/bot-deploy.webp';
import botGiamSat from '../assets/toon/bot-giam-sat.webp';
import bgCsDesk from '../assets/toon/bg-cs-desk.webp';
import bgDeskAlert from '../assets/toon/bg-desk-alert.webp';
import bgDeskNoon from '../assets/toon/bg-desk-noon.webp';
import { TOON_BACKDROPS, backdropFor } from './toon';

type Channel = 'chat' | 'call' | 'meet' | 'group';

interface SeedPresentation {
  /** Từ cảnh mở đầu tới khi người chơi làm việc đầu tiên. */
  opening: string;
  /** Khi đang trò chuyện với người này qua kênh này. */
  support: { slot: string; channel: Channel; src: string };
  /** Từ khi dòng cảnh này hiện ra tới hết ca. */
  late: { startsWith: string; src: string };
}

const PRESENTATIONS: Record<string, SeedPresentation> = {
  'SWE_BACKEND.L3.m2': {
    opening: bgDeskAlert,
    support: { slot: 'support', channel: 'call', src: bgCsDesk },
    late: {
      startsWith: 'Đồng hồ góc màn hình nhảy sang 11:30',
      src: bgDeskNoon,
    },
  },
};

export interface BackdropInput {
  seedId: string;
  channel: Channel | null | undefined;
  /** Ai đang nói với người chơi: cuộc trò chuyện, hoặc người của nút tình huống đang mở (ví dụ cuộc gọi chị Linh). */
  talking?: { channel: Channel; slots: readonly string[] };
  /** Các dòng đã hiện cho người chơi. */
  lines: ReadonlyArray<{ context: string; text: string }>;
}

/** Bối cảnh của khung hiện tại. Dòng cảnh "11:30" thắng cuộc gọi chị Linh vì nó kéo tới hết ca. */
export function sceneBackdrop({
  seedId,
  channel,
  talking,
  lines,
}: BackdropInput): string {
  const base = TOON_BACKDROPS[backdropFor(channel ?? null)];
  const presentation = PRESENTATIONS[seedId];
  if (!presentation) return base;
  if (lines.some((line) => line.text.startsWith(presentation.late.startsWith)))
    return presentation.late.src;
  if (
    talking?.channel === presentation.support.channel &&
    talking.slots.includes(presentation.support.slot)
  )
    return presentation.support.src;
  if (!lines.some((line) => line.context.startsWith('action:')))
    return presentation.opening;
  return base;
}

/** Ảnh riêng của một số bot; bot khác giữ biểu tượng chung. */
const BOT_ART: Record<string, string> = {
  bot_deploy: botDeploy,
  bot_giam_sat: botGiamSat,
};

export const botArt = (id: string): string | undefined => BOT_ART[id];
