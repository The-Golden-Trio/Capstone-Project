import { useState } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SceneView } from '../../../api/types';
import { DocsPanel, PeoplePanel, WorkPanel } from './Panels';
import { Workbench } from './Workbench';
import type { WorkbenchTab } from './model';

afterEach(cleanup);

const action = (over: Partial<SceneView['actions'][number]>) =>
  ({
    key: 'k',
    label: 'Việc',
    kind: 'run',
    points: 1,
    enabled: true,
    ...over,
  }) as SceneView['actions'][number];

const scene = (over: Partial<SceneView>) =>
  ({
    actions: [],
    documents: [],
    cast: [],
    clock: { minutesPerPoint: 5 },
    notebook: { facts: [], promises: [] },
    suspended: null,
    ...over,
  }) as unknown as SceneView;

const panel = { blocked: null, busy: false, onPick: vi.fn() };

it('tab Người gom việc liên lạc vào thẻ của từng người, kênh và cả nhóm riêng', () => {
  const onPick = vi.fn();
  render(
    <PeoplePanel
      {...panel}
      onPick={onPick}
      scene={scene({
        cast: [
          {
            slot: 'mentor',
            name: 'anh An',
            relation: 'cấp trên trực tiếp',
            status: 'đang họp',
          },
          { slot: 'support', name: 'chị Linh', relation: 'hỗ trợ khách hàng' },
        ],
        actions: [
          action({
            key: 'talk_mentor',
            label: 'Nhắn anh An',
            kind: 'talk',
            target: 'mentor',
          }),
          action({
            key: 'talk_support',
            label: 'Gọi chị Linh',
            kind: 'talk',
            target: 'support',
            enabled: false,
            reason: 'Chị Linh đang bận',
          }),
          action({
            key: 'message_su_co',
            label: 'Nhắn #su-co',
            kind: 'message',
          }),
          action({ key: 'meeting', label: 'Gọi họp nhanh', kind: 'meeting' }),
        ],
      })}
    />,
  );
  const cards = within(screen.getByRole('list', { name: 'Người trong ca' }));
  const mentor = within(cards.getAllByRole('listitem')[0]);
  expect(mentor.getByText('anh An')).toBeTruthy();
  expect(mentor.getByText('đang họp')).toBeTruthy();
  fireEvent.click(mentor.getByRole('button', { name: /^Nhắn anh An/ }));
  expect(onPick).toHaveBeenCalledWith(
    expect.objectContaining({ key: 'talk_mentor' }),
  );

  const linh = within(cards.getAllByRole('listitem')[1]);
  const locked = linh.getByRole('button', { name: /^Gọi chị Linh/ });
  expect(locked.hasAttribute('disabled')).toBe(true);
  expect(linh.getByText('Chị Linh đang bận')).toBeTruthy();

  expect(screen.getByRole('heading', { name: 'Kênh' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Cả nhóm' })).toBeTruthy();
  expect(
    document.querySelector('[data-action-key="message_su_co"]'),
  ).toBeTruthy();
  expect(cards.queryByRole('button', { name: /#su-co/ })).toBeNull();
});

it('tab Việc có ô trống cho lời hứa và xếp việc đang khoá xuống sau việc làm được', () => {
  render(
    <WorkPanel
      {...panel}
      goal="Mục tiêu"
      scene={scene({
        actions: [
          action({
            key: 'a',
            label: 'Sửa lại bản vá',
            enabled: false,
            reason: 'Cần làm trước: “Viết bản vá”',
          }),
          action({ key: 'b', label: 'Viết bản vá' }),
        ],
      })}
    />,
  );
  expect(screen.getByText(/Bạn chưa hẹn ai/)).toBeTruthy();
  const rows = within(
    screen.getByRole('list', { name: 'Việc làm được' }),
  ).getAllByRole('button');
  expect(rows.map((row) => row.getAttribute('data-action-key'))).toEqual([
    'b',
    'a',
  ]);
  expect(screen.getByText('Cần làm trước: “Viết bản vá”')).toBeTruthy();
});

it('tab Tài liệu báo trống khi ca chưa có tài liệu nào', () => {
  render(<DocsPanel {...panel} onOpen={vi.fn()} scene={scene({})} />);
  expect(screen.getByText('Ca này chưa có tài liệu nào để mở.')).toBeTruthy();
});

it('tab Tài liệu để tài liệu đã mở lên trước và đọc tên không kèm loại', () => {
  const onOpen = vi.fn();
  render(
    <DocsPanel
      {...panel}
      onOpen={onOpen}
      scene={scene({
        documents: [
          {
            id: 'wiki',
            title: 'Wiki kỹ thuật',
            kind: 'document',
            view: { type: 'wiki' },
          },
        ] as unknown as SceneView['documents'],
        actions: [
          action({
            key: 'open_code',
            label: 'Mở code API',
            kind: 'open',
            target: 'code',
          }),
        ],
      })}
    />,
  );
  const opened = screen.getByRole('button', { name: 'Wiki kỹ thuật' });
  fireEvent.click(opened);
  expect(onOpen).toHaveBeenCalledWith('wiki');
  expect(screen.getByText('1 lượt')).toBeTruthy();
});

const lockedAll = (keys: Array<[string, string, string?]>) =>
  keys.map(([key, kind, target]) =>
    action({
      key,
      kind,
      target,
      label: key,
      enabled: false,
      reason: 'Ca đã kết thúc',
    }),
  );

const endedScene = (over: Partial<SceneView> = {}) =>
  scene({
    ended: true,
    cast: [
      { slot: 'mentor', name: 'anh An', relation: 'cấp trên trực tiếp' },
    ] as unknown as SceneView['cast'],
    documents: [
      { id: 'wiki', title: 'Wiki kỹ thuật', kind: 'document' },
    ] as unknown as SceneView['documents'],
    actions: lockedAll([
      ['talk_mentor', 'talk', 'mentor'],
      ['message_su_co', 'message'],
      ['meeting', 'meeting'],
      ['open_code', 'open', 'code'],
      ['run_tests', 'run'],
    ]),
    ...over,
  });

it('tab Việc khi ca đã khép giữ mục tiêu, báo bước tiếp theo và không còn dòng việc nào', () => {
  render(
    <WorkPanel
      {...panel}
      blocked="Ca làm đã khép lại."
      goal="Mục tiêu của ca"
      scene={endedScene({
        suspended: { key: 'run_tests', label: 'Chạy test', remaining: 1 },
        notebook: {
          facts: [],
          promises: [
            { id: 'p1', label: 'Gọi chị Linh lúc 11:30', status: 'kept' },
            { id: 'p2', label: 'Báo lại anh An', status: 'late' },
            { id: 'p3', label: 'Gửi bản vá', status: 'carried' },
          ],
        },
      })}
    />,
  );
  expect(screen.getByText('Mục tiêu của ca')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toMatch(/Tiếp tục/);
  const promises = within(
    screen.getByRole('list', { name: 'Lời đã hứa trong ca' }),
  ).getAllByRole('listitem');
  expect(promises.map((p) => p.getAttribute('data-promise-status'))).toEqual([
    'kept',
    'late',
    'carried',
  ]);
  expect(within(promises[0]).getByText('Đã giữ')).toBeTruthy();
  expect(within(promises[1]).getByText('Trễ hẹn')).toBeTruthy();
  expect(within(promises[2]).getByText('Để lại cuối ca')).toBeTruthy();
  expect(document.querySelector('[data-action-key]')).toBeNull();
  expect(screen.queryByText(/Ca đã kết thúc/)).toBeNull();
  expect(screen.queryByText(/Đang dở/)).toBeNull();
  expect(screen.queryByText(/Bạn chưa hẹn ai/)).toBeNull();
});

it('tab Việc khi ca đã khép không dựng mục lời hứa nếu ca không có lời hứa', () => {
  render(<WorkPanel {...panel} goal="Mục tiêu" scene={endedScene()} />);
  expect(screen.queryByRole('heading', { name: 'Lời đã hứa' })).toBeNull();
});

it('tab Người khi ca đã khép giữ thẻ người nhưng bỏ nút liên lạc, kênh và cả nhóm', () => {
  render(
    <PeoplePanel
      {...panel}
      blocked="Ca làm đã khép lại."
      scene={endedScene()}
    />,
  );
  const cards = within(screen.getByRole('list', { name: 'Người trong ca' }));
  expect(cards.getByText('anh An')).toBeTruthy();
  expect(document.querySelector('[data-action-key]')).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Kênh' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Cả nhóm' })).toBeNull();
  expect(screen.queryByText(/Ca làm đã khép lại/)).toBeNull();
});

it('tab Tài liệu khi ca đã khép vẫn mở lại được tài liệu đã mở và bỏ phần chưa mở', () => {
  const onOpen = vi.fn();
  render(
    <DocsPanel
      {...panel}
      blocked="Ca làm đã khép lại."
      onOpen={onOpen}
      scene={endedScene()}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Wiki kỹ thuật' }));
  expect(onOpen).toHaveBeenCalledWith('wiki');
  expect(screen.queryByRole('heading', { name: /Chưa mở/ })).toBeNull();
  expect(document.querySelector('[data-action-key]')).toBeNull();
});

it('tab Tài liệu khi ca đã khép mà chưa mở tài liệu nào thì nói thẳng, không rủ mở', () => {
  render(
    <DocsPanel
      {...panel}
      onOpen={vi.fn()}
      scene={endedScene({ documents: [] })}
    />,
  );
  expect(
    screen.getByText('Bạn không mở tài liệu nào trong ca này.'),
  ).toBeTruthy();
});

function Harness({ onTab }: { onTab: (tab: WorkbenchTab) => void }) {
  const [tab, setTab] = useState<WorkbenchTab>('work');
  return (
    <Workbench
      tab={tab}
      onTab={(next) => {
        onTab(next);
        setTab(next);
      }}
      badges={{ notebook: 3 }}
      viewer={null}
    >
      <p>{tab}</p>
    </Workbench>
  );
}

it('tablist chuyển bằng mũi tên, Home và End, và huy hiệu có tên cho trình đọc màn hình', () => {
  const onTab = vi.fn();
  render(<Harness onTab={onTab} />);
  const tablist = screen.getByRole('tablist', { name: 'Bàn làm việc' });
  const first = within(tablist).getAllByRole('tab')[0];
  first.focus();
  fireEvent.keyDown(first, { key: 'End' });
  expect(onTab).toHaveBeenLastCalledWith('notebook');
  expect(document.activeElement?.getAttribute('data-workbench-tab')).toBe(
    'notebook',
  );
  fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Home' });
  expect(onTab).toHaveBeenLastCalledWith('work');
  fireEvent.keyDown(document.activeElement as HTMLElement, {
    key: 'ArrowLeft',
  });
  expect(onTab).toHaveBeenLastCalledWith('notebook');
  expect(
    within(tablist).getByRole('tab', { name: 'Sổ tay 3 dữ kiện' }),
  ).toBeTruthy();
});
