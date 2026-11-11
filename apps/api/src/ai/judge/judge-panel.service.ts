/**
 * Panel ba judge (AI-5): chấm một câu tự luận theo rubric.
 *
 * Luồng theo SD-01 và CL-04 `JudgePanelService.grade`:
 *
 *   1. Khử định danh câu trả lời (DC-03).
 *   2. Ba ghế — ba họ model — chạy SONG SONG. Mỗi ghế:
 *        - chia tiêu chí thành lô tối đa 3 (§5.3.6);
 *        - gọi bậc chính; kết quả không qua J1–J3 hoặc lỗi tạm thời thì thử
 *          lại, tối đa 2 lần (SD-01);
 *        - hết lượt thử, hoặc lỗi cấu hình (sai key, hết tiền) thì sang bậc dự
 *          phòng CÙNG họ, chấm lại mọi lô — một judge là một model, để bản ghi
 *          `judge_result.model_id` đúng;
 *        - bộ lọc nội dung chặn thì ghế dừng, không đẩy sang hãng khác.
 *   3. Gộp: trung vị, cờ lệch (judge-combine.ts).
 *
 * Không có đường chấm thay thế không dùng AI (D-92): thiếu judge thì trả
 * `pending`/`unavailable`, câu trả lời được giữ để chấm lại.
 *
 * Không dùng CircuitBreaker của AI-4: breaker ngắt theo nhà cung cấp, mà cả ba
 * judge (và Qwen qua OpenRouter) cùng là `openrouter` — một họ hỏng sẽ ngắt cả
 * panel. Chấm chạy nền nên chờ hết lượt thử không làm người chơi đứng chờ.
 *
 * Theo CL-04 service này thuộc AssessmentModule (chạy ở worker). Prototype
 * chưa có module đó, nên tạm đặt trong AiModule như NarratorService.
 */
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import {
  deidentify,
  type Deidentified,
  type KnownIdentity,
} from '@datn/game-core';
import { costOf, upperBoundUsd, type Cost } from '../gateway/cost';
import {
  GatewayError,
  systemClock,
  type ChatMessage,
  type Clock,
  type GatewayErrorKind,
  type TokenUsage,
} from '../gateway/gateway.types';
import { ModelGateway } from '../gateway/model-gateway';
import type { JudgeSlot } from '../gateway/models';
import { combineJudgments, type PanelVerdict } from './judge-combine';
import { checkJudgeOutput, type JudgeProblem } from './judge.output';
import { JUDGE_PROFILE } from './judge.profile';
import {
  buildJudgeMessages,
  judgeJsonSchema,
  retryMessages,
} from './judge.prompt';
import type { Judgment, RubricCriterion } from './judge.types';
import { JUDGE_PROMPT_VERSION } from './prompts/judge.v1';

export const JUDGE_SLOTS = Symbol('JUDGE_SLOTS');
export const JUDGE_CLOCK = Symbol('JUDGE_CLOCK');

export interface GradeInput {
  /** Câu người chơi gõ, nguyên văn. Service tự khử định danh. */
  answer: string;
  criteria: readonly RubricCriterion[];
  situation?: string;
  question?: string;
  identity?: KnownIdentity;
  contentVersion?: number;
  /** Số tiền còn được tiêu trong phiên (NFR-11). Không truyền thì không chặn. */
  budgetUsd?: number;
}

/** Một lần gọi model — đủ để truy lại điểm nào ra từ đâu, tốn bao nhiêu. */
export interface JudgeCallRecord {
  slot: number;
  family: string;
  /** Lô tiêu chí thứ mấy (từ 1). */
  batch: number;
  attempt: number;
  modelKey: string;
  promptVersion: string;
  profileVersion: string;
  contentVersion: number | null;
  /** `null`: model không nhận temperature, chạy mặc định của hãng. */
  temperature: number | null;
  startedAt: number;
  latencyMs: number | null;
  outcome: 'accepted' | 'rejected' | 'error';
  problems: JudgeProblem[];
  error: {
    kind: GatewayErrorKind;
    status: number | null;
    message: string;
  } | null;
  finishReason: string | null;
  usage: TokenUsage | null;
  cost: Cost | null;
  requestId: string | null;
  output: string | null;
}

