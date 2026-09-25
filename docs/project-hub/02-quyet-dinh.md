# 02 · Nhật ký quyết định (Decision log)

> Mỗi dòng là một quyết định **có dấu vết** trong chat, commit hoặc file nộp cô. Những gì chỉ bàn miệng mà không để lại dấu vết thì không có ở đây. Ai nhớ thì bổ sung theo mẫu ở cuối file.
>
> **Trạng thái:** ✅ đang hiệu lực · ♻️ đã bị thay thế · ⚠️ đang mâu thuẫn, cần chốt · 💡 mới là đề xuất

---

## A. Đề tài & định vị

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-01 | Làm **JobQuest: An AI-Native Experiential Career-Exploration Platform**, slogan *"Try the job before you pick the career"* | 3/9 | Kickoff slide 1 | ✅ |
| D-02 | **Không hướng nghiệp, không phán "bạn hợp ngành X".** Cho người dùng trải nghiệm nghề càng thật càng tốt, rồi họ tự cảm nhận mình có hợp không. Định hướng nghề chỉ là module phụ | 7/9 → 18/9 | Deck 7/9 S5: *"Career orientation is a supporting module, not the core"*. Báo cáo §1.3: đánh giá tính cách/sở thích chỉ giữ ở vai trò hỗ trợ | ✅ |
| D-03 | Cốt lõi là **"làm thử nghề"**, không phải trắc nghiệm tự khai. Trắc nghiệm dễ bị thiên lệch, còn làm nhiệm vụ thì lộ ra năng lực thật | 25/7 | 💬 Brian, `_archive/docs/progress/week-2/supplementary_report.md` | ✅ (ý gốc của D-02) |
| D-04 | Đóng góp khoa học = **kết hợp và kiểm định** 3 kỹ thuật: sinh tình huống có ràng buộc, đánh giá năng lực qua hành vi, chấm câu trả lời mở bằng LLM. Có 5 vấn đề nghiên cứu RP-1…RP-5; **RP-1 và RP-2 quyết định đề tài** | 18/9 | Báo cáo §1.2, §4.2.2; deck 18/9 S22 | ✅ |
| D-05 | Ba lớp trình bày: tiến trình kiểu **RPG**, cảnh kiểu **visual novel** phân nhánh, sự kiện kiểu **roguelike** (*"life is more than work"*) | 7/9 | Deck 7/9 S5; báo cáo §4.2.1 | ✅ |

### Các đề tài đã cân nhắc và bỏ

| Đề tài | Thời gian | Vì sao bỏ |
|---|---|---|
| Sàn chứng khoán có chatbot | 30/6 | Không đi tiếp. Cô yêu cầu chọn trong 5 domain |
| Web luyện IELTS / Tiếng Anh 12 | 5–11/7 | Cô không đồng ý (**suy luận:** thiếu điểm nổi bật) |
| Bách Khoa community (forum, marketplace…) | 15/7 | Chọn hướng nghiệp thay thế |
| **v1: Nền tảng định hướng nghề bằng AI cho HS THPT**, 4 trụ cột: khảo sát, micro-task, bản đồ lộ trình + thị trường, diễn đàn | 15/7 – 7/8 | ♻️ Được thay bằng JobQuest. Tài liệu đã chuyển vào `_archive/docs/` (`init*.md`, `report.md`, `report/main.tex`, `progress/week-2/`) |
| Workspace AI tổng hợp (Notion/ClickUp + AI orchestrator) | 5/8 – 14/8 | Topic thứ hai đem đi gặp cô. **Suy luận:** cô chọn hướng nghề nghiệp. Bản quyết định lưu ở [`archive/`](archive/) |

