import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquareHeart, Send } from 'lucide-react';
import {
  Button,
  Callout,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Panel,
  RadioCards,
  Textarea,
  buttonClasses,
  useToast,
} from '@datn/ui';
import { api } from '../../api';
import { errorText } from '../../api/hooks';
import type { AppFeedbackInput } from '../../api/types';

export default function FeedbackPage() {
  const [category, setCategory] =
    useState<AppFeedbackInput['category']>('idea');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState('');
  const { toast } = useToast();
  const send = useMutation({
    mutationFn: (input: AppFeedbackInput) =>
      api.feedback.sendAppFeedback(input),
    onSuccess: () =>
      toast({ tone: 'success', title: 'Đã nhận góp ý của bạn. Cảm ơn bạn!' }),
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (message.trim())
      send.mutate({
        category,
        message: message.trim(),
        ...(page.trim() ? { page: page.trim() } : {}),
      });
  };
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <PageHeader
        eyebrow="Cùng xây JobQuest"
        title="Một lời nhắn từ bạn"
        description="Một chỗ khó hiểu, một lỗi nhỏ, hay một ý tưởng vừa nảy ra — tụi mình muốn nghe."
      />
      <Panel className="mt-6" padding="lg">
        {send.isSuccess ? (
          <EmptyState
            title="Lời nhắn đã đến nơi"
            description="Cảm ơn bạn đã giúp hành trình khám phá nghề dễ đi hơn."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/galaxy" className={buttonClasses()}>
                  Về ngân hà
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    send.reset();
                    setMessage('');
                    setPage('');
                  }}
                >
                  Gửi lời nhắn khác
                </Button>
              </div>
            }
          />
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <fieldset disabled={send.isPending} className="space-y-6">
              <MessageSquareHeart size={32} className="text-info" aria-hidden />
              <RadioCards
                name="feedback-category"
                label="Bạn muốn góp ý về điều gì?"
                columns={2}
                value={category}
                onChange={setCategory}
                options={[
                  { key: 'bug', label: 'Lỗi' },
                  { key: 'idea', label: 'Ý tưởng' },
                  { key: 'content', label: 'Nội dung sai' },
                  { key: 'other', label: 'Khác' },
                ]}
              />
              <Field
                label="Lời nhắn của bạn"
                required
                counter={`${message.length.toLocaleString('vi-VN')} / 4.000`}
                hint="Nếu gặp lỗi, kể lại các bước và điều bạn mong đợi. Tránh gửi mật khẩu hay thông tin riêng tư."
              >
                <Textarea
                  required
                  maxLength={4000}
                  rows={7}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Mình vừa thử…"
                />
              </Field>
              <Field label="Màn nào?" optional>
                <Input
                  maxLength={250}
                  value={page}
                  onChange={(event) => setPage(event.target.value)}
                  placeholder="Ví dụ: bản đồ ngân hà"
                />
              </Field>
              {send.isError && (
                <Callout tone="danger">{errorText(send.error)}</Callout>
              )}
              <p className="text-xs text-ink-faint">
                Phiên bản ứng dụng được đính kèm tự động để nhóm tìm đúng lỗi.
              </p>
              <Button
                type="submit"
                block
                loading={send.isPending}
                loadingText="Đang gửi…"
                disabled={!message.trim()}
                leftIcon={<Send size={16} />}
              >
                Gửi góp ý
              </Button>
            </fieldset>
          </form>
        )}
      </Panel>
    </div>
  );
}
