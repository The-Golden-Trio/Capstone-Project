/**
 * Người dẫn truyện (AI-4). Hai contract, chung một bậc dự phòng:
 *
 * - `narrateScene` (D-130, contract hiện hành): engine giao một việc
 *   (reply, bridge, reaction, probe) kèm cảnh, thẻ nhân vật, cờ truyện, 8 lượt
 *   gần nhất; AI-4 trả các nhịp `{speaker, text, expression}` và `question_by`.
 * - `narrate` (contract cũ, 4/11): một câu follow-up cho kịch bản dạng
 *   activity cũ. Giữ cho hai kịch bản prototype tới khi engine chuyển sang seed
 *   mới; không phát triển thêm.
 *
 * Bậc dự phòng, tất cả nằm trong hạn chót 9 s:
 *
 *   1. Gọi model đầu chuỗi (Qwen).
 *   2. Câu không qua R1–R4 → bắt viết lại, nói rõ luật nào bị vi phạm; tối đa
 *      2 lần trên một model (D-108).
 *   3. Lỗi hạ tầng (quá giờ, quá tải, lỗi máy chủ…) → sang model kế (DeepSeek,
 *      nếu được phép). Không chờ rồi thử lại cùng hãng: thời gian là của
 *      người chơi.
 *   4. Hết model hoặc hết giờ → trả `unavailable`. Làm gì tiếp — tạm dừng
 *      phiên hay việc khác — là quyết định của engine, đang chờ nhóm chốt.
 *
 * Nội dung bị bộ lọc của nhà cung cấp chặn → dừng ngay, trả `blocked`. Không
 * thử lại, không đẩy nội dung bị chặn sang hãng khác.
 *
 * Engine quyết mọi thứ (Luật dẫn truyện phần B); service này chỉ gọi model,
 * kiểm bằng luật và ghi bản ghi.
 */
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import {
  BEATS_MAX,
  PLAYER_SPEAKER,
  beatsJsonSchema,
  checkBeats,
  checkNarration,
  deidentify,
  sceneTurnTexts,
  type Beat,
  type RuleViolation,
  type SceneTurn,
  hiddenTexts,
  narrationJsonSchema,
  narratorView,
  textsOf,
  type Deidentified,
  type KnownIdentity,
  type NarrationOutput,
  type RuleId,
  type Scenario,
} from '@datn/game-core';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import { costOf, upperBoundUsd, type Cost } from '../gateway/cost';
import {
  GatewayError,
  systemClock,
  type ChatMessage,
  type Clock,
  type GatewayErrorKind,
  type ModelSpec,
  type TokenUsage,
} from '../gateway/gateway.types';
import { ModelGateway } from '../gateway/model-gateway';
import { NARRATOR_PROFILE } from './narrator.profile';
import {
  buildNarratorMessages,
  regenerationMessages,
  type TranscriptLine,
} from './narrator.prompt';
import { NARRATOR_PROMPT_VERSION } from './prompts/narrator.v2';
import { SCENE_PROMPT_VERSION } from './prompts/narrator.v3';
import { buildSceneMessages } from './scene.prompt';

export const NARRATOR_CHAIN = Symbol('NARRATOR_CHAIN');
export const AI_CLOCK = Symbol('AI_CLOCK');

export interface NarrateInput {
  scenario: Scenario;
  /** Phiên bản nội dung đã ghim cho lượt chơi — ghi vào bản ghi. */
  contentVersion?: number;
  activityId: string;
  /** Những gì người chơi đã thấy, theo thứ tự. Chưa khử định danh cũng được: service tự khử. */
  transcript: readonly TranscriptLine[];
  /** Câu người chơi vừa gõ, nguyên văn. */
  answer: string;
  /** Engine quyết: còn trong trần đào sâu của hoạt động và của màn không. Không thì không gọi model. */
  followUpAllowed: boolean;
  /** Những gì nền tảng biết về người chơi, để xoá trước khi gửi đi. */
  identity?: KnownIdentity;
  /** Số tiền còn được tiêu trong phiên (NFR-11). Không truyền thì không chặn. */
  budgetUsd?: number;
}

