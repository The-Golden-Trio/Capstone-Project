/**
 * `ai-lab --mode=check`: mỗi model trong chuỗi dẫn truyện và mỗi ghế judge
 * được gọi đúng một lượt nhỏ, rồi in bảng sẵn sàng / không sẵn sàng kèm lý do.
 *
 * Thiếu key thì báo rõ model nào bị loại và vì sao, không gọi, không ném lỗi.
 * Lượt gọi dùng đúng prompt, khuôn JSON và luật kiểm của service thật, nên
 * "sẵn sàng" nghĩa là service thật sẽ chạy được với cấu hình này.
 */
import {
  beatsJsonSchema,
  checkBeats,
  sceneTurnTexts,
  shift,
} from '@datn/game-core';
import { fixtureShiftContext } from '@datn/game-core/testing';
import { explainGatewayError, keyWarnings } from '../../ai/gateway/diagnose';
import { GatewayError, type ModelSpec } from '../../ai/gateway/gateway.types';
import { ModelGateway } from '../../ai/gateway/model-gateway';
import { gatewayKeys, type AiSettings } from '../../ai/gateway/models';
import { checkChecklistOutput } from '../../ai/judge/checklist.output';
import {
  buildChecklistMessages,
  checklistJsonSchema,
} from '../../ai/judge/checklist.prompt';
import { JUDGE_PROFILE } from '../../ai/judge/judge.profile';
import { NARRATOR_PROFILE } from '../../ai/narrator/narrator.profile';
import { buildSceneMessages } from '../../ai/narrator/scene.prompt';
import {
  CHECKER_JSON_SCHEMA,
  buildCheckerMessages,
} from '../../ai/shift/checker.service';
import { sampleScene } from '../../ai/testing/sample-scene';
import { liveSetup } from './ports';
import { rule } from './report';

/** Rộng hơn nhiều so với lúc chơi: model chậm thì báo chậm, không báo hỏng. */
const CHECK_TIMEOUT_MS = 30_000;

type Verdict = 'sẵn sàng' | 'có cảnh báo' | 'không sẵn sàng';

export interface CheckRow {
  service: string;
  item: string;
  verdict: Verdict;
  ms: number | null;
  note: string;
}

const row = (
  service: string,
  item: string,
  verdict: Verdict,
  note: string,
  ms: number | null = null,
): CheckRow => ({ service, item, verdict, ms, note });

function failure(service: string, spec: ModelSpec, err: unknown): CheckRow {
  const error =
    err instanceof GatewayError
      ? err
      : new GatewayError('network', String(err), spec.provider);
  return row(
    service,
    spec.key,
    'không sẵn sàng',
    `${error.kind}: ${error.message} → ${explainGatewayError(error)}`,
  );
}

async function checkNarrator(
  gateway: ModelGateway,
  spec: ModelSpec,
): Promise<CheckRow> {
  const turn = sampleScene('n0');
  const speakers = turn.cards.map((c) => c.slot);
  const maxBeats = turn.maxBeats ?? 5;
  try {
    const result = await gateway.complete({
      model: spec,
      messages: buildSceneMessages(turn),
      temperature: NARRATOR_PROFILE.temperature[spec.provider],
      maxOutputTokens: NARRATOR_PROFILE.maxOutputTokens[spec.provider],
      json: {
        name: 'narration_beats',
        schema: beatsJsonSchema(speakers, maxBeats),
      },
      timeoutMs: CHECK_TIMEOUT_MS,
    });
    const notes: string[] = [];
    if (result.usage.reasoning > 0)
      notes.push(
        'vẫn sinh token suy nghĩ, tham số tắt thinking không có tác dụng',
      );
    if (result.latencyMs > NARRATOR_PROFILE.attemptTimeoutMs)
      notes.push(
        `chậm hơn ${NARRATOR_PROFILE.attemptTimeoutMs} ms của lúc chơi, lượt thật sẽ hết giờ`,
      );
    const { output, violations } = checkBeats(result.text, {
      task: turn.task,
      lead: turn.lead,
      speakers,
      questionAllowed: turn.questionAllowed !== false,
      maxBeats,
      visibleTexts: sceneTurnTexts(turn),
      hiddenTexts: turn.hidden,
      finishReason: result.finishReason,
    });
    if (!output)
      return row(
        'dẫn truyện (AI-4)',
        spec.key,
        'không sẵn sàng',
        `gọi được nhưng không đọc được kết quả: ${violations.map((v) => v.detail).join('; ')}`,
        result.latencyMs,
      );
    if (violations.length > 0)
      notes.push(
        `chưa qua luật, lúc chơi sẽ viết lại: ${violations.map((v) => `${v.rule} ${v.detail}`).join('; ')}`,
      );
    return row(
      'dẫn truyện (AI-4)',
      spec.key,
      notes.length > 0 ? 'có cảnh báo' : 'sẵn sàng',
      notes.length > 0
        ? notes.join('; ')
        : `qua R1–R4, vào ${result.usage.input} ra ${result.usage.output} token`,
      result.latencyMs,
    );
  } catch (err) {
    return failure('dẫn truyện (AI-4)', spec, err);
  }
}

