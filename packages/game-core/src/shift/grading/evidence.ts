/**
 * Đoạn bằng chứng cho judge (E1 điểm 1, 3; spec-checklist-softskill "Bối cảnh
 * chấm"): từ trạng thái ca làm dựng ra những gì AI-5 được chấm.
 *
 * - Đoạn của một nút (`from: "n2"`): câu trả lời của nút cộng lời đáp probe,
 *   cộng artefact nút đó nhận (email, ghi chú sự cố).
 * - Đoạn `pha`: lời người chơi trong các cuộc trò chuyện và tin nhắn kênh, cộng
 *   nhật ký hành động, cộng artefact nộp trong pha (ô gõ của bản vá, D-144).
 *   Mỗi dòng nhật ký là một lượt có mã.
 * - Đoạn `review` ("Nhìn lại ca", D-144): câu hỏi của NPC và lời đáp của người
 *   chơi ở các mục đã bật. Không mục nào bật thì không có đoạn (không xét).
 * - Chỉ chữ của người chơi được chấm và được trích. Lời NPC và kết quả chạy
 *   thử là bối cảnh.
 * - Câu trả lời của nút ĐÓNG (trắc nghiệm, chọn một, đếm giờ) không vào đoạn:
 *   chấm bằng profile phương án (spec, "Phạm vi của thư viện").
 *
 * Mã lượt nói suy ra tất định từ trạng thái, không thêm gì vào schema sự kiện:
 *   `t<seq>`    dòng người chơi trong `transcript` (seq là vị trí trong sổ)
 *   `act<NN>`   dòng thứ NN của `actionLog` (đánh số từ 01)
 *   `art_<id>`  artefact đã lưu, của nút hay nộp trong pha (cả form là một lượt)
 *
 * Hàm này thuần: không đọc giờ thật, không gọi model.
 */
import { factText, type ShiftContext } from '../context.js';
import type { ShiftState, TranscriptLine } from '../state.js';
import { clockAt } from '../time.js';
import { PHA, REVIEW, type ObserveItem } from './observe.js';

export type TurnKind = 'say' | 'artefact' | 'action';

export interface EvidenceTurn {
  /** Mã ổn định để judge trích và code kiểm. */
  code: string;
  kind: TurnKind;
  /** Số điểm đã dùng lúc đó. */
  at: number;
  /** Giờ trong truyện. */
  time: string;
  /** Chữ được phép trích. Với artefact: giá trị các ô, cách nhau bằng xuống dòng. */
  text: string;
  /** Artefact: nhãn từng ô, chỉ để hiển thị cho judge. */
  parts?: Array<{ label: string; text: string }>;
}

export type EvidenceEntry =
  | { role: 'player'; turn: EvidenceTurn }
  | {
      /** Bối cảnh, không chấm: lời NPC, kết quả chạy thử. */
      role: 'npc' | 'system';
      speaker: string;
      at: number;
      time: string;
      text: string;
    };

export interface EvidenceSegment {
  /** Id nút, "pha" hoặc "review". */
  id: string;
  label: string;
  kind: 'node' | 'pha' | 'review';
  /** Mục con chấm ở đoạn này, theo thứ tự `observes`. */
  subs: string[];
  /**
   * `timed_out`: hết giờ ở câu đếm giờ và người chơi không nói thêm gì: mức 0,
   * không cờ (D-86), không cần judge. Nút chưa tới vì hết thời gian thì không
   * có đoạn (không xét, D2).
   */
  outcome: 'answered' | 'timed_out';
  entries: EvidenceEntry[];
  /** Dữ kiện người chơi đã mở tới cuối đoạn (E1 điểm 3). */
  facts: Array<{ id: string; text: string; time: string }>;
  /** Quy định người chơi đã được nghe tới cuối đoạn (cờ C8, mục 7.3). */
  rulesHeard: Array<{ id: string; text: string }>;
  /** Lời hứa đang có và trạng thái (mục 7.4, cờ C7). Chỉ đoạn `pha` và `review`. */
  promises: Array<{ label: string; status: string }>;
  /** Mô tả màn, giống nhau ở mọi đoạn. */
  brief: string;
}

