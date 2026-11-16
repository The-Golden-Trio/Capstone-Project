/**
 * Câu "thích tới đâu" sau ca (khối B): một màn, tối đa 2–3 chạm, mỗi chạm
 * nhắc lại một việc đã làm; hỏi TRƯỚC khi hiện điểm và kết cục để làm tốt
 * hay dở không kéo theo thích hay ghét. Câu "giống thực tế không" tách
 * riêng. Không ghi tên trục, không hiện biểu đồ, bỏ qua được.
 */
import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  LikeScale,
  LoadingBlock,
  Mountains,
  RadioCards,
  Sparkle,
  StarField,
  type LikeValue,
} from '@datn/ui';
import { errorText, useReflect, useRunSummary } from '../../api/hooks';

const REALISM = [
  { key: '1', label: 'Chưa giống lắm' },
  { key: '2', label: 'Khá giống' },
  { key: '3', label: 'Rất giống' },
] as const;

export default function ReflectPage() {
  const { runId = '' } = useParams();
  const summary = useRunSummary(runId);
  const reflect = useReflect(runId);
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, LikeValue>>({});
  const [realism, setRealism] = useState<'1' | '2' | '3' | null>(null);
  const toSummary = () => navigate(`/play/${runId}/summary`, { replace: true });

  if (summary.isLoading)
    return <LoadingBlock text="Đang khép ca…" className="min-h-dvh" />;
  const prompts = summary.data?.reflection.prompts ?? [];
  if (
    !summary.data ||
    summary.data.reflection.answered ||
    prompts.length === 0
  ) {
    return <Navigate to={`/play/${runId}/summary`} replace />;
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 pb-48 pt-12">
      <StarField seed={`reflect-${runId}`} />
      <div className="relative z-10 mx-auto max-w-xl animate-rise">
        <Sparkle size={20} className="mx-auto text-gold-300" />
        <h1 className="mt-4 text-center text-3xl">Trước khi xem kết quả</h1>
        <p className="mt-3 text-center text-ink-muted">
          Nếu ngày nào đi làm cũng là việc như vậy, bạn thấy thế nào? Không có
          đáp án đúng sai.
        </p>

        <ol className="mt-8 flex flex-col gap-5">
          {prompts.map((p, i) => (
            <li key={p.key} className="glass rounded-xl p-5">
              <p className="mb-3 text-[15px] text-ink">
                <span className="mr-2 font-wordmark text-xs text-gold-400">
                  0{i + 1}
                </span>
                {p.recap}
              </p>
              <LikeScale
                label={p.recap}
                value={answers[p.key] ?? null}
                onChange={(v) => setAnswers((a) => ({ ...a, [p.key]: v }))}
              />
            </li>
          ))}
        </ol>

        <section className="mt-8" aria-labelledby="realism">
          <h2
            id="realism"
            className="font-sans text-sm font-semibold text-ink-muted"
          >
            Riêng màn chơi này: có giống công việc thật không?
          </h2>
          <RadioCards
            className="mt-3"
            name="realism"
            label="Màn chơi có giống thực tế không"
            columns={3}
            value={realism}
            onChange={setRealism}
            options={REALISM.map((r) => ({ key: r.key, label: r.label }))}
          />
        </section>

        {reflect.isError && (
          <p className="mt-4 text-sm text-danger" role="alert">
            {errorText(reflect.error)}
          </p>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={toSummary}>
            Bỏ qua
          </Button>
          <Button
            size="lg"
            loading={reflect.isPending}
            disabled={Object.keys(answers).length === 0 && !realism}
            onClick={() =>
              reflect.mutate(
                { answers, realism: realism ? Number(realism) : null },
                { onSuccess: toSummary },
              )
            }
          >
            Xem kết quả ca làm
          </Button>
        </div>
      </div>
      <Mountains tone="dawn" className="absolute inset-x-0 bottom-0 h-48" />
    </div>
  );
}
