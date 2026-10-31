import { FakeClock } from '../testing/fake-model';
import { CircuitBreaker } from './circuit-breaker';

describe('CircuitBreaker', () => {
  it('ngắt sau 3 lỗi liên tiếp, mở lại sau 30 s', () => {
    const clock = new FakeClock();
    const breaker = new CircuitBreaker(clock);
    breaker.recordFailure('qwen', 'timeout');
    breaker.recordFailure('qwen', 'server');
    expect(breaker.isOpen('qwen')).toBe(false);
    breaker.recordFailure('qwen', 'overloaded');
    expect(breaker.isOpen('qwen')).toBe(true);

    clock.advance(30_000);
    expect(breaker.isOpen('qwen')).toBe(false);
  });

  it('hết thời gian ngắt chỉ cho MỘT lượt thử: thử hỏng là ngắt lại ngay', () => {
    const clock = new FakeClock();
    const breaker = new CircuitBreaker(clock);
    for (let i = 0; i < 3; i++) breaker.recordFailure('qwen', 'timeout');
    clock.advance(30_000);
    breaker.recordFailure('qwen', 'timeout');
    expect(breaker.isOpen('qwen')).toBe(true);
  });

  it('một lần thành công xoá đếm lỗi', () => {
    const breaker = new CircuitBreaker(new FakeClock());
    breaker.recordFailure('qwen', 'timeout');
    breaker.recordFailure('qwen', 'timeout');
    breaker.recordSuccess('qwen');
    breaker.recordFailure('qwen', 'timeout');
    expect(breaker.isOpen('qwen')).toBe(false);
  });

  it('sai key, hết tiền: ngắt ngay 5 phút — thử lại sớm cũng vô ích', () => {
    const clock = new FakeClock();
    const breaker = new CircuitBreaker(clock);
    breaker.recordFailure('deepseek', 'quota');
    expect(breaker.isOpen('deepseek')).toBe(true);
    clock.advance(60_000);
    expect(breaker.isOpen('deepseek')).toBe(true);
  });

  it('nội dung bị lọc hay body sai không nói gì về sức khoẻ của hãng', () => {
    const breaker = new CircuitBreaker(new FakeClock());
    for (let i = 0; i < 5; i++) breaker.recordFailure('qwen', 'content_filtered');
    for (let i = 0; i < 5; i++) breaker.recordFailure('qwen', 'bad_request');
    expect(breaker.isOpen('qwen')).toBe(false);
  });

  it('mỗi hãng một mạch riêng', () => {
    const breaker = new CircuitBreaker(new FakeClock());
    for (let i = 0; i < 3; i++) breaker.recordFailure('qwen', 'server');
    expect(breaker.isOpen('deepseek')).toBe(false);
  });
});
