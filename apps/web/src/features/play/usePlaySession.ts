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
import { ApiError, createTurnId } from '../../api/port';
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

/** Lời thoại, cảnh và tin bot là các nhịp người chơi đọc lần lượt. */
const needsTap = (l: TranscriptLine, bots: readonly string[]) =>
  l.kind === 'npc' ||
  l.kind === 'scene' ||
  (l.kind === 'system' && bots.includes(l.speaker));

function isFresh(scene: SceneView | null, lines: TranscriptLine[]) {
  return (
    !scene?.paused &&
    !scene?.clock.pointsUsed &&
    !lines.some(
      (line) => line.kind === 'player' || line.context.startsWith('action:'),
    )
  );
}

function turnFingerprint(input: TurnInput): string {
  // A retry of the same timed choice must carry the original elapsed time.
  return input.kind === 'choose'
    ? `choose:${input.option}`
    : JSON.stringify(input);
}

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
  const inFlight = useRef(false);
  const unconfirmed = useRef<{
    id: string;
    fingerprint: string;
    input: TurnInput;
  } | null>(null);
  const mounted = useRef(false);
  const pendingTurn = useRef<string | null>(null);
  const pausedTurn = useRef<string | null>(null);
  /** Vị trí dòng đầu của đợt trả lời sắp tới: dòng đó tự hiện. */
  const batchAt = useRef<number | null>(null);
  const linesRef = useRef<TranscriptLine[]>([]);
  linesRef.current = lines;
  /** Lượt đã có tin `done`, phòng khi tin tới trước cả kết quả POST. */
  const doneTurns = useRef(new Set<string>());
  const sceneRevision = useRef(0);
  const bots = useMemo(() => scene?.bots?.map(({ id }) => id) ?? [], [scene]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Tải lần đầu: lượt mở lại thì mọi dòng cũ đã xem rồi, hiện hết.
  useEffect(() => {
    let alive = true;
    const revision = sceneRevision.current;
    setLoadError(null);
    Promise.all([api.play.scene(runId), api.play.transcript(runId)])
      .then(([s, t]) => {
        if (!alive) return;
        if (sceneRevision.current === revision) {
          setScene(s);
          pendingTurn.current = s.pendingTurnId ?? null;
          pausedTurn.current = s.paused ? pendingTurn.current : null;
          setWaiting(s.mode === 'waiting' && !s.paused);
          setPaused(s.paused ? 'Phiên đang tạm dừng.' : null);
        }
        setLines((current) => mergeLines(current, t));
        // Ca mới (chưa có lời người chơi): đọc lại từng nhịp mở đầu.
        // Ca mở lại: mọi dòng cũ đã xem rồi, hiện hết.
        setRevealed(isFresh(s, t) ? 0 : t.length);
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

  useEffect(() => {
    let alive = true;
    const unsubscribe = api.play.subscribe(runId, (event) => {
      if (!alive) return;
      if (event.type === 'lines')
        setLines((prev) => mergeLines(prev, event.lines));
      else if (event.type === 'done') {
        if (doneTurns.current.has(event.turnId)) return;
        doneTurns.current.add(event.turnId);
        if (pendingTurn.current && pendingTurn.current !== event.turnId) return;
        sceneRevision.current++;
        setScene(event.scene);
        setWaiting(false);
        setSlow(null);
        setPaused(null);
        pausedTurn.current = null;
        pendingTurn.current = null;
      } else if (event.type === 'delay') {
        if (
          pendingTurn.current === event.turnId &&
          pausedTurn.current !== event.turnId
        )
          setSlow(event.waitingFor);
      } else if (event.type === 'paused') {
        if (
          doneTurns.current.has(event.turnId) ||
          (pendingTurn.current && pendingTurn.current !== event.turnId)
        )
          return;
        sceneRevision.current++;
        pausedTurn.current = event.turnId;
        pendingTurn.current = event.turnId;
        setPaused(event.reason || 'Chưa gọi được mô hình.');
        setWaiting(false);
        setSlow(null);
      }
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [runId]);

  // Dự phòng khi mất tin của luồng sự kiện: chờ quá 8 giây thì hỏi lại cảnh.
  useEffect(() => {
    if (!waiting) return;
    let alive = true;
    let polling = false;
    const id = window.setInterval(async () => {
      if (polling) return;
      polling = true;
      const revision = sceneRevision.current;
      try {
        const [sc, t] = await Promise.all([
          api.play.scene(runId),
          api.play.transcript(runId),
        ]);
        if (!alive || sceneRevision.current !== revision) return;
        setLines((prev) => mergeLines(prev, t));
        if (sc.paused || sc.mode !== 'waiting') {
          sceneRevision.current++;
          if (!sc.paused && pendingTurn.current)
            doneTurns.current.add(pendingTurn.current);
          pendingTurn.current = sc.paused
            ? (sc.pendingTurnId ?? pendingTurn.current)
            : null;
          pausedTurn.current = sc.paused ? pendingTurn.current : null;
          setPaused(sc.paused ? 'Phiên đang tạm dừng.' : null);
          setScene(sc);
          setWaiting(false);
          setSlow(null);
        }
      } catch {
        /* Thử lại ở nhịp sau. */
      } finally {
        polling = false;
      }
    }, 8_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [waiting, runId]);

  // Dòng không cần bấm (lời người chơi, hệ thống) tự hiện khi tới lượt.
  // Tự hiện nhịp đầu của mỗi lượt, rồi chờ người chơi bấm để đọc tiếp.
  useEffect(() => {
    if (!ready) return;
    let i = revealed;
    while (i < lines.length && !needsTap(lines[i], bots)) i++;
    const startOfBatch =
      !lines.slice(0, i).some((line) => needsTap(line, bots)) ||
      (batchAt.current !== null && i >= batchAt.current);
    if (i < lines.length && startOfBatch) {
      i++;
      batchAt.current = null;
    }
    if (i !== revealed) setRevealed(i);
  }, [ready, lines, revealed, bots]);

  const shown = useMemo(() => lines.slice(0, revealed), [lines, revealed]);
  const queued = lines.length - revealed;
  const current = useMemo(() => {
    for (let i = shown.length - 1; i >= 0; i--)
      if (needsTap(shown[i], bots)) return shown[i];
    return null;
  }, [shown, bots]);

  const advance = useCallback(
    () =>
      setRevealed((r) => {
        let next = r;
        while (next < lines.length && !needsTap(lines[next], bots)) next++;
        return Math.min(lines.length, next + 1);
      }),
    [lines, bots],
  );
  const revealAll = useCallback(
    () => setRevealed(lines.length),
    [lines.length],
  );

  const send = useCallback(
    async (input: TurnInput): Promise<boolean> => {
      if (
        !mounted.current ||
        inFlight.current ||
        pendingTurn.current ||
        waiting ||
        paused
      )
        return false;
      const fingerprint = turnFingerprint(input);
      const turn =
        unconfirmed.current?.fingerprint === fingerprint
          ? unconfirmed.current
          : { id: createTurnId(), fingerprint, input };
      unconfirmed.current = turn;
      pendingTurn.current = turn.id;
      inFlight.current = true;
      sceneRevision.current++;
      setSending(true);
      setError(null);
      batchAt.current = linesRef.current.length;
      try {
        const r = await api.play.turn(runId, turn.input, turn.id);
        if (!mounted.current) return true;
        unconfirmed.current = null;
        setLines((prev) => mergeLines(prev, r.lines));
        if (r.pending && !doneTurns.current.has(r.turnId)) {
          pendingTurn.current = r.turnId;
          if (pausedTurn.current !== r.turnId) setWaiting(true);
        } else {
          pendingTurn.current = null;
          if (r.scene && !doneTurns.current.has(r.turnId)) {
            doneTurns.current.add(r.turnId);
            setScene(r.scene);
          }
        }
        return true;
      } catch (e) {
        if (!mounted.current) return false;
        if (doneTurns.current.has(turn.id) || pausedTurn.current === turn.id) {
          unconfirmed.current = null;
          return true;
        }
        pendingTurn.current = null;
        if (e instanceof ApiError && e.code === 'RUN_PAUSED')
          setPaused(e.message);
        else setError(e instanceof Error ? e.message : 'Gửi chưa được.');
        return false;
      } finally {
        inFlight.current = false;
        if (mounted.current) setSending(false);
      }
    },
    [runId, waiting, paused],
  );

  const resume = useCallback(async () => {
    if (!paused || inFlight.current) return;
    inFlight.current = true;
    sceneRevision.current++;
    pausedTurn.current = null;
    setPaused(null);
    setWaiting(true);
    try {
      await api.play.resume(runId);
    } catch (e) {
      if (!mounted.current) return;
      setWaiting(false);
      setPaused(e instanceof Error ? e.message : 'Chưa tiếp tục được.');
    } finally {
      inFlight.current = false;
    }
  }, [runId, paused]);

  return {
    ready,
    loadError,
    reload: () => setAttempt((a) => a + 1),
    fresh: !paused && isFresh(scene, lines),
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
