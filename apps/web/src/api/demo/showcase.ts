/**
 * Người chơi mẫu "đã chơi nhiều" cho bản demo: đăng nhập là thấy đủ hồ sơ,
 * chân dung, thống kê, thành tựu, nhật ký thay vì một tài khoản trống.
 *
 * - Ba ca Back-end L3 được chơi thật bằng engine game-core với AI giả lúc
 *   dựng, nên nhật ký, tổng kết, nhìn lại đều mở được.
 * - Phần rộng hơn (các nghề khác đã thử, từ khoá, phút theo vùng…) là lớp phủ
 *   `showcase`: chỉ để xem giao diện, không có lượt chơi đằng sau.
 */
import { profile, shift } from '@datn/game-core';
import type {
  CatalogueOccupation,
  EarnedKeyword,
  LikeLevel,
  QuizAnswers,
  RegionId,
  RiasecAxis,
} from '../types';
import { baseCatalogue, context, loadProfile, seeds } from './data';
import { quizForm } from './content';
import { resultOf } from './quiz';
import { stateOf } from './rules';
import { summaryOf } from './play';
import { db, newSkills, save, type Player, type SavedRun } from './store';

export const SHOWCASE_EMAIL = 'demo@jobquest.local';
export const SHOWCASE_PASSWORD = 'demo';
/** Tăng khi đổi dữ liệu mẫu để trình duyệt đã lưu bản cũ tự dựng lại. */
const SHOWCASE_VERSION = 3;

/** Lớp phủ dữ liệu mẫu, cộng thêm vào hồ sơ tính từ lượt chơi thật. */
export interface Showcase {
  version: number;
  occupations: Record<string, CatalogueOccupation['my']>;
  scenarios: number;
  minutesByRegion: Partial<Record<RegionId, number>>;
  groups: string[];
  keywords: EarnedKeyword[];
  taps: Partial<Record<RiasecAxis, LikeLevel[]>>;
  favourites: Array<{ text: string; likes: number }>;
  counts: Partial<
    Record<
      'kham_pha' | 'thanh_thao' | 'tien_bo' | 'tu_soi' | 'kien_tri',
      number
    >
  >;
}

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

/** Các nghề "đã thử" trong lớp phủ, mỗi vùng ít nhất một nghề. */
const TRIED: Array<{
  code: string;
  status: 'PLAYING' | 'COMPLETED';
  level: number;
  minutes: number;
}> = [
  { code: 'SWE_FRONTEND', status: 'PLAYING', level: 2, minutes: 95 },
  { code: 'DATA_DA', status: 'PLAYING', level: 1, minutes: 60 },
  { code: 'SWE_UIUX', status: 'COMPLETED', level: 3, minutes: 140 },
  { code: 'ONET-27-1024.00', status: 'PLAYING', level: 2, minutes: 75 },
  { code: 'ONET-21-1014.00', status: 'PLAYING', level: 1, minutes: 40 },
  { code: 'ONET-11-9051.00', status: 'PLAYING', level: 1, minutes: 30 },
  { code: 'ONET-17-1011.00', status: 'PLAYING', level: 1, minutes: 25 },
];

/** Câu trả lời quiz nghiêng về I, A, S (thích tìm hiểu, sáng tạo, giúp người). */
function quizAnswers(): QuizAnswers {
  const lean: Record<string, LikeLevel> = {
    I: 3,
    A: 3,
    S: 2,
    E: 2,
    C: 1,
    R: 1,
  };
  const cards = Object.fromEntries(
    quizForm.cards.map((c) => [
      c.id,
      c.axis
        ? lean[c.axis]
        : ((['cong_nghe', 'sang_tao'].includes(c.regionId ?? '')
            ? 3
            : 2) as LikeLevel),
    ]),
  );
  const goals = Object.fromEntries(
    quizForm.goals.map((g, i) => [
      g.id,
      {
        picked: g.options.slice(i % 2, (i % 2) + 2),
        note: i === 0 ? 'Muốn thử vài nghề trước khi chọn ngành đại học.' : '',
      },
    ]),
  );
  return {
    cards,
    interests: quizForm.interests.slice(0, 4),
    goals,
  };
}

