import { describe, expect, it } from 'vitest';
import { REDACTION_LABEL, deidentify } from './deidentify.js';

describe('mẫu nhận diện được bất kỳ ai', () => {
  it.each([
    ['email', 'Mail em là duc.nguyen+jq@gmail.com nhé', 'email'],
    ['link', 'Xem ở https://github.com/duc/repo?tab=1 đi', 'link'],
    ['số điện thoại có dấu cách', 'Gọi em 0912 345 678', 'phone'],
    ['số điện thoại +84', 'Gọi +84 912345678', 'phone'],
    ['số điện thoại có dấu chấm', 'Zalo 0912.345.678', 'phone'],
    ['CCCD 12 số', 'CCCD 079201001234', 'id_number'],
    ['CMND 9 số', 'CMND cũ 123456789', 'id_number'],
  ] as const)('%s', (_, text, kind) => {
    const out = deidentify(text);
    expect(out.redactions[kind]).toBe(1);
    expect(out.text).toContain(REDACTION_LABEL[kind]);
  });

  it('không đụng vào số liệu bình thường của câu trả lời', () => {
    const text = 'p95 từ 200ms lên 4.2s, khách có 900 đơn, sửa trước 11:40.';
    expect(deidentify(text)).toEqual({ text, redactions: {} });
  });
});

describe('những gì nền tảng biết về người chơi', () => {
  const known = { names: ['Nguyễn Văn Đức', 'Đức'], usernames: ['ducnv09'], emails: ['duc@school.edu.vn'] };

  it('bắt tên dù gõ không dấu, khác hoa thường', () => {
    const out = deidentify('Em là nguyen van duc, lớp 11A2.', known);
    expect(out.text).toBe(`Em là ${REDACTION_LABEL.known_name}, lớp 11A2.`);
  });

  it('tên dài thay trước tên ngắn', () => {
    const out = deidentify('Nguyễn Văn Đức đây, cứ gọi Đức.', known);
    expect(out.text).toBe(`${REDACTION_LABEL.known_name} đây, cứ gọi ${REDACTION_LABEL.known_name}.`);
    expect(out.redactions.known_name).toBe(2);
  });

  it('người chơi tên Minh vẫn viết được chữ "mình"', () => {
    const minh = { names: ['Minh'] };
    expect(deidentify('Bên mình chưa có index cho bảng này.', minh).text).toBe(
      'Bên mình chưa có index cho bảng này.',
    );
    expect(deidentify('Minh đây, minh gõ không dấu.', minh).redactions.known_name).toBe(2);
  });

  it('không thay chữ chỉ tình cờ chứa tên', () => {
    expect(deidentify('Đứng lên xử lý đi.', known).text).toBe('Đứng lên xử lý đi.');
  });

  it('username và email đã biết', () => {
    const out = deidentify('Acc ducnv09, mail duc@school.edu.vn', known);
    expect(out.text).not.toMatch(/ducnv09|duc@/);
  });

  it('nhãn thay thế không chứa chữ số, để R1 không coi là số bịa', () => {
    for (const label of Object.values(REDACTION_LABEL)) expect(label).not.toMatch(/\d/);
  });
});
