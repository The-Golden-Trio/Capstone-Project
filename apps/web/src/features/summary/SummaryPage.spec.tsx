import { renderWithProviders } from '../../test/renderWithProviders';
import { screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { RunSummary } from '../../api/types';
import SummaryPage from './SummaryPage';

const { summaryState } = vi.hoisted(() => ({
  summaryState: { data: null as RunSummary | null },
}));
vi.mock('../../api/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/hooks')>()),
  useMe: () => ({ data: { dateOfBirth: '2008-06-01' } }),
  useRun: () => ({
    data: { cast: [{ slot: 'mentor', name: 'anh An', relation: 'mentor' }] },
  }),
  useRunSummary: () => ({ data: summaryState.data, isLoading: false }),
}));
function summary(status: RunSummary['grade']['status']): RunSummary {
  return {
    runId: 'sample',
    title: 'Ca API chậm',
    occupationCode: 'SWE_BACKEND',
    occupationName: 'Back-end',
    levelNo: 3,
    enrolmentId: null,
    reflection: { prompts: [], answered: true },
    story: {
      seedId: 'SWE_BACKEND.L3.m2',
      title: 'Ca API chậm',
      goal: 'Điều tra sự cố',
      endedAt: '12:00',
      graded: false,
      nodes: [],
      actions: [
        { time: '10:00', label: 'Đọc log sự cố', points: 1, cut: false },
      ],
      facts: {
        found: [{ text: 'Có 901 query', time: '10:00' }],
        requiredMissed: 1,
      },
      promises: [],
      concerns: [],
      artefacts: [],
      review: [],
      hintsUsed: 0,
    },
    grade: {
      status,
      score: null,
      ending: null,
      feedback: null,
      softSkills: [],
      keywordsGained: [],
    },
  };
}
describe('Tổng kết khi worker chưa trả điểm', () => {
  it.each(['PENDING', 'NOT_AVAILABLE'] as const)(
    '%s vẫn hiện diễn biến và không giả điểm 0',
    (status) => {
      summaryState.data = summary(status);
      renderWithProviders(
        <Routes>
          <Route path="/play/:runId/summary" element={<SummaryPage />} />
        </Routes>,
        '/play/sample/summary',
      );
      expect(
        screen.getByText(
          status === 'PENDING'
            ? 'Ba giám khảo AI đang đọc câu trả lời của bạn'
            : 'Ca này chưa có điểm',
        ),
      ).toBeTruthy();
      expect(
        screen.getByRole('heading', { name: 'Nhìn lại ca làm' }),
      ).toBeTruthy();
      expect(screen.getByText('Đọc log sự cố')).toBeTruthy();
      expect(screen.getByText('Có 901 query')).toBeTruthy();
      expect(screen.queryByRole('img', { name: /^Điểm màn:/ })).toBeNull();
      expect(screen.queryByRole('heading', { name: 'Nhận xét' })).toBeNull();
      expect(
        screen.queryByRole('heading', { name: 'Điểm cộng trừ trong ca này' }),
      ).toBeNull();
      expect(Boolean(document.querySelector('[aria-busy="true"]'))).toBe(
        status === 'PENDING',
      );
    },
  );
});

