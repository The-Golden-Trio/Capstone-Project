import type { PortraitView } from '../../api/schemas';
import { useT, type Translate } from '../../i18n/useT';
import { cx } from '../../lib/cx';
import { Pill } from '../ui/Pill';

type Position = NonNullable<PortraitView['workstyle']>;
type RegionCode = Exclude<Position['region'], 'center'>;

/**
 * Sáu vùng của World-of-Work Map, đặt theo lục giác Holland như Prediger
 * (1982) chỉ ra: S hẳn về Người, R hẳn về Vật, E/C phía Dữ kiện, I/A phía Ý
 * tưởng. Góc tính theo toán học (0° = phải, ngược chiều kim đồng hồ), khớp
 * `WORKSTYLE_REGIONS` trong game-core.
 */
const REGIONS: ReadonlyArray<{ code: RegionCode; angle: number }> = [
  { code: 'S', angle: 0 },
  { code: 'E', angle: 60 },
  { code: 'C', angle: 120 },
  { code: 'R', angle: 180 },
  { code: 'I', angle: 240 },
  { code: 'A', angle: 300 },
];

const SIZE = 300;
const C = SIZE / 2;
const R = 112;

/** Điểm trên mặt phẳng: x sang phải, y lên trên (SVG thì y xuống). */
const at = (angle: number, radius: number) => {
  const rad = (angle * Math.PI) / 180;
  return { x: C + radius * Math.cos(rad), y: C - radius * Math.sin(rad) };
};

/** Hình quạt của một vùng, rộng 60° quanh góc của nó. */
const wedge = (angle: number) => {
  const a = at(angle - 30, R);
  const b = at(angle + 30, R);
  return `M ${C} ${C} L ${a.x} ${a.y} A ${R} ${R} 0 0 0 ${b.x} ${b.y} Z`;
};

/**
 * Vị trí người chơi trên World-of-Work Map: hai trục People–Things và
 * Data–Ideas, chấm nằm trong vùng nào thì vùng đó sáng lên.
 */
export function WorkstyleMap({ position }: { position: Position | null }) {
  const t = useT();

  if (!position) {
    return <p className="m-0 text-[13px] text-muted">{t('workstyle.none')}</p>;
  }

  // 0–100 → −1…1; hai trục cùng cực thì có thể vượt vòng tròn, kéo về mép.
  let x = (position.peopleThings - 50) / 50;
  let y = (position.dataIdeas - 50) / 50;
  const length = Math.hypot(x, y);
  if (length > 0.95) {
    x = (x / length) * 0.95;
    y = (y / length) * 0.95;
  }
  const dot = { x: C + x * R, y: C - y * R };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-display text-[18px] font-semibold leading-tight">
          {t(`workstyle.region.${position.region}`)}
        </span>
        {position.region !== 'center' && (
          <Pill tone="gold">RIASEC · {position.region}</Pill>
        )}
      </div>
      <p className="m-0 text-[13px] text-ink-2">
        {t(`workstyle.desc.${position.region}`)}
      </p>

      <svg
        viewBox={`-34 -14 ${SIZE + 68} ${SIZE + 28}`}
        className="mx-auto w-full max-w-[340px]"
        role="img"
        aria-label={`${t('workstyle.title')}: ${t(`workstyle.region.${position.region}`)}`}
      >
        <circle cx={C} cy={C} r={R} className="fill-inset stroke-line" />
        {REGIONS.map(({ code, angle }) => (
          <path
            key={code}
            d={wedge(angle)}
            className={cx(
              'stroke-line-2',
              code === position.region ? 'fill-gold-soft' : 'fill-transparent',
            )}
          />
        ))}

        {/* Hai trục */}
        <line
          x1={C - R}
          y1={C}
          x2={C + R}
          y2={C}
          className="stroke-blue"
          strokeDasharray="3 4"
        />
        <line
          x1={C}
          y1={C - R}
          x2={C}
          y2={C + R}
          className="stroke-blue"
          strokeDasharray="3 4"
        />
        <AxisLabel
          x={C + R + 6}
          y={C}
          anchor="start"
          text={t('workstyle.people')}
        />
        <AxisLabel
          x={C - R - 6}
          y={C}
          anchor="end"
          text={t('workstyle.things')}
        />
        <AxisLabel
          x={C}
          y={C - R - 6}
          anchor="middle"
          text={t('workstyle.data')}
        />
        <AxisLabel
          x={C}
          y={C + R + 12}
          anchor="middle"
          text={t('workstyle.ideas')}
        />

        {REGIONS.map(({ code, angle }) => (
          <RegionLabel
            key={code}
            code={code}
            angle={angle}
            active={code === position.region}
            t={t}
          />
        ))}

        <circle cx={dot.x} cy={dot.y} r={9} className="fill-gold opacity-25" />
        <circle
          cx={dot.x}
          cy={dot.y}
          r={5}
          className="fill-gold stroke-surf"
          strokeWidth={2}
        />
      </svg>

      <div className="flex flex-col gap-2">
        <AxisRow
          label={t('workstyle.axisPT')}
          value={position.peopleThings}
          basis={t('workstyle.basis', {
            quiz: position.basis.peopleThings.quizItems,
            play: position.basis.peopleThings.playChoices,
          })}
        />
        <AxisRow
          label={t('workstyle.axisDI')}
          value={position.dataIdeas}
          basis={t('workstyle.basis', {
            quiz: position.basis.dataIdeas.quizItems,
            play: position.basis.dataIdeas.playChoices,
          })}
        />
      </div>

      <p className="m-0 text-[12.5px] text-ink-2">{t('workstyle.explain')}</p>
      <p className="m-0 font-mono text-[10px] text-muted">
        {t('workstyle.source')}
      </p>
    </div>
  );
}

function AxisLabel({
  x,
  y,
  anchor,
  text,
}: {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  text: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      dominantBaseline="middle"
      className="fill-muted font-mono text-[10px] uppercase tracking-[0.06em]"
    >
      {text}
    </text>
  );
}

/** Tên vùng đặt trong hình quạt; tên dài có "&" thì xuống dòng ở đó. */
function RegionLabel({
  code,
  angle,
  active,
  t,
}: {
  code: RegionCode;
  angle: number;
  active: boolean;
  t: Translate;
}) {
  const { x, y } = at(angle, R * 0.68);
  const lines = t(`workstyle.region.${code}`).split(' & ');
  return (
    <text
      x={x}
      y={y - ((lines.length - 1) * 11) / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      className={cx(
        'text-[9.5px]',
        active ? 'fill-gold-2 font-semibold' : 'fill-ink-2',
      )}
    >
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : 11}>
          {i < lines.length - 1 ? `${line} &` : line}
        </tspan>
      ))}
    </text>
  );
}

function AxisRow({
  label,
  value,
  basis,
}: {
  label: string;
  value: number;
  basis: string;
}) {
  return (
    <div className="grid items-center gap-x-[11px] gap-y-0.5 [grid-template-columns:120px_1fr_32px]">
      <span className="font-mono text-[10px] tracking-[0.04em] text-muted">
        {label}
      </span>
      <span className="relative h-[7px] rounded-sm bg-inset">
        <i
          className="absolute top-1/2 block h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
          style={{ left: `${value}%` }}
        />
      </span>
      <span className="text-right font-mono text-[10.5px] tabular-nums text-ink-2">
        {value}
      </span>
      <span className="col-start-2 col-end-4 font-mono text-[9.5px] text-muted">
        {basis}
      </span>
    </div>
  );
}
