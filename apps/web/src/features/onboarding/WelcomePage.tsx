import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profile } from '@datn/game-core';
import {
  Button,
  Callout,
  EmptyState,
  LoadingBlock,
  Logo,
  Mountains,
  Panel,
  RadioCards,
  StarField,
  Stepper,
  ZodiacConstellation,
  type ZodiacId,
} from '@datn/ui';
import { api } from '../../api';
import { errorText, keys, useMe } from '../../api/hooks';
import type { LifeStage } from '../../api/types';
import { zodiacText } from './zodiacText';

export default function WelcomePage() {
  const me = useMe();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [stage, setStage] = useState<LifeStage | null>(null);
  const save = useMutation({
    mutationFn: (value: LifeStage) => api.account.updateMe({ stage: value }),
    onSuccess: (value) => {
      qc.setQueryData(keys.me, value);
      setStep(2);
    },
  });
  const sign = profile.zodiacOf(me.data?.dateOfBirth);
  const current = !sign && step === 0 ? 1 : step;
  const text = sign ? zodiacText[sign.id] : undefined;
  const steps = [
    ...(sign ? [{ key: 'stars', label: 'Chòm sao' }] : []),
    { key: 'stage', label: 'Giai đoạn' },
    { key: 'go', label: 'Khởi hành' },
  ];

  return (
    <div className="relative isolate min-h-dvh overflow-hidden px-4 py-8 pb-40">
      <StarField fixed seed="welcome" />
      <Mountains className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48" />
      <main className="mx-auto max-w-2xl">
        <Logo size="sm" />
        {me.isError ? (
          <EmptyState
            title="Chưa tải được thông tin của bạn"
            description={errorText(me.error)}
            action={<Button onClick={() => void me.refetch()}>Thử lại</Button>}
          />
        ) : !me.data ? (
          <LoadingBlock text="Đang mở hành trình…" />
        ) : (
          <>
            <Stepper
              className="my-8"
              items={steps}
              current={current - (sign ? 0 : 1)}
            />
            <Panel padding="lg" frame>
              <p className="eyebrow">
                Chào {me.data.displayName}, mừng bạn đến JobQuest
              </p>
              {current === 0 && sign && text && (
                <>
                  <h1 className="mt-3 text-3xl sm:text-4xl">
                    Chòm sao của bạn
                  </h1>
                  <div className="my-5 flex flex-wrap items-center justify-center gap-5">
                    <ZodiacConstellation
                      sign={sign.id as ZodiacId}
                      size={160}
                    />
                    <div>
                      <h2 className="text-3xl">{sign.name}</h2>
                      <p className="mt-2 text-ink-muted">
                        {profile.ELEMENT_NAMES[sign.element]} ·{' '}
                        {profile.MODALITY_NAMES[sign.modality]}
                      </p>
                      <p className="mt-3 font-display text-xl">
                        “{text.motto}”
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    {text.personality}
                  </p>
                  <details className="mt-3 text-sm text-ink-muted">
                    <summary className="cursor-pointer">Mặt cần để ý</summary>
                    <p className="mt-2">{text.caution}</p>
                  </details>
                  <p className="mt-4 text-xs text-ink-faint">
                    Theo chiêm tinh học phương Tây · cung Mặt Trời
                  </p>
                  <ul className="my-5 space-y-2 text-sm text-gold-200">
                    {sign.buffs.map((id) => (
                      <li key={id}>
                        +12% điểm cộng cho {profile.softSkillGroup(id).name}
                      </li>
                    ))}
                  </ul>
                  <Callout>
                    Đây là luật của game, chỉ cộng thêm điểm khi chơi. Chòm sao
                    không được dùng bởi AI hay để gợi ý nghề.
                  </Callout>
                  <Button className="mt-6" block onClick={() => setStep(1)}>
                    Tiếp tục
                  </Button>
                </>
              )}
              {current === 1 && (
                <>
                  <h1 className="mt-3 text-3xl sm:text-4xl">
                    Bạn đang ở giai đoạn nào?
                  </h1>
                  <p className="my-4 text-ink-muted">
                    Một chút thông tin để bắt đầu. Bạn có thể bỏ qua.
                  </p>
                  <RadioCards<LifeStage>
                    name="stage"
                    label="Giai đoạn của bạn"
                    value={stage ?? me.data.stage}
                    onChange={setStage}
                    options={[
                      { key: 'hoc_sinh', label: 'Học sinh' },
                      { key: 'sinh_vien', label: 'Sinh viên' },
                      { key: 'moi_di_lam', label: 'Mới đi làm' },
                      { key: 'chuyen_nghe', label: 'Muốn chuyển nghề' },
                    ]}
                  />
                  {save.isError && (
                    <Callout className="mt-4" tone="danger">
                      {errorText(save.error)}
                    </Callout>
                  )}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button
                      loading={save.isPending}
                      disabled={!(stage ?? me.data.stage)}
                      onClick={() => {
                        const value = stage ?? me.data.stage;
                        if (value) save.mutate(value);
                      }}
                    >
                      Lưu và tiếp tục
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={save.isPending}
                      onClick={() => setStep(2)}
                    >
                      Bỏ qua
                    </Button>
                  </div>
                </>
              )}
              {current === 2 && (
                <>
                  <h1 className="mt-3 text-3xl sm:text-4xl">
                    Bạn đã biết muốn thử nghề nào chưa?
                  </h1>
                  <p className="mt-4 text-ink-muted">
                    Chọn một điểm xuất phát. Bạn luôn có thể quay lại khám phá
                    hướng khác.
                  </p>
                  <div className="mt-7 grid gap-4">
                    <Link
                      to="/quiz"
                      className="rounded-lg border border-line-gold bg-gold-900/25 p-5 focus-visible:shadow-focus"
                    >
                      <span className="block text-lg font-semibold text-gold-200">
                        Chưa biết, gợi ý giúp mình →
                      </span>
                      <span className="mt-2 block text-sm text-ink-muted">
                        18 thẻ về những việc bạn thích làm.
                      </span>
                    </Link>
                    <Link
                      to="/galaxy"
                      className="glass rounded-lg p-5 focus-visible:shadow-focus"
                    >
                      <span className="block text-lg font-semibold">
                        Biết rồi, vào bản đồ →
                      </span>
                      <span className="mt-2 block text-sm text-ink-muted">
                        Tự chọn một nghề và đọc cả những điều khó của nghề.
                      </span>
                    </Link>
                  </div>
                </>
              )}
            </Panel>
          </>
        )}
      </main>
    </div>
  );
}
