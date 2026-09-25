# Quy ước làm việc với repo

Ba thứ dưới đây dùng **chung một bộ quy ước** (định nghĩa trong [`tools/git/commit-rules.mjs`](tools/git/commit-rules.mjs)):

| Ở đâu                                    | Làm gì                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Husky hook trên máy mỗi người            | Chặn commit có message sai quy ước, chặn commit thẳng lên `main` / `production`                                                      |
| GitHub Action `pr-check`                 | Chặn merge PR vào `main` nếu title, description hoặc commit trong PR chưa đạt                                                        |
| Skill Claude `/capstone-commit-helper`   | Viết giúp commit message và PR description đúng quy ước                                                                              |
| Skill Claude `/capstone-meeting-minutes` | Sau mỗi buổi họp: ghi minutes và **giao task có ID** vào [`docs/project-hub/tuan/`](docs/project-hub/tuan/README.md)                 |
| Skill Claude `/capstone-weekly-progress` | Thứ 6 đối chiếu **task được giao** với commit + PR cả tuần, ghi trạng thái từng task và tiến độ từng người vào `tuan/<tuần>/tuan.md` |

Message và description viết kỹ thì bản tổng hợp tuần mới đúng. Commit `update` thì không ai biết tuần đó mình làm gì.

## 1. Quy trình

1. Tạo branch từ `main`: `git switch main && git pull && git switch -c feat/<tên-ngắn>` (tiền tố giống type: `feat/`, `fix/`, `docs/`, `data/`…).
2. Commit nhỏ, mỗi commit một việc, message theo mục 2.
3. Push và mở PR **vào `main`**, điền đủ template (mục 3).
4. Check `pr-check` và `CI` xanh, có ít nhất 1 người review, rồi **Squash and merge**. Title PR sẽ thành commit trên `main`.
5. `production` chỉ nhận merge từ `main` khi release.

## 2. Commit message

```
type(scope): mô tả ngắn bằng tiếng Việt có dấu

Body (không bắt buộc với commit nhỏ): làm gì, vì sao, ảnh hưởng chỗ nào.

Task: T1909.2
```

- **type** (bắt buộc): `feat` tính năng mới · `fix` sửa lỗi · `refactor` · `perf` · `style` · `test` · `docs` tài liệu · `data` dữ liệu nghề, kịch bản · `build` build, dependency · `ci` GitHub Actions, husky · `chore` việc lặt vặt · `revert`
- **scope** (nên có): `web` · `api` · `game-core` · `data` · `hub` · `report` · `docs` · `infra` · `ci` · `deps` · `skills` · `repo`. Nhiều scope thì viết `feat(web,api): …`
- **mô tả**: tiếng Việt có dấu, ít nhất 3 từ, cả dòng đầu không quá 100 ký tự, không có dấu chấm cuối. Nói **đã làm gì**, không nói "update", "fix bug", "sửa lỗi".
- **Commit lớn** (hơn 10 file hoặc hơn 400 dòng, không tính lockfile, ảnh, `game-data.json`) **phải có body**, hoặc tách nhỏ ra.
- **Commit làm task được giao**: thêm dòng `Task: T1909.2` ở cuối body (nhiều task: `Task: T1909.2, T1909.3`). ID lấy từ bảng Task giao trong [`docs/project-hub/tuan/`](docs/project-hub/tuan/README.md), hoặc chạy `python3 tools/hub/tuan.py tasks --open`. Nhờ dòng này mà `/capstone-weekly-progress` biết task nào đã có sản phẩm.
- Commit merge, `Revert "…"`, `fixup!` được bỏ qua.

| ✖ Bị chặn                 | ✔ Nên viết                                                   |
| ------------------------- | ------------------------------------------------------------ |
| `update`                  | `docs(hub): cập nhật 07 theo nhận xét của cô 19/9`           |
| `fix: update v2`          | `fix(web): sửa bản đồ 3D không zoom được trên Safari`        |
| `integrate with database` | `feat(api): lưu lượt chơi và điểm kỹ năng vào PostgreSQL`    |
| `Feat: 3d`                | `feat(web): dựng bản đồ ngân hà 3D bằng react-three-fiber`   |
| `prisma`                  | `build(api): thêm Prisma 7 và schema User, GameProfile, Run` |

Tự kiểm tra một message: `echo "feat(web): …" | node tools/git/lint-commit-msg.mjs --stdin`

## 3. Pull request

- **Title** theo đúng quy ước commit ở trên.
- **Description** theo [template](.github/pull_request_template.md). Ba mục **Tóm tắt**, **Thay đổi chính**, **Cách kiểm tra** là bắt buộc và không được để trống. **Liên quan** và **Ảnh chụp / video** không bắt buộc, nhưng PR làm task được giao thì ghi `Task: T….` trong **Liên quan**.
- Mọi commit trong PR cũng phải đúng quy ước. Commit tạo trước 26/9/2026 chỉ bị cảnh báo.
- Sửa title hoặc description trên GitHub thì check tự chạy lại. Commit sai thì reword (`git rebase -i origin/main`, đổi `pick` thành `reword`) rồi `git push --force-with-lease`.

Kiểm tra ở máy trước khi mở PR:

```
node tools/git/check-pr.mjs --title "feat(web): …" --body-file pr.md --base origin/main
```

## 4. Cài đặt (mỗi người làm một lần)

Husky chưa có trong `package.json`. **Một người** chạy lệnh dưới đây rồi commit `package.json` và `pnpm-lock.yaml`:

```
pnpm add -D -w husky
pnpm pkg set scripts.prepare="husky"
pnpm install
git add package.json pnpm-lock.yaml
git commit -m "ci(repo): cài husky để kiểm tra commit message"
```

Sau khi commit đó vào `main`, mọi người chỉ cần `git pull && pnpm install`. Lệnh `prepare` tự trỏ git hook vào `.husky/`.

- Hook chạy bằng `node`, không cần gì thêm.
- `git commit --no-verify` bỏ qua được hook, nhưng `pr-check` trên GitHub vẫn bắt lỗi. Đừng dùng.
- Tắt husky tạm thời (ví dụ khi rebase dài): `HUSKY=0 git …`

## 5. Bật chặn merge trên GitHub (admin repo làm một lần)

**Settings → General → Default branch**: đổi từ `production` sang **`main`**, để PR mặc định mở vào `main`.

**Settings → Branches → Add branch ruleset** (hoặc _Add classic branch protection rule_), target `main`:

- ☑ **Require a pull request before merging**, _Required approvals_ = 1
- ☑ **Require status checks to pass**, thêm **`pr-check`** và **`main`** (job CI)
- ☑ **Block force pushes**
- (nên) **Settings → General → Pull Requests**: chỉ bật **Allow squash merging**, chọn _Default to pull request title and description_

Làm tương tự cho `production` nếu muốn chỉ nhận merge qua PR.

Check `pr-check` chỉ hiện trong danh sách sau khi nó đã chạy ít nhất một lần, tức là sau PR đầu tiên có file `.github/workflows/pr-check.yml`.
