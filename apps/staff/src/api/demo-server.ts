/**
 * Máy chủ giả cho chế độ demo (`VITE_STAFF_DEMO=1`): trả dữ liệu mẫu cho mọi
 * operation staff ngay trong trình duyệt để xem đủ các màn khi chưa chạy API.
 * Không có luật nghiệp vụ thật: chỉ đủ để chuyển trạng thái và hiện màn hình.
 * Dữ liệu sống trong bộ nhớ, tải lại trang là về như ban đầu.
 */
import type {
  Asset,
  AssetKind,
  Assignment,
  Build,
  GenerationRun,
  LifecycleEntry,
  Me,
  Notification,
  Presentation,
  ProfileEdit,
  ReferenceAnswer,
  ReviewCriteria,
  ReviewDecisionInput,
  ScenarioContent,
  ScenarioDetail,
  ScenarioStatus,
  StaffOccupation,
  StreamEvent,
} from './types';

export const STAFF_DEMO = import.meta.env.VITE_STAFF_DEMO === '1';

/** Tài khoản mẫu: mật khẩu nào cũng được. */
export const DEMO_ACCOUNTS: Array<Me & { hint: string }> = [
  {
    id: 'u-demo',
    email: 'demo@jobquest.local',
    username: null,
    displayName: 'Minh Demo',
    roles: ['CONTENT_ADMIN', 'DOMAIN_EXPERT'],
    hasGoogle: false,
    quizDone: false,
    hint: 'CA + DE, xem được mọi màn',
  },
  {
    id: 'u-ca',
    email: 'ca@jobquest.local',
    username: null,
    displayName: 'Lan Quản trị',
    roles: ['CONTENT_ADMIN'],
    hasGoogle: false,
    quizDone: false,
    hint: 'Content Admin',
  },
  {
    id: 'u-de1',
    email: 'de1@jobquest.local',
    username: null,
    displayName: 'Anh Tuấn',
    roles: ['DOMAIN_EXPERT'],
    hasGoogle: false,
    quizDone: false,
    hint: 'Domain Expert',
  },
  {
    id: 'u-de2',
    email: 'de2@jobquest.local',
    username: null,
    displayName: 'Chị Hà',
    roles: ['DOMAIN_EXPERT'],
    hasGoogle: false,
    quizDone: false,
    hint: 'Domain Expert',
  },
];
const nameOf = (id: string | null | undefined) =>
  DEMO_ACCOUNTS.find((a) => a.id === id)?.displayName ?? null;

// ── Dữ liệu nghề ────────────────────────────────────────────────────────
const OCC = 'SWE_BACKEND';
const C = {
  api: '6f1a2b3c-0000-4000-8000-000000000001',
  log: '6f1a2b3c-0000-4000-8000-000000000002',
  talk: '6f1a2b3c-0000-4000-8000-000000000003',
  think: '6f1a2b3c-0000-4000-8000-000000000004',
};
const SKILLS = [
  { competencyId: C.api, name: 'Thiết kế và tối ưu API', kind: 'EXPERTISE' },
  { competencyId: C.log, name: 'Đọc log, chẩn đoán sự cố', kind: 'EXPERTISE' },
  {
    competencyId: C.talk,
    name: 'Giao tiếp với các bên liên quan',
    kind: 'SOFT_SKILL',
  },
  {
    competencyId: C.think,
    name: 'Tư duy & Giải quyết vấn đề',
    kind: 'SOFT_SKILL',
  },
] as const;

const occupations: StaffOccupation[] = [
  {
    id: OCC,
    domainId: 'demo-domain-0',
    code: OCC,
    name: 'Lập trình viên Back-end / Kỹ sư Back-end',
    status: 'PUBLISHED',
    myRole: 'CONTENT_ADMIN',
  },
  {
    id: 'SWE_FRONTEND',
    domainId: 'demo-domain-0',
    code: 'SWE_FRONTEND',
    name: 'Lập trình viên Front-end',
    status: 'DRAFT',
    myRole: 'CONTENT_ADMIN',
  },
];

