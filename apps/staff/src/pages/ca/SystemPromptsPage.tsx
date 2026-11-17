import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Callout, Panel } from '@datn/ui';
import { caExtra, type PromptKind } from '../../api/ca-extra';
import {
  CaWorkspace,
  ResourceState,
  useCaResource,
} from '../../features/catalogue/CaWorkspace';
import {
  hasFamilyConflict,
  PromptVersions,
} from '../../features/settings/PromptVersions';

export function SystemPromptsPage() {
  const { occupationId = '' } = useParams();
  const loader = useCallback(
    () => caExtra.prompts(occupationId),
    [occupationId],
  );
  const resource = useCaResource(loader);
  const [selected, setSelected] = useState<PromptKind>();
  const prompts = resource.result?.data ?? [];
  const kind = prompts.some((p) => p.kind === selected)
    ? selected
    : prompts[0]?.kind;
  const demo = resource.result?.demo ?? false;
  // ĐỀ XUẤT: OpenAPI SystemPromptVersion chưa trả model family; mẫu minh hoạ DC-01.
  const narratorFamily = demo ? 'Qwen' : null;
  const judgeFamilies = demo ? ['DeepSeek', 'OpenAI', 'Anthropic'] : [];
  const conflict = hasFamilyConflict(narratorFamily, judgeFamilies);
  return (
    <CaWorkspace
      code="C10"
      title="Prompt hệ thống"
      description={`Nghề ${occupationId} · Tra cứu phiên bản và thay đổi của prompt, không sửa trực tiếp tại màn này.`}
      demo={demo}
    >
      <ResourceState
        loading={resource.loading}
        error={resource.error}
        retry={resource.reload}
      />
      <Panel variant="solid" className="space-y-3">
        <h2 className="font-display text-xl">Phân vai model · DC-01</h2>
        <div className="flex flex-wrap gap-3">
          <Badge>
            AI-4 dẫn truyện: {narratorFamily ?? 'Chưa có dữ liệu họ model'}
          </Badge>
          <Badge>
            AI-5 judge:{' '}
            {judgeFamilies.join(' · ') || 'Chưa có dữ liệu họ model'}
          </Badge>
        </div>
        <Callout tone={conflict ? 'warning' : 'info'}>
          {conflict
            ? 'Cảnh báo: narrator và judge đang cùng họ model. Cần cấu hình các họ khác nhau trước khi dùng.'
            : demo
              ? 'Cấu hình họ model minh hoạ đáp ứng DC-01; không phải cấu hình runtime được xác minh.'
              : 'Chưa thể kiểm chứng DC-01: hợp đồng API chưa cung cấp cấu hình model theo vai.'}
        </Callout>
      </Panel>
      <Callout title="Giới hạn ánh xạ vai">
        OpenAPI dùng các kind GRADING, FOLLOW_UP… và chưa có kind NARRATOR cho
        contract nhịp D-130. GRADING tương ứng chấm điểm AI-5; FOLLOW_UP dưới
        đây là prompt hỏi thêm, chưa thể coi là toàn bộ prompt narrator AI-4.
      </Callout>
      <div className="grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
        <Panel variant="solid" className="self-start" padding="sm">
          <nav aria-label="Loại prompt" className="space-y-2">
            {prompts.map((prompt) => (
              <Button
                key={prompt.kind}
                variant={kind === prompt.kind ? 'subtle' : 'ghost'}
                className="w-full justify-between"
                onClick={() => setSelected(prompt.kind)}
              >
                {prompt.kind}
                <span className="text-xs">v{prompt.versionNo}</span>
              </Button>
            ))}
          </nav>
        </Panel>
        {kind && (
          <PromptVersions
            key={`${occupationId}-${kind}`}
            occupationId={occupationId}
            kind={kind}
            demo={demo}
          />
        )}
      </div>
    </CaWorkspace>
  );
}
