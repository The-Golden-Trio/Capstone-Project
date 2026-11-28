import { fireEvent, render, screen, within } from '@testing-library/react';
import type { shift } from '@datn/game-core';
import { expect, it, vi } from 'vitest';
import { ArtefactEditor } from './index';
import { DocumentViewer } from '../DocumentViewer';

const baseForm: shift.ArtefactForm = {
  id: 'document',
  title: 'Tài liệu',
  fields: [],
  ticks: [],
  selects: [],
};

const assessment = {
  id: 'h1',
  label: 'CSDL quá tải',
  options: [{ id: 'loai', label: 'Loại' }],
  reason: true,
};

it('lưu các thay đổi của bản vá ngay cả khi không có ghi chú', () => {
  const submit = vi.fn();
  render(
    <ArtefactEditor
      form={{
        ...baseForm,
        view: {
          type: 'patch',
          path: 'db/orders.sql',
          base: ['SELECT id', 'FROM orders;'],
        },
        fields: [
          { id: 'ghi_chu', label: 'Ghi chú cho người review', multiline: true },
        ],
        ticks: [
          { id: 'v1', label: 'Gom truy vấn' },
          { id: 'v2', label: 'Phân trang' },
          { id: 'v3', label: 'Giữ cách trả cũ' },
        ],
        prefill: { fields: {}, ticks: ['v1', 'v2'] },
      }}
      busy={false}
      submitLabel="Lưu bản vá"
      onSubmit={submit}
    />,
  );

  const source = screen.getByLabelText('Mã nguồn orders.sql');
  expect(within(source).getByText('2')).toBeTruthy();
  expect(source.textContent).toContain('FROM orders;');
  expect(screen.getByRole('group', { name: 'Thay đổi' })).toBeTruthy();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Phân trang' }));
  fireEvent.click(screen.getByRole('checkbox', { name: 'Giữ cách trả cũ' }));
  fireEvent.click(screen.getByRole('button', { name: 'Lưu bản vá' }));

  expect(submit).toHaveBeenCalledWith({ ghi_chu: '' }, ['v1', 'v3']);
});

it('đọc lại lựa chọn, thay tick cũ và gửi lý do theo ID giả thuyết', () => {
  const submit = vi.fn();
  const options = [
    { id: 'loai', label: 'Loại' },
    { id: 'giu', label: 'Giữ' },
    { id: 'chua_ro', label: 'Chưa rõ' },
  ];
  render(
    <ArtefactEditor
      form={{
        ...baseForm,
        view: { type: 'note' },
        fields: [
          {
            id: 'hien_tuong',
            label: 'Hiện tượng',
            multiline: true,
            placeholder: 'Từ mấy giờ?',
          },
        ],
        selects: [
          { id: 'h1', label: 'CSDL quá tải', options, reason: true },
          { id: 'h2', label: 'Mạng chậm', options, reason: false },
        ],
        prefill: {
          fields: { hien_tuong: 'API chậm', h1__why: 'Bằng chứng cũ' },
          ticks: ['h1=giu', 'h2=chua_ro'],
        },
      }}
      busy={false}
      submitLabel="Gửi anh An"
      onSubmit={submit}
    />,
  );

  const load = screen.getByRole<HTMLSelectElement>('combobox', {
    name: /CSDL quá tải/,
  });
  const reason = screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: /Vì sao.*CSDL quá tải/,
  });
  expect(load.value).toBe('giu');
  expect(reason.value).toBe('Bằng chứng cũ');
  expect(screen.getByPlaceholderText('Từ mấy giờ?')).toBeTruthy();
  expect(
    screen.queryByRole('textbox', { name: /Vì sao.*Mạng chậm/ }),
  ).toBeNull();

  fireEvent.change(load, { target: { value: 'loai' } });
  fireEvent.change(reason, { target: { value: '  CPU 24%  ' } });
  fireEvent.change(screen.getByRole('combobox', { name: /Mạng chậm/ }), {
    target: { value: '' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Gửi anh An' }));

  expect(submit).toHaveBeenCalledWith(
    { hien_tuong: 'API chậm', h1__why: 'CPU 24%' },
    ['h1=loai'],
  );
});

it('soạn tiêu đề một dòng, đưa focus về tiêu đề khi thư trống và giữ đoạn thân thư', () => {
  const submit = vi.fn();
  render(
    <ArtefactEditor
      form={{
        ...baseForm,
        view: { type: 'mail', to: 'anh An', subject_field: 'tieu_de' },
        fields: [
          {
            id: 'nguyen_nhan',
            label: 'Nguyên nhân',
            multiline: true,
            placeholder: 'Em thấy nguyên nhân là…',
          },
          { id: 'tieu_de', label: 'Tiêu đề', multiline: false },
        ],
      }}
      busy={false}
      submitLabel="Gửi"
      onSubmit={submit}
    />,
  );

  const subject = screen.getByRole('textbox', { name: 'Tiêu đề' });
  const body = screen.getByPlaceholderText('Em thấy nguyên nhân là…');
  expect(screen.getByText('anh An')).toBeTruthy();
  expect(subject.tagName).toBe('INPUT');
  expect(body.tagName).toBe('TEXTAREA');

  const send = screen.getByRole('button', { name: 'Gửi' });
  fireEvent.click(send);
  expect(document.activeElement).toBe(subject);
  expect(screen.getByRole('alert')).toBeTruthy();
  expect(submit).not.toHaveBeenCalled();

  fireEvent.change(subject, { target: { value: ' Sự cố API ' } });
  fireEvent.change(body, { target: { value: '900 đơn\n901 lần hỏi' } });
  fireEvent.click(send);

  expect(submit).toHaveBeenCalledWith(
    { tieu_de: 'Sự cố API', nguyen_nhan: '900 đơn\n901 lần hỏi' },
    [],
  );
});

it('giữ nguyên tin nhắn để gửi lại sau khi yêu cầu thất bại', () => {
  const submit = vi.fn();
  const props = {
    form: {
      ...baseForm,
      view: { type: 'channel', channel: '#su-co' },
      fields: [{ id: 'noi_dung', label: 'Tin nhắn', multiline: true }],
    } satisfies shift.ArtefactForm,
    submitLabel: 'Gửi',
    onSubmit: submit,
  };
  const { rerender } = render(<ArtefactEditor {...props} busy={false} />);
  const message = screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: 'Tin nhắn',
  });
  const button = screen.getByRole<HTMLButtonElement>('button', { name: 'Gửi' });

  expect(screen.getByRole('heading', { name: '#su-co' })).toBeTruthy();
  fireEvent.change(message, {
    target: { value: ' Đã chạy thử trên staging. ' },
  });
  fireEvent.click(button);
  rerender(<ArtefactEditor {...props} busy />);
  expect(button.disabled).toBe(true);
  expect(message.readOnly).toBe(true);
  fireEvent.submit(screen.getByRole('form'));
  expect(submit).toHaveBeenCalledTimes(1);

  rerender(<ArtefactEditor {...props} form={{ ...props.form }} busy={false} />);
  expect(message.value).toBe(' Đã chạy thử trên staging. ');
  fireEvent.click(button);
  expect(submit.mock.calls).toEqual([
    [{ noi_dung: 'Đã chạy thử trên staging.' }, []],
    [{ noi_dung: 'Đã chạy thử trên staging.' }, []],
  ]);
});

