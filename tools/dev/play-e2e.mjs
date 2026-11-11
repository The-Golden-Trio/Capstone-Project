// Chơi trọn một màn qua HTTP như trình duyệt (cookie phiên, /api/v1/runs…, /api/v1/stream).
// Cần API và worker đang chạy (pnpm start). Gọi model thật: tốn khoảng 0,003 USD mỗi lần.
//   node tools/dev/play-e2e.mjs [scenarioKey] ["câu tự luận"] ["câu trả lời hỏi vặn"]
const BASE = process.env.API_BASE ?? 'http://localhost:3000/api';
const scenarioKey = process.argv[2] ?? 'SWE_BACKEND_L1_S_EXEC';
const freeText =
  process.argv[3] ??
  'Em sẽ đọc log lỗi trước, tái hiện bug trên máy local, viết test chạy fail rồi mới sửa. Sửa xong em chạy lại toàn bộ test và nhờ anh review PR trước khi merge.';
const followText =
  process.argv[4] ??
  'Em sửa ở hàm tính tổng tiền: làm tròn sai khi có giảm giá. Chỗ em chưa chắc là đơn có nhiều mã giảm giá cùng lúc, em sẽ hỏi lại anh hoặc PO trước khi làm.';

let cookie = '';
async function call(method, path, body, extraHeaders = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { cookie } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const set = res.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

const log = (...a) => console.log(new Date().toISOString().slice(11, 23), ...a);
const events = [];
const waiters = [];
function waitFor(pred, ms = 90_000) {
  const hit = events.find(pred);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error('timeout waiting for event')),
      ms,
    );
    waiters.push({
      pred,
      resolve: (e) => {
        clearTimeout(t);
        resolve(e);
      },
    });
  });
}

async function openStream() {
  const res = await fetch(BASE + '/v1/stream', {
    headers: { cookie, Accept: 'text/event-stream' },
  });
  log('stream', res.status, res.headers.get('content-type'));
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  (async () => {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buf += dec.decode(value, { stream: true });
      const blocks = buf.split('\n\n');
      buf = blocks.pop();
      for (const b of blocks) {
        const data = b
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trim())
          .join('\n');
        const id = b
          .split('\n')
          .find((l) => l.startsWith('id:'))
          ?.slice(3)
          .trim();
        if (!data) continue;
        const e = JSON.parse(data);
        e._id = id;
        events.push(e);
        log('EVENT', e.type, JSON.stringify(e.payload));
        for (const w of [...waiters])
          if (w.pred(e)) {
            waiters.splice(waiters.indexOf(w), 1);
            w.resolve(e);
          }
      }
    }
  })().catch(() => {});
}

const user = `e2e_${Date.now().toString(36)}`;
let r = await call('POST', '/auth/register', {
  username: user,
  email: `${user}@example.test`,
  password: 'matkhau-dai-123',
  displayName: 'Lan Nguyễn',
  dateOfBirth: '2005-01-01',
});
log('register', r.status, r.json?.user?.username ?? JSON.stringify(r.json));

await openStream();
r = await call('POST', '/v1/runs', {
  enrolmentId: 'demo',
  taskId: scenarioKey,
});
log('startRun', r.status, JSON.stringify(r.json).slice(0, 200));
const runId = r.json.id;
const again = await call('POST', '/v1/runs', {
  enrolmentId: 'demo',
  taskId: scenarioKey,
});
log(
  'startRun again (resume)',
  again.status,
  again.json.id === runId ? 'same run ✔' : 'DIFFERENT ✖',
);

const release = await call(
  'GET',
  `/v1/releases/${encodeURIComponent(r.json.releaseVersion)}`,
);
log('release', release.status, release.json?.scenario_title);
const scenario = release.json;

for (let guard = 0; guard < 12; guard++) {
  const act = await call('GET', `/v1/runs/${runId}/activity`);
  if (act.status !== 200) {
    log('activity', act.status, act.json?.code);
    break;
  }
  const a = act.json;
  const content = scenario.activities.find(
    (x) => x.activity_id === a.activityKey,
  );
  log(
    'ACTIVITY',
    a.activityKey,
    a.taskType,
    '| npc:',
    a.npc?.name,
    '| hint:',
    a.hintAvailable,
  );

  if (a.hintAvailable && a.activityKey === 'a2') {
    const h = await call('POST', `/v1/runs/${runId}/hints`, {
      activityKey: a.activityKey,
    });
    log('hint', h.status, JSON.stringify(h.json));
  }

  let body;
  if (a.taskType === 'CHOICE')
    body = {
      selection: String(content.optionGrade.findIndex((g) => g === '+2')),
    };
  else if (a.taskType === 'ORDERING')
    body = { selection: content.correct_order };
  else if (a.taskType === 'PRIORITIZING')
    body = {
      selection: [...content.must_pick, ...content.should_pick].slice(
        0,
        content.pick_count,
      ),
    };
  else body = { text: freeText };

  if (a.taskType !== 'FREE_TEXT') {
    const bad = await call('POST', `/v1/runs/${runId}/answers`, {
      answerId: crypto.randomUUID(),
      activityKey: a.activityKey,
      selection: a.taskType === 'CHOICE' ? '99' : ['nope'],
    });
    log(
      'invalid answer →',
      bad.status,
      bad.json?.code,
      JSON.stringify(bad.json?.errors),
    );
  }
  const answerId = crypto.randomUUID();
  const ans = await call('POST', `/v1/runs/${runId}/answers`, {
    answerId,
    activityKey: a.activityKey,
    followupNo: 0,
    ...body,
  });
  log('answer', ans.status, JSON.stringify(ans.json));
  const dup = await call('POST', `/v1/runs/${runId}/answers`, {
    answerId,
    activityKey: a.activityKey,
    followupNo: 0,
    ...body,
  });
  log(
    'same answerId again →',
    dup.status,
    JSON.stringify(dup.json) === JSON.stringify(ans.json)
      ? 'same body ✔'
      : JSON.stringify(dup.json),
  );

  if (ans.status === 202) {
    const next = await waitFor(
      (e) =>
        e.runId === runId &&
        (e.type === 'followup.asked' || e.type === 'activity.closed') &&
        e.payload.activityKey === a.activityKey,
    );
    if (next.type === 'followup.asked') {
      log('FOLLOW-UP from', next.payload.name, ':', next.payload.question);
      const view = await call('GET', `/v1/runs/${runId}/activity`);
      log(
        'activity.followup (resume aid):',
        JSON.stringify(view.json.followup),
      );
      const f = await call('POST', `/v1/runs/${runId}/answers`, {
        answerId: crypto.randomUUID(),
        activityKey: a.activityKey,
        followupNo: next.payload.followupNo,
        text: followText,
      });
      log('follow-up answer', f.status, JSON.stringify(f.json));
      await waitFor(
        (e) =>
          e.runId === runId &&
          e.type === 'activity.closed' &&
          e.payload.activityKey === a.activityKey,
      );
    }
  }
}

let fin = await call('POST', `/v1/runs/${runId}/finish`);
log('finish', fin.status, JSON.stringify(fin.json).slice(0, 300));
if (fin.status === 202) {
  await waitFor(
    (e) => e.runId === runId && e.type === 'summary.ready',
    180_000,
  );
}
const sum = await call('GET', `/v1/runs/${runId}/summary`);
log('summary', sum.status);
console.log(JSON.stringify(sum.json, null, 2));
const run = await call('GET', `/v1/runs/${runId}`);
log('run', run.status, run.json.status, run.json.currentActivityKey);
console.log('RUN_ID', runId);
process.exit(0);
