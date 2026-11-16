/**
 * Trạng thái một lượt ca làm phía máy khách: dòng thoại, cảnh hiện tại,
 * hàng đợi nhịp chưa hiện, lượt đang chờ AI.
 *
 * Server (hoặc engine trong trình duyệt ở chế độ mẫu) là nguồn chân lý;
 * màn chỉ hiện và gửi thao tác. Dòng mới tới qua kết quả lượt hoặc tin
 * `lines`/`done` của luồng sự kiện; trùng `seq` thì bỏ.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api';
import { ApiError } from '../../api/port';
import type { SceneView, TranscriptLine, TurnInput } from '../../api/types';

export interface PlaySession {
  ready: boolean;
  /** Lỗi khi mở ca (chưa tải được cảnh); khác lỗi gửi một lượt. */
  loadError: string | null;
  reload: () => void;
  /** Người chơi đã nói hay làm gì chưa: chưa thì hiện màn giới thiệu ca. */
  fresh: boolean;
  error: string | null;
  scene: SceneView | null;
  /** Dòng đã hiện cho người chơi. */
  shown: TranscriptLine[];
  /** Dòng đã tới nhưng chưa hiện (chờ bấm qua nhịp). */
  queued: number;
  /** Dòng đang hiện ở hộp thoại (nhịp mới nhất của NPC). */
  current: TranscriptLine | null;
  waiting: boolean;
  slow: 'narration' | 'checks' | null;
  paused: string | null;
  sending: boolean;
  advance: () => void;
  revealAll: () => void;
  /** `true` khi lượt đã được nhận; `false` khi lỗi (giữ nguyên bản nháp). */
  send: (input: TurnInput) => Promise<boolean>;
  resume: () => Promise<void>;
}

function mergeLines(
  prev: TranscriptLine[],
  next: TranscriptLine[],
): TranscriptLine[] {
  if (!next.length) return prev;
  const seen = new Set(prev.map((l) => l.seq));
  const added = next.filter((l) => !seen.has(l.seq));
  if (!added.length) return prev;
  return [...prev, ...added].sort((a, b) => a.seq - b.seq);
}

/** Dòng nào phải bấm mới qua: lời NPC và câu cảnh. Lời người chơi, dòng hệ thống hiện ngay. */
const needsTap = (l: TranscriptLine) => l.kind === 'npc' || l.kind === 'scene';

