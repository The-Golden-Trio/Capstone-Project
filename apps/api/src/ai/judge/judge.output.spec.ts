import { checkJudgeOutput, quoteFound } from './judge.output';

const ANSWER =
  'Em sửa bug rồi deploy luôn,\nchắc không sao đâu. Tại anh Minh viết code ẩu.';

const out = (...criteria: Array<Record<string, unknown>>) =>
  JSON.stringify({ criteria });
const item = (over: Record<string, unknown> = {}) => ({
  criterion_id: 'k1',
  quote: 'deploy luôn, chắc không sao đâu',
  rationale: 'Không kiểm tra trước khi deploy.',
  level: '0',
  counterproductive: false,
  ...over,
});

const check = (raw: string, ids = ['k1']) =>
  checkJudgeOutput(raw, { criterionIds: ids, answer: ANSWER });

describe('checkJudgeOutput', () => {
  it('nhận kết quả đúng, đổi mức chuỗi sang số', () => {
    const r = check(out(item({ level: '2' })));
    expect(r).toEqual({
      ok: true,
      judgments: [
        {
          criterionId: 'k1',
          score: 2,
          counterproductive: false,
          quote: 'deploy luôn, chắc không sao đâu',
          rationale: 'Không kiểm tra trước khi deploy.',
        },
      ],
    });
  });

  it('J1: câu trích bịa thì loại', () => {
    const r = check(out(item({ quote: 'em kiểm tra trên staging trước' })));
    expect(r).toMatchObject({ ok: false, problems: [{ rule: 'J1' }] });
  });

  it('J1: có mức mà không trích thì loại; không xét thì được để trống', () => {
    expect(check(out(item({ quote: '' })))).toMatchObject({
      ok: false,
      problems: [{ rule: 'J1' }],
    });
    expect(check(out(item({ quote: '', level: 'khong_xet' })))).toMatchObject({
      ok: true,
      judgments: [{ score: null }],
    });
  });

  it('J1: cờ phản tác dụng phải có câu trích', () => {
    const r = check(
      out(item({ quote: '', level: 'khong_xet', counterproductive: true })),
    );
    expect(r).toMatchObject({ ok: false, problems: [{ rule: 'J1' }] });
    expect(
      check(
        out(
          item({ quote: 'Tại anh Minh viết code ẩu', counterproductive: true }),
        ),
      ),
    ).toMatchObject({ ok: true });
  });

  it('so nguyên văn sau khi chuẩn hoá NFC và khoảng trắng, còn lại phải khớp từng ký tự', () => {
    expect(quoteFound('deploy luôn, chắc', ANSWER)).toBe(true);
    // "ô" viết dạng tổ hợp (o + dấu mũ) vẫn là cùng chữ.
    expect(quoteFound('deploy luôn', ANSWER)).toBe(true);
    expect(quoteFound('Deploy luôn', ANSWER)).toBe(false);
  });

  it('J2: thiếu, thừa hay lặp tiêu chí thì loại', () => {
    expect(check(out(item()), ['k1', 'k2'])).toMatchObject({
      ok: false,
      problems: [{ rule: 'J2', detail: 'thiếu tiêu chí "k2"' }],
    });
    expect(check(out(item(), item({ criterion_id: 'k9' })))).toMatchObject({
      ok: false,
      problems: [{ rule: 'J2' }],
    });
    expect(check(out(item(), item()))).toMatchObject({
      ok: false,
      problems: [{ rule: 'J2' }],
    });
  });

  it('J3: sai khuôn, sai thang, bị cắt thì loại', () => {
    expect(check('Điểm: 2')).toMatchObject({
      ok: false,
      problems: [{ rule: 'J3' }],
    });
    expect(check(out(item({ level: '3' })))).toMatchObject({
      ok: false,
      problems: [{ rule: 'J3' }],
    });
    expect(
      checkJudgeOutput(out(item()), {
        criterionIds: ['k1'],
        answer: ANSWER,
        finishReason: 'length',
      }),
    ).toMatchObject({ ok: false, problems: [{ rule: 'J3' }] });
  });

  it('chấp nhận json bọc trong ```json', () => {
    expect(check('```json\n' + out(item()) + '\n```')).toMatchObject({
      ok: true,
    });
  });
});
