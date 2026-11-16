import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Building2, Clock3, Play } from 'lucide-react';
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  Island,
  LoadingBlock,
  Panel,
  PanelHeader,
  SegmentedProgress,
  buttonClasses,
  regionColor,
} from '@datn/ui';
import { errorText, useIsland, useStartRun } from '../../api/hooks';
import { islandState } from '../occupation/model';
import { KeywordLegend, Keywords, LoadError } from '../occupation/Parts';

const statusLabels = {
  NEW: 'Chưa chơi',
  IN_PROGRESS: 'Đang chơi',
  DONE: 'Đã hoàn thành',
};

export default function IslandPage() {
  const { enrolmentId } = useParams();
  const island = useIsland(enrolmentId);
  const start = useStartRun();
  const navigate = useNavigate();
  if (island.isError)
    return (
      <LoadError error={island.error} retry={() => void island.refetch()} />
    );
  if (!enrolmentId) return <EmptyState title="Chưa chọn đảo" />;
  if (!island.data)
    return <LoadingBlock text="Đang cập bến đảo…" className="min-h-[60vh]" />;
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
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link
        to={`/occupations/${data.occupationCode}/levels?level=${data.level.levelNo}`}
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← Quần đảo {data.occupationName}
      </Link>
      <header className="flex flex-col items-center gap-5 py-8 sm:flex-row">
        <Island
          seed={`${data.occupationCode}-${data.level.levelNo}`}
          levelNo={data.level.levelNo}
          title={data.level.title}
          state={islandState[data.level.access]}
          color={regionColor(data.regionId)}
          size={220}
        />
        <div className="min-w-0">
          <p className="eyebrow">
            {data.occupationName} · Cấp {data.level.levelNo}
          </p>
          <h1 className="mt-2 text-4xl leading-tight sm:text-5xl">
            {data.level.title}
          </h1>
          <p className="mt-3 text-ink-muted">
            {data.level.coreOutput ??
              'Làm quen với đồng nghiệp, nhận nhiệm vụ và thử sức qua từng ca làm.'}
          </p>
          <p className="mt-4 text-sm text-gold-200">
            {data.progress.total === 0
              ? 'Cấp này chưa có màn chính'
              : `${data.progress.done}/${data.progress.total} màn chính đã hoàn thành`}
          </p>
          <SegmentedProgress
            className="mt-3 max-w-md"
            done={data.progress.done}
            total={data.progress.total}
            label="Tiến độ cấp nghề"
          />
        </div>
      </header>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {!data.onboard.seen && (
            <Panel frame glow padding="lg">
              <PanelHeader
                eyebrow="Trước ca làm đầu tiên"
                title="Ngày đầu nhận việc: xem 6 slide onboard"
                description="Gặp đồng nghiệp, hiểu vai trò và nắm quy định ở nơi làm mới. Không chấm điểm."
              />
              <Link
                to={`/islands/${enrolmentId}/onboard`}
                className={buttonClasses()}
              >
                Bắt đầu ngày đầu <ArrowRight size={16} />
              </Link>
            </Panel>
          )}
          <section aria-labelledby="main-quests">
            <h2 id="main-quests" className="mb-2 text-2xl">
              Nhận ca làm
            </h2>
            <p className="mb-5 text-sm text-ink-muted">
              Mỗi màn là một tình huống trọn vẹn. Màn chơi cung cấp kiến thức
              cần để bạn xử lý công việc.
            </p>
            {!data.mainQuests.length ? (
              <EmptyState
                title="Cấp này chưa có màn chơi được duyệt"
                description="Bạn vẫn có thể xem giới thiệu nơi làm và khám phá các cấp khác trong lộ trình."
                action={
                  <Link
                    to={`/occupations/${data.occupationCode}/levels`}
                    className={buttonClasses({ variant: 'subtle' })}
                  >
                    Về lộ trình nghề <ArrowRight size={16} />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {data.mainQuests.map((q, i) => (
                  <Panel
                    as="article"
                    key={q.taskId}
                    className={
                      q.taskId === nextQuest?.taskId ? 'border-line-strong' : ''
                    }
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="eyebrow">Ca {i + 1}</span>
                      <Badge
                        tone={
                          q.status === 'DONE'
                            ? 'success'
                            : q.status === 'IN_PROGRESS'
                              ? 'gold'
                              : 'muted'
                        }
                      >
                        {statusLabels[q.status]}
                      </Badge>
                    </div>
                    <h3 className="text-xl">{q.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                      {q.situation}
                    </p>
                    <p className="mt-3 text-sm">
                      <strong>Mục tiêu: </strong>
                      <span className="text-ink-muted">{q.goal}</span>
                    </p>
                    <p className="mt-4 flex items-center gap-2 text-xs text-ink-faint">
                      <Clock3 size={14} aria-hidden />
                      Ca dài ~{q.minutes} phút trong truyện
                    </p>
                    {q.bestScore !== null && (
                      <p className="mt-3 text-sm text-gold-200">
                        Kết quả cao nhất: {q.bestScore}/100 điểm
                      </p>
                    )}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {q.status === 'IN_PROGRESS' && q.runId ? (
                        <Link
                          to={`/play/${q.runId}`}
                          className={buttonClasses({
                            variant:
                              data.onboard.seen &&
                              q.taskId === nextQuest?.taskId
                                ? 'primary'
                                : 'subtle',
                          })}
                        >
                          <Play size={15} />
                          Chơi tiếp
                        </Link>
                      ) : (
                        <Button
                          variant={
                            data.onboard.seen && q.taskId === nextQuest?.taskId
                              ? 'primary'
                              : 'subtle'
                          }
                          onClick={() => launch(q.taskId)}
                          disabled={start.isPending}
                          loading={
                            start.isPending &&
                            start.variables?.taskId === q.taskId
                          }
                          leftIcon={<Play size={15} />}
                        >
                          {q.status === 'DONE' ? 'Chơi lại' : 'Nhận ca làm'}
                        </Button>
                      )}
                      {q.status === 'DONE' && q.runId && (
                        <Link
                          to={`/play/${q.runId}/summary`}
                          className={buttonClasses({ variant: 'ghost' })}
                        >
                          Xem tổng kết
                        </Link>
                      )}
                    </div>
                    {start.isError && start.variables?.taskId === q.taskId && (
                      <Callout tone="danger" className="mt-4">
                        {errorText(start.error)}
                      </Callout>
                    )}
                  </Panel>
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="side-quests">
            <h2 id="side-quests" className="mb-4 text-2xl">
              Nhiệm vụ phụ
            </h2>
            {data.sideQuests.length ? (
              <div className="space-y-3">
                {data.sideQuests.map((q) => (
                  <Panel key={q.id} as="article">
                    <Badge tone={q.done ? 'success' : 'muted'}>
                      {q.done ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
                    </Badge>
                    <h3 className="mt-3 text-lg">{q.title}</h3>
                    <p className="mt-2 text-sm text-ink-muted">{q.prompt}</p>
                  </Panel>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nhiệm vụ phụ sẽ mở sau"
                description="Hiện tại, bạn khám phá cấp nghề qua các ca làm chính."
              />
            )}
          </section>
        </div>
        <aside className="min-w-0 space-y-5 lg:sticky lg:top-24">
          <Panel>
            <PanelHeader
              title={
                <span className="flex items-center gap-2">
                  <Building2 size={19} aria-hidden />
                  {data.company.name}
                </span>
              }
              description={data.company.kind}
            />
            <p className="text-sm leading-relaxed text-ink-muted">
              {data.company.blurb}
            </p>
            <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-ink-faint">
              Công ty hư cấu, được chọn ngẫu nhiên theo tỷ trọng loại hình trong
              ngành. Một số tỷ trọng còn là ước tính chờ kiểm chứng. Bối cảnh
              đổi, tiêu chí làm tốt vẫn giữ nguyên.
            </p>
            <Link
              to={`/islands/${enrolmentId}/onboard`}
              className={buttonClasses({ variant: 'ghost', className: 'mt-4' })}
            >
              Xem lại giới thiệu nơi làm
            </Link>
          </Panel>
          <Callout tone="ai">
            Lời dẫn và phần chấm trong ca làm có sử dụng AI. Kết quả giúp bạn
            nhìn lại cách xử lý tình huống.
          </Callout>
          <Panel>
            <PanelHeader title="Xong cấp này bạn nhận…" />
            <Keywords items={data.level.outputKeywords} />
            <KeywordLegend />
            <Link
              to={`/occupations/${data.occupationCode}/levels?level=${data.level.levelNo + 1}`}
              className={buttonClasses({
                variant: 'subtle',
                className: 'mt-5',
              })}
            >
              Khám phá cấp kế tiếp <ArrowRight size={15} />
            </Link>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
