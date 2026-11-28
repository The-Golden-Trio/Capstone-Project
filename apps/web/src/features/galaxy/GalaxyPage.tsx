import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Info,
  List,
  Map as MapIcon,
  Maximize2,
  Minus,
  Orbit,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ToonButton,
  ToonCallout,
  ToonChip,
  ToonDisclosure,
  ToonDots,
  ToonInput,
  ToonStatus,
  ToonStatusGlyph,
  EmptyState,
  LoadingBlock,
  CartoonPlanet,
  toonButtonClasses,
  cn,
  type ToonStatusKind,
} from '@datn/ui';
import {
  useCatalogue,
  useEnrol,
  useMe,
  useOccupation,
  useQuizResult,
  useRecord,
  useStartRun,
  errorText,
} from '../../api/hooks';
import { sourceOf } from '../../api';
import type { CatalogueOccupation, RegionId } from '../../api/types';
import { GalaxyMap, type GalaxyMapHandle } from './GalaxyMap';
import { RegionGlyph } from './regions';
import { foldVi, layoutGalaxy } from './layout';
import { keepHyphenated } from '../../lib/text';

type View = 'map' | 'list';

export default function GalaxyPage() {
  const catalogue = useCatalogue();
  const quiz = useQuizResult();
  const record = useRecord();
  const me = useMe();
  const navigate = useNavigate();
  const enrol = useEnrol();
  const startSample = useStartRun();
  const mapRef = useRef<GalaxyMapHandle>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  // Câu tìm lúc người chơi vừa chọn một kết quả: ẩn danh sách cho tới khi gõ tiếp.
  const [pickedQuery, setPickedQuery] = useState<string | null>(null);
  const [region, setRegion] = useState<RegionId | null>(
    () => (params.get('vung') as RegionId | null) ?? null,
  );
  const [playableOnly, setPlayableOnly] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const view: View = params.get('view') === 'list' ? 'list' : 'map';
  const selected = params.get('nghe');

  const layout = useMemo(
    () => (catalogue.data ? layoutGalaxy(catalogue.data) : null),
    [catalogue.data],
  );

  // Mở bằng đường dẫn có `?nghe=` thì bay tới hành tinh đó sau khi bản đồ vừa khung.
  const flewTo = useRef<string | null>(null);
  useEffect(() => {
    if (!layout || !selected || flewTo.current === selected) return;
    flewTo.current = selected;
    const id = window.setTimeout(() => mapRef.current?.flyTo(selected), 60);
    return () => window.clearTimeout(id);
  }, [layout, selected]);

  const matches = useMemo(() => {
    if (!catalogue.data) return [];
    const q = foldVi(deferredQuery.trim());
    return catalogue.data.occupations.filter(
      (o) =>
        (!region || o.regionId === region) &&
        (!playableOnly || o.playable) &&
        (!q || foldVi(`${o.name} ${o.group}`).includes(q)),
    );
  }, [catalogue.data, deferredQuery, region, playableOnly]);

  const filtering = Boolean(deferredQuery.trim() || region || playableOnly);
  const highlight = useMemo(
    () => (filtering ? new Set(matches.map((m) => m.code)) : null),
    [filtering, matches],
  );
  const suggested = useMemo(
    () => new Set((quiz.data?.suggestions ?? []).map((s) => s.code)),
    [quiz.data],
  );

  const select = (code: string | null) => {
    setParams(
      (p) => {
        if (code) p.set('nghe', code);
        else p.delete('nghe');
        return p;
      },
      { replace: true },
    );
  };

  const focusOn = (code: string) => {
    flewTo.current = code;
    select(code);
    if (view === 'map') mapRef.current?.flyTo(code);
  };

  if (catalogue.isError) {
    return (
      <EmptyState
        className="my-20"
        title="Chưa tải được bản đồ"
        description={errorText(catalogue.error)}
      />
    );
  }
  if (!layout || !catalogue.data) {
    return (
      <LoadingBlock text="Đang vẽ bản đồ ngân hà…" className="min-h-[70vh]" />
    );
  }

  const selectedOcc =
    catalogue.data.occupations.find((o) => o.code === selected) ?? null;
  const continueRow = record.data?.playing[0];
  const counts = Object.fromEntries(
    catalogue.data.regions.map((r) => [
      r.id,
      catalogue.data.occupations.filter((o) => o.regionId === r.id).length,
    ]),
  );

  return (
    <div className="theme-toon-night relative h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom))] min-w-0 overflow-hidden md:h-[calc(100dvh-4.5rem)]">
      <h1 className="sr-only">Bản đồ ngân hà nghề nghiệp</h1>
      {view === 'list' && <div className="gx-sky" aria-hidden="true" />}

      {view === 'map' && (
        <GalaxyMap
          ref={mapRef}
          layout={layout}
          selected={selected}
          onSelect={(code) => (code ? focusOn(code) : select(null))}
          onRegion={(id) => setRegion((r) => (r === id ? null : id))}
          focusRegion={region}
          highlight={highlight}
          suggested={suggested}
          className="absolute inset-0"
        />
      )}

      <div
        className={cn(
          'z-20 flex flex-col',
          view === 'map'
            ? 'pointer-events-none absolute inset-x-3 top-3 sm:inset-x-auto sm:left-5 sm:top-5 sm:w-[min(40rem,calc(100%-26rem))] sm:min-w-[24rem]'
            : 'relative mx-auto max-w-5xl px-3 pt-3 sm:px-6 sm:pt-5',
        )}
      >
        {/* Bảng điều khiển nổi trên bản đồ: tìm, lọc vùng bằng ký hiệu, đổi cách xem. */}
        <div className="pointer-events-auto rounded-[20px] border-2 border-toon-night-line bg-toon-night-deep/75 p-2 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.7)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor="galaxy-search" className="visually-hidden">
                Tìm nghề
              </label>
              <ToonInput
                ref={searchRef}
                id="galaxy-search"
                leftIcon={<Search size={16} />}
                placeholder="Tìm trong 221 nghề: điều dưỡng, back-end…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPickedQuery(null);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
                  // Deferred results may still describe the previous keystroke.
                  const q = foldVi(query.trim());
                  if (!q) return;
                  const match = catalogue.data?.occupations.find(
                    (o) =>
                      (!region || o.regionId === region) &&
                      (!playableOnly || o.playable) &&
                      foldVi(`${o.name} ${o.group}`).includes(q),
                  );
                  if (match) {
                    setPickedQuery(query);
                    focusOn(match.code);
                  }
                }}
                compact
                className="border-toon-night-deep"
              />
            </div>
            <GalaxyViewSwitch
              label="Cách xem"
              value={view}
              onChange={(v) =>
                setParams((p) => {
                  if (v === 'list') p.set('view', 'list');
                  else p.delete('view');
                  return p;
                })
              }
              options={[
                { key: 'map', label: 'Bản đồ', icon: <MapIcon size={16} /> },
                { key: 'list', label: 'Danh sách', icon: <List size={16} /> },
              ]}
            />
          </div>
          <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scroll-x-clean">
            <ToonChip
              surface="night"
              selected={region === null}
              onClick={() => setRegion(null)}
              icon={<Orbit size={16} strokeWidth={2.4} />}
              iconOnly={region !== null}
              label="Tất cả vùng"
            >
              Tất cả
            </ToonChip>
            {catalogue.data.regions.map((r) => (
              <ToonChip
                key={r.id}
                surface="night"
                selected={region === r.id}
                iconOnly={region !== r.id}
                label={r.name}
                count={counts[r.id]}
                icon={<RegionGlyph id={r.id} tinted={region !== r.id} />}
                onClick={() => setRegion(region === r.id ? null : r.id)}
              >
                {r.name}
              </ToonChip>
            ))}
            <span
              className="mx-0.5 h-5 w-px shrink-0 bg-toon-night-line"
              aria-hidden
            />
            <ToonChip
              surface="night"
              selected={playableOnly}
              onClick={() => setPlayableOnly((v) => !v)}
              icon={<Play size={14} strokeWidth={2.6} />}
              iconOnly
              label="Chỉ nghề có màn chơi"
            />
            {filtering && view === 'map' && (
              <p
                className="ml-auto shrink-0 pl-2 pr-1 text-xs font-bold tabular-nums text-toon-star-soft"
                role="status"
              >
                {matches.length} nghề
              </p>
            )}
          </div>
        </div>

        {view === 'map' &&
          deferredQuery.trim() &&
          pickedQuery !== deferredQuery && (
            <SearchResults
              items={matches}
              onPick={(code) => {
                setPickedQuery(deferredQuery);
                focusOn(code);
              }}
              onShowAll={() =>
                setParams((p) => {
                  p.set('view', 'list');
                  return p;
                })
              }
            />
          )}
      </div>

      {view === 'map' ? (
        <>
          {/* Điều khiển phóng to: một khối liền, không ba nút rời. */}
          <div
            role="group"
            aria-label="Phóng to, thu nhỏ"
            className="absolute bottom-4 left-4 z-10 flex flex-col overflow-hidden rounded-[16px] bg-toon-paper shadow-soft md:bottom-6 md:left-6"
          >
            <ZoomButton
              label="Phóng to"
              icon={<Plus size={18} strokeWidth={2.6} />}
              onClick={() => mapRef.current?.zoomBy(1.4)}
            />
            <ZoomButton
              label="Thu nhỏ"
              icon={<Minus size={18} strokeWidth={2.6} />}
              onClick={() => mapRef.current?.zoomBy(0.7)}
            />
            <ZoomButton
              label="Xem toàn bộ"
              icon={<Maximize2 size={16} strokeWidth={2.4} />}
              onClick={() => mapRef.current?.fit()}
            />
          </div>

          <MapLegend />

          {/* Gợi ý, chơi tiếp, mời Get to know me */}
          {!selectedOcc && (
            <div className="pointer-events-none absolute bottom-4 right-4 z-10 flex w-[min(20rem,calc(100%-6rem))] flex-col items-end gap-3 sm:bottom-auto sm:right-5 sm:top-5 sm:w-80">
              {/* Trên điện thoại thu các thẻ gợi ý lại, để bản đồ không bị che. */}
              <button
                type="button"
                onClick={() => setTipsOpen((v) => !v)}
                aria-expanded={tipsOpen}
                className={toonButtonClasses({
                  size: 'sm',
                  className: 'pointer-events-auto sm:hidden',
                })}
                style={{ backgroundColor: 'var(--color-toon-star)' }}
              >
                <Sparkles size={14} aria-hidden />{' '}
                {tipsOpen ? 'Ẩn gợi ý' : 'Bắt đầu từ đâu?'}
              </button>
              <div
                className={`${tipsOpen ? 'flex' : 'hidden'} w-full flex-col gap-3 sm:flex`}
              >
                {continueRow && (
                  <Link
                    to={`/islands/${continueRow.enrolmentId}`}
                    className="group pointer-events-auto flex items-center gap-3 rounded-[18px] bg-toon-paper p-3 text-toon-ink shadow-soft transition-transform motion-safe:hover:-translate-y-0.5"
                  >
                    <CartoonPlanet
                      seed={continueRow.occupationCode}
                      region={continueRow.regionId}
                      size={44}
                      ring
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-toon-ink-soft">
                        <ToonStatusGlyph kind="playing" size={12} /> Chơi tiếp
                      </span>
                      <span className="block truncate font-toon text-[15px] font-bold leading-snug">
                        {continueRow.occupationName}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-toon-ink-soft">
                        <ToonDots
                          size="sm"
                          total={continueRow.total}
                          done={continueRow.done}
                          current={continueRow.done + 1}
                          label={`${continueRow.done}/${continueRow.total} màn`}
                        />
                        <span className="tabular-nums">
                          Cấp {continueRow.levelNo}
                        </span>
                      </span>
                    </span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-toon-star transition-transform group-hover:translate-x-0.5">
                      <ArrowRight size={18} aria-hidden />
                    </span>
                  </Link>
                )}
                {sourceOf('play') === 'demo' && (
                  <div className="pointer-events-auto rounded-[18px] bg-toon-paper p-4 text-toon-ink shadow-soft">
                    <p className="font-toon text-base font-bold text-toon-ink">
                      Xem trước một ca làm mẫu
                    </p>
                    <p className="mt-1 text-xs font-semibold text-toon-ink-soft">
                      Ca Back-end L3: API chậm giờ cao điểm. Lời nhân vật là AI
                      giả.
                    </p>
                    <ToonDisclosure
                      defaultOpen={false}
                      summary="Chi tiết ca mẫu"
                      className="mt-1 text-xs text-toon-ink-soft [&>summary]:min-h-8 [&>summary]:py-1 [&>summary]:text-xs"
                    >
                      <p>
                        Dữ liệu hiện có đúng một ca đã soạn. Ở bản xem thử, bạn
                        vào thẳng ca này: điểm kỹ năng không cộng vào hồ sơ và
                        không mở cấp, nhưng thời gian chơi vẫn vào thống kê.
                      </p>
                    </ToonDisclosure>
                    <ToonButton
                      size="sm"
                      style={{ backgroundColor: 'var(--color-toon-star)' }}
                      className="mt-2"
                      leftIcon={<Play size={14} />}
                      loading={startSample.isPending}
                      onClick={() =>
                        startSample.mutate(
                          { taskId: 'SWE_BACKEND.L3.m2', enrolmentId: null },
                          {
                            onSuccess: (run) => navigate(`/play/${run.runId}`),
                          },
                        )
                      }
                    >
                      Vào ca mẫu
                    </ToonButton>
                  </div>
                )}
                {!me.data?.quizDone && !quiz.data && (
                  <div className="pointer-events-auto rounded-[18px] bg-toon-paper p-4 text-toon-ink shadow-soft">
                    <p className="flex items-center gap-2 font-toon text-base font-bold text-toon-ink">
                      <Sparkles size={16} aria-hidden /> Chưa biết bắt đầu từ
                      đâu?
                    </p>
                    <p className="mt-1 text-xs text-toon-ink-soft">
                      18 thẻ, khoảng ba phút. Game gợi ý vài vùng nghề có thể
                      thử trước.
                    </p>
                    <Link
                      to="/quiz"
                      style={{ backgroundColor: 'var(--color-toon-star)' }}
                      className={toonButtonClasses({
                        size: 'sm',
                        className: 'mt-3',
                      })}
                    >
                      Làm Get to know me
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedOcc && (
            <PeekPanel
              occ={selectedOcc}
              suggestedReason={
                quiz.data?.suggestions.find((s) => s.code === selectedOcc.code)
                  ?.reason ?? null
              }
              onClose={() => {
                select(null);
                searchRef.current?.focus();
              }}
              onEnter={() =>
                enrol.mutate(
                  { code: selectedOcc.code, levelNo: 1 },
                  {
                    onSuccess: (island) =>
                      navigate(`/islands/${island.enrolmentId}`),
                  },
                )
              }
              entering={enrol.isPending}
              enterError={enrol.isError ? errorText(enrol.error) : null}
            />
          )}
        </>
      ) : (
        <OccupationList
          items={matches}
          total={catalogue.data.occupations.length}
          suggested={suggested}
          regions={catalogue.data.regions}
        />
      )}
    </div>
  );
}

function ZoomButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-11 place-items-center text-toon-ink transition-colors hover:bg-toon-sand focus-visible:bg-toon-sand focus-visible:outline-none [&+&]:border-t-[1.5px] [&+&]:border-toon-ink/15"
    >
      {icon}
    </button>
  );
}

