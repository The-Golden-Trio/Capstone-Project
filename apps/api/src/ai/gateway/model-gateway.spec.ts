import { FakeClock, fakeTransport } from '../testing/fake-model';
import { GatewayError, type ChatRequest } from './gateway.types';
import { ModelGateway } from './model-gateway';
import { deepseekFlash } from './models';

const request: ChatRequest = {
  model: deepseekFlash(),
  messages: [{ role: 'user', parts: [{ text: 'json' }] }],
  temperature: 1,
  maxOutputTokens: 300,
  json: { name: 'n', schema: {} },
  timeoutMs: 4500,
};

describe('ModelGateway', () => {
  it('gửi key qua header, đúng endpoint, đo thời gian', async () => {
    const clock = new FakeClock();
    const transport = fakeTransport([{ content: '{}', latencyMs: 1200 }], clock);
    const result = await new ModelGateway({ deepseek: 'sk-test' }, transport, clock).complete(request);

    expect(transport.calls[0].url).toBe('https://api.deepseek.com/chat/completions');
    expect(transport.calls[0].headers['Authorization']).toBe('Bearer sk-test');
    expect(result.latencyMs).toBe(1200);
  });

  it('thiếu key thì báo lỗi cấu hình, không gọi mạng', async () => {
    const transport = fakeTransport([{ content: '{}' }], new FakeClock());
    await expect(new ModelGateway({}, transport).complete(request)).rejects.toMatchObject({ kind: 'auth' });
    expect(transport.calls).toHaveLength(0);
  });

  it('quá giờ thành lỗi timeout', async () => {
    const clock = new FakeClock();
    const gateway = new ModelGateway({ deepseek: 'k' }, fakeTransport([{ latencyMs: 9000 }], clock), clock);
    await expect(gateway.complete(request)).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('lỗi mạng thành lỗi network', async () => {
    const clock = new FakeClock();
    const gateway = new ModelGateway({ deepseek: 'k' }, fakeTransport([{ network: true }], clock), clock);
    await expect(gateway.complete(request)).rejects.toMatchObject({ kind: 'network' });
  });

  it('HTTP lỗi đi qua bộ phân loại của adapter', async () => {
    const clock = new FakeClock();
    const gateway = new ModelGateway({ deepseek: 'k' }, fakeTransport([{ status: 402 }], clock), clock);
    const error = await gateway.complete(request).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GatewayError);
    expect(error).toMatchObject({ kind: 'quota', status: 402, provider: 'deepseek' });
  });

  it('đọc được body có dòng trống keep-alive của DeepSeek ở đầu', async () => {
    const body = '\n\n\n' + JSON.stringify({ choices: [{ message: { content: '{}' }, finish_reason: 'stop' }], usage: {} });
    const transport = async () => ({ status: 200, text: async () => body });
    const result = await new ModelGateway({ deepseek: 'k' }, transport).complete(request);
    expect(result.text).toBe('{}');
  });
});
