/**
 * Tay điều khiển lượt chơi mẫu: thao tác trên chính giao diện (gõ vào ô, bấm
 * nút, đánh dấu ô) như người chơi, không gọi engine hay service trực tiếp.
 * Mỗi lượt vì thế đi qua đúng đường của người chơi thật.
 */

export class AutoplayAbort extends Error {
  constructor() {
    super('autoplay aborted');
  }
}

export interface DriverContext {
  signal: AbortSignal;
  /** 1 là tốc độ thường; 2 nhanh gấp đôi. Đọc lại mỗi lần chờ để đổi tốc độ giữa chừng. */
  speed: () => number;
}

export function sleep(ms: number, ctx: DriverContext): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ctx.signal.aborted) return reject(new AutoplayAbort());
    const done = () => {
      ctx.signal.removeEventListener('abort', onAbort);
      resolve();
    };
    const id = window.setTimeout(done, Math.max(0, ms / ctx.speed()));
    const onAbort = () => {
      window.clearTimeout(id);
      reject(new AutoplayAbort());
    };
    ctx.signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** Chờ tới khi `probe` trả giá trị khác rỗng; quá hạn thì ném lỗi nêu việc đang chờ. */
export async function waitFor<T>(
  what: string,
  probe: () => T | null | undefined | false,
  ctx: DriverContext,
  timeoutMs = 15_000,
): Promise<T> {
  const started = performance.now();
  for (;;) {
    const value = probe();
    if (value) return value;
    if (performance.now() - started > timeoutMs)
      throw new Error(`Lượt mẫu bị kẹt khi chờ ${what}.`);
    await sleep(40 * ctx.speed(), ctx);
  }
}

/** Như `waitFor` nhưng hết hạn thì trả `null`, cho việc có thể không xảy ra. */
export async function waitForOptional<T>(
  probe: () => T | null | undefined | false,
  ctx: DriverContext,
  timeoutMs: number,
): Promise<T | null> {
  const started = performance.now();
  for (;;) {
    const value = probe();
    if (value) return value;
    if (performance.now() - started > timeoutMs) return null;
    await sleep(40 * ctx.speed(), ctx);
  }
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Gán giá trị qua setter gốc để React nhận như người dùng gõ. */
export function setNativeValue(el: Field, value: string) {
  const proto =
    el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(
    new Event(el instanceof HTMLSelectElement ? 'change' : 'input', {
      bubbles: true,
    }),
  );
}

const TICK_MS = 30;

/** Gõ dần `text` vào ô; ô đã có phần đầu giống thì gõ tiếp phần còn lại. */
export async function typeInto(
  el: HTMLInputElement | HTMLTextAreaElement,
  text: string,
  ctx: DriverContext,
) {
  el.focus();
  let at = text.startsWith(el.value) ? el.value.length : 0;
  if (at === 0 && el.value) setNativeValue(el, '');
  const remaining = text.length - at;
  if (remaining <= 0) return;
  const duration = Math.min(4000, Math.max(500, remaining * 28));
  const ticks = Math.max(1, Math.round(duration / TICK_MS));
  const perTick = Math.ceil(remaining / ticks);
  while (at < text.length) {
    at = Math.min(text.length, at + perTick);
    setNativeValue(el, text.slice(0, at));
    await sleep(TICK_MS, ctx);
  }
}

/** Làm nổi một phần tử một lúc ngắn, để người xem thấy chỗ sắp được bấm. */
export async function pulse(el: Element, ms: number, ctx: DriverContext) {
  el.scrollIntoView?.({ block: 'nearest' });
  el.setAttribute('data-autoplay-target', '');
  try {
    await sleep(ms, ctx);
  } finally {
    el.removeAttribute('data-autoplay-target');
  }
}

export const click = (el: HTMLElement) => el.click();

export const query = <T extends Element>(selector: string) =>
  document.querySelector<T>(selector);

export const activeWindow = () =>
  query<HTMLElement>('.desktop-window[data-active-window]');

export const editorForm = () =>
  query<HTMLFormElement>(
    '.desktop-window[data-active-window] form.desktop-editor-form',
  );

export function buttonByText(selector: string, label: string) {
  return (
    Array.from(document.querySelectorAll<HTMLButtonElement>(selector)).find(
      (button) => button.textContent?.trim() === label && !button.disabled,
    ) ?? null
  );
}

/** Điền biểu mẫu trong cửa sổ soạn: đánh dấu ô, gõ các ô chữ, chọn bảng giả thuyết, rồi gửi. */
export async function fillEditor(
  fields: Record<string, string>,
  ticks: readonly string[],
  ctx: DriverContext,
) {
  const form = await waitFor('cửa sổ soạn tài liệu', editorForm, ctx);
  await sleep(500, ctx);

  for (const box of form.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"][data-tick-id]',
  )) {
    if (box.checked === ticks.includes(box.dataset.tickId ?? '')) continue;
    await pulse(box, 450, ctx);
    click(box);
    await sleep(250, ctx);
  }

  for (const [id, value] of Object.entries(fields)) {
    if (id.endsWith('__why') || !value) continue;
    const field = form.querySelector<HTMLInputElement | HTMLTextAreaElement>(
      `[name="${id}"]`,
    );
    if (!field) throw new Error(`Biểu mẫu không có ô "${id}".`);
    field.scrollIntoView?.({ block: 'nearest' });
    await typeInto(field, value, ctx);
    await sleep(250, ctx);
  }

  for (const tick of ticks) {
    const [selectId, option] = tick.split('=');
    if (!option) continue;
    const select = form.querySelector<HTMLSelectElement>(
      `select[data-select-id="${selectId}"]`,
    );
    if (!select) throw new Error(`Biểu mẫu không có bảng chọn "${selectId}".`);
    await pulse(select, 350, ctx);
    setNativeValue(select, option);
    const why = fields[`${selectId}__why`];
    const reason = why
      ? form.querySelector<HTMLTextAreaElement>(`[name="${selectId}__why"]`)
      : null;
    if (reason && why) await typeInto(reason, why, ctx);
    await sleep(200, ctx);
  }

  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!submit) throw new Error('Biểu mẫu không có nút gửi.');
  await pulse(submit, 700, ctx);
  click(submit);
  await waitFor('cửa sổ soạn đóng lại', () => !form.isConnected, ctx);
}
