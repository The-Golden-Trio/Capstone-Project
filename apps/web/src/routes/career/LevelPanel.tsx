import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UNLOCK_AT,
  eventsForRole,
  findScenario,
  formatVnd,
  type Role,
} from '@datn/game-core';
import type { BandProgress, RoleProgress } from '../../api/schemas';
import { profileApi } from '../../api/endpoints';
import { Crest } from '../../components/game/Crest';
import { Button } from '../../components/ui/Button';
import { Note, SourceNote } from '../../components/ui/Note';
import { Pill } from '../../components/ui/Pill';
import { cx } from '../../lib/cx';

/**
 * Bảng thông tin một chặng, mở ra khi bấm vào nút trên con đường.
 *
 * Đây là chỗ trả lời "vào đây thì gặp gì" trước khi người chơi cam kết: đồng
 * nghiệp, mức lương, số việc phải làm. Bấm "Vào học" mới thật sự bắt đầu — và
 * việc ghi danh được lưu ở máy chủ, nên mở máy khác vẫn thấy mình đang dở đâu.
 */
export function LevelPanel({
  role,
  band,
  progress,
  onEnrolled,
  onClose,
}: {
  role: Role;
  band: BandProgress;
  progress: RoleProgress;
  onEnrolled: (next: RoleProgress) => void;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entry = findScenario(role.role_code, band.band);
  const salary = role.salary_by_band.find((s) => s.band === band.band);
  const sideQuests = eventsForRole(role).length;
  const previous = progress.bands[progress.bands.findIndex((b) => b.band === band.band) - 1];

  const tasksPath = `/jobs/${role.role_code}/${band.band}/tasks`;

  const enroll = async () => {
    setBusy(true);
    setError(null);
    try {
      onEnrolled(await profileApi.enroll(role.role_code, band.band));
      navigate(tasksPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không ghi danh được');
      setBusy(false);
    }
  };

  return (
    <aside className="rounded-[12px] border border-line bg-surf p-[18px]">
      <div className="mb-3.5 flex items-start gap-3">
        <Crest seed={`${role.role_code}:${band.band}`} size={42} active={band.unlocked} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[var(--accent)]">
              {band.band}
            </span>
            {band.completed && <Pill tone="good">đã xong</Pill>}
            {!band.completed && band.enrolled && <Pill tone="gold">đang học</Pill>}
            {!band.unlocked && <Pill tone="locked">chưa mở</Pill>}
          </div>
          <h2 className="font-display text-[17px] font-semibold leading-snug">
            {band.label}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="shrink-0 rounded-[6px] border border-line-2 bg-inset px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-line hover:text-ink-2"
        >
          ✕
        </button>
      </div>

      {/* ── Chưa mở: nói rõ còn thiếu bao nhiêu, ở đâu ── */}
      {!band.unlocked && (
        <Note tone="warn" className="mb-3.5">
          Cần <b>{UNLOCK_AT}</b> điểm kỹ năng ở <b>{previous?.band}</b> mới mở
          được chặng này. Đang có <b>{previous?.points ?? 0}</b>.
        </Note>
      )}

      {/* ── Có gì ở đây ── */}
      <dl className="mb-3.5 grid grid-cols-2 gap-2.5">
        <div className="rounded-[9px] border border-line-2 bg-panel px-3 py-2.5">
          <dt className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
            Lương trung bình
          </dt>
          <dd className="m-0 mt-1 font-display text-[16px] font-bold text-ink">
            {formatVnd(salary?.salary_avg)}
          </dd>
        </div>
        <div className="rounded-[9px] border border-line-2 bg-panel px-3 py-2.5">
          <dt className="font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
            Điểm đã có
          </dt>
          <dd className="m-0 mt-1 font-display text-[16px] font-bold text-[var(--accent)]">
            {band.points}
            <span className="text-[12px] font-normal text-muted">/{UNLOCK_AT}</span>
          </dd>
        </div>
      </dl>

      {/* ── Đồng nghiệp: chất liệu của cảnh, lấy từ cast của kịch bản ── */}
      {entry ? (
        <div className="mb-3.5">
          <p className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.11em] text-muted">
            Bạn sẽ làm việc với
          </p>
          <div className="flex flex-col gap-2">
            {entry.scenario.cast.map((member) => (
              <div key={member.npc_id} className="flex items-center gap-2.5">
                <Crest seed={member.npc_id} size={28} />
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-2">
                  {member.role_in_scene}
                </span>
              </div>
            ))}
          </div>
          <p className="m-0 mt-2.5 text-[12.5px] leading-relaxed text-muted">
            {entry.scenario.context.situation}
          </p>
        </div>
      ) : (
        <Note className="mb-3.5">
          Chặng này <b>chưa dựng nhiệm vụ chính</b>. Nhiệm vụ phụ vẫn làm được
          và vẫn vẽ nên chân dung của bạn.
        </Note>
      )}

      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {entry && <Pill tone="gold">1 nhiệm vụ chính</Pill>}
        <Pill>{sideQuests} nhiệm vụ phụ</Pill>
        {entry && <Pill>≈ {entry.scenario.context.estimated_minutes} phút</Pill>}
      </div>

      {error && (
        <Note tone="warn" className="mb-3">
          {error}
        </Note>
      )}

      {/* ── Hành động ── */}
      {!band.unlocked ? (
        <Button className="w-full" disabled>
          Chưa mở
        </Button>
      ) : band.enrolled ? (
        <Button
          variant="primary"
          className={cx('w-full')}
          onClick={() => navigate(tasksPath)}
        >
          Tiếp tục học
        </Button>
      ) : (
        <>
          <Button
            variant="primary"
            className="w-full"
            onClick={() => void enroll()}
            disabled={busy}
          >
            {busy ? 'Đang ghi danh…' : 'Vào học chặng này'}
          </Button>
          <SourceNote className="mt-2 text-center">
            Ghi danh xong mới vào được các tình huống của chặng.
          </SourceNote>
        </>
      )}
    </aside>
  );
}
