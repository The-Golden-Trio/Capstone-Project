import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';

const Profile = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]{1,48}$/),
  sourceUuid: z.uuid().optional(),
  occupation: z.string().trim().min(1).max(100),
  skills: z.array(z.string().trim().min(1).max(120)).min(1).max(6),
  goal: z.string().trim().min(1).max(300),
  familiarity: z.enum(['mới', 'gần nghề', 'quen Backend']),
});

const Cohort = z
  .strictObject({
    source: z.strictObject({
      url: z.url(),
      revision: z.string().regex(/^[a-f0-9]{40}$/),
      attribution: z.string().min(1),
      license: z.literal('CC BY 4.0'),
      selection: z.string().min(1),
    }),
    profiles: z.array(Profile).min(1).max(100),
  })
  .refine((cohort) => {
    const uuids = cohort.profiles.flatMap((profile) =>
      profile.sourceUuid ? [profile.sourceUuid] : [],
    );
    return (
      new Set(uuids).size === uuids.length &&
      new Set(cohort.profiles.map((profile) => profile.id)).size ===
        cohort.profiles.length
    );
  }, 'ID persona hoặc UUID nguồn bị trùng.');

export type PersonaProfile = z.infer<typeof Profile>;

export function loadCohort(path: string) {
  const contents = readFileSync(path, 'utf8');
  return {
    ...Cohort.parse(JSON.parse(contents)),
    sha256: createHash('sha256').update(contents).digest('hex'),
  };
}

export interface PlayPolicy {
  instruction: string;
  hints: number;
}

export const PLAY_POLICIES = {
  'dieu-tra-ky': {
    instruction:
      'Điều tra kỹ. Mở nguồn liên quan và đối chiếu bằng chứng trước khi kết luận. Kiểm tra lại ghi chú trước khi nộp.',
    hints: 1,
  },
  'lam-voi': {
    instruction:
      'Làm vội. Ưu tiên hành động nhanh, trả lời ngắn, chỉ mở thêm nguồn khi bị kẹt. Chấp nhận bỏ qua bước kiểm lại.',
    hints: 0,
  },
  'hoi-tro-giup': {
    instruction:
      'Nếu thiếu dữ kiện hoặc chưa hiểu thuật ngữ, chủ động hỏi NPC hoặc dùng gợi ý. Ghi lại điều đã làm rõ trước khi trả lời.',
    hints: 2,
  },
} satisfies Record<string, PlayPolicy>;

export type PolicyId = keyof typeof PLAY_POLICIES;
