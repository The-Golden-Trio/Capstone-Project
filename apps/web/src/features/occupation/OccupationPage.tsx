import { useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, LockKeyhole, TriangleAlert } from 'lucide-react';
import {
  Badge,
  Button,
  Callout,
  EmptyState,
  Island,
  LoadingBlock,
  Panel,
  PanelHeader,
  Planet,
  ProgressBar,
  TabPanel,
  Tabs,
  buttonClasses,
  regionColor,
} from '@datn/ui';
import {
  errorText,
  useEnrol,
  useOccupation,
  useRatingForm,
  useRecord,
} from '../../api/hooks';
import { firstDestination, formatYears, islandState } from './model';
import {
  KeywordLegend,
  Keywords,
  LoadError,
  Ratings,
  RoleLinks,
} from './Parts';
import { PaySection } from './PaySection';

const sections = [
  ['tong-quan', 'Tổng quan'],
  ['mot-ngay', 'Một ngày'],
  ['mat-kho', 'Mặt khó'],
  ['lo-trinh', 'Lộ trình'],
  ['luong', 'Lương'],
  ['hoc-gi', 'Học gì'],
  ['danh-gia', 'Đánh giá'],
] as const;
const regions = {
  ky_thuat: 'Kỹ thuật',
  suc_khoe: 'Sức khoẻ',
  kinh_doanh: 'Kinh doanh',
  cong_nghe: 'Công nghệ',
  sang_tao: 'Sáng tạo',
  dich_vu: 'Dịch vụ',
};

