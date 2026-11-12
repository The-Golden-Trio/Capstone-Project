/**
 * Dữ liệu staff cho máy dev: tài khoản, nghề, cấp, task, năng lực, tiêu chí
 * duyệt. Màn A03 (System Admin giao staff) và P1 (danh mục, hồ sơ nghề) chưa
 * làm, nên phần này thay chỗ cho chúng khi dev và demo.
 *
 * Mọi thứ gắn nhãn `[dev]` là dữ liệu thử, KHÔNG phải nội dung đã được DE
 * duyệt. Chạy lại không nhân bản (upsert theo email / mã / số cấp).
 *
 *     SEED_STAFF_PASSWORD=... pnpm exec nx run @datn/api:seed-staff
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import type {
  Proficiency,
  StaffRoleKind,
  UserRoleKind,
} from '../generated/prisma/enums';

function loadEnvFile(path: string): void {
  let text: string;
  try {
    text = readFileSync(path, 'utf-8');
  } catch {
    return;
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at < 0) continue;
    const key = trimmed.slice(0, at).trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = trimmed
      .slice(at + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(join(process.cwd(), 'apps/api/.env'));

const OCCUPATION_CODE = process.env['SEED_STAFF_OCCUPATION'] ?? 'SWE_BACKEND';

interface ProfileLevel {
  band: string;
  title_vn: string;
  core_output: string;
}
interface Profile {
  role_code: string;
  role_name_vn: string;
  overview: { summary: string; downsides: string[] };
  interests?: { interest_code?: string };
  daily_work: { by_level: Array<{ band: string; tasks: string[] }> };
  skills: { hard: Array<{ name_vn: string; name: string; score: number }> };
  career: { levels: ProfileLevel[] };
}

const STAFF: Array<{
  email: string;
  displayName: string;
  roles: UserRoleKind[];
  staffRole?: StaffRoleKind;
}> = [
  {
    email: 'sa@jobquest.local',
    displayName: 'Quản trị hệ thống [dev]',
    roles: ['SYSTEM_ADMIN'],
  },
  {
    email: 'ca@jobquest.local',
    displayName: 'Content Admin [dev]',
    roles: ['CONTENT_ADMIN'],
    staffRole: 'CONTENT_ADMIN',
  },
  {
    email: 'de1@jobquest.local',
    displayName: 'Chuyên gia 1 [dev]',
    roles: ['DOMAIN_EXPERT'],
    staffRole: 'DOMAIN_EXPERT',
  },
  {
    email: 'de2@jobquest.local',
    displayName: 'Chuyên gia 2 [dev]',
    roles: ['DOMAIN_EXPERT'],
    staffRole: 'DOMAIN_EXPERT',
  },
  {
    email: 'de3@jobquest.local',
    displayName: 'Chuyên gia 3 [dev]',
    roles: ['DOMAIN_EXPERT'],
    staffRole: 'DOMAIN_EXPERT',
  },
];

/** 7 nhóm soft skill, tên lấy từ `occupation-data/specs/spec-checklist-softskill.md`. */
const SOFT_GROUPS = [
  'Giao tiếp & hợp tác',
  'Trí tuệ cảm xúc & xử lý xung đột',
  'Lãnh đạo & tư duy kinh doanh',
  'Tư duy & giải quyết vấn đề',
  'Tự quản lý & chịu áp lực',
  'Thích ứng & học hỏi',
  'Đạo đức & chuyên nghiệp',
];

const DEV_CRITERIA = [
  '[dev] Tình huống đúng với công việc thật ở cấp này của nghề',
  '[dev] Phương án và mức điểm 0/1/2 hợp lý, có lý do',
  '[dev] Rubric đủ ba mốc và dấu hiệu phản tác dụng rõ ràng',
  '[dev] Ngôn từ phù hợp người chơi, không định kiến',
  '[dev] Câu chốt và các kết cục khớp với nội dung',
];

const slug = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);

const proficiencyOf = (levelNo: number): Proficiency =>
  levelNo <= 2 ? 'FAMILIAR' : levelNo <= 5 ? 'PROFICIENT' : 'EXPERT';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), path), 'utf-8')) as T;
}

/** Ngưỡng tín chỉ `[dev]`: tổng ngân sách điểm của cấp trong `point_budgets.json`. */
function creditThresholds(code: string): Map<string, number> {
  const out = new Map<string, number>();
  try {
    const data = readJson<{
      roles: Array<{
        role_code: string;
        levels: Array<{ band: string; budget: Record<string, number> }>;
      }>;
    }>('occupation-data/generated/point_budgets.json');
    const role = data.roles.find((r) => r.role_code === code);
    for (const level of role?.levels ?? [])
      out.set(
        level.band,
        Object.values(level.budget).reduce((a, b) => a + b, 0),
      );
  } catch {
    // Không có file thì để 0.
  }
  return out;
}

