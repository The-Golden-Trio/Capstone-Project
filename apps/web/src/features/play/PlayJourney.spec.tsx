import { placeOf, tabLabel } from './workbench/model';
import {
  renderWithProviders,
  signInDemo,
} from '../../test/renderWithProviders';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { assert, expect, it, vi } from 'vitest';
import { profile } from '@datn/game-core';
import { api } from '../../api';
import type { SceneView } from '../../api/types';
import PlayPage from './PlayPage';
import ReflectPage from '../summary/ReflectPage';
import SummaryPage from '../summary/SummaryPage';

const reply =
  'Em thấy log 901 query do vòng lặp. Gom truy vấn và phân trang, chạy staging, theo dõi log, xin anh duyệt và rollback khi lỗi.';

it('vào ca SWE_BACKEND.L3.m2, thao tác tới cuối, tự soi rồi xem điểm và phản hồi', async () => {
  await signInDemo();
  const run = await api.play.start('SWE_BACKEND.L3.m2', null);
  const turn = vi.spyOn(api.play, 'turn');
  renderWithProviders(
    <Routes>
      <Route path="/play/:runId" element={<PlayPage />} />
      <Route path="/play/:runId/reflect" element={<ReflectPage />} />
      <Route path="/play/:runId/summary" element={<SummaryPage />} />
    </Routes>,
    `/play/${run.runId}`,
  );
  const initial = await api.play.scene(run.runId);
  for (let slide = 0; slide < (initial.introSlides?.length ?? 0) - 1; slide++) {
    fireEvent.click(await screen.findByRole('button', { name: 'Tiếp theo' }));
  }
  fireEvent.click(await screen.findByRole('button', { name: 'Vào ca' }));

  async function sendByUi(action: () => void) {
    const count = turn.mock.calls.length;
    action();
    await waitFor(() => expect(turn).toHaveBeenCalledTimes(count + 1));
    await act(async () => {
      await turn.mock.results[count].value;
    });
    await waitFor(async () =>
      expect((await api.play.scene(run.runId)).mode).not.toBe('waiting'),
    );
  }
  function fillForm(scope: HTMLElement) {
    const form = within(scope);
    for (const field of form.getAllByRole('textbox'))
      fireEvent.change(field, { target: { value: reply } });
    for (const checkbox of form.queryAllByRole<HTMLInputElement>('checkbox')) {
      if (!checkbox.checked) fireEvent.click(checkbox);
    }
    for (const select of form.queryAllByRole<HTMLSelectElement>('combobox')) {
      const option = Array.from(select.options).find((item) => item.value);
      assert(option);
      fireEvent.change(select, { target: { value: option.value } });
    }
  }
  function revealBeats() {
    for (
      let beat = 0;
      beat < 25 && screen.queryByText(/Bấm vào hộp thoại hoặc nhấn Space/);
      beat++
    ) {
      fireEvent.keyDown(document.body, { key: ' ' });
    }
  }

  async function inspectDocument(action: SceneView['actions'][number]) {
    if (action.kind !== 'open' && action.kind !== 'run') return;
    const opened = (await api.play.scene(run.runId)).documents.find(
      (doc) => doc.id === action.target,
    );
    if (!opened) return;
    const viewer = await screen.findByRole('region', { name: opened.title });
    fireEvent.keyDown(viewer, { key: 'Escape' });

    // Tài liệu đã mở xem lại ở tab Tài liệu, không tốn lượt.
    const count = turn.mock.calls.length;
    fireEvent.click(
      await screen.findByRole('tab', {
        name: (name) => name.startsWith('Tài liệu'),
      }),
    );
    const list = within(screen.getByRole('list', { name: 'Tài liệu đã mở' }));
    fireEvent.click(list.getByRole('button', { name: opened.title }));
    const reopened = await screen.findByRole('region', { name: opened.title });
    expect(turn).toHaveBeenCalledTimes(count);
    fireEvent.click(
      within(reopened).getByRole('button', { name: /^Đóng, về/ }),
    );
  }

  const used = new Set<string>();
  const covered = new Set<string>();
  let conversationSpoke = false;
  let scene: SceneView = await api.play.scene(run.runId);
  for (let i = 0; i < 100 && !scene.ended; i++) {
    revealBeats();
    switch (scene.await.kind) {
      case 'node_reply':
      case 'probe_answer':
      case 'last_word':
        fireEvent.change(
          await within(screen.getByRole('main')).findByRole('textbox'),
          { target: { value: reply } },
        );
        await sendByUi(() =>
          fireEvent.click(screen.getByRole('button', { name: 'Gửi' })),
        );
        break;
      case 'conversation':
        if (!conversationSpoke) {
          fireEvent.change(
            await within(screen.getByRole('main')).findByRole('textbox'),
            { target: { value: reply } },
          );
          await sendByUi(() =>
            fireEvent.click(screen.getByRole('button', { name: 'Gửi' })),
          );
          conversationSpoke = true;
          covered.add('say');
        } else {
          await sendByUi(() =>
            fireEvent.click(
              screen.getByRole('button', { name: 'Kết thúc trò chuyện' }),
            ),
          );
          covered.add('end_conversation');
        }
        break;
      case 'node_choice': {
        if (scene.node?.timeLimitSeconds) {
          expect(await screen.findByRole('timer')).toBeTruthy();
          covered.add('timed_choice');
        }
        assert(scene.node);
        const option = scene.node.options[0];
        const button = await screen.findByRole('button', {
          name: new RegExp(option.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        });
        await sendByUi(() => fireEvent.click(button));
        break;
      }
      case 'node_artefact': {
        assert(scene.node?.form);
        const editor = await screen.findByRole('region', {
          name: scene.node.form.title,
        });
        const submit = within(editor).getByRole('button', { name: /^Gửi/ });
        const form = submit.closest('form');
        assert(form);
        fillForm(form);
        await sendByUi(() => fireEvent.click(submit));
        covered.add('artefact');
        break;
      }
      case 'confirm_end':
        await sendByUi(() =>
          fireEvent.click(
            within(screen.getByRole('dialog')).getByRole('button', {
              name: 'Gửi',
            }),
          ),
        );
        covered.add('confirm_end');
        break;
      case 'phase': {
        const available = scene.actions.filter((a) => a.enabled);
        const action =
          (covered.has('timed_choice') &&
            available.find((a) => a.kind === 'trigger')) ||
          available.find((a) => a.kind === 'talk' && !used.has(a.key)) ||
          available.find((a) => a.kind === 'open' && !used.has(a.key)) ||
          available.find((a) => a.kind === 'write' && a.points > 0) ||
          available.find((a) => a.points > 0);
        assert(action, `Có việc làm ở ${scene.clock.time}`);
        used.add(action.key);
        conversationSpoke = false;
        // Bàn làm việc: mở tab của việc rồi bấm việc trong tab đó; chốt ở thanh trạng thái.
        const place = placeOf(action.kind);
        let button: HTMLElement;
        if (place === 'trigger') {
          button = screen.getAllByRole('button', {
            name: (name) => name.startsWith(action.label),
          })[0];
        } else {
          fireEvent.click(
            await screen.findByRole('tab', {
              name: (name) => name.startsWith(tabLabel(place)),
            }),
          );
          button = within(screen.getByRole('tabpanel')).getByRole('button', {
            name: (name) => name.startsWith(action.label),
          });
        }
        if (action.form) {
          fireEvent.click(button);
          const dialog = await screen.findByRole('region', {
            name: action.label,
          });
          fillForm(dialog);
          await sendByUi(() =>
            fireEvent.click(
              within(dialog).getByRole('button', {
                name:
                  action.form?.view?.type === 'patch'
                    ? 'Lưu bản vá'
                    : action.form?.view?.type === 'channel'
                      ? 'Gửi'
                      : 'Xong',
              }),
            ),
          );
        } else {
          await sendByUi(() => fireEvent.click(button));
          await inspectDocument(action);
        }
        covered.add('action');
        break;
      }
      case 'ai':
        await act(async () => {
          await Promise.resolve();
        });
        break;
      default:
        throw new Error(`Chưa xử lý ${scene.await.kind}`);
    }
    scene = await api.play.scene(run.runId);
  }
  expect(scene.ended).toBe(true);
  expect([...covered]).toEqual(
    expect.arrayContaining([
      'action',
      'say',
      'end_conversation',
      'timed_choice',
      'artefact',
      'confirm_end',
    ]),
  );
  revealBeats();
  expect(await screen.findByText('Ca làm đã khép lại')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }));
  expect(
    await screen.findByRole('heading', { name: 'Trước khi xem kết quả' }),
  ).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Nhận xét' })).toBeNull();
  for (const group of screen
    .getAllByRole('radiogroup')
    .filter(
      (g) => g.getAttribute('aria-label') !== 'Màn chơi có giống thực tế không',
    )) {
    fireEvent.click(within(group).getByRole('radio', { name: 'Thích' }));
  }
  fireEvent.click(screen.getByRole('radio', { name: 'Khá giống' }));
  fireEvent.click(screen.getByRole('button', { name: 'Xem kết quả ca làm' }));
  await screen.findByRole('heading', { name: 'Nhận xét' });
  const summary = await act(async () => api.play.summary(run.runId));
  expect(screen.getByLabelText('Đường dẫn').textContent).toBe(
    `/play/${run.runId}/summary`,
  );
  expect(summary.reflection.answered).toBe(true);
  expect(
    screen.getByRole('img', {
      name: `Điểm màn: ${summary.grade.score} trên 100`,
    }),
  ).toBeTruthy();
  for (const title of ['Kết quả', 'Nhận xét', 'Hướng cải thiện'])
    expect(screen.getByRole('heading', { name: title })).toBeTruthy();
  assert(summary.grade.feedback);
  for (const text of Object.values(summary.grade.feedback))
    expect(screen.getByText(text)).toBeTruthy();
  const deltas = screen
    .getByRole('heading', { name: 'Điểm cộng trừ trong ca này' })
    .closest('section');
  assert(deltas);
  expect(summary.grade.softSkills.length).toBeGreaterThan(0);
  for (const delta of summary.grade.softSkills) {
    const name = within(deltas).getByText(
      profile.softSkillGroup(delta.id).name,
    );
    expect(name.closest('li')?.textContent).toContain(
      `${delta.delta >= 0 ? '+' : '−'}${Math.abs(delta.delta).toLocaleString('vi-VN')}`,
    );
  }
  // Chạy trọn engine ca làm qua giao diện; runner CI chậm hơn máy dev nhiều lần.
}, 120_000);
