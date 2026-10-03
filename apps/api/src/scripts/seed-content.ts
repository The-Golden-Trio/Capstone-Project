/**
 * Đưa nội dung game vào database.
 *
 * Đây là đường ghi DUY NHẤT vào các bảng nội dung — API chỉ đọc. Nội dung vẫn
 * do `docs/data/build.mjs` và `build-galaxy.mjs` sinh ra từ bộ dữ liệu nghề
 * nghiệp; script này chỉ chuyển kết quả ấy vào DB.
 *
 * Mỗi lần chạy ghi một `version` mới rồi mới lật cờ `active`. Bản cũ ở nguyên,
 * nên lượt chơi nào đang dở — vốn đã ghim `contentVersion` lúc mở màn — vẫn
 * được chấm bằng đúng bản nội dung nó đã chơi.
 *
 *     pnpm exec nx run @datn/api:seed-content
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { FOLLOWUP_LINES, GameDataSchema, type GameData } from '@datn/game-core';
import { PrismaClient } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';

/** Thư mục chứa JSON do bộ sinh dữ liệu xuất ra. */
const DATA_DIR = join(process.cwd(), 'packages/game-core/data');

/**
 * Nạp `.env` bằng tay.
 *
 * Script này chạy ngoài Nest nên không có `ConfigModule` đọc hộ, và không đáng
 * kéo thêm một thư viện chỉ để đọc vài dòng `KHOÁ=giá trị`.
 */
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
    process.env[key] = trimmed.slice(at + 1).trim().replace(/^["']|["']$/g, '');
  }
}

loadEnvFile(join(process.cwd(), 'apps/api/.env'));

function readJson(name: string): unknown {
  const path = join(DATA_DIR, name);
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (err) {
    throw new Error(
      `Không đọc được ${path}. Sinh lại bằng:\n` +
        `  node docs/data/build.mjs && node docs/data/build-galaxy.mjs\n` +
        `(${err instanceof Error ? err.message : String(err)})`,
    );
  }
}

/**
 * Kiểm trước, ghi sau.
 *
 * Dữ liệu hỏng mà vẫn ghi vào DB thì cả ứng dụng hỏng theo, và lỗi lộ ra ở
 * một màn chơi nào đó chứ không phải ở đây. Kiểm bằng đúng Zod schema mà web
 * và API vẫn dùng, nên không có kẽ hở giữa "hợp lệ lúc seed" và "hợp lệ lúc
 * chạy".
 */
function parseGameData(raw: unknown): GameData {
  const result = GameDataSchema.safeParse(raw);
  if (result.success) return result.data;

  const issues = result.error.issues
    .slice(0, 10)
    .map((i) => `  • ${i.path.join('.') || '(gốc)'}: ${i.message}`)
    .join('\n');
  throw new Error(`game-data.json không đúng hình dạng:\n${issues}`);
}

/**
 * Đưa một đối tượng về đúng dạng Prisma nhận vào cột Json.
 *
 * Kiểu Zod trả ra có những trường không bắt buộc mang kiểu `T | undefined`, mà
 * với Prisma `undefined` nghĩa là "đừng ghi trường này" chứ không phải một giá
 * trị JSON. Vòng qua `JSON` vừa bỏ các trường ấy, vừa bảo đảm thứ nằm trong DB
 * đúng bằng thứ đọc ra — không còn khoảng cách giữa hai bên.
 */
const asJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;

interface GalaxyLike {
  _meta?: { generated_at?: string };
  groups: Array<{ short: string }>;
  nodes: Array<{ roleCode: string }>;
  edges: unknown[];
}

