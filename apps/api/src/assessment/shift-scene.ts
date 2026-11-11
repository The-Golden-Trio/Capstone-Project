/**
 * Nối engine ca làm với AI-4 theo nhịp (D-130, `NarratorService.narrateScene`).
 *
 * Engine ca làm đã làm hết phần chọn lọc của Luật dẫn truyện C2 (dữ kiện slot
 * biết, khúc mắc còn giấu, niềm tin đã bỏ, hook nào); ở đây chỉ chép kết quả
 * sang `SceneTurn`. Thẻ nhân vật dựng thẳng từ hồ sơ slot của seed, vì seed
 * mẫu điền người cố định ("anh An", "chị Linh"); ghép lá tarot vào slot (C1,
 * Hồ sơ NPC) để sau.
 */
import { Injectable } from '@nestjs/common';
import {
  PLAYER_SPEAKER,
  shift,
  type SceneLine,
  type SceneTurn,
  type WorkCard,
} from '@datn/game-core';
import { NarratorService } from '../ai/narrator/narrator.service';
import type {
  AiCallOptions,
  AiOutcome,
  ShiftNarrator,
} from '../ai/shift/types';

const PLACE: Record<shift.Channel, string> = {
  chat: 'chat nội bộ',
  call: 'cuộc gọi điện thoại',
  meet: 'gặp trực tiếp',
  group: 'kênh nhắn chung',
};

const bullet = (items: readonly string[]) =>
  items.map((t) => `- ${t}`).join('\n');

/** Thẻ của một slot (khuôn gần mục 6.1 Hồ sơ NPC, phần vai trong màn). */
export function shiftCard(
  req: shift.NarrateRequest,
  slot: shift.CastSlot,
  isLead: boolean,
): WorkCard {
  const lines = [
    `${slot.slot}: ${slot.name}, ${slot.relation}. Giọng: ${slot.voice}.`,
    `Muốn trong màn: ${slot.want}. Áp lực: ${slot.pressure}. Thái độ với người chơi: ${slot.stance}.`,
    `Hiểu biết nghề: ${slot.expertise}/3. Cách nói ra điều mình biết: ${slot.disclosure_style}.`,
  ];
  if (isLead) {
    const p = req.profile;
    if (p.concerns.length)
      lines.push(`Khúc mắc còn lại:\n${bullet(p.concerns)}`);
    if (p.beliefs.length)
      lines.push(`Điều nhân vật đang tin (có thể sai):\n${bullet(p.beliefs)}`);
    if (req.knownFacts.length)
      lines.push(
        `Điều nhân vật biết:\n${bullet(req.knownFacts.map((f) => f.text))}`,
      );
    if (req.mayReveal.length)
      lines.push(
        `Được nói ra ở lượt này nếu người chơi hỏi đúng chuyện (không hỏi thì đừng nói):\n${bullet(req.mayReveal.map((f) => f.text))}`,
      );
    if (req.confirmOnly.length)
      lines.push(
        `Chỉ xác nhận khi người chơi tự nói ra, không tự nêu:\n${bullet(req.confirmOnly.map((f) => f.text))}`,
      );
    if (req.guidance)
      lines.push(`Việc của nhân vật ở lượt này: ${req.guidance}`);
  }
  const text = lines.join('\n');
  return { slot: slot.slot, text, personWords: text.split(/\s+/).length };
}

/** Chữ AI-4 không được nói ra (R3): câu kiểm của seed, dữ kiện người nói không biết. */
export function hiddenTexts(
  req: shift.NarrateRequest,
  ctx: shift.ShiftContext,
): string[] {
  const { seed } = ctx;
  const known = new Set([
    ...req.knownFacts.map((f) => f.id),
    ...req.mayReveal.map((f) => f.id),
    ...req.confirmOnly.map((f) => f.id),
  ]);
  return [
    ...seed.conversation_checks.map((c) => c.q),
    ...seed.artefacts.flatMap((a) => a.checks.map((c) => c.q)),
    ...seed.nodes.flatMap((n) => n.node_checks.map((c) => c.q)),
    ...seed.facts.filter((f) => !known.has(f.id)).map((f) => f.text),
  ];
}

export function toSceneTurn(
  req: shift.NarrateRequest,
  ctx: shift.ShiftContext,
): SceneTurn {
  const { seed, pack } = ctx;
  const present = [...new Set([req.slot, ...req.present])];
  const cards = present.flatMap((id) => {
    const slot = seed.cast.find((c) => c.slot === id);
    return slot ? [shiftCard(req, slot, id === req.slot)] : [];
  });
  const recent: SceneLine[] = req.recent.map((l) => ({
    speaker: l.speaker === 'player' ? PLAYER_SPEAKER : l.speaker,
    text: l.text,
  }));
  return {
    task: req.task,
    lead: req.slot,
    stage: {
      title: seed.title,
      situation: seed.situation,
      goal: seed.goal,
      stakes: seed.stakes,
      limits: [
        ...req.limits.need_approval.map((a) => `Cần duyệt: ${a}`),
        ...req.limits.not_allowed.map((a) => `Không được: ${a}`),
      ].join('\n'),
    },
    company: `${pack.company.name}. ${pack.company.profile}`,
    cards,
    scene: {
      time: req.scene.time,
      place: PLACE[req.channel],
      channel: req.channel,
    },
    storyFlags: req.flags,
    recent,
    playerLine: req.playerText,
    ambient: req.ambient ? [req.ambient] : undefined,
    hook: req.hook,
    maxBeats: req.maxBeats,
    hidden: hiddenTexts(req, ctx),
  };
}

/** Cổng `ShiftNarrator` bản thật: AI-4 theo nhịp của `NarratorService`. */
@Injectable()
export class ShiftSceneNarrator implements ShiftNarrator {
  constructor(private readonly narrator: NarratorService) {}

  async narrate(
    req: shift.NarrateRequest,
    opts: AiCallOptions & {
      ctx?: shift.ShiftContext;
      contentVersion?: number;
    } = {},
  ): Promise<AiOutcome<shift.Beat[]>> {
    if (!opts.ctx) throw new Error('ShiftSceneNarrator cần ngữ cảnh seed');
    const result = await this.narrator.narrateScene({
      turn: toSceneTurn(req, opts.ctx),
      contentVersion: opts.contentVersion,
      identity: opts.identity,
      budgetUsd: opts.budgetUsd,
    });
    const accepted = [...result.records]
      .reverse()
      .find((r) => r.outcome === 'accepted');
    const provenance: shift.Provenance = {
      adapter: 'live',
      ...(accepted
        ? {
            model: accepted.modelKey,
            promptVersion: accepted.promptVersion,
            latencyMs: accepted.latencyMs ?? undefined,
          }
        : {}),
      costUsd: result.cost.usd,
    };
    if (result.status === 'ok')
      return {
        status: 'ok',
        value: result.beats.map((b) => ({
          speaker: b.speaker,
          text: b.text,
          expression: b.expression as shift.Expression,
        })),
        provenance,
      };
    return {
      status: 'unavailable',
      reason: result.status === 'blocked' ? 'blocked' : result.reason,
      provenance,
    };
  }
}