export async function checkJudge(
  gateway: ModelGateway,
  slot: number,
  spec: ModelSpec,
): Promise<CheckRow> {
  const service = `ghế judge ${slot} (AI-5)`;
  const scope = 'Em tìm ra lỗi rồi anh, đang sửa.';
  try {
    const result = await gateway.complete({
      model: spec,
      messages: buildCheckerMessages(
        {
          requestId: 'check',
          source: 'check',
          scope,
          questions: [
            {
              flag: 'bao_da_tim_ra_loi',
              q: 'Người chơi có nói là đã tìm ra lỗi không?',
            },
          ],
        },
        scope,
      ),
      temperature: 0,
      maxOutputTokens: 800,
      json: { name: 'checks', schema: CHECKER_JSON_SCHEMA },
      timeoutMs: CHECK_TIMEOUT_MS,
    });
    let parsed: unknown;
    try {
      parsed = JSON.parse(result.text);
    } catch {
      return row(
        service,
        spec.key,
        'có cảnh báo',
        'gọi được nhưng trả không phải JSON; bộ phán sẽ hỏi lại một lần rồi sang model kế',
        result.latencyMs,
      );
    }
    const ok =
      typeof parsed === 'object' &&
      parsed !== null &&
      Array.isArray((parsed as { answers?: unknown }).answers);
    return row(
      service,
      spec.key,
      ok ? 'sẵn sàng' : 'có cảnh báo',
      ok
        ? `đúng khuôn, vào ${result.usage.input} ra ${result.usage.output} token`
        : 'gọi được nhưng thiếu trường answers',
      result.latencyMs,
    );
  } catch (err) {
    return failure(service, spec, err);
  }
}

const CHECKLIST_SEED = 'SWE_BACKEND.L3.m2';
/** Nhỏ vì chỉ một mục con; 4 000 của lúc chấm thật là cho cả ca. */
const CHECKLIST_CHECK_MAX_TOKENS = 1_000;

/**
 * Một đoạn bằng chứng nhỏ dựng từ seed L3.m2: mục con đầu của `observes`, hai
 * lượt nói của người chơi. Cùng khuôn với đoạn thật nên prompt, khuôn json và
 * luật kiểm là của `judge-v2`.
 */
export function checklistSample(): {
  segments: shift.EvidenceSegment[];
  observes: shift.ObserveItem[];
} {
  const { seed } = fixtureShiftContext(CHECKLIST_SEED);
  const observes = (seed.observes ?? []).slice(0, 1);
  const say = (code: string, time: string, text: string) => ({
    role: 'player' as const,
    turn: { code, kind: 'say' as const, at: 0, time, text },
  });
  return {
    observes,
    segments: [
      {
        id: 'pha',
        label: 'Trong ca',
        kind: 'pha',
        subs: observes.map((o) => o.sub),
        outcome: 'answered',
        entries: [
          say('t1', '10:05', 'Dạ em coi liền anh.'),
          say(
            't2',
            '10:20',
            'Chị ơi em tìm ra lỗi rồi, đang sửa. 11:30 em gọi báo lại chị nha.',
          ),
        ],
        facts: [],
        rulesHeard: [],
        promises: [],
        brief:
          'API lịch sử đơn chạy chậm với khách nhiều đơn; người chơi đang điều tra.',
      },
    ],
  };
}

