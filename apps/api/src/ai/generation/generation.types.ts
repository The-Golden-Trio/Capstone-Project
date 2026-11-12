/**
 * Cổng sinh nội dung scenario (SD-05, CL-04 `PromptBuilder.generation/revision`).
 * `ScenarioModule` gọi qua token `SCENARIO_GENERATOR`; bản thật dùng gateway,
 * bản giả chỉ cho dev (`AI_MODE=fake`, D-92).
 */
export const SCENARIO_GENERATOR = Symbol('SCENARIO_GENERATOR');

/** Phần dữ liệu nghề gửi kèm (không có dữ liệu cá nhân của ai). */
export interface GenerationBrief {
  occupationName: string;
  levelNo: number;
  band: string;
  levelTitle: string;
  levelDescription: string;
  taskText: string;
  archetype: string;
  companyType: string;
  /** Ngữ cảnh tác giả viết (đã khử định danh). */
  authorContext: string;
  /** Năng lực nhắm tới; `key` ngắn (k1, k2…) để model không phải chép uuid. */
  skills: Array<{ key: string; name: string; kind: string }>;
  generationRules: string[];
  downsides: string[];
}

export interface RevisionBrief {
  brief: GenerationBrief;
  /** Đường dẫn phần cần sửa trong nội dung, ví dụ `activities[1].rubric`. */
  part: string;
  /** Giá trị hiện tại của phần đó (JSON). */
  current: unknown;
  request: string;
}

export interface GeneratorUsage {
  modelId: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs: number;
  succeeded: boolean;
}

export type GeneratorResult =
  | { status: 'ok'; json: unknown; usage: GeneratorUsage[] }
  | {
      status: 'failed';
      reason: 'no_model' | 'exhausted' | 'blocked';
      usage: GeneratorUsage[];
    };

export interface ScenarioGenerator {
  /** `system`: prompt hệ thống của nghề (FR-44); thiếu thì dùng bản mặc định. */
  generate(brief: GenerationBrief, system?: string): Promise<GeneratorResult>;
  revise(brief: RevisionBrief, system?: string): Promise<GeneratorResult>;
}
