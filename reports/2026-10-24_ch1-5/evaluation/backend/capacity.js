// Light-request ceiling of one API process (Section 5.3 assumption: about 300 light
// requests per second per single-vCPU replica). Open model: requests arrive at a fixed
// rate whatever the response time, in steps of 45 s; each step is its own scenario so
// results can be read per offered rate.
import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE || 'http://localhost:3000/api';
const RATES = (__ENV.RATES || '100,200,300,400,600,800,1000').split(',').map(Number);
const STEP = 45;
const USERS = 200;

const scenarios = {};
RATES.forEach((rate, i) => {
  scenarios[`r${String(rate).padStart(4, '0')}`] = {
    executor: 'constant-arrival-rate',
    rate,
    timeUnit: '1s',
    duration: `${STEP}s`,
    startTime: `${i * (STEP + 5)}s`,
    preAllocatedVUs: 200,
    maxVUs: 2000,
  };
});

export const options = {
  setupTimeout: '5m',
  scenarios,
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function setup() {
  const sessions = [];
  for (let start = 0; start < USERS; start += 20) {
    const reqs = [];
    for (let i = start; i < start + 20; i++) {
      reqs.push(['POST', `${BASE}/auth/login`,
        JSON.stringify({ identifier: `eval${String(i).padStart(3, '0')}`, password: 'evaluation-pass-1' }),
        { headers: { 'content-type': 'application/json' }, tags: { name: 'setup' } }]);
    }
    for (const r of http.batch(reqs)) sessions.push(`access_token=${r.cookies.access_token[0].value}`);
  }
  return { sessions };
}

const PATHS = [
  ['/auth/me', 'GET /auth/me'],
  ['/profile', 'GET /profile'],
  ['/profile/progress', 'GET /profile/progress'],
  ['/profile/roles/SWE_BACKEND', 'GET /profile/roles/:role'],
  ['/profile/runs', 'GET /profile/runs'],
];

export default function (data) {
  const [path, name] = PATHS[Math.floor(Math.random() * PATHS.length)];
  const cookie = data.sessions[Math.floor(Math.random() * data.sessions.length)];
  const r = http.get(`${BASE}${path}`, { headers: { cookie }, tags: { name }, timeout: '10s' });
  check(r, { '2xx': (x) => x.status >= 200 && x.status < 300 });
}
