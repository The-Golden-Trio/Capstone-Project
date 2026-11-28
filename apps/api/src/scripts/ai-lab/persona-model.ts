import { costOf, failedCallCost, upperBoundUsd } from '../../ai/gateway/cost';
import { GatewayError, type ModelSpec } from '../../ai/gateway/gateway.types';
import type { ModelGateway } from '../../ai/gateway/model-gateway';
import { JUDGE_FAMILIES, narratorChain } from '../../ai/gateway/models';
import { personaMessages, type PersonaAgent } from './persona';
import type { PersonaProfile, PlayPolicy } from './persona-cohort';
import type { Runtime } from './ports';

const MAX_OUTPUT_TOKENS = 650;
const TIMEOUT_MS = 20_000;

export function personaModel(runtime: Runtime, family?: string): ModelSpec {
  const judgeFamilies = new Set<string>([
    ...JUDGE_FAMILIES,
    ...runtime.judgeSlots.flatMap((slot) =>
      slot.chain.map((model) => model.family),
    ),
  ]);
  const { chain } = narratorChain(runtime.settings);
  const chosen = chain.find(
    (spec) =>
      !judgeFamilies.has(spec.family) && (!family || spec.family === family),
  );
  if (!chosen)
    throw new Error(
      'Thiếu model persona có cấu hình hợp lệ và khác họ AI-5 (DC-01).',
    );
  return chosen;
}

/** Một sổ chi phí dùng chung, kể cả các ghế judge gọi song song. */
export function limitGateway(gateway: ModelGateway, limitUsd: number) {
  let spent = 0;
  let reserved = 0;
  let denied = 0;
  const complete = gateway.complete.bind(gateway);
  gateway.complete = async (request) => {
    const text = request.messages
      .flatMap((message) => message.parts)
      .map((part) => part.text)
      .join('');
    const bytes =
      Buffer.byteLength(text + JSON.stringify(request.json.schema)) + 256;
    const estimate = upperBoundUsd(
      bytes,
      request.maxOutputTokens,
      request.model.price,
    );
    if (spent + reserved + estimate > limitUsd) {
      denied++;
      throw new GatewayError(
        'quota',
        'Đã đạt giới hạn ngân sách persona lab.',
        request.model.provider,
      );
    }
    reserved += estimate;
    try {
      const result = await complete(request);
      spent += costOf(result.usage, request.model.price).usd;
      return result;
    } catch (error) {
      spent += failedCallCost(
        error instanceof GatewayError ? error.kind : 'network',
        estimate,
      ).usd;
      throw error;
    } finally {
      reserved -= estimate;
    }
  };
  return {
    get spent() {
      return spent;
    },
    get remaining() {
      return Math.max(0, limitUsd - spent - reserved);
    },
    get denied() {
      return denied;
    },
  };
}

export function livePersona(
  gateway: ModelGateway,
  model: ModelSpec,
  budget: ReturnType<typeof limitGateway>,
  policy: PlayPolicy,
  profile: PersonaProfile | undefined,
) {
  const calls: Array<{
    model: string;
    latencyMs: number;
    status: string;
    usage?: unknown;
  }> = [];
  const decide: PersonaAgent = async ({ view, retry, timeoutMs }) => {
    const started = Date.now();
    const denied = budget.denied;
    const fields = [
      ...new Set(
        [
          ...(view.node?.form?.fields ?? []),
          ...view.actions.flatMap((action) => action.form?.fields ?? []),
        ].map((field) => field.id),
      ),
    ];
    try {
      const reply = await gateway.complete({
        model,
        messages: personaMessages(profile, policy, view, retry),
        temperature: 0.4,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        timeoutMs: Math.min(TIMEOUT_MS, timeoutMs),
        json: {
          name: 'persona_step',
          schema: {
            type: 'object',
            properties: {
              do: { type: 'string', enum: view.allowed },
              key: { type: 'string' },
              option: { type: 'string' },
              text: { type: 'string' },
              artefact: { type: 'string' },
              fields: {
                type: 'object',
                properties: Object.fromEntries(
                  fields.map((id) => [id, { type: 'string' }]),
                ),
                additionalProperties: false,
              },
              ticks: { type: 'array', items: { type: 'string' } },
            },
            required: ['do'],
            additionalProperties: false,
          },
        },
      });
      calls.push({
        model: model.key,
        latencyMs: reply.latencyMs,
        status: reply.finishReason,
        usage: reply.usage,
      });
      if (reply.finishReason !== 'stop') return { value: null };
      try {
        return { value: JSON.parse(reply.text) as unknown };
      } catch {
        return { value: null };
      }
    } catch (error) {
      calls.push({
        model: model.key,
        latencyMs: Date.now() - started,
        status:
          budget.denied !== denied
            ? 'budget'
            : error instanceof GatewayError
              ? error.kind
              : 'error',
      });
      return {
        value: null,
        stop:
          budget.denied !== denied
            ? 'budget'
            : Date.now() - started >= timeoutMs
              ? 'deadline'
              : 'model_unavailable',
      };
    }
  };
  return { decide, calls };
}