/** Kết quả một ghế (ERD-06 `judge_result`). */
export interface SlotOutcome {
  slot: number;
  family: string;
  status: 'ok' | 'failed' | 'blocked';
  /** Model đã chấm (ok), hoặc model cuối cùng đã thử. */
  modelKey: string | null;
  attempts: number;
  judgments: Judgment[];
  error: string | null;
}

export type PanelResult = {
  slots: SlotOutcome[];
  records: JudgeCallRecord[];
  cost: Cost;
  redactions: Deidentified['redactions'];
  /** Câu đã khử định danh — câu trích được so với câu này. */
  answerSent: string;
} & (PanelVerdict | { status: 'unavailable'; reason: 'no_model' | 'budget' });

const chunk = <T>(items: readonly T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
};

/** Lỗi do cấu hình hay do chính request: thử lại cùng model là vô ích. */
const GIVE_UP_ON_MODEL: ReadonlySet<GatewayErrorKind> = new Set([
  'auth',
  'quota',
  'bad_request',
]);

@Injectable()
export class JudgePanelService {
  private readonly logger = new Logger('AI-5');

  constructor(
    private readonly gateway: ModelGateway,
    @Inject(JUDGE_SLOTS) private readonly slots: readonly JudgeSlot[],
    @Optional()
    @Inject(JUDGE_CLOCK)
    private readonly clock: Clock = systemClock,
  ) {}

  async grade(input: GradeInput): Promise<PanelResult> {
    const { text: answer, redactions } = deidentify(
      input.answer,
      input.identity,
    );
    const criterionIds = input.criteria.map((c) => c.id);
    const batches = chunk(input.criteria, JUDGE_PROFILE.maxCriteriaPerCall);
    const records: JudgeCallRecord[] = [];
    const base = { records, redactions, answerSent: answer };

    if (this.slots.length === 0)
      return {
        ...base,
        status: 'unavailable',
        reason: 'no_model',
        slots: [],
        cost: zero,
      };

    if (input.budgetUsd !== undefined) {
      // Chặn trước khi tiêu: mỗi ghế, mỗi lô, ở bậc chính, không trúng cache.
      const worst = this.slots.reduce((sum, { chain }) => {
        const spec = chain[0];
        return (
          sum +
          batches.reduce((s, batch) => {
            const chars = buildJudgeMessages({
              ...input,
              answer,
              criteria: batch,
            })
              .flatMap((m) => m.parts)
              .reduce((n, p) => n + p.text.length, 0);
            return (
              s +
              upperBoundUsd(chars, JUDGE_PROFILE.maxOutputTokens, spec.price)
            );
          }, 0)
        );
      }, 0);
      if (worst > input.budgetUsd)
        return {
          ...base,
          status: 'unavailable',
          reason: 'budget',
          slots: [],
          cost: zero,
        };
    }

    const slots = await Promise.all(
      this.slots.map((slot) =>
        this.runSlot(slot, batches, { ...input, answer }, records),
      ),
    );
    const verdict = combineJudgments(
      criterionIds,
      slots.filter((s) => s.status === 'ok').map((s) => s.judgments),
      JUDGE_PROFILE,
    );
    if (verdict.status !== 'graded')
      this.logger.warn(
        `Chưa chấm được (${verdict.reason}): ${slots.map((s) => `${s.family}=${s.status}`).join(', ')}`,
      );

    return { ...base, ...verdict, slots, cost: totalCost(records) };
  }

