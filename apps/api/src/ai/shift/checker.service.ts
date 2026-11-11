/**
 * Bộ phán có/không cho ca làm (A12, D-129): trả lời các `check_q` đã soạn
 * sẵn về lời người chơi. Kết quả thành cờ; engine quyết, bộ phán không phán
 * gì khác.
 *
 * - Dùng ghế judge của AI-5 (D-129: cùng cơ chế với thư viện câu hỏi có/không
 *   của AI-5). Các ghế này đã được dựng khác họ với AI-4 (DC-01, D-43). Một
 *   bộ phán là một model: lấy ghế đầu, ghế đầu không có model thì sang ghế
 *   kế. Không còn ghế nào thì `unavailable`.
 * - "Có" phải kèm câu trích nguyên văn; code kiểm câu trích có thật. Trích
 *   sai thì hạ thành "không rõ" (tính là không, A12).
 * - Sai khuôn thì hỏi lại một lần (D-108), rồi sang model kế.
 */
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { deidentify, normalizeVi, shift } from '@datn/game-core';
import { z } from 'zod';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import { costOf, upperBoundUsd } from '../gateway/cost';
import {
  GatewayError,
  systemClock,
  type ChatMessage,
  type Clock,
  type ModelSpec,
} from '../gateway/gateway.types';
import { ModelGateway } from '../gateway/model-gateway';
import type { JudgeSlot } from '../gateway/models';
import { JUDGE_SLOTS } from '../judge/judge-panel.service';
import { AI_CLOCK } from '../narrator/narrator.service';
import {
  CHECKER_PROMPT_VERSION,
  CHECKER_SYSTEM,
  CHECKER_TAG,
} from './prompts/checker.v1-draft';
import type { AiCallOptions, AiOutcome, ShiftChecker } from './types';

const MAX_OUTPUT_TOKENS = 800;
const ATTEMPT_TIMEOUT_MS = 8_000;
const DEADLINE_MS = 20_000;

const AnswerSchema = z.object({
  answers: z.array(
    z.object({
      flag: z.string(),
      quote: z.string().nullable().optional(),
      answer: z.enum(['yes', 'no', 'unclear']),
      time: z.string().nullable().optional(),
      event: z.string().nullable().optional(),
      channel: z.enum(['call', 'chat']).nullable().optional(),
    }),
  ),
});

export const CHECKER_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['answers'],
  properties: {
    answers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['flag', 'quote', 'answer', 'time', 'event', 'channel'],
        properties: {
          flag: { type: 'string' },
          quote: { type: ['string', 'null'] },
          answer: { type: 'string', enum: ['yes', 'no', 'unclear'] },
          time: { type: ['string', 'null'] },
          event: { type: ['string', 'null'] },
          channel: { type: ['string', 'null'], enum: ['call', 'chat', null] },
        },
      },
    },
  },
};

export function buildCheckerMessages(
  req: shift.CheckRequest,
  scope: string,
): ChatMessage[] {
  const questions = req.questions.map((q) => ({
    flag: q.flag,
    q: q.q,
    ...(q.extract ? { extract: q.extract.fields } : {}),
    ...(q.events ? { events: q.events } : {}),
  }));
  const safe = scope.replace(/</g, '‹').replace(/>/g, '›');
  return [
    {
      role: 'system',
      parts: [{ text: CHECKER_SYSTEM, cacheBreakpoint: true }],
    },
    {
      role: 'user',
      parts: [
        { text: `Câu hỏi (json):\n${JSON.stringify(questions)}` },
        { text: `<${CHECKER_TAG}>\n${safe}\n</${CHECKER_TAG}>` },
      ],
    },
  ];
}

const squash = (t: string) => normalizeVi(t).replace(/\s+/g, ' ').trim();

