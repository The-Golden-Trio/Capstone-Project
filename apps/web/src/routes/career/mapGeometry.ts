/**
 * Quần đảo của một nghề, sinh bằng mã.
 *
 * Cùng ý với hành tinh và huy hiệu: băm `role_code` ra một vùng biển cố định,
 * nên Back-end lần nào mở cũng đúng quần đảo ấy. Thuần hàm, không React,
 * không DOM — nên kiểm được bằng số.
 *
 * Bố cục theo kiểu tranh quần đảo: các đảo rải trên mặt nước theo hàng so le
 * chứ không xếp thẳng một hàng, mỗi đảo một dáng và một cỡ, quanh chúng có đá
 * nhỏ rơi vãi. Hệ toạ độ 0–1000 cho cả hai chiều, khớp tỉ lệ màn hình ngang.
 */
import { hashCode } from '../../domain/roleTheme';

/** Khung rộng hơn cao, vì màn hình là thế. */
export const MAP_W = 1600;
export const MAP_H = 900;

export const ZOOM_OVERVIEW = 1;
export const ZOOM_MIN = 0.7;
export const ZOOM_MAX = 3;

export interface MapPoint {
  x: number;
  y: number;
}

export interface Island extends MapPoint {
  band: string;
  /** Bán kính danh nghĩa; dáng thật méo mó quanh giá trị này. */
  radius: number;
  /** Bờ đảo, một đa giác kín. */
  outline: MapPoint[];
  /** Đá nhỏ rải quanh đảo. */
  rocks: Array<MapPoint & { r: number }>;
}

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Bờ đảo: vòng méo, mỗi đảo một dáng riêng. */
function shoreline(
  center: MapPoint,
  radius: number,
  rand: () => number,
): MapPoint[] {
  const sides = 13;
  // Mỗi đảo một "nhịp méo" riêng, nên không đảo nào giống đảo nào.
  const lobes = 2 + Math.floor(rand() * 3);
  const phase = rand() * Math.PI * 2;

  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2;
    const lobe = 1 + Math.sin(angle * lobes + phase) * 0.17;
    const jitter = 0.9 + rand() * 0.2;
    const r = radius * lobe * jitter;
    return {
      x: center.x + Math.cos(angle) * r,
      // dẹt nhẹ theo chiều dọc cho ra dáng nhìn chéo
      y: center.y + Math.sin(angle) * r * 0.78,
    };
  });
}

/** Đá nhỏ rơi vãi quanh đảo — thứ làm mặt nước đỡ trống. */
function scatterRocks(
  center: MapPoint,
  radius: number,
  rand: () => number,
): Array<MapPoint & { r: number }> {
  const count = 3 + Math.floor(rand() * 4);
  return Array.from({ length: count }, () => {
    const angle = rand() * Math.PI * 2;
    const distance = radius * (1.25 + rand() * 0.55);
    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance * 0.78,
      r: 5 + rand() * 9,
    };
  });
}

/**
 * Rải các đảo thành hàng so le.
 *
 * Xếp thẳng một hàng thì thành cái thang chứ không ra quần đảo; chia hai hàng
 * lệch nhau, mỗi đảo một cỡ, thì mắt đọc ra ngay đây là một vùng biển. Số cột
 * tính theo số chặng nên bảy chặng hay ba chặng đều vừa khung, không phải nén
 * lại cho đủ chỗ.
 */
