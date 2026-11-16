import { useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { ArrowRight, Check, Circle, LockKeyhole } from 'lucide-react';
import { profile } from '@datn/game-core';
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  Island,
  LoadingBlock,
  Panel,
  PanelHeader,
  RadarChart,
  buttonClasses,
  cn,
  regionColor,
} from '@datn/ui';
import { errorText, useEnrol, useOccupation, useRecord } from '../../api/hooks';
import {
  firstDestination,
  formatYears,
  islandState,
  skillTiers,
} from './model';
import { KeywordLegend, Keywords, LoadError } from './Parts';

const accessLabels = {
  OPEN: 'Đã mở',
  ENROLLED: 'Đang khám phá',
  COMPLETED: 'Đã hoàn thành',
  LOCKED: 'Chưa mở',
};

export default function LevelsPage() {
  const { code } = useParams();
  const [params, setParams] = useSearchParams();
  const occupation = useOccupation(code);
  const record = useRecord();
  const enrol = useEnrol();
  const navigate = useNavigate();
  const [actionLevel, setActionLevel] = useState<number | null>(null);
  if (occupation.isError)
    return (
      <LoadError
        error={occupation.error}
        retry={() => void occupation.refetch()}
      />
    );
  if (!code) return <EmptyState title="Chưa chọn nghề" />;
  if (!occupation.data)
    return (
      <LoadingBlock text="Đang vẽ quần đảo nghề…" className="min-h-[60vh]" />
    );
  const o = occupation.data;
  const color = regionColor(o.regionId);
  const selected =
    o.levels.find((l) => String(l.levelNo) === params.get('level')) ??
    firstDestination(o.levels) ??
    o.levels[0];
  const tiers = record.data ? skillTiers(record.data.softSkills) : null;
  const enter = () => {
    if (!selected) return;
    if (selected.enrolmentId) {
      navigate(`/islands/${selected.enrolmentId}`);
      return;
    }
    setActionLevel(selected.levelNo);
    enrol.mutate(
      { code, levelNo: selected.levelNo },
      { onSuccess: (island) => navigate(`/islands/${island.enrolmentId}`) },
    );
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to={`/occupations/${code}`}
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← Hồ sơ {o.name}
      </Link>
      <header className="my-8">
        <p className="eyebrow">Quần đảo nghề</p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Một đảo, một bước tiến</h1>
        <p className="mt-3 text-ink-muted">
          {o.name} · Chọn một đảo để xem việc sẽ làm và điều kiện vào cấp.
        </p>
      </header>
      {!selected ? (
        <EmptyState
          title="Lộ trình đang được chuẩn bị"
          description="Chưa có cấp nghề được công bố."
        />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section
            aria-label="Các đảo trong lộ trình"
            className="relative min-w-0 overflow-hidden rounded-xl border border-line bg-night-800/20 p-4 sm:p-6"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-20 left-1/2 top-20 border-l-2 border-dashed border-line-strong lg:hidden"
            />
            <svg
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
              viewBox={`0 0 600 ${Math.max(1, Math.ceil(o.levels.length / 2)) * 260}`}
              preserveAspectRatio="none"
            >
              <path
                d={`M150 100 ${o.levels
                  .slice(1)
                  .map(
                    (_, i) =>
                      `Q${i % 2 ? 0 : 600} ${(i + 1) * 130 + 100} ${i % 2 ? 150 : 450} ${Math.floor((i + 1) / 2) * 260 + 100}`,
                  )
                  .join(' ')}`}
                stroke="currentColor"
                className="text-night-400"
                fill="none"
                strokeWidth="2"
                strokeDasharray="3 9"
              />
            </svg>
            <ol className="relative grid gap-5 lg:grid-cols-2 lg:gap-x-2 lg:gap-y-10">
              {o.levels.map((l, i) => (
                <li
                  key={l.levelNo}
                  className={cn(
                    'flex justify-center',
                    i % 2 === 1 && 'lg:translate-y-16',
                    i % 2 === 0
                      ? 'max-lg:-translate-x-6'
                      : 'max-lg:translate-x-6',
                  )}
                >
                  <button
                    type="button"
                    aria-pressed={selected.levelNo === l.levelNo}
                    aria-controls="level-details"
                    onClick={() => {
                      enrol.reset();
                      setParams(
                        { level: String(l.levelNo) },
                        { replace: true },
                      );
                    }}
                    className={cn(
                      'relative flex w-44 max-w-full flex-col items-center rounded-xl border p-3 text-center transition-colors focus-visible:outline-none focus-visible:shadow-focus',
                      selected.levelNo === l.levelNo
                        ? 'border-line-strong bg-night-800/90'
                        : 'border-transparent hover:bg-night-800/60',
                      l.access === 'ENROLLED' && 'shadow-glow',
                    )}
                  >
                    <Island
                      seed={`${code}-${l.levelNo}`}
                      title={l.title}
                      levelNo={l.levelNo}
                      state={islandState[l.access]}
                      color={color}
                      size={140}
                    />
                    <span className="text-xs text-ink-faint">
                      Cấp {l.levelNo} · {accessLabels[l.access]}
                    </span>
                    <span className="mt-1 text-sm font-semibold">
                      {l.title}
                    </span>
                    <span className="mt-1 text-xs text-ink-faint">
                      {formatYears(l.years, { short: true })}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="hidden h-16 lg:block" />
          </section>
          <Panel
            id="level-details"
            className="min-w-0 lg:sticky lg:top-24"
            aria-label={`Chi tiết cấp ${selected.levelNo}`}
          >
            <PanelHeader
              eyebrow={`Cấp ${selected.levelNo} · ${formatYears(selected.years, { short: true })}`}
              title={selected.title}
              description={selected.coreOutput ?? undefined}
            />
            <Badge
              tone={
                selected.access === 'ENROLLED' ||
                selected.access === 'COMPLETED'
                  ? 'gold'
                  : 'muted'
              }
            >
              {accessLabels[selected.access]}
            </Badge>
            <h3 className="mb-3 mt-6 text-lg">Việc bạn sẽ làm</h3>
            {selected.tasks.length ? (
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-muted">
                {selected.tasks.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-faint">Chưa có mô tả công việc.</p>
            )}
            <h3 className="mb-3 mt-6 text-lg">Nhóm kỹ năng trọng tâm</h3>
            <div className="flex flex-wrap gap-2">
              {selected.focus.map((id) => (
                <Badge key={id} tone="muted">
                  {profile.softSkillGroup(id).name}
                </Badge>
              ))}
            </div>
            <h3 className="mb-2 mt-6 text-lg">Điều kiện vào cấp</h3>
            {record.isError ? (
              <LoadError
                error={record.error}
                retry={() => void record.refetch()}
              />
            ) : !tiers ? (
              <LoadingBlock text="Đang đối chiếu hồ sơ kỹ năng…" />
            ) : (
              <>
                <ul className="space-y-3 text-sm">
                  {profile.SOFT_SKILL_GROUPS.filter(
                    ({ id }) => (selected.requirement[id] ?? 0) > 0,
                  ).map(({ id, name }) => {
                    const need = selected.requirement[id] ?? 0;
                    const met = tiers[id] >= need;
                    return (
                      <li key={id} className="flex gap-2">
                        <span aria-hidden>
                          {met ? (
                            <Check size={17} className="text-success" />
                          ) : (
                            <Circle size={17} className="text-ink-faint" />
                          )}
                        </span>
                        <span>
                          {name}: bậc {tiers[id]}/{need}{' '}
                          <span className="text-ink-faint">
                            · {met ? 'Đã đủ' : `Còn ${need - tiers[id]} bậc`}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {!Object.values(selected.requirement).some((v) => v > 0) && (
                  <p className="text-sm text-ink-muted">
                    Không yêu cầu bậc kỹ năng mềm.
                  </p>
                )}
                {Object.values(selected.requirement).some((v) => v > 0) && (
                  <RadarChart
                    axes={profile.SOFT_SKILL_GROUPS.map((s) => ({
                      key: s.id,
                      label: s.short,
                    }))}
                    values={tiers}
                    overlay={selected.requirement}
                    size={400}
                    label={`Kỹ năng của bạn và yêu cầu cấp ${selected.levelNo}`}
                  />
                )}
                {Object.values(selected.requirement).some((v) => v > 0) && (
                  <p className="-mt-3 mb-4 text-xs text-ink-faint">
                    Vùng vàng: bậc bạn đã đạt. Nét đứt: bậc cấp này cần.
                  </p>
                )}
              </>
            )}
            <h3 className="mb-3 mt-5 text-lg">Kỹ năng nghề đầu vào</h3>
            <Keywords
              items={selected.entryKeywords}
              empty="Không yêu cầu kỹ năng nghề đầu vào."
            />
            <h3 className="mb-3 mt-6 text-lg">Hoàn thành cấp này sẽ nhận</h3>
            <Keywords items={selected.outputKeywords} />
            <KeywordLegend />
            {selected.lockedReason && (
              <Callout
                className="mt-5"
                title={
                  <span className="flex items-center gap-2">
                    <LockKeyhole size={16} />
                    Điều kiện còn thiếu
                  </span>
                }
              >
                {selected.lockedReason}
              </Callout>
            )}
            {!o.playable || selected.questCount === 0 ? (
              <Callout className="mt-5">
                Cấp này chưa có màn chơi được xuất bản. Bạn vẫn có thể khám phá
                lộ trình.
              </Callout>
            ) : null}
            <Button
              className="mt-6 w-full"
              onClick={enter}
              disabled={
                selected.access === 'LOCKED' ||
                !o.playable ||
                selected.questCount === 0
              }
              aria-describedby={
                selected.access === 'LOCKED' ? 'level-locked-reason' : undefined
              }
              loading={enrol.isPending}
              rightIcon={<ArrowRight size={16} />}
            >
              {selected.access === 'LOCKED'
                ? 'Chưa mở cấp này'
                : selected.enrolmentId
                  ? 'Đến đảo'
                  : `Vào cấp ${selected.levelNo}`}
            </Button>
            {selected.access === 'LOCKED' && (
              <p
                id="level-locked-reason"
                className="mt-2 text-sm text-ink-faint"
              >
                {selected.lockedReason ??
                  'Hoàn thành cấp trước và kiểm tra các điều kiện đầu vào.'}
              </p>
            )}
            {enrol.isError && actionLevel === selected.levelNo && (
              <Callout tone="danger" className="mt-3">
                {errorText(enrol.error)}
              </Callout>
            )}
            <Link
              to={`/occupations/${code}`}
              className={buttonClasses({
                variant: 'ghost',
                block: true,
                className: 'mt-3',
              })}
            >
              Về hồ sơ nghề
            </Link>
          </Panel>
        </div>
      )}
    </div>
  );
}
