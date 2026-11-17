import { Badge } from '@datn/ui';
import type { ScenarioStatus } from '../../api/types';

import { STATUS_LABEL, STATUS_TONE } from '../../lib/labels';

export function StatusBadge({ status }: { status: ScenarioStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}
