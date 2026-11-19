import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profile } from '@datn/game-core';
import { ToonButton, ConfirmDialog, useToast, regionColor } from '@datn/ui';
import {
  Notice,
  Foldout,
  EmptyMessage,
  PaperCard,
  CardHeading,
} from './ProfileKit';

import { api } from '../../api';
import { errorText, keys } from '../../api/hooks';
import { useRecordContext } from './useRecordContext';
import { RunPath } from './RunPath';
import type { PlayerRecord } from '../../api/types';

export function JournalTab({ record }: { record: PlayerRecord }) {
  const context = useRecordContext(record);
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
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
      <PaperCard>
        <CardHeading title="Nhật ký" />
        {record.journal.length ? (
          <ol className="space-y-5">
            {[...record.journal]
              .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
              .map((entry) => {
                const occupation = context.journal(entry.runId);
                return (
                  <li
                    key={entry.runId}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 sm:grid-cols-[6rem_minmax(0,1fr)]"
                  >
                    <time
                      dateTime={entry.date}
                      className="pt-1 text-xs text-toon-ink-soft"
                    >
                      {new Date(entry.date).toLocaleDateString('vi-VN')}
                    </time>
                    <div className="relative min-w-0 border-l-2 border-toon-ink pl-4 pb-3">
                      <span
                        aria-hidden
                        className="absolute -left-[7px] top-1 size-3 rounded-full border-2 border-toon-ink"
                        style={{
                          backgroundColor: occupation
                            ? regionColor(occupation.regionId)
                            : '#b6aa97',
                        }}
                      />
                      <p className="mb-1 text-xs text-toon-ink-soft">
                        <RunPath runId={entry.runId} path={entry.path} />
                      </p>
                      <h3 className="font-toon font-bold">
                        <Link
                          className="underline underline-offset-4"
                          to={`/play/${entry.runId}/summary`}
                        >
                          #{entry.index} · {entry.title}
                        </Link>
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold">
                          {entry.score === null
                            ? 'Chưa có điểm'
                            : `Điểm ca: ${entry.score}/100`}
                        </span>
                        {entry.deltas.map((delta) => (
                          <span
                            key={delta.id}
                            className="rounded border border-current px-2 py-1 font-bold"
                            style={{
                              color:
                                delta.delta < 0
                                  ? '#9b2638'
                                  : delta.delta > 0
                                    ? '#246044'
                                    : '#4a433c',
                            }}
                          >
                            {profile.softSkillGroup(delta.id).short}{' '}
                            {delta.delta < 0 ? '−' : '+'}
                            {Math.abs(delta.delta).toLocaleString('vi-VN')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
          </ol>
        ) : (
          <EmptyMessage
            title="Nhật ký còn để ngỏ"
            description="Ca làm đầu tiên sẽ mở trang đầu tiên."
          />
        )}
      </PaperCard>
      <PaperCard>
        <CardHeading title="Riêng tư" />
        <Foldout
          id="quyen-rieng-tu"
          title="Quản lý tự kể"
          open={location.hash === '#quyen-rieng-tu' || undefined}
          className="scroll-mt-24"
        >
          <p className="mb-4 text-sm text-toon-ink-soft">
            Bạn có thể rút đồng ý và xoá sở thích, mục tiêu cùng phần tự kể.
            Lịch sử chơi được giữ riêng để lưu tiến độ.
          </p>
          <ToonButton variant="danger" onClick={() => setConfirm(true)}>
            Xoá phần kể về bạn
          </ToonButton>
        </Foldout>
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
