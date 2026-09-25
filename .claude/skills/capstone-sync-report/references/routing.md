# Routing: nội dung report → file nào trong `docs/project-hub/`

Route by **what the content is**, not by chapter number. Chapter numbers change between reports; the hints below reflect the Ch.1–5 report of 18/9.

## Luôn làm (mỗi lần sync)

| File | Việc |
|---|---|
| `08-nguon.md` §1 | Add a row: `\| d/m \| reports/<folder>/main.tex (+ submissions/<pdf> nếu có) \| <nội dung, số trang/chương> \| <gặp cô ngày nào, nếu biết> \|`. Also fix §3 if that report's source was listed as "chưa có trong repo" |
| `00-tong-quan.md` | Rename the heading `## Hiện trạng tại d/m` to today's date and update the rows the report affects, especially the **Báo cáo** row (which chapters are done and which are still missing). Update "Việc chưa làm" if the top 3 changed |
| `reports/README.md` | Add a row to "Nhật ký sync": report · ngày nộp · ngày sync · người chạy (ask if unknown, else `—`) · file hub đã sửa · ghi chú |
| `07-van-de-mo.md` §B | Go through each of cô's open comments and mark ✅ / ◐ / leave it (precedence rule 5) |
| `tuan/<week>/tuan.md` | The week containing the **submission date** (`python3 tools/hub/tuan.py week <yyyy-mm-dd>`; create it with `init` if needed). Under `## Đã nộp / trình bày cho cô`, add `- d/m: [<tên report>](../../../../reports/<folder>/main.tex), <chương>, <số trang>`. Then look at the open tasks (`tuan.py tasks --open`): every task about writing or fixing this report (for example "viết lại §1.3 Objectives") → ✅ if the report does it, with evidence `báo cáo d/m §x.y`; 🟡 if partly done. Don't close tasks the report doesn't cover |

## Theo loại nội dung

| Nội dung trong report | Thường ở (18/9) | Cập nhật vào | Cách làm |
|---|---|---|---|
| Tên đề tài, slogan, GVHD, nhóm | Trang bìa, Ch.1 | `00` §Đề tài · `02` D-01 | Only if changed |
| Ý tưởng lõi, định vị ("không hướng nghiệp…") | Ch.1 | `00` "Ý tưởng lõi" · `03` §1 · `02` §A (D-02…D-05) | Keep `00` to 1 paragraph |
| Bối cảnh, vấn đề, tổng quan tài liệu (Gati, RJP, Kolb…) | Ch.1–2 | `03` §2 (≤ 5 bullet) | Note new or removed sources; close `07` B4 if older sources were replaced |
| **Objectives** | Ch.1 | `00` · `02` §A (new D row if changed) · `07` B1 | Check: are they objectives or a task list (cô's comment 19/9)? |
| **Scope**, đối tượng người dùng | Ch.1, Ch.4 | `02` §B (D-10…D-13) · `03` §3 · `07` B5 | |
| Vấn đề nghiên cứu RP-x, đóng góp khoa học | Ch.1, Ch.4 | `02` D-04 · `03` §8 | |
| So sánh hệ thống hiện có, tiêu chí C1–C8, **AI-native** | Ch.3 | `03` (add a short subsection "Định vị so với hệ thống hiện có" if missing) · `07` B2 | |
| **Bối cảnh vận hành / business model** (ai vận hành, hạ tầng AI, doanh thu, domain expert) | Ch.4 (§4.1) | `03` (add a subsection "Bối cảnh vận hành" if missing) · `07` B3, C2 | |
| Nhóm người dùng / actor | Ch.4 | `03` §3 · `02` D-13 | |
| **Business rules BR-xx** | Ch.4 (§4.1.3) | `03` §8 table · the `02` rows that cite BRs (D-33, D-42, D-43, D-45) · `07` A6, B6 | Copy the IDs and content faithfully. If a BR was renumbered, say so in the summary |
| **FR / NFR / DR** + MoSCoW | Ch.4 | `03` §8 (totals by type and priority, plus the notable ones) · `00` hiện trạng row "Đề tài & định vị" (totals) | Use the totals from `ids.md` and cross-check them against the report's own tables |
| **Use case UC-xx** | Ch.4 | `03` §8 UC list | |
| Vòng chơi, mô hình nội dung (band, archetype, activity, rubric, hint, event, ending) | Ch.4–5 | `03` §4–5 · `02` §C (D-20…D-29) | When the report differs from `spec-scenario-KHOI1.md`, flag ⚠️ in `07` §A. Do not change the spec |
| Kỹ năng, tiến trình, bản đồ nghề, luật mở khoá | Ch.4–5 | `03` §6 · `02` §D (D-30…D-36) · `07` A4, A5, D1 | |
| Get-to-know-me, đánh giá nghề 5 tiêu chí, hành trang, sự kiện | Ch.4–5 | `03` §7 · `02` D-27, D-29 · `07` B7 | |
| **AI**: pipeline sinh / dẫn truyện / chấm, chọn model, human-in/on-the-loop | Ch.5 | `02` §E (D-40…D-45) · `03` §4 · `07` C1 | Choosing a provider or model is a decision: add a D row |
| **Thiết kế đánh giá** (bộ chuẩn, κ, offline) | Ch.5–7 | `02` D-44 · `00` hiện trạng row "Đánh giá" · `07` B9 | |
| Dữ liệu nghề (taxonomy, nguồn, số role) | Ch.4–5 | `02` §F (D-50…D-53) | Numbers that differ from `04` §5 → ⚠️ `07` §A |
| Kiến trúc, tech stack, CSDL, API | Ch.5 | `03` §8 (add a subsection "Thiết kế hệ thống (theo báo cáo d/m)") | **Never** into `04` (precedence rule 3). A gap with the code → `07` §C |
| Cài đặt, kiểm thử, kết quả | Ch.6–7 | `00` hiện trạng · `07` §C | Cross-check with `04`; report ≠ code → ⚠️ |
| Kết luận, hướng phát triển, kế hoạch | Ch.8 | `00` "Việc chưa làm" · `07` | |
| Thuật ngữ mới / đổi tên | anywhere | `03` §9 | Add a row, or fix the matching column |
| Pháp lý, dữ liệu cá nhân (NĐ 13/2023, chuyển dữ liệu ra nước ngoài) | Ch.4–5 | `07` §E | Mark ✅ if the report handles it |
| Tên sản phẩm (JobQuest / Vào Nghề) | anywhere | `07` A3 · `02` D-71 | |
| Câu hỏi xin cô quyết định | Last chapter / appendix | Minutes don't change. Put them in `07` §B as ❓ until `/capstone-meeting-minutes` records cô's answer | |

## `03` §8 when a newer report arrives

`03` §8 always describes **the latest submitted report**. Rename it `## 8. Đặc tả trong báo cáo <chương> (d/m)` and replace its content with the new version. The old version stays in git history and in `08` §1, so it does not need to be kept in the file. If a BR, FR or UC was removed or renumbered, write one line at the end of §8: "So với báo cáo d/m trước: bỏ BR-07, thêm BR-10 …".

## Not routed anywhere

- The acknowledgements, table of contents, list of figures, bibliography (unless a key source changed) and appendices containing raw survey data.
- Passages the report copies verbatim from an earlier report, when the hub already has them.
