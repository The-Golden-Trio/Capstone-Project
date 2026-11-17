import { Badge, Callout, Panel, Stat } from '@datn/ui';
import { Link } from 'react-router-dom';

import type {
  AgreementReport,
  ContentFlag,
  OccupationStatistics,
} from '../../api/ca-extra';
import { formatDate, percent } from '../catalogue/format';

export function StatisticsPanels({ data }: { data: OccupationStatistics }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Lượt chơi" value={data.plays.toLocaleString('vi-VN')} />
        <Stat label="Hoàn thành" value={percent(data.completionRate)} />
        <Stat
          label="Task có scenario xuất bản"
          value={`${data.coverage.tasksWithPublishedScenario}/${data.coverage.tasksTotal}`}
        />
        <Stat
          label="Đồng thuận AI / chuyên gia"
          value={
            data.gradingAgreement === null
              ? 'Chưa đo'
              : data.gradingAgreement.toFixed(2)
          }
          hint="Cohen’s κ · NFR-14"
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel variant="solid">
          <h2 className="mb-4 font-display text-xl">
            Điểm trung bình theo scenario
          </h2>
          <ul className="space-y-4">
            {data.averageScoreByScenario.map((s) => (
              <li key={s.scenarioId}>
                <div className="mb-1 flex justify-between gap-3 text-sm">
                  <span>{s.title}</span>
                  <span className="tabular">
                    {s.average.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-sm bg-night-700">
                  <div
                    className="h-full bg-info/70"
                    style={{
                      width: `${Math.min(100, Math.max(0, s.average))}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {s.flags} báo cáo nội dung
                </p>
              </li>
            ))}
          </ul>
          {!data.averageScoreByScenario.length && (
            <p>Chưa có lượt chơi để thống kê.</p>
          )}
        </Panel>
        <Panel variant="solid">
          <h2 className="mb-4 font-display text-xl">Đánh giá nghề</h2>
          {data.ratings.withheld ? (
            <Callout title="Ẩn thống kê · NFR-06">
              Chưa đủ số người đánh giá tối thiểu. Không hiển thị số lượng hoặc
              điểm thành phần để bảo vệ nhóm nhỏ.
            </Callout>
          ) : (
            <>
              <p className="mb-3 text-sm">
                {data.ratings.responseCount} người đánh giá
              </p>
              <dl className="divide-y divide-line">
                {Object.entries(data.ratings.averages).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-4 py-2 text-sm"
                  >
                    <dt>{key}</dt>
                    <dd className="tabular">
                      {value.toLocaleString('vi-VN', {
                        maximumFractionDigits: 2,
                      })}
                      /5
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
export function AgreementPanel({ data }: { data: AgreementReport }) {
  return (
    <Panel variant="solid">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl">Ca cần chuyên gia kiểm tra lại</h2>
        <Badge tone="warning">{data.disagreements.length} bất đồng</Badge>
      </div>
      <p className="mb-4 text-xs text-ink-muted">
        FR-17 / NFR-14 · Cấu hình model phiên bản {data.modelConfigVersion}.
        Danh sách bằng chứng để DE rà soát, chưa phải kết luận chấm sai.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              {[
                'Scenario / activity',
                'Rubric',
                'Điểm DE',
                'Điểm AI',
                'Cần xem lại',
              ].map((text) => (
                <th scope="col" key={text} className="p-3">
                  {text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.disagreements.map((item, index) => (
              <tr
                key={`${item.referenceAnswerId}-${item.criterionId}-${index}`}
                className="border-t border-line"
              >
                <td className="p-3">
                  <Link
                    className="text-info hover:underline"
                    to={`/de/scenarios/${item.scenarioId}/review`}
                  >
                    {item.scenarioId}
                  </Link>
                  <p className="text-xs">{item.activityKey}</p>
                </td>
                <td className="p-3 font-mono text-xs">{item.criterionId}</td>
                <td className="p-3">{item.expertScore ?? 'Không áp dụng'}</td>
                <td className="p-3">{item.aiScore ?? 'Không áp dụng'}</td>
                <td className="p-3">
                  {item.expertCounterproductive !== item.aiCounterproductive
                    ? 'Bất đồng về phản tác dụng'
                    : 'Bất đồng điểm rubric'}
                  <p className="text-xs text-ink-muted">
                    Mẫu: {item.referenceAnswerId}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.disagreements.length && (
        <p className="text-sm text-ink-muted">
          Không có bất đồng trong báo cáo hiện tại.
        </p>
      )}
    </Panel>
  );
}
export function FlagsPanel({ flags }: { flags: ContentFlag[] }) {
  return (
    <Panel variant="solid">
      <h2 className="mb-4 font-display text-xl">Nội dung người chơi báo cáo</h2>
      <ul className="divide-y divide-line">
        {flags.map((flag) => (
          <li key={flag.id} className="py-3">
            <div className="flex flex-wrap gap-3">
              <Badge tone="warning">{flag.status}</Badge>
              <span className="text-xs text-ink-muted">
                {formatDate(flag.createdAt)} · {flag.scenarioId} /{' '}
                {flag.activityKey}
              </span>
            </div>
            <p className="mt-2 text-sm">{flag.reason}</p>
          </li>
        ))}
      </ul>
      {!flags.length && (
        <p className="text-sm text-ink-muted">
          Không có báo cáo trong các scenario được thống kê.
        </p>
      )}
    </Panel>
  );
}
