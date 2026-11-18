import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profile } from '@datn/game-core';
import { ToonBadge, ToonButton, ConfirmDialog, useToast } from '@datn/ui';
import {
  Notice,
  EmptyMessage,
  PaperCard,
  CardHeading,
  RecordTimeline,
} from './ProfileKit';

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
      <PaperCard>
        <CardHeading
          title="Nhật ký những lần thử"
          description="Xem lại các ca."
        />
        {record.journal.length ? (
          <RecordTimeline
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
                    {entry.deltas.length > 0 && (
                      <details>
                        <summary className="w-fit cursor-pointer rounded text-xs font-bold underline decoration-dotted underline-offset-4 focus-visible:shadow-toon-focus">
                          Kỹ năng thay đổi ({entry.deltas.length})
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.deltas.map((delta) => (
                            <ToonBadge
                              key={delta.id}
                              tone={delta.delta < 0 ? 'coral' : 'paper'}
                            >
                              {profile.softSkillGroup(delta.id).short}{' '}
                              {delta.delta < 0 ? '−' : '+'}
                              {Math.abs(delta.delta).toLocaleString('vi-VN')}
                            </ToonBadge>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ),
              }))}
          />
        ) : (
          <EmptyMessage
            title="Nhật ký còn để ngỏ"
            description="Ca làm đầu tiên sẽ mở trang đầu tiên."
          />
        )}
      </PaperCard>
      <PaperCard id="quyen-rieng-tu" className="scroll-mt-24">
        <CardHeading
          title="Chuyện của bạn, quyền của bạn"
          description="Bạn có thể rút đồng ý và xoá sở thích, mục tiêu cùng phần tự kể. Lịch sử chơi được giữ riêng để lưu tiến độ."
        />
        <ToonButton variant="danger" onClick={() => setConfirm(true)}>
          Xoá phần kể về bạn
        </ToonButton>
      </PaperCard>
      <ConfirmDialog
        theme="toon"
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
          <Notice tone="danger">{errorText(remove.error)}</Notice>
        )}
      </ConfirmDialog>
    </div>
  );
}
