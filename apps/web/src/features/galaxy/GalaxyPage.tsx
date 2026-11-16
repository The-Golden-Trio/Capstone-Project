import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
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
  Badge,
  Button,
  Chip,
  ColorDot,
  EmptyState,
  IconButton,
  Input,
  LoadingBlock,
  Planet,
  SegmentedControl,
  buttonClasses,
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
    <div className="relative flex h-[calc(100dvh-4rem-4rem)] flex-col md:h-[calc(100dvh-4rem)]">
      <h1 className="sr-only">Bản đồ ngân hà nghề nghiệp</h1>
      {/* Thanh công cụ */}
      <div className="relative z-10 border-b border-line/60 bg-night-900/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 basis-60">
            <label htmlFor="galaxy-search" className="visually-hidden">
              Tìm nghề
            </label>
            <Input
              id="galaxy-search"
              leftIcon={<Search size={16} />}
              placeholder="Tìm trong 221 nghề, ví dụ: điều dưỡng, back-end, đầu bếp"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) focusOn(matches[0].code);
              }}
              className="h-10"
            />
          </div>
          <SegmentedControl
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
          <Chip selected={region === null} onClick={() => setRegion(null)}>
            Tất cả vùng
          </Chip>
          {catalogue.data.regions.map((r) => (
            <Chip
              key={r.id}
              selected={region === r.id}
              color={regionColor(r.id)}
              count={counts[r.id]}
              icon={
                <ColorDot color={regionColor(r.id)} glow={region === r.id} />
              }
              onClick={() => setRegion(region === r.id ? null : r.id)}
            >
              {r.name}
            </Chip>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden />
          <Chip
            selected={playableOnly}
            onClick={() => setPlayableOnly((v) => !v)}
            icon={<Play size={12} />}
          >
            Có màn chơi
          </Chip>
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
            <IconButton
              variant="subtle"
              label="Phóng to"
              icon={<Plus size={18} />}
              onClick={() => mapRef.current?.zoomBy(1.4)}
            />
            <IconButton
              variant="subtle"
              label="Thu nhỏ"
              icon={<Minus size={18} />}
              onClick={() => mapRef.current?.zoomBy(0.7)}
            />
            <IconButton
              variant="subtle"
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
                className="glass pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-semibold text-gold-200 shadow-lift sm:hidden"
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
                    className="glass pointer-events-auto flex items-center gap-3 rounded-lg p-3 shadow-lift transition-colors hover:border-line-gold"
                  >
                    <Planet
                      seed={continueRow.occupationCode}
                      color={regionColor(continueRow.regionId)}
                      size={44}
                      status="playing"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block">Chơi tiếp</span>
                      <span className="block truncate text-sm font-semibold">
                        {continueRow.occupationName}
                      </span>
                      <span className="block text-xs text-ink-faint">
                        Cấp {continueRow.levelNo} · {continueRow.done}/
                        {continueRow.total} màn
                      </span>
                    </span>
                    <ArrowRight size={18} className="text-gold-300" />
                  </Link>
                )}
                {sourceOf('play') === 'demo' && (
                  <div className="glass pointer-events-auto rounded-lg border-warning/30 p-4 shadow-lift">
                    <p className="text-sm font-semibold text-ink">
                      Xem trước một ca làm mẫu
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Dữ liệu hiện có đúng một ca đã soạn: Back-end cấp L3, sự
                      cố API chậm. Ở bản xem thử, bạn vào thẳng ca này, không
                      tính vào tiến độ. Lời nhân vật là AI giả.
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
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
                    </Button>
                  </div>
                )}
                {!me.data?.quizDone && !quiz.data && (
                  <div className="glass pointer-events-auto rounded-lg p-4 shadow-lift">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gold-200">
                      <Sparkles size={16} aria-hidden /> Chưa biết bắt đầu từ
                      đâu?
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      18 thẻ, khoảng ba phút. Game gợi ý vài vùng nghề nên thử
                      trước.
                    </p>
                    <Link
                      to="/quiz"
                      className={buttonClasses({
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

          {filtering && (
            <p
              className="absolute bottom-4 right-4 z-10 rounded-full bg-night-900/80 px-3 py-1.5 text-xs text-ink-muted md:right-6"
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
  if (o.my.status === 'COMPLETED') return <Badge tone="gold">Đã đi hết</Badge>;
  if (o.my.status === 'PLAYING')
    return <Badge tone="gold">Đang chơi · cấp {o.my.currentLevel}</Badge>;
  if (o.gate.kind === 'PREREQUISITE')
    return (
      <Badge tone="muted" icon={<Lock size={11} />}>
        Cần nghề đi trước
      </Badge>
    );
  return o.playable ? (
    <Badge tone="success">Có màn chơi</Badge>
  ) : (
    <Badge tone="muted">Chưa có màn chơi</Badge>
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
      className="glass absolute inset-x-0 bottom-0 z-20 max-h-[70%] animate-rise overflow-y-auto rounded-t-xl p-5 shadow-lift sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-4 sm:max-h-[calc(100%-2rem)] sm:w-[23rem] sm:rounded-xl"
    >
      <IconButton
        label="Đóng"
        icon={<X size={18} />}
        size="sm"
        className="absolute right-3 top-3"
        onClick={onClose}
      />
      <div className="flex items-center gap-4 pr-8">
        <Planet
          seed={occ.code}
          color={regionColor(occ.regionId)}
          size={76}
          status={
            locked
              ? 'locked'
              : occ.my.status === 'PLAYING'
                ? 'playing'
                : occ.my.status === 'COMPLETED'
                  ? 'completed'
                  : 'new'
          }
        />
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <ColorDot color={regionColor(occ.regionId)} size={7} /> {occ.group}
          </p>
          <h2 className="mt-1 text-xl leading-tight">{occ.shortName}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">{statusBadge(occ)}</div>
        </div>
      </div>

      {suggestedReason && (
        <p className="mt-4 flex gap-2 rounded-md border border-line-gold bg-gold-900/30 p-3 text-sm text-gold-100">
          <Sparkles size={16} className="mt-0.5 shrink-0" aria-hidden />{' '}
          {suggestedReason}
        </p>
      )}

      <p className="mt-4 line-clamp-5 text-sm text-ink-muted">{occ.summary}</p>

      <div className="mt-4 rounded-md border border-warning/30 bg-warning-deep/25 p-3 text-sm">
        <p className="text-xs font-semibold text-warning">Mặt khó của nghề</p>
        <p className="mt-1 text-ink-muted">
          {downside ??
            (profile.isError
              ? 'Chưa tải được, xem trong hồ sơ nghề.'
              : 'Đang tải…')}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-night-950/40 p-3">
          <dt className="text-xs text-ink-faint">Lộ trình</dt>
          <dd className="font-semibold">{occ.levelCount} cấp</dd>
        </div>
        <div className="rounded-md bg-night-950/40 p-3">
          <dt className="text-xs text-ink-faint">Của bạn</dt>
          <dd className="font-semibold">
            {occ.my.highestCompleted
              ? `Xong cấp ${occ.my.highestCompleted}`
              : occ.my.currentLevel
                ? `Đang ở cấp ${occ.my.currentLevel}`
                : 'Chưa thử'}
          </dd>
        </div>
      </dl>

      {locked && occ.gate.kind === 'PREREQUISITE' && (
        <p className="mt-4 text-xs text-ink-muted">
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
        <p className="mt-3 text-sm text-danger" role="alert">
          {enterError}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2">
        {occ.my.status === 'NEW' && occ.playable && !locked && (
          <Button
            block
            onClick={onEnter}
            loading={entering}
            leftIcon={<Play size={16} />}
          >
            Vào cấp đầu tiên
          </Button>
        )}
        <Link
          to={`/occupations/${occ.code}`}
          className={buttonClasses({
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
        className="mx-auto max-w-7xl px-4 pt-4 text-xs text-ink-faint sm:px-6"
        role="status"
      >
        {sorted.length}/{total} nghề
      </p>
      <ul className="mx-auto grid max-w-7xl gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {sorted.map((o) => (
          <li key={o.code}>
            <Link
              to={`/occupations/${o.code}`}
              className={cn(
                'glass flex h-full gap-3 rounded-lg p-4 transition-colors hover:border-line-gold',
                suggested.has(o.code) && 'border-line-gold',
              )}
            >
              <Planet
                seed={o.code}
                color={regionColor(o.regionId)}
                size={48}
                status={
                  o.my.status === 'PLAYING'
                    ? 'playing'
                    : o.my.status === 'COMPLETED'
                      ? 'completed'
                      : o.gate.kind === 'PREREQUISITE'
                        ? 'locked'
                        : 'new'
                }
              />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold leading-snug">
                  {o.shortName}
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-faint">
                  {o.group}
                </span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {suggested.has(o.code) && (
                    <Badge tone="gold" icon={<Sparkles size={11} />}>
                      Gợi ý
                    </Badge>
                  )}
                  {statusBadge(o)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
