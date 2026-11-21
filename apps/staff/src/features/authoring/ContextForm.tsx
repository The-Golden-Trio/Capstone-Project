import { Button, Checkbox } from '@datn/ui';
import { useState } from 'react';
import type { GenerationInput, SituationOptions } from '../../api/types';
import { SelectField, TextArea } from '../../components/ui';
import { ARCHETYPE_LABEL, COMPANY_LABEL } from '../../lib/labels';
import { SourceTag, guideHint } from '../shared/Guidance';
import { ARCHETYPE_UNLOCK, COMPANY_NOTE, CONTEXT_PROMPTS } from './guidance';

/**
 * Lời dẫn khi chọn năng lực. Chuyên môn: 1–2 keyword trọng tâm (Seed §1, A1).
 * Kỹ năng mềm ở đây là 7 nhóm, không phải 42 mục con của Seed §E1, nên chỉ
 * nhắc ưu tiên 2 nhóm trọng tâm của cấp, không đặt khoảng số.
 */
const GROUP_GUIDE = {
  EXPERTISE: {
    title: 'Chuyên môn trọng tâm',
    note: 'nên 1–2',
    range: [1, 2] as const,
    source: 'Seed §1, §A1',
  },
  SOFT_SKILL: {
    title: 'Nhóm kỹ năng mềm được quan sát',
    note: 'ưu tiên 2 nhóm trọng tâm của cấp',
    range: null,
    source: 'Seed §E1 · D-114',
  },
} as const;

/**
 * Bước 1 của D03 (AD-04, SD-05): chọn tình huống, viết ngữ cảnh, chọn năng
 * lực rồi gửi AI sinh bản nháp. Chữ tác giả được khử định danh ở máy chủ
 * trước khi tới model (DC-03). Khoảng số năng lực chỉ là gợi ý; máy chủ chỉ
 * đòi ít nhất một.
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

  const groups = (['EXPERTISE', 'SOFT_SKILL'] as const).map((kind) => {
    const list = options.skills.filter((s) => s.kind === kind);
    const picked = list.filter((s) => skills.includes(s.competencyId)).length;
    const guide = GROUP_GUIDE[kind];
    const ok = guide.range
      ? picked >= guide.range[0] && picked <= guide.range[1]
      : picked > 0;
    return { kind, list, picked, guide, ok };
  });

  return (
    <div className="staff-paper paper rounded-lg p-4">
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          label={`Loại tình huống (mở ở cấp ${options.band})`}
          hint={
            <>
              {ARCHETYPE_UNLOCK[archetype] &&
                `${ARCHETYPE_LABEL[archetype] ?? archetype}, ${ARCHETYPE_UNLOCK[archetype]}. `}
              Cùng cấp không có hai màn trùng cả việc lẫn loại tình huống.
              <SourceTag>D-22 · Seed §1</SourceTag>
            </>
          }
          value={archetype}
          onChange={(e) => setArchetype(e.target.value)}
          disabled={disabled || busy}
          options={options.archetypes.map((a) => ({
            value: a,
            label: ARCHETYPE_LABEL[a] ?? a,
          }))}
        />
        <SelectField
          label="Loại công ty"
          hint={guideHint(COMPANY_NOTE)}
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          disabled={disabled || busy}
          options={options.companyTypes.map((c) => ({
            value: c,
            label: COMPANY_LABEL[c] ?? c,
          }))}
        />
      </div>

      <div className="mb-2 rounded-xl border border-line bg-night-900/25 px-4 py-3 text-[13px]">
        <p className="mb-1 font-semibold text-ink-muted">
          Kể một lần thật đã xảy ra ở cấp này
          <SourceTag>D-81 · critical incident</SourceTag>
        </p>
        <ul className="list-disc space-y-0.5 pl-5 text-ink-faint">
          {CONTEXT_PROMPTS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </div>
      <TextArea
        label="Ngữ cảnh của tác giả"
        hint="Không ghi tên thật, tên công ty hay thông tin liên lạc."
        rows={8}
        maxLength={4000}
        value={context}
        disabled={disabled || busy}
        onChange={(e) => setContext(e.target.value)}
      />
      <p className="-mt-2 mb-3 text-right text-[11px] text-ink-faint">
        {context.length}/4000
      </p>

      <fieldset className="mb-3" disabled={disabled}>
        <legend className="mb-1 text-[13px] font-medium text-ink-muted">
          Năng lực scenario nhắm tới
        </legend>
        <div className="grid gap-x-6 gap-y-1 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.kind}>
              <p className="mb-1 text-[12px] text-ink-faint">
                {g.guide.title} · {g.guide.note} ·{' '}
                <span className={g.ok ? 'text-success' : 'text-warning'}>
                  đã chọn {g.picked}
                </span>
                <SourceTag>{g.guide.source}</SourceTag>
              </p>
              {g.list.map((s) => (
                <div key={s.competencyId}>
                  <Checkbox
                    label={s.name}
                    checked={skills.includes(s.competencyId)}
                    onChange={() => toggle(s.competencyId)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </fieldset>
      <Button
        variant="primary"
        loading={busy}
        disabled={
          disabled ||
          !context.trim() ||
          !archetype ||
          !companyType ||
          skills.length === 0
        }
        onClick={() =>
          onGenerate({ archetype, companyType, context, competencyIds: skills })
        }
      >
        Sinh bản nháp bằng AI
      </Button>
    </div>
  );
}
