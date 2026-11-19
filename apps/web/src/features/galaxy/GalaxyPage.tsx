import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  List,
  Lock,
  Map as MapIcon,
  Maximize2,
  Minus,
  Play,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ToonBadge,
  ToonButton,
  EmptyState,
  ToonIconButton,
  ToonInput,
  LoadingBlock,
  CartoonPlanet,
  toonButtonClasses,
  cn,
  regionColor,
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
    <div className="theme-toon-night relative flex h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom))] min-w-0 flex-col md:h-[calc(100dvh-4.5rem)]">
      <h1 className="sr-only">Bản đồ ngân hà nghề nghiệp</h1>
      {/* Thanh công cụ */}
      <div className="relative z-10 border-b-[3px] border-toon-night-deep bg-toon-night-soft">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 basis-60">
            <label htmlFor="galaxy-search" className="visually-hidden">
              Tìm nghề
            </label>
            <ToonInput
              id="galaxy-search"
              leftIcon={<Search size={16} />}
              placeholder="Tìm trong 221 nghề, ví dụ: điều dưỡng, back-end, đầu bếp"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) focusOn(matches[0].code);
              }}
              compact
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
              { key: 'map', label: 'Bản đồ', icon: <MapIcon size={14} /> },
              { key: 'list', label: 'Danh sách', icon: <List size={14} /> },
            ]}
          />
        </div>
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-3 scroll-x-clean sm:px-6">
          <GalaxyChip
            selected={region === null}
            onClick={() => setRegion(null)}
          >
            Tất cả vùng
          </GalaxyChip>
          {catalogue.data.regions.map((r) => (
            <GalaxyChip
              key={r.id}
              selected={region === r.id}
              color={regionColor(r.id)}
              count={counts[r.id]}
              icon={<RegionDot color={regionColor(r.id)} />}
              onClick={() => setRegion(region === r.id ? null : r.id)}
            >
              {r.name}
            </GalaxyChip>
          ))}
          <span
            className="mx-1 h-5 w-px shrink-0 bg-toon-night-line"
            aria-hidden
          />
          <GalaxyChip
            selected={playableOnly}
            onClick={() => setPlayableOnly((v) => !v)}
            icon={<Play size={12} />}
          >
            Có màn chơi
          </GalaxyChip>
        </div>
      </div>

      {view === 'map' ? (
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <GalaxyMap
            ref={mapRef}
            layout={layout}
            selected={selected}
            onSelect={(code) => (code ? focusOn(code) : select(null))}
            highlight={highlight}
            suggested={suggested}
            className="absolute inset-0 h-full w-full focus-visible:outline-none"
          />

          {/* Nút phóng to */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 md:bottom-6 md:left-6">
            <ToonIconButton
              variant="secondary"
              label="Phóng to"
              icon={<Plus size={18} />}
              onClick={() => mapRef.current?.zoomBy(1.4)}
            />
            <ToonIconButton
              variant="secondary"
              label="Thu nhỏ"
              icon={<Minus size={18} />}
              onClick={() => mapRef.current?.zoomBy(0.7)}
            />
            <ToonIconButton
              variant="secondary"
              label="Xem toàn bộ"
              icon={<Maximize2 size={16} />}
              onClick={() => mapRef.current?.fit()}
            />
          </div>

          {/* Gợi ý, chơi tiếp, mời Get to know me */}
          {!selectedOcc && (
            <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:w-80">
              {/* Trên điện thoại thu các thẻ gợi ý lại, để bản đồ không bị che. */}
              <button
                type="button"
                onClick={() => setTipsOpen((v) => !v)}
                aria-expanded={tipsOpen}
                className="pointer-events-auto inline-flex min-h-9 items-center gap-2 rounded-full border-[3px] border-toon-night-deep bg-toon-star px-3.5 font-toon text-xs font-bold text-toon-ink shadow-toon-sm sm:hidden"
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
                    className="pointer-events-auto flex items-center gap-3 rounded-[18px] border-[3px] border-toon-night-deep bg-toon-paper p-3 text-toon-ink shadow-toon motion-safe:hover:-translate-y-0.5"
                  >
                    <CartoonPlanet
                      seed={continueRow.occupationCode}
                      region={continueRow.regionId}
                      size={44}
                      ring
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-toon text-xs font-bold uppercase tracking-wider text-toon-ink-soft">
                        Chơi tiếp
                      </span>
                      <span className="block truncate text-sm font-semibold">
                        {continueRow.occupationName}
                      </span>
                      <span className="block text-xs text-toon-ink-soft">
                        Cấp {continueRow.levelNo} · {continueRow.done}/
                        {continueRow.total} màn
                      </span>
                    </span>
                    <ArrowRight size={18} className="text-toon-ink" />
                  </Link>
                )}
                {sourceOf('play') === 'demo' && (
                  <div className="pointer-events-auto rounded-[18px] border-[3px] border-toon-night-deep bg-toon-paper p-4 text-toon-ink shadow-toon">
                    <p className="font-toon text-base font-bold text-toon-ink">
                      Xem trước một ca làm mẫu
                    </p>
                    <p className="mt-1 text-xs font-semibold text-toon-ink-soft">
                      Ca Back-end L3: API chậm giờ cao điểm. Lời nhân vật là AI
                      giả.
                    </p>
                    <details className="mt-1 text-xs text-toon-ink-soft">
                      <summary className="w-fit cursor-pointer font-bold underline decoration-dotted underline-offset-4">
                        Chi tiết ca mẫu
                      </summary>
                      <p className="mt-1">
                        Dữ liệu hiện có đúng một ca đã soạn. Ở bản xem thử, bạn
                        vào thẳng ca này: điểm kỹ năng không cộng vào hồ sơ và
                        không mở cấp, nhưng thời gian chơi vẫn vào thống kê.
                      </p>
                    </details>
                    <ToonButton
                      size="sm"
                      style={{ backgroundColor: 'var(--color-toon-star)' }}
                      className="mt-3"
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
                  <div className="pointer-events-auto rounded-[18px] border-[3px] border-toon-night-deep bg-toon-paper p-4 text-toon-ink shadow-toon">
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
              onClose={() => select(null)}
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

          {deferredQuery.trim() && pickedQuery !== deferredQuery && (
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
          {filtering && (
            <p
              className="absolute bottom-4 right-4 z-10 rounded-full border-2 border-toon-night-deep bg-toon-paper px-3 py-1.5 text-xs font-bold text-toon-ink md:right-6"
              role="status"
            >
              {matches.length} nghề khớp
            </p>
          )}
        </div>
      ) : (
        <OccupationList
          items={matches}
          total={catalogue.data.occupations.length}
          suggested={suggested}
        />
      )}
    </div>
  );
}

function statusBadge(o: CatalogueOccupation) {
  if (o.my.status === 'COMPLETED')
    return <ToonBadge tone="mustard">Đã đi hết</ToonBadge>;
  if (o.my.status === 'PLAYING')
    return (
      <ToonBadge tone="mustard">Đang chơi · cấp {o.my.currentLevel}</ToonBadge>
    );
  if (o.gate.kind === 'PREREQUISITE')
    return (
      <ToonBadge tone="paper" icon={<Lock size={11} />}>
        Cần nghề đi trước
      </ToonBadge>
    );
  return o.playable ? (
    <ToonBadge tone="mint">Có màn chơi</ToonBadge>
  ) : (
    <ToonBadge tone="paper">Chưa có màn chơi</ToonBadge>
  );
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
  return (
    <aside
      aria-label={`Thông tin nghề ${occ.shortName}`}
      className="absolute inset-x-0 bottom-0 z-20 max-h-[70%] overflow-y-auto rounded-t-[22px] border-[3px] border-toon-night-deep bg-toon-paper p-5 text-toon-ink shadow-toon-lg motion-safe:animate-toon-pop sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[23rem] sm:rounded-[22px]"
    >
      <div className="absolute right-3 top-3">
        <ToonIconButton
          label="Đóng"
          icon={<X size={18} />}
          size="sm"
          onClick={onClose}
        />
      </div>
      <div className="flex items-center gap-4 pr-8">
        <CartoonPlanet
          seed={occ.code}
          region={occ.regionId}
          ring={occ.playable}
          size={76}
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-toon-ink-soft">
            <RegionDot color={regionColor(occ.regionId)} size={7} /> {occ.group}
          </p>
          <h2 className="mt-1 font-toon text-2xl font-extrabold leading-tight">
            {keepHyphenated(occ.shortName)}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">{statusBadge(occ)}</div>
        </div>
      </div>

      {suggestedReason && (
        <p className="mt-4 flex gap-2 rounded-xl border-2 border-toon-ink bg-toon-star-soft p-3 text-sm text-toon-ink">
          <Sparkles size={16} className="mt-0.5 shrink-0" aria-hidden />{' '}
          {suggestedReason}
        </p>
      )}

      <PeekSummary text={occ.summary} />

      <div className="mt-4 rounded-xl border-2 border-toon-ink bg-toon-coral-light p-3 text-sm">
        <p className="font-toon text-sm font-bold text-toon-ink">
          Mặt khó của nghề
        </p>
        <p className="mt-1 text-toon-ink-soft">
          {downside ??
            (profile.isError
              ? 'Chưa tải được, xem trong hồ sơ nghề.'
              : 'Đang tải…')}
        </p>
      </div>

      <p className="mt-3 text-xs font-bold text-toon-ink-soft">
        Lộ trình {occ.levelCount} cấp ·{' '}
        {occ.my.highestCompleted
          ? `bạn đã xong cấp ${occ.my.highestCompleted}`
          : occ.my.currentLevel
            ? `bạn đang ở cấp ${occ.my.currentLevel}`
            : 'bạn chưa thử'}
      </p>

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
          to={`/occupations/${occ.code}`}
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
      </div>
    </aside>
  );
}

function OccupationList({
  items,
  total,
  suggested,
}: {
  items: CatalogueOccupation[];
  total: number;
  suggested: Set<string>;
}) {
  const sorted = [...items].sort(
    (a, b) =>
      Number(suggested.has(b.code)) - Number(suggested.has(a.code)) ||
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
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <p
        className="mx-auto max-w-7xl px-4 pt-4 text-xs font-semibold text-toon-star-soft sm:px-6"
        role="status"
      >
        {sorted.length}/{total} nghề
      </p>
      <p className="mx-auto max-w-7xl px-4 text-xs text-toon-star-soft sm:px-6">
        Hành tinh có vành là nghề đã có màn chơi.
      </p>
      <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {sorted.map((o) => (
          <li key={o.code} className="min-w-0">
            <Link
              to={`/occupations/${o.code}`}
              className={cn(
                'flex h-full min-w-0 gap-3 rounded-[18px] border-[3px] border-toon-night-deep bg-toon-paper p-4 text-toon-ink shadow-toon transition-transform motion-safe:hover:-translate-y-1',
                suggested.has(o.code) &&
                  'outline-2 outline-offset-2 outline-toon-star',
              )}
            >
              <CartoonPlanet
                seed={o.code}
                region={o.regionId}
                ring={o.playable}
                size={48}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-toon text-lg font-bold leading-snug">
                  {o.shortName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-toon-ink-soft">
                  {o.group}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {suggested.has(o.code) && (
                    <ToonBadge tone="mustard" icon={<Sparkles size={11} />}>
                      Gợi ý
                    </ToonBadge>
                  )}
                  {/* Đa số nghề chưa có màn chơi: trạng thái thường không gắn huy hiệu, chỉ nổi trạng thái khác thường. */}
                  {(o.playable ||
                    o.my.status !== 'NEW' ||
                    o.gate.kind === 'PREREQUISITE') &&
                    statusBadge(o)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Mô tả nghề trong khung xem nhanh: mở nguyên câu đầu, phần còn lại gập trong
 * "Mô tả nghề" (giữ nguyên văn, không chỉ cắt bằng CSS).
 */
function PeekSummary({ text }: { text: string }) {
  const full = text.trim();
  const first = full.match(/^.+?[.!?…](?=\s|$)/s)?.[0] ?? full;
  if (first.length >= full.length)
    return <p className="mt-4 text-sm text-toon-ink-soft">{full}</p>;
  return (
    <div className="mt-4 text-sm text-toon-ink-soft">
      <p>{first}</p>
      <details className="mt-1">
        <summary className="w-fit cursor-pointer rounded font-bold underline decoration-dotted underline-offset-4 focus-visible:shadow-toon-focus">
          Mô tả nghề
        </summary>
        <p className="mt-1.5">{full}</p>
      </details>
    </div>
  );
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
    <div className="absolute left-4 top-4 z-20 w-[min(22rem,calc(100%-2rem))] rounded-[18px] border-[3px] border-toon-night-deep bg-toon-paper p-2 text-toon-ink shadow-toon md:left-6">
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
                <RegionDot color={regionColor(o.regionId)} />
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

/** Bộ lọc gọn, bấm được và không có glow trên thanh công cụ nền đêm. */
function GalaxyChip({
  selected = false,
  children,
  icon,
  count,
  color,
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> & {
  selected?: boolean;
  icon?: ReactNode;
  count?: number;
  color?: string;
}) {
  return (
    <button
      {...rest}
      type="button"
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border-[2px] border-toon-night-deep px-3 font-toon text-[13px] font-bold shadow-toon-sm transition-transform motion-safe:hover:-translate-y-px',
        selected ? 'bg-toon-star text-toon-ink' : 'bg-toon-paper text-toon-ink',
      )}
    >
      {icon}
      {children}
      {count !== undefined && (
        <span
          className="rounded-full bg-toon-night-deep/10 px-1.5 font-toon-body text-xs tabular-nums"
          style={color ? { borderBottom: `2px solid ${color}` } : undefined}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function RegionDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full border border-toon-night-deep"
      style={{ width: size, height: size, backgroundColor: color }}
    />
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
      className="inline-flex gap-1 rounded-[16px] border-[3px] border-toon-night-deep bg-toon-night-deep p-1"
    >
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            'inline-flex min-h-8 items-center gap-1.5 rounded-[10px] px-3 font-toon text-sm font-bold',
            value === o.key
              ? 'bg-toon-star text-toon-ink'
              : 'text-toon-paper hover:bg-toon-night-soft',
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