describe('Báo cáo cuối ca khi có điểm', () => {
  it('giữ điểm mẫu, nhãn AI, điểm kỹ năng, keyword và đường về nghề', () => {
    const s = summary('READY');
    s.grade.score = 80;
    s.grade.ending = {
      type: 'GOOD',
      title: 'Đã có hướng xử lý',
      text: 'Kết cục mẫu để xem trước giao diện.',
    };
    s.grade.feedback = {
      result: 'Đã tìm đủ dữ kiện.',
      comment: 'Đã báo tiến độ.',
      improve: 'Kiểm tra trên staging.',
    };
    s.grade.softSkills = [
      {
        id: 'giao_tiep_hop_tac',
        delta: 270,
        zodiacBonus: 30,
        pointsAfter: 770,
        tierBefore: 0,
        tierAfter: 1,
      },
    ];
    s.grade.keywordsGained = [{ id: 'api', name: 'Dùng API', level: 1 }];
    summaryState.data = s;
    renderWithProviders(
      <Routes>
        <Route path="/play/:runId/summary" element={<SummaryPage />} />
      </Routes>,
      '/play/sample/summary',
    );
    expect(
      screen.getByRole('img', { name: 'Điểm màn: 80 trên 100' }),
    ).toBeTruthy();
    expect(screen.getByText('Báo cáo cuối ca')).toBeTruthy();
    expect(
      screen.getByText(
        'Ca xem thử: điểm chỉ để bạn thấy cách tính, không cộng vào hồ sơ.',
        { exact: false },
      ),
    ).toBeTruthy();
    expect(
      screen.getByText('Kết cục mẫu để xem trước giao diện.'),
    ).toBeTruthy();
    // Bản demo chấm bằng heuristic mẫu: phải ghi rõ là điểm mẫu, không nói AI chấm (D-92).
    expect(screen.getByText('Điểm mẫu · bản xem thử')).toBeTruthy();
    expect(
      screen.getByText(/Bản xem thử: điểm và nhận xét ở đây là mẫu/),
    ).toBeTruthy();
    expect(
      screen.queryByText('Nội dung hoặc đánh giá này do AI tạo.'),
    ).toBeNull();
    expect(screen.getByText('Dữ liệu mẫu')).toBeTruthy();
    expect(
      screen.getByText(
        'Kết quả chỉ để bạn tham khảo, không gửi cho trường hay nhà tuyển dụng.',
      ),
    ).toBeTruthy();
    for (const name of ['Kết quả', 'Nhận xét', 'Hướng cải thiện'])
      expect(screen.getByRole('heading', { name })).toBeTruthy();
    expect(screen.getByText('+270')).toBeTruthy();
    expect(screen.getByText('gồm +30 từ Song Tử')).toBeTruthy();
    expect(
      screen.getByRole('progressbar', { name: /Tiến độ bậc 1/ }),
    ).toBeTruthy();
    expect(screen.getByText('Dùng API')).toBeTruthy();
    const mentor = screen.getByRole('complementary', {
      name: 'Đồng nghiệp cuối ca',
    });
    // Kết cục chỉ hiện một lần ở tiêu đề, đồng nghiệp đứng cạnh không lặp lại (giảm chữ).
    expect(within(mentor).queryByText('Đã có hướng xử lý')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Đã có hướng xử lý' }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Về đảo của cấp này' })
        .getAttribute('href'),
    ).toBe('/occupations/SWE_BACKEND');
    expect(
      screen
        .getByRole('link', { name: 'Xem lộ trình nghề' })
        .getAttribute('href'),
    ).toBe('/occupations/SWE_BACKEND/levels');
  });

  it('giữ lời hứa, băn khoăn, tài liệu và lời nhìn lại nguyên văn', () => {
    const s = summary('READY');
    s.enrolmentId = 'enrolled';
    s.story.promises = [{ label: 'Báo lại lúc 11:30', status: 'kept' }];
    s.story.concerns = [
      { person: 'anh An', text: 'Cần có rollback.', resolved: true },
    ];
    s.story.artefacts = [
      {
        title: 'Ghi chú sự cố',
        status: 'saved',
        fields: [{ label: 'Nguyên nhân', text: 'Truy vấn N+1.' }],
      },
    ];
    s.story.review = [
      {
        person: 'chị Linh',
        question: 'Khi nào báo lại?',
        answer: 'Em báo lúc 11:30.',
      },
    ];
    summaryState.data = s;
    renderWithProviders(
      <Routes>
        <Route path="/play/:runId/summary" element={<SummaryPage />} />
      </Routes>,
      '/play/sample/summary',
    );
    for (const text of [
      'Báo lại lúc 11:30',
      'Đã giữ lời',
      'Cần có rollback.',
      'Đã gỡ',
      'Ghi chú sự cố',
      'Truy vấn N+1.',
      'Em báo lúc 11:30.',
    ])
      expect(screen.getByText(text)).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Về đảo của cấp này' })
        .getAttribute('href'),
    ).toBe('/islands/enrolled');
    expect(screen.queryByText(/Ca xem thử:/)).toBeNull();
  });
});
