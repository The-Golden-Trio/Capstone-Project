import { Inject, Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { CircuitBreaker } from '../gateway/circuit-breaker';
import { costOf } from '../gateway/cost';
import {
  GatewayError,
  type ChatMessage,
  type ModelSpec,
} from '../gateway/gateway.types';
import { ModelGateway } from '../gateway/model-gateway';
import { NARRATOR_CHAIN } from '../narrator/narrator.service';
import {
  DEFAULT_GENERATION_SYSTEM,
  DEFAULT_REVISION_SYSTEM,
  generationMessages,
  revisionMessages,
} from './generation.prompt';
import type {
  GenerationBrief,
  GeneratorResult,
  GeneratorUsage,
  RevisionBrief,
  ScenarioGenerator,
} from './generation.types';

/** Thông số gọi model cho việc sinh nội dung (không phải lượt chơi, nên cho dài). */
const PROFILE = {
  temperature: 0.6,
  maxOutputTokens: 8000,
  attemptTimeoutMs: 120_000,
};

/**
 * Sinh nội dung scenario qua gateway (SD-05, CL-04). Dùng chuỗi model họ Qwen
 * của AI-4 (khác họ các judge, DC-01). Model lỗi thì sang model kế cùng vai;
 * hết model thì báo thất bại, không có nội dung thay thế (D-92).
 *
 * `system` cho phép thay prompt mặc định bằng bản của nghề (FR-44).
 */
@Injectable()
export class ScenarioGeneratorService implements ScenarioGenerator {
  private readonly logger = new Logger('AI·generation');

  constructor(
    private readonly gateway: ModelGateway,
    private readonly breaker: CircuitBreaker,
    @Inject(NARRATOR_CHAIN) private readonly chain: readonly ModelSpec[],
  ) {}

  generate(
    brief: GenerationBrief,
    system = DEFAULT_GENERATION_SYSTEM,
  ): Promise<GeneratorResult> {
    return this.run(generationMessages(brief, system), 'scenario_content');
  }

  async revise(
    brief: RevisionBrief,
    system = DEFAULT_REVISION_SYSTEM,
  ): Promise<GeneratorResult> {
    const result = await this.run(
      revisionMessages(brief, system),
      'scenario_revision',
    );
    if (result.status !== 'ok') return result;
    const parsed = z.object({ value: z.unknown() }).safeParse(result.json);
    return parsed.success
      ? { ...result, json: parsed.data.value }
      : { status: 'failed', reason: 'exhausted', usage: result.usage };
  }

  private async run(
    messages: ChatMessage[],
    name: string,
  ): Promise<GeneratorResult> {
    const usage: GeneratorUsage[] = [];
    const available = this.chain.filter(
      (spec) => !this.breaker.isOpen(spec.provider),
    );
    if (!available.length)
      return { status: 'failed', reason: 'no_model', usage };

    for (const spec of available) {
      const started = Date.now();
      try {
        const result = await this.gateway.complete({
          model: spec,
          messages,
          temperature: PROFILE.temperature,
          maxOutputTokens: PROFILE.maxOutputTokens,
          json: { name, schema: { type: 'object' } },
          timeoutMs: PROFILE.attemptTimeoutMs,
        });
        this.breaker.recordSuccess(spec.provider);
        const cost = costOf(result.usage, spec.price);
        let json: unknown;
        try {
          json = JSON.parse(result.text);
        } catch {
          usage.push({
            modelId: spec.key,
            tokensIn: result.usage.input,
            tokensOut: result.usage.output,
            costUsd: cost.usd,
            latencyMs: result.latencyMs,
            succeeded: false,
          });
          continue;
        }
        usage.push({
          modelId: spec.key,
          tokensIn: result.usage.input,
          tokensOut: result.usage.output,
          costUsd: cost.usd,
          latencyMs: result.latencyMs,
          succeeded: true,
        });
        return { status: 'ok', json, usage };
      } catch (err) {
        const error =
          err instanceof GatewayError
            ? err
            : new GatewayError('network', String(err), spec.provider);
        this.breaker.recordFailure(spec.provider, error.kind);
        usage.push({
          modelId: spec.key,
          tokensIn: 0,
          tokensOut: 0,
          costUsd: 0,
          latencyMs: Date.now() - started,
          succeeded: false,
        });
        this.logger.warn(`${spec.key} lỗi (${error.kind}): ${error.message}`);
        if (error.kind === 'content_filtered')
          return { status: 'failed', reason: 'blocked', usage };
      }
    }
    return { status: 'failed', reason: 'exhausted', usage };
  }
}
