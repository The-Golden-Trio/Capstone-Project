import { join } from 'node:path';
import { fixtureShiftContext } from '@datn/game-core/testing';
import {
  listPlaythroughs,
  parsePlaythrough,
  selectPlaythroughs,
  stepApplies,
  toPlayerInput,
  type Playthrough,
} from './playthrough';

const DIR = join(__dirname, 'playthroughs');

const minimal = {
  name: 'thu',
  seed: 'SWE_BACKEND.L3.m2',
  title: 'Thử',
  intent: 'Thử đọc kịch bản',
  steps: [{ do: 'start' }, { do: 'say', text: 'Chào anh' }],
};

describe('parsePlaythrough', () => {
  it('đọc kịch bản hợp lệ', () => {
    const p = parsePlaythrough(minimal, 'thu.json');
    expect(p.steps).toHaveLength(2);
  });

  it('từ chối loại việc lạ và chỉ ra file', () => {
    expect(() =>
      parsePlaythrough({ ...minimal, steps: [{ do: 'fly' }] }, 'sai.json'),
    ).toThrow(/sai\.json/);
  });

  it('từ chối câu trống, tên có chữ hoa, kịch bản không có bước', () => {
    expect(() =>
      parsePlaythrough(
        { ...minimal, steps: [{ do: 'say', text: '   ' }] },
        'a.json',
      ),
    ).toThrow();
    expect(() =>
      parsePlaythrough({ ...minimal, name: 'Thu' }, 'a.json'),
    ).toThrow();
    expect(() =>
      parsePlaythrough({ ...minimal, steps: [] }, 'a.json'),
    ).toThrow();
  });

  it('nhận ifAwait là một loại hoặc một danh sách, từ chối loại không có', () => {
    const ok = parsePlaythrough(
      {
        ...minimal,
        steps: [
          { do: 'say', text: 'a', ifAwait: 'probe_answer' },
          { do: 'say', text: 'b', ifAwait: ['probe_answer', 'node_reply'] },
        ],
      },
      'a.json',
    );
    expect(ok.steps).toHaveLength(2);
    expect(() =>
      parsePlaythrough(
        { ...minimal, steps: [{ do: 'say', text: 'a', ifAwait: 'nowhere' }] },
        'a.json',
      ),
    ).toThrow();
  });
});

describe('toPlayerInput', () => {
  it('đổi mỗi loại việc thành đầu vào của engine, như API ca làm', () => {
    const p = parsePlaythrough(
      {
        ...minimal,
        steps: [
          { do: 'start' },
          { do: 'action', key: 'open_log' },
          { do: 'action', key: 'write_patch', fields: { mo_ta: 'x' } },
          { do: 'say', text: 'xin chào' },
          { do: 'end_conversation' },
          { do: 'choose', option: 'a', elapsedMs: 1200 },
          { do: 'timeout' },
          {
            do: 'save_artefact',
            artefact: 'email_an',
            fields: { rui_ro: 'y' },
            ticks: ['h1'],
          },
          { do: 'confirm_end' },
          { do: 'cancel_end' },
          { do: 'hint' },
        ],
      },
      'a.json',
    );
    expect(p.steps.map(toPlayerInput)).toEqual([
      { type: 'START' },
      { type: 'ACTION', key: 'open_log', fields: undefined, ticks: undefined },
      {
        type: 'ACTION',
        key: 'write_patch',
        fields: { mo_ta: 'x' },
        ticks: undefined,
      },
      { type: 'SAY', text: 'xin chào' },
      { type: 'END_CONVERSATION' },
      { type: 'CHOOSE', option: 'a', elapsedMs: 1200 },
      { type: 'TIMEOUT' },
      {
        type: 'SAVE_ARTEFACT',
        artefact: 'email_an',
        fields: { rui_ro: 'y' },
        ticks: ['h1'],
      },
      { type: 'CONFIRM_END' },
      { type: 'CANCEL_END' },
      { type: 'HINT' },
    ]);
  });
});

describe('stepApplies', () => {
  it('không có ifAwait thì luôn làm; có thì chỉ khi engine chờ đúng loại', () => {
    expect(stepApplies({ do: 'hint' }, 'phase')).toBe(true);
    expect(
      stepApplies({ do: 'say', text: 'a', ifAwait: 'probe_answer' }, 'phase'),
    ).toBe(false);
    expect(
      stepApplies(
        { do: 'say', text: 'a', ifAwait: ['probe_answer', 'phase'] },
        'phase',
      ),
    ).toBe(true);
  });
});

describe('các kịch bản đi kèm', () => {
  it('có đủ ba kịch bản mẫu', () => {
    expect(listPlaythroughs(DIR)).toEqual([
      'lac-de-tan-cong',
      'lam-nhanh-quen-hen',
      'lam-tot',
    ]);
  });

  it('chọn theo tên, theo danh sách, theo all; tên sai thì liệt kê tên có', () => {
    expect(selectPlaythroughs(DIR, 'lam-tot').map((p) => p.name)).toEqual([
      'lam-tot',
    ]);
    expect(
      selectPlaythroughs(DIR, 'lam-tot,lac-de-tan-cong').map((p) => p.name),
    ).toEqual(['lam-tot', 'lac-de-tan-cong']);
    expect(selectPlaythroughs(DIR, 'all')).toHaveLength(3);
    expect(() => selectPlaythroughs(DIR, 'khong-co')).toThrow(/lam-tot/);
  });

  const all: Playthrough[] = selectPlaythroughs(DIR, 'all');

  it.each(all.map((p) => [p.name, p] as const))(
    '%s: ghi rõ là câu giả và chỉ dùng hành động, tài liệu, phương án có trong seed',
    (_name, p) => {
      expect(p._note).toMatch(/câu giả/);
      expect(p.steps[0]).toEqual({ do: 'start' });
      const { seed } = fixtureShiftContext(p.seed);
      const optionKeys = seed.nodes.flatMap((n) => n.options.map((o) => o.key));
      for (const step of p.steps) {
        if (step.do === 'action') {
          const action = seed.actions.find((a) => a.key === step.key);
          expect(action).toBeDefined();
          const artefact = seed.artefacts.find((a) => a.id === action?.target);
          for (const field of Object.keys(step.fields ?? {}))
            expect(artefact?.fields?.map((f) => f.id)).toContain(field);
        } else if (step.do === 'save_artefact') {
          const artefact = seed.artefacts.find((a) => a.id === step.artefact);
          expect(artefact).toBeDefined();
          for (const field of Object.keys(step.fields))
            expect(artefact?.fields?.map((f) => f.id)).toContain(field);
          for (const tick of step.ticks ?? [])
            expect(artefact?.ticks?.map((t) => t.id)).toContain(tick);
        } else if (step.do === 'choose') {
          expect(optionKeys).toContain(step.option);
        }
      }
    },
  );
});