async function main(): Promise<void> {
  const password = process.env['SEED_STAFF_PASSWORD'];
  if (!password || password.length < 8)
    throw new Error(
      'Đặt SEED_STAFF_PASSWORD (ít nhất 8 ký tự) trước khi chạy seed-staff.',
    );
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) throw new Error('Thiếu DATABASE_URL');

  const { profiles } = readJson<{ profiles: Profile[] }>(
    'occupation-data/generated/occupation_profiles.json',
  );
  const profile = profiles.find((p) => p.role_code === OCCUPATION_CODE);
  if (!profile) throw new Error(`Không có hồ sơ nghề ${OCCUPATION_CODE}`);

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    const passwordHash = await argon2.hash(password);
    const accounts = new Map<string, string>();
    for (const s of STAFF) {
      const account = await prisma.userAccount.upsert({
        where: { email: s.email },
        create: {
          email: s.email,
          displayName: s.displayName,
          passwordHash,
        },
        update: { displayName: s.displayName, passwordHash },
      });
      accounts.set(s.email, account.id);
      for (const role of s.roles)
        await prisma.userRole.upsert({
          where: { userId_role: { userId: account.id, role } },
          create: { userId: account.id, role },
          update: {},
        });
    }
    const sa = accounts.get('sa@jobquest.local') as string;
    const de1 = accounts.get('de1@jobquest.local') as string;

    const domain = await prisma.domain.upsert({
      where: { code: 'IT' },
      create: { code: 'IT', name: 'Công nghệ thông tin', createdBy: sa },
      update: {},
    });
    const occupation = await prisma.occupation.upsert({
      where: { code: profile.role_code },
      create: {
        domainId: domain.id,
        code: profile.role_code,
        name: profile.role_name_vn.slice(0, 120),
        summary: profile.overview.summary,
        riasecCode: profile.interests?.interest_code?.slice(0, 3) ?? null,
        createdBy: sa,
      },
      update: {},
    });

    for (const s of STAFF) {
      if (!s.staffRole) continue;
      const userId = accounts.get(s.email) as string;
      const active = await prisma.staffAssignment.findFirst({
        where: {
          occupationId: occupation.id,
          userId,
          role: s.staffRole,
          endedAt: null,
        },
      });
      if (!active)
        await prisma.staffAssignment.create({
          data: {
            occupationId: occupation.id,
            userId,
            role: s.staffRole,
            assignedBy: sa,
          },
        });
    }

    // Năng lực: chuyên môn từ O*NET (skills.hard), soft skill là 7 nhóm.
    const competencyIds: string[] = [];
    for (const skill of profile.skills.hard) {
      const c = await prisma.competency.upsert({
        where: { code: `ONET.${slug(skill.name)}` },
        create: {
          code: `ONET.${slug(skill.name)}`,
          kind: 'EXPERTISE',
          name: skill.name_vn,
          indicator: `[dev] ${skill.name} (O*NET, mức quan trọng ${skill.score})`,
          createdBy: sa,
        },
        update: {},
      });
      competencyIds.push(c.id);
    }
    for (const [i, name] of SOFT_GROUPS.entries()) {
      const c = await prisma.competency.upsert({
        where: { code: `SOFT.G${i + 1}` },
        create: {
          code: `SOFT.G${i + 1}`,
          kind: 'SOFT_SKILL',
          name,
          indicator: `[dev] Nhóm ${i + 1} của thư viện câu hỏi soft skill`,
          createdBy: sa,
        },
        update: {},
      });
      competencyIds.push(c.id);
    }

    const thresholds = creditThresholds(profile.role_code);
    for (const level of profile.career.levels) {
      const levelNo = Number(level.band.slice(1));
      const row = await prisma.occupationLevel.upsert({
        where: {
          occupationId_levelNo: { occupationId: occupation.id, levelNo },
        },
        create: {
          occupationId: occupation.id,
          levelNo,
          band: level.band,
          title: level.title_vn.slice(0, 120),
          description: level.core_output,
          creditThreshold: thresholds.get(level.band) ?? 0,
        },
        update: {},
      });
      const hasTasks = await prisma.task.count({ where: { levelId: row.id } });
      if (!hasTasks) {
        const tasks =
          profile.daily_work.by_level.find((l) => l.band === level.band)
            ?.tasks ?? [];
        await prisma.task.createMany({
          data: tasks.map((text, sortOrder) => ({
            levelId: row.id,
            text,
            sortOrder,
          })),
        });
      }
      await prisma.levelCompetency.createMany({
        data: competencyIds.map((competencyId) => ({
          levelId: row.id,
          competencyId,
          proficiency: proficiencyOf(levelNo),
        })),
        skipDuplicates: true,
      });
    }

    if (
      !(await prisma.downside.count({ where: { occupationId: occupation.id } }))
    )
      await prisma.downside.createMany({
        data: profile.overview.downsides.map((text, sortOrder) => ({
          occupationId: occupation.id,
          text,
          sortOrder,
          writtenBy: de1,
        })),
      });

    if (
      !(await prisma.reviewCriteriaVersion.count({
        where: { occupationId: occupation.id },
      }))
    )
      await prisma.reviewCriteriaVersion.create({
        data: {
          occupationId: occupation.id,
          versionNo: 1,
          createdBy: accounts.get('ca@jobquest.local') as string,
          criteria: {
            create: DEV_CRITERIA.map((text, sortOrder) => ({
              text,
              sortOrder,
            })),
          },
        },
      });

    const levels = await prisma.occupationLevel.count({
      where: { occupationId: occupation.id },
    });
    const tasks = await prisma.task.count({
      where: { level: { occupationId: occupation.id } },
    });
    console.log(
      `✔ seed-staff: ${STAFF.length} tài khoản (${STAFF.map((s) => s.email).join(', ')}), ` +
        `nghề ${occupation.code}: ${levels} cấp, ${tasks} task, ${competencyIds.length} năng lực.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
