/**
 * Lint seed: các luật máy kiểm được trong A1–A13. Trả danh sách lỗi; rỗng là
 * sạch. Phần ý nghĩa (lời có đúng vai không, có lộ đáp án không) vẫn cần
 * người duyệt bằng mắt.
 */
import { flagsOf, resolvedFlag } from './flags.js';
import type { LevelPack, ShiftSeed } from './schema.js';
import { pointAt, toMinutes } from './time.js';

export function lintSeed(seed: ShiftSeed, pack: LevelPack): string[] {
  const issues: string[] = [];
  const slots = new Set(seed.cast.map((c) => c.slot));
  const nodes = new Map(seed.nodes.map((n, i) => [n.id, i]));
  const artefacts = new Set(seed.artefacts.map((a) => a.id));
  const facts = new Set(seed.facts.map((f) => f.id));
  const point = (t: string) =>
    pointAt(t, seed.clock.start, pack.minutes_per_point);

  // A1: ngân sách khớp đồng hồ.
  const span =
    (toMinutes(seed.clock.deadline) - toMinutes(seed.clock.start)) /
    pack.minutes_per_point;
  if (span !== seed.clock.budget)
    issues.push(
      `clock: ngân sách ${seed.clock.budget} khác (hạn chót − bắt đầu) ÷ phút mỗi điểm = ${span}`,
    );

  // A1: ngân sách đủ cho đường ngắn nhất qua mọi nút cộng 30% dư.
  const shortest = seed.nodes.reduce((sum, n) => sum + n.points, 0);
  if (seed.clock.budget < Math.ceil(shortest * 1.3))
    issues.push(
      `clock: ngân sách ${seed.clock.budget} không đủ cho đường ngắn nhất ${shortest} + 30%`,
    );

  // Cờ: mọi cờ được nhắc tới phải được khai hoặc có nguồn bật.
  const defined = new Set<string>([...seed.story_flags, 'tre_hen']);
  for (const c of seed.conversation_checks) defined.add(c.flag);
  for (const a of seed.artefacts) {
    for (const c of a.checks) defined.add(c.flag);
    for (const f of Object.values(a.tick_flags)) defined.add(f);
  }
  for (const n of seed.nodes) {
    for (const c of n.node_checks) defined.add(c.flag);
    for (const o of n.options) o.sets.forEach((f) => defined.add(f));
    n.timeout?.sets.forEach((f) => defined.add(f));
  }
  for (const a of seed.actions) a.sets.forEach((f) => defined.add(f));
  for (const c of seed.cast)
    for (const k of c.concerns) defined.add(resolvedFlag(k.id));

  const referenced: Array<[string, string]> = [];
  const ref = (where: string, list: string[]) =>
    list.forEach((f) => referenced.push([where, f]));
  for (const c of seed.cast) {
    for (const k of c.concerns)
      ref(`cast.${c.slot}.${k.id}`, flagsOf(k.resolve_when ?? undefined));
    for (const b of c.beliefs) ref(`cast.${c.slot}.belief`, [b.drop_when]);
  }
  for (const n of seed.nodes) {
    n.adapt.forEach((a, i) => ref(`${n.id}.adapt[${i}]`, flagsOf(a.if)));
    n.probe?.hooks.forEach((h, i) =>
      ref(`${n.id}.probe[${i}]`, [
        ...flagsOf(h.if),
        ...(h.answered_if ? [h.answered_if] : []),
      ]),
    );
  }
  for (const a of seed.artefacts)
    a.branches?.forEach((b, i) => ref(`${a.id}.branch[${i}]`, flagsOf(b.if)));
  for (const a of seed.actions)
    if (a.requires) ref(`action.${a.key}`, flagsOf(a.requires));
  for (const r of seed.review) ref(`review.${r.id}`, flagsOf(r.if));
  for (const [where, flag] of referenced)
    if (!defined.has(flag))
      issues.push(`${where}: cờ "${flag}" không có nguồn bật`);

  // A11: mỗi nhóm adapt (theo cách bật) có một mặc định với điều kiện rỗng.
  for (const n of seed.nodes) {
    const groups = new Set(n.adapt.map((a) => a.when));
    for (const when of groups) {
      const group = n.adapt.filter((a) => a.when === when);
      if (!group.some((a) => flagsOf(a.if).length === 0))
        issues.push(`${n.id}: adapt (${when}) thiếu mặc định`);
    }
  }

  // A2: nút mở tối đa 3 nhịp trước lượt người chơi.
  for (const n of seed.nodes.filter((x) => x.kind === 'open'))
    for (const a of n.adapt)
      if (a.beats.length > 3)
        issues.push(`${n.id}: nút mở có ${a.beats.length} nhịp (tối đa 3)`);

  // Slot, nút, tài liệu, dữ kiện được trỏ tới phải tồn tại.
  for (const n of seed.nodes) {
    if (!slots.has(n.speaker))
      issues.push(`${n.id}: speaker ${n.speaker} không có trong cast`);
    if (n.probe && !slots.has(n.probe.by))
      issues.push(`${n.id}: probe.by ${n.probe.by} không có trong cast`);
    if (n.artefact && !artefacts.has(n.artefact))
      issues.push(`${n.id}: tài liệu ${n.artefact} không có`);
    for (const t of [n.trigger.at, n.trigger.fallback_at])
      if (t && (point(t) < 0 || point(t) > seed.clock.budget))
        issues.push(`${n.id}: mốc ${t} nằm ngoài ngân sách`);
    if (['timed_choice', 'choice'].includes(n.format) && n.options.length < 2)
      issues.push(`${n.id}: nút chọn cần ít nhất 2 phương án`);
    if (n.format === 'timed_choice' && !n.timeout)
      issues.push(`${n.id}: nút đếm giờ thiếu cách xử lý hết giờ`);
  }
  if (seed.nodes.filter((n) => n.format === 'timed_choice').length > 1)
    issues.push('Màn có nhiều hơn 1 nút đếm giờ');
  if (seed.nodes[seed.nodes.length - 1].kind !== 'end')
    issues.push('Nút cuối phải là nút kết');

  for (const f of seed.facts) {
    for (const k of f.known_by)
      if (!slots.has(k))
        issues.push(`${f.id}: known_by ${k} không có trong cast`);
    if (f.reserved_for && !nodes.has(f.reserved_for))
      issues.push(`${f.id}: reserved_for ${f.reserved_for} không có`);
    if (
      f.visibility === 'on_ask' &&
      f.unlock?.by === 'ask' &&
      f.values.length === 0
    )
      issues.push(
        `${f.id}: dữ kiện mở bằng lời cần values để nhận ra lúc NPC nói`,
      );
  }
  for (const a of seed.artefacts)
    for (const u of a.unlocks)
      if (!facts.has(u)) issues.push(`${a.id}: mở dữ kiện ${u} không có`);
  for (const a of seed.actions) {
    if (
      ['open', 'write', 'rewrite', 'run', 'message'].includes(a.kind) &&
      !artefacts.has(a.target ?? '')
    )
      issues.push(`action.${a.key}: tài liệu ${a.target} không có`);
    if (a.kind === 'talk' && !slots.has(a.target ?? ''))
      issues.push(`action.${a.key}: slot ${a.target} không có`);
    if (a.kind === 'trigger' && !nodes.has(a.target ?? ''))
      issues.push(`action.${a.key}: nút ${a.target} không có`);
  }

  // A2: quy định phải được nói ra trước nút dùng nó.
  const toldOk = (t: string) =>
    nodes.has(t) || t === 'onboard' || t === 'player_role';
  for (const r of pack.rules)
    if (!toldOk(r.told_at))
      issues.push(`rule ${r.id}: told_at ${r.told_at} không rõ`);
  for (const l of [...seed.limits.need_approval, ...seed.limits.not_allowed])
    if (!toldOk(l.told_at))
      issues.push(`limits "${l.action}": told_at ${l.told_at} không rõ`);

  // A13: NPC chính có mặt ở nút kết giữ ít nhất một khúc mắc tới nút kết.
  const end = seed.nodes.find((n) => n.kind === 'end');
  if (end) {
    const main = seed.cast.find((c) => c.slot === end.speaker);
    if (main && !main.concerns.some((k) => k.hold_until === end.id))
      issues.push(
        `${main.slot}: NPC ở nút kết phải giữ một khúc mắc hold_until ${end.id}`,
      );
  }
  return issues;
}
