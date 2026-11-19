/**
 * Claude nhận kiểu "có thể null" bằng `anyOf`, GPT và Gemini nhận dạng mảng
 * `type: [..., "null"]`. Test khoá body gửi đi cho từng họ, qua adapter thật,
 * để đổi riêng họ Anthropic mà không làm lệch hai họ kia.
 */
import { CHECKER_JSON_SCHEMA } from '../shift/checker.service';
import { openRouterAdapter } from './adapters';
import { toAnthropicSchema } from './anthropic-schema';
import type { ChatRequest } from './gateway.types';
import { JUDGE_FAMILIES, judgePanel } from './models';

const SLOTS = judgePanel({
  openrouter: { apiKey: 'or' },
  allowUnconfirmedProviders: false,
}).slots;

const request = (index: number, tier: 0 | 1 = 0): ChatRequest => ({
  model: SLOTS[index].chain[tier],
  messages: [
    { role: 'system', parts: [{ text: 'luật json' }] },
    { role: 'user', parts: [{ text: 'câu hỏi' }] },
  ],
  temperature: 0,
  maxOutputTokens: 800,
  json: { name: 'checks', schema: CHECKER_JSON_SCHEMA },
  timeoutMs: 30_000,
});

const schemaOf = (body: Record<string, unknown>): unknown =>
  (body['response_format'] as { json_schema: { schema: unknown } }).json_schema
    .schema;

/** Mọi giá trị của khoá `type` trong schema, ở mọi tầng. */
function typeValues(node: unknown): unknown[] {
  if (Array.isArray(node)) return node.flatMap(typeValues);
  if (!node || typeof node !== 'object') return [];
  return Object.entries(node).flatMap(([key, value]) =>
    key === 'type' ? [value] : typeValues(value),
  );
}

describe('toAnthropicSchema', () => {
  it('đổi type mảng có null thành anyOf, enum chia theo kiểu', () => {
    expect(
      toAnthropicSchema({
        type: ['string', 'null'],
        enum: ['call', 'chat', null],
      }),
    ).toEqual({
      anyOf: [{ type: 'string', enum: ['call', 'chat'] }, { type: 'null' }],
    });
  });

  it('giữ nguyên chuỗi có thể null khi không có enum, mô tả ở ngoài anyOf', () => {
    expect(
      toAnthropicSchema({ type: ['string', 'null'], description: 'ghi chú' }),
    ).toEqual({
      description: 'ghi chú',
      anyOf: [{ type: 'string' }, { type: 'null' }],
    });
  });

  it('bỏ nhánh null khi enum không có null', () => {
    expect(
      toAnthropicSchema({ type: ['string', 'null'], enum: ['a', 'b'] }),
    ).toEqual({ type: 'string', enum: ['a', 'b'] });
  });

  it('type mảng một phần tử thành chuỗi', () => {
    expect(toAnthropicSchema({ type: ['string'] })).toEqual({ type: 'string' });
  });

  it('đi vào properties, items, anyOf, $defs; không đụng tên thuộc tính trùng từ khoá', () => {
    expect(
      toAnthropicSchema({
        type: 'object',
        properties: {
          type: { type: ['string', 'null'] },
          enum: { type: 'array', items: { type: ['integer', 'null'] } },
        },
        required: ['type', 'enum'],
        additionalProperties: false,
      }),
    ).toEqual({
      type: 'object',
      properties: {
        type: { anyOf: [{ type: 'string' }, { type: 'null' }] },
        enum: {
          type: 'array',
          items: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        },
      },
      required: ['type', 'enum'],
      additionalProperties: false,
    });
  });

  it('schema không có type mảng thì trả về y nguyên, không sửa đối tượng gốc', () => {
    const plain = {
      type: 'object',
      properties: { a: { type: 'string', enum: ['x'] } },
      required: ['a'],
      additionalProperties: false,
    };
    const before = JSON.stringify(plain);
    expect(toAnthropicSchema(plain)).toEqual(plain);
    expect(JSON.stringify(plain)).toBe(before);
  });
});

describe('OpenRouter — body theo họ judge', () => {
  it('Claude: khuôn của bộ phán không còn type dạng mảng, trường bắt buộc giữ nguyên', () => {
    const body = openRouterAdapter.body(request(0));
    expect(typeValues(schemaOf(body)).some(Array.isArray)).toBe(false);
    const item = (
      schemaOf(body) as {
        properties: {
          answers: {
            items: { required: string[]; properties: Record<string, unknown> };
          };
        };
      }
    ).properties.answers.items;
    expect(item.required).toEqual([
      'flag',
      'quote',
      'answer',
      'time',
      'event',
      'channel',
    ]);
    expect(item.properties['channel']).toEqual({
      anyOf: [{ type: 'string', enum: ['call', 'chat'] }, { type: 'null' }],
    });
    expect(item.properties['quote']).toEqual({
      anyOf: [{ type: 'string' }, { type: 'null' }],
    });
  });

  it.each([1, 2])(
    'GPT và Gemini (ghế %i): khuôn gửi đi y nguyên bản gốc',
    (index) => {
      expect(schemaOf(openRouterAdapter.body(request(index)))).toEqual(
        CHECKER_JSON_SCHEMA,
      );
    },
  );

  it('cả bậc dự phòng của Claude cũng đổi khuôn', () => {
    expect(schemaOf(openRouterAdapter.body(request(0, 1)))).toEqual(
      schemaOf(openRouterAdapter.body(request(0))),
    );
  });

  it('phần còn lại của body không khác giữa ba họ ngoài model, endpoint và mức suy nghĩ', () => {
    const rest = (index: number) => {
      const body = openRouterAdapter.body(request(index));
      const {
        model: _model,
        reasoning: _reasoning,
        provider,
        response_format: format,
        ...others
      } = body as Record<string, unknown> & {
        provider: Record<string, unknown>;
        response_format: { json_schema: Record<string, unknown> };
      };
      const { schema: _schema, ...jsonSchema } = format.json_schema;
      const { only: _only, ...routing } = provider;
      return { others, jsonSchema, routing };
    };
    expect(JUDGE_FAMILIES).toHaveLength(3);
    expect(rest(0)).toEqual(rest(1));
    expect(rest(2)).toEqual(rest(1));
    expect(rest(0).jsonSchema).toEqual({ name: 'checks', strict: true });
    expect(rest(0).routing).toMatchObject({
      allow_fallbacks: false,
      require_parameters: true,
      data_collection: 'deny',
      zdr: true,
    });
    expect(rest(0).others).toMatchObject({ max_tokens: 800, stream: false });
    expect(rest(0).others).not.toHaveProperty('temperature');
    expect(openRouterAdapter.body(request(0))['reasoning']).toEqual({
      effort: 'none',
    });
  });
});