const profile: ProfileEdit = {
  levels: [
    {
      levelNo: 1,
      band: 'L1',
      title: 'Backend Engineer Intern',
      creditThreshold: 0,
      competencies: [{ competencyId: C.api, proficiency: 'Cơ bản' }],
      tasks: [
        { taskId: 't-1-1', text: 'Sửa một API trả sai dữ liệu theo phiếu lỗi' },
        { taskId: 't-1-2', text: 'Viết test cho một endpoint có sẵn' },
        { taskId: 't-1-3', text: 'Đọc log để tìm vì sao một request lỗi 500' },
      ],
    },
    {
      levelNo: 2,
      band: 'L2',
      title: 'Fresher Backend Engineer',
      creditThreshold: 500,
      competencies: [{ competencyId: C.log, proficiency: 'Cơ bản' }],
      tasks: [
        { taskId: 't-2-1', text: 'Thiết kế bảng dữ liệu cho một module nhỏ' },
        {
          taskId: 't-2-2',
          text: 'Trao đổi với Front-end để chốt định dạng API',
        },
      ],
    },
    {
      levelNo: 3,
      band: 'L3',
      title: 'Junior Backend Engineer',
      creditThreshold: 1500,
      competencies: [
        { competencyId: C.api, proficiency: 'Vững' },
        { competencyId: C.log, proficiency: 'Vững' },
      ],
      tasks: [
        {
          taskId: 't-3-1',
          text: 'Xử lý sự cố API chậm giờ cao điểm và báo cáo cho trưởng nhóm',
        },
        { taskId: 't-3-2', text: 'Tối ưu một truy vấn chậm trong báo cáo' },
        { taskId: 't-3-3', text: 'Rà soát code của một bạn mới vào nhóm' },
      ],
    },
  ],
  downsides: [
    'Kết quả khó nhìn thấy: làm tốt thì ít ai để ý, làm sai thì cả ứng dụng phía trước bị ảnh hưởng.',
    'Có lúc phải trực xử lý sự cố ngoài giờ.',
  ],
  generationRules: [
    'Không đưa tên công ty thật.',
    'Số liệu kỹ thuật phải hợp lý với hệ thống cỡ vừa.',
  ],
};

let criteria: ReviewCriteria = {
  versionNo: 2,
  criteria: [
    {
      criterionId: 'cr-1',
      text: 'Tình huống giống việc thật của nghề ở cấp này',
    },
    { criterionId: 'cr-2', text: 'Kỹ năng được chấm khớp với việc phải làm' },
    {
      criterionId: 'cr-3',
      text: 'Thang chấm phân biệt rõ câu trả lời tốt, vừa, yếu',
    },
    {
      criterionId: 'cr-4',
      text: 'Không có định kiến hay chi tiết gây hiểu lầm',
    },
  ],
};

// ── Nội dung scenario mẫu ──────────────────────────────────────────────
const rubric = (
  competencyId: string,
  id: string,
  a2: string,
  a1: string,
  a0: string,
) => ({
  id,
  competencyId,
  anchor2: a2,
  anchor1: a1,
  anchor0: a0,
});

