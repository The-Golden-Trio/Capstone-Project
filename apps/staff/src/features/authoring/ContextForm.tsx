import { useState } from 'react';
import type { GenerationInput, SituationOptions } from '../../api/types';
import { Button, Checkbox, SelectField, TextArea } from '../../components/ui';
import { ARCHETYPE_LABEL, COMPANY_LABEL } from '../../lib/labels';

/**
 * Bước 1 của D03 (AD-04, SD-05): chọn tình huống, viết ngữ cảnh, chọn năng
 * lực rồi gửi AI sinh bản nháp. Chữ tác giả được khử định danh ở máy chủ
 * trước khi tới model (DC-03).
 */
export function ContextForm({
  options,
  initial,
  busy,
  disabled,
  onGenerate,
}: {
  options: SituationOptions;
  initial: Partial<GenerationInput>;
  busy: boolean;
  disabled: boolean;
  onGenerate: (input: GenerationInput) => void;
}) {
  const [archetype, setArchetype] = useState(
    initial.archetype ?? options.archetypes[0] ?? '',
  );
  const [companyType, setCompanyType] = useState(
    initial.companyType ?? options.companyTypes[0] ?? '',
  );
  const [context, setContext] = useState(initial.context ?? '');
  const [skills, setSkills] = useState<string[]>(initial.competencyIds ?? []);
  const toggle = (id: string) =>
    setSkills((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const expertise = options.skills.filter((s) => s.kind === 'EXPERTISE');
  const soft = options.skills.filter((s) => s.kind === 'SOFT_SKILL');

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label={`Loại tình huống (mở ở cấp ${options.band})`}
          value={archetype}
          onChange={(e) => setArchetype(e.target.value)}
          disabled={disabled}
          options={options.archetypes.map((a) => ({
            value: a,
            label: ARCHETYPE_LABEL[a] ?? a,
          }))}
        />
        <SelectField
          label="Loại công ty"
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          disabled={disabled}
          options={options.companyTypes.map((c) => ({
            value: c,
            label: COMPANY_LABEL[c] ?? c,
          }))}
        />
      </div>
      <TextArea
        label="Ngữ cảnh của tác giả"
        hint="Tình huống thật bạn muốn người chơi gặp: ai, chuyện gì, áp lực gì. Không ghi tên thật hay thông tin liên lạc."
        rows={6}
        maxLength={4000}
        value={context}
        disabled={disabled}
        onChange={(e) => setContext(e.target.value)}
      />
      <fieldset className="mb-3" disabled={disabled}>
        <legend className="mb-1 text-[13px] font-medium text-ink-2">
          Năng lực scenario nhắm tới (chọn 3–5)
        </legend>
        <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[12px] text-muted">Chuyên môn</p>
            {expertise.map((s) => (
              <div key={s.competencyId}>
                <Checkbox
                  label={s.name}
                  checked={skills.includes(s.competencyId)}
                  onChange={() => toggle(s.competencyId)}
                />
              </div>
            ))}
          </div>
          <div>
            <p className="mb-1 text-[12px] text-muted">Kỹ năng mềm</p>
            {soft.map((s) => (
              <div key={s.competencyId}>
                <Checkbox
                  label={s.name}
                  checked={skills.includes(s.competencyId)}
                  onChange={() => toggle(s.competencyId)}
                />
              </div>
            ))}
          </div>
        </div>
      </fieldset>
      <Button
        variant="primary"
        busy={busy}
        disabled={disabled || !context.trim() || skills.length === 0}
        onClick={() =>
          onGenerate({ archetype, companyType, context, competencyIds: skills })
        }
      >
        Sinh bản nháp bằng AI
      </Button>
    </div>
  );
}