async function main() {
  const game = parseGameData(readJson('game-data.json'));
  const galaxy = readJson('galaxy-data.json') as GalaxyLike;

  if (!Array.isArray(galaxy.groups) || !Array.isArray(galaxy.nodes)) {
    throw new Error('galaxy-data.json thiếu `groups` hoặc `nodes`');
  }

  // Dùng kết nối phiên (DIRECT_URL) chứ không qua pooler: seed chạy trong một
  // giao dịch dài, mà pooler ở chế độ transaction không giữ được giao dịch ấy.
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Thiếu DIRECT_URL (hoặc DATABASE_URL) trong apps/api/.env');
  }
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const latest = await prisma.contentRelease.findFirst({
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;
    const source =
      (game as { _meta?: { source_dataset?: string } })._meta?.source_dataset ??
      'không rõ';

    // Một giao dịch: hoặc cả phiên bản vào được, hoặc không có gì vào cả.
    // Ghi nửa chừng rồi hỏng là tệ nhất — DB sẽ có một phiên bản khuyết mà
    // không ai biết là khuyết.
    await prisma.$transaction(async (tx) => {
      await tx.contentRelease.create({ data: { version, source } });

      await tx.roleDoc.createMany({
        data: game.roles.map((role) => ({
          version,
          roleCode: role.role_code,
          nameVn: role.role_name_vn,
          roleGroup: role.role_group,
          bandStart: role.band_start,
          bandEnd: role.band_end,
          body: asJson(role),
        })),
      });

      await tx.scenarioDoc.createMany({
        data: Object.entries(game.scenarios).map(([key, scenario]) => ({
          version,
          key,
          roleCode: scenario.job.role_code,
          band: scenario.job.band,
          title: scenario.scenario_title,
          shortname: scenario.shortname ?? null,
          body: asJson(scenario),
        })),
      });

      await tx.sharedEventDoc.createMany({
        data: game.shared_events.map((event) => ({
          version,
          eventId: event.event_id,
          title: event.title,
          body: asJson(event),
        })),
      });

      await tx.quizQuestionDoc.createMany({
        data: game.quiz.questions.map((question, ordinal) => ({
          version,
          questionId: question.question_id,
          ordinal,
          body: asJson(question),
        })),
      });

      await tx.followupDoc.createMany({
        data: Object.entries(FOLLOWUP_LINES).map(([key, line]) => {
          const [scenarioKey, activityId] = key.split(':');
          return { version, scenarioKey, activityId, who: line.who, text: line.text };
        }),
      });

      await tx.galaxyDoc.createMany({
        data: [
          ...galaxy.groups.map((group) => ({
            version,
            kind: 'group',
            key: group.short,
            body: asJson(group),
          })),
          ...galaxy.nodes.map((node) => ({
            version,
            kind: 'node',
            key: node.roleCode,
            body: asJson(node),
          })),
          { version, kind: 'edges', key: 'all', body: asJson(galaxy.edges) },
        ],
      });

      await tx.metaDoc.createMany({
        data: [
          // `_meta` cũng phải lưu: `GameDataSchema` đòi nó, nên thiếu là
          // không dựng lại được bộ dữ liệu từ các hàng trong DB.
          { version, key: '_meta', body: asJson(game._meta) },
          { version, key: 'all_roles', body: asJson(game.all_roles) },
          { version, key: 'fit_dimensions', body: asJson(game.fit_dimensions) },
        ],
      });

      // Lật cờ sau cùng: tới lúc này phiên bản mới đã đầy đủ.
      await tx.contentRelease.updateMany({
        where: { active: true },
        data: { active: false },
      });
      await tx.contentRelease.update({
        where: { version },
        data: { active: true },
      });
    });

    console.log(`Đã seed nội dung phiên bản ${version} (nguồn: ${source})`);
    console.log(
      `  ${game.roles.length} nghề | ${game.shared_events.length} sự kiện chung | ` +
        `${Object.keys(game.scenarios).length} kịch bản | ` +
        `${game.quiz.questions.length} câu hỏi`,
    );
    console.log(
      `  ngân hà: ${galaxy.groups.length} nhóm | ${galaxy.nodes.length} hành tinh | ` +
        `${Object.keys(FOLLOWUP_LINES).length} lời đào sâu`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
