/**
 * AI-4 bản 2 cho ca làm: viết nhịp thoại cho đúng việc engine giao
 * (`reply`, `bridge`, `reaction`, `probe`), qua model gateway.
 *
 * Bậc dự phòng theo D-108, như `NarratorService` của bản 1:
 *   - sai khuôn hay vi phạm R1/R2/R4 → bắt viết lại, nói rõ luật nào, tối đa
 *     2 lần trên một model;
 *   - lỗi hạ tầng → sang model kế trong chuỗi;
 *   - hết model, hết giờ, hết ngân sách → `unavailable`: engine tạm dừng
 *     phiên, giữ tiến độ (D-92). Không có lời viết sẵn thay thế.
 *
 * Câu người chơi được khử định danh trước khi gửi (DC-03, D-110).
 */
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { deidentify, shift, type KnownIdentity } from '@datn/game-core';
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
import { NARRATOR_PROFILE } from '../narrator/narrator.profile';
import { AI_CLOCK, NARRATOR_CHAIN } from '../narrator/narrator.service';
import {
  SHIFT_NARRATOR_ENGINE_NOTES,
  SHIFT_NARRATOR_PROMPT_VERSION,
  SHIFT_NARRATOR_SYSTEM,
  SHIFT_PLAYER_TAG,
} from './prompts/narrator.v2-draft';
import type { AiCallOptions, AiOutcome, ShiftNarrator } from './types';

/** Nhiều nhịp hơn bản 1 (một câu) nên trần token cao hơn. Giá trị khởi đầu, chưa đo. */
const MAX_OUTPUT_TOKENS = 900;

export function asShiftPlayerData(text: string): string {
  const safe = text.replace(/</g, '‹').replace(/>/g, '›');
  return `<${SHIFT_PLAYER_TAG}>\n${safe}\n</${SHIFT_PLAYER_TAG}>`;
}

/** Khử định danh mọi chữ của người chơi trong hồ sơ gửi đi. */
export function cleanRequest(
  req: shift.NarrateRequest,
  identity?: KnownIdentity,
): shift.NarrateRequest {
  const clean = (t: string) => deidentify(t, identity).text;
  return {
    ...req,
    playerText: req.playerText ? clean(req.playerText) : undefined,
    recent: req.recent.map((l) =>
      l.speaker === 'player' ? { ...l, text: clean(l.text) } : l,
    ),
  };
}

export function buildShiftNarratorMessages(
  req: shift.NarrateRequest,
): ChatMessage[] {
  const { playerText, ...context } = req;
  const body = {
    task: context.task,
    speaker: context.slot,
    present: context.present,
    max_beats: context.maxBeats,
    hook: context.hook,
    guidance: context.guidance,
    scene: context.scene,
    company: context.company,
    profile: context.profile,
    known_facts: context.knownFacts,
    may_reveal: context.mayReveal,
    confirm_only: context.confirmOnly,
    limits: context.limits,
    story_flags: context.flags,
    recent: context.recent,
    ambient: context.ambient,
  };
  return [
    {
      role: 'system',
      parts: [
        {
          text: `${SHIFT_NARRATOR_SYSTEM}\n\n${SHIFT_NARRATOR_ENGINE_NOTES}`,
          cacheBreakpoint: true,
        },
      ],
    },
    {
      role: 'user',
      parts: [
        { text: JSON.stringify(body) },
        {
          text: playerText
            ? asShiftPlayerData(playerText)
            : '(Người chơi chưa nói gì ở lượt này.)',
        },
      ],
    },
  ];
}

@Injectable()
export class ShiftNarratorService implements ShiftNarrator {
  private readonly logger = new Logger('AI-4 ca làm');

  constructor(
    private readonly gateway: ModelGateway,
    private readonly breaker: CircuitBreaker,
    @Inject(NARRATOR_CHAIN) private readonly chain: readonly ModelSpec[],
    @Optional() @Inject(AI_CLOCK) private readonly clock: Clock = systemClock,
  ) {}

  async narrate(
    raw: shift.NarrateRequest,
    opts: AiCallOptions = {},
  ): Promise<AiOutcome<shift.Beat[]>> {
    const req = cleanRequest(raw, opts.identity);
    const deadline = this.clock.now() + NARRATOR_PROFILE.deadlineMs;
    const available = this.chain.filter(
      (spec) => !this.breaker.isOpen(spec.provider),
    );
    if (available.length === 0)
      return { status: 'unavailable', reason: 'no_model' };

    let spent = 0;

    for (const spec of available) {
      let messages = buildShiftNarratorMessages(req);
      for (let round = 0; round <= NARRATOR_PROFILE.maxRegenerations; round++) {
        const remaining = deadline - this.clock.now();
        if (remaining < NARRATOR_PROFILE.minAttemptMs)
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
            temperature: NARRATOR_PROFILE.temperature[spec.provider],
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            json: {
              name: 'shift_narration',
              schema: shift.shiftNarrationJsonSchema(req),
            },
            timeoutMs: Math.min(NARRATOR_PROFILE.attemptTimeoutMs, remaining),
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

        const check = shift.checkShiftNarration(
          result.text,
          req,
          result.finishReason,
          opts.castNames,
        );
        if (check.beats && check.violations.length === 0)
          return {
            status: 'ok',
            value: check.beats,
            provenance: {
              adapter: 'live',
              model: spec.key,
              promptVersion: SHIFT_NARRATOR_PROMPT_VERSION,
              latencyMs: result.latencyMs,
              costUsd: spent,
            },
          };
        this.logger.warn(
          `${spec.key}: viết lại (${check.violations.map((v) => v.rule).join(', ')})`,
        );
        messages = [
          ...messages,
          { role: 'assistant', parts: [{ text: result.text }] },
          {
            role: 'user',
            parts: [
              {
                text: `Lời vừa viết vi phạm luật, viết lại:\n${check.violations.map((v) => `- ${v.rule}: ${v.feedback}`).join('\n')}`,
              },
            ],
          },
        ];
      }
    }
    return {
      status: 'unavailable',
      reason: 'exhausted',
      provenance: {
        adapter: 'live',
        promptVersion: SHIFT_NARRATOR_PROMPT_VERSION,
        costUsd: spent,
      },
    };
  }
}
