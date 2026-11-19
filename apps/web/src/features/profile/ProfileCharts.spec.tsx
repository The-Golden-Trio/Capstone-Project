import { fireEvent, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import { api } from '../../api';
import { SkillTrends } from './SkillTrends';
import { RiasecCard } from './RiasecCard';
import { KeywordsCard } from './KeywordsCard';

it('selects a shared run by keyboard and touch-friendly select without mixing group histories', async () => {
  await signInDemo();
  const history = [
    {
      runId: 'a',
      title: 'Ca đầu',
      path: 'Nghề',
      date: '2026-11-15',
      delta: 100,
      zodiacBonus: 12,
      total: 112,
    },
    {
      runId: 'b',
      title: 'Ca sau',
      path: 'Nghề',
      date: '2026-11-16',
      delta: -20,
      zodiacBonus: 0,
      total: 92,
    },
  ];
  const { container } = renderWithProviders(
    <SkillTrends
      skills={[
        {
          id: 'giao_tiep_hop_tac',
          points: 92,
          reachedTier: 0,
          scenarios: 2,
          history,
        },
      ]}
      journal={[]}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Giao tiếp' }));
  expect(container.querySelectorAll('[data-skill-line]')).toHaveLength(7);
  const point = screen.getByRole('button', { name: /Ca 1: Ca đầu/ });
  fireEvent.focus(point);
  expect(screen.getByText(/gồm \+12 từ chòm sao/)).toBeTruthy();
  fireEvent.keyDown(screen.getByRole('button', { name: /Ca 2: Ca sau/ }), {
    key: 'Enter',
  });
  expect(screen.getByText(/−20 điểm · tổng 92/)).toBeTruthy();
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Chọn ca để xem điểm' }),
    { target: { value: 'a' } },
  );
  expect(
    screen.getByRole('link', { name: '#1 · Ca đầu' }).getAttribute('href'),
  ).toBe('/play/a/summary');
  fireEvent.click(screen.getByRole('button', { name: 'Thích ứng' }));
  expect(screen.getByText(/Không chấm nhóm này trong ca đã chọn/)).toBeTruthy();
});

it('shows paired RIASEC columns, signed differences, and missing data explicitly', async () => {
  await signInDemo();
  const record = await api.progress.record();
  record.riasec.self = { R: 2, I: 2, A: 2, S: 2, E: 2, C: 2 };
  record.riasec.afterTrying.R = { mean: 2.3, count: 2 };
  record.riasec.afterTrying.I = { mean: 1.8, count: 1 };
  renderWithProviders(<RiasecCard riasec={record.riasec} />);
  fireEvent.click(
    screen.getByText('Bạn thích kiểu việc nào?', { selector: 'summary' }),
  );
  expect(screen.getByText('+0,3')).toBeTruthy();
  expect(screen.getByText('−0,2')).toBeTruthy();
  expect(screen.getAllByRole('img')).toHaveLength(12);
  expect(
    screen.getAllByRole('img', { name: /chưa có dữ liệu/ }).length,
  ).toBeGreaterThan(0);
});

it('shows grouped keyword depths with counts and a named level legend', async () => {
  await signInDemo();
  const record = await api.progress.record();
  record.keywords = [
    {
      id: 'a',
      name: 'SQL',
      level: 1,
      group: 'Công nghệ',
      regionId: 'cong_nghe',
    },
    {
      id: 'b',
      name: 'API',
      level: 3,
      group: 'Công nghệ',
      regionId: 'cong_nghe',
    },
  ];
  renderWithProviders(<KeywordsCard record={record} />);
  fireEvent.click(
    screen.getByText('Kỹ năng nghề đã mang về', { selector: 'summary' }),
  );
  expect(
    screen.getByRole('img', {
      name: 'Công nghệ: Làm quen 1, Thành thạo 0, Chuyên sâu 1',
    }),
  ).toBeTruthy();
  expect(
    within(
      screen.getByRole('list', { name: 'Màu mức kỹ năng nghề' }),
    ).getAllByRole('listitem'),
  ).toHaveLength(3);
});