/** Chơi một ca tới cuối bằng engine thật, AI giả, không chờ thời gian thực. */
function playToEnd(r: SavedRun, variant: number): void {
  const ctx = context(r.taskId);
  const push = (input: shift.ShiftInput) => {
    shift.step(stateOf(r), input, ctx);
    r.events.push(input);
  };
  push({ type: 'START' });
  for (let i = 0; i < 400; i++) {
    const state = stateOf(r);
    const pending = shift.pendingRequest(state, ctx);
    if (pending) {
      push(
        pending.type === 'narrate'
          ? {
              type: 'NARRATION',
              requestId: pending.request.requestId,
              beats: shift.fakeNarration(pending.request),
              provenance: { adapter: 'fake' },
            }
          : {
              type: 'CHECKS',
              requestId: pending.request.requestId,
              answers: shift.fakeChecks(
                pending.request,
                shift.FAKE_RULES[r.taskId] ?? {},
                shift.FAKE_EVENTS[r.taskId] ?? {},
              ),
              provenance: { adapter: 'fake' },
            },
      );
      continue;
    }
    const scene = shift.sceneView(state, ctx);
    if (scene.ended) return;
    const text =
      'Em thấy log có vòng lặp 901 query. Em sẽ gom truy vấn, chạy staging, theo dõi và rollback nếu lỗi, xin anh duyệt.';
    switch (scene.await.kind) {
      case 'node_choice': {
        const options = scene.node?.options ?? [];
        push({
          type: 'CHOOSE',
          option: options[variant % Math.max(1, options.length)]?.key ?? '',
          elapsedMs: 9000,
        });
        break;
      }
      case 'node_artefact':
        push({
          type: 'SAVE_ARTEFACT',
          artefact: scene.node?.form?.id ?? '',
          fields: Object.fromEntries(
            (scene.node?.form?.fields ?? []).map((f) => [f.id, text]),
          ),
        });
        break;
      case 'conversation':
        push({ type: 'END_CONVERSATION' });
        break;
      case 'node_reply':
      case 'probe_answer':
        push({ type: 'SAY', text });
        break;
      case 'confirm_end':
        push({ type: 'CONFIRM_END' });
        break;
      case 'phase': {
        const enabled = scene.actions.filter((a) => a.enabled && a.points > 0);
        const action =
          enabled.find((a) => a.kind === (variant === 1 ? 'open' : 'talk')) ??
          enabled[0];
        if (!action) return;
        push({ type: 'ACTION', key: action.key });
        break;
      }
      default:
        return;
    }
  }
}

async function keywordsOf(): Promise<EarnedKeyword[]> {
  const out: EarnedKeyword[] = [];
  for (const t of TRIED.slice(0, 5)) {
    const o = await loadProfile(t.code).catch(() => null);
    if (!o) continue;
    const refs = o.levels
      .slice(0, t.level)
      .flatMap((l) => [...l.entryKeywords, ...l.outputKeywords]);
    for (const k of refs.slice(0, 3))
      if (!out.some((x) => x.id === k.id))
        out.push({
          ...k,
          level: Math.min(3, Math.max(1, t.level)) as 1 | 2 | 3,
          group: o.group,
          regionId: o.regionId,
        });
  }
  return out;
}

