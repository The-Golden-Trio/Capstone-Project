/**
 * Chọn bản hiện thực của `PlayApi` bằng biến môi trường
 * `VITE_PLAY_API=http|mock`. Mặc định `http`: gọi máy chủ thật, câu tự luận do
 * panel ba judge (AI-5) chấm, AI-4 hỏi vặn. `mock` chạy trọn trong trình duyệt
 * với một kịch bản mẫu, cho buổi demo không có máy chủ.
 */
import type { PlayApi } from './contract';
import { createHttpPlayApi } from './httpPlayApi';
import { createMockPlayApi } from './mock/mockPlayApi';

export type { Accepted, PlayApi } from './contract';
export { PlayApiError, isPlayApiError } from './contract';

export const PLAY_API_MODE: 'mock' | 'http' =
  import.meta.env.VITE_PLAY_API === 'mock' ? 'mock' : 'http';

/** Nơi quay về khi rời màn chơi: bản demo không có bản đồ nghề. */
export const PLAY_HOME = PLAY_API_MODE === 'mock' ? '/' : '/jobs';

let instance: PlayApi | null = null;

export function getPlayApi(): PlayApi {
  instance ??=
    PLAY_API_MODE === 'http' ? createHttpPlayApi() : createMockPlayApi();
  return instance;
}

/** Cho test thay bản hiện thực. */
export function setPlayApi(api: PlayApi | null): void {
  instance = api;
}