const backendContent = (): ScenarioContent => ({
  intro:
    '9:40 sáng thứ Hai. Kênh #su-co báo API đơn hàng chậm, khách hàng lớn đang phàn nàn.',
  situation:
    'API /orders mất 4–6 giây mỗi request từ 9:15. Trưởng nhóm An cần biết nguyên nhân trước 12:00.',
  stakes:
    'Nếu không xử lý kịp, đối tác bán hàng mất doanh thu trong giờ cao điểm trưa.',
  estimatedMinutes: 12,
  cast: [
    {
      npcKey: 'an',
      name: 'Anh An',
      roleInScene: 'Trưởng nhóm Back-end',
      pressure: 'Cần câu trả lời để báo lên trên',
      voice: 'Ngắn gọn, bình tĩnh',
    },
    {
      npcKey: 'linh',
      name: 'Chị Linh',
      roleInScene: 'Phụ trách khách hàng',
      pressure: 'Khách đang hỏi giờ xong',
      voice: 'Lo lắng, thân thiện',
    },
  ],
  activities: [
    {
      key: 'a1',
      isOrigin: true,
      forwardTo: 'a2',
      setup: 'Bạn mở dashboard và log của dịch vụ đơn hàng.',
      npcLine: 'Em xem log trước rồi báo anh nha, đừng sửa gì trên production.',
      inputPrompt: 'Bạn sẽ kiểm tra những gì trước, theo thứ tự nào?',
      jobScope: 'Chẩn đoán, chưa sửa production',
      closingLine: 'Ừ, hướng đó ổn. Có gì nhắn anh.',
      allowedTypes: ['FREE_TEXT', 'ORDERING'],
      items: [
        {
          key: 'i1',
          text: 'Xem biểu đồ độ trễ theo thời gian',
          correctPosition: 1,
        },
        { key: 'i2', text: 'Lọc log request chậm nhất', correctPosition: 2 },
        {
          key: 'i3',
          text: 'Kiểm tra truy vấn database của API',
          correctPosition: 3,
        },
      ],
      hints: ['Bắt đầu từ chỗ thấy được thời điểm chậm bắt đầu.'],
      rubric: [
        rubric(
          C.log,
          'b1f0c0de-0000-4000-8000-000000000011',
          'Đi từ số liệu tổng tới log chi tiết, nêu rõ cần tìm gì',
          'Có kiểm tra log nhưng chưa có thứ tự rõ',
          'Đoán nguyên nhân và sửa ngay mà không kiểm tra',
        ),
      ],
    },
    {
      key: 'a2',
      forwardTo: 'a3',
      setup: 'Log cho thấy một truy vấn mới thêm hôm thứ Sáu quét toàn bảng.',
      npcLine: 'Chị nói với họ trưa xong được hông em?',
      inputPrompt: 'Bạn trả lời chị Linh thế nào?',
      jobScope: 'Giao tiếp, không hứa giờ chưa chắc',
      closingLine: 'Ok em, chị báo khách vậy.',
      allowedTypes: ['CHOICE'],
      items: [
        {
          key: 'c1',
          text: 'Em chưa chắc được giờ xong chị ơi. 11 rưỡi em gọi báo chị tình hình nha.',
          score: 2,
        },
        { key: 'c2', text: 'Dạ chị cứ nói khách trưa là xong ạ.', score: 0 },
        {
          key: 'c3',
          text: 'Em chưa hứa giờ được chị. Chị nói khách là bên em đang tìm nguyên nhân, có tin em báo.',
          score: 1,
        },
      ],
      rubric: [
        rubric(
          C.talk,
          'b1f0c0de-0000-4000-8000-000000000021',
          'Nói rõ điều đã biết, hẹn mốc cập nhật cụ thể',
          'Không hứa sai nhưng chưa hẹn mốc',
          'Hứa giờ xong khi chưa có căn cứ',
        ),
      ],
    },
    {
      key: 'a3',
      forwardTo: null,
      setup: 'Bạn đã có đủ dữ kiện để viết báo cáo ngắn cho anh An.',
      inputPrompt:
        'Viết báo cáo sự cố gửi anh An (nguyên nhân, ảnh hưởng, đề xuất).',
      jobScope: 'Báo cáo và đề xuất, chưa triển khai',
      closingLine: 'Cảm ơn em, anh duyệt phương án thêm index trước.',
      allowedTypes: ['FREE_TEXT'],
      followupLimit: 1,
      followupGoal: 'Làm rõ rủi ro khi thêm index giờ cao điểm',
      rubric: [
        rubric(
          C.api,
          'b1f0c0de-0000-4000-8000-000000000031',
          'Chỉ đúng truy vấn gây chậm, đề xuất index kèm rủi ro',
          'Chỉ đúng nguyên nhân nhưng đề xuất còn chung chung',
          'Không nêu được nguyên nhân',
        ),
        rubric(
          C.think,
          'b1f0c0de-0000-4000-8000-000000000032',
          'Tách nguyên nhân, ảnh hưởng, đề xuất mạch lạc',
          'Đủ ý nhưng lộn xộn',
          'Thiếu ảnh hưởng hoặc đề xuất',
        ),
      ],
    },
  ],
  endings: [
    {
      type: 'GOOD',
      priority: 1,
      minTotalScore: 6,
      text: 'Bạn tìm đúng nguyên nhân trước 11:30, khách được báo đúng lúc.',
    },
    {
      type: 'PARTIAL',
      priority: 2,
      minTotalScore: 3,
      text: 'Sự cố được xử lý nhưng khách phải chờ thêm vì thông tin chậm.',
    },
    {
      type: 'BAD',
      priority: 3,
      text: 'Lời hứa giờ xong không giữ được, khách phàn nàn lên cấp trên.',
    },
  ],
});

