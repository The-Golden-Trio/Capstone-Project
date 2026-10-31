/**
 * Người dẫn truyện (AI-4): một lượt = một câu người chơi vừa gõ → lời nhân vật
 * đáp lại, có thể kèm một câu hỏi đào sâu.
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
 * Module này độc lập với cách nhóm chốt thời điểm chấm (①): engine chỉ cần
 * cho biết lượt này có được hỏi đào sâu hay không.
 */
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import {
  checkNarration,
  deidentify,
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
import { NARRATOR_PROMPT_VERSION } from './prompts/narrator.v1';

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
  /** Engine quyết: còn trong trần đào sâu của hoạt động và của màn không. */
  followUpAllowed: boolean;
  /** Những gì nền tảng biết về người chơi, để xoá trước khi gửi đi. */
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
    const startedAt = this.clock.now();
    const deadline = startedAt + NARRATOR_PROFILE.deadlineMs;

    /* ── Chuẩn bị: khử định danh, lọc kịch bản, ghép prompt ── */

    const redactions: Deidentified['redactions'] = {};
    const clean = (text: string) => {
      const out = deidentify(text, input.identity);
      for (const [kind, n] of Object.entries(out.redactions))
        redactions[kind as keyof typeof redactions] =
          (redactions[kind as keyof typeof redactions] ?? 0) + (n ?? 0);
      return out.text;
    };
    const answer = clean(input.answer);
    const transcript = input.transcript.map((line) =>
      line.kind === 'player' ? { ...line, text: clean(line.text) } : line,
    );

    const view = narratorView(input.scenario, input.activityId);
    const castIds = view.cast.map((c) => c.npc_id);
    const base = buildNarratorMessages({
      view,
      activityId: input.activityId,
      transcript,
      answer,
      followUpAllowed: input.followUpAllowed,
    });

    // R1 so với mọi chữ AI-4 được thấy; R3 so với mọi chữ nó không được nói.
    const visibleTexts = [...textsOf(view), ...transcript.map((l) => l.text), answer];
    const hidden = hiddenTexts(input.scenario, input.activityId);

    const records: NarratorCallRecord[] = [];
    const done = (verdict: Verdict): NarrateResult => ({
      ...verdict,
      records,
      redactions,
      cost: totalCost(records),
    });

    /* ── Bậc dự phòng ── */

    const available = this.chain.filter((spec) => !this.breaker.isOpen(spec.provider));
    if (available.length === 0) return done({ status: 'unavailable', reason: 'no_model' });

    let spent = 0;
    let ranOutOfTime = false;

    for (const spec of available) {
      let messages: ChatMessage[] = base;

      for (let round = 0; round <= NARRATOR_PROFILE.maxRegenerations; round++) {
        const remaining = deadline - this.clock.now();
        if (remaining < NARRATOR_PROFILE.minAttemptMs) {
          ranOutOfTime = true;
          break;
        }

        if (input.budgetUsd !== undefined) {
          const chars = messages.flatMap((m) => m.parts).reduce((n, p) => n + p.text.length, 0);
          const worst = upperBoundUsd(chars, NARRATOR_PROFILE.maxOutputTokens, spec.price);
          if (spent + worst > input.budgetUsd) return done({ status: 'unavailable', reason: 'budget' });
        }

        const temperature = NARRATOR_PROFILE.temperature[spec.provider];
        const record: NarratorCallRecord = {
          attempt: records.length + 1,
          modelKey: spec.key,
          provider: spec.provider,
          family: spec.family,
          promptVersion: NARRATOR_PROMPT_VERSION,
          profileVersion: NARRATOR_PROFILE.version,
          contentVersion: input.contentVersion ?? null,
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
            maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens,
            json: { name: 'narration', schema: narrationJsonSchema(castIds) },
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

        const check = checkNarration(result.text, {
          visibleTexts,
          hiddenTexts: hidden,
          castIds,
          followUpAllowed: input.followUpAllowed,
          finishReason: result.finishReason,
        });
        record.violations = check.violations.map(({ rule, detail }) => ({ rule, detail }));

        if (check.output && check.violations.length === 0) {
          record.outcome = 'accepted';
          return done({ status: 'ok', line: check.output });
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