/** Kiểm câu trích có đúng là lời người chơi; ghép kết quả theo đúng thứ tự câu hỏi. */
export function verifyAnswers(
  req: shift.CheckRequest,
  scope: string,
  parsed: z.infer<typeof AnswerSchema>,
): shift.CheckAnswer[] {
  const said = squash(scope);
  const events = new Set(
    req.questions.flatMap((q) => q.events ?? []).map((e) => e.id),
  );
  return req.questions.map((q) => {
    const a = parsed.answers.find((x) => x.flag === q.flag);
    if (!a) return { flag: q.flag, answer: 'unclear' };
    const quote = a.quote?.trim() || undefined;
    const quoted =
      quote !== undefined && quote.length > 0 && said.includes(squash(quote));
    const answer: shift.CheckAnswerValue =
      a.answer === 'yes' && !quoted ? 'unclear' : a.answer;
    const out: shift.CheckAnswer = {
      flag: q.flag,
      answer,
      ...(quoted ? { quote } : {}),
    };
    if (answer === 'yes' && q.extract) {
      const time =
        a.time && /^\d{1,2}:\d{2}$/.test(a.time) ? a.time : undefined;
      const event = a.event && events.has(a.event) ? a.event : undefined;
      out.extracted = {
        ...(time ? { time } : event ? { event } : {}),
        ...(a.channel ? { channel: a.channel } : {}),
      };
    }
    return out;
  });
}

function parse(raw: string): unknown {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  return JSON.parse((fenced ? fenced[1] : raw).trim());
}

@Injectable()
export class ShiftCheckerService implements ShiftChecker {
  private readonly logger = new Logger('Bộ phán');

  constructor(
    private readonly gateway: ModelGateway,
    private readonly breaker: CircuitBreaker,
    @Inject(JUDGE_SLOTS) private readonly slots: readonly JudgeSlot[],
    @Optional() @Inject(AI_CLOCK) private readonly clock: Clock = systemClock,
  ) {}

  /** Chuỗi model của bộ phán: các ghế judge nối nhau, ghế đầu trước. */
  chain(): ModelSpec[] {
    return this.slots.flatMap((s) => s.chain);
  }

  async check(
    req: shift.CheckRequest,
    opts: AiCallOptions = {},
  ): Promise<AiOutcome<shift.CheckAnswer[]>> {
    const scope = deidentify(req.scope, opts.identity).text;
    const deadline = this.clock.now() + DEADLINE_MS;
    const available = this.chain().filter(
      (s) => !this.breaker.isOpen(s.provider),
    );
    if (available.length === 0)
      return { status: 'unavailable', reason: 'no_model' };

    let spent = 0;
    for (const spec of available) {
      const messages = buildCheckerMessages(req, scope);
      for (let round = 0; round < 2; round++) {
        const remaining = deadline - this.clock.now();
        if (remaining < 1_500)
          return { status: 'unavailable', reason: 'deadline' };
        if (opts.budgetUsd !== undefined) {
          const chars = messages
            .flatMap((m) => m.parts)
            .reduce((n, p) => n + p.text.length, 0);
          if (
            spent + upperBoundUsd(chars, MAX_OUTPUT_TOKENS, spec.price) >
            opts.budgetUsd
          )
            return { status: 'unavailable', reason: 'budget' };
        }
        let result;
        try {
          result = await this.gateway.complete({
            model: spec,
            messages,
            temperature: 0,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            json: { name: 'checks', schema: CHECKER_JSON_SCHEMA },
            timeoutMs: Math.min(ATTEMPT_TIMEOUT_MS, remaining),
          });
        } catch (err) {
          const error =
            err instanceof GatewayError
              ? err
              : new GatewayError('network', String(err), spec.provider);
          this.breaker.recordFailure(spec.provider, error.kind);
          if (error.kind === 'content_filtered')
            return { status: 'unavailable', reason: 'blocked' };
          this.logger.warn(`${spec.key}: ${error.kind} — ${error.message}`);
          break;
        }
        this.breaker.recordSuccess(spec.provider);
        spent += costOf(result.usage, spec.price).usd;
        let parsed;
        try {
          parsed = AnswerSchema.parse(parse(result.text));
        } catch {
          this.logger.warn(`${spec.key}: sai khuôn, hỏi lại`);
          continue; // D-108: sai schema thì thử lại một lần
        }
        return {
          status: 'ok',
          value: verifyAnswers(req, scope, parsed),
          provenance: {
            adapter: 'live',
            model: spec.key,
            promptVersion: CHECKER_PROMPT_VERSION,
            latencyMs: result.latencyMs,
            costUsd: spent,
          },
        };
      }
    }
    return {
      status: 'unavailable',
      reason: 'exhausted',
      provenance: { adapter: 'live', costUsd: spent },
    };
  }
}