export const turnsOf = (segment: EvidenceSegment): EvidenceTurn[] =>
  segment.entries.flatMap((e) => (e.role === 'player' ? [e.turn] : []));

export const allTurns = (
  segments: readonly EvidenceSegment[],
): EvidenceTurn[] => segments.flatMap(turnsOf);

/** Chuẩn hoá như `judge.output`: NFC, gộp khoảng trắng. Còn lại khớp từng ký tự. */
export const normalizeQuote = (text: string): string =>
  text.normalize('NFC').replace(/\s+/g, ' ').trim();

export const actionCode = (index: number): string =>
  `act${String(index + 1).padStart(2, '0')}`;

export const lineCode = (seq: number): string => `t${seq}`;

export const artefactCode = (artefactId: string): string => `art_${artefactId}`;

/** Tìm lượt nói theo mã trong các đoạn; trả cả đoạn chứa nó. */
export function findTurn(
  segments: readonly EvidenceSegment[],
  code: string,
): { segment: EvidenceSegment; turn: EvidenceTurn } | undefined {
  for (const segment of segments) {
    const turn = turnsOf(segment).find((t) => t.code === code);
    if (turn) return { segment, turn };
  }
  return undefined;
}

/** Câu trích ngắn nhất, tính bằng tiếng (D-145). */
export const MIN_QUOTE_WORDS = 3;

/**
 * Câu trích hợp lệ khi (luật 6, spec):
 *  - lượt nói/artefact: là chuỗi con (sau chuẩn hoá khoảng trắng) của đúng
 *    lượt nói đã ghi;
 *  - hành động: là chính mã hành động, hoặc chuỗi con của dòng mô tả hành động.
 * Lượt phải thuộc `segment`: trích từ đoạn khác không tính.
 * Câu trích chữ của người chơi dài ít nhất `MIN_QUOTE_WORDS` tiếng (D-145),
 * trừ khi trích trọn lượt nói (lượt "Dạ em sai" chỉ có thể trích nguyên).
 * Lượt hành động được miễn: dòng mô tả do engine viết, không phải lời người chơi.
 */
export function verifyQuote(
  segment: EvidenceSegment,
  turnCode: string,
  quote: string,
): boolean {
  const q = normalizeQuote(quote);
  if (q.length === 0) return false;
  const turn = turnsOf(segment).find((t) => t.code === turnCode);
  if (!turn) return false;
  if (turn.kind === 'action' && q === turn.code) return true;
  const text = normalizeQuote(turn.text);
  if (!text.includes(q)) return false;
  return (
    turn.kind === 'action' ||
    q === text ||
    q.split(' ').length >= MIN_QUOTE_WORDS
  );
}

/* ── Dựng đoạn ────────────────────────────────────────────────────────── */

interface Sortable {
  at: number;
  /** 0: hành động (bắt đầu trước lời trong chính hành động đó), 1: sổ lời. */
  rank: number;
  seq: number;
  entry: EvidenceEntry;
}

function speakerName(ctx: ShiftContext, slot: string): string {
  const cast = ctx.seed.cast.find((c) => c.slot === slot);
  return cast ? `${cast.name} (${slot})` : slot;
}