## B. Phạm vi & đối tượng

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-10 | **Phase 1 chỉ làm mảng IT**, thiết kế không phụ thuộc lĩnh vực. Lý do (theo báo cáo): chỉ có chuyên môn IT để dựng bộ chuẩn đánh giá | 20/8 → 18/9 | 💬 Phúc 20/8; báo cáo §1.3 | ✅ |
| D-11 | Đối tượng: **mọi người**, gồm học sinh chọn ngành, sinh viên mới ra trường và người muốn chuyển nghề | 5/9 → 18/9 | 💬 landing page đổi "school & career center" thành "for everyone"; báo cáo §4.2.1 | ✅ (thay "HS THPT" của v1) |
| D-12 | **Không làm:** theo dõi kết quả nghề dài hạn, môi giới tuyển dụng, tuyên bố mô phỏng thay được đi làm thật | 18/9 | Báo cáo §1.3; deck 18/9 S6 | ✅ |
| D-13 | Bốn nhóm người dùng: **Explorer**, **Domain expert**, **Content admin**, **System admin** | 18/9 | Báo cáo §4.2.1 (deck 7/9 mới có 3 nhóm) | ✅ |
| D-14 | Ý cô (14/8): hướng tới sản phẩm thật như startup. **Benchmark và dữ liệu nghề có thể bỏ**, dữ liệu trường ĐH dùng demo cũng được. Đánh giá thiên về kỹ thuật | 14/8 | 💬 ghi chú Brian gửi 18/8 | ✅ (định hướng của cô) |
| D-15 | **Domain expert chỉ tư vấn cho content admin**, không thao tác trực tiếp trên hệ thống | 23/9 | Phúc, [midweek 23/9](tuan/2026-W39/2026-09-23_hop-nhom.md) | ✅ (⚠️ lệch báo cáo 18/9: D-13, UC-07, UC-08; xem [07](07-van-de-mo.md) A8) |

## C. Cấu trúc nội dung & gameplay

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-20 | Thang cấp bậc toàn cục **L1 (intern) → L10 (C-level)**. Mỗi nghề chỉ chiếm các band có thật ở VN, **không bịa band** | 22/8 | `_archive/occupation-data/spec-pass1-KHOI1-fixed.md` | ✅ |
| D-21 | **job = (nghề, band)**. **Mỗi task của band = một scenario**, tên scenario chính là chuỗi task. Mỗi scenario có **3–4 activity cố định** cộng follow-up do AI sinh, dài **10–15 phút** | 23/8 → 7/9 | 🎮 minutes 23/8, 27/8, 8/9; `spec-scenario-KHOI1.md` v2.1 | ✅ (thay "beat" bằng "activity") |
| D-22 | **6 archetype** mở dần theo band: S_EXEC (L1+), S_AMBIG (L2+), S_INCIDENT (L3+), S_CONFLICT và S_REVIEW (L4+), S_DECISION (L6+) | 7/9 | spec A3 | ✅ |
| D-23 | **FREETEXT là mặc định.** CHOICE tối đa 1 lần mỗi scenario. Không dùng 4 lựa chọn cùng lúc với tự luận. Thêm ORDERING và PRIORITIZING (v2.2) | 27/8 → 7/9 | 🎮 minutes 27/8; spec A7 | ✅ |
| D-24 | Chấm theo **rubric ECD**: mỗi activity quan sát kỹ năng nào, với 3 mốc hành vi **+2 / 0 / −1** | 7/9 | spec A8 | ✅ |
| D-25 | **Hint** trong câu tự luận: dùng hint thì trần điểm là 0. **Quick action** có đếm giờ, hết giờ thì −1. Follow-up không cần hint, có giới hạn số lần | 27/8 | 🎮 minutes 27/8; spec A9, A11 | ✅ |
| D-26 | **Random event** chỉ rẽ hướng (DIVERT) hoặc kết thúc sớm (EARLY_END), vẫn bám luồng cũ. Chỉ để tạo đa dạng, **không gắn với phần thưởng** | 27/8 → 18/9 | 🎮 minutes 27/8; spec A12; báo cáo §4.2.1 | ✅ |
| D-27 | Người chơi **đánh giá nghề sau khi xong cả nghề**, theo **5 tiêu chí: lương, áp lực, độ khó, cân bằng công việc – cuộc sống, mức yêu thích**. Chỉ công bố số tổng hợp | 7/9 → 18/9 | Deck 7/9 S10; BR-04, BR-08; FR-12 | ✅ (thay ý "review/rating sau mỗi task" ngày 27/8) |
| D-28 | Mỗi nghề có **thanh tiến độ**: xong đủ scenario thì mở level tiếp | 27/8 | 🎮 minutes 27/8 | ⚠️ spec cố ý chưa chốt: bao nhiêu scenario thì đầy thanh? chơi lại có tính không? có tụt band không? |
| D-29 | **Get-to-know-me là tuỳ chọn**, dành cho người chưa biết bắt đầu từ đâu | 7/9 → 23/9 | **Chốt 23/9 (Brian): tuỳ chọn.** Trước đó: deck 7/9, báo cáo 18/9 (FR-11 Should) và flow 20/9 ghi tuỳ chọn; ghi chú của Nam 18/9 ghi bắt buộc; cô 19/9 hỏi vì sao bắt buộc | ✅ (thay ghi chú "bắt buộc" 18/9) |