// ── Scenario ───────────────────────────────────────────────────────────
interface DemoScenario extends ScenarioDetail {
  history: LifecycleEntry[];
  references: ReferenceAnswer[];
  generations: GenerationRun[];
  presentation: Presentation;
  previousReviews: Array<{
    decision: string;
    comment: string;
    decidedAt: string;
  }>;
}

const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();
const experts = DEMO_ACCOUNTS.filter((a) =>
  a.roles.includes('DOMAIN_EXPERT'),
).map((a) => ({ userId: a.id, displayName: a.displayName }));

function scenario(
  id: string,
  taskId: string,
  status: ScenarioStatus,
  authorId: string | null,
  reviewerId: string | null,
  withContent: boolean,
  extra: Partial<DemoScenario> = {},
): DemoScenario {
  const level = profile.levels.find((l) =>
    l.tasks.some((t) => t.taskId === taskId),
  );
  const task = level?.tasks.find((t) => t.taskId === taskId);
  const content = withContent ? backendContent() : undefined;
  return {
    id,
    taskTitle: task?.text ?? id,
    occupationId: OCC,
    levelNo: level?.levelNo ?? 1,
    status,
    authorName: nameOf(authorId),
    reviewerName: nameOf(reviewerId),
    reviewDeadline: reviewerId ? days(3) : null,
    updatedAt: days(-1),
    version: '1',
    allowedActions: [],
    authorContext: withContent
      ? 'Sự cố thật từng gặp: một truy vấn mới không có index làm API chậm giờ cao điểm.'
      : undefined,
    archetype: withContent ? 'Sự cố dưới áp lực thời gian' : undefined,
    companyType: withContent ? 'Công ty thương mại điện tử cỡ vừa' : undefined,
    skillIds: [C.api, C.log, C.talk, C.think],
    content,
    assignment:
      authorId && reviewerId
        ? {
            assignmentId: `as-${id}`,
            scenarioId: id,
            authorId,
            reviewerId,
            deadlineAt: id === 's-review' ? days(-1) : days(3),
            status: 'ACTIVE',
            overdue: id === 's-review',
          }
        : undefined,
    eligibleExperts: experts,
    history: [
      {
        at: days(-6),
        actor: 'Lan Quản trị',
        action: 'OPEN',
        fromStatus: null,
        toStatus: 'DRAFT',
        note: null,
      },
    ],
    references: [],
    generations: withContent
      ? [
          {
            id: `g-${id}`,
            kind: 'GENERATE',
            status: 'DONE',
            model: 'qwen-max (giả)',
            costUsd: 0.012,
            checkPassed: true,
            createdAt: days(-5),
            requestedBy: nameOf(authorId) ?? 'Minh Demo',
          },
        ]
      : [],
    presentation: {
      backgroundAssetId: status === 'APPROVED' ? null : 'as-bg-office',
      activities: (content?.activities ?? []).map((a) => ({
        activityKey: a.key,
        taskType: a.allowedTypes[0],
        sceneAssetId: null,
      })),
      npcs: (content?.cast ?? []).map((c, i) => ({
        npcKey: c.npcKey,
        avatarAssetId: i === 0 ? 'as-npc-lead' : 'as-npc-relations',
      })),
    },
    previousReviews: [],
    ...extra,
  };
}

const scenarios: DemoScenario[] = [
  scenario('s-draft', 't-3-1', 'DRAFT', 'u-demo', 'u-de2', true),
  scenario('s-empty', 't-3-2', 'DRAFT', 'u-demo', 'u-de2', false),
  scenario('s-review', 't-1-3', 'IN_REVIEW', 'u-de2', 'u-demo', true),
  scenario('s-approved', 't-2-1', 'APPROVED', 'u-de1', 'u-de2', true),
  scenario('s-playtest', 't-1-1', 'IN_PLAYTEST', 'u-de1', 'u-demo', true),
  scenario('s-ready', 't-2-2', 'READY', 'u-de2', 'u-de1', true),
  scenario('s-published', 't-1-2', 'PUBLISHED', 'u-de1', 'u-de2', true),
];
scenarios[1].history.push({
  at: days(-4),
  actor: 'Anh Tuấn',
  action: 'REQUEST_CHANGES',
  fromStatus: 'IN_REVIEW',
  toStatus: 'DRAFT',
  note: 'Phần chọn câu trả lời chưa có phương án sai rõ ràng.',
});

