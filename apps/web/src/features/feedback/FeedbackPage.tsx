import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageSquareHeart, Send } from 'lucide-react';
import {
  ToonButton,
  ToonField,
  ToonInput,
  ToonTextarea,
  toonButtonClasses,
  useToast,
} from '@datn/ui';
import {
  Notice,
  EmptyMessage,
  FormHeading,
  PaperCard,
} from '../profile/ProfileKit';
import { ProfileCanvas } from '../profile/ProfileKit';

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
    <ProfileCanvas narrow>
      <FormHeading
        eyebrow="Cùng xây JobQuest"
        title="Một lời nhắn từ bạn"
        description="Một chỗ khó hiểu, một lỗi nhỏ, hay một ý tưởng vừa nảy ra — tụi mình muốn nghe."
      />
      <PaperCard className="mt-6">
        {send.isSuccess ? (
          <EmptyMessage
            title="Lời nhắn đã đến nơi"
            description="Cảm ơn bạn đã giúp hành trình khám phá nghề dễ đi hơn."
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/galaxy" className={toonButtonClasses()}>
                  Về ngân hà
                </Link>
                <ToonButton
                  variant="ghost"
                  onClick={() => {
                    send.reset();
                    setMessage('');
                    setPage('');
                  }}
                >
                  Gửi lời nhắn khác
                </ToonButton>
              </div>
            }
          />
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <fieldset disabled={send.isPending} className="space-y-6">
              <MessageSquareHeart
                size={32}
                className="text-toon-maroon"
                aria-hidden
              />
              <fieldset className="min-w-0">
                <legend className="mb-3 font-toon font-bold">
                  Bạn muốn góp ý về điều gì?
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { key: 'bug', label: 'Lỗi' },
                      { key: 'idea', label: 'Ý tưởng' },
                      { key: 'content', label: 'Nội dung sai' },
                      { key: 'other', label: 'Khác' },
                    ] as const
                  ).map((option) => (
                    <label key={option.key} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="feedback-category"
                        value={option.key}
                        checked={category === option.key}
                        onChange={() => setCategory(option.key)}
                        className="peer sr-only"
                      />
                      <span className="flex min-h-11 items-center justify-center rounded-xl border-2 border-toon-ink bg-toon-cream px-3 font-toon font-bold peer-checked:bg-toon-star peer-checked:shadow-toon-sm peer-focus-visible:shadow-toon-focus">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <ToonField
                label="Lời nhắn của bạn"
                required
                counter={`${message.length.toLocaleString('vi-VN')} / 4.000`}
                hint="Nếu gặp lỗi, kể lại các bước và điều bạn mong đợi. Tránh gửi mật khẩu hay thông tin riêng tư."
              >
                <ToonTextarea
                  required
                  maxLength={4000}
                  rows={7}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Mình vừa thử…"
                />
              </ToonField>
              <ToonField label="Màn nào?" optional>
                <ToonInput
                  maxLength={250}
                  value={page}
                  onChange={(event) => setPage(event.target.value)}
                  placeholder="Ví dụ: bản đồ ngân hà"
                />
              </ToonField>
              {send.isError && (
                <Notice tone="danger">{errorText(send.error)}</Notice>
              )}
              <p className="text-xs text-toon-ink-soft">
                Phiên bản ứng dụng được đính kèm tự động để nhóm tìm đúng lỗi.
              </p>
              <ToonButton
                type="submit"
                block
                loading={send.isPending}
                loadingText="Đang gửi…"
                disabled={!message.trim()}
                leftIcon={<Send size={16} />}
              >
                Gửi góp ý
              </ToonButton>
            </fieldset>
          </form>
        )}
      </PaperCard>
    </ProfileCanvas>
  );
}
