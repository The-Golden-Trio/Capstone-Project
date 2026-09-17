import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Note, SectionLabel, SourceNote } from '../components/ui/Note';
import { Logo } from '../components/layout/Logo';
import { StarField } from '../components/layout/StarField';
import { hasFit } from '../domain/fit';
import { useProfileStore } from '../store/profileStore';
import { useJourneyStore } from '../store/journeyStore';

export function SignupPage() {
  const navigate = useNavigate();
  const profile = useProfileStore();
  const clearJourney = useJourneyStore((s) => s.clear);
  const [name, setName] = useState('');

  const returning = Boolean(profile.name);

  const start = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    profile.signUp(trimmed);
    navigate('/quiz');
  };

  const restart = () => {
    profile.reset();
    clearJourney();
    setName('');
  };

  return (
    <>
      <StarField />
      <div className="relative z-1 grid min-h-screen place-items-center p-6">
        <Card className="w-full max-w-[420px]">
          <CardBody className="p-[30px]">
            <div className="mb-[22px] text-center">
              <Logo className="mx-auto mb-3.5 h-[88px] w-[88px] drop-shadow-[0_6px_22px_rgba(212,176,106,.3)]" />
              <SectionLabel className="text-center">
                Mô phỏng nghề IT · bản demo
              </SectionLabel>
              <h1 className="font-display text-[26px] font-semibold">
                {returning ? `Chào lại, ${profile.name}` : 'Vào Nghề'}
              </h1>
            </div>

            {returning ? (
              <>
                <Note tone="ok" className="mb-4">
                  Đã làm <b>{profile.eventsPlayed}</b> nhiệm vụ phụ
                  {Object.keys(profile.skill).length > 0 && (
                    <>
                      , có điểm kỹ năng ở{' '}
                      <b>{Object.keys(profile.skill).length}</b> nghề
                    </>
                  )}
                  . {profile.quizDone ? 'Đã tự vấn.' : 'Chưa tự vấn.'}
                </Note>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    onClick={() =>
                      navigate(
                        profile.quizDone || hasFit(profile.fit) ? '/' : '/quiz',
                      )
                    }
                  >
                    Tiếp tục hành trình
                  </Button>
                  <Button onClick={restart}>Bắt đầu lại từ đầu</Button>
                </div>
              </>
            ) : (
              <>
                <p className="m-0 mb-[18px] text-center text-[13.5px] leading-relaxed text-muted">
                  Đặt tên nhân vật để lưu hành trình. Không cần email thật.
                </p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && start()}
                  placeholder="Tên nhân vật của bạn"
                  maxLength={24}
                  autoComplete="off"
                  aria-label="Tên nhân vật"
                  className="mb-3 w-full rounded-lg border-[1.5px] border-line bg-inset px-3.5 py-3 text-[14px] text-ink focus:border-gold focus:outline-none"
                />
                <Button
                  variant="primary"
                  onClick={start}
                  disabled={!name.trim()}
                  className="w-full"
                >
                  Khởi hành
                </Button>
                <SourceNote className="mt-3.5 text-center">
                  Lưu bằng localStorage của trình duyệt, không gửi đi đâu cả.
                </SourceNote>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
