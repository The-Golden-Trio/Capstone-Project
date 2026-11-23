/**
 * Asset theme "Cartoon viền đen" (concept art số 5 của nhóm): sáu nhân vật,
 * năm bối cảnh. Seed chưa ghi tranh cho từng vai (CA sẽ chọn ở bước dựng
 * bản nháp), nên tạm gán theo xưng hô và quan hệ trong seed, mỗi vai một
 * tranh riêng trong cùng ca, ổn định giữa các lần mở.
 */
import { hashString } from '@datn/ui';
import analyst from '../assets/toon/char-analyst.webp';
import architect from '../assets/toon/char-architect.webp';
import designer from '../assets/toon/char-designer.webp';
import engineer from '../assets/toon/char-engineer.webp';
import lead from '../assets/toon/char-lead.webp';
import relations from '../assets/toon/char-relations.webp';
import bgCafe from '../assets/toon/bg-cafe.webp';
import bgHome from '../assets/toon/bg-home.webp';
import bgMeeting from '../assets/toon/bg-meeting.webp';
import bgOffice from '../assets/toon/bg-office.webp';
import bgStreet from '../assets/toon/bg-street.webp';

export type ToonCharacterId =
  'lead' | 'designer' | 'engineer' | 'relations' | 'architect' | 'analyst';

export interface ToonCharacter {
  id: ToonCharacterId;
  src: string;
  /** Màu bảng tên, lấy từ trang phục trong tranh. */
  color: string;
  /** Bong bóng thoại cùng tông, nhạt hơn. */
  bubble: 'paper' | 'sky' | 'mint' | 'rose' | 'mustard';
  /** Tranh quay mặt sang trái hay phải (để đặt nhân vật nhìn vào giữa). */
  facing: 'left' | 'right';
}

export const TOON_CHARACTERS: Record<ToonCharacterId, ToonCharacter> = {
  lead: {
    id: 'lead',
    src: lead,
    color: '#b9c58f',
    bubble: 'mint',
    facing: 'left',
  },
  designer: {
    id: 'designer',
    src: designer,
    color: '#eea7b4',
    bubble: 'rose',
    facing: 'right',
  },
  engineer: {
    id: 'engineer',
    src: engineer,
    color: '#a6d2ea',
    bubble: 'sky',
    facing: 'right',
  },
  relations: {
    id: 'relations',
    src: relations,
    color: '#a8dbb9',
    bubble: 'mint',
    facing: 'right',
  },
  architect: {
    id: 'architect',
    src: architect,
    color: '#f0b63c',
    bubble: 'mustard',
    facing: 'right',
  },
  analyst: {
    id: 'analyst',
    src: analyst,
    color: '#f6b496',
    bubble: 'rose',
    facing: 'right',
  },
};

const MALE = /^(anh|ông|chú|bác|thầy|cậu)\s/i;
const FEMALE = /^(chị|cô|bà|dì|thím|mợ)\s/i;
const OLDER = /^(ông|bà|bác|chú|cô|thầy|dì)\s/i;
const LEAD = /(mentor|trưởng|cấp trên|quản lý|lead|sếp|giám đốc)/i;
const CLIENT = /(khách|đối tác|nhà cung cấp)/i;

/** Thứ tự ưu tiên tranh cho một vai, từ hợp nhất tới dự phòng. */
function preferences(name: string, relation: string): ToonCharacterId[] {
  const male = MALE.test(name);
  const female = FEMALE.test(name);
  const older = OLDER.test(name);
  if (male) {
    if (older) return ['architect', 'lead', 'engineer'];
    if (LEAD.test(relation)) return ['lead', 'engineer', 'architect'];
    return ['engineer', 'lead', 'architect'];
  }
  if (female) {
    if (older || CLIENT.test(relation))
      return ['relations', 'analyst', 'designer'];
    if (LEAD.test(relation)) return ['relations', 'analyst', 'designer'];
    return ['analyst', 'designer', 'relations'];
  }
  // Không rõ xưng hô (tên công ty, khách): rải đều theo tên cho ổn định.
  const all = Object.keys(TOON_CHARACTERS) as ToonCharacterId[];
  const start = hashString(name) % all.length;
  return [...all.slice(start), ...all.slice(0, start)];
}

/**
 * Tranh theo biểu cảm: `char-<id>-<biểu cảm>.webp` cùng khung với tranh gốc
 * (840×1120, nền trong). Thả file vào `assets/toon/` là dùng được, không phải
 * sửa mã; biểu cảm chưa có tranh thì dùng tranh gốc của nhân vật.
 */
const EXPRESSION_ART = import.meta.glob<string>(
  '../assets/toon/char-*-*.webp',
  {
    eager: true,
    import: 'default',
  },
);

export function pickCharacterArt(
  art: Readonly<Record<string, string>>,
  character: Pick<ToonCharacter, 'id' | 'src'>,
  expression?: string | null,
): string {
  if (!expression) return character.src;
  return (
    art[`../assets/toon/char-${character.id}-${expression}.webp`] ??
    character.src
  );
}

export const characterArt = (
  character: Pick<ToonCharacter, 'id' | 'src'>,
  expression?: string | null,
) => pickCharacterArt(EXPRESSION_ART, character, expression);

/** Gán tranh cho cả dàn nhân vật một ca, không trùng nếu còn tranh. */
export function castCharacters(
  cast: Array<{ slot: string; name: string; relation: string }>,
): Map<string, ToonCharacter> {
  const used = new Set<ToonCharacterId>();
  const out = new Map<string, ToonCharacter>();
  for (const c of cast) {
    const pref = preferences(c.name.trim(), c.relation);
    const pick =
      pref.find((id) => !used.has(id)) ??
      (Object.keys(TOON_CHARACTERS) as ToonCharacterId[]).find(
        (id) => !used.has(id),
      ) ??
      pref[0];
    used.add(pick);
    out.set(c.slot, TOON_CHARACTERS[pick]);
  }
  return out;
}

export const TOON_BACKDROPS = {
  office: bgOffice,
  meeting: bgMeeting,
  home: bgHome,
  cafe: bgCafe,
  street: bgStreet,
} as const;
export type ToonBackdropId = keyof typeof TOON_BACKDROPS;

/** Bối cảnh theo kênh: gặp mặt, họp nhóm thì vào phòng họp, còn lại ở bàn làm việc. */
export function backdropFor(
  channel: 'chat' | 'call' | 'meet' | 'group' | null | undefined,
): ToonBackdropId {
  return channel === 'meet' || channel === 'group' ? 'meeting' : 'office';
}