/** Một lượt theo nhịp: việc engine giao, đã lọc xong (`SceneTurn`). */
export interface NarrateSceneInput {
  /** Câu người chơi (`playerLine`, các dòng `nguoi_choi`) chưa khử định danh cũng được: service tự khử. */
  turn: SceneTurn;
  /** Phiên bản nội dung đã ghim cho lượt chơi — ghi vào bản ghi. */
  contentVersion?: number;
  identity?: KnownIdentity;
  /** Số tiền còn được tiêu trong phiên (NFR-11). Không truyền thì không chặn. */
  budgetUsd?: number;
}

/** Một lần gọi model — đủ để truy lại câu nào sinh ra từ đâu, tốn bao nhiêu. */
export interface NarratorCallRecord {
  attempt: number;
  modelKey: string;
  provider: string;
  family: string;
  promptVersion: string;
  profileVersion: string;
  contentVersion: number | null;
  temperature: number;
  startedAt: number;
  latencyMs: number | null;
  outcome: 'accepted' | 'rejected' | 'error';
  violations: Array<{ rule: RuleId; detail: string }>;
  error: { kind: GatewayErrorKind; status: number | null; message: string } | null;
  finishReason: string | null;
  usage: TokenUsage | null;
  cost: Cost | null;
  requestId: string | null;
  /** Câu model trả về, nguyên văn — cho log review. Đầu vào đã khử định danh. */
  output: string | null;
}

interface Outcome {
  records: NarratorCallRecord[];
  /** Tổng chi phí các lượt gọi; `upper_bound` nếu có lượt chỉ ước được cận trên. */
  cost: Cost;
  redactions: Deidentified['redactions'];
}

type Verdict =
  | { status: 'ok'; line: NarrationOutput }
  /** Engine không cho hỏi đào sâu: không gọi model nào. */
  | { status: 'skipped' }
  /** Bộ lọc nội dung của nhà cung cấp chặn câu người chơi hoặc câu trả lời. */
  | { status: 'blocked' }
  | {
      status: 'unavailable';
      /**
       * `no_model`: không có model nào dùng được (thiếu key, bị loại vì chính
       * sách dữ liệu, hay đang bị ngắt). `deadline`: hết 9 s. `exhausted`: đã
       * thử hết chuỗi. `budget`: lượt gọi kế có thể vượt trần chi phí phiên.
       */
      reason: 'no_model' | 'deadline' | 'exhausted' | 'budget';
    };

export type NarrateResult = Outcome & Verdict;

type SceneVerdict =
  | { status: 'ok'; beats: Beat[]; questionBy: string | null }
  | { status: 'blocked' }
  | Extract<Verdict, { status: 'unavailable' }>;

export type NarrateSceneResult = Outcome & SceneVerdict;

/** Một contract cụ thể: dựng prompt, khuôn JSON và luật kiểm. Bậc dự phòng dùng chung. */
interface LadderJob<T> {
  promptVersion: string;
  contentVersion?: number;
  budgetUsd?: number;
  messages(spec: ModelSpec): ChatMessage[];
  json: { name: string; schema: Record<string, unknown> };
  check(text: string, finishReason: string): { output: T | null; violations: RuleViolation[] };
}

type LadderVerdict<T> =
  | { status: 'ok'; value: T }
  | { status: 'blocked' }
  | Extract<Verdict, { status: 'unavailable' }>;

/** Khử định danh và đếm số chỗ đã xoá, dùng chung cho hai contract. */
function cleaner(identity: KnownIdentity | undefined) {
  const redactions: Deidentified['redactions'] = {};
  const clean = (text: string) => {
    const out = deidentify(text, identity);
    for (const [kind, n] of Object.entries(out.redactions))
      redactions[kind as keyof typeof redactions] = (redactions[kind as keyof typeof redactions] ?? 0) + (n ?? 0);
    return out.text;
  };
  return { clean, redactions };
}

@Injectable()
export class NarratorService {
  private readonly logger = new Logger(NarratorService.name);

