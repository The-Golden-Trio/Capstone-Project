import { useState, type FormEvent } from 'react';
import { feedbackApi } from '../api/endpoints';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Note, SourceNote } from '../components/ui/Note';

const MAX = 4000;

/** E16 "App feedback" (FR-20, AD-01g): góp ý về app, lưu kèm thời điểm và phiên bản. */
export function AppFeedbackPage() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    feedbackApi
      .sendAppFeedback(text.trim())
      .then(() => {
        setSent(true);
        setText('');
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Không gửi được góp ý'),
      )
      .finally(() => setBusy(false));
  };

  return (
    <>
      <PageHeader title="Góp ý về app">
        Gặp lỗi, thấy chỗ khó dùng hay có ý tưởng? Viết cho nhóm phát triển. Góp
        ý được lưu kèm thời điểm và phiên bản app để nhóm dễ tìm lại.
      </PageHeader>

      {sent && (
        <Note tone="ok" className="mb-4">
          Cảm ơn bạn! Nhóm đã nhận được góp ý.
        </Note>
      )}
      {error && (
        <Note tone="warn" className="mb-4">
          {error}
        </Note>
      )}

      <Card>
        <CardBody>
          <form onSubmit={submit}>
            <label htmlFor="app-feedback" className="mb-3 block">
              <span className="kicker mb-1.5 block text-[10px] text-ink-2">
                Nội dung góp ý
              </span>
              <textarea
                id="app-feedback"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setSent(false);
                }}
                maxLength={MAX}
                rows={6}
                className="field-input resize-y leading-relaxed"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={busy || !text.trim()}
              >
                Gửi góp ý
              </Button>
              <SourceNote className="m-0">
                {text.length}/{MAX} ký tự
              </SourceNote>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
