import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Pill } from '../../components/ui/Pill';
import { SectionLabel } from '../../components/ui/Note';
import { cx } from '../../lib/cx';
import {
  colorOf,
  findPlanet,
  groupOf,
  lightYears,
  playPath,
  shortPlanetName,
  type GalaxyEdge,
  type GalaxyNode,
} from '../galaxy';
import { useGalaxyUiStore } from '../galaxyStore';
import type { SkillCheck, UnlockState } from '../unlock';

interface PlanetPanelProps {
  node: GalaxyNode;
  current: GalaxyNode;
  /** Cạnh nối hành tinh đang đứng ↔ hành tinh này; `undefined` = không kề. */
  edge: GalaxyEdge | undefined;
  unlock: UnlockState;
  /** Lộ trình ngắn nhất từ chỗ đang đứng, kể cả hai đầu. */
  path: string[];
  onFly: () => void;
  onTest: () => void;
  onClose: () => void;
}

/** Panel bên phải: hồ sơ hành tinh, điều kiện nhập cảnh, nút hành động. */
export function PlanetPanel({ node, current, edge, unlock, path, onFly, onTest, onClose }: PlanetPanelProps) {
  const select = useGalaxyUiStore((s) => s.select);
  const flying = useGalaxyUiStore((s) => s.flight !== null);
  const group = groupOf(node);
  const color = colorOf(node);
  const isHere = node.roleCode === current.roleCode;
  const play = playPath(node);
  const total = unlock.hard.length + unlock.soft.length;
  const have = total - unlock.missing.length;

  return (
    <aside
      className="galaxy-glass galaxy-slide-in pointer-events-auto flex min-h-0 w-[360px] flex-col overflow-hidden rounded-[13px] max-[900px]:w-full"
      aria-label={`Hành tinh ${shortPlanetName(node)}`}
    >
      {/* đầu panel */}
      <div className="border-b border-line-2 px-[18px] pb-3.5 pt-4" style={{ borderTop: `3px solid ${color}` }}>
        <div className="flex items-start gap-2.5">
          <div className="min-w-0 flex-1">
            <p className="m-0 mb-1 font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color }}>
              Hệ {group.label}
            </p>
            <h2 className="m-0 text-balance font-display text-[21px] font-semibold leading-tight">
              {shortPlanetName(node)}
            </h2>
            <p className="m-0 mt-1 font-mono text-[10.5px] text-muted">
              {node.nameEn ?? node.roleCode} · {node.bandStart}–{node.bandEnd}
              {!play && ' · chưa mở nhiệm vụ'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="h-[30px] w-[30px] shrink-0 rounded-[7px] border border-line bg-inset text-[14px] text-muted hover:text-ink"
          >
            ✕
          </button>
        </div>
        {node.experience && (
          <p className="m-0 mt-2.5 text-[13px] leading-relaxed text-ink-2">{node.experience}</p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-3.5">
        {/* quan hệ với chỗ đang đứng */}
        {isHere ? (
          <p className="m-0 rounded-lg bg-gold-soft px-3 py-2.5 text-[12.5px] text-gold-2">
            Bạn đang đứng ở đây. Chọn một hành tinh lân cận bên dưới để xem đường bay.
          </p>
        ) : edge ? (
          <Relation edge={edge} current={current.roleCode} target={node.roleCode} />
        ) : (
          <FarNote path={path} onPick={select} />
        )}

        {/* điều kiện nhập cảnh */}
        {!isHere && (
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <SectionLabel className="mb-0">Điều kiện nhập cảnh</SectionLabel>
              {!unlock.noData && (
                <span className={cx('font-mono text-[11px] tabular-nums', unlock.unlocked ? 'text-good' : 'text-muted')}>
                  {have}/{total} đạt
                </span>
              )}
            </div>

            {unlock.noData ? (
              <p className="m-0 mt-2 text-[12px] leading-relaxed text-muted">
                Nguồn dữ liệu chưa liệt kê kỹ năng cho nghề này — không có gì để kiểm, cửa mở sẵn.
              </p>
            ) : (
              <>
                <SkillGroup title="Kỹ năng cứng" tone="hard" items={unlock.hard} source={node.hardSkillSource} />
                <SkillGroup title="Kỹ năng mềm" tone="soft" items={unlock.soft} />
              </>
            )}
          </div>
        )}
      </div>

      {/* hành động */}
      <div className="flex flex-col gap-2 border-t border-line-2 px-[18px] py-3.5">
        {edge && !isHere && (
          unlock.unlocked ? (
            <Button variant="primary" onClick={onFly} disabled={flying}>
              <span role="img" aria-label="tàu vũ trụ">🚀</span> Bay tới đây
            </Button>
          ) : (
            <>
              <Button variant="primary" onClick={onTest} disabled={flying}>
                Kiểm tra nhập cảnh · thiếu {unlock.missing.length} kỹ năng
              </Button>
              <p className="m-0 text-center text-[11px] leading-snug text-muted">
                Đạt bài kiểm tra thì được cấp visa, bay ngay. Hoặc chơi thử nghề để tích kỹ năng thật.
              </p>
            </>
          )
        )}
        {play && (
          <Link
            to={play}
            className={cx(
              'rounded-[7px] border px-[15px] py-[9px] text-center text-[13px] font-medium transition-colors',
              isHere || !edge
                ? 'border-gold bg-gold font-semibold text-bg hover:brightness-110'
                : 'border-line bg-inset text-ink-2 hover:border-gold hover:text-ink',
            )}
          >
            Trải nghiệm nghề này →
          </Link>
        )}
      </div>
    </aside>
  );
}

/* ── mảnh ────────────────────────────────────────────────────────────── */

function Relation({ edge, current, target }: { edge: GalaxyEdge; current: string; target: string }) {
  const promotion = edge.type === 'PROGRESSES_TO';
  const forward = edge.from === current && edge.to === target;
  const label = promotion ? (forward ? 'Bậc thăng tiến' : 'Bậc trước đó') : 'Nghề tương tự';
  const similarity = Math.round((1 - edge.distance) * 100);

  return (
    <div className="rounded-lg border border-line-2 bg-inset px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={promotion ? 'gold' : 'neutral'}>{promotion ? '▲ ' : '↔ '}{label}</Pill>
        <span className="font-mono text-[10.5px] text-muted">
          {lightYears(edge.distance)} năm ánh sáng
          {!promotion && ` · giống ${similarity}%`}
        </span>
      </div>
      {edge.why && <p className="m-0 mt-2 text-[12.5px] leading-relaxed text-ink-2">{edge.why}</p>}
      {edge.sharedSkills.length > 0 && (
        <p className="m-0 mt-1.5 font-mono text-[10.5px] text-muted">
          Kỹ năng chung: <span className="text-skill-hard">{edge.sharedSkills.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

function FarNote({ path, onPick }: { path: string[]; onPick: (roleCode: string) => void }) {
  const hops = path.slice(1); // bỏ chỗ đang đứng
  const first = findPlanet(hops[0]);
  return (
    <div className="rounded-lg border border-line-2 bg-inset px-3 py-2.5">
      <p className="m-0 text-[12.5px] leading-relaxed text-ink-2">
        Hành tinh này không kề chỗ bạn đứng — phải bay qua các hành tinh liền kề trước.
      </p>
      {hops.length > 0 ? (
        <>
          <p className="m-0 mt-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted">
            Lộ trình ngắn nhất · {hops.length} chặng
          </p>
          <ol className="m-0 mt-1 flex list-none flex-wrap items-center gap-1 p-0 text-[12px]">
            {hops.map((code, i) => {
              const p = findPlanet(code);
              return (
                <li key={code} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted">→</span>}
                  <button
                    type="button"
                    onClick={() => onPick(code)}
                    className="rounded-full border border-line bg-transparent px-2 py-[2px] text-ink-2 hover:border-gold hover:text-ink"
                  >
                    {p ? shortPlanetName(p) : code}
                  </button>
                </li>
              );
            })}
          </ol>
          {first && hops.length > 1 && (
            <Button size="sm" className="mt-2.5" onClick={() => onPick(first.roleCode)}>
              Xem chặng đầu: {shortPlanetName(first)}
            </Button>
          )}
        </>
      ) : (
        <p className="m-0 mt-2 text-[12px] text-muted">Chưa có đường bay nào nối tới đây.</p>
      )}
    </div>
  );
}

function SkillGroup({
  title,
  tone,
  items,
  source,
}: {
  title: string;
  tone: 'hard' | 'soft';
  items: SkillCheck[];
  source?: 'dataset_merged' | 'itviec_report' | null;
}) {
  return (
    <div className="mt-3">
      <p
        className={cx(
          'm-0 mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em]',
          tone === 'hard' ? 'text-skill-hard' : 'text-skill-soft',
        )}
      >
        {title}
        {source === 'itviec_report' && (
          <span className="ml-1.5 normal-case tracking-normal text-muted" title="Báo cáo ITviec chỉ hỏi ngôn ngữ/framework">
            · theo báo cáo ITviec
          </span>
        )}
      </p>
      {items.length === 0 ? (
        <p className="m-0 text-[11.5px] leading-snug text-muted">Chưa có dữ liệu cho nghề này.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {items.map((s) => (
            <li
              key={s.name}
              className={cx(
                'rounded-full border px-2 py-[3px] text-[11.5px] leading-snug',
                s.have
                  ? 'border-good/40 bg-good-soft text-good'
                  : 'border-signal/40 bg-signal-soft text-signal',
              )}
              title={s.have ? 'Đã có' : 'Còn thiếu'}
            >
              <span aria-hidden="true">{s.have ? '✓ ' : '✗ '}</span>
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