  constructor(
    private readonly gateway: ModelGateway,
    private readonly breaker: CircuitBreaker,
    @Inject(NARRATOR_CHAIN) private readonly chain: readonly ModelSpec[],
    @Optional() @Inject(AI_CLOCK) private readonly clock: Clock = systemClock,
  ) {}

  async narrate(input: NarrateInput): Promise<NarrateResult> {
    if (!input.followUpAllowed) return { status: 'skipped', records: [], redactions: {}, cost: { usd: 0, basis: 'list' } };

    const { clean, redactions } = cleaner(input.identity);
    const answer = clean(input.answer);
    const transcript = input.transcript.map((line) =>
      line.kind === 'player' ? { ...line, text: clean(line.text) } : line,
    );

    const view = narratorView(input.scenario, input.activityId);
    const castIds = view.cast.map((c) => c.npc_id);
    const turn = { view, activityId: input.activityId, transcript, answer };

    // R1 so với mọi chữ AI-4 được thấy; R3 so với mọi chữ nó không được nói.
    const visibleTexts = [...textsOf(view), ...transcript.map((l) => l.text), answer];
    const hidden = hiddenTexts(input.scenario, input.activityId);

    const { verdict, records } = await this.runLadder({
      promptVersion: NARRATOR_PROMPT_VERSION,
      contentVersion: input.contentVersion,
      budgetUsd: input.budgetUsd,
      messages: (spec) => buildNarratorMessages(turn, spec.provider),
      json: { name: 'narration', schema: narrationJsonSchema(castIds) },
      check: (text, finishReason) =>
        checkNarration(text, { visibleTexts, hiddenTexts: hidden, castIds, finishReason }),
    });
    const outcome = { records, redactions, cost: totalCost(records) };
    return verdict.status === 'ok' ? { ...outcome, status: 'ok', line: verdict.value } : { ...outcome, ...verdict };
  }

  /**
   * Một lượt theo nhịp (D-130). Không có trạng thái `skipped`: engine chỉ gọi
   * khi đã quyết có lời của nhân vật ở lượt này.
   */
  async narrateScene(input: NarrateSceneInput): Promise<NarrateSceneResult> {
    const { clean, redactions } = cleaner(input.identity);
    const turn: SceneTurn = {
      ...input.turn,
      playerLine: input.turn.playerLine === undefined ? undefined : clean(input.turn.playerLine),
      recent: input.turn.recent.map((line) =>
        line.speaker === PLAYER_SPEAKER ? { ...line, text: clean(line.text) } : line,
      ),
    };
    const speakers = turn.cards.map((c) => c.slot);
    if (!speakers.includes(turn.lead))
      throw new Error(`AI-4: nhân vật được giao "${turn.lead}" không có thẻ trong cảnh`);
    if (turn.task === 'probe' && !turn.hook) throw new Error('AI-4: task probe cần hook (A7)');

    const maxBeats = Math.min(turn.maxBeats ?? BEATS_MAX, BEATS_MAX);
    const visibleTexts = sceneTurnTexts(turn);

    const { verdict, records } = await this.runLadder({
      promptVersion: SCENE_PROMPT_VERSION,
      contentVersion: input.contentVersion,
      budgetUsd: input.budgetUsd,
      messages: () => buildSceneMessages(turn),
      json: { name: 'narration_beats', schema: beatsJsonSchema(speakers, maxBeats) },
      check: (text, finishReason) =>
        checkBeats(text, {
          task: turn.task,
          lead: turn.lead,
          speakers,
          questionAllowed: turn.questionAllowed !== false,
          maxBeats,
          visibleTexts,
          hiddenTexts: turn.hidden,
          finishReason,
        }),
    });
    const outcome = { records, redactions, cost: totalCost(records) };
    return verdict.status === 'ok'
      ? { ...outcome, status: 'ok', beats: verdict.value.beats, questionBy: verdict.value.question_by }
      : { ...outcome, ...verdict };
  }

  /* ── Bậc dự phòng dùng chung ── */

