import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, type RenderResult } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ToastProvider } from '@datn/ui';
import { afterEach, beforeEach, vi } from 'vitest';
import { api } from '../api';
import { db } from '../api/demo/store';
import { useSession } from '../api/session';

// Chọn demo trước khi module API được nạp; chỉ bỏ độ trễ giả, giữ engine và dữ liệu thật.
vi.hoisted(() => vi.stubEnv('VITE_API_MODE', 'demo'));
vi.mock('../api/demo/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/demo/store')>();
  return {
    ...actual,
    wait: async () => undefined,
    service:
      <T extends unknown[], R>(fn: (...args: T) => R | Promise<R>) =>
      async (...args: T) =>
        actual.clone(await fn(...args)),
  };
});

Object.defineProperties(HTMLDialogElement.prototype, {
  showModal: {
    configurable: true,
    value() {
      this.setAttribute('open', '');
    },
  },
  close: {
    configurable: true,
    value() {
      this.removeAttribute('open');
    },
  },
});
Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: (query: string): MediaQueryList => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener() {
      return undefined;
    },
    removeListener() {
      return undefined;
    },
    addEventListener() {
      return undefined;
    },
    removeEventListener() {
      return undefined;
    },
    dispatchEvent: () => true,
  }),
});
class TestResizeObserver {
  observe() {
    return undefined;
  }
  unobserve() {
    return undefined;
  }
  disconnect() {
    return undefined;
  }
}
vi.stubGlobal('ResizeObserver', TestResizeObserver);
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value() {
    return undefined;
  },
});

const clients = new Set<QueryClient>();
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  db.players = [];
  db.current = null;
  useSession.getState().clear();
});
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.clear();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

export function LocationProbe() {
  const location = useLocation();
  return (
    <output aria-label="Đường dẫn">
      {location.pathname + location.search}
    </output>
  );
}
export function renderWithProviders(
  ui: ReactNode,
  route = '/',
): RenderResult & { client: QueryClient } {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  clients.add(client);
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>
            {ui}
            <LocationProbe />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    ),
  };
}
export async function signInDemo() {
  return api.auth.register({
    email: 'explorer@example.test',
    password: 'mat-khau-123',
    displayName: 'Người khám phá',
    dateOfBirth: '2004-06-12',
  });
}
