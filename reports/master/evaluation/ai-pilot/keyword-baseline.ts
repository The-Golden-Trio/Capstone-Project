/**
 * Scores the pilot probe set with the prototype's keyword grader and compares the result
 * with the designed levels. Run from the repository root:
 *
 *   node_modules/.bin/esbuild reports/master/evaluation/ai-pilot/keyword-baseline.ts \
 *     --bundle --platform=node --format=esm --outfile=/tmp/keyword-baseline.mjs && node /tmp/keyword-baseline.mjs
 *
 * Writes results.json next to this file.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { keywordGrader } from '../../../../packages/game-core/src/domain/grading/keywordGrader';

const DIR = 'reports/master/evaluation/ai-pilot';
const RANK: Record<string, number> = { '-1': 0, '0': 1, '+2': 2 };

interface Row {
  activity: string;
  response: string;
  cls: string;
  criterion: string;
  designed: string;
  keyword: string;
  chars: number;
}

/** Quadratic weighted kappa on ranks 0..k-1. */
function qwk(a: number[], b: number[], k = 3): number {
  const n = a.length;
  const obs = Array.from({ length: k }, () => Array(k).fill(0));
  a.forEach((x, i) => obs[x][b[i]]++);
  const ra = Array(k).fill(0);
  const rb = Array(k).fill(0);
  a.forEach((x) => ra[x]++);
  b.forEach((x) => rb[x]++);
  let num = 0;
  let den = 0;
  for (let i = 0; i < k; i++)
    for (let j = 0; j < k; j++) {
      const w = ((i - j) * (i - j)) / ((k - 1) * (k - 1));
      num += w * obs[i][j];
      den += (w * ra[i] * rb[j]) / n;
    }
  return 1 - num / den;
}

const data = JSON.parse(readFileSync(join(DIR, 'probes.json'), 'utf-8'));
const rows: Row[] = [];
for (const act of data.activities) {
  for (const r of act.responses) {
    const text = r.text.replace('{padding}', data.padding);
    act.criteria.forEach((criterion: string, i: number) => {
      rows.push({
        activity: act.id,
        response: r.id,
        cls: r.class,
        criterion,
        designed: r.levels[i],
        keyword: keywordGrader.grade({
          text,
          scenarioKey: act.scenarioKey,
          activityId: act.activityId,
          skill: criterion,
        }),
        chars: text.length,
      });
    });
  }
}

const summarise = (subset: Row[]) => ({
  n: subset.length,
  exact: subset.filter((r) => r.designed === r.keyword).length,
  over: subset.filter((r) => RANK[r.keyword] > RANK[r.designed]).length,
  under: subset.filter((r) => RANK[r.keyword] < RANK[r.designed]).length,
});

const byClass: Record<string, ReturnType<typeof summarise>> = {};
for (const cls of [...new Set(rows.map((r) => r.cls))])
  byClass[cls] = summarise(rows.filter((r) => r.cls === cls));

const confusion: Record<string, Record<string, number>> = {};
for (const d of ['+2', '0', '-1']) {
  confusion[d] = { '+2': 0, '0': 0, '-1': 0 };
  rows
    .filter((r) => r.designed === d)
    .forEach((r) => confusion[d][r.keyword]++);
}

const out = {
  responses: data.activities.reduce(
    (s: number, a: { responses: unknown[] }) => s + a.responses.length,
    0,
  ),
  judgments: rows.length,
  overall: summarise(rows),
  qwk: qwk(
    rows.map((r) => RANK[r.designed]),
    rows.map((r) => RANK[r.keyword]),
  ),
  byClass,
  confusion,
  rows,
};
writeFileSync(join(DIR, 'results.json'), JSON.stringify(out, null, 2) + '\n');
console.log(JSON.stringify({ ...out, rows: undefined }, null, 2));
for (const r of rows.filter((x) => x.designed !== x.keyword))
  console.log(
    `${r.activity} ${r.response} [${r.criterion}] designed ${r.designed} keyword ${r.keyword}`,
  );
