/**
 * Bộ sinh giả cho `AI_MODE=fake` (chỉ dev/demo, bị cấm ở production — D-92).
 * Trả một bản nháp mẫu hợp lệ, mọi câu gắn nhãn `[AI giả]` để không ai nhầm
 * là nội dung thật.
 */
import { sampleContent } from '../../scenario/content/sample-content';
import type {
  GenerationBrief,
  GeneratorResult,
  RevisionBrief,
  ScenarioGenerator,
} from './generation.types';

const usage = () => [
  {
    modelId: 'fake',
    tokensIn: 0,
    tokensOut: 0,
    costUsd: 0,
    latencyMs: 0,
    succeeded: true,
  },
];

export class FakeScenarioGenerator implements ScenarioGenerator {
  async generate(brief: GenerationBrief): Promise<GeneratorResult> {
    const keys = brief.skills.map((s) => s.key);
    const content = sampleContent(keys.length ? keys : ['k1'], '[AI giả]');
    content.situation = `[AI giả] ${brief.taskText} — ${brief.authorContext.slice(0, 300)}`;
    return { status: 'ok', json: content, usage: usage() };
  }

  async revise(brief: RevisionBrief): Promise<GeneratorResult> {
    const value =
      typeof brief.current === 'string'
        ? `${brief.current} [AI giả đã sửa: ${brief.request.slice(0, 80)}]`
        : brief.current;
    return { status: 'ok', json: value, usage: usage() };
  }
}
