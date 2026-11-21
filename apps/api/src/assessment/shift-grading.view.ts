/**
 * Khối `grading` của tổng kết ca làm: gom các bản ghi `GRADING_REQUESTED` và
 * `SEGMENT_GRADED` trong sổ sự kiện thành mức từng mục con và cờ. Thuần, tính
 * lại mỗi lần đọc; chưa có điểm nhóm vì chưa có trần nhóm của từng màn.
 */
import { shift } from '@datn/game-core';
import type { ShiftRecord } from '../core/shift-log.service';

export type ShiftGradingStatus = 'PENDING' | 'READY' | 'NOT_AVAILABLE';

export interface ShiftGradingView {
  status: ShiftGradingStatus;
  reason?: 'no_observes' | 'failed';
  subs: Array<{
    sub: string;
    name: string;
    group: number;
    level: number | null;
    segments: Array<{ segment: string; level: number | null }>;
  }>;
  flags: Array<{
    code: string;
    name: string;
    group: number;
    segment: string;
    quote: string;
  }>;
  segments: Array<{ segment: string; status: 'queued' | 'graded' | 'failed' }>;
}

/** Dữ liệu `SEGMENT_GRADED.data` mà view cần đọc. */
interface GradedData {
  segment: string;
  failed?: boolean;
  items?: Array<{ sub: string; segment: string; level: number | null }>;
  flags?: Array<{
    code: string;
    group: number;
    segment: string;
    quote: string;
  }>;
}

export function requestedSegments(records: readonly ShiftRecord[]): string[] {
  return records
    .filter((r) => r.type === 'GRADING_REQUESTED')
    .map((r) => String(r.data?.segment));
}

export function settledSegments(records: readonly ShiftRecord[]): Set<string> {
  return new Set(
    records
      .filter((r) => r.type === 'SEGMENT_GRADED')
      .map((r) => String((r.data as unknown as GradedData).segment)),
  );
}

/** Ca đã hết và mọi đoạn đã xếp hàng đều có kết quả (chấm xong hoặc hỏng hẳn). */
export function gradingSettled(
  records: readonly ShiftRecord[],
  ended: boolean,
): boolean {
  if (!ended) return false;
  const settled = settledSegments(records);
  return requestedSegments(records).every((s) => settled.has(s));
}

export function gradingView(
  records: readonly ShiftRecord[],
  observes: readonly shift.ObserveItem[],
): ShiftGradingView {
  const requested = requestedSegments(records);
  const graded = new Map<string, GradedData>();
  for (const r of records)
    if (r.type === 'SEGMENT_GRADED') {
      const data = r.data as unknown as GradedData;
      graded.set(String(data.segment), data);
    }
  const segments = requested.map((segment) => {
    const data = graded.get(segment);
    return {
      segment,
      status: data ? (data.failed ? 'failed' : 'graded') : 'queued',
    } as const;
  });
  const pairs = [...graded.values()].flatMap((d) => d.items ?? []);
  const subs = shift
    .subLevels(observes, pairs as shift.PairLevel[])
    .filter((s) => s.segments.length > 0)
    .map((s) => ({
      sub: s.sub,
      name: shift.checklistItem(s.sub)?.name ?? s.sub,
      group: s.group,
      level: s.level,
      segments: s.segments,
    }));
  const flags = [...graded.values()].flatMap((d) =>
    (d.flags ?? []).map((f) => ({
      code: f.code,
      name: shift.checklistFlag(f.code)?.behaviour ?? f.code,
      group: f.group,
      segment: f.segment,
      quote: f.quote,
    })),
  );
  const base = { subs, flags, segments };
  if (observes.length === 0 || requested.length === 0)
    return { ...base, status: 'NOT_AVAILABLE', reason: 'no_observes' };
  if (segments.some((s) => s.status === 'queued'))
    return { ...base, status: 'PENDING' };
  if (segments.some((s) => s.status === 'failed'))
    return { ...base, status: 'NOT_AVAILABLE', reason: 'failed' };
  return { ...base, status: 'READY' };
}