## D. Kỹ năng, tiến trình & bản đồ nghề

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-30 | Người chơi **tích luỹ kỹ năng qua mỗi lượt chơi**. Kỹ năng là **"nhiên liệu"** để lên level và đi sang nghề khác | 8/9 | 🎮 minutes 8/9; deck 7/9 S12 | ✅ |
| D-31 | Nghề = **hành tinh** trên bản đồ 3D, người chơi = tên lửa. Khoảng cách có trọng số giữa nghề tương tự và nghề thăng tiến | 8/9 | 🎮 minutes 8/9; code `/jobs` | ✅ (cách vẽ đang được bàn lại, xem D-35) |
| D-32 | **Người chơi học cả hard skill lẫn soft skill.** Khớp với deck 7/9 ("mỗi task trả cả soft và hard") và code 18/9 | 23/9 | Chốt 23/9 (Brian) | ✅ (thay minutes 23/8 "giữ hard skill làm context" và ghi chú 18/9 "chỉ học soft skill") |
| D-33 | Luật mở khoá: **cấp đầu mọi nghề mở tự do** (BR-01). Lên cấp cần đủ điểm năng lực (BR-02). Sang nghề kề cần năng lực trùng với yêu cầu đầu vào (BR-03) | 7/9 → 18/9 | Deck 7/9 S5 (*"bỏ 2 mode riêng"*); báo cáo §4.1.3 | ✅ (cần giải thích BR-01 vs BR-03, xem [07](07-van-de-mo.md)) |
| D-34 | (Cài đặt) **Nhiên liệu là ngưỡng, không bị trừ khi bay.** Chỉ bay tới hành tinh kề (1-hop). Công thức: XP ≥ khoảng cách × 100 và mọi skill yêu cầu ≥ Lv1 | 18/9 | `_archive/docs/report-skill-graph-mvp.md` (Brian) | 💡 quyết định kỹ thuật, team chưa duyệt |
| D-35 | **Flow bản đồ mới:** thiên hà = domain, hành tinh = nghề. **Bỏ hệ sao và đường nối**, toạ độ hành tinh tính từ skill. Góc nhìn từ trục z. Profile = nhật ký trải nghiệm. Tách **domain point / skill point**, có achievement và biểu đồ thống kê | 18/9 → 20/9 | 🎮 Nam 18/9 23:36 và 20/9 13:41 | 💡 chưa chốt. Bản 18/9 còn "hệ sao → carousel hành tinh", bản 20/9 bỏ hệ sao |
| D-36 | Cân nhắc **mức độ trưởng thành nghề nghiệp** (career maturity) để chia level cho game | 19/9 | 🎮 nhận xét của cô (Nam ghi 20/9) | 💡 |