export async function checkChecklist(
  gateway: ModelGateway,
  slot: number,
  spec: ModelSpec,
): Promise<CheckRow> {
  const service = `ghế judge ${slot} (AI-5 checklist)`;
  const { segments, observes } = checklistSample();
  const pairs = shift.expectedPairs(segments);
  try {
    const result = await gateway.complete({
      model: spec,
      messages: buildChecklistMessages({ segments, observes }),
      temperature: JUDGE_PROFILE.temperature,
      maxOutputTokens: CHECKLIST_CHECK_MAX_TOKENS,
      json: { name: 'checklist', schema: checklistJsonSchema(segments) },
      timeoutMs: CHECK_TIMEOUT_MS,
    });
    const check = checkChecklistOutput(result.text, {
      pairs,
      finishReason: result.finishReason,
    });
    if (!check.ok)
      return row(
        service,
        spec.key,
        'có cảnh báo',
        `gọi được nhưng sai khuôn judge-v2, lúc chấm thật sẽ hỏi lại một lần: ${check.problems.map((p) => `${p.rule} ${p.detail}`).join('; ')}`,
        result.latencyMs,
      );
    const { rejected } = shift.checkOutput(segments, check.output);
    return row(
      service,
      spec.key,
      'sẵn sàng',
      `đúng khuôn, vào ${result.usage.input} ra ${result.usage.output} token, bỏ ${rejected.length} câu trích${rejected.length > 0 ? ` (${rejected.join('; ')})` : ''}`,
      result.latencyMs,
    );
  } catch (err) {
    return failure(service, spec, err);
  }
}

/** Trả `true` khi mọi mục đều dùng được (không có dòng "không sẵn sàng"). */
export async function runCheck(settings: AiSettings): Promise<boolean> {
  rule('Cấu hình');
  for (const w of keyWarnings(settings)) console.log(`⚠ ${w}`);
  const present = [
    ['QWEN_API_KEY', settings.qwen],
    ['OPENROUTER_API_KEY', settings.openrouter],
    ['DEEPSEEK_API_KEY', settings.deepseek],
  ] as const;
  for (const [name, value] of present)
    console.log(`${value ? '✔' : '–'} ${name}: ${value ? 'có' : 'chưa đặt'}`);

  const setup = liveSetup(settings);
  const rows: CheckRow[] = [];
  const gateway = new ModelGateway(gatewayKeys(settings));

  for (const { provider, reason } of setup.excluded)
    rows.push(row('dẫn truyện (AI-4)', provider, 'không sẵn sàng', reason));
  for (const spec of setup.chain) {
    rule(`Gọi thử ${spec.key}`);
    rows.push(await checkNarrator(gateway, spec));
  }

  if (setup.slots.length === 0)
    rows.push(
      row(
        'panel judge (AI-5)',
        '3 ghế',
        'không sẵn sàng',
        setup.problems.join('; ') || 'không có ghế nào',
      ),
    );
  for (const { slot, chain } of setup.slots) {
    rule(`Gọi thử ghế judge ${slot}: ${chain[0].key}`);
    rows.push(await checkJudge(gateway, slot, chain[0]));
    rows.push(await checkChecklist(gateway, slot, chain[0]));
  }

  rule('Kết quả');
  console.table(
    rows.map((r) => ({
      dịch_vụ: r.service,
      mục: r.item,
      kết_quả: r.verdict,
      ms: r.ms ?? '',
      ghi_chú: r.note,
    })),
  );
  const notReady = rows.filter((r) => r.verdict === 'không sẵn sàng');
  console.log(
    notReady.length === 0
      ? '✔ Mọi dịch vụ đã thử đều sẵn sàng.'
      : `✘ ${notReady.length} mục chưa dùng được, xem cột ghi_chú.`,
  );
  return notReady.length === 0;
}