const ACTIONS: Record<ScenarioStatus, ScenarioDetail['allowedActions']> = {
  DRAFT: ['SUBMIT', 'DELETE'],
  SUBMITTED: ['START_REVIEW'],
  IN_REVIEW: ['APPROVE', 'REQUEST_CHANGES', 'REJECT'],
  APPROVED: ['BUILD_DRAFT'],
  IN_PLAYTEST: [
    'PASS_PLAYTEST',
    'REPORT_DISPLAY_ISSUE',
    'REPORT_CONTENT_ISSUE',
  ],
  READY: ['PUBLISH'],
  PUBLISHED: [],
  RETIRED: [],
};

const SCENARIO_ONLY = [
  'history',
  'references',
  'generations',
  'presentation',
  'previousReviews',
] as const;
const detailOf = (s: DemoScenario): ScenarioDetail => {
  const detail: Partial<DemoScenario> = { ...s };
  for (const key of SCENARIO_ONLY) delete detail[key];
  return structuredClone({
    ...(detail as ScenarioDetail),
    allowedActions: ACTIONS[s.status],
  });
};
const listItemOf = (s: DemoScenario) => {
  const {
    id,
    taskTitle,
    occupationId,
    levelNo,
    status,
    authorName,
    reviewerName,
    reviewDeadline,
    updatedAt,
  } = s;
  return {
    id,
    taskTitle,
    occupationId,
    levelNo,
    status,
    authorName,
    reviewerName,
    reviewDeadline,
    updatedAt,
  };
};

function move(
  s: DemoScenario,
  to: ScenarioStatus,
  action: string,
  actor: string,
  note: string | null = null,
) {
  s.history.push({
    at: new Date().toISOString(),
    actor,
    action,
    fromStatus: s.status,
    toStatus: to,
    note,
  });
  s.status = to;
  s.updatedAt = new Date().toISOString();
  s.version = String(Number(s.version) + 1);
}

// ── Asset ──────────────────────────────────────────────────────────────
const art = (file: string) =>
  new URL(`../../../web/src/assets/toon/${file}`, import.meta.url).href;
const assets: Asset[] = [
  ['as-bg-office', 'BACKGROUND', 'bg-office.webp', 'Văn phòng mở'],
  ['as-bg-meeting', 'BACKGROUND', 'bg-meeting.webp', 'Phòng họp'],
  ['as-bg-cafe', 'BACKGROUND', 'bg-cafe.webp', 'Quán cà phê'],
  ['as-bg-street', 'SCENE', 'bg-street.webp', 'Trước cửa công ty'],
  ['as-npc-lead', 'NPC', 'char-lead.webp', 'Trưởng nhóm'],
  ['as-npc-relations', 'NPC', 'char-relations.webp', 'Phụ trách khách hàng'],
  ['as-npc-engineer', 'NPC', 'char-engineer.webp', 'Kỹ sư'],
  ['as-npc-designer', 'NPC', 'char-designer.webp', 'Thiết kế'],
  ['as-npc-analyst', 'NPC', 'char-analyst.webp', 'Phân tích'],
  ['as-npc-architect', 'NPC', 'char-architect.webp', 'Kiến trúc sư'],
].map(([id, kind, file, note]) => ({
  id,
  kind: kind as AssetKind,
  url: art(file),
  source: 'LIBRARY',
  sourceNote: `Concept art nhóm · ${note}`,
  biasCheck: 'PASSED',
}));

const builds = new Map<string, Build>();

const notifications: Notification[] = [
  {
    id: 'n1',
    template: 'REVIEW_ASSIGNED',
    payload: { scenarioId: 's-review', title: scenarios[2].taskTitle },
    createdAt: days(-1),
    readAt: null,
  },
  {
    id: 'n2',
    template: 'SCENARIO_ASSIGNED',
    payload: { scenarioId: 's-empty', title: scenarios[1].taskTitle },
    createdAt: days(-2),
    readAt: null,
  },
  {
    id: 'n3',
    template: 'DRAFT_READY',
    payload: { scenarioId: 's-playtest', title: scenarios[4].taskTitle },
    createdAt: days(-3),
    readAt: days(-2),
  },
];