export function islands(roleCode: string, bands: string[]): Island[] {
  if (bands.length === 0) return [];
  const rand = seeded(hashCode(roleCode));

  const columns = Math.ceil(bands.length / 2);
  const marginX = MAP_W * 0.12;
  const marginY = MAP_H * 0.2;
  // Đảo hàng dưới lệch sang phải 0.42 bước, nên nhịp cột phải tính cả phần
  // lệch đó — chia theo (columns - 1) thì hòn cuối của hàng dưới tràn ra ngoài
  // mép phải.
  const OFFSET = 0.42;
  const stepX =
    columns > 1 ? (MAP_W - marginX * 2) / (columns - 1 + OFFSET) : 0;

  // Bán kính chừa đủ khe giữa hai đảo cạnh nhau, kể cả khi chỉ có một cột.
  const base = columns > 1 ? Math.min(118, stepX * 0.3) : 118;

  return bands.map((band, index) => {
    const column = Math.floor(index / 2);
    const upper = index % 2 === 0;

    const center = {
      x: marginX + stepX * column + (upper ? 0 : stepX * OFFSET),
      y: upper
        ? marginY + rand() * MAP_H * 0.1
        : MAP_H - marginY - rand() * MAP_H * 0.1,
    };

    // Cỡ đảo chênh nhau cho quần đảo có nhịp, nhưng không đảo nào quá bé.
    const radius = base * (0.78 + rand() * 0.42);

    return {
      band,
      ...center,
      radius,
      outline: shoreline(center, radius, rand),
      rocks: scatterRocks(center, radius, rand),
    };
  });
}

/**
 * Đường hải trình nối các đảo theo thứ tự cấp bậc.
 *
 * Cong nhẹ chứ không thẳng: nét thẳng giữa hai đảo so le trông như cái compa,
 * còn nét cong thì ra dáng đường tàu chạy. Độ cong lật chiều theo từng chặng
 * nên cả chuỗi lượn sóng thay vì phình về một phía.
 */
export function seaRoutes(list: Island[]): string[] {
  const out: string[] = [];

  for (let i = 0; i < list.length - 1; i += 1) {
    const from = list[i];
    const to = list[i + 1];

    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    // Pháp tuyến của đoạn thẳng, lật chiều mỗi chặng.
    const bend = i % 2 === 0 ? 0.12 : -0.12;

    out.push(
      `M${from.x.toFixed(1)} ${from.y.toFixed(1)}` +
        `Q${(mx - dy * bend).toFixed(1)} ${(my + dx * bend).toFixed(1)}` +
        ` ${to.x.toFixed(1)} ${to.y.toFixed(1)}`,
    );
  }

  return out;
}

/* ══ Bản đồ giấy bên trong một đảo ══════════════════════════════════════ */

/** Các hình vẽ dùng làm ký hiệu địa điểm, theo lối bản đồ kho báu cổ. */
export type PaperSymbol =
  | 'gem'
  | 'mountain'
  | 'palm'
  | 'ship'
  | 'tower'
  | 'balloon';

/** Nhiệm vụ phụ lấy hình theo id, nên mỗi địa điểm luôn giữ đúng hình của nó. */
const SIDE_SYMBOLS: readonly PaperSymbol[] = [
  'mountain',
  'palm',
  'ship',
  'tower',
  'balloon',
];

export interface PaperPoint extends MapPoint {
  id: string;
  kind: 'main' | 'side';
  label: string;
  /** Tên ngắn in trên bản đồ; tên đầy đủ để dành cho hộp câu hỏi. */
  short: string;
  symbol: PaperSymbol;
}

/**
 * Tên ngắn để in cạnh ký hiệu.
 *
 * Nhan đề trong dữ liệu là cả một câu ("Designer gửi bản thiết kế không thể
 * hiện thực được") — in nguyên lên bản đồ thì chữ dài hơn cả hòn đảo. Cắt ở
 * ranh giới từ chứ không cắt giữa chừng rồi thêm dấu ba chấm: trên bản đồ,
 * "Designer gửi" đọc ra một địa danh, còn "Designer gửi bản thiế…" thì không.
 * Nhan đề đầy đủ vẫn còn nguyên trong hộp câu hỏi và trong nhãn trợ năng.
 */
