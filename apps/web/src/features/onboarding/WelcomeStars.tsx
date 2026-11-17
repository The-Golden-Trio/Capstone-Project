import type { ZodiacId } from '@datn/ui';

// Giữ tọa độ và đường nối của bộ Zodiac hiện có; chỉ vẽ lại nét/màu.
const signs: Record<
  ZodiacId,
  { label: string; symbol: string; points: number[][]; lines: number[][] }
> = {
  bach_duong: {
    label: 'Bạch Dương',
    symbol: '♈︎',
    points: [
      [20, 62],
      [45, 44],
      [70, 38],
      [80, 52],
    ],
    lines: [[0, 1, 2, 3]],
  },
  kim_nguu: {
    label: 'Kim Ngưu',
    symbol: '♉︎',
    points: [
      [12, 22],
      [42, 48],
      [62, 68],
      [68, 44],
      [87, 20],
      [31, 75],
    ],
    lines: [
      [0, 1, 2, 3, 4],
      [1, 5],
    ],
  },
  song_tu: {
    label: 'Song Tử',
    symbol: '♊︎',
    points: [
      [28, 18],
      [67, 17],
      [32, 39],
      [63, 40],
      [25, 65],
      [70, 67],
      [15, 83],
      [48, 80],
      [83, 84],
    ],
    lines: [
      [0, 2, 4, 6],
      [1, 3, 5, 8],
      [2, 3],
      [4, 7],
    ],
  },
  cu_giai: {
    label: 'Cự Giải',
    symbol: '♋︎',
    points: [
      [52, 16],
      [49, 43],
      [25, 67],
      [77, 70],
      [54, 85],
    ],
    lines: [
      [0, 1, 2],
      [1, 3, 4],
    ],
  },
  su_tu: {
    label: 'Sư Tử',
    symbol: '♌︎',
    points: [
      [76, 17],
      [59, 25],
      [55, 44],
      [72, 57],
      [83, 39],
      [26, 61],
      [13, 81],
      [62, 78],
    ],
    lines: [
      [0, 1, 2, 3, 4],
      [2, 5, 6, 7, 3],
    ],
  },
  xu_nu: {
    label: 'Xử Nữ',
    symbol: '♍︎',
    points: [
      [16, 28],
      [36, 45],
      [53, 38],
      [72, 21],
      [88, 34],
      [54, 61],
      [77, 79],
      [34, 78],
      [15, 67],
    ],
    lines: [
      [0, 1, 2, 3, 4],
      [2, 5, 6],
      [5, 7, 8],
    ],
  },
  thien_binh: {
    label: 'Thiên Bình',
    symbol: '♎︎',
    points: [
      [49, 19],
      [22, 47],
      [76, 44],
      [67, 78],
      [35, 81],
    ],
    lines: [
      [0, 1, 2, 0],
      [1, 4],
      [2, 3],
    ],
  },
  bo_cap: {
    label: 'Bọ Cạp',
    symbol: '♏︎',
    points: [
      [18, 15],
      [30, 30],
      [23, 48],
      [40, 58],
      [48, 79],
      [66, 87],
      [82, 72],
      [77, 58],
    ],
    lines: [[0, 1, 2, 3, 4, 5, 6, 7]],
  },
  nhan_ma: {
    label: 'Nhân Mã',
    symbol: '♐︎',
    points: [
      [16, 56],
      [34, 31],
      [60, 38],
      [74, 56],
      [56, 72],
      [32, 71],
      [85, 25],
      [84, 78],
    ],
    lines: [
      [0, 1, 2, 3, 4, 5, 0],
      [2, 6],
      [3, 7],
      [1, 5],
    ],
  },
  ma_ket: {
    label: 'Ma Kết',
    symbol: '♑︎',
    points: [
      [15, 28],
      [37, 39],
      [84, 27],
      [76, 63],
      [52, 83],
      [26, 60],
    ],
    lines: [
      [0, 1, 2, 3, 4, 5, 0],
      [1, 5],
    ],
  },
  bao_binh: {
    label: 'Bảo Bình',
    symbol: '♒︎',
    points: [
      [14, 24],
      [32, 42],
      [50, 30],
      [68, 44],
      [85, 34],
      [20, 63],
      [40, 77],
      [59, 64],
      [80, 79],
    ],
    lines: [
      [0, 1, 2, 3, 4],
      [1, 5, 6, 7, 8],
    ],
  },
  song_ngu: {
    label: 'Song Ngư',
    symbol: '♓︎',
    points: [
      [15, 20],
      [34, 24],
      [28, 40],
      [13, 37],
      [52, 68],
      [73, 48],
      [87, 52],
      [83, 70],
      [69, 67],
    ],
    lines: [
      [0, 1, 2, 3, 0],
      [2, 4, 5],
      [5, 6, 7, 8, 5],
    ],
  },
};

export function WelcomeStars({ sign }: { sign: ZodiacId }) {
  const data = signs[sign];
  return (
    <svg
      role="img"
      aria-label={`Chòm sao ${data.label}`}
      viewBox="0 0 100 100"
      className="mx-auto size-40 max-w-full sm:size-64"
    >
      {data.lines.map((points, i) => (
        <polyline
          key={i}
          points={points.map((n) => data.points[n].join(',')).join(' ')}
          fill="none"
          stroke="var(--color-toon-star)"
          strokeWidth="1.7"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {data.points.map(([x, y], i) => (
        <path
          key={i}
          d="m0 -4 1.2 2.8L4 0 1.2 1.2 0 4 -1.2 1.2 -4 0 -1.2 -1.2Z"
          transform={`translate(${x} ${y}) rotate(${i % 2 ? 8 : -8})`}
          fill="var(--color-toon-star)"
          stroke="var(--color-toon-night-deep)"
          strokeWidth=".9"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