// ── Luồng sự kiện (SSE giả) ────────────────────────────────────────────
const listeners = new Set<(e: StreamEvent) => void>();
const emit = (e: StreamEvent, delayMs = 1800) =>
  setTimeout(() => listeners.forEach((l) => l(e)), delayMs);

function streamResponse(signal?: AbortSignal | null): Response {
  const encoder = new TextEncoder();
  let n = 0;
  let listener: ((e: StreamEvent) => void) | null = null;
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(': demo\n\n'));
      listener = (e) =>
        controller.enqueue(
          encoder.encode(`id: ${++n}\ndata: ${JSON.stringify(e)}\n\n`),
        );
      listeners.add(listener);
      signal?.addEventListener('abort', () => {
        if (listener) listeners.delete(listener);
        try {
          controller.close();
        } catch {
          // Đã đóng.
        }
      });
    },
    cancel() {
      if (listener) listeners.delete(listener);
    },
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

// ── Định tuyến ─────────────────────────────────────────────────────────
const TOKEN_PREFIX = 'demo-token:';
const userFromToken = (token: string | null) =>
  DEMO_ACCOUNTS.find((a) => token === `${TOKEN_PREFIX}${a.id}`) ?? null;

const json = (data: unknown, status = 200) =>
  new Response(data === undefined ? null : JSON.stringify(data), {
    status: data === undefined && status === 200 ? 204 : status,
    headers: { 'Content-Type': 'application/json' },
  });
const problem = (status: number, code: string, title: string) =>
  json({ code, title }, status);

const sessionFor = (user: Me) => ({
  accessToken: `${TOKEN_PREFIX}${user.id}`,
  refreshToken: `${TOKEN_PREFIX}${user.id}`,
  expiresIn: 3600,
  user: publicMe(user),
});
const publicMe = (user: Me): Me => {
  const me: Me & { hint?: string } = { ...user };
  delete me.hint;
  return structuredClone(me);
};

/** Làm mới phiên giả từ refresh token đã lưu. */
export function demoRefresh(refreshToken: string | null) {
  const user = userFromToken(refreshToken);
  return user ? sessionFor(user) : null;
}

const page = <T>(items: T[]) => ({ items, nextCursor: null });

