# 05 · Họp & tiến độ tuần

> Mọi buổi họp (gặp cô, họp nhóm, 1-1) và việc **được giao so với việc làm được**, chia theo tuần. Đây là nơi nối những gì diễn ra ngoài đời với những gì có trong repo.

## Cấu trúc

```
tuan/
├─ README.md                  ← file này: quy ước + mục lục (bảng dưới tự sinh)
└─ 2026-W39/                  ← một thư mục cho mỗi tuần ISO (T2 → CN)
   ├─ tuan.md                 ← task giao · trạng thái · bằng chứng · làm thêm · đã nộp cô · theo người
   └─ 2026-09-19_gap-co.md    ← minutes: yyyy-mm-dd_<gap-co | hop-nhom | 1-1 | phan-task>.md
```

## Quy ước

1. **Buổi họp vào T7 hoặc CN là buổi mở đầu của tuần sau.** Task giao ở buổi đó làm trong tuần sau, nên minutes nằm trong thư mục tuần sau. Ví dụ: gặp cô T7 19/9 nằm ở `2026-W39` (21/9 → 27/9). Buổi họp trong tuần (T2–T6) nằm ở chính tuần đó.
2. **Task nằm ở tuần của buổi họp giao task.** Mỗi task có **ID = `T<ngày><tháng>.<số>`** theo buổi họp giao nó. Ví dụ `T1909.2` là task số 2 của buổi 19/9. Task không rõ buổi họp thì dùng ngày T2 của tuần.
3. **Ghi ID vào commit và PR** (`Task: T1909.2`, xem [`CONTRIBUTING.md`](../../../CONTRIBUTING.md)). Nhờ vậy `/capstone-weekly-progress` biết commit nào làm task nào.
4. **Task chưa xong** thì đánh ↪ ở tuần này và chép sang bảng tuần sau **với cùng ID**. Dòng ở tuần mới nhất là trạng thái hiện tại.
5. Bảng **Task giao** trong `tuan.md` luôn có 7 cột: `ID | Ai | Task | Hạn | Nguồn | Trạng thái | Bằng chứng`.

**Trạng thái:** ✅ xong, có sản phẩm · 🟡 xong một phần · ⏳ đang làm, chưa tới hạn · ❌ quá hạn, chưa có sản phẩm · ↪ chuyển sang tuần sau · 🚫 huỷ · ❓ không đủ dữ liệu để biết

**Tên người:** Nhật = Brian = AN (git: `Brian Chau`) · Nam = knam (git: `truongnam`) · Phúc, trưởng nhóm (git: `GitGud031005`). Bản ghi cũ dùng AN/knam, đã đổi cho thống nhất.

## Ai ghi gì

| Khi nào | Skill | Ghi vào |
|---|---|---|
| Sau mỗi buổi họp, hoặc khi đăng danh sách phân task lên Discord | `/capstone-meeting-minutes` (dán ghi chú, danh sách phân task, tin nhắn Discord hoặc transcript) | Minutes của buổi đó, **task giao** (có ID) trong `tuan.md`, quyết định vào [`02`](../02-quyet-dinh.md), nhận xét của cô vào [`07`](../07-van-de-mo.md) |
| Khi commit, mở PR | `/capstone-commit-helper` | `Task: T….` trong commit và PR |
| Nộp report cho cô | `/capstone-sync-report` | Mục "Đã nộp" của tuần, và đánh ✅ các task viết report |
| Chiều T6 | `/capstone-weekly-progress` | Trạng thái và bằng chứng của từng task, việc làm thêm, tiến độ theo người, task ↪ sang tuần sau |

Công cụ dùng chung: `python3 tools/hub/tuan.py` (`week`, `init`, `next-id`, `tasks --open`, `index`, `check`).

**Lịch sử trước 25/9** (W28 → W38 và buổi 19/9) được **tái dựng ngày 21/9** từ Messenger, Discord và git. Nguồn là bản cũ của `05-meeting-minutes.md` và `06-task-tuan.md` (file thứ hai đã bị xoá ở commit `104d0f5`, bản cuối còn trong commit `6652636`). Họp nhóm chỉ có ghi chép thật ở Discord `#weekly-minutes` (18/8, 23/8, 27/8, 8/9). Các buổi còn lại chỉ là một dòng tóm tắt trong `tuan.md`.

## Mục lục

<!-- INDEX:START -->
| Tuần | Ngày | Buổi họp | Task | ✅ | 🟡 | ⏳ | ❌ | ↪ | 🚫 | ❓ |
|---|---|---|---|---|---|---|---|---|---|---|
| [2026-W39](2026-W39/tuan.md) | 21/9 – 27/9 | [19/9](2026-W39/2026-09-19_gap-co.md), [20/9](2026-W39/2026-09-20_phan-task.md), [23/9](2026-W39/2026-09-23_hop-nhom.md) | 16 |  |  | 15 |  |  | 1 |  |
| [2026-W38](2026-W38/tuan.md) · Prototype + báo cáo Chương 1–5 | 14/9 – 20/9 | — | 6 | 6 |  |  |  |  |  |  |
| [2026-W37](2026-W37/tuan.md) · Skill, bản đồ 3D, prototype | 7/9 – 13/9 | [5/9](2026-W37/2026-09-05_gap-co.md), [10/9](2026-W37/2026-09-10_gap-co.md) | 8 | 6 |  |  | 1 |  |  | 1 |
| [2026-W36](2026-W36/tuan.md) · Kickoff | 31/8 – 6/9 | — | 4 | 3 |  |  |  |  |  | 1 |
| [2026-W35](2026-W35/tuan.md) · Dữ liệu 22 role + spec scenario | 24/8 – 30/8 | — | 9 | 7 | 2 |  |  |  |  |  |
| [2026-W34](2026-W34/tuan.md) · Occupation profile + market analysis | 17/8 – 23/8 | — | 2 | 1 |  |  |  |  |  | 1 |
| [2026-W33](2026-W33/tuan.md) · Gặp cô chốt hướng đề tài | 10/8 – 16/8 | [14/8](2026-W33/2026-08-14_gap-co.md) | 2 | 2 |  |  |  |  |  |  |
| [2026-W32](2026-W32/tuan.md) · Topic workspace AI, lập Discord | 3/8 – 9/8 | — | 2 | 2 |  |  |  |  |  |  |
| [2026-W31](2026-W31/tuan.md) | 27/7 – 2/8 | — | 0 |  |  |  |  |  |  |  |
| [2026-W30](2026-W30/tuan.md) · Brief report đề tài v1 (20/7 → 2/8) | 20/7 – 26/7 | [23/7](2026-W30/2026-07-23_gap-co.md) | 4 | 4 |  |  |  |  |  |  |
| [2026-W29](2026-W29/tuan.md) · Chọn đề tài hướng nghiệp | 13/7 – 19/7 | — | 1 | 1 |  |  |  |  |  |  |
| [2026-W28](2026-W28/tuan.md) · Chọn domain | 6/7 – 12/7 | [5/7](2026-W28/2026-07-05_gap-co.md) | 0 |  |  |  |  |  |  |  |
<!-- INDEX:END -->