  private async runLadder<T>(job: LadderJob<T>): Promise<{ verdict: LadderVerdict<T>; records: NarratorCallRecord[] }> {
    const deadline = this.clock.now() + NARRATOR_PROFILE.deadlineMs;
    const records: NarratorCallRecord[] = [];
    const done = (verdict: LadderVerdict<T>) => ({ verdict, records });

    const available = this.chain.filter((spec) => !this.breaker.isOpen(spec.provider));
    if (available.length === 0) return done({ status: 'unavailable', reason: 'no_model' });

    let spent = 0;
    let ranOutOfTime = false;

    for (const spec of available) {
      let messages: ChatMessage[] = job.messages(spec);
      const maxOutputTokens = NARRATOR_PROFILE.maxOutputTokens[spec.provider];

      for (let round = 0; round <= NARRATOR_PROFILE.maxRegenerations; round++) {
        const remaining = deadline - this.clock.now();
        if (remaining < NARRATOR_PROFILE.minAttemptMs) {
          ranOutOfTime = true;
          break;
        }

        if (job.budgetUsd !== undefined) {
          const chars = messages.flatMap((m) => m.parts).reduce((n, p) => n + p.text.length, 0);
          const worst = upperBoundUsd(chars, maxOutputTokens, spec.price);
          if (spent + worst > job.budgetUsd) return done({ status: 'unavailable', reason: 'budget' });
        }

        const temperature = NARRATOR_PROFILE.temperature[spec.provider];
        const record: NarratorCallRecord = {
          attempt: records.length + 1,
          modelKey: spec.key,
          provider: spec.provider,
          family: spec.family,
          promptVersion: job.promptVersion,
          profileVersion: NARRATOR_PROFILE.version,
          contentVersion: job.contentVersion ?? null,
          temperature,
          startedAt: this.clock.now(),
          latencyMs: null,
          outcome: 'error',
          violations: [],
          error: null,
          finishReason: null,
          usage: null,
          cost: null,
          requestId: null,
          output: null,
        };
        records.push(record);

        let result;
        try {
          result = await this.gateway.complete({
            model: spec,
            messages,
            temperature,
            maxOutputTokens,
            json: job.json,
            timeoutMs: Math.min(NARRATOR_PROFILE.attemptTimeoutMs, remaining),
          });
        } catch (err) {
          const error =
            err instanceof GatewayError
              ? err
              : new GatewayError('network', String(err), spec.provider);
          record.error = { kind: error.kind, status: error.status, message: error.message };
          record.latencyMs = this.clock.now() - record.startedAt;
          this.breaker.recordFailure(spec.provider, error.kind);

          if (error.kind === 'content_filtered') return done({ status: 'blocked' });
          if (error.kind === 'auth' || error.kind === 'quota')
            this.logger.error(`AI-4: ${spec.key} lỗi cấu hình (${error.kind}) — ${error.message}`);
          break; // sang model kế
        }

        this.breaker.recordSuccess(spec.provider);
        record.latencyMs = result.latencyMs;
        record.finishReason = result.finishReason;
        record.usage = result.usage;
        record.cost = costOf(result.usage, spec.price);
        record.requestId = result.requestId;
        record.output = result.text;
        spent += record.cost.usd;

        if (result.usage.reasoning > 0)
          this.logger.warn(`AI-4: ${spec.key} vẫn sinh ${result.usage.reasoning} token suy nghĩ — thinking chưa tắt?`);

        const check = job.check(result.text, result.finishReason);
        record.violations = check.violations.map(({ rule, detail }) => ({ rule, detail }));

        if (check.output !== null && check.violations.length === 0) {
          record.outcome = 'accepted';
          return done({ status: 'ok', value: check.output });
        }

        record.outcome = 'rejected';
        messages = [...messages, ...regenerationMessages(result.text, check.violations)];
      }

      if (ranOutOfTime) break;
    }

    return done({ status: 'unavailable', reason: ranOutOfTime ? 'deadline' : 'exhausted' });
  }
}

function totalCost(records: readonly NarratorCallRecord[]): Cost {
  const costs = records.flatMap((r) => (r.cost ? [r.cost] : []));
  return {
    usd: costs.reduce((sum, c) => sum + c.usd, 0),
    basis: costs.some((c) => c.basis === 'upper_bound') ? 'upper_bound' : 'list',
  };
}
