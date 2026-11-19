import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ContextForm } from './ContextForm';
import type { SituationOptions } from '../../api/types';
const options: SituationOptions = {
  band: 'L3',
  archetypes: ['INCIDENT'],
  companyTypes: ['OUTSOURCING'],
  skills: [{ competencyId: 'skill', name: 'Đọc log', kind: 'EXPERTISE' }],
};
afterEach(cleanup);
it('matches the API minimum of one skill and locks input while generating', () => {
  const generate = vi.fn();
  const { rerender } = render(
    <ContextForm
      options={options}
      initial={{ context: 'Một sự cố API.' }}
      busy={false}
      disabled={false}
      onGenerate={generate}
    />,
  );
  const button = screen.getByRole('button', { name: 'Sinh bản nháp bằng AI' });
  expect(button.hasAttribute('disabled')).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Đọc log' }));
  fireEvent.click(button);
  expect(generate).toHaveBeenCalledWith({
    archetype: 'INCIDENT',
    companyType: 'OUTSOURCING',
    context: 'Một sự cố API.',
    competencyIds: ['skill'],
  });
  rerender(
    <ContextForm
      options={options}
      initial={{}}
      busy
      disabled={false}
      onGenerate={generate}
    />,
  );
  expect(
    screen
      .getByRole('textbox', { name: 'Ngữ cảnh của tác giả' })
      .hasAttribute('disabled'),
  ).toBe(true);
  screen
    .getAllByRole('combobox')
    .forEach((select) => expect(select.hasAttribute('disabled')).toBe(true));
  expect(button.hasAttribute('disabled')).toBe(true);
});
