import { Callout } from '@datn/ui';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { caExtra } from '../../api/ca-extra';
import { caDemo } from '../../api/ca-extra.demo';
import {
  CaWorkspace,
  ResourceState,
  useCaResource,
} from '../../features/catalogue/CaWorkspace';
import {
  AgreementPanel,
  FlagsPanel,
  StatisticsPanels,
} from '../../features/monitor/MonitorPanels';

export function OccupationMonitorPage() {
  const { occupationId = '' } = useParams();
  const statisticsLoader = useCallback(
    () => caExtra.statistics(occupationId),
    [occupationId],
  );
  const agreementLoader = useCallback(
    () => caExtra.agreement(occupationId),
    [occupationId],
  );
  const statistics = useCaResource(statisticsLoader);
  const agreement = useCaResource(agreementLoader);
  const demo = statistics.result?.demo || agreement.result?.demo;
  return (
    <CaWorkspace
      code="C09"
      title="Giám sát nghề"
      description={`Nghề ${occupationId} · Độ phủ nội dung, lượt chơi, đánh giá và độ tin cậy của chấm điểm.`}
      demo={demo}
    >
      <ResourceState
        loading={statistics.loading}
        error={statistics.error}
        retry={statistics.reload}
      />
      {statistics.result && (
        <section className="space-y-5" aria-label="Thống kê lượt chơi">
          <StatisticsPanels data={statistics.result.data} />
        </section>
      )}
      <ResourceState
        loading={agreement.loading}
        error={agreement.error}
        retry={agreement.reload}
      />
      {agreement.result && <AgreementPanel data={agreement.result.data} />}
      {statistics.result?.demo ? (
        <FlagsPanel flags={caDemo.flags()} />
      ) : (
        <Callout title="Báo cáo nội dung">
          API /staff/flags hiện chỉ cấp quyền DOMAIN_EXPERT và chưa lọc theo
          nghề. CA xem số báo cáo theo scenario trong biểu đồ; danh sách chi
          tiết chờ hợp đồng phân quyền bổ sung.
        </Callout>
      )}
    </CaWorkspace>
  );
}
