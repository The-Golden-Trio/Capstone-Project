/**
 * Chân dung: đoạn mô tả chỉ viết lại khi nền đổi, AI hỏng thì dùng khuôn, và
 * không một thông tin định danh nào được đưa cho người viết.
 */
import { blankFit, createGameIndex } from '@datn/game-core';
import { fixtureData } from '@datn/game-core/testing';
import type { GameProfile } from '../generated/prisma/client';
import type { PortraitAi, PortraitFacts } from './ai/portrait-ai';
import { templateDescription } from './ai/template-description';
import { PortraitService } from './portrait.service';
import type { ProfileService, ProfileState } from './profile.service';

const index = createGameIndex(fixtureData());

const baseRow = (over: Partial<GameProfile> = {}): GameProfile =>
  ({
    userId: 'u1',
    quizFit: { ...blankFit(), DEEP_WORK: 4, DETAIL: 3, PEOPLE: -2 },
    quizDone: true,
    eventsPlayed: 0,
    updatedAt: new Date(),
    quizOrientationSum: -4,
    quizOrientationN: 4,
    stage: 'stage_university',
    quizTexts: { t1: 'Mình làm đồ án một mình suốt đêm' },
    quizTextFit: null,
    quizTextEvidence: null,
    quizTextReadAt: new Date(),
    portraitText: null,
    portraitSource: null,
    portraitModel: null,
    portraitBasis: null,
    portraitAt: null,
    ...over,
  }) as GameProfile;

function setup(opts: { row?: GameProfile; ai?: PortraitAi | null }) {
  let row = opts.row ?? baseRow();
  const state = (): ProfileState => ({
    row,
    eventAnswers: [],
    index,
    view: {
      fit: { ...blankFit(), ...(row.quizFit as Record<string, number>) },
      quizDone: row.quizDone,
      eventsPlayed: 0,
      doneEventIds: [],
    },
  });
  const profile = {
    state: jest.fn(async () => state()),
    retryTextReading: jest.fn(async () => false),
  } as unknown as ProfileService;
  const update = jest.fn(async ({ data }: { data: Partial<GameProfile> }) => {
    row = { ...row, ...data };
    return row;
  });
  const prisma = { gameProfile: { update } } as never;
  const service = new PortraitService(prisma, profile, opts.ai ?? null);
  return { service, update };
}

const fakeAi = (write: PortraitAi['write']): PortraitAi => ({
  read: jest.fn(async () => null),
  write: jest.fn(write),
});

describe('PortraitService', () => {
  it('trả đúng năm nghề, chỉ số xã hội và mô tả', async () => {
    const { service } = setup({});
    const view = await service.get('u1', 'vi');
    expect(view.top).toHaveLength(5);
    expect(view.socialIndex?.label).toBe('things');
    expect(view.description?.source).toBe('template');
  });

  it('chỉ gọi AI lại khi nền đổi', async () => {
    const ai = fakeAi(async () => ({ text: 'Bạn thích tập trung.', model: 'm' }));
    const { service } = setup({ ai });
    await service.get('u1', 'vi');
    await service.get('u1', 'vi');
    expect(ai.write).toHaveBeenCalledTimes(1);
    await service.get('u1', 'en');
    expect(ai.write).toHaveBeenCalledTimes(2);
  });

  it('AI hỏng thì dùng khuôn, bài vẫn có mô tả', async () => {
    const ai = fakeAi(async () => null);
    const { service } = setup({ ai });
    const view = await service.get('u1', 'vi');
    expect(view.description?.source).toBe('template');
    expect(view.description?.text.length).toBeGreaterThan(0);
  });

  it('không đưa thông tin định danh cho người viết', async () => {
    let seen: PortraitFacts | null = null;
    const ai = fakeAi(async (facts) => {
      seen = facts;
      return { text: 'x', model: 'm' };
    });
    await setup({ ai }).service.get('u1', 'vi');
    const json = JSON.stringify(seen);
    for (const key of ['userId', 'u1', 'email', 'displayName', 'dateOfBirth']) {
      expect(json).not.toContain(key);
    }
  });

  it('chưa có gì thì không có mô tả và không có chỉ số', async () => {
    const { service } = setup({
      row: baseRow({
        quizFit: blankFit(),
        quizOrientationSum: 0,
        quizOrientationN: 0,
        quizTexts: null,
      }),
    });
    const view = await service.get('u1', 'vi');
    expect(view.top).toEqual([]);
    expect(view.socialIndex).toBeNull();
    expect(view.description).toBeNull();
  });

  it('báo câu tự luận còn chờ đọc', async () => {
    const { service } = setup({ row: baseRow({ quizTextReadAt: null }) });
    expect((await service.get('u1', 'vi')).textsPending).toBe(true);
  });
});

describe('templateDescription', () => {
  const facts: PortraitFacts = {
    locale: 'vi',
    stage: null,
    strengths: [
      { dimension: 'DEEP_WORK', description: '', value: 4 },
      { dimension: 'DETAIL', description: '', value: 3 },
    ],
    aversions: [{ dimension: 'PEOPLE', description: '', value: -2 }],
    social: { value: 20, label: 'things' },
    topRoles: ['Kỹ sư Backend', 'Kỹ sư Nhúng'],
    texts: [],
  };

  it('tả điểm mạnh, một điều khó, và không bảo chọn nghề', () => {
    const text = templateDescription(facts);
    expect(text).toContain('tập trung sâu');
    expect(text).toContain('có thể thấy khó khi');
    expect(text).toContain('Kỹ sư Backend');
    expect(text).not.toMatch(/hợp với nghề/);
  });

  it('có bản tiếng Anh', () => {
    expect(templateDescription({ ...facts, locale: 'en' })).toMatch(/^You seem to/);
  });
});