export function usePlaySession(runId: string): PlaySession {
  const [lines, setLines] = useState<TranscriptLine[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [scene, setScene] = useState<SceneView | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [slow, setSlow] = useState<PlaySession['slow']>(null);
  const [paused, setPaused] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const pendingTurn = useRef<string | null>(null);
  /** Vị trí dòng đầu của đợt trả lời sắp tới: dòng đó tự hiện. */
  const batchAt = useRef<number | null>(null);
  const linesRef = useRef<TranscriptLine[]>([]);
  linesRef.current = lines;
  /** Lượt đã có tin `done`, phòng khi tin tới trước cả kết quả POST. */
  const doneTurns = useRef(new Set<string>());

  // Tải lần đầu: lượt mở lại thì mọi dòng cũ đã xem rồi, hiện hết.
  useEffect(() => {
    let alive = true;
    setLoadError(null);
    Promise.all([api.play.scene(runId), api.play.transcript(runId)])
      .then(([s, t]) => {
        if (!alive) return;
        setScene(s);
        setLines(t);
        // Ca mới (chưa có lời người chơi): đọc lại từng nhịp mở đầu.
        // Ca mở lại: mọi dòng cũ đã xem rồi, hiện hết.
        setRevealed(t.some((l) => l.kind === 'player') ? t.length : 0);
        setWaiting(s.mode === 'waiting');
        const extra = s as SceneView & { paused?: boolean };
        if (extra.paused) setPaused('Phiên đang tạm dừng.');
        setReady(true);
      })
      .catch((e: unknown) => {
        if (alive)
          setLoadError(
            e instanceof Error ? e.message : 'Không mở được ca làm.',
          );
      });
    return () => {
      alive = false;
    };
  }, [runId, attempt]);

  useEffect(
    () =>
      api.play.subscribe(runId, (event) => {
        if (event.type === 'lines')
          setLines((prev) => mergeLines(prev, event.lines));
        else if (event.type === 'done') {
          doneTurns.current.add(event.turnId);
          setScene(event.scene);
          setWaiting(false);
          setSlow(null);
          pendingTurn.current = null;
        } else if (event.type === 'delay') setSlow(event.waitingFor);
        else if (event.type === 'paused') {
          setPaused(event.reason || 'Chưa gọi được mô hình.');
          setWaiting(false);
        }
      }),
    [runId],
  );

  // Dự phòng khi mất tin của luồng sự kiện: chờ quá 8 giây thì hỏi lại cảnh.
  useEffect(() => {
    if (!waiting) return;
    const id = window.setInterval(async () => {
      try {
        const [sc, t] = await Promise.all([
          api.play.scene(runId),
          api.play.transcript(runId),
        ]);
        setLines((prev) => mergeLines(prev, t));
        if (sc.mode !== 'waiting') {
          setScene(sc);
          setWaiting(false);
          setSlow(null);
        }
      } catch {
        /* Thử lại ở nhịp sau. */
      }
    }, 8_000);
    return () => window.clearInterval(id);
  }, [waiting, runId]);

  // Dòng không cần bấm (lời người chơi, hệ thống) tự hiện khi tới lượt.
  // Nhịp NPC/cảnh chỉ tự hiện MỘT nhịp ở đầu mỗi đợt mới (sau lời người
  // chơi, dòng hệ thống, hay lúc mở ca), để hộp thoại có chữ ngay; các nhịp
  // sau chờ người chơi bấm (seed khối C3).
  useEffect(() => {
    let i = revealed;
    while (i < lines.length && !needsTap(lines[i])) i++;
    const startOfBatch =
      i === 0 ||
      !needsTap(lines[i - 1]) ||
      (batchAt.current !== null && i >= batchAt.current);
    if (i < lines.length && startOfBatch) {
      i++;
      batchAt.current = null;
    }
    if (i !== revealed) setRevealed(i);
  }, [lines, revealed]);

  const shown = useMemo(() => lines.slice(0, revealed), [lines, revealed]);
  const queued = lines.length - revealed;
  const current = useMemo(() => {
    for (let i = shown.length - 1; i >= 0; i--)
      if (needsTap(shown[i])) return shown[i];
    return null;
  }, [shown]);

  const advance = useCallback(
    () => setRevealed((r) => Math.min(lines.length, r + 1)),
    [lines.length],
  );
  const revealAll = useCallback(
    () => setRevealed(lines.length),
    [lines.length],
  );

  const send = useCallback(
    async (input: TurnInput): Promise<boolean> => {
      setSending(true);
      setError(null);
      batchAt.current = linesRef.current.length;
      try {
        const r = await api.play.turn(runId, input);
        setLines((prev) => mergeLines(prev, r.lines));
        if (r.pending && !doneTurns.current.has(r.turnId)) {
          pendingTurn.current = r.turnId;
          setWaiting(true);
        } else if (r.scene) {
          setScene(r.scene);
        }
        return true;
      } catch (e) {
        if (e instanceof ApiError && e.code === 'RUN_PAUSED')
          setPaused(e.message);
        else setError(e instanceof Error ? e.message : 'Gửi chưa được.');
        return false;
      } finally {
        setSending(false);
      }
    },
    [runId],
  );

  const resume = useCallback(async () => {
    setPaused(null);
    setWaiting(true);
    try {
      await api.play.resume(runId);
    } catch (e) {
      setWaiting(false);
      setPaused(e instanceof Error ? e.message : 'Chưa tiếp tục được.');
    }
  }, [runId]);

  return {
    ready,
    loadError,
    reload: () => setAttempt((a) => a + 1),
    fresh: !lines.some((l) => l.kind === 'player'),
    error,
    scene,
    shown,
    queued,
    current,
    waiting,
    slow,
    paused,
    sending,
    advance,
    revealAll,
    send,
    resume,
  };
}
