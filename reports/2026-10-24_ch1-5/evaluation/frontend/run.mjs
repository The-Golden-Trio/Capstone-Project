// Lighthouse audit of the production web build: 8 pages x {mobile, desktop} x 5 runs,
// median run per page and profile (Lighthouse's computeMedianRun). Authenticated pages
// use a fresh access cookie per page, sent as an extra header.
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { computeMedianRun } from 'lighthouse/core/lib/median-run.js';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = process.argv[2];
const RUNS = Number(process.argv[3] || 5);
const WEB = 'http://localhost:4300';
const API = 'http://localhost:3000/api';
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['Landing', '/', false],
  ['Sign-in', '/login', false],
  ['Orientation quiz', '/quiz', 'eval497'],
  ['Occupation map (3D)', '/jobs', true],
  ['Occupation levels', '/jobs/SWE_BACKEND', true],
  ['Level map', '/jobs/SWE_BACKEND/L1', true],
  ['Scenario play', '/play/SWE_BACKEND_L1_S_EXEC', true],
  ['Profile', '/profile', true],
];

// eval499 has taken the orientation quiz, so the gate lets it in everywhere; the quiz page itself
// is audited with eval497, which has not, since the gate sends a finished explorer onwards.
async function cookie(account) {
  const user = typeof account === 'string' ? account : 'eval499';
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ identifier: user, password: 'evaluation-pass-1' }),
  });
  const c = r.headers
    .getSetCookie()
    .map((x) => x.split(';')[0])
    .join('; ');
  if (user === 'eval499')
    await fetch(`${API}/profile/quiz`, {
      method: 'POST',
      headers: { cookie: c, 'content-type': 'application/json' },
      body: '{"answers":[]}',
    });
  return c;
}

// A fresh Chrome, with a fresh profile, for every run: state left by one page cannot leak into
// the next, and every run starts with a cold cache, as a first visit does.
const launch = () =>
  chromeLauncher.launch({
    chromePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    chromeFlags: [
      '--headless=new',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--no-first-run',
    ],
  });
const summary = [];
// ONLY=/a,/b limits the run to those paths (to resume after a failure).
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
try {
  for (const [label, path, authed] of PAGES) {
    if (ONLY && !ONLY.includes(path)) continue;
    for (const profile of ['mobile', 'desktop']) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        const extraHeaders = authed
          ? { Cookie: await cookie(authed) }
          : undefined;
        const flags = {
          output: 'json',
          logLevel: 'error',
          extraHeaders,
          onlyCategories: [
            'performance',
            'accessibility',
            'best-practices',
            'seo',
          ],
        };
        const chrome = await launch();
        try {
          flags.port = chrome.port;
          const res = await lighthouse(
            WEB + path,
            flags,
            profile === 'desktop' ? desktopConfig : undefined,
          );
          if (
            new URL(res.lhr.finalDisplayedUrl).pathname !==
            new URL(WEB + path).pathname
          )
            throw new Error(`${path} ended at ${res.lhr.finalDisplayedUrl}`);
          runs.push(res.lhr);
        } finally {
          await chrome.kill();
        }
      }
      const m = computeMedianRun(runs);
      const a = m.audits;
      const failedA11y = Object.values(a)
        .filter(
          (x) =>
            m.categories.accessibility.auditRefs.some(
              (r) => r.id === x.id && r.weight > 0,
            ) && x.score === 0,
        )
        .map((x) => x.id);
      const row = {
        page: label,
        path,
        profile,
        finalUrl: m.finalDisplayedUrl,
        performance: Math.round(m.categories.performance.score * 100),
        accessibility: Math.round(m.categories.accessibility.score * 100),
        bestPractices: Math.round(m.categories['best-practices'].score * 100),
        seo: Math.round(m.categories.seo.score * 100),
        perfRange: [
          Math.min(...runs.map((r) => r.categories.performance.score * 100)),
          Math.max(...runs.map((r) => r.categories.performance.score * 100)),
        ].map(Math.round),
        fcp_ms: Math.round(a['first-contentful-paint'].numericValue),
        lcp_ms: Math.round(a['largest-contentful-paint'].numericValue),
        tbt_ms: Math.round(a['total-blocking-time'].numericValue),
        cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
        si_ms: Math.round(a['speed-index'].numericValue),
        transfer_kb: Math.round(a['total-byte-weight'].numericValue / 1024),
        failedA11y,
      };
      summary.push(row);
      writeFileSync(
        `${OUT}/${path.replace(/\W+/g, '_') || 'root'}_${profile}.json`,
        JSON.stringify(m),
      );
      console.log(JSON.stringify(row));
    }
  }
} finally {
  writeFileSync(
    `${OUT}/summary${ONLY ? '-part' : ''}.json`,
    JSON.stringify(summary, null, 2),
  );
}
