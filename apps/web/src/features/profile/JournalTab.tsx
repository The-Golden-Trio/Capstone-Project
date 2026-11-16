import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profile } from '@datn/game-core';
import {
  Badge,
  Button,
  Callout,
  ConfirmDialog,
  EmptyState,
  Panel,
  PanelHeader,
  Timeline,
  useToast,
} from '@datn/ui';
import { api } from '../../api';
import { errorText, keys } from '../../api/hooks';
import { RunPath } from './RunPath';
import type { PlayerRecord } from '../../api/types';

export function JournalTab({ record }: { record: PlayerRecord }) {
  const [confirm, setConfirm] = useState(false);
  const location = useLocation();
  const qc = useQueryClient();

  useEffect(() => {
    if (location.hash === '#quyen-rieng-tu') {
      document
        .getElementById('quyen-rieng-tu')
        ?.scrollIntoView({ block: 'start' });
    }
  }, [location.hash]);
  const { toast } = useToast();
  const remove = useMutation({
    mutationFn: () => api.quiz.deleteAboutMe(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.record });
      void qc.invalidateQueries({ queryKey: keys.quizResult });
      setConfirm(false);
      toast({ tone: 'success', title: 'Đã xoá phần kể về bạn' });
    },
  });
  return (
    <div className="space-y-6">
      <Panel padding="lg">
        <PanelHeader
          title="Nhật ký những lần thử"
          description="Xem lại lựa chọn, kết quả và điều bạn đã luyện."
        />
        {record.journal.length ? (
          <Timeline
            items={[...record.journal]
              .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
              .map((entry) => ({
                time: (
                  <span>
                    {new Date(entry.date).toLocaleDateString('vi-VN')} ·{' '}
                    <RunPath runId={entry.runId} path={entry.path} />
                  </span>
                ),
                title: (
                  <Link
                    className="underline underline-offset-4"
                    to={`/play/${entry.runId}/summary`}
                  >
                    #{entry.index} · {entry.title}
                  </Link>
                ),
                body: (
                  <div>
                    <p className="mb-2">
                      {entry.score === null
                        ? 'Chưa có điểm'
                        : `Điểm ca: ${entry.score}/100`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.deltas.map((delta) => (
                        <Badge
                          key={delta.id}
                          tone={delta.delta < 0 ? 'danger' : 'neutral'}
                        >
                          {profile.softSkillGroup(delta.id).short}{' '}
                          {delta.delta < 0 ? '−' : '+'}
                          {Math.abs(delta.delta).toLocaleString('vi-VN')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ),
              }))}
          />
        ) : (
          <EmptyState
            title="Nhật ký còn để ngỏ"
            description="Ca làm đầu tiên sẽ mở trang đầu tiên."
          />
        )}
      </Panel>
      <Panel id="quyen-rieng-tu" padding="lg" className="scroll-mt-24">
        <PanelHeader
          title="Chuyện của bạn, quyền của bạn"
          description="Bạn có thể rút đồng ý và xoá sở thích, mục tiêu cùng phần tự kể. Lịch sử chơi được giữ riêng để lưu tiến độ."
        />
        <Button variant="danger" onClick={() => setConfirm(true)}>
          Xoá phần kể về bạn
        </Button>
      </Panel>
      <ConfirmDialog
        open={confirm}
        onClose={() => {
          if (!remove.isPending) setConfirm(false);
        }}
        title="Xoá phần kể về bạn?"
        description="Sở thích, mục tiêu và phần kể thêm sẽ bị xoá. Thao tác này không thể hoàn tác."
        tone="danger"
        confirmLabel="Xoá phần kể về bạn"
        loading={remove.isPending}
        onConfirm={() => remove.mutate()}
      >
        {remove.isError && (
          <Callout tone="danger">{errorText(remove.error)}</Callout>
        )}
      </ConfirmDialog>
    </div>
  );
}