export default function OccupationPage() {
  const { code } = useParams();
  const occupation = useOccupation(code);
  const record = useRecord();
  const rating = useRatingForm(code);
  const enrol = useEnrol();
  const navigate = useNavigate();
  const [dayLevel, setDayLevel] = useState('');
  const tabId = useId();
  if (occupation.isError)
    return (
      <LoadError
        error={occupation.error}
        retry={() => void occupation.refetch()}
      />
    );
  if (!code) return <EmptyState title="Chưa chọn nghề" />;
  if (!occupation.data)
    return <LoadingBlock text="Đang mở hồ sơ nghề…" className="min-h-[60vh]" />;
  const o = occupation.data;
  const color = regionColor(o.regionId);
  const destination = firstDestination(o.levels);
  const playing = record.data?.playing.find((r) => r.occupationCode === code);
  const activeLevel =
    o.levels.find((l) => String(l.levelNo) === dayLevel) ?? o.levels[0];
  const enter = () => {
    if (playing) {
      navigate(`/islands/${playing.enrolmentId}`);
      return;
    }
    if (destination?.enrolmentId) {
      navigate(`/islands/${destination.enrolmentId}`);
      return;
    }
    if (destination)
      enrol.mutate(
        { code, levelNo: destination.levelNo },
        { onSuccess: (island) => navigate(`/islands/${island.enrolmentId}`) },
      );
  };
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <Link to="/galaxy" className="text-sm text-ink-faint hover:text-ink">
        ← Bản đồ ngân hà
      </Link>
      <section id="tong-quan" className="scroll-mt-36 py-8">
        <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-start">
          <Planet
            seed={o.code}
            color={color}
            size={180}
            status={playing ? 'playing' : 'new'}
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">
              {regions[o.regionId]} · {o.group}
            </p>
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">
              {o.name}
            </h1>
            {o.nameEn && (
              <p className="mt-2 text-sm text-ink-faint">{o.nameEn}</p>
            )}
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
              {o.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={o.playable ? 'success' : 'muted'}>
                {o.playable ? 'Có màn chơi' : 'Chưa có màn chơi'}
              </Badge>
              <Badge tone="muted">{o.levels.length} cấp nghề</Badge>
              {o.gate.kind === 'PREREQUISITE' && (
                <Badge tone="muted" icon={<LockKeyhole size={12} />}>
                  Cần nghề đi trước
                </Badge>
              )}
            </div>
            <div className="mt-6">
              {o.playable &&
              (playing || (destination && destination.questCount > 0)) ? (
                <Button
                  size="lg"
                  loading={enrol.isPending}
                  onClick={enter}
                  rightIcon={<ArrowRight size={18} />}
                >
                  {playing
                    ? `Chơi tiếp cấp ${playing.levelNo}`
                    : destination?.access === 'ENROLLED'
                      ? `Chơi tiếp cấp ${destination.levelNo}`
                      : `Vào cấp ${destination?.levelNo}`}
                </Button>
              ) : (
                <Link
                  to={`/occupations/${code}/levels`}
                  className={buttonClasses({ size: 'lg' })}
                >
                  Xem lộ trình
                </Link>
              )}
            </div>
            {enrol.isError && (
              <Callout tone="danger" className="mt-3">
                {errorText(enrol.error)}
              </Callout>
            )}
          </div>
        </div>
        {record.isError && (
          <Callout className="mt-5" title="Chưa tải được tiến độ của bạn">
            {errorText(record.error)}{' '}
            <button className="underline" onClick={() => void record.refetch()}>
              Thử lại
            </button>
          </Callout>
        )}
      </section>
      <nav
        aria-label="Các phần hồ sơ nghề"
        className="sticky top-16 z-20 -mx-4 mb-8 flex gap-1 overflow-x-auto border-y border-line bg-night-900/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg"
      >
        {sections.map(([id, name]) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-night-800 hover:text-ink focus-visible:shadow-focus"
          >
            {name}
          </a>
        ))}
      </nav>
      <div className="space-y-6">
        <Panel id="mot-ngay" className="scroll-mt-36">
          <PanelHeader
            title="Một ngày làm việc"
            description="Cùng một nghề, công việc thay đổi khi bạn đi sâu hơn."
          />
          {activeLevel ? (
            <>
              <Tabs
                idBase={tabId}
                label="Công việc theo cấp"
                items={o.levels.map((l) => ({
                  key: String(l.levelNo),
                  label: `Cấp ${l.levelNo} · ${l.title}`,
                }))}
                value={String(activeLevel.levelNo)}
                onChange={setDayLevel}
                className="overflow-x-auto"
              />
              <TabPanel
                idBase={tabId}
                tabKey={String(activeLevel.levelNo)}
                active
                className="pt-5"
              >
                <p className="mb-3 text-xs text-ink-faint">
                  {formatYears(activeLevel.years)}
                </p>
                <TaskList items={activeLevel.tasks} />
              </TabPanel>
            </>
          ) : (
            <p className="text-sm text-ink-faint">
              Chưa có mô tả công việc theo cấp.
            </p>
          )}
        </Panel>
        <Panel
          id="mat-kho"
          className="scroll-mt-36 border-warning/40 bg-warning-deep/20"
          padding="lg"
        >
          <PanelHeader
            title={
              <span className="flex items-center gap-3">
                <TriangleAlert
                  size={24}
                  className="shrink-0 text-warning"
                  aria-hidden
                />
                Mặt khó của nghề
              </span>
            }
            description="Những điều cần biết trước khi bước vào một ca làm."
          />
          <TaskList
            items={o.downsides}
            empty="Chưa có thông tin mặt khó được công bố; hồ sơ nghề còn cần bổ sung phần này."
          />
        </Panel>
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Nhịp việc & nơi làm" />
            <TaskList items={o.workFacts} />
            <div className="mt-4 flex flex-wrap gap-2">
              {o.settings.map((s) => (
                <Badge key={s} tone="muted">
                  {s}
                </Badge>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelHeader
              title="Môi trường làm việc"
              description="Tỷ trọng loại hình nơi làm trong dữ liệu nghề."
            />
            {o.environments.length ? (
              <ul className="space-y-4">
                {o.environments.map((e) => (
                  <li key={e.name}>
                    <ProgressBar
                      label={e.name}
                      value={e.weight}
                      max={100}
                      showValue
                      color={color}
                      valueText={`${Math.round(e.weight)}%`}
                      size="sm"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-faint">
                Chưa có phân bố môi trường làm việc.
              </p>
            )}
          </Panel>
        </div>
        <Panel id="lo-trinh" className="scroll-mt-36">
          <PanelHeader
            title="Lộ trình qua các đảo"
            description="Mỗi đảo là một cấp nghề, với vai trò và phạm vi công việc riêng."
          />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {o.levels.map((l) => (
              <Link
                key={l.levelNo}
                to={`/occupations/${code}/levels?level=${l.levelNo}`}
                className="flex w-40 shrink-0 flex-col items-center rounded-lg p-2 text-center hover:bg-night-800 focus-visible:shadow-focus"
              >
                <Island
                  seed={`${code}-${l.levelNo}`}
                  levelNo={l.levelNo}
                  state={islandState[l.access]}
                  color={color}
                  size={140}
                  title={l.title}
                />
                <span className="text-sm font-semibold">{l.title}</span>
                <span className="mt-1 text-xs text-ink-faint">
                  {formatYears(l.years, { short: true })}
                </span>
              </Link>
            ))}
          </div>
          <Link
            to={`/occupations/${code}/levels`}
            className={buttonClasses({ variant: 'subtle', className: 'mt-3' })}
          >
            Xem điều kiện từng cấp <ArrowRight size={16} />
          </Link>
          {o.path.map((p, i) => (
            <div key={`${p.stage}-${i}`} className="mt-6">
              <h3 className="mb-3 text-lg">{p.label}</h3>
              <RoleLinks roles={p.roles} />
            </div>
          ))}
          {o.similar.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-lg">Khám phá nghề gần nhau</h3>
              <ul className="space-y-3">
                {o.similar.map((s) => (
                  <li key={s.code}>
                    <RoleLinks roles={[s]} />
                    <p className="mt-1 text-xs text-ink-faint">{s.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {o.gate.kind === 'PREREQUISITE' && (
            <div className="mt-6 rounded-lg border border-line p-4">
              <h3 className="mb-2 text-base">Nghề đi trước · {o.gate.band}</h3>
              <p className="mb-3 text-sm text-ink-muted">
                Hoàn thành cấp yêu cầu ở một nghề đi trước và đủ bậc kỹ năng để
                vào nghề này. Chi tiết nằm ở từng đảo.
              </p>
              <RoleLinks roles={o.gate.roles} />
            </div>
          )}
        </Panel>
        <PaySection pay={o.pay} />
        <Panel id="hoc-gi" className="scroll-mt-36">
          <PanelHeader title="Học gì để bắt đầu?" />
          {o.education.preparation && (
            <p className="mb-4 text-sm leading-relaxed text-ink-muted">
              {o.education.preparation}
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-lg">Ngành học đại học</h3>
              <TaskList items={o.education.university} />
            </div>
            <div>
              <h3 className="mb-2 text-lg">Học nghề</h3>
              <TaskList items={o.education.vocational} />
            </div>
          </div>
          {o.education.licence && (
            <p className="mt-4 rounded-lg bg-night-900/60 p-4 text-sm text-ink-muted">
              <strong className="text-ink">Chứng chỉ / giấy phép: </strong>
              {o.education.licence}
            </p>
          )}
          {o.education.note && (
            <p className="mt-4 text-sm text-ink-faint">{o.education.note}</p>
          )}
        </Panel>
        <Panel>
          <PanelHeader title="Kỹ năng nghề sẽ gặp" />
          <Keywords items={o.keywords} />
          <KeywordLegend />
        </Panel>
        <Panel id="danh-gia" className="scroll-mt-36">
          <PanelHeader title="Đánh giá của người đã đi hết nghề" />
          {o.ratings.withheld ? (
            <Ratings summary={o.ratings} criteria={[]} />
          ) : rating.isError ? (
            <LoadError
              error={rating.error}
              retry={() => void rating.refetch()}
            />
          ) : !rating.data ? (
            <LoadingBlock text="Đang tải tiêu chí đánh giá…" />
          ) : (
            <Ratings summary={o.ratings} criteria={rating.data.criteria} />
          )}
          <Link
            to={`/occupations/${code}/rate`}
            className={buttonClasses({ variant: 'subtle', className: 'mt-5' })}
          >
            Chia sẻ trải nghiệm nghề
          </Link>
        </Panel>
      </div>
      <footer className="mt-8 space-y-2 border-t border-line pt-5 text-xs leading-relaxed text-ink-faint">
        {o.attribution.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </footer>
    </div>
  );
}

function TaskList({
  items,
  empty = 'Chưa có thông tin được công bố.',
}: {
  items: string[];
  empty?: string;
}) {
  return items.length ? (
    <ul className="space-y-3 text-sm leading-relaxed text-ink-muted">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden
            className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-50"
          />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-ink-faint">{empty}</p>
  );
}