/** Dựng người chơi mẫu một lần cho mỗi trình duyệt (bỏ qua nếu đã có). */
export async function ensureShowcasePlayer(): Promise<void> {
  const old = db.players.findIndex((p) => p.me.email === SHOWCASE_EMAIL);
  if (old >= 0) {
    if (db.players[old].showcase?.version === SHOWCASE_VERSION) return;
    db.players.splice(old, 1);
  }
  const task = seeds.find((s) => s.level_ref === 'SWE_BACKEND.L3') ?? seeds[0];
  if (!task) return;
  const quiz = resultOf(quizAnswers());
  const company = {
    name: 'Sao Bắc Commerce',
    kind: 'Thương mại điện tử',
    blurb: 'Sàn bán hàng cỡ vừa, đội Back-end 8 người, deploy mỗi tuần.',
  };
  const studio = {
    name: 'Xưởng Mây Xanh',
    kind: 'Studio sản phẩm số',
    blurb: 'Studio 30 người làm ứng dụng cho khách hàng trong nước.',
  };
  const p: Player = {
    me: {
      id: 'demo-showcase',
      email: SHOWCASE_EMAIL,
      username: null,
      displayName: 'Sao Mai',
      roles: ['EXPLORER'],
      hasGoogle: false,
      quizDone: true,
      dateOfBirth: '2008-05-21',
      stage: null,
    },
    password: SHOWCASE_PASSWORD,
    quiz,
    goals: quiz.goals,
    interests: quiz.interests,
    enrolments: [
      ['SWE_BACKEND', 3, company, 20],
      ['SWE_FRONTEND', 2, studio, 9],
      ['ONET-27-1024.00', 2, studio, 5],
      ['DATA_DA', 1, company, 3],
    ].map(([code, levelNo, co, ago]) => ({
      id: `demo-enrol-${String(code).toLowerCase()}-${levelNo}`,
      code: code as string,
      levelNo: levelNo as number,
      band: `L${levelNo}`,
      company: co as typeof company,
      seen: true,
      at: day(ago as number),
    })),
    runs: [],
    skills: newSkills(),
    pinned: [],
    ratings: {
      SWE_BACKEND: { a1: 4, a2: 5, a3: 3, a4: 4, a5: 4 },
    },
    ratingComments: {
      SWE_BACKEND: 'Ca sự cố khá giống thật, phần đọc log hơi khó lúc đầu.',
    },
    feedback: [],
    refreshToken: null,
    resetToken: null,
  };
  // Điểm nền cho 7 nhóm kỹ năng mềm để biểu đồ có hình dáng rõ.
  const base = [1350, 820, 610, 1980, 1150, 2400, 1720];
  p.skills = p.skills.map((s, i) => {
    const points = base[i % base.length];
    return {
      ...s,
      points,
      reachedTier: profile.tierProgress(points, 0).tier,
      scenarios: 2 + (i % 4),
    };
  });

  const l3 = p.enrolments[0];
  for (const [i, ago] of [20, 14, 9, 5, 2].entries()) {
    const r: SavedRun = {
      id: `demo-run-${i + 1}`,
      taskId: task.id,
      enrolmentId: l3.id,
      events: [],
      notes: [
        { text: 'Query /orders quét toàn bảng, thiếu index.', at: day(ago) },
      ],
      flags: [],
      reflection: null,
      realism: 2 + (i % 2),
      grade: null,
      at: day(ago),
      turnId: `demo-turn-${i + 1}`,
      paused: false,
    };
    playToEnd(r, i);
    if (!stateOf(r).ended) continue;
    p.runs.push(r);
  }
  db.players.push(p);
  // Tổng kết (điểm mẫu, cộng kỹ năng) và câu "thích tới đâu" của từng ca.
  for (const [i, r] of p.runs.entries()) {
    const summary = await summaryOf(p, r);
    r.reflection = Object.fromEntries(
      summary.reflection.prompts.map((pr, j) => [
        pr.key,
        ([3, 2, 3, 3, 2][(i + j) % 5] ?? 2) as LikeLevel,
      ]),
    );
  }

  const regionOf = (code: string) =>
    baseCatalogue.occupations.find((o) => o.code === code);
  const minutesByRegion: Showcase['minutesByRegion'] = {};
  for (const t of TRIED) {
    const o = regionOf(t.code);
    if (o)
      minutesByRegion[o.regionId] =
        (minutesByRegion[o.regionId] ?? 0) + t.minutes;
  }
  p.showcase = {
    version: SHOWCASE_VERSION,
    occupations: Object.fromEntries(
      TRIED.map((t) => [
        t.code,
        {
          status: t.status,
          currentLevel: t.level,
          highestCompleted:
            t.status === 'COMPLETED'
              ? t.level
              : t.level > 1
                ? t.level - 1
                : null,
        },
      ]),
    ),
    scenarios: 0,
    minutesByRegion,
    groups: [
      ...new Set(
        TRIED.flatMap((t) => {
          const o = regionOf(t.code);
          return o ? [o.group] : [];
        }),
      ),
    ],
    keywords: await keywordsOf(),
    taps: {
      I: [3, 3, 2],
      A: [3, 2, 3],
      S: [2, 3],
      E: [2, 1],
      C: [1, 2],
      R: [1],
    },
    favourites: [
      { text: 'Bạn đã phác luồng màn hình cho ứng dụng đặt lịch.', likes: 3 },
      {
        text: 'Bạn đã lắng nghe một học sinh kể chuyện áp lực thi cử.',
        likes: 3,
      },
    ],
    counts: { kham_pha: 7, kien_tri: 6 },
  };
  p.pinned = [];
  save();
}