it('dùng biểu mẫu cũ khi tài liệu chưa có kiểu hiển thị', () => {
  const submit = vi.fn();
  render(
    <ArtefactEditor
      form={{
        ...baseForm,
        fields: [{ id: 'tom_tat', label: 'Tóm tắt', multiline: true }],
        prefill: { fields: { tom_tat: 'Đã kiểm tra.' }, ticks: [] },
      }}
      busy={false}
      submitLabel="Lưu"
      onSubmit={submit}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
  expect(submit).toHaveBeenCalledWith({ tom_tat: 'Đã kiểm tra.' }, []);
});

it.each([undefined, { type: 'channel', channel: '#su-co' }] as const)(
  'gửi giả thuyết từ trình soạn %j',
  (view) => {
    const submit = vi.fn();
    render(
      <ArtefactEditor
        form={{ ...baseForm, view, selects: [assessment] }}
        busy={false}
        submitLabel="Gửi"
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: /CSDL quá tải/ }), {
      target: { value: 'loai' },
    });
    fireEvent.change(
      screen.getByRole('textbox', { name: /Vì sao.*CSDL quá tải/ }),
      { target: { value: 'CPU 24%' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(submit).toHaveBeenCalledWith({ h1__why: 'CPU 24%' }, ['h1=loai']);
  },
);

it('xem bản đã lưu bằng nhãn của tick, lựa chọn và lý do', () => {
  render(
    <DocumentViewer
      document={{
        id: 'document',
        title: 'Ghi chú',
        kind: 'form',
        view: { type: 'note' },
        form: {
          ...baseForm,
          ticks: [
            { id: 'v1', label: 'Gom truy vấn' },
            { id: 'v2', label: 'Phân trang' },
          ],
          selects: [assessment],
        },
        saved: {
          status: 'saved',
          ticks: ['v1', 'h1=loai'],
          fields: { h1__why: 'CPU 24%' },
        },
      }}
    />,
  );
  expect(screen.getByText('✓ Gom truy vấn')).toBeTruthy();
  expect(screen.queryByText('Phân trang')).toBeNull();
  expect(screen.getByText('CSDL quá tải')).toBeTruthy();
  expect(screen.getByText('Loại')).toBeTruthy();
  expect(screen.getByText('Vì sao: CPU 24%')).toBeTruthy();
});