export function shortLabel(text: string, max = 16): string {
  // Vế đầu trước dấu ngắt câu thường đã đủ nghĩa.
  const head = text.split(/[,:(—–]|\s-\s/)[0].trim();
  if (head.length <= max) return head;

  const words = head.split(/\s+/);
  let kept = [words[0]];
  for (const word of words.slice(1)) {
    if (`${kept.join(' ')} ${word}`.length > max) break;
    kept.push(word);
  }

  // Bỏ đuôi cụt. Phải cắt đâu đó thì mới vừa, nhưng cắt xong mà còn lại
  // "Bất đồng kỹ" hay "Nhận offer từ" thì đọc như câu bị đứt giữa chừng chứ
  // không ra một địa danh.
  const dangling = (word: string) =>
    TAIL_WORDS.has(word.toLowerCase()) || /^\d+$/.test(word);

  while (kept.length > 1 && dangling(kept[kept.length - 1])) {
    kept = kept.slice(0, -1);
  }

  return kept.join(' ').replace(/[.,;:]$/, '');
}

/**
 * Những tiếng không bao giờ được đứng cuối một tên ngắn.
 *
 * Gồm hư từ ("từ", "với", "của") và các tiếng chỉ sống trong từ ghép ("kỹ"
 * trong "kỹ thuật", "hiệu" trong "hiệu suất"). Đây là mẹo chứ không phải phân
 * tích tiếng Việt thật: nó không bắt hết mọi trường hợp, nhưng chỗ nào nó bỏ
 * sót thì tên vẫn đọc được, chỉ kém gọn. Gặp đuôi cụt mới, thêm vào đây.
 */
const TAIL_WORDS = new Set([
  'từ',
  'với',
  'và',
  'của',
  'cho',
  'về',
  'theo',
  'khi',
  'mà',
  'như',
  'vì',
  'do',
  'bởi',
  'là',
  'bị',
  'được',
  'có',
  'một',
  'các',
  'những',
  'sự',
  'việc',
  'cả',
  'trên',
  'trong',
  'vào',
  'đã',
  'sẽ',
  'đang',
  'rất',
  'hơn',
  'thứ',
  'cái',
  'chiếc',
  'bản',
  'kỹ',
  'hiệu',
  'công',
]);

/** Khung của tờ bản đồ giấy. */
export const PAPER_W = 1000;
export const PAPER_H = 640;

/** Bờ biển vẽ tay của hòn đảo trên giấy — nét mực méo mó, không đều. */
export function paperCoast(roleCode: string, band: string): MapPoint[] {
  const rand = seeded(hashCode(`${roleCode}:${band}:coast`));
  const sides = 22;
  const cx = PAPER_W / 2;
  const cy = PAPER_H / 2;
  const lobes = 3 + Math.floor(rand() * 3);
  const phase = rand() * Math.PI * 2;

  return Array.from({ length: sides }, (_, i) => {
    const angle = (i / sides) * Math.PI * 2;
    const lobe = 1 + Math.sin(angle * lobes + phase) * 0.2;
    const jitter = 0.94 + rand() * 0.12;
    return {
      x: cx + Math.cos(angle) * PAPER_W * 0.36 * lobe * jitter,
      y: cy + Math.sin(angle) * PAPER_H * 0.38 * lobe * jitter,
    };
  });
}

/**
 * Các địa điểm trên tờ giấy.
 *
 * Rải theo xoắn ốc vàng để không dính chụm — vòng tròn thì quá năm sáu điểm
 * là chúng chồng lên nhau. Nhiệm vụ chính nằm gần giữa vì nó là lý do tới đây.
 */
export function paperPoints(
  roleCode: string,
  band: string,
  main: { id: string; label: string } | null,
  sides: Array<{ id: string; label: string }>,
): PaperPoint[] {
  const rand = seeded(hashCode(`${roleCode}:${band}:points`));
  const cx = PAPER_W / 2;
  const cy = PAPER_H / 2;
  const out: PaperPoint[] = [];

  if (main) {
    out.push({
      ...main,
      kind: 'main',
      short: shortLabel(main.label),
      symbol: 'gem',
      x: cx,
      y: cy - 20,
    });
  }

  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const inner = 110;
  const outer = Math.min(PAPER_W, PAPER_H) * 0.40;

  sides.forEach((side, index) => {
    const t = sides.length > 1 ? index / (sides.length - 1) : 0;
    const distance = inner + (outer - inner) * Math.sqrt(t);
    const angle = index * GOLDEN + rand() * 0.2;
    out.push({
      ...side,
      kind: 'side',
      short: shortLabel(side.label),
      symbol: SIDE_SYMBOLS[hashCode(side.id) % SIDE_SYMBOLS.length],
      x: cx + Math.cos(angle) * distance * 1.25,
      y: cy + Math.sin(angle) * distance * 0.82,
    });
  });

  return out;
}

/**
 * Mép tờ giấy, rách nham nhở như bản đồ cũ.
 *
 * Đi vòng quanh chu vi và đẩy từng điểm ra vào một chút. Biên độ tính theo
 * cạnh ngắn nên mép trên và mép bên rách cùng một cỡ, không bên nào trông như
 * bị xé mạnh tay hơn.
 */
export function paperEdge(roleCode: string, band: string): MapPoint[] {
  const rand = seeded(hashCode(`${roleCode}:${band}:edge`));
  const perSide = 14;
  const depth = Math.min(PAPER_W, PAPER_H) * 0.022;

  const out: MapPoint[] = [];
  const push = (x: number, y: number, nx: number, ny: number) => {
    const bite = rand() * depth;
    out.push({ x: x + nx * bite, y: y + ny * bite });
  };

  for (let i = 0; i < perSide; i += 1) {
    push((i / perSide) * PAPER_W, 0, 0, 1);
  }
  for (let i = 0; i < perSide; i += 1) {
    push(PAPER_W, (i / perSide) * PAPER_H, -1, 0);
  }
  for (let i = perSide; i > 0; i -= 1) {
    push((i / perSide) * PAPER_W, PAPER_H, 0, -1);
  }
  for (let i = perSide; i > 0; i -= 1) {
    push(0, (i / perSide) * PAPER_H, 1, 0);
  }

  return out;
}

/** Nét địa hình vẽ tay: đồi, rừng, gò — rải trong lòng đảo giấy. */
export function paperTerrain(
  roleCode: string,
  band: string,
  count = 12,
): Array<MapPoint & { kind: 'hill' | 'tree' | 'dune'; size: number }> {
  const rand = seeded(hashCode(`${roleCode}:${band}:terrain`));
  const kinds: Array<'hill' | 'tree' | 'dune'> = ['hill', 'tree', 'dune'];

  return Array.from({ length: count }, () => {
    const angle = rand() * Math.PI * 2;
    const distance = rand() * Math.min(PAPER_W, PAPER_H) * 0.32;
    return {
      x: PAPER_W / 2 + Math.cos(angle) * distance * 1.3,
      y: PAPER_H / 2 + Math.sin(angle) * distance,
      kind: kinds[Math.floor(rand() * kinds.length)],
      size: 12 + rand() * 12,
    };
  });
}

/** Khung nhìn: dịch và phóng về một điểm. */
export function focusTransform(
  target: MapPoint | null,
  zoom: number,
): { scale: number; x: number; y: number } {
  const at = target ?? { x: MAP_W / 2, y: MAP_H / 2 };
  return {
    scale: zoom,
    x: MAP_W / 2 - at.x * zoom,
    y: MAP_H / 2 - at.y * zoom,
  };
}

export const clampZoom = (zoom: number): number =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Number(zoom.toFixed(3))));

/**
 * Chỗ đứng của một ký hiệu trên màn hình, tính bằng pixel của khung nhìn.
 *
 * Tờ bản đồ co giãn theo `preserveAspectRatio` nên toạ độ trong viewBox không
 * suy ra được vị trí thật; phải đo bằng hộp bao của chính ký hiệu đó.
 */
export interface Anchor {
  left: number;
  right: number;
  /** Giữa ký hiệu theo chiều dọc. */
  y: number;
}
