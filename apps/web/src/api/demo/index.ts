import type { ExplorerApi } from '../port';
import { auth, account } from './auth';
import { catalogue } from './catalogue';
import { quiz } from './quiz';
import { progress } from './progress';
import { play } from './play';
import { feedback } from './feedback';
/** Dữ liệu demo chỉ lưu trên trình duyệt; live thay từng service ở ngoài module này. */
export function createDemoApi(): ExplorerApi {
  return { auth, account, catalogue, quiz, progress, play, feedback };
}
export { bindExternalUser, unbindExternalUser } from './store';
