import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, assert, expect, it, vi } from 'vitest';
import { ReferenceAnswers } from './ReferenceAnswers';
import { authApi, staffApi } from '../../api/endpoints';
vi.hoisted(() => vi.stubEnv('VITE_STAFF_DEMO', '1'));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('keeps Không xét selected and does not turn a cleared score into zero', async () => {
  await authApi.signIn('demo@jobquest.local', 'demo');
  const scenario = await staffApi.getScenario('s-draft');
  assert(scenario.content);
  const add = vi.spyOn(staffApi, 'addReferenceAnswer');
  render(
    <ReferenceAnswers
      scenarioId="s-draft"
      content={scenario.content}
      skills={[]}
      readOnly={false}
      dirty={false}
    />,
  );
  await screen.findByText('Chưa có câu mẫu.');
  const scores = screen.getAllByRole<HTMLSelectElement>('combobox', {
    name: /^Điểm:/,
  });
  const submit = screen.getByRole('button', { name: 'Lưu câu mẫu' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Câu trả lời mẫu' }), {
    target: { value: 'Đối chiếu log trước và sau bản cập nhật.' },
  });
  for (const score of scores)
    fireEvent.change(score, { target: { value: 'na' } });
  expect(scores[0].value).toBe('na');
  expect(submit.hasAttribute('disabled')).toBe(false);
  fireEvent.change(scores[0], { target: { value: '' } });
  expect(scores[0].value).toBe('');
  expect(submit.hasAttribute('disabled')).toBe(true);
  fireEvent.change(scores[0], { target: { value: 'na' } });
  fireEvent.click(submit);
  await waitFor(() => expect(add).toHaveBeenCalled());
  const body = add.mock.calls[0][1];
  expect(body.scores).toHaveLength(scores.length);
  expect(body.scores.every((score) => score.score === null)).toBe(true);
  await screen.findByText('Đối chiếu log trước và sau bản cập nhật.');
});
