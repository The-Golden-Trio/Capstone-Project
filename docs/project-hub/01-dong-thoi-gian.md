# 01 · Dòng thời gian dự án

> Hợp nhất từ: Messenger "Đồ án chuyên ngành", Discord (#chung, #weekly-minutes), `git log` của repo, và các file đã nộp cô.
> Giờ theo UTC+7. Những dòng ghi **(suy luận)** là mình ghép từ ngữ cảnh, không có câu nào nói thẳng — cần người trong buổi đó xác nhận.
> Cập nhật lần cuối: 21/09/2026.

**Ký hiệu nguồn:** 💬 Messenger · 🎮 Discord · 🔀 commit git · 📄 file nộp cô · 👥 gặp trực tiếp (không có ghi chép, chỉ biết là có họp)

---

## Tổng quan 5 giai đoạn

| # | Giai đoạn | Thời gian | Kết quả chính |
|---|---|---|---|
| 0 | Lập nhóm, chọn đề tài | 27/6 – 14/7 | Chọn cô Châu làm GVHD. Hai ý tưởng bị loại: sàn chứng khoán và web luyện IELTS |
| 1 | Đề tài v1: **Nền tảng định hướng nghề nghiệp bằng AI cho học sinh THPT** | 15/7 – 7/8 | Repo, brief report 6 phần (nộp 22/7), supplementary report (trả lời 5 câu hỏi của cô) |
| 2 | Chuyển hướng sang **trải nghiệm nghề** ("AI Native Career Experience") | 5/8 – 30/8 | Gặp cô 14/8 → chốt hướng. Dữ liệu 78 nghề IT. Bộ khung kịch bản (scenario skeleton) |
| 3 | Đặt tên **JobQuest**, kickoff | 31/8 – 13/9 | Logo, landing page, slide kickoff (5/9), báo cáo cô 10/9 (deck 7/9), dữ liệu 22/18 nghề |
| 4 | Prototype + báo cáo Chương 1–5 | 14/9 – nay | Web chạy được (auth, DB, bản đồ 3D, màn chơi). Báo cáo Ch.1–5.1 + deck, báo cáo cô 19/9 |

---

## Giai đoạn 0 — Lập nhóm, chọn đề tài (27/6 – 14/7)

| Ngày | Nguồn | Sự kiện |
|---|---|---|
| 27/6 (T7) | 💬 | Brian tạo nhóm Messenger "Đồ án chuyên ngành". Chọn GVHD: **cô Châu** (PGS. TS. Võ Thị Ngọc Châu) |
| 29–30/6 | 💬 | Gom email/MSSV, gửi thông tin đăng ký cho cô |
| 30/6 | 💬 | Phúc đề xuất làm **sàn chứng khoán** có chatbot hỗ trợ. Nam đồng ý (không đi tiếp) |
| 5/7 (CN) | 💬 | Cô yêu cầu chọn **1 trong 5 domain** cô đưa ra. Nam đề xuất mảng giáo dục: **web luyện IELTS** hoặc Tiếng Anh 12 (dựa trên web IELTS sẵn có) |
| 8/7 | 💬 | Họp Meet 22h: IELTS gồm những kỹ năng gì, gắn AI thế nào, cá nhân hoá lộ trình ra sao |
| 9–10/7 | 💬 | Gửi cô tóm tắt chủ đề IELTS. Tính năng có sẵn: phòng thi realtime, tạo đề từ markdown, chấm Writing bằng AI, quản lý học sinh, engine làm bài |
| 11/7 (T7) | 💬 | Cô không đồng ý hướng IELTS (**suy luận:** cô muốn tính năng nổi bật hơn). Ý "clone Udemy", "SAT" bị gạt |
| 14/7 | 💬 | Xem lại 5 domain cô cho để tìm topic mới |

## Giai đoạn 1 — Đề tài v1: định hướng nghề nghiệp cho học sinh THPT (15/7 – 7/8)

| Ngày | Nguồn | Sự kiện |
|---|---|---|
| 15/7 (T4) | 💬 | Phúc đề xuất **hệ thống tư vấn hướng nghiệp** (cập nhật thị trường, roadmap, gom đánh giá, gợi ý cá nhân hoá). Phương án khác là "Bách Khoa community". → Chọn hướng nghiệp |
| 19/7 (CN) | 👥🔀 | Họp trực tiếp ở A4 lúc 14h. Nam khởi tạo repo (Nx + pnpm monorepo, React + NestJS). Phúc brainstorm 6 trụ cột (`docs/init.md`). Brian viết `market-research.md` và `steps.md`. Nam dịch `init.vi.md`, viết `datasource.md`/`result.md`, dựng `report/main.tex`. Phúc chốt dàn ý báo cáo 6 phần |
| 20–22/7 | 💬🔀 | Viết `report.md` và LaTeX: Phúc làm tổng quan và phần 3–4, Nam làm phần 5–6 + LaTeX, Brian bổ sung. 22/7: commit "docs: final" → **nộp cô brief report** |
| 23/7 (T5) | 💬 | Cô phản hồi qua mail với **5 câu hỏi**: (i) kinh nghiệm hướng nghiệp của team, (ii) có tiếp cận được chuyên gia không, (iii) hệ thống liên quan, (iv) công trình khoa học liên quan, (v) kế hoạch đánh giá. Phúc giao đi tìm bài báo |
| 25/7 (T7) | 💬🔀 | **Brian đưa ra insight:** trắc nghiệm tính cách dễ bị thiên lệch khi tự khai, nên chỉ dùng làm bài test đầu vào. Đánh giá chính phải dựa trên quá trình làm micro-task. Push `docs/progress/week-2/supplementary_report.md`. Phúc: ghi chép thì đẩy lên repo, chia docs theo tuần |
| 26/7 | 💬 | Cô đi Pháp 2 tuần |
| 27/7 | 🔀 | Nam mở PR #1 `feat/paper-links` (gắn link, rút còn 10 bài báo). **Chưa merge vào main** |
| 28/7 (T3) | 💬 | Họp Meet 21h45: trình bày các bài báo đã tìm (VD: *A Systematic Review of Recommender Systems for Student Academic and Career Guidance*) |

## Giai đoạn 2 — Chuyển hướng sang trải nghiệm nghề (5/8 – 30/8)

| Ngày | Nguồn | Sự kiện |
|---|---|---|
| 5/8 (T4) | 💬🎮 | Brian tạo server Discord. Phúc gửi `app_decisions_so_far.md`, bản quyết định cho một **topic thứ hai: workspace AI tổng hợp** kiểu Notion/ClickUp (xem `archive/`) |
| 6/8 | 💬 | Chuyển quyền owner Discord cho Phúc (AARES). Tạo kênh rules và weekly task & minutes |
| 7–8/8 | 💬👥 | Phúc phổ biến "topic mới". 8/8 (T7) họp trực tiếp ở A4 lúc 13h: lên kế hoạch phase đầu |
| 9/8 | 💬 | Chốt **6 luật làm việc nhóm**. Nội dung nằm trong ảnh, không còn bản chữ |
| 10/8 | 💬 | Đọc lại **2 topic** để chuẩn bị gặp cô (**suy luận:** topic 1 là hướng nghiệp, topic 2 là workspace AI) |
| **14/8 (T6)** | 💬👥 | **Gặp cô lúc 13h.** Kết quả: tên tạm **"AI Native Career Experience for Students"**. Việc cần làm: gửi lại mô tả hệ thống, finalize tên đề tài, nghiên cứu tổng quan. Lịch họp nhóm tối 21–22h |
| 18/8 (T3) | 💬🎮 | Brian gửi lại ghi chú buổi gặp cô (xem [05 · Biên bản](05-bien-ban-hop.md#gap-co-148)). Họp nhóm 21h → task: **AN – occupation profile**, **knam – market analysis** |
| 20/8 | 💬 | Phúc: đề tài sẽ đề xuất cho mọi nghề, nhưng **scope phase này chỉ làm mảng IT** |
| 22/8 (T7) | 👥🔀 | Họp trực tiếp ở lầu 5 A4 lúc 11h. Brian push `occupation-data/` (78 role IT, pass 0/1/2, 9 role tier-1 đã verify) |
| 23/8 (CN) | 💬🎮 | Họp online 13h30 → task hạn T3 (xem [06](06-task-tuan.md)). Cô nhắn: **finalize đề tài và nhóm trước T4 26/8**, gồm tên nháp (đặt theo tên sản phẩm), bối cảnh, mục tiêu, ý nghĩa thực tiễn |
| 26–27/8 | 💬🎮 | Review 1-1: Nam tối 26/8, Brian sáng 27/8. Khi gộp role thì giữ thêm cột "similar role". 27/8: Phúc ghi task hạn T7, giao Nam làm scenario cho 3 nghề **Backend, DevOps, Solution Architect** |
| 29/8 (T7) | 💬 | Họp 11h–14h |

## Giai đoạn 3 — JobQuest, kickoff (31/8 – 13/9)

| Ngày | Nguồn | Sự kiện |
|---|---|---|
| 30/8 | 💬 | Tuần lễ 2/9 vẫn có task. Phúc đăng ký slot gặp cô lúc 16h chiều T7 (áp dụng từ tuần sau kickoff) |
| 2/9 (T4) | 💬 | Phúc gửi plan thuyết trình (Claude artifact). Tạm dừng task tuần để làm slide và **logo** (mỗi người 3 mẫu) |
| 3/9 (T5) | 💬🎮📄 | Chia slide: Nhật làm 1–3, Nam làm 4–6. Phúc làm **landing page** (`JobQuest.zip` trên Discord). **`JobQuest_Kickoff_Slides.pdf`** (6 slide) |
| 4/9 | 🎮 | Làm logo (ảnh sinh bằng Gemini/ChatGPT, tách nền) |
| **5/9 (T7)** | 💬📄 | **Thuyết trình kickoff** ở B4505 lúc 13h (nhóm 23, project 258, mỗi nhóm 7 phút). Landing page đổi "school & career center" thành **"for everyone"**. Chọn **gặp cô mỗi tuần** |
| 6/9 | 💬 | Lịch mới: tuần sau gặp cô T5 10/9 lúc 17h. Từ tuần sau nữa, slot T7 đổi từ 16h sang 17h. "Repo kia dẹp rồi", một phần việc đang để ở máy local |
| 7/9 (T2) | 🔀💬📄 | Nam push **spec kịch bản** (`spec-scenario-KHOI1.md`, `HUONG-DAN-SINH-SCENARIO.md`, golden `SWE_BACKEND_L3`). **`JobQuest_Meeting_7Sep.pptx`** (14 slide): thêm 5 tiêu chí đánh giá nghề. Brian gửi `occupation-data.zip` |
| 8/9 (T3) | 💬🎮 | Logo mới (bản của Nam, Phúc trang trí thêm). Chia phần nói: AN slide 3–5, Phúc 6–8, knam 9–hết. Giao task, hạn **tối T2 14/9** (xem [06](06-task-tuan.md)) |
| 9/9 | 💬 | Tập thuyết trình |
| **10/9 (T5)** | 💬👥 | **Gặp cô lúc 17h**, trình bày deck 7/9. Tối đó Brian push `a200e1d`: 22 role enriched (nguồn ITviec 2025–26) và **18 role chơi được** |

## Giai đoạn 4 — Prototype + báo cáo Chương 1–5 (14/9 – nay)

| Ngày | Nguồn | Sự kiện |
|---|---|---|
| 14/9 | 💬 | Hẹn demo tối T4 16/9. Báo cáo cô chiều T7 19/9 |
| 15/9 | 🔀 | Nam: `docs/prototype.html`, prototype HTML tĩnh (screen flow + mock data) |
| 17/9 | 🔀 | Nam: prototype v2 → **port sang React** → **auth + profile + Prisma/Postgres**, tách `packages/game-core` |
| 18/9 (T6) | 🔀 | Nam: tô màu theo nghề, i18n VI/EN, **quần đảo L1–L10**, nhiệm vụ phụ hỏi nhanh, **đưa nội dung vào database**. Brian: **bản đồ ngân hà 3D** + skill taxonomy + role graph (kèm `plan.md`, `report-skill-graph-mvp.md`), tách điểm kỹ năng cứng/mềm, **văn phòng 2D top-down** cho L1, làm lại trang **Hành trang** |
| 18/9 | 📄🎮 | **`jobquest_report_ch1_5.pdf`** (48 trang, LaTeX) và **advisor deck 18/9** (38 slide). Nam ghi 4 ý mới: Get-to-know-me **bắt buộc**, hard skill chỉ làm bối cảnh, skill point tách theo domain, flow bản đồ mới |
| **19/9 (T7)** | 💬👥 | **Báo cáo cô Ch.1–5.1** lúc 17h (deck 18/9, 3 câu hỏi xin cô quyết định). Brian có script thuyết trình (Claude artifact). Nam gửi bảng so sánh 5 nhóm hệ thống theo 8 tiêu chí C1–C8 |
| 20/9 (CN) | 🎮 | Nam ghi **nhận xét của cô** (**suy luận:** từ buổi 19/9) và đề xuất **flow mới 8 điểm**. Brian vẽ sơ đồ màn hình `docs/vao-nghe-flow.*` (chưa commit) |
| 21/9 | — | Tổng hợp single source of truth này |
