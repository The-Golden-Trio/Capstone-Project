// Explorer session profile for Chapter 7.2.
// Each VU is a distinct registered explorer. Think time 5–10 s between requests,
// the rate assumed in Section 5.3 for an active explorer.
// 70% of iterations browse (map, profile, progress); 30% play one L1 scenario:
// load the scenario, start a run, play it locally with game-core on the server seed,
// and submit the action log, which the server replays and scores.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { autoplay } from './autoplay.bundle.js';

const BASE = __ENV.BASE || 'http://localhost:3000/api';
const VUS = Number(__ENV.VUS || 50);
const HOLD = __ENV.HOLD || '3m';
const THINK_MIN = Number(__ENV.THINK_MIN || 5);
const THINK_MAX = Number(__ENV.THINK_MAX || 10);
const KEY = 'SWE_BACKEND_L1_S_EXEC';

const completeTrend = new Trend('t_run_complete', true);

export const options = {
  setupTimeout: '5m',
  scenarios: {
    explorers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: VUS },
        { duration: HOLD, target: VUS },
      ],
      gracefulRampDown: '10s',
    },
  },
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function setup() {
  const sessions = [];
  for (let start = 0; start < VUS; start += 20) {
    const reqs = [];
    for (let i = start; i < Math.min(start + 20, VUS); i++) {
      reqs.push(['POST', `${BASE}/auth/login`,
        JSON.stringify({ identifier: `eval${String(i).padStart(3, '0')}`, password: 'evaluation-pass-1' }),
        { headers: { 'content-type': 'application/json' }, tags: { name: 'setup' } }]);
    }
    for (const r of http.batch(reqs)) {
      const c = r.cookies.access_token;
      if (!c) throw new Error(`login failed with status ${r.status}: each VU needs its own account`);
      sessions.push(`access_token=${c[0].value}`);
    }
  }
  return { sessions };
}

const think = () => sleep(THINK_MIN + Math.random() * (THINK_MAX - THINK_MIN));

export default function (data) {
  const headers = { cookie: data.sessions[(__VU - 1) % data.sessions.length], 'content-type': 'application/json' };
  const get = (path, name) => {
    const r = http.get(`${BASE}${path}`, { headers, tags: { name } });
    check(r, { [`${name} 2xx`]: (x) => x.status >= 200 && x.status < 300 });
    return r;
  };

  if (Math.random() < 0.7) {
    get('/auth/me', 'GET /auth/me'); think();
    get('/content/bootstrap', 'GET /content/bootstrap'); think();
    get('/content/galaxy', 'GET /content/galaxy'); think();
    get('/profile', 'GET /profile'); think();
    get('/profile/progress', 'GET /profile/progress'); think();
    get('/profile/roles/SWE_BACKEND', 'GET /profile/roles/:role'); think();
    get('/profile/runs', 'GET /profile/runs'); think();
  } else {
    const content = get(`/content/scenarios/${KEY}`, 'GET /content/scenarios/:key').json();
    think();
    const started = http.post(`${BASE}/runs`, JSON.stringify({ scenarioKey: KEY }), { headers, tags: { name: 'POST /runs' } });
    check(started, { 'POST /runs 2xx': (x) => x.status === 201 });
    if (started.status !== 201) { think(); return; }
    const run = started.json();
    const actions = autoplay(content, run.seed, (__VU * 7919 + __ITER) >>> 0);
    sleep(30 + Math.random() * 30); // playing the scenario in the browser makes no request
    const done = http.post(`${BASE}/runs/${run.runId}/complete`, JSON.stringify({ actions, rating: 4 }),
      { headers, tags: { name: 'POST /runs/:id/complete' } });
    check(done, { 'POST /runs/:id/complete 2xx': (x) => x.status === 201 });
    completeTrend.add(done.timings.duration);
    think();
  }
}
