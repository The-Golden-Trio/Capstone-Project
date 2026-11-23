import { renderWithProviders } from '../../test/renderWithProviders';
import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { RunSummary } from '../../api/types';
import SummaryPage from './SummaryPage';

const { summaryState } = vi.hoisted(() => ({
  summaryState: { data: null as RunSummary | null, refetch: vi.fn() },
}));
vi.mock('../../api/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/hooks')>()),
  useMe: () => ({ data: { dateOfBirth: '2008-06-01' } }),
  useRun: () => ({
    data: { cast: [{ slot: 'mentor', name: 'anh An', relation: 'mentor' }] },
  }),
  useRunSummary: () => ({
    data: summaryState.data,
    isLoading: false,
    isFetching: false,
    error: new Error('Mất kết nối'),
    refetch: summaryState.refetch,
  }),
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
        {
          time: '10:00',
          label: 'Đọc log sự cố',
          points: 1,
          cut: false,
        },
      ],
      timeline: [
        {
          time: '10:00–10:05',
          label: 'Đọc log sự cố',
          kind: 'action',
          points: 1,
          remaining: 27,
          interrupts: [],
        },
        {
          time: '10:50–10:55',
          ref: 'n1',
          label: 'Chị Linh đòi một giờ chắc chắn.',
          kind: 'node',
          points: 1,
          remaining: 26,
          interrupts: [],
        },
        {
          time: '11:05–11:30',
          label: 'Sửa lại bản vá',
          kind: 'action',
          points: 5,
          remaining: 21,
          interrupts: [
            { ref: 'e1', label: 'Chị Linh nhắn', points: 1 },
            { ref: 'n2', label: 'Ghi chú sự cố', points: 1 },
          ],
        },
      ],
      pointsUsed: 7,
      budget: 28,
      facts: {
        found: [{ text: 'Có 901 query', time: '10:00' }],
        notOpened: [{ text: 'Máy tính bảng dùng app 2.x', required: false }],
        requiredMissed: 1,
      },
      flags: [],
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
      expect(screen.queryByText('Kỹ năng', { selector: 'summary' })).toBeNull();
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
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Ca API chậm' }),
    );
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
    for (const link of screen.getAllByRole('link', { name: /^Về hồ sơ nghề$/ }))
      expect(link.getAttribute('href')).toBe('/occupations/SWE_BACKEND');
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
        .getAllByRole('link', { name: /^Về đảo của cấp này$/ })
        .every((link) => link.getAttribute('href') === '/islands/enrolled'),
    ).toBe(true);
    expect(screen.queryByText(/Ca xem thử:/)).toBeNull();
  });
});

it('allows retrying a failed summary without sending the player away', () => {
  summaryState.data = null;
  summaryState.refetch.mockClear();
  renderWithProviders(
    <Routes>
      <Route path="/play/:runId/summary" element={<SummaryPage />} />
    </Routes>,
    '/play/sample/summary',
  );
  expect(
    screen.getByRole('heading', { name: 'Chưa tải được tổng kết' }),
  ).toBeTruthy();
  expect(screen.getByText('Mất kết nối')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
  expect(summaryState.refetch).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Đường dẫn').textContent).toBe(
    '/play/sample/summary',
  );
});

describe('Phần kể lại ca', () => {
  function open(s: RunSummary, query = '') {
    summaryState.data = s;
    renderWithProviders(
      <Routes>
        <Route path="/play/:runId/summary" element={<SummaryPage />} />
      </Routes>,
      `/play/sample/summary${query}`,
    );
  }

  it('liệt kê việc theo giờ với điểm và số điểm còn lại, dữ kiện đã mở và chưa mở, cờ', () => {
    open(summary('READY'));
    const table = screen.getByRole('table', {
      name: 'Điểm thời gian theo giờ trong truyện',
    });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Giờ', 'Việc', 'Điểm', 'Còn']);
    expect(
      within(table)
        .getAllByRole('cell')
        .map((cell) => cell.textContent),
    ).toEqual([
      '10:00–10:05',
      'Đọc log sự cố',
      '1',
      '27',
      '10:50–10:55',
      'n1Chị Linh đòi một giờ chắc chắn.',
      '1',
      '26',
      '11:05–11:30',
      'Sửa lại bản vá3 lượt việc, bị chen bởi e1 (1) và n2 (1)',
      '5',
      '21',
    ]);
    expect(screen.getByText('Dùng 7/28 lượt, còn 21.')).toBeTruthy();
    expect(screen.getByText('Đã mở (1)')).toBeTruthy();
    expect(screen.getByText('Chưa mở (1)')).toBeTruthy();
    expect(screen.getByText('Máy tính bảng dùng app 2.x')).toBeTruthy();
    expect(screen.getByText('Không có cờ nào được bật.')).toBeTruthy();
  });

  it('không có câu hỏi nhìn lại thì bỏ phần "Hỏi lại sau ca"', () => {
    open(summary('READY'));
    expect(screen.queryByText('Hỏi lại sau ca')).toBeNull();
  });

  it('chỉ hiện bảng chấm dự kiến khi bản tổng kết mang theo, kèm nhãn không phải AI chấm', () => {
    const plain = summary('READY');
    open(plain);
    expect(
      screen.queryByText('Kết quả mẫu cho demo, không phải AI chấm'),
    ).toBeNull();
    cleanup();
    open({
      ...plain,
      sampleChecklist: {
        seed: 'SWE_BACKEND.L3.m2',
        items: [
          {
            code: '4.2',
            name: 'Tìm nguyên nhân gốc',
            level: 2,
            evidence: ['A: “901 lần”'],
          },
        ],
      },
    });
    expect(
      screen.getByText('Kết quả mẫu cho demo, không phải AI chấm'),
    ).toBeTruthy();
    expect(screen.getByText('A: “901 lần”')).toBeTruthy();
  });

  it('người chơi thường thấy phần nhìn lại ca đóng sẵn', () => {
    open(summary('READY'));
    expect(document.getElementById('nhin-lai-ca')?.hasAttribute('open')).toBe(
      false,
    );
  });

  it('lượt chơi mẫu (?autoplay) mở sẵn phần nhìn lại ca và cuộn tới bảng chấm dự kiến', () => {
    const scrolled: string[] = [];
    vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(
      function (this: HTMLElement) {
        scrolled.push(this.id);
      },
    );
    open(
      {
        ...summary('READY'),
        sampleChecklist: {
          seed: 'SWE_BACKEND.L3.m2',
          items: [
            {
              code: '4.2',
              name: 'Tìm nguyên nhân gốc',
              level: 2,
              evidence: [],
            },
          ],
        },
      },
      '?autoplay=lan',
    );
    expect(document.getElementById('nhin-lai-ca')?.hasAttribute('open')).toBe(
      true,
    );
    expect(scrolled).toContain('cham-du-kien');
  });
});
