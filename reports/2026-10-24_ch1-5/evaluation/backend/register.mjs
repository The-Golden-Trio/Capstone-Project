const base = 'http://localhost:3000/api';
const N = Number(process.env.N || 500), FROM = Number(process.env.FROM || 0), P = 8;
let next = FROM, made = 0, failed = 0;
async function worker() {
  while (next < FROM + N) {
    const i = next++;
    const r = await fetch(base + '/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: `eval${String(i).padStart(3, '0')}`, email: `eval${i}@example.test`, password: 'evaluation-pass-1', displayName: `Eval ${i}`, dateOfBirth: '2004-01-01' }) });
    r.ok ? made++ : failed++;
  }
}
const t = Date.now();
await Promise.all(Array.from({ length: P }, worker));
console.log({ made, failed, seconds: (Date.now() - t) / 1000 });
