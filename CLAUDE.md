# Quy tắc cho AI trong repo này

## Không đọc `_archive/` trừ khi được yêu cầu

`_archive/` chứa tài liệu và dữ liệu **đã hết hiệu lực** (đề tài v1 tháng 7, dữ liệu nghề pass 0–1, code và docs cũ). Đọc nó chỉ tốn token và dễ lẫn thông tin cũ với thông tin hiện hành.

- **Không** mở, đọc, liệt kê, tìm kiếm hay trích dẫn bất kỳ file nào trong `_archive/`, kể cả `_archive/README.md`, trừ khi người dùng **nhắc rõ** `_archive` hoặc một file trong đó trong yêu cầu hiện tại.
- Khi tìm kiếm cả repo (Grep, Glob, `rg`, `grep -r`, `find`), **luôn loại `_archive/`**, ví dụ `rg … --glob '!_archive/**'`, `grep -r --exclude-dir=_archive`, `find . -path ./_archive -prune -o …`.
- Thông tin hiện hành nằm ở `docs/project-hub/` (single source of truth). Một file trong hub nhắc tới đường dẫn `_archive/...` (ví dụ `08-nguon.md`) chỉ là để ghi nguồn, **không** phải lời mời mở file đó.
- Nếu thấy cần dữ liệu cũ để trả lời, hỏi người dùng trước, nói rõ sẽ đọc file nào và vì sao. Không tự mở.
- Không sửa, di chuyển hay xoá gì trong `_archive/`, trừ khi được yêu cầu.

`.claude/settings.json` đặt `Read` và `Edit` trong `_archive/` ở chế độ **ask**: Claude Code sẽ hỏi trước mỗi lần mở file ở đó.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
