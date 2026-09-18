/**
 * Hình học của quần đảo và tờ bản đồ giấy.
 *
 * Thuần hàm nên kiểm được bằng số, không cần dựng SVG. Những điều dễ vỡ nhất:
 *   • cùng một nghề luôn ra cùng một quần đảo — người chơi nhớ đường;
 *   • các đảo KHÔNG chồng lên nhau và không tràn ra ngoài khung, với mọi số
 *     chặng, vì đây đúng là lỗi đã từng có;
 *   • các địa điểm trên giấy phải thưa, không dính chụm.
 */
import { describe, expect, it } from 'vitest';
import {
  MAP_H,
  MAP_W,
  PAPER_H,
  PAPER_W,
  ZOOM_MAX,
  ZOOM_MIN,
  clampZoom,
  focusTransform,
  islands,
  paperCoast,
  paperEdge,
  paperPoints,
  paperTerrain,
  seaRoutes,
  shortLabel,
  type Island,
} from './mapGeometry';

const BANDS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
const CODES = ['SWE_BACKEND', 'SWE_FRONTEND', 'SWE_EM', 'SWE_GAME', 'SWE_UIUX'];
const SIZES = [1, 2, 3, 4, 5, 6, 7];

const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

describe('quần đảo', () => {
  it('cùng nghề thì lần nào cũng ra đúng quần đảo ấy', () => {
    expect(islands('SWE_BACKEND', BANDS)).toEqual(islands('SWE_BACKEND', BANDS));
  });

  it('nghề khác thì quần đảo khác', () => {
    expect(islands('SWE_BACKEND', BANDS).map((i) => i.y)).not.toEqual(
      islands('SWE_FRONTEND', BANDS).map((i) => i.y),
    );
  });

  it('đủ số đảo và đúng thứ tự', () => {
    expect(islands('SWE_BACKEND', BANDS).map((i) => i.band)).toEqual(BANDS);
  });

  it('CÁC ĐẢO KHÔNG CHỒNG NHAU, với mọi số chặng', () => {
    // Lỗi đã từng có: đảo to hơn khoảng cách giữa chúng nên dính thành một dải.
    for (const code of CODES) {
      for (const size of SIZES) {
        const list = islands(code, BANDS.slice(0, size));
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const gap =
              distance(list[i], list[j]) - (list[i].radius + list[j].radius);
            expect(
              gap,
              `${code} (${size} chặng): ${list[i].band} và ${list[j].band} chồng nhau`,
            ).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('KHÔNG ĐẢO NÀO TRÀN RA NGOÀI KHUNG', () => {
    // "Đừng nén quá" — đảo phải nằm trọn trong khung ở mọi số chặng.
    for (const code of CODES) {
      for (const size of SIZES) {
        for (const island of islands(code, BANDS.slice(0, size))) {
          expect(island.x - island.radius).toBeGreaterThanOrEqual(0);
          expect(island.x + island.radius).toBeLessThanOrEqual(MAP_W);
          expect(island.y - island.radius).toBeGreaterThanOrEqual(0);
          expect(island.y + island.radius).toBeLessThanOrEqual(MAP_H);
        }
      }
    }
  });

  it('đảo không bị bóp nhỏ khi có nhiều chặng', () => {
    const few = islands('SWE_BACKEND', BANDS.slice(0, 3))[0];
    const many = islands('SWE_BACKEND', BANDS)[0];
    // Bảy chặng vẫn phải ra đảo đủ to để bấm được, không teo lại thành chấm.
    expect(many.radius).toBeGreaterThan(40);
    expect(few.radius).toBeGreaterThan(40);
  });

  it('mỗi đảo một dáng riêng, không phải hình tròn', () => {
    const island: Island = islands('SWE_BACKEND', BANDS)[0];
    const radii = island.outline.map((p) => distance(p, island));
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(5);
  });

  it('quanh đảo có đá rải, và đá nằm ngoài bờ', () => {
    const island = islands('SWE_BACKEND', BANDS)[0];
    expect(island.rocks.length).toBeGreaterThan(0);
    for (const rock of island.rocks) {
      expect(distance(rock, island)).toBeGreaterThan(island.radius);
    }
  });

  it('nghề không có chặng nào thì trả mảng rỗng', () => {
    expect(islands('SWE_BACKEND', [])).toEqual([]);
  });
});

describe('bản đồ giấy', () => {
  const sides = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ id: `s${i}`, label: `Phụ ${i}` }));

  it('bờ biển vẽ tay là một vòng kín, méo mó', () => {
    const coast = paperCoast('SWE_BACKEND', 'L1');
    expect(coast.length).toBeGreaterThan(12);
    const centre = { x: PAPER_W / 2, y: PAPER_H / 2 };
    const radii = coast.map((p) => distance(p, centre));
    expect(Math.max(...radii) - Math.min(...radii)).toBeGreaterThan(10);
  });

  it('CÁC ĐỊA ĐIỂM KHÔNG DÍNH CHỤM', () => {
    const points = paperPoints(
      'SWE_BACKEND',
      'L1',
      { id: 'm', label: 'Chính' },
      sides(11),
    );
    expect(points).toHaveLength(12);

    let closest = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        closest = Math.min(closest, distance(points[i], points[j]));
      }
    }
    expect(closest).toBeGreaterThan(55);
  });

  it('địa điểm nằm trong tờ giấy', () => {
    for (const point of paperPoints('SWE_BACKEND', 'L1', null, sides(11))) {
      expect(point.x).toBeGreaterThan(0);
      expect(point.x).toBeLessThan(PAPER_W);
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(PAPER_H);
    }
  });

  it('cùng đảo thì địa điểm và địa hình nằm cố định', () => {
    expect(paperPoints('SWE_BACKEND', 'L1', null, sides(4))).toEqual(
      paperPoints('SWE_BACKEND', 'L1', null, sides(4)),
    );
    expect(paperTerrain('SWE_BACKEND', 'L1')).toEqual(
      paperTerrain('SWE_BACKEND', 'L1'),
    );
  });

  it('hai đảo khác nhau thì bản đồ giấy khác nhau', () => {
    expect(paperCoast('SWE_BACKEND', 'L1')).not.toEqual(
      paperCoast('SWE_BACKEND', 'L3'),
    );
  });
});

