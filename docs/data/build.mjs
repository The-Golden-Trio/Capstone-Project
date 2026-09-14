// Sinh docs/data/scenarios.js tu cac file scenario JSON.
// Chay:  node docs/data/build.mjs
import fs from 'fs';
const FILES = [
  ['SWE_BACKEND_L1_S_EXEC',     'occupation-data/scenarios/SWE_BACKEND/L1_S_EXEC.json'],
  ['SWE_BACKEND_L3_S_INCIDENT', 'occupation-data/scenario-golden/SWE_BACKEND_L3.json'],
];
let o = `/* SINH TU DONG — dung sua tay. Sinh lai: node docs/data/build.mjs */\n\nwindow.SCENARIO_FILES = {\n`;
for (const [k, p] of FILES) {
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  o += `  /* ${p} */\n  ${JSON.stringify(k)}: ` + JSON.stringify(d, null, 2).replace(/\n/g, '\n  ') + ',\n\n';
}
fs.writeFileSync('docs/data/scenarios.js', o + '};\n');
console.log('docs/data/scenarios.js da duoc sinh lai tu', FILES.length, 'file');
