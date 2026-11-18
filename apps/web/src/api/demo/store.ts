import { profile, type shift } from '@datn/game-core';
import { ApiError } from '../port';
import type { Showcase } from './showcase';
import type {
  AppFeedbackInput,
  Company,
  LikeLevel,
  Me,
  QuizAnswers,
  QuizResult,
  RunSummary,
  SoftSkillState,
} from '../types';
export interface Enrolment {
  id: string;
  code: string;
  levelNo: number;
  band: string;
  company: Company;
  seen: boolean;
  at: string;
}
export interface SavedRun {
  id: string;
  taskId: string;
  enrolmentId: string | null;
  events: shift.ShiftInput[];
  notes: Array<{ text: string; at: string }>;
  flags: Array<{ activityKey: string; reason: string }>;
  reflection: Record<string, LikeLevel> | null;
  realism: number | null;
  grade: RunSummary['grade'] | null;
  at: string;
  turnId: string;
  paused: boolean;
}
export interface Player {
  me: Me;
  password: string;
  quiz: QuizResult | null;
  goals: QuizAnswers['goals'] | null;
  interests: string[];
  enrolments: Enrolment[];
  runs: SavedRun[];
  skills: SoftSkillState[];
  pinned: string[];
  ratings: Record<string, Record<string, number>>;
  ratingComments: Record<string, string>;
  feedback: AppFeedbackInput[];
  refreshToken: string | null;
  resetToken: string | null;
  /** Lớp phủ dữ liệu mẫu của người chơi demo (xem showcase.ts). */
  showcase?: Showcase;
}
interface Database {
  players: Player[];
  current: string | null;
}
const memory = new Map<string, string>();
const KEY = 'jq-demo:database:v1';
function read(): Database {
  let raw = memory.get(KEY);
  try {
    raw = localStorage.getItem(KEY) ?? raw;
  } catch {
    /* Trình duyệt chặn storage: dùng RAM. */
  }
  try {
    return raw ? (JSON.parse(raw) as Database) : { players: [], current: null };
  } catch {
    return { players: [], current: null };
  }
}
export const db = read();
export function save() {
  const raw = JSON.stringify(db);
  memory.set(KEY, raw);
  try {
    localStorage.setItem(KEY, raw);
  } catch {
    /* Hết dung lượng/chế độ riêng tư: RAM vẫn giữ được lượt. */
  }
}
export const clone = <T>(value: T): T =>
  value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const now = () => new Date().toISOString();
export const wait = (ai = false) =>
  new Promise<void>((resolve) =>
    setTimeout(
      resolve,
      ai
        ? 400 + Math.floor(Math.random() * 501)
        : 120 + Math.floor(Math.random() * 181),
    ),
  );
export function player(): Player {
  const p = db.players.find((p) => p.me.id === db.current);
  if (!p)
    throw new ApiError(
      401,
      'UNAUTHENTICATED',
      'Bạn cần đăng nhập để tiếp tục.',
    );
  return p;
}
export const newSkills = (): SoftSkillState[] =>
  profile.SOFT_SKILL_IDS.map((id) => ({
    id,
    points: 0,
    reachedTier: 0,
    scenarios: 0,
    history: [],
  }));
export const service =
  <T extends unknown[], R>(fn: (...args: T) => R | Promise<R>) =>
  async (...args: T): Promise<R> => {
    await wait();
    return clone(await fn(...args));
  };

/**
 * Chế độ hybrid: đăng nhập bằng API thật, phần chưa có endpoint dùng dữ liệu
 * mẫu. Gắn một hồ sơ mẫu theo đúng id tài khoản thật để tiến độ mẫu không
 * lẫn giữa các tài khoản trên cùng trình duyệt.
 */
export function bindExternalUser(me: Me): void {
  let p = db.players.find((x) => x.me.id === me.id);
  if (!p) {
    p = {
      me: { ...me },
      password: '',
      quiz: null,
      goals: null,
      interests: [],
      enrolments: [],
      runs: [],
      skills: newSkills(),
      pinned: [],
      ratings: {},
      ratingComments: {},
      feedback: [],
      refreshToken: null,
      resetToken: null,
    };
    db.players.push(p);
  } else {
    p.me = { ...p.me, ...me, stage: me.stage ?? p.me.stage };
  }
  if (db.current !== me.id) {
    db.current = me.id;
  }
  save();
}

export function unbindExternalUser(): void {
  db.current = null;
  save();
}