describe('phóng và thu', () => {
  it('không có đích thì lấy tâm khung', () => {
    expect(focusTransform(null, 1)).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('phóng vào thì đảo đó về giữa khung', () => {
    const island = islands('SWE_BACKEND', BANDS)[3];
    const view = focusTransform(island, 2.4);
    expect(island.x * view.scale + view.x).toBeCloseTo(MAP_W / 2);
    expect(island.y * view.scale + view.y).toBeCloseTo(MAP_H / 2);
  });

  it('mức phóng bị chặn hai đầu', () => {
    expect(clampZoom(99)).toBe(ZOOM_MAX);
    expect(clampZoom(0.01)).toBe(ZOOM_MIN);
  });
});

describe('hải trình nối các đảo', () => {
  it('nối đủ mọi chặng kề nhau', () => {
    for (const size of SIZES) {
      const list = islands('SWE_BACKEND', BANDS.slice(0, size));
      expect(seaRoutes(list)).toHaveLength(Math.max(0, size - 1));
    }
  });

  it('mỗi nét bắt đầu đúng ở tâm đảo trước', () => {
    const list = islands('SWE_FRONTEND', BANDS.slice(0, 5));
    const paths = seaRoutes(list);

    paths.forEach((d, i) => {
      const [x, y] = d.slice(1).split('Q')[0].split(' ').map(Number);
      expect(x).toBeCloseTo(list[i].x, 1);
      expect(y).toBeCloseTo(list[i].y, 1);
    });
  });

  it('không có nét nào khi chỉ có một đảo', () => {
    expect(seaRoutes(islands('SWE_EM', ['L1']))).toEqual([]);
  });
});

describe('mép giấy rách', () => {
  it('rách vào trong, không lấn ra ngoài khung', () => {
    for (const code of CODES) {
      for (const point of paperEdge(code, 'L1')) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(PAPER_W);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(PAPER_H);
      }
    }
  });

  it('thật sự nham nhở chứ không phải hình chữ nhật', () => {
    const top = paperEdge('SWE_BACKEND', 'L1').slice(0, 14);
    expect(new Set(top.map((p) => p.y.toFixed(3))).size).toBeGreaterThan(8);
  });

  it('cùng một đảo thì mép giấy không đổi', () => {
    expect(paperEdge('SWE_BACKEND', 'L2')).toEqual(
      paperEdge('SWE_BACKEND', 'L2'),
    );
  });
});

describe('tên ngắn in trên bản đồ', () => {
  it('giữ nguyên nhan đề vốn đã ngắn', () => {
    expect(shortLabel('Deadline dí')).toBe('Deadline dí');
  });

  it('không bao giờ dài quá mức cho phép', () => {
    const titles = [
      'Designer gửi bản thiết kế không thể hiện thực được',
      'Trang chạy chậm nhưng không rõ vì đâu',
      'Cùng một nút bấm, mỗi trang một kiểu',
      'Bất đồng kỹ thuật với người có kinh nghiệm hơn',
    ];
    for (const title of titles) {
      expect(shortLabel(title).length).toBeLessThanOrEqual(16);
    }
  });

  it('cắt ở ranh giới từ, không cắt giữa chữ', () => {
    const short = shortLabel('Trang chạy chậm nhưng không rõ vì đâu');
    expect(short).toBe('Trang chạy chậm');
    // phần cắt ra phải là các từ trọn vẹn của nhan đề gốc
    for (const word of short.split(' ')) {
      expect('Trang chạy chậm nhưng không rõ vì đâu'.split(' ')).toContain(word);
    }
  });

  it('lấy vế đầu khi nhan đề có dấu ngắt', () => {
    expect(shortLabel('Cùng một nút bấm, mỗi trang một kiểu')).toBe(
      'Cùng một nút bấm',
    );
  });

  it('không để lại đuôi cụt', () => {
    expect(shortLabel('Nhận offer từ công ty khác')).toBe('Nhận offer');
    expect(shortLabel('Bất đồng kỹ thuật với người có kinh nghiệm hơn')).toBe(
      'Bất đồng',
    );
    expect(shortLabel('Truy vấn chạy 30 giây trên dữ liệu thật')).toBe(
      'Truy vấn chạy',
    );
  });

  it('luôn còn ít nhất một từ, kể cả khi từ đó đã quá dài', () => {
    expect(shortLabel('Containerisation')).not.toBe('');
    expect(shortLabel('của của của của của của')).not.toBe('');
  });
});

describe('ký hiệu địa điểm', () => {
  it('nhiệm vụ chính là viên ngọc, nhiệm vụ phụ thì mỗi nơi một dáng', () => {
    const list = paperPoints(
      'SWE_BACKEND',
      'L1',
      { id: 'scenario:a', label: 'Sự cố đơn hàng giờ cao điểm' },
      Array.from({ length: 5 }, (_, i) => ({
        id: `event:e${i}`,
        label: `Tình huống số ${i}`,
      })),
    );

    expect(list[0].symbol).toBe('gem');
    expect(list.slice(1).every((p) => p.symbol !== 'gem')).toBe(true);
  });

  it('một địa điểm luôn giữ đúng hình của nó', () => {
    const build = () =>
      paperPoints('SWE_EM', 'L2', null, [
        { id: 'event:x', label: 'Một tình huống' },
      ]);
    expect(build()[0].symbol).toBe(build()[0].symbol);
  });

  it('mọi địa điểm đều có tên ngắn để in ra', () => {
    const list = paperPoints(
      'SWE_UIUX',
      'L1',
      { id: 'scenario:a', label: 'Một nhan đề rất dài dòng và nhiều chữ' },
      [{ id: 'event:b', label: 'Một nhan đề khác cũng dài không kém' }],
    );
    for (const point of list) {
      expect(point.short.length).toBeLessThanOrEqual(16);
      expect(point.short.length).toBeGreaterThan(0);
    }
  });
});