export function evidenceSegments(
  s: ShiftState,
  ctx: ShiftContext,
  observes: readonly ObserveItem[],
): EvidenceSegment[] {
  const { seed, pack } = ctx;
  const time = (at: number) =>
    clockAt(at, seed.clock.start, pack.minutes_per_point);

  const brief = [
    `Màn: ${seed.title}`,
    `Vai người chơi: ${seed.player_role}`,
    `Tình huống: ${seed.situation}`,
    `Mục tiêu: ${seed.goal}`,
  ].join('\n');

  const turnOfLine = (l: TranscriptLine): EvidenceTurn => ({
    code: lineCode(l.seq),
    kind: 'say',
    at: l.at,
    time: time(l.at),
    text: l.text,
  });

  const contextEntry = (l: TranscriptLine): EvidenceEntry | undefined => {
    if (l.kind === 'npc')
      return {
        role: 'npc',
        speaker: speakerName(ctx, l.speaker),
        at: l.at,
        time: time(l.at),
        text: l.text,
      };
    if (l.kind === 'system')
      return {
        role: 'system',
        speaker: 'kết quả',
        at: l.at,
        time: time(l.at),
        text: l.text,
      };
    return undefined;
  };

  const finish = (
    id: string,
    label: string,
    kind: EvidenceSegment['kind'],
    outcome: EvidenceSegment['outcome'],
    parts: Sortable[],
  ): EvidenceSegment => {
    const entries = [...parts]
      .sort((a, b) => a.at - b.at || a.rank - b.rank || a.seq - b.seq)
      .map((p) => p.entry);
    const end = parts.reduce((m, p) => Math.max(m, p.at), 0);
    const heard = (toldAt: string): boolean => {
      const node = s.nodes[toldAt];
      if (node)
        return (
          (node.status === 'active' || node.status === 'done') &&
          (node.openedAt ?? 0) <= end
        );
      return s.opened.includes(toldAt);
    };
    return {
      id,
      label,
      kind,
      subs: observes.filter((o) => o.from.includes(id)).map((o) => o.sub),
      outcome,
      entries,
      facts: s.facts
        .filter((f) => f.at <= end)
        .flatMap((f) => {
          const fact = seed.facts.find((x) => x.id === f.id);
          return fact
            ? [{ id: fact.id, text: factText(s, fact), time: time(f.at) }]
            : [];
        }),
      rulesHeard: pack.rules
        .filter((r) => heard(r.told_at))
        .map((r) => ({ id: r.id, text: r.text })),
      promises:
        kind === 'pha' || kind === 'review'
          ? s.promises.map((p) => ({ label: p.label, status: p.status }))
          : [],
      brief,
    };
  };

  const artefactPart = (
    artefactId: string,
    at: number,
    seq: number,
  ): Sortable | undefined => {
    const saved = s.artefacts[artefactId];
    const artefact = seed.artefacts.find((a) => a.id === artefactId);
    if (!saved || !artefact || saved.status !== 'saved') return undefined;
    const fields = (artefact.fields ?? []).map((f) => ({
      label: f.label,
      text: saved.fields[f.id] ?? '',
    }));
    return {
      at,
      rank: 1,
      seq,
      entry: {
        role: 'player',
        turn: {
          code: artefactCode(artefact.id),
          kind: 'artefact',
          at,
          time: time(at),
          text: fields.map((f) => f.text).join('\n'),
          parts: fields,
        },
      },
    };
  };

  const wanted = new Set(observes.flatMap((o) => o.from));
  const segments: EvidenceSegment[] = [];

  for (const node of seed.nodes) {
    if (!wanted.has(node.id)) continue;
    const progress = s.nodes[node.id];
    // Chưa tới (hết thời gian): không xét, giữ chỗ để chơi lại (D2).
    if (
      !progress ||
      progress.status === 'pending' ||
      progress.status === 'skipped'
    )
      continue;

    const context = `node:${node.id}`;
    const closed = node.format === 'choice' || node.format === 'timed_choice';
    const option = closed
      ? node.options.find((o) => o.key === progress.choice)
      : undefined;
    const parts: Sortable[] = [];
    let optionSkipped = false;
    for (const l of s.transcript) {
      if (l.context !== context) continue;
      if (l.kind === 'player') {
        // Dòng đầu bằng đúng chữ phương án là lựa chọn của nút đóng: không chấm.
        if (option && !optionSkipped && l.text === option.text) {
          optionSkipped = true;
          continue;
        }
        parts.push({
          at: l.at,
          rank: 1,
          seq: l.seq,
          entry: { role: 'player', turn: turnOfLine(l) },
        });
        continue;
      }
      const entry = contextEntry(l);
      if (entry) parts.push({ at: l.at, rank: 1, seq: l.seq, entry });
    }

    const saved = node.artefact ? s.artefacts[node.artefact] : undefined;
    if (node.artefact && saved?.status === 'saved') {
      // Đặt artefact ở chỗ dòng "Bạn gửi …" của nút, để đúng thứ tự trong sổ.
      const marker = s.transcript.find(
        (l) =>
          l.context === context &&
          l.kind === 'scene' &&
          l.text.startsWith('Bạn gửi'),
      );
      const part = artefactPart(
        node.artefact,
        marker?.at ?? saved.savedAt ?? 0,
        marker?.seq ?? Number.MAX_SAFE_INTEGER,
      );
      if (part) parts.push(part);
    }

    const answered = parts.some((p) => p.entry.role === 'player');
    // Hết giờ mà người chơi không nói thêm gì: mức 0, không cờ (D-86). Có nói
    // thêm thì lời đó là bằng chứng như thường.
    if (!answered && !progress.timedOut) continue;
    segments.push(
      finish(
        node.id,
        `Nút ${node.id} (${node.kind})`,
        'node',
        answered ? 'answered' : 'timed_out',
        parts,
      ),
    );
  }

  if (wanted.has(PHA)) {
    const parts: Sortable[] = [];
    for (const l of s.transcript) {
      const inPha =
        l.context.startsWith('conv:') ||
        l.context.startsWith('action:') ||
        l.context === 'promise';
      if (!inPha) continue;
      if (l.kind === 'player')
        parts.push({
          at: l.at,
          rank: 1,
          seq: l.seq,
          entry: { role: 'player', turn: turnOfLine(l) },
        });
      else {
        const entry = contextEntry(l);
        if (entry) parts.push({ at: l.at, rank: 1, seq: l.seq, entry });
      }
    }
    s.actionLog.forEach((a, i) => {
      const label = seed.actions.find((x) => x.key === a.key)?.label ?? a.key;
      parts.push({
        at: a.at,
        rank: 0,
        seq: i,
        entry: {
          role: 'player',
          turn: {
            code: actionCode(i),
            kind: 'action',
            at: a.at,
            time: time(a.at),
            text: `${label} (${a.key}, ${a.points} điểm)`,
          },
        },
      });
    });
    // Artefact nộp trong pha: đích của một hành động, không phải bài nộp của nút.
    const nodeArtefacts = new Set(seed.nodes.map((n) => n.artefact));
    const phaArtefacts = new Set(
      seed.actions.flatMap((a) =>
        a.target && !nodeArtefacts.has(a.target) ? [a.target] : [],
      ),
    );
    for (const id of phaArtefacts) {
      const part = artefactPart(
        id,
        s.artefacts[id]?.savedAt ?? 0,
        Number.MAX_SAFE_INTEGER,
      );
      if (part) parts.push(part);
    }
    if (parts.some((p) => p.entry.role === 'player'))
      segments.push(
        finish(
          PHA,
          'Pha xử lý (trò chuyện và hành động)',
          'pha',
          'answered',
          parts,
        ),
      );
  }

  if (wanted.has(REVIEW)) {
    const parts: Sortable[] = [];
    for (const l of s.transcript) {
      if (!l.context.startsWith('review:')) continue;
      if (l.kind === 'player')
        parts.push({
          at: l.at,
          rank: 1,
          seq: l.seq,
          entry: { role: 'player', turn: turnOfLine(l) },
        });
      else {
        const entry = contextEntry(l);
        if (entry) parts.push({ at: l.at, rank: 1, seq: l.seq, entry });
      }
    }
    if (parts.some((p) => p.entry.role === 'player'))
      segments.push(
        finish(
          REVIEW,
          'Nhìn lại ca (sau nút kết)',
          'review',
          'answered',
          parts,
        ),
      );
  }

  return segments;
}
