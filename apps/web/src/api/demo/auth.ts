import { ApiError, type AuthService, type AccountService } from '../port';
import {
  db,
  newSkills,
  player,
  save,
  service,
  uid,
  type Player,
} from './store';
import type { RegisterInput, Session } from '../types';
import { SHOWCASE_EMAIL, ensureShowcasePlayer } from './showcase';
function session(p: Player): Session {
  db.current = p.me.id;
  p.refreshToken = `demo-refresh:${uid()}`;
  save();
  return {
    accessToken: `demo-access:${p.me.id}:${uid()}`,
    refreshToken: p.refreshToken,
    user: p.me,
  };
}
function register(input: RegisterInput): Session {
  const email = input.email.trim().toLowerCase();
  if (!email.includes('@') || !input.password || !input.displayName.trim())
    throw new ApiError(
      400,
      'INVALID_INPUT',
      'Bạn cần điền email, mật khẩu và biệt danh.',
    );
  if (db.players.some((p) => p.me.email === email))
    throw new ApiError(409, 'EMAIL_USED', 'Email này đã được dùng.');
  const p: Player = {
    me: {
      id: uid(),
      email,
      username: null,
      displayName: input.displayName.trim(),
      roles: ['EXPLORER'],
      hasGoogle: false,
      quizDone: false,
      dateOfBirth: input.dateOfBirth ?? null,
      stage: null,
    },
    password: input.password,
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
  return session(p);
}
export const auth: AuthService = {
  register: service(register),
  signIn: service(async (identifier, password) => {
    if (identifier.trim().toLowerCase() === SHOWCASE_EMAIL)
      await ensureShowcasePlayer();
    const p = db.players.find(
      (p) =>
        p.me.email === identifier.trim().toLowerCase() ||
        p.me.username === identifier,
    );
    if (!p || p.password !== password)
      throw new ApiError(
        401,
        'INVALID_CREDENTIALS',
        'Email hoặc mật khẩu chưa đúng.',
      );
    return session(p);
  }),
  signInWithGoogle: service(() => {
    throw new ApiError(
      501,
      'DEMO_GOOGLE_UNAVAILABLE',
      'Bản demo dùng tài khoản email cục bộ; đăng nhập Google chưa được kết nối.',
    );
  }),
  refresh: service((token) => {
    const p = db.players.find((p) => p.refreshToken === token);
    if (!p)
      throw new ApiError(401, 'INVALID_TOKEN', 'Phiên đăng nhập đã hết hạn.');
    return session(p);
  }),
  signOut: service(() => {
    const p = db.players.find((p) => p.me.id === db.current);
    if (p) p.refreshToken = null;
    db.current = null;
    save();
  }),
  requestPasswordReset: service((email) => {
    const p = db.players.find((p) => p.me.email === email.trim().toLowerCase());
    if (p) {
      p.resetToken = `demo-reset:${uid()}`;
      save();
    }
  }),
  confirmPasswordReset: service((token, password) => {
    const p = db.players.find((p) => p.resetToken === token);
    if (!p)
      throw new ApiError(
        400,
        'INVALID_TOKEN',
        'Mã đặt lại mật khẩu không hợp lệ.',
      );
    if (!password)
      throw new ApiError(
        400,
        'INVALID_PASSWORD',
        'Mật khẩu mới không được để trống.',
      );
    p.password = password;
    p.resetToken = null;
    save();
  }),
};
export const account: AccountService = {
  me: service(() => player().me),
  updateMe: service((patch) => {
    const p = player();
    if (patch.displayName !== undefined) {
      if (!patch.displayName.trim())
        throw new ApiError(
          400,
          'INVALID_NAME',
          'Biệt danh không được để trống.',
        );
      p.me.displayName = patch.displayName.trim();
    }
    if (patch.stage !== undefined) p.me.stage = patch.stage;
    save();
    return p.me;
  }),
  changePassword: service((current, next) => {
    const p = player();
    if (current !== p.password)
      throw new ApiError(
        401,
        'INVALID_PASSWORD',
        'Mật khẩu hiện tại chưa đúng.',
      );
    if (!next)
      throw new ApiError(
        400,
        'INVALID_PASSWORD',
        'Mật khẩu mới không được để trống.',
      );
    p.password = next;
    save();
  }),
  deleteAccount: service(() => {
    const p = player();
    db.players.splice(db.players.indexOf(p), 1);
    db.current = null;
    save();
  }),
};
