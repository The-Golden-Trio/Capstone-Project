/**
 * Phần kịch bản mà người dẫn truyện (AI-4) được thấy.
 *
 * Seed chứa hai loại nội dung trộn lẫn: thứ dành cho người chơi (bối cảnh,
 * nhân vật, sự kiện) và thứ dành cho người chấm (mốc hành vi của từng kỹ năng,
 * đáp án câu chọn, gợi ý có tính phí, điều kiện mở kết cục bí mật). AI-4 chỉ
 * được thấy loại thứ nhất: không biết rubric thì không thể để lộ rubric (R3),
 * không biết gợi ý thì không thể cho gợi ý miễn phí.
 *
 * Lọc theo danh sách CHO PHÉP chứ không theo danh sách cấm. Trường nào mới
 * thêm vào seed thì mặc định bị giấu, cho tới khi có người cố ý mở nó ra ở
 * đây — quên một dòng thì AI-4 thiếu ngữ cảnh, chứ không lộ đáp án.
 *
 * Chỉ đưa các hoạt động TỚI hoạt động hiện tại, không đưa hoạt động sau. Vừa
 * không thể lộ trước sự kiện chưa diễn ra, vừa để phần đầu prompt của hoạt
 * động a3 là phần mở rộng của a2 — prompt cache nối dài được qua từng bước.
 */
import type { Activity, Scenario } from '../../data/schema.js';

export interface NarratorCastMember {
  npc_id: string;
  role_in_scene: string;
  pressure: string;
  voice: string | null;
}

export interface NarratorActivity {
  activity_id: string;
  type: Activity['type'];
  setup: string;
  npc_line: string | null;
  input_prompt: string | null;
  closing_prompt: string;
  /** Mục tiêu đào sâu của chuyên gia. AI-4 cần nó để biết hỏi về khía cạnh nào. */
  followup_goal: string | null;
}

export interface NarratorView {
  title: string;
  job: {
    role_name_vn: string;
    band: string;
    title_vn: string | null;
    years_experience: string | null;
    user_context: string | null;
  };
  context: {
    task: string | null;
    situation: string | null;
    stakes: string | null;
    time_pressure: string | null;
  };
  cast: NarratorCastMember[];
  activities: NarratorActivity[];
}

/**
 * Các hoạt động theo đúng thứ tự canon: đi theo `forward_to` từ hoạt động gốc.
 *
 * Không dùng thứ tự trong mảng — chuyên gia có thể sắp mảng tuỳ ý, còn thứ tự
 * người chơi thật sự đi qua là chuỗi `forward_to`.
 */
export function canonOrder(scenario: Scenario): Activity[] {
  const byId = new Map(scenario.activities.map((a) => [a.activity_id, a]));
  const origin =
    scenario.activities.find((a) => a.isOrigin) ?? scenario.activities[0];

  const order: Activity[] = [];
  const seen = new Set<string>();
  let cursor: Activity | undefined = origin;
  while (cursor && !seen.has(cursor.activity_id)) {
    order.push(cursor);
    seen.add(cursor.activity_id);
    cursor =
      cursor.forward_to === 'END' ? undefined : byId.get(cursor.forward_to);
  }
  return order;
}

function positionOf(order: Activity[], activityId: string): number {
  const index = order.findIndex((a) => a.activity_id === activityId);
  if (index < 0) {
    throw new Error(
      `Hoạt động "${activityId}" không nằm trên chuỗi canon của kịch bản`,
    );
  }
  return index;
}

/**
 * Dựng phần kịch bản AI-4 được thấy, tới hoạt động `currentActivityId`.
 *
 * Thứ tự khoá trong object cố định, nên cùng kịch bản và cùng hoạt động luôn
 * ra cùng một chuỗi JSON — điều kiện để prompt cache trúng giữa những người
 * chơi khác nhau.
 */
export function narratorView(
  scenario: Scenario,
  currentActivityId: string,
): NarratorView {
  const order = canonOrder(scenario);
  const upTo = order.slice(0, positionOf(order, currentActivityId) + 1);

  return {
    title: scenario.scenario_title,
    job: {
      role_name_vn: scenario.job.role_name_vn,
      band: scenario.job.band,
      title_vn: scenario.job.title_vn ?? null,
      years_experience: scenario.job.years_experience ?? null,
      user_context: scenario.job.user_context ?? null,
    },
    context: {
      task: scenario.context.task ?? null,
      situation: scenario.context.situation ?? null,
      stakes: scenario.context.stakes ?? null,
      time_pressure: scenario.context.time_pressure ?? null,
    },
    cast: scenario.cast.map((member) => ({
      npc_id: member.npc_id,
      role_in_scene: member.role_in_scene,
      pressure: member.pressure,
      voice: member.voice ?? null,
    })),
    activities: upTo.map((activity) => ({
      activity_id: activity.activity_id,
      type: activity.type,
      setup: activity.setup,
      npc_line: activity.npc_line,
      input_prompt: activity.input_prompt,
      closing_prompt: activity.closing_prompt,
      followup_goal: activity.followup_goal ?? null,
    })),
  };
}

/** Mọi chuỗi chữ trong một giá trị bất kỳ — dùng để gom văn bản cho R1, R3. */
export function textsOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(textsOf);
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(textsOf);
  return [];
}

/**
 * Những gì AI-4 KHÔNG được nói ra, dù vô tình: rubric, khoá chấm, gợi ý chưa
 * dùng, kết cục, và mọi thứ của các hoạt động chưa tới.
 *
 * AI-4 vốn không thấy những thứ này (xem `narratorView`), nên R3 chỉ là lưới
 * an toàn cho trường hợp model tự nói trúng — ví dụ đoán ra đúng câu của mốc
 * +2 vì nó quá hiển nhiên.
 */
export function hiddenTexts(
  scenario: Scenario,
  currentActivityId: string,
): string[] {
  const order = canonOrder(scenario);
  const position = positionOf(order, currentActivityId);
  const hidden: string[] = [];

  for (const activity of scenario.activities) {
    hidden.push(
      ...activity.observes.flatMap((o) => Object.values(o.anchors)),
      ...activity.hints.map((h) => h.text),
      ...(activity.optionWhy ?? []),
      ...textsOf(activity.summary),
      ...textsOf(activity.choice_reason),
      ...textsOf(activity.context),
    );
  }

  for (const activity of order.slice(position + 1)) {
    hidden.push(
      activity.setup,
      ...textsOf(activity.npc_line),
      ...textsOf(activity.input_prompt),
      activity.closing_prompt,
      ...textsOf(activity.followup_goal),
    );
  }

  for (const ending of scenario.endings) {
    hidden.push(
      ending.text,
      ...textsOf(ending.reveals),
      ...textsOf(ending.condition.extra),
    );
  }

  for (const event of scenario.random_events) {
    hidden.push(event.text, ...textsOf(event.divert_note));
  }

  return hidden.filter((text) => text.trim().length > 0);
}
