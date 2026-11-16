import { renderWithProviders } from '../../test/renderWithProviders';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { RunSummary } from '../../api/types';
import SummaryPage from './SummaryPage';

const { summaryState } = vi.hoisted(() => ({
  summaryState: { data: null as RunSummary | null },
}));
vi.mock('../../api/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/hooks')>()),
  useMe: () => ({ data: null }),
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
