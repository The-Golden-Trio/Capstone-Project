import { z } from 'zod';
import type { Transport } from './gateway.types';
import { fetchTransport } from './model-gateway';

const endpoint = 'https://openrouter.ai/api/alpha/decisions';
const probability = z.number().min(0).max(1);

export type DecisionQuestion =
  | { type: 'noul'; instructions: string }
  | { type: 'choice'; instructions: string; criteria: Record<string, string> };

const answerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('noul'),
    noul: probability,
    confidence: probability.optional(),
  }),
  z.object({
    type: z.literal('choice'),
    choice: z.string(),
    probabilities: z.record(z.string(), probability).optional(),
    confidence: probability.optional(),
  }),
  z.object({ type: z.literal('refusal') }),
]);
export type DecisionAnswer = z.infer<typeof answerSchema>;

const responseSchema = z.object({
  id: z.string(),
  model: z.string(),
  provider: z.string(),
  answers: z.record(z.string(), z.unknown()),
  usage: z.object({
    input_tokens: z.number().int().nonnegative(),
    output_tokens: z.number().int().nonnegative(),
    cost: z.number().nonnegative(),
  }),
});

export interface DecisionsRequest {
  model: string;
  state: string;
  questions: Record<string, DecisionQuestion>;
}

export class DecisionsGateway {
  constructor(
    private readonly apiKey: string,
    private readonly transport: Transport = fetchTransport,
  ) {}

  async decide(request: DecisionsRequest, timeoutMs: number) {
    const started = performance.now();
    const response = await this.transport(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(timeoutMs),
      timeoutMs,
    });
    const body = await response.text();
    if (response.status < 200 || response.status >= 300)
      throw new Error('OpenRouter Decisions HTTP ' + response.status);

    const { answers, ...meta } = responseSchema.parse(JSON.parse(body));
    const decisions: Record<string, DecisionAnswer> = {};
    const issues: Record<string, 'missing' | 'refusal' | 'invalid'> = {};
    for (const [id, question] of Object.entries(request.questions)) {
      const raw = Object.hasOwn(answers, id) ? answers[id] : undefined;
      const result = answerSchema.safeParse(raw);
      if (raw === undefined) issues[id] = 'missing';
      else if (!result.success) issues[id] = 'invalid';
      else if (result.data.type === 'refusal') issues[id] = 'refusal';
      else if (
        result.data.type !== question.type ||
        (result.data.type === 'choice' &&
          question.type === 'choice' &&
          !Object.hasOwn(question.criteria, result.data.choice))
      )
        issues[id] = 'invalid';
      else decisions[id] = result.data;
    }
    return {
      ...meta,
      decisions,
      issues,
      latencyMs: Math.round(performance.now() - started),
    };
  }
}