  private async runSlot(
    { slot, family, chain }: JudgeSlot,
    batches: readonly RubricCriterion[][],
    turn: GradeInput & { answer: string },
    records: JudgeCallRecord[],
  ): Promise<SlotOutcome> {
    let attempts = 0;
    let lastError: string | null = null;
    let lastModel: string | null = null;

    for (const spec of chain) {
      lastModel = spec.key;
      const judgments: Judgment[] = [];
      let modelFailed = false;

      for (const [b, criteria] of batches.entries()) {
        const ids = criteria.map((c) => c.id);
        let messages: ChatMessage[] = buildJudgeMessages({ ...turn, criteria });
        let accepted: Judgment[] | null = null;

        for (
          let retry = 0;
          retry <= JUDGE_PROFILE.maxRetries && !accepted;
          retry++
        ) {
          attempts++;
          const temperature =
            spec.supports.temperature === false
              ? null
              : JUDGE_PROFILE.temperature;
          const record: JudgeCallRecord = {
            slot,
            family,
            batch: b + 1,
            attempt: retry + 1,
            modelKey: spec.key,
            promptVersion: JUDGE_PROMPT_VERSION,
            profileVersion: JUDGE_PROFILE.version,
            contentVersion: turn.contentVersion ?? null,
            temperature,
            startedAt: this.clock.now(),
            latencyMs: null,
            outcome: 'error',
            problems: [],
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
              temperature: JUDGE_PROFILE.temperature,
              maxOutputTokens: JUDGE_PROFILE.maxOutputTokens,
              json: { name: 'judgment', schema: judgeJsonSchema(ids) },
              timeoutMs: JUDGE_PROFILE.attemptTimeoutMs,
            });
          } catch (err) {
            const error =
              err instanceof GatewayError
                ? err
                : new GatewayError('network', String(err), spec.provider);
            record.error = {
              kind: error.kind,
              status: error.status,
              message: error.message,
            };
            record.latencyMs = this.clock.now() - record.startedAt;
            lastError = `${spec.key}: ${error.kind} — ${error.message}`;

            if (error.kind === 'content_filtered')
              return {
                slot,
                family,
                status: 'blocked',
                modelKey: spec.key,
                attempts,
                judgments: [],
                error: lastError,
              };
            if (GIVE_UP_ON_MODEL.has(error.kind)) {
              this.logger.error(`Ghế ${slot}: ${lastError}`);
              break;
            }
            continue;
          }

          record.latencyMs = result.latencyMs;
          record.finishReason = result.finishReason;
          record.usage = result.usage;
          record.cost = costOf(result.usage, spec.price);
          record.requestId = result.requestId;
          record.output = result.text;

          const check = checkJudgeOutput(result.text, {
            criterionIds: ids,
            answer: turn.answer,
            finishReason: result.finishReason,
          });
          if (check.ok) {
            record.outcome = 'accepted';
            accepted = check.judgments;
          } else {
            record.outcome = 'rejected';
            record.problems = check.problems;
            lastError = `${spec.key}: ${check.problems.map((p) => `${p.rule} ${p.detail}`).join('; ')}`;
            messages = [
              ...buildJudgeMessages({ ...turn, criteria }),
              ...retryMessages(
                result.text,
                check.problems.map((p) => `${p.rule}: ${p.detail}`),
              ),
            ];
          }
        }

        if (!accepted) {
          modelFailed = true;
          break;
        }
        judgments.push(...accepted);
      }

      if (!modelFailed)
        return {
          slot,
          family,
          status: 'ok',
          modelKey: spec.key,
          attempts,
          judgments,
          error: null,
        };
    }

    return {
      slot,
      family,
      status: 'failed',
      modelKey: lastModel,
      attempts,
      judgments: [],
      error: lastError,
    };
  }
}

const zero: Cost = { usd: 0, basis: 'list' };

function totalCost(records: readonly JudgeCallRecord[]): Cost {
  const costs = records.flatMap((r) => (r.cost ? [r.cost] : []));
  return {
    usd: costs.reduce((sum, c) => sum + c.usd, 0),
    basis: costs.some((c) => c.basis === 'upper_bound')
      ? 'upper_bound'
      : 'list',
  };
}
