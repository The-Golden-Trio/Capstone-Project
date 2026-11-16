import { Link } from 'react-router-dom';
import { profile } from '@datn/game-core';
import {
  Badge,
  Button,
  Callout,
  DualBars,
  EmptyState,
  PageHeader,
  Panel,
  PanelHeader,
  Planet,
  Skeleton,
  buttonClasses,
  regionColor,
} from '@datn/ui';
import {
  errorText,
  useCatalogue,
  useOccupation,
  useQuizForm,
  useQuizResult,
} from '../../api/hooks';
import type { CareerSuggestion } from '../../api/types';

export default function QuizResultPage() {
  const result = useQuizResult();
  const form = useQuizForm();
  const catalogue = useCatalogue();
  if (result.isError)
    return (
      <EmptyState
        title="Chưa tải được bản nháp"
        description={errorText(result.error)}
        action={<Button onClick={() => void result.refetch()}>Thử lại</Button>}
      />
    );
  if (result.isPending)
    return (
      <div
        className="mx-auto max-w-5xl space-y-6 px-4 py-10"
        role="status"
        aria-label="Đang mở bản nháp"
      >
        <Skeleton className="h-12 w-2/3" />
        <Skeleton variant="rect" className="h-72" />
      </div>
    );
  if (!result.data)
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <h1 className="text-center text-3xl">Bản nháp về bạn</h1>
        <EmptyState
          title="Hành trình này chưa có bản nháp"
          description="18 thẻ về những việc bạn thích làm sẽ cho bạn vài điểm xuất phát."
          action={
            <Link to="/quiz" className={buttonClasses()}>
              Làm Get to know me
            </Link>
          }
        />
      </div>
    );
  const data = result.data;
  const top = [...profile.RIASEC_AXES]
    .sort((a, b) => data.selfReported[b] - data.selfReported[a])
    .slice(0, 2);
  const meanings = top.map((axis) =>
    profile.RIASEC_INFO[axis].meaning.replace(/^Thích (việc )?/, ''),
  );
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Get to know me · Tự kể lúc này"
        title="Bản nháp về bạn"
        description="Thẻ do nhóm tự viết, chưa được kiểm định. Đây là bản nháp để bắt đầu thử nghề, có thể thay đổi sau mỗi trải nghiệm."
        actions={
          <Link to="/galaxy" className={buttonClasses()}>
            Khám phá bản đồ →
          </Link>
        }
      />
      <Panel>
        <PanelHeader
          title="Những việc bạn thích"
          description="Thang 1–3: Không thích · Bình thường · Thích. Đây là lời bạn tự kể, chưa có dữ liệu sau khi thử."
        />
        <DualBars
          items={profile.RIASEC_AXES.map((axis) => ({
            key: axis,
            label: profile.RIASEC_INFO[axis].name,
            self: data.selfReported[axis],
            after: null,
            count: 0,
          }))}
        />
        <p className="mt-4 text-sm text-ink-muted">
          {data.flat
            ? 'Bạn chưa nghiêng rõ về hướng nào, thử vài kiểu khác nhau nhé'
            : `Bạn thích những việc như ${meanings.join('; và ')}.`}
        </p>
      </Panel>
      <section aria-labelledby="regions-title">
        <h2 id="regions-title" className="mb-4 text-2xl">
          Vùng nên thử trước
        </h2>
        {catalogue.isError ? (
          <Callout tone="warning">
            {errorText(catalogue.error)}{' '}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void catalogue.refetch()}
            >
              Tải lại vùng
            </Button>
          </Callout>
        ) : !catalogue.data ? (
          <Skeleton variant="rect" />
        ) : data.regions.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Chưa có vùng gợi ý. Bạn có thể chọn bất kỳ vùng nào trên bản đồ.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {data.regions.slice(0, 3).map((id) => {
              const region = catalogue.data.regions.find((r) => r.id === id);
              return region ? (
                <Link
                  key={id}
                  to={`/galaxy?vung=${id}`}
                  className="glass rounded-lg border-l-2 p-5 focus-visible:shadow-focus"
                  style={{ borderLeftColor: regionColor(id) }}
                >
                  <h3 className="text-xl">{region.name}</h3>
                  <p className="mt-3 text-sm text-ink-muted">{region.card}</p>
                  <span className="mt-4 block text-sm">Khám phá vùng →</span>
                </Link>
              ) : null;
            })}
          </div>
        )}
      </section>
      <section aria-labelledby="suggestions-title">
        <h2 id="suggestions-title" className="mb-2 text-2xl">
          Một vài nghề để bắt đầu
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          Đọc cả mặt khó của nghề, rồi tự chọn điều bạn muốn thử.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {data.suggestions.slice(0, 3).map((suggestion) => (
            <Suggestion key={suggestion.code} suggestion={suggestion} />
          ))}
        </div>
        {data.suggestions.length === 0 && (
          <p className="text-sm text-ink-muted">
            Chưa có gợi ý nghề. Bản đồ vẫn mở để bạn tự khám phá.
          </p>
        )}
      </section>
      <Panel>
        <PanelHeader title="Mục tiêu của bạn" />
        {form.isError ? (
          <Callout tone="warning">
            {errorText(form.error)}{' '}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void form.refetch()}
            >
              Tải lại mục tiêu
            </Button>
          </Callout>
        ) : !form.data ? (
          <Skeleton className="h-24" />
        ) : (
          <dl className="space-y-4">
            {form.data.goals.map((goal) => {
              const value = data.goals[goal.id];
              return (
                <div
                  key={goal.id}
                  className="grid gap-1 border-b border-line/60 pb-3 sm:grid-cols-[8rem_1fr]"
                >
                  <dt className="font-semibold">{goal.label}</dt>
                  <dd className="min-w-0 whitespace-pre-wrap break-words text-sm text-ink-muted">
                    {value?.picked.length
                      ? value.picked.join(' · ')
                      : 'Chưa kể'}
                    {value?.note && <p className="mt-1">“{value.note}”</p>}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
        {data.interests.length > 0 && (
          <p className="mt-4 text-sm text-ink-muted">
            Sở thích: {data.interests.join(' · ')}
          </p>
        )}
        <p className="mt-5 text-sm text-ink-faint">
          Chỉ để bạn tự nhìn lại, không chấm điểm và không dùng để gợi ý nghề.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            to="/profile?tab=tong-quan"
            className="rounded underline underline-offset-4 focus-visible:shadow-focus"
          >
            Sửa mục tiêu trong hành trang
          </Link>
          <Link
            to="/quiz"
            className="rounded underline underline-offset-4 focus-visible:shadow-focus"
          >
            Làm lại Get to know me
          </Link>
        </div>
      </Panel>
    </div>
  );
}

function Suggestion({ suggestion: s }: { suggestion: CareerSuggestion }) {
  const occupation = useOccupation(s.code);
  return (
    <Panel as="article" className="flex min-w-0 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Planet seed={s.code} color={regionColor(s.regionId)} size={52} />
        <div className="min-w-0">
          <h3 className="text-xl">{s.name}</h3>
          <p className="mt-1 text-xs text-ink-faint">{s.group}</p>
        </div>
      </div>
      <p className="text-sm text-ink-muted">{s.reason}</p>
      <div className="my-4 text-sm">
        <p className="font-semibold">Mặt khó của nghề</p>
        {occupation.isError ? (
          <p className="mt-1 text-ink-muted">
            {errorText(occupation.error)}{' '}
            <button
              className="underline"
              onClick={() => void occupation.refetch()}
            >
              Thử lại
            </button>
          </p>
        ) : !occupation.data ? (
          <Skeleton className="mt-2 h-12" />
        ) : occupation.data.downsides.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-ink-muted">
            {occupation.data.downsides.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-ink-faint">
            Chưa có thông tin mặt khó; hồ sơ nghề đang được bổ sung.
          </p>
        )}
      </div>
      {!s.playable && (
        <Badge
          className="mb-4 h-auto whitespace-normal py-1 leading-relaxed"
          tone="muted"
        >
          Chưa có màn chơi · Xem hồ sơ nghề
        </Badge>
      )}
      <Link
        to={`/occupations/${s.code}`}
        className={buttonClasses({
          variant: 'subtle',
          className: 'mt-auto w-full',
        })}
      >
        Xem hồ sơ nghề →
      </Link>
    </Panel>
  );
}