/**
 * Bảng chú giải ký hiệu của bản đồ. Bản đồ nói bằng ký hiệu thay vì chữ, nên
 * luôn có chỗ tra nghĩa của từng ký hiệu.
 */
function MapLegend() {
  const [open, setOpen] = useState(false);
  const items: Array<{ glyph: ReactNode; label: string }> = [
    { glyph: <LegendPlanet ring />, label: 'Có màn chơi' },
    { glyph: <LegendPlanet orbit />, label: 'Đang chơi' },
    { glyph: <LegendPlanet star />, label: 'Đã đi hết' },
    { glyph: <LegendPlanet halo />, label: 'Gợi ý cho bạn' },
    { glyph: <LegendPlanet lock />, label: 'Cần nghề đi trước' },
  ];
  return (
    <div className="absolute bottom-4 left-[4.75rem] z-10 md:bottom-6 md:left-[5.5rem]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="galaxy-legend"
        aria-label="Ý nghĩa ký hiệu"
        title="Ý nghĩa ký hiệu"
        className="grid size-11 place-items-center rounded-full border-2 border-toon-night-line bg-toon-night-deep/75 text-toon-paper backdrop-blur-md transition-colors hover:border-toon-star-soft focus-visible:outline-none focus-visible:shadow-toon-focus lg:hidden"
      >
        <Info size={18} aria-hidden />
      </button>
      <ul
        id="galaxy-legend"
        aria-label="Ý nghĩa ký hiệu"
        className={cn(
          'absolute bottom-full left-0 mb-2 w-max flex-col gap-1.5 rounded-[16px] border-2 border-toon-night-line bg-toon-night-deep/80 px-3 py-2.5 text-xs font-semibold text-toon-paper backdrop-blur-md lg:static lg:mb-0 lg:flex lg:flex-row lg:items-center lg:gap-4 lg:rounded-full lg:py-2',
          open ? 'flex' : 'hidden',
        )}
      >
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {it.glyph}
            {it.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LegendPlanet({
  ring,
  orbit,
  star,
  halo,
  lock,
}: {
  ring?: boolean;
  orbit?: boolean;
  star?: boolean;
  halo?: boolean;
  lock?: boolean;
}) {
  return (
    <svg viewBox="-14 -14 28 28" className="size-6 shrink-0" aria-hidden>
      {halo && (
        <circle
          r="10.5"
          fill="none"
          stroke="#f6cf5e"
          strokeWidth="1.5"
          strokeDasharray="2 3"
        />
      )}
      {orbit && (
        <circle
          r="12"
          fill="none"
          stroke="#f6cf5e"
          strokeWidth="1.5"
          strokeDasharray="3 3.5"
        />
      )}
      {ring && (
        <ellipse
          rx="12"
          ry="4"
          transform="rotate(-24)"
          fill="#f6cf5e"
          stroke="#0c1834"
          strokeWidth="1.5"
        />
      )}
      <circle
        r="6.5"
        fill={lock ? '#8ea5c3' : '#72c5f2'}
        stroke="#0c1834"
        strokeWidth="1.5"
        opacity={lock ? 0.75 : 1}
      />
      {star && (
        <path
          d="M0-13.5 1.6-9.6 5.6-9.2 2.6-6.6 3.4-2.8 0-4.8-3.4-2.8-2.6-6.6-5.6-9.2-1.6-9.6z"
          fill="#f6cf5e"
          stroke="#0c1834"
          strokeWidth="1"
        />
      )}
      {lock && (
        <g transform="translate(4.5 3)" stroke="#0c1834" strokeWidth="1.2">
          <path d="M-2.2-1v-1.6a2.2 2.2 0 0 1 4.4 0V-1" fill="none" />
          <rect x="-3.5" y="-1" width="7" height="5.5" rx="1" fill="#fffaf0" />
        </g>
      )}
    </svg>
  );
}

function statusOf(o: CatalogueOccupation): {
  kind: ToonStatusKind;
  label: string;
} {
  if (o.my.status === 'COMPLETED') return { kind: 'done', label: 'Đã đi hết' };
  if (o.my.status === 'PLAYING')
    return { kind: 'playing', label: `Đang chơi · cấp ${o.my.currentLevel}` };
  if (o.gate.kind === 'PREREQUISITE')
    return { kind: 'locked', label: 'Cần nghề đi trước' };
  return o.playable
    ? { kind: 'open', label: 'Có màn chơi' }
    : { kind: 'soon', label: 'Chưa có màn chơi' };
}

function StatusOf({
  occ,
  compact = false,
}: {
  occ: CatalogueOccupation;
  compact?: boolean;
}) {
  const s = statusOf(occ);
  return <ToonStatus kind={s.kind} label={s.label} compact={compact} />;
}

function PeekPanel({
  occ,
  suggestedReason,
  onClose,
  onEnter,
  entering,
  enterError,
}: {
  occ: CatalogueOccupation;
  suggestedReason: string | null;
  onClose: () => void;
  onEnter: () => void;
  entering: boolean;
  enterError: string | null;
}) {
  const locked = occ.gate.kind === 'PREREQUISITE' && occ.my.status === 'NEW';
  // Mặt khó của nghề phải thấy được trước khi vào nghề (BR-07).
  const profile = useOccupation(occ.code);
  const downside = profile.data?.downsides[0];
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [occ.code]);
  return (
    <aside
      aria-label={`Thông tin nghề ${occ.shortName}`}
      className="absolute inset-x-0 bottom-0 z-30 max-h-[70%] overflow-y-auto rounded-t-[22px] bg-toon-paper p-5 text-toon-ink shadow-soft-lg motion-safe:animate-toon-slide sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:max-h-[calc(100%-2.5rem)] sm:w-[23rem] sm:rounded-[22px]"
    >
      <button
        type="button"
        aria-label="Đóng"
        title="Đóng"
        onClick={onClose}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full text-toon-ink-soft transition-colors hover:bg-toon-sand hover:text-toon-ink focus-visible:outline-none focus-visible:shadow-toon-focus"
      >
        <X size={20} strokeWidth={2.6} aria-hidden />
      </button>
      <div className="flex items-center gap-4 pr-8">
        <CartoonPlanet
          seed={occ.code}
          region={occ.regionId}
          ring={occ.playable}
          size={76}
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-toon-ink-soft">
            <RegionGlyph id={occ.regionId} size={13} /> {occ.group}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="mt-1 font-toon text-2xl font-extrabold leading-tight focus:outline-none"
          >
            {keepHyphenated(occ.shortName)}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <StatusOf occ={occ} />
          </div>
        </div>
      </div>

      {suggestedReason && (
        <ToonCallout
          tone="tip"
          className="mt-4"
          icon={<ToonStatusGlyph kind="suggested" size={16} />}
        >
          <span className="text-toon-ink">{suggestedReason}</span>
        </ToonCallout>
      )}

      <PeekSummary text={occ.summary} />

      <ToonCallout
        tone="warning"
        className="mt-4"
        icon={<ToonStatusGlyph kind="warning" size={16} />}
        title="Mặt khó của nghề"
      >
        {downside ??
          (profile.isError
            ? 'Chưa tải được, xem trong hồ sơ nghề.'
            : 'Đang tải…')}
      </ToonCallout>

      <div className="mt-4">
        <p className="flex items-baseline justify-between gap-2 text-xs font-bold text-toon-ink-soft">
          <span>Lộ trình {occ.levelCount} cấp</span>
          <span className="font-semibold">
            {occ.my.highestCompleted
              ? `xong cấp ${occ.my.highestCompleted}`
              : occ.my.currentLevel
                ? `đang ở cấp ${occ.my.currentLevel}`
                : 'chưa thử'}
          </span>
        </p>
        <ToonDots
          className="mt-2"
          total={occ.levelCount}
          done={occ.my.highestCompleted ?? 0}
          current={occ.my.currentLevel}
          label={`Lộ trình ${occ.levelCount} cấp`}
        />
      </div>

      {locked && occ.gate.kind === 'PREREQUISITE' && (
        <p className="mt-4 text-xs text-toon-ink-soft">
          Cấp đầu của nghề này đòi kinh nghiệm từ nghề khác: xong cấp{' '}
          {occ.gate.band} ở{' '}
          {occ.gate.roles
            .slice(0, 3)
            .map((r) => r.name)
            .join(', ')}
          {occ.gate.roles.length > 3 ? '…' : ''}.
        </p>
      )}

      {enterError && (
        <p className="mt-3 text-sm text-toon-maroon" role="alert">
          {enterError}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {occ.my.status === 'NEW' && occ.playable && !locked && (
          <ToonButton
            block
            style={{ backgroundColor: 'var(--color-toon-star)' }}
            onClick={onEnter}
            loading={entering}
            leftIcon={<Play size={16} />}
          >
            Vào cấp đầu tiên
          </ToonButton>
        )}
        <Link
          to={
            occ.my.status === 'NEW'
              ? `/occupations/${occ.code}`
              : `/occupations/${occ.code}/levels`
          }
          style={
            occ.my.status === 'NEW' && occ.playable && !locked
              ? undefined
              : { backgroundColor: 'var(--color-toon-star)' }
          }
          className={toonButtonClasses({
            variant:
              occ.my.status === 'NEW' && occ.playable && !locked
                ? 'secondary'
                : 'primary',
            block: true,
          })}
        >
          {occ.my.status === 'NEW' ? 'Xem hồ sơ nghề' : 'Mở lộ trình nghề'}
          <ArrowRight size={16} aria-hidden />
        </Link>
        {/* Nghề đã vào: lộ trình là nút chính, hồ sơ nghề vẫn mở thẳng được. */}
        {occ.my.status !== 'NEW' && (
          <Link
            to={`/occupations/${occ.code}`}
            className={toonButtonClasses({ variant: 'secondary', block: true })}
          >
            Xem hồ sơ nghề
          </Link>
        )}
      </div>
    </aside>
  );
}

function OccupationList({
  items,
  total,
  suggested,
  regions,
}: {
  items: CatalogueOccupation[];
  total: number;
  suggested: Set<string>;
  regions: Array<{ id: RegionId; name: string }>;
}) {
  const sorted = [...items].sort(
    (a, b) =>
      Number(suggested.has(b.code)) - Number(suggested.has(a.code)) ||
      Number(b.my.status !== 'NEW') - Number(a.my.status !== 'NEW') ||
      Number(b.playable) - Number(a.playable) ||
      a.shortName.localeCompare(b.shortName, 'vi'),
  );
  if (!sorted.length) {
    return (
      <EmptyState
        className="my-16"
        title="Không có nghề nào khớp"
        description="Thử bỏ dấu, gõ ngắn hơn, hoặc bỏ bớt bộ lọc."
      />
    );
  }
  // Đọc theo vùng, mỗi vùng là một danh sách hàng: dò mắt theo một cột thay
  // vì quét lưới thẻ ba cột.
  const sections = regions
    .map((r) => ({ ...r, rows: sorted.filter((o) => o.regionId === r.id) }))
    .filter((r) => r.rows.length > 0);
  return (
    <div className="absolute inset-x-0 bottom-0 top-[7.75rem] overflow-y-auto sm:top-[8.5rem]">
      <div className="mx-auto max-w-5xl px-3 pb-10 sm:px-6">
        <p
          className="flex items-center gap-3 pt-1 text-xs font-semibold text-toon-night-ink"
          role="status"
        >
          <span className="font-bold tabular-nums text-toon-star-soft">
            {sorted.length}/{total} nghề
          </span>
          <span className="flex items-center gap-1.5">
            <ToonStatusGlyph kind="open" size={13} /> có màn chơi
          </span>
          <span className="flex items-center gap-1.5">
            <ToonStatusGlyph kind="suggested" size={13} /> gợi ý cho bạn
          </span>
        </p>
        {sections.map((section) => (
          <section
            key={section.id}
            aria-labelledby={`region-${section.id}`}
            className="mt-6"
          >
            <h2
              id={`region-${section.id}`}
              className="mb-2 flex items-center gap-2 px-1 font-toon text-lg font-extrabold text-toon-paper"
            >
              <RegionGlyph id={section.id} size={18} />
              {section.name}
              <span className="font-toon-body text-xs font-semibold tabular-nums text-toon-night-ink">
                {section.rows.length}
              </span>
            </h2>
            <ul className="toon-card toon-rows overflow-hidden p-0">
              {section.rows.map((o) => (
                <li key={o.code}>
                  <Link
                    to={`/occupations/${o.code}`}
                    className="group flex min-h-16 items-center gap-3 px-4 py-2.5 text-toon-ink transition-colors hover:bg-toon-cream focus-visible:bg-toon-cream focus-visible:outline-none"
                  >
                    <CartoonPlanet
                      seed={o.code}
                      region={o.regionId}
                      ring={o.playable}
                      size={40}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-toon text-base font-bold leading-snug">
                        <span className="truncate">{o.shortName}</span>
                        {suggested.has(o.code) && (
                          <ToonStatus kind="suggested" compact />
                        )}
                      </span>
                      <span className="block truncate text-xs text-toon-ink-soft">
                        {o.group}
                      </span>
                    </span>
                    {o.my.status !== 'NEW' && (
                      <ToonDots
                        size="sm"
                        className="hidden sm:inline-flex"
                        total={o.levelCount}
                        done={o.my.highestCompleted ?? 0}
                        current={o.my.currentLevel}
                        label={`Lộ trình ${o.levelCount} cấp`}
                      />
                    )}
                    {/* Đa số nghề chưa có màn chơi: chỉ gắn ký hiệu cho trạng thái khác thường. */}
                    {(o.playable ||
                      o.my.status !== 'NEW' ||
                      o.gate.kind === 'PREREQUISITE') && (
                      <StatusOf occ={o} compact />
                    )}
                    <ChevronRight
                      size={18}
                      aria-hidden
                      className="shrink-0 text-toon-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-toon-ink"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function PeekSummary({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-toon-ink-soft">{text.trim()}</p>;
}

/**
 * Kết quả tìm trên bản đồ: nghề khớp chỉ là chấm nhỏ không tên, nên liệt kê
 * vài nghề đầu để bấm bay tới; phần còn lại xem ở dạng danh sách.
 */
function SearchResults({
  items,
  onPick,
  onShowAll,
}: {
  items: CatalogueOccupation[];
  onPick: (code: string) => void;
  onShowAll: () => void;
}) {
  const shown = items.slice(0, 6);
  return (
    <div className="pointer-events-auto mt-2 w-full max-w-md rounded-[18px] bg-toon-paper p-2 text-toon-ink shadow-soft-lg motion-safe:animate-toon-slide">
      {shown.length === 0 ? (
        <p className="px-2 py-1.5 text-sm text-toon-ink-soft">
          Không có nghề nào khớp. Thử bỏ dấu hoặc gõ ngắn hơn.
        </p>
      ) : (
        <ul aria-label="Nghề khớp với tìm kiếm" className="grid gap-1">
          {shown.map((o) => (
            <li key={o.code}>
              <button
                type="button"
                onClick={() => onPick(o.code)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left hover:bg-toon-cream focus-visible:shadow-toon-focus focus-visible:outline-none"
              >
                <RegionGlyph id={o.regionId} size={15} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-toon font-bold">
                    {o.shortName}
                  </span>
                  <span className="block truncate text-xs text-toon-ink-soft">
                    {o.group}
                  </span>
                </span>
                <ArrowRight size={15} aria-hidden className="shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > shown.length && (
        <button
          type="button"
          onClick={onShowAll}
          className="mt-1 w-full rounded-xl px-2 py-1.5 text-left text-xs font-bold underline underline-offset-4 hover:bg-toon-cream focus-visible:shadow-toon-focus focus-visible:outline-none"
        >
          Xem cả {items.length} nghề trong danh sách
        </button>
      )}
    </div>
  );
}

function GalaxyViewSwitch({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ key: View; label: ReactNode; icon: ReactNode }>;
  value: View;
  onChange: (view: View) => void;
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(event) => {
        if (
          ![
            'ArrowLeft',
            'ArrowRight',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
          ].includes(event.key)
        )
          return;
        event.preventDefault();
        const index = options.findIndex((option) => option.key === value);
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? options.length - 1
              : (index +
                  (event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                    ? -1
                    : 1) +
                  options.length) %
                options.length;
        onChange(options[next].key);
        event.currentTarget
          .querySelectorAll<HTMLButtonElement>('[role="radio"]')
          [next]?.focus();
      }}
      className="inline-flex shrink-0 gap-0.5 rounded-[14px] border-2 border-toon-night-line bg-toon-night-deep/60 p-0.5"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          tabIndex={value === o.key ? 0 : -1}
          onClick={() => onChange(o.key)}
          aria-label={typeof o.label === 'string' ? o.label : undefined}
          title={typeof o.label === 'string' ? o.label : undefined}
          className={cn(
            'grid size-9 place-items-center rounded-[11px] transition-colors focus-visible:outline-none focus-visible:shadow-toon-focus',
            value === o.key
              ? 'bg-toon-star text-toon-ink'
              : 'text-toon-night-ink hover:bg-toon-night-soft hover:text-toon-paper',
          )}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
