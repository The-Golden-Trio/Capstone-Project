/**
 * Đảo một cấp nghề = sảnh của công ty nơi người chơi làm thử. Từ đây trở đi
 * là thế giới "Cartoon viền đen" (onboard, ca làm, nhìn lại, tổng kết); thanh
 * điều hướng của app vẫn giữ để quay về bản đồ ngân hà.
 */
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock3,
  Gift,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  Character,
  MEDAL,
  Medal,
  SceneBackdrop,
  ToonBadge,
  ToonButton,
  ToonPanel,
  ToonProgress,
  cn,
  toonButtonClasses,
} from '@datn/ui';
import { errorText, useIsland, useStartRun } from '../../api/hooks';
import type { KeywordRef } from '../../api/types';
import { TOON_BACKDROPS, TOON_CHARACTERS } from '../../lib/toon';

const STATUS = {
  NEW: { label: 'Chưa chơi', tone: 'paper' },
  IN_PROGRESS: { label: 'Đang chơi', tone: 'mustard' },
  DONE: { label: 'Đã hoàn thành', tone: 'mint' },
} as const;

/** Khung chung: nền giấy chấm phủ kín vùng nội dung của AppShell. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-toon toon-dots -mb-24 min-h-[calc(100dvh-4rem)] pb-24 md:-mb-10 md:pb-16">
      {children}
    </div>
  );
}

export default function IslandPage() {
  const { enrolmentId } = useParams();
  const island = useIsland(enrolmentId);
  const start = useStartRun();
  const navigate = useNavigate();
  if (island.isError)
    return (
      <Frame>
        <Notice
          title="Chưa cập bến được đảo này"
          text={errorText(island.error)}
        >
          <ToonButton onClick={() => void island.refetch()}>Thử lại</ToonButton>
        </Notice>
      </Frame>
    );
  if (!enrolmentId)
    return (
      <Frame>
        <Notice title="Chưa chọn đảo">
          <Link to="/galaxy" className={toonButtonClasses()}>
            Về bản đồ
          </Link>
        </Notice>
      </Frame>
    );
  if (!island.data)
    return (
      <Frame>
        <Notice title="Đang cập bến đảo…" loading />
      </Frame>
    );
  const data = island.data;
  const nextQuest =
    data.mainQuests.find((q) => q.status === 'IN_PROGRESS') ??
    data.mainQuests.find((q) => q.status === 'NEW') ??
    data.mainQuests[0];
  const launch = (taskId: string) =>
    start.mutate(
      { taskId, enrolmentId },
      { onSuccess: (run) => navigate(`/play/${run.runId}`) },
    );
  const total = data.progress.total;

  return (
    <Frame>
      <SceneBackdrop
        src={TOON_BACKDROPS.street}
        dim={0.55}
        focus="center 40%"
        className="border-b-[3px] border-toon-ink"
      >
        <div className="mx-auto flex max-w-6xl items-end gap-6 px-4 pt-6 sm:px-6">
          <div className="min-w-0 flex-1 pb-8">
            <Link
              to={`/occupations/${data.occupationCode}/levels?level=${data.level.levelNo}`}
              className="inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-toon-ink bg-toon-paper px-3 py-1 text-sm font-bold text-toon-ink shadow-toon-sm hover:-translate-y-px"
            >
              <ArrowLeft size={15} strokeWidth={2.8} /> Quần đảo{' '}
              {data.occupationName}
            </Link>
            <div className="toon-card relative mt-6 max-w-2xl p-5 pt-7 shadow-toon-lg sm:p-7 sm:pt-8">
              <span className="absolute -top-4 left-5 inline-flex -rotate-2 items-center gap-1.5 rounded-xl border-[3px] border-toon-ink bg-toon-mustard px-3 py-0.5 font-toon text-sm font-extrabold text-toon-ink shadow-toon-sm">
                Cấp {data.level.levelNo} · {data.company.name}
              </span>
              <h1 className="font-toon text-3xl font-extrabold leading-tight text-toon-ink sm:text-4xl">
                {data.level.title}
              </h1>
              <p className="mt-2 font-semibold leading-relaxed text-toon-ink-soft">
                {data.level.coreOutput ??
                  'Làm quen với đồng nghiệp, nhận nhiệm vụ và thử sức qua từng ca làm.'}
              </p>
              <div className="mt-4">
                {total === 0 ? (
                  <p className="text-sm font-bold text-toon-ink-soft">
                    Cấp này chưa có màn chính
                  </p>
                ) : (
                  <ToonProgress
                    value={data.progress.done}
                    max={total}
                    tone="mint"
                    label={`${data.progress.done}/${total} màn chính đã hoàn thành`}
                    showValue
                  />
                )}
              </div>
            </div>
          </div>
          <div className="pointer-events-none hidden h-[340px] shrink-0 self-end md:block">
            <Character
              src={TOON_CHARACTERS.relations.src}
              name="Đồng nghiệp nhân sự"
              height="100%"
              className="-mb-px"
            />
          </div>
        </div>
      </SceneBackdrop>

      <div className="mx-auto mt-8 grid max-w-6xl items-start gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-7">
          {!data.onboard.seen && (
            <div className="relative flex flex-col gap-4 rounded-[22px] border-[3px] border-toon-ink bg-[#ffe4a3] p-5 shadow-toon sm:flex-row sm:items-center">
              <span
                aria-hidden
                className="grid size-14 shrink-0 animate-toon-wiggle place-items-center rounded-2xl border-[3px] border-toon-ink bg-toon-paper"
              >
                <Sparkles size={26} strokeWidth={2.4} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-toon text-sm font-extrabold uppercase tracking-wide text-toon-ink-soft">
                  Trước ca làm đầu tiên
                </p>
                <h2 className="font-toon text-xl font-extrabold leading-tight text-toon-ink">
                  Ngày đầu nhận việc: xem 6 slide onboard
                </h2>
                <p className="mt-1 text-sm font-semibold text-toon-ink-soft">
                  Gặp đồng nghiệp, hiểu vai trò và nắm quy định ở nơi làm mới.
                  Không chấm điểm.
                </p>
              </div>
              <Link
                to={`/islands/${enrolmentId}/onboard`}
                className={toonButtonClasses({ size: 'lg' })}
              >
                Bắt đầu ngày đầu <ArrowRight size={17} strokeWidth={2.8} />
              </Link>
            </div>
          )}

          <section aria-labelledby="main-quests">
            <h2
              id="main-quests"
              className="font-toon text-2xl font-extrabold text-toon-ink"
            >
              Nhận ca làm
            </h2>
            <p className="mb-5 font-semibold text-toon-ink-soft">
              Mỗi màn là một tình huống trọn vẹn. Màn chơi cung cấp kiến thức
              cần để bạn xử lý công việc.
            </p>
            {!data.mainQuests.length ? (
              <div className="toon-card p-6 text-center">
                <p className="font-toon text-xl font-extrabold text-toon-ink">
                  Cấp này chưa có màn chơi được duyệt
                </p>
                <p className="mt-1 font-semibold text-toon-ink-soft">
                  Bạn vẫn có thể xem giới thiệu nơi làm và khám phá các cấp khác
                  trong lộ trình.
                </p>
                <Link
                  to={`/occupations/${data.occupationCode}/levels`}
                  className={toonButtonClasses({
                    variant: 'secondary',
                    className: 'mt-4',
                  })}
                >
                  Về lộ trình nghề <ArrowRight size={16} strokeWidth={2.8} />
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {data.mainQuests.map((q, i) => {
                  const next = q.taskId === nextQuest?.taskId;
                  const primary = data.onboard.seen && next;
                  return (
                    <article
                      key={q.taskId}
                      className={cn(
                        'relative overflow-hidden rounded-[22px] border-[3px] border-toon-ink bg-toon-paper shadow-toon',
                        next && 'shadow-toon-lg',
                      )}
                    >
                      {/* Cuống vé: số ca, như phiếu giao việc. */}
                      <div className="flex items-center justify-between gap-2 border-b-[3px] border-dashed border-toon-ink/50 bg-toon-cream px-5 py-2.5">
                        <span className="font-toon text-lg font-extrabold text-toon-ink">
                          Ca {i + 1}
                        </span>
                        <ToonBadge tone={STATUS[q.status].tone}>
                          {STATUS[q.status].label}
                        </ToonBadge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-toon text-xl font-extrabold leading-tight text-toon-ink">
                          {q.title}
                        </h3>
                        <p className="mt-2 font-semibold leading-relaxed text-toon-ink-soft">
                          {q.situation}
                        </p>
                        <p className="mt-3 flex gap-2 rounded-xl border-2 border-toon-ink bg-[#d6ecf7] px-3 py-2 text-sm font-semibold text-toon-ink">
                          <Target
                            size={16}
                            strokeWidth={2.6}
                            aria-hidden
                            className="mt-0.5 shrink-0"
                          />
                          <span>
                            <strong>Mục tiêu: </strong>
                            {q.goal}
                          </span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-toon-ink-soft">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={15} strokeWidth={2.6} aria-hidden />
                            Ca dài ~{q.minutes} phút trong truyện
                          </span>
                          {q.bestScore !== null && (
                            <ToonBadge tone="mustard">
                              Kết quả cao nhất: {q.bestScore}/100 điểm
                            </ToonBadge>
                          )}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-3">
                          {q.status === 'IN_PROGRESS' && q.runId ? (
                            <Link
                              to={`/play/${q.runId}`}
                              className={toonButtonClasses({
                                variant: primary ? 'primary' : 'secondary',
                              })}
                            >
                              <Play size={16} strokeWidth={2.8} />
                              Chơi tiếp
                            </Link>
                          ) : (
                            <ToonButton
                              variant={primary ? 'primary' : 'secondary'}
                              onClick={() => launch(q.taskId)}
                              disabled={start.isPending}
                              loading={
                                start.isPending &&
                                start.variables?.taskId === q.taskId
                              }
                              leftIcon={<Play size={16} strokeWidth={2.8} />}
                            >
                              {q.status === 'DONE' ? 'Chơi lại' : 'Nhận ca làm'}
                            </ToonButton>
                          )}
                          {q.status === 'DONE' && q.runId && (
                            <Link
                              to={`/play/${q.runId}/summary`}
                              className={toonButtonClasses({
                                variant: 'ghost',
                              })}
                            >
                              Xem tổng kết
                            </Link>
                          )}
                        </div>
                        {start.isError &&
                          start.variables?.taskId === q.taskId && (
                            <p
                              role="alert"
                              className="mt-4 rounded-xl border-[2.5px] border-toon-ink bg-toon-coral-light px-3 py-2 text-sm font-bold text-toon-ink"
                            >
                              {errorText(start.error)}
                            </p>
                          )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section aria-labelledby="side-quests">
            <h2
              id="side-quests"
              className="mb-4 font-toon text-2xl font-extrabold text-toon-ink"
            >
              Nhiệm vụ phụ
            </h2>
            {data.sideQuests.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {data.sideQuests.map((q) => (
                  <article
                    key={q.id}
                    className="rounded-2xl border-[2.5px] border-toon-ink bg-toon-paper p-4 shadow-toon-sm"
                  >
                    <ToonBadge tone={q.done ? 'mint' : 'paper'}>
                      {q.done ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </ToonBadge>
                    <h3 className="mt-2 font-toon text-lg font-extrabold text-toon-ink">
                      {q.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-toon-ink-soft">
                      {q.prompt}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border-[3px] border-dashed border-toon-ink/40 p-5 text-center font-semibold text-toon-ink-soft">
                Nhiệm vụ phụ sẽ mở sau. Hiện tại, bạn khám phá cấp nghề qua các
                ca làm chính.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6 lg:sticky lg:top-24">
          <ToonPanel
            title={data.company.name}
            icon={<Building2 size={20} strokeWidth={2.6} />}
            bodyClassName="p-4"
          >
            <ToonBadge tone="sky">{data.company.kind}</ToonBadge>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-toon-ink">
              {data.company.blurb}
            </p>
            <p className="mt-4 border-t-2 border-dashed border-toon-ink/30 pt-3 text-xs font-semibold leading-relaxed text-toon-ink-faint">
              Công ty hư cấu, được chọn ngẫu nhiên theo tỷ trọng loại hình trong
              ngành. Một số tỷ trọng còn là ước tính chờ kiểm chứng. Bối cảnh
              đổi, tiêu chí làm tốt vẫn giữ nguyên.
            </p>
            <Link
              to={`/islands/${enrolmentId}/onboard`}
              className={toonButtonClasses({
                variant: 'secondary',
                size: 'sm',
                className: 'mt-4',
              })}
            >
              Xem lại giới thiệu nơi làm
            </Link>
          </ToonPanel>
          <p className="flex gap-2.5 rounded-2xl border-[2.5px] border-toon-ink bg-toon-lilac p-4 text-sm font-semibold text-toon-ink shadow-toon-sm">
            <Sparkles
              size={18}
              strokeWidth={2.6}
              aria-hidden
              className="mt-0.5 shrink-0"
            />
            Lời dẫn và phần chấm trong ca làm có sử dụng AI. Kết quả giúp bạn
            nhìn lại cách xử lý tình huống.
          </p>
          <ToonPanel
            title="Xong cấp này bạn nhận…"
            icon={<Gift size={20} strokeWidth={2.6} />}
            bodyClassName="p-4"
          >
            <KeywordCards items={data.level.outputKeywords} />
            <p className="mt-3 text-xs font-semibold leading-relaxed text-toon-ink-faint">
              Ba mức: Làm quen · có hướng dẫn; Thành thạo · tự làm việc thường
              gặp; Chuyên sâu · xử lý việc khó và hướng dẫn người khác.
            </p>
            <Link
              to={`/occupations/${data.occupationCode}/levels?level=${data.level.levelNo + 1}`}
              className={toonButtonClasses({
                variant: 'secondary',
                size: 'sm',
                className: 'mt-4',
              })}
            >
              Khám phá cấp kế tiếp <ArrowRight size={15} strokeWidth={2.8} />
            </Link>
          </ToonPanel>
        </aside>
      </div>
    </Frame>
  );
}

/** Kỹ năng nghề nhận được, dạng thẻ bài nhỏ có huy hiệu mức. */
function KeywordCards({ items }: { items: KeywordRef[] }) {
  if (!items.length)
    return (
      <p className="text-sm font-semibold text-toon-ink-faint">
        Chưa có kỹ năng nghề được công bố.
      </p>
    );
  return (
    <ul className="grid gap-2">
      {items.map((k) => (
        <li
          key={k.id}
          className="flex items-center gap-3 rounded-xl border-2 border-toon-ink bg-toon-cream px-3 py-2"
        >
          <Medal
            level={k.level}
            size={30}
            label={`${k.name}: ${MEDAL[k.level].name}`}
          />
          <span className="min-w-0">
            <span className="block break-words text-sm font-bold text-toon-ink">
              {k.name}
            </span>
            <span className="block text-xs font-semibold text-toon-ink-faint">
              {MEDAL[k.level].name}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Notice({
  title,
  text,
  loading = false,
  children,
}: {
  title: string;
  text?: string;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center p-4">
      <div
        role={loading ? 'status' : undefined}
        className="toon-card w-full max-w-md p-6 text-center"
      >
        {loading && (
          <span
            aria-hidden
            className="mx-auto mb-3 block size-12 animate-spin rounded-full border-[5px] border-toon-ink border-t-toon-mustard"
          />
        )}
        <p className="font-toon text-2xl font-extrabold text-toon-ink">
          {title}
        </p>
        {text && (
          <p className="mt-2 font-semibold text-toon-ink-soft">{text}</p>
        )}
        {children && (
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
