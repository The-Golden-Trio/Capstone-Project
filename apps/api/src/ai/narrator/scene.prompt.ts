/**
 * Ghép message cho một lượt AI-4 theo nhịp (D-130).
 *
 * Cùng nguyên tắc với contract cũ: phần giống nhau đặt trước, phần riêng của
 * lượt đặt sau, vì prompt cache khớp theo phần đầu.
 *
 *   [system]  luật cho AI-4                    ← giống nhau mọi màn, mọi người chơi
 *   [user]    màn, hồ sơ công ty, thẻ nhân vật
 *             ─── điểm cache ───               ← giống nhau suốt một cảnh
 *             cảnh, cờ truyện, 8 lượt gần nhất,
 *             ambient, việc lượt này, câu người chơi
 *
 * Thẻ giữ đúng thứ tự engine đưa, kể cả khi người được giao đổi: đẩy người
 * được giao lên đầu thì phần đầu đổi, cache trượt. Người được giao ghi ở mục
 * "Lượt này".
 */
import {
  BEATS_MAX,
  PLAYER_SPEAKER,
  recentLines,
  type SceneLine,
  type SceneTurn,
} from '@datn/game-core';
import type { ChatMessage } from '../gateway/gateway.types';
import { asPlayerData } from './narrator.prompt';
import { SCENE_SYSTEM_PROMPT } from './prompts/narrator.v3';

const section = (
  title: string,
  lines: ReadonlyArray<string | undefined | false>,
): string[] => {
  const kept = lines.filter(
    (l): l is string => typeof l === 'string' && l.length > 0,
  );
  return kept.length > 0 ? [`# ${title}`, ...kept, ''] : [];
};

const sceneLine = (line: SceneLine): string =>
  line.speaker === PLAYER_SPEAKER
    ? `[người chơi]\n${asPlayerData(line.text)}`
    : `[${line.speaker}] ${line.text}`;

/** Phần cố định trong một cảnh: màn, công ty, thẻ. */
export function sceneStaticText(turn: SceneTurn): string {
  const { stage } = turn;
  return [
    ...section('MÀN', [
      stage.title && `Tên màn: ${stage.title}`,
      stage.situation && `Tình huống: ${stage.situation}`,
      stage.goal && `Mục tiêu của người chơi: ${stage.goal}`,
      stage.stakes &&
        `Hậu quả nếu hỏng (chỉ nói khi hợp, đúng người): ${stage.stakes}`,
      stage.limits && `Giới hạn của màn: ${stage.limits}`,
    ]),
    ...section('HỒ SƠ CÔNG TY', [turn.company]),
    '# THẺ NHÂN VẬT CÓ MẶT',
    turn.cards.map((c) => c.text).join('\n\n'),
  ].join('\n');
}

/** Phần riêng của lượt này. */
export function sceneTurnText(turn: SceneTurn): string {
  const present = ['người chơi', ...turn.cards.map((c) => c.slot)].join(', ');
  const recent = recentLines(turn);
  const asks = turn.task === 'probe' || turn.questionAllowed !== false;
  return [
    '',
    '',
    ...section('CẢNH HIỆN TẠI', [
      `Giờ: ${turn.scene.time}. Nơi: ${turn.scene.place}.${turn.scene.channel ? ` Kênh: ${turn.scene.channel}.` : ''} Có mặt: ${present}.`,
    ]),
    ...section('CỜ TRUYỆN ĐÃ BẬT', [
      turn.storyFlags.length > 0 ? turn.storyFlags.join(', ') : 'chưa có',
    ]),
    ...section(`DIỄN BIẾN GẦN NHẤT (tối đa 8 lượt, cũ trước mới sau)`, [
      recent.length > 0 ? recent.map(sceneLine).join('\n') : '(chưa có)',
    ]),
    ...section(
      'AMBIENT ĐƯỢC GIAO (chỉ được chèn đúng những câu này)',
      (turn.ambient ?? []).map((a) => `- ${a}`),
    ),
    ...section('LƯỢT NÀY', [
      `Task: ${turn.task}`,
      `Nhân vật được giao: ${turn.lead}`,
      `Được hỏi: ${asks ? 'có' : 'không (mọi nhịp là câu kể, kết bằng dấu chấm)'}`,
      `Tối đa: ${turn.maxBeats ?? BEATS_MAX} nhịp`,
      turn.hook && `Hook: ${turn.hook}`,
      turn.choice && `Phương án người chơi chọn: ${turn.choice}`,
      turn.seedReaction &&
        turn.seedReaction.length > 0 &&
        `Lời soạn sẵn:\n${turn.seedReaction.map((l) => `[${l.speaker}]${l.expression ? ` (${l.expression})` : ''} ${l.text}`).join('\n')}`,
      turn.bridgeTo && `Sắp tới: ${turn.bridgeTo}`,
      turn.playerLine !== undefined &&
        `Câu người chơi vừa viết:\n${asPlayerData(turn.playerLine)}`,
    ]),
    'Trả về đúng một đối tượng json.',
  ].join('\n');
}

export function buildSceneMessages(turn: SceneTurn): ChatMessage[] {
  return [
    { role: 'system', parts: [{ text: SCENE_SYSTEM_PROMPT }] },
    {
      role: 'user',
      parts: [
        { text: sceneStaticText(turn), cacheBreakpoint: true },
        { text: sceneTurnText(turn) },
      ],
    },
  ];
}