## E. AI & đánh giá

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-40 | **AI là engine lõi:** sinh scenario từ **seed do người viết**, dẫn truyện và thích ứng theo lựa chọn, chấm câu trả lời | 3/9 | Kickoff S3; deck 7/9 S5 | ✅ (**chưa cài**: code đang chấm bằng từ khoá) |
| D-41 | Giám sát AI: **human-in-the-loop khi soạn** (người viết seed), **human-on-the-loop khi chạy** (AI tự chạy từng lượt, chất lượng kiểm bằng bộ chuẩn offline) | 7/9 | Deck 7/9 S10 (cô yêu cầu nói rõ) | ✅ |
| D-42 | **Không nội dung nào tới người dùng nếu chuyên gia chưa duyệt** (BR-05). Sửa seed thì mọi bản sinh từ seed đó bị huỷ và sinh lại | 18/9 | BR-05; Hình 5.2 | ✅ |
| D-43 | **Mô hình chấm phải khác họ với mô hình sinh** (BR-09), để tránh model tự khen bài của chính nó | 18/9 | BR-09; FR-20 | ✅ |
| D-44 | Đánh giá **offline** bằng **bộ chuẩn IT do chuyên gia duyệt**. Đo riêng 2 thứ: chất lượng sinh và độ khớp khi chấm (**Cohen's κ, chia theo độ khó**). Không làm user study lớn | 3/9 → 18/9 | Kickoff S6; deck 7/9 S13; deck 18/9 S28 | ✅ |
| D-45 | Kết quả chấm **chỉ để người học tự tham khảo**: không gửi nhà tuyển dụng, không dùng quyết định cơ hội nào (BR-06). Phải thể hiện cả mặt xấu của nghề (BR-07) | 18/9 | BR-06, BR-07 | ✅ |

## F. Dữ liệu nghề

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-50 | Taxonomy **78 role IT / 6 domain**, xếp 4 archetype (A = có tuyển fresher, B = chuyển ngang, C = đích đến, D = lai). Nhãn tin cậy A_VERIFIED / B_TITLE_SEEN / C_INFERRED. **Thiếu dữ liệu thì ghi `unknowns`, không suy diễn** | 22/8 | `_archive/occupation-data/`: `pass0-archetype-triage.md`, `spec-pass1-KHOI1-fixed.md`, `output/REPORT.md` | ✅ |
| D-51 | **Khử bias JD:** lấy skill và lương từ khảo sát tự khai của người làm nghề (**ITviec IT Salary Report 2025–26**, n = 1.839) thay vì từ JD công ty | 27/8 → 10/9 | 🎮 minutes 27/8 ("bias do đọc JD"); `README_DATASET.md` (đã xoá, còn trong commit `6652636`) | ✅ |
| D-52 | Lọc role phổ biến, gộp role ít khác biệt, **giữ cột similar role khi gộp** → **22 role** cho graph, **18 role chơi được** | 23/8 → 10/9 | 🎮 minutes 23/8; 💬 26/8; `roles_18_playable.csv` | ✅ |
| D-53 | Có 97 sự kiện role-play (7 chung + 90 riêng), đo trên **8 chiều fit** (DEEP_WORK, PRESSURE, PEOPLE…). **Hệ sự kiện này và hệ kịch bản chưa được hợp nhất** | 10/9 | `README_DATASET.md` (đã xoá, còn trong commit `6652636`); spec "CÒN THIẾU #4" | ⚠️ |

## H. Thương hiệu & cách làm việc

| ID | Quyết định | Ngày | Nguồn | Trạng thái |
|---|---|---|---|---|
| D-70 | **Logo v2:** ngôi sao dẫn đường 8 cánh, kiêm tên lửa, có quỹ đạo và vòng la bàn (thay ngôi sao 4 cánh ở kickoff) | 7–8/9 | Deck 7/9 S3; 💬 8/9 | ✅ |
| D-71 | Tên sản phẩm: mọi file nộp cô dùng **JobQuest**, nhưng app đang hiển thị **"Vào Nghề"** (`index.html`, màn đăng nhập) | 18/9 | code | ⚠️ |
| D-72 | **Gặp cô mỗi tuần** (chọn ngày 5/9). Slot đăng ký là chiều T7 (16h, từ 19/9 đổi thành 17h). Riêng tuần 7/9 gặp vào T5 10/9 lúc 17h | 30/8 → 14/9 | 💬 | ✅ |
| D-73 | Thảo luận trên Discord. Task và minutes ghi ở kênh `#weekly-minutes`. Tài liệu đẩy lên repo, chia theo tuần | 25/7, 6/8 | 💬 | ✅ (từ 21/9: ghi vào `docs/project-hub/`) |

---

## Mẫu thêm quyết định mới

```
| D-xx | <quyết định, 1–2 câu> | <ngày> | <link Discord / commit / file> | ✅/⚠️/💡 |
```
Khi một quyết định bị thay: **đừng xoá dòng cũ**. Đổi trạng thái sang ♻️ và ghi "thay bởi D-yy".