export async function demoFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = new URL(input, 'http://demo.local');
  const path = url.pathname.replace(/^\/api\/v1/, '');
  const method = (init.method ?? 'GET').toUpperCase();
  const auth = new Headers(init.headers).get('Authorization');
  const me = userFromToken(auth?.replace(/^Bearer /, '') ?? null);
  const body =
    typeof init.body === 'string'
      ? (JSON.parse(init.body) as Record<string, unknown>)
      : undefined;
  await new Promise((r) => setTimeout(r, 150));

  if (path === '/auth/sign-in' && method === 'POST') {
    const user = DEMO_ACCOUNTS.find(
      (a) =>
        a.email ===
        String(body?.['email'] ?? '')
          .trim()
          .toLowerCase(),
    );
    if (!user)
      return problem(
        401,
        'INVALID_CREDENTIALS',
        'Email không có trong danh sách tài khoản mẫu',
      );
    return json(sessionFor(user));
  }
  if (path.startsWith('/auth/')) return json(undefined);
  if (!me) return problem(401, 'UNAUTHORIZED', 'Phiên đăng nhập đã hết');
  if (path === '/stream') return streamResponse(init.signal);
  if (path === '/me') return json(publicMe(me));

  const q = url.searchParams;
  const seg = path.split('/').filter(Boolean); // ['staff', ...]
  const find = (id: string) => scenarios.find((s) => s.id === id);

  // /staff/notifications, /staff/occupations…
  if (seg[1] === 'notifications') return json(page(notifications));
  if (seg[1] === 'occupations' && seg.length === 2) {
    // Mỗi vai của người dùng là một dòng phân công (staff_assignment).
    const roles = (['CONTENT_ADMIN', 'DOMAIN_EXPERT'] as const).filter((r) =>
      me.roles.includes(r),
    );
    return json(
      roles.flatMap((myRole) => occupations.map((o) => ({ ...o, myRole }))),
    );
  }
  if (seg[1] === 'occupations' && seg[3] === 'profile') return json(profile);
  if (seg[1] === 'occupations' && seg[3] === 'review-criteria') {
    if (method === 'POST') {
      const texts = (body?.['criteria'] as Array<{ text: string }>) ?? [];
      criteria = {
        versionNo: criteria.versionNo + 1,
        criteria: texts.map((t, i) => ({
          criterionId: `cr-${criteria.versionNo + 1}-${i}`,
          text: t.text,
        })),
      };
    }
    return json(criteria);
  }

  if (seg[1] === 'scenarios' && seg.length === 2) {
    if (method === 'POST') {
      const taskId = String(body?.['taskId'] ?? '');
      const s = scenario(
        `s-${taskId}-${Date.now()}`,
        taskId,
        'DRAFT',
        null,
        null,
        false,
      );
      scenarios.push(s);
      return json(detailOf(s), 201);
    }
    let items = scenarios;
    if (q.get('occupationId'))
      items = items.filter((s) => s.occupationId === q.get('occupationId'));
    if (q.get('status'))
      items = items.filter((s) => s.status === q.get('status'));
    if (q.get('mine') === 'true')
      items = items.filter(
        (s) =>
          s.assignment?.authorId === me.id ||
          s.assignment?.reviewerId === me.id,
      );
    return json(page(items.map(listItemOf)));
  }

  if (seg[1] === 'scenarios' && seg[2]) {
    const s = find(seg[2]);
    if (!s) return problem(404, 'NOT_FOUND', 'Không tìm thấy scenario mẫu');
    const sub = seg[3];
    if (!sub) return json(detailOf(s));
    if (sub === 'assignment') {
      const b = body as {
        authorId: string;
        reviewerId: string;
        deadlineAt: string;
      };
      if (b.authorId === b.reviewerId)
        return problem(
          409,
          'REVIEWER_IS_AUTHOR',
          'Người duyệt phải khác tác giả',
        );
      s.assignment = {
        assignmentId: `as-${s.id}`,
        scenarioId: s.id,
        authorId: b.authorId,
        reviewerId: b.reviewerId,
        deadlineAt: b.deadlineAt,
        status: 'ACTIVE',
        overdue: false,
      };
      s.authorName = nameOf(b.authorId);
      s.reviewerName = nameOf(b.reviewerId);
      s.reviewDeadline = b.deadlineAt;
      return json(s.assignment);
    }
    if (sub === 'history') return json(s.history);
    if (sub === 'situation-options')
      return json({
        band: `L${s.levelNo}`,
        archetypes: [
          'Sự cố dưới áp lực thời gian',
          'Yêu cầu mơ hồ từ khách',
          'Phối hợp liên nhóm',
        ],
        companyTypes: [
          'Công ty thương mại điện tử cỡ vừa',
          'Startup fintech',
          'Công ty outsource',
        ],
        skills: SKILLS,
      });
    if (sub === 'generations') {
      if (method === 'POST') {
        const jobId = `job-${Date.now()}`;
        s.generations.unshift({
          id: jobId,
          kind: 'GENERATE',
          status: 'DONE',
          model: 'qwen-max (giả)',
          costUsd: 0.011,
          checkPassed: true,
          createdAt: new Date().toISOString(),
          requestedBy: me.displayName,
        });
        emit({
          type: 'generation.ready',
          scenarioId: s.id,
          jobId,
          payload: {
            content: backendContent(),
            checkReport: { passed: true, failedRules: [] },
          },
        });
        return json({ jobId, streamEvent: 'generation.ready' }, 202);
      }
      return json(s.generations);
    }
    if (sub === 'revisions') {
      const jobId = `job-${Date.now()}`;
      const part = String(body?.['part'] ?? 'intro');
      emit({
        type: 'revision.ready',
        scenarioId: s.id,
        jobId,
        payload: {
          part,
          value: `(AI giả đã viết lại theo yêu cầu: "${String(body?.['request'] ?? '')}")`,
        },
      });
      return json({ jobId, streamEvent: 'revision.ready' }, 202);
    }
    if (sub === 'content') {
      s.content = body as unknown as ScenarioContent;
      s.version = String(Number(s.version) + 1);
      s.updatedAt = new Date().toISOString();
      return json(detailOf(s));
    }
    if (sub === 'checks') return json({ passed: true, failedRules: [] });
    if (sub === 'reference-answers') {
      if (method === 'POST') {
        const a = {
          ...(body as unknown as ReferenceAnswer),
          id: `ra-${Date.now()}`,
        };
        s.references.push(a);
        return json(a, 201);
      }
      return json(s.references);
    }
    if (sub === 'submit') {
      move(s, 'IN_REVIEW', 'SUBMIT', me.displayName);
      return json(detailOf(s));
    }
    if (sub === 'review') {
      if (method === 'POST') {
        const d = body as unknown as ReviewDecisionInput;
        s.previousReviews.push({
          decision: d.decision,
          comment: d.comment ?? '',
          decidedAt: new Date().toISOString(),
        });
        move(
          s,
          d.decision === 'APPROVE'
            ? 'APPROVED'
            : d.decision === 'REJECT'
              ? 'RETIRED'
              : 'DRAFT',
          d.decision,
          me.displayName,
          d.comment ?? null,
        );
        return json(detailOf(s));
      }
      return json({
        scenario: detailOf(s),
        criteria,
        previousReviews: s.previousReviews,
      });
    }
    if (sub === 'presentation') {
      if (method === 'PUT') s.presentation = body as unknown as Presentation;
      return json(s.presentation);
    }
    if (sub === 'builds') {
      const build: Build = {
        id: `b-${Date.now()}`,
        scenarioId: s.id,
        contentHash: Math.random().toString(16).slice(2, 10),
        builtAt: new Date().toISOString(),
        content: { content: s.content, presentation: s.presentation },
      };
      builds.set(build.id, build);
      move(s, 'IN_PLAYTEST', 'BUILD_DRAFT', me.displayName);
      return json(build, 201);
    }
  }

  if (seg[1] === 'reviews')
    return json(
      scenarios
        .filter(
          (s) => s.status === 'IN_REVIEW' && s.assignment?.reviewerId === me.id,
        )
        .map((s) => ({
          kind: 'REVIEW',
          scenarioId: s.id,
          title: s.taskTitle,
          deadlineAt: s.assignment?.deadlineAt ?? null,
        })),
    );
  if (seg[1] === 'review-assignments') {
    if (seg[3] === 'reassign') {
      const s = scenarios.find((x) => x.assignment?.assignmentId === seg[2]);
      const b = body as { reviewerId: string; deadlineAt: string };
      if (!s?.assignment)
        return problem(404, 'NOT_FOUND', 'Không tìm thấy phân công');
      s.assignment = {
        ...s.assignment,
        reviewerId: b.reviewerId,
        deadlineAt: b.deadlineAt,
        overdue: false,
      };
      s.reviewerName = nameOf(b.reviewerId);
      return json(s.assignment);
    }
    let list: Assignment[] = scenarios.flatMap((s) =>
      s.assignment ? [s.assignment] : [],
    );
    if (q.get('overdue') === 'true') list = list.filter((a) => a.overdue);
    return json(list);
  }
  if (seg[1] === 'assets') {
    if (method === 'POST' && init.body instanceof FormData) {
      const file = init.body.get('file');
      const asset: Asset = {
        id: `as-${Date.now()}`,
        kind: String(init.body.get('kind')) as AssetKind,
        url:
          file instanceof File
            ? URL.createObjectURL(file)
            : art('bg-home.webp'),
        source: 'LICENSED',
        sourceNote: String(init.body.get('sourceNote') ?? ''),
        biasCheck:
          init.body.get('biasChecked') === 'true' ? 'PASSED' : 'PENDING',
      };
      assets.unshift(asset);
      return json(asset, 201);
    }
    const kind = q.get('kind');
    return json(kind ? assets.filter((a) => a.kind === kind) : assets);
  }
  if (seg[1] === 'builds' && seg[2]) {
    const build = builds.get(seg[2]);
    return build
      ? json(build)
      : problem(404, 'NOT_FOUND', 'Không tìm thấy bản dựng');
  }

  return problem(
    404,
    'NOT_FOUND',
    `Demo chưa có dữ liệu cho ${method} ${path}`,
  );
}
