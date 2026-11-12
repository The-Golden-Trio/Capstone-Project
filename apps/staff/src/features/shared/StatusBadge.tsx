import type { ScenarioStatus } from '../../api/types';
import { Badge } from '../../components/ui';
import { STATUS_LABEL, STATUS_TONE } from '../../lib/labels';

export function StatusBadge({ status }: { status: ScenarioStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
