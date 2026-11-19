import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profile } from '@datn/game-core';
import {
  Logo,
  NightSky,
  NightCard,
  StickerBadge,
  ToonButton,
  CartoonPlanet,
  toonButtonClasses,
  type ZodiacId,
} from '@datn/ui';
import {
  GraduationCap,
  School,
  Briefcase,
  ArrowLeftRight,
  Rocket,
} from 'lucide-react';
import { WelcomeStars } from './WelcomeStars';
import { api } from '../../api';
import { errorText, keys, useMe } from '../../api/hooks';
import type { LifeStage } from '../../api/types';
import { zodiacText } from './zodiacText';

export default function WelcomePage() {
  const me = useMe();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
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
  useEffect(() => {
    if (me.data) heading.current?.focus();
  }, [current, me.data?.id]);
  const steps = [
    ...(sign ? [{ key: 'stars', label: 'Chòm sao' }] : []),
    { key: 'stage', label: 'Giai đoạn' },
    { key: 'go', label: 'Khởi hành' },
  ];

  return (
    <div className="theme-toon-night relative isolate min-h-dvh px-4 py-8 sm:py-12">
      <NightSky scene="plain" seed="welcome" />
      <main className="relative mx-auto max-w-2xl">
        <Link
          to="/"
          aria-label="JobQuest, trang chủ"
          className="inline-flex rounded-lg"
        >
          <Logo size="md" />
        </Link>
        {me.isError ? (
          <NightCard className="mt-8">
            <h1 className="font-toon text-2xl font-bold">
              Chưa tải được thông tin của bạn
            </h1>
            <p className="mt-3">{errorText(me.error)}</p>
            <ToonButton className="mt-5" onClick={() => void me.refetch()}>
              Thử lại
            </ToonButton>
          </NightCard>
        ) : !me.data ? (
          <NightCard className="mt-8">
            <p role="status">Đang mở hành trình…</p>
          </NightCard>
        ) : (
          <>
            <ol
              aria-label="Các bước chào mừng"
              className="my-7 grid grid-flow-col auto-cols-fr gap-2"
            >
              {steps.map((item, i) => {
                const active = i === current - (sign ? 0 : 1);
                return (
                  <li
                    key={item.key}
                    aria-current={active ? 'step' : undefined}
                    className={`flex flex-col items-center gap-2 text-center font-toon text-sm font-bold ${active ? 'text-toon-star' : 'text-toon-paper'}`}
                  >
                    <span
                      className={`grid size-9 place-items-center rounded-full border-[3px] border-toon-night-deep shadow-toon-sm ${active ? 'bg-toon-star text-toon-ink' : 'bg-toon-night-soft'}`}
                    >
                      {i + 1}
                    </span>
                    {item.label}
                  </li>
                );
              })}
            </ol>
            <NightCard tone={current === 0 ? 'night' : 'paper'} tape>
              <p
                className={`text-xs font-bold ${current === 0 ? 'text-toon-star-soft' : 'text-toon-ink-soft'}`}
              >
                Chào {me.data.displayName}, mừng bạn đến JobQuest
              </p>
              {current === 0 && sign && text && (
                <>
                  <h1
                    ref={heading}
                    tabIndex={-1}
                    className="mt-4 font-toon text-xl font-bold focus:outline-none"
                  >
                    Chòm sao của bạn
                  </h1>
                  <WelcomeStars sign={sign.id as ZodiacId} />
                  <div className="text-center">
                    <h2 className="font-toon text-5xl font-extrabold text-toon-star">
                      {sign.name}
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed">
                      {text.personality.split(/(?<=\.)\s+/)[0]}
                    </p>
                  </div>
                  <ul className="my-4 grid grid-cols-2 gap-4">
                    {sign.buffs.map((id) => (
                      <li
                        key={id}
                        className="flex flex-col items-center text-center"
                      >
                        <StickerBadge
                          size={72}
                          label={`+12% điểm cộng cho ${profile.softSkillGroup(id).name}`}
                        >
                          +12%
                        </StickerBadge>
                        <p className="mt-1 text-sm font-bold">
                          {profile.softSkillGroup(id).name}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <p className="rounded-xl border-[3px] border-toon-night-deep bg-toon-night p-3 text-sm">
                    Đây là luật cộng điểm của game. Chòm sao không được dùng bởi
                    AI hay để gợi ý nghề.
                  </p>
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer rounded-lg py-2 font-bold text-toon-star">
                      Mặt cần để ý · Tìm hiểu thêm
                    </summary>
                    <p className="mt-2 text-sm">
                      {profile.ELEMENT_NAMES[sign.element]} ·{' '}
                      {profile.MODALITY_NAMES[sign.modality]}
                    </p>
                    <p className="mt-4 font-toon text-2xl font-bold">
                      “{text.motto}”
                    </p>
                    <p className="mt-3">{text.caution}</p>
                    {text.personality
                      .split(/(?<=\.)\s+/)
                      .slice(1)
                      .map((line) => (
                        <p key={line} className="mt-3">
                          {line}
                        </p>
                      ))}
                    <p className="mt-4 text-xs">
                      Theo chiêm tinh học phương Tây · cung Mặt Trời
                    </p>
                  </details>
                  <ToonButton className="mt-6" block onClick={() => setStep(1)}>
                    Tiếp tục
                  </ToonButton>
                </>
              )}
              {current === 1 && (
                <>
                  <h1
                    ref={heading}
                    tabIndex={-1}
                    className="mt-4 font-toon text-3xl font-extrabold focus:outline-none"
                  >
                    Bạn đang ở giai đoạn nào?
                  </h1>
                  <p className="my-4 text-sm text-toon-ink-soft">
                    Một chút thông tin để bắt đầu. Bạn có thể bỏ qua.
                  </p>
                  <fieldset>
                    <legend className="sr-only">Giai đoạn của bạn</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(
                        [
                          { key: 'hoc_sinh', label: 'Học sinh', icon: School },
                          {
                            key: 'sinh_vien',
                            label: 'Sinh viên',
                            icon: GraduationCap,
                          },
                          {
                            key: 'moi_di_lam',
                            label: 'Mới đi làm',
                            icon: Briefcase,
                          },
                          {
                            key: 'chuyen_nghe',
                            label: 'Muốn chuyển nghề',
                            icon: ArrowLeftRight,
                          },
                        ] as const
                      ).map(({ key, label, icon: Icon }) => (
                        <label key={key} className="relative cursor-pointer">
                          <input
                            type="radio"
                            name="stage"
                            value={key}
                            checked={(stage ?? me.data.stage) === key}
                            onChange={() => setStage(key)}
                            className="peer sr-only"
                          />
                          <span className="flex min-h-28 items-center gap-4 rounded-2xl border-[3px] border-toon-ink bg-toon-cream p-4 font-toon text-lg font-bold shadow-toon-sm peer-checked:bg-toon-star peer-focus-visible:shadow-toon-focus">
                            <Icon size={32} aria-hidden />
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {save.isError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border-[3px] border-toon-ink bg-toon-coral-light p-3 text-sm"
                    >
                      {errorText(save.error)}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ToonButton
                      loading={save.isPending}
                      disabled={!(stage ?? me.data.stage)}
                      onClick={() => {
                        const value = stage ?? me.data.stage;
                        if (value) save.mutate(value);
                      }}
                    >
                      Lưu và tiếp tục
                    </ToonButton>
                    <ToonButton
                      variant="ghost"
                      disabled={save.isPending}
                      onClick={() => setStep(2)}
                    >
                      Bỏ qua
                    </ToonButton>
                  </div>
                </>
              )}
              {current === 2 && (
                <>
                  <div aria-hidden className="relative mx-auto my-6 w-fit">
                    <CartoonPlanet size={120} seed="departure" />
                    <Rocket
                      size={44}
                      className="absolute -right-5 bottom-0 -rotate-12 text-toon-maroon"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h1
                    ref={heading}
                    tabIndex={-1}
                    className="font-toon text-3xl font-extrabold focus:outline-none"
                  >
                    Bạn đã biết muốn thử nghề nào chưa?
                  </h1>
                  <p className="mt-4 text-sm text-toon-ink-soft">
                    Chọn một điểm xuất phát. Bạn luôn có thể quay lại khám phá
                    hướng khác.
                  </p>
                  <Link
                    to="/quiz"
                    className={toonButtonClasses({
                      block: true,
                      className: 'mt-6',
                    })}
                  >
                    Chưa biết, gợi ý giúp mình →
                  </Link>
                  <p className="mt-3 text-center text-sm text-toon-ink-soft">
                    18 thẻ về những việc bạn thích làm.
                  </p>
                  <Link
                    to="/galaxy"
                    className="mt-5 block rounded-lg py-2 text-center font-bold underline underline-offset-4"
                  >
                    Biết rồi, vào bản đồ →
                  </Link>
                  <p className="mt-2 text-center text-sm text-toon-ink-soft">
                    Tự chọn một nghề, đọc cả những điều khó.
                  </p>
                </>
              )}
            </NightCard>
          </>
        )}
      </main>
    </div>
  );
}
