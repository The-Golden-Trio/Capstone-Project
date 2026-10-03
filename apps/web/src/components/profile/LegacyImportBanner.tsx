import { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Note } from '../ui/Note';
import { LEGACY_STORAGE_KEY, useProfileStore } from '../../store/profileStore';

interface LegacySave {
  fit?: Record<string, number>;
  quizDone?: boolean;
  eventsPlayed?: number;
  skill?: Record<string, Record<string, number>>;
}

/** Đọc bản lưu cũ của prototype, bỏ qua nếu hỏng. */
function readLegacySave(): LegacySave | null {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Zustand persist bọc dữ liệu trong { state, version }; prototype thì không.
    const data = parsed?.state ?? parsed;
    return data && typeof data === 'object' ? (data as LegacySave) : null;
  } catch {
    return null;
  }
}

/**
 * Mời nhập tiến trình cũ còn nằm trong trình duyệt.
 *
 * Chỉ nhập chân dung tính cách và số nhiệm vụ phụ. Điểm kỹ năng thì không:
 * nó mở cấp bậc, mà bản lưu cũ nằm trong localStorage nên ai cũng sửa được.
 * Nói rõ điều đó ra thay vì lặng lẽ bỏ qua.
 */
export function LegacyImportBanner() {
  const [legacy, setLegacy] = useState<LegacySave | null>(null);
  const [busy, setBusy] = useState(false);
  const importLegacy = useProfileStore((s) => s.importLegacy);

  useEffect(() => setLegacy(readLegacySave()), []);

  if (!legacy) return null;

  const hadSkill = Object.keys(legacy.skill ?? {}).length > 0;

  const dismiss = () => {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    setLegacy(null);
  };

  const run = async () => {
    setBusy(true);
    try {
      await importLegacy({
        fit: legacy.fit,
        quizDone: legacy.quizDone,
        eventsPlayed: legacy.eventsPlayed,
      });
      dismiss();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Note className="mb-4">
      <p className="m-0 mb-2.5">
        Máy này còn một hành trình cũ chưa gắn với tài khoản nào. Nhập vào
        không?
      </p>
      {hadSkill && (
        <p className="m-0 mb-2.5 text-[12.5px] text-muted">
          Chân dung tính cách sẽ được giữ. Điểm kỹ năng thì không nhập được —
          điểm kỹ năng mở cấp bậc nên phải do máy chủ chấm, bạn sẽ cần chơi lại
          các nhiệm vụ chính.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="primary" size="sm" onClick={run} disabled={busy}>
          {busy ? 'Đang nhập…' : 'Nhập hành trình cũ'}
        </Button>
        <Button size="sm" onClick={dismiss} disabled={busy}>
          Bỏ qua
        </Button>
      </div>
    </Note>
  );
}
