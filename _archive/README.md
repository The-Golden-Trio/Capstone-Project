# DATN

Capstone project monorepo — React frontend + NestJS backend, managed with Nx and pnpm.

## Structure

```
apps/
  web/    React app (Vite)
  api/    NestJS app
```

## Prerequisites

- Node.js 22+
- pnpm 10+

## Getting started

```sh
pnpm install
```

Run the backend:

```sh
pnpm exec nx serve api
```

Run the frontend:

```sh
pnpm exec nx serve web
```

The API listens on `http://localhost:3000/api`, the web app on `http://localhost:4200`.

## Common tasks

```sh
pnpm exec nx run-many -t lint test build typecheck   # run for all projects
pnpm exec nx build web                                # single project
pnpm exec nx graph                                     # visualize the project graph
```

## Skill progression + Career graph 3D ("Planet Universe")

Implement theo `plan.md` (ý 1: tích luỹ hard/soft skill · ý 2: graph 3D 22 role). Chưa có DB/auth thật — dev user `dev-user-1` hardcode, persistence in-memory + snapshot JSON.

### 1. Sinh dữ liệu (chạy lại khi dataset/alias đổi)

```sh
cd occupation-data
python3 build_skill_taxonomy.py   # → output/skills_taxonomy.json  (227 skill, nguồn thật duy nhất cho skill_id)
python3 build_role_graph.py       # → output/role_graph.json       (22 node, 64 cạnh SIMILAR/PROGRESSES_TO, 39 alias ABSORBED)
```

Hai file này được webpack copy vào `apps/api/dist/assets/data/` lúc build API (xem `apps/api/webpack.config.js`).

### 2. Chạy

```sh
pnpm exec nx serve api   # http://localhost:3000/api
pnpm exec nx serve web   # http://localhost:4200 (proxy /api → :3000)
```

| Route FE        | Mục đích |
|-----------------|----------|
| `/graph`        | Vũ trụ 3D: 22 hành tinh, legend màu theo `role_group`, HUD tổng XP, panel role + nút "Bay tới đây". Deep-link `/graph?select=SWE_MOBILE` mở sẵn panel |
| `/skills`       | Danh sách hard/soft skill, XP + progress bar theo level |
| `/dev/simulate` | Dev harness: giả lập `evidence_emitted[]` (spec B3) → `POST /api/skill-progress/ingest` — thay AI runtime chưa có |

| API | |
|-----|--|
| `GET  /api/skills` | Taxonomy |
| `POST /api/skill-progress/ingest` | `{ userId, sessionId, scenarioId, roleCode, band, evidence: [{ activity_id, skill, anchor_hit, quote, hint_used, timeout }] }` — idempotent theo `(sessionId, activity_id, skillId)` |
| `GET  /api/skill-progress/me` | XP/level của dev user, group hard/soft |
| `GET  /api/career-graph` | nodes + edges + `currentRoleCode` + `unlock` cho cạnh kề current |
| `POST /api/career-graph/fly` | `{ targetRoleCode }` — server tự kiểm 1-hop + unlock, chỉ ghi `UserGraphPosition` |

Hằng số tunable (XP, level, fuel, ngưỡng skill): `apps/api/src/app/config/progression.config.ts`.

### 3. Persistence

Repository port ở `apps/api/src/app/shared/repositories/`, adapter hiện tại `apps/api/src/app/persistence/in-memory.repositories.ts` (Map + snapshot `apps/api/.data/*.json`, git-ignored, ghi atomic sau mỗi write, load lại lúc bootstrap). Chọn DB xong → viết adapter mới implement đúng interface, đổi `useFactory` trong `persistence.module.ts`; service/controller không đổi. Xoá `apps/api/.data/` để reset về trạng thái sạch (SWE_FRONTEND, 0 XP).

### 4. Test

```sh
pnpm exec nx run-many -t typecheck test lint build -p @datn/api @datn/web
```
