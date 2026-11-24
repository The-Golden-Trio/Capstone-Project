# Testing plan JobQuest theo ERD Chen và research

Ngày: 20/11/2026. Trạng thái: **đề xuất, chờ nhóm duyệt**. Đây là file chiến lược; thẻ ca kiểm nằm ở thư mục [2026-11-20_testing-plan/](2026-11-20_testing-plan/) (12 file, mỗi file một nhóm ERD). Kế hoạch soạn tài liệu này nằm ở [2026-11-20_ke-hoach-lam-testing-plan.md](2026-11-20_ke-hoach-lam-testing-plan.md).

## 1. Phạm vi, nguồn, quy ước

**Phạm vi.** Toàn bộ ERD `reports/master/plantuml/erd/ERD_JobQuest_Chen.puml` (nhóm A–L), kể cả phần chưa có code. Testing plan kiểm **theo thiết kế**, không lấy prototype làm chuẩn: Prisma hiện tại chưa có bảng nào của ERD mới (07 A28(4)).

**Nguồn, theo thứ tự ưu tiên.**

1. `research/reports/*.md` (theo yêu cầu 20/11, research thắng khi lệch; xem mục 12).
2. Quyết định ✅ trong `docs/project-hub/02-quyet-dinh.md`.
3. ERD Chen, SM-01 (`reports/master/plantuml/SM-01_ScenarioLifecycle.puml`), UC-00 và activity/sequence trong `reports/master/plantuml/`.
4. FR/NFR/DR/BR/DC trong `reports/master/report.md` §4.3; Chương 7 cho phần đã đo.

Ghi chú: các tham chiếu class diagram (`CL-0x`) ở file nhóm theo tên file trong working tree ngày 20/11 (bản đang sửa, chưa commit: `CL-02_CatalogueAndImport` … `CL-08_SharedPlatform`). Nếu nhóm đặt lại tên, cập nhật các tham chiếu đó.

**ID ca kiểm.**

- `TC-<nhóm>-<kỹ thuật>-<nn>`, ví dụ `TC-K-BVA-01`. Kỹ thuật: `EP` (phân hoạch tương đương), `BVA` (giá trị biên), `DT` (bảng quyết định), `ST` (chuyển trạng thái), `UC` (use case), `GB` (grey box), `DU` (luồng dữ liệu def-use của thuộc tính dẫn xuất), `EG` (đoán lỗi), `CL` (checklist), `EX` (thăm dò), `NF` (phi chức năng), `BLK` (ca bị chặn, chỉ ghi mục tiêu và lý do).
- `WB-<nhóm>-<nn>`: mục tiêu white box (hàm/file, tiêu chí phủ).

**Bốn trạng thái của ca kiểm.**

| Trạng thái       | Nghĩa                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Chạy được        | Code hiện có đã đúng thiết kế ở phần này; viết test được ngay                                                                |
| Chờ hiện thực    | Thiết kế đã chốt, code chưa có hoặc lệch; viết trước làm tiêu chí nghiệm thu                                                 |
| Chặn – chờ chốt  | Dựa trên mục `[CAM]`/`[VANG]` của ERD hoặc "Cần chốt" của research; chỉ ghi ý định và lý do chặn, không ghi kết quả mong đợi |
| Chặn – mâu thuẫn | Hai nguồn lệch mà research chưa phân xử. Sau 20/11 không còn ca nào ở trạng thái này (mục 12)                                |

**Số chưa chốt thì kiểm bất biến, không kiểm giá trị.** Giá cửa hàng (C5), mức hồi sức khoẻ (S3), số mức thân (N2), tiền chơi lại (K5), hệ số giảm khi dùng hint: tham số hoá; ca kiểm kiểm quan hệ (trần, không âm, không tụt).

**Không có đường không AI (D-92).** `AI_MODE=fake` chỉ dùng để kiểm luồng (queue, sự kiện, failover, provenance). Chất lượng chấm của AI chỉ đo theo §7.3 của report.

**Mẫu thẻ ca kiểm** (IEEE 829 rút gọn); các file nhóm dùng đúng khung này:

```markdown
### TC-K-BVA-01 · Tên ca kiểm

- **Nguồn:** …
- **Cấp · loại · kỹ thuật:** …
- **Ưu tiên:** Cao | Vừa | Thấp
- **Tiền điều kiện:** …
- **Dữ liệu vào:** …
- **Các bước:** 1. … 2. …
- **Kết quả mong đợi:** …
- **Hậu điều kiện:** …
- **Tự động hoá:** đường dẫn spec (dự kiến) | thủ công
- **Trạng thái:** …
```

Ca white box (`WB-…`) thay "Dữ liệu vào, Các bước" bằng "Hàm/file, tiêu chí phủ, nhánh hoặc đường cần phủ". Ca bị chặn chỉ ghi mục tiêu, nguồn, lý do chặn.

## 2. Chiến lược theo bốn trục

### 2.1 Kỹ thuật thiết kế ca kiểm

| Họ          | Kỹ thuật                                      | Dùng khi                                     | Ví dụ trong dự án                                    |
| ----------- | --------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| Black box   | Phân hoạch tương đương (EP)                   | Đầu vào chia được thành lớp xử lý giống nhau | 9 định dạng câu hỏi, 4 bậc sức khoẻ                  |
|             | Giá trị biên (BVA)                            | Có khoảng, trần, bản số                      | Sức khoẻ 0–100, buff ≤ +50%, `HAS_HABIT (0,3)`       |
|             | Bảng quyết định (DT)                          | Nhiều điều kiện cùng quyết định một kết quả  | Mở nghề kề, ba ô gợi ý nghề, điều kiện mở chương NPC |
|             | Chuyển trạng thái (ST)                        | Đối tượng có vòng đời                        | SM-01, lượt duyệt, ghế judge                         |
|             | Theo use case (UC)                            | Kiểm luồng nghiệp vụ đầu cuối                | UC-E11 chơi một màn                                  |
| White box   | Phủ câu lệnh, phủ nhánh, phủ điều kiện, MC/DC | Hàm nhiều nhánh                              | `transitions.ts`, `judge-combine.ts`                 |
|             | Đường cơ sở (basis path)                      | Hàm có độ phức tạp cao                       | `shift/engine.ts` `step`                             |
|             | Luồng dữ liệu (def-use)                       | Giá trị dẫn xuất                             | 27 thuộc tính `<<derived>>` (mục 6)                  |
| Grey box    | API kèm kiểm ràng buộc trong DB (GB)          | Bất biến nằm ở lược đồ                       | Sổ chỉ ghi thêm, log cùng transaction, unique        |
| Kinh nghiệm | Đoán lỗi (EG), checklist (CL), thăm dò (EX)   | Chỗ dễ sai, chỗ có bộ QA sẵn                 | Bộ QA hồ sơ NPC §9, probe set §7.3                   |

### 2.2 Cấp kiểm thử

| Cấp          | Phạm vi                                                     | Công cụ hiện có                 |
| ------------ | ----------------------------------------------------------- | ------------------------------- |
| Unit         | Hàm thuần của `game-core`, service với mock/`memory-prisma` | vitest, jest                    |
| Integration  | API + Postgres + Redis + worker, `AI_MODE=fake`             | jest (cần dựng service, mục 10) |
| System / E2E | Luồng explorer và staff trên trình duyệt                    | chưa có (đề xuất Playwright)    |
| Acceptance   | CA/DE nghiệm thu, play-test FR-26, kiểm với người dùng      | thủ công                        |

### 2.3 Loại kiểm thử

- **Chức năng:** theo FR/UC (file nhóm).
- **Phi chức năng:** mục 8 (hiệu năng, bảo mật, tin cậy, truy cập, riêng tư, chi phí).
- **Đánh giá AI:** theo §7.3 của report; testing plan chỉ dẫn chiếu, không làm lại.

### 2.4 Kiểm tĩnh và kiểm gắn với thay đổi

Mục 9: kiểm tĩnh, hồi quy/smoke, contract, migration.

## 3. Ma trận kỹ thuật × nhóm ERD

Ô ghi kỹ thuật chính được dùng; cấp chính ở cột cuối.

| Nhóm | Nội dung                               | EP  | BVA | DT  | ST  | UC  | GB  | EG/CL | WB  | Cấp chính                          |
| ---- | -------------------------------------- | --- | --- | --- | --- | --- | --- | ----- | --- | ---------------------------------- |
| A    | Danh tính, phân công                   | ✔   | ✔   | ✔   | ✔   | ✔   | ✔   | ✔     | ✔   | Unit, integration                  |
| B    | Danh mục nghề, hồ sơ nghề              | ✔   | ✔   | ✔   |     | ✔   | ✔   |       |     | Unit, integration                  |
| C    | Tham chiếu, soft skill, keyword        | ✔   | ✔   | ✔   |     |     | ✔   | ✔     | ✔   | Unit                               |
| D    | Gói cấp                                | ✔   | ✔   | ✔   |     |     | ✔   |       | ✔   | Unit, integration                  |
| E    | Nội dung màn                           | ✔   | ✔   | ✔   |     | ✔   | ✔   | ✔     | ✔   | Unit (validator, engine)           |
| F    | Soạn, duyệt, xuất bản                  | ✔   |     | ✔   | ✔   | ✔   | ✔   |       | ✔   | Integration, E2E                   |
| G    | NPC, nhiệm vụ phụ, asset               | ✔   | ✔   | ✔   | ✔   |     | ✔   | ✔     | ✔   | Unit, checklist                    |
| H    | Hồ sơ explorer                         | ✔   | ✔   | ✔   |     | ✔   |     | ✔     | ✔   | Unit, mô phỏng                     |
| I    | Tiến trình                             |     | ✔   | ✔   | ✔   | ✔   | ✔   |       | ✔   | Unit, integration                  |
| J    | Lượt chơi, chấm                        | ✔   | ✔   | ✔   | ✔   | ✔   | ✔   | ✔     | ✔   | Unit, integration, E2E             |
| K    | Kinh tế, sức khoẻ                      | ✔   | ✔   | ✔   |     |     | ✔   |       | ✔   | Unit (property-based)              |
| L    | Chất lượng chấm, phản hồi, vận hành AI | ✔   | ✔   | ✔   | ✔   | ✔   | ✔   | ✔     | ✔   | Unit, integration, fault injection |

**Truy vết yêu cầu → nhóm ERD → file ca kiểm** (FR chưa nêu ở đây lấy theo bảng FR của report §4.3.2 và ghi ở file nhóm):

| Yêu cầu                                                       | Nhóm                   | Ghi chú                          |
| ------------------------------------------------------------- | ---------------------- | -------------------------------- |
| FR-01, FR-02, FR-40, FR-41                                    | A                      |                                  |
| FR-05, FR-17, FR-21, FR-30                                    | B                      |                                  |
| FR-31, FR-32                                                  | C, F                   |                                  |
| FR-09, FR-12, FR-22, FR-24, FR-33                             | D, E                   | FR-33 theo G-04                  |
| FR-23, FR-25, FR-26, FR-27, FR-34, FR-35, FR-36, FR-37, FR-38 | F                      |                                  |
| FR-16                                                         | G, J, K                |                                  |
| FR-03, FR-04, FR-18                                           | H                      | FR-03 theo G-06                  |
| FR-06, FR-07, FR-08, FR-15                                    | I                      | FR-07 theo G-08                  |
| FR-10, FR-11, FR-13, FR-14                                    | J                      | FR-13 theo G-07                  |
| FR-19, FR-20, FR-28, FR-29, FR-39, FR-42, FR-43               | L                      |                                  |
| Không có FR                                                   | K                      | Truy về D-133 và research (G-12) |
| NFR-01…19                                                     | mục 8 và các file nhóm |                                  |

## 4. Ca kiểm theo nhóm

Mỗi file nhóm có: FR/UC liên quan và trạng thái code; bảng lớp tương đương và biên; thẻ black box; mục tiêu white box; mục bị chặn.

| Nhóm | File                                                                                         | Số thẻ                               |
| ---- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| A    | [A-dinh-danh.md](2026-11-20_testing-plan/A-dinh-danh.md)                                     | 14 thẻ ca kiểm, 3 mục tiêu white box |
| B    | [B-danh-muc-nghe.md](2026-11-20_testing-plan/B-danh-muc-nghe.md)                             | 14 thẻ ca kiểm, 1 mục tiêu white box |
| C    | [C-tham-chieu-keyword.md](2026-11-20_testing-plan/C-tham-chieu-keyword.md)                   | 15 thẻ ca kiểm, 2 mục tiêu white box |
| D    | [D-goi-cap.md](2026-11-20_testing-plan/D-goi-cap.md)                                         | 8 thẻ ca kiểm, 1 mục tiêu white box  |
| E    | [E-noi-dung-man.md](2026-11-20_testing-plan/E-noi-dung-man.md)                               | 22 thẻ ca kiểm, 4 mục tiêu white box |
| F    | [F-soan-duyet-xuat-ban.md](2026-11-20_testing-plan/F-soan-duyet-xuat-ban.md)                 | 15 thẻ ca kiểm, 6 mục tiêu white box |
| G    | [G-npc-nhiem-vu-phu.md](2026-11-20_testing-plan/G-npc-nhiem-vu-phu.md)                       | 15 thẻ ca kiểm, 2 mục tiêu white box |
| H    | [H-ho-so-nguoi-choi.md](2026-11-20_testing-plan/H-ho-so-nguoi-choi.md)                       | 16 thẻ ca kiểm, 3 mục tiêu white box |
| I    | [I-tien-trinh.md](2026-11-20_testing-plan/I-tien-trinh.md)                                   | 10 thẻ ca kiểm, 2 mục tiêu white box |
| J    | [J-luot-choi-cham.md](2026-11-20_testing-plan/J-luot-choi-cham.md)                           | 22 thẻ ca kiểm, 8 mục tiêu white box |
| K    | [K-kinh-te-suc-khoe.md](2026-11-20_testing-plan/K-kinh-te-suc-khoe.md)                       | 17 thẻ ca kiểm, 1 mục tiêu white box |
| L    | [L-chat-luong-cham-van-hanh-ai.md](2026-11-20_testing-plan/L-chat-luong-cham-van-hanh-ai.md) | 19 thẻ ca kiểm, 5 mục tiêu white box |

Tổng: 187 thẻ ca kiểm (`TC-…`) và 38 mục tiêu white box (`WB-…`), đếm bằng `rg -c '^### TC-'` và `rg -c '^### WB-'` trên các file nhóm.

_24/11: thêm 7 thẻ sau khi rà report (SM-02, SD-10 và các NFR chưa có thẻ riêng): `TC-J-ST-02`, `TC-J-ST-03`, `TC-J-EG-03`, `TC-J-NF-03` (NFR-19), `TC-J-NF-04` (NFR-13), `TC-H-NF-01` (NFR-08), `TC-L-NF-05` (NFR-18)._

## 5. Use case testing

Mỗi use case chính có một ca UC ở file nhóm (cấp E2E hoặc system). Luồng chính, luồng phụ và luồng lỗi lấy từ activity diagram `AD-*` và sequence `SD-*` trong `reports/master/plantuml/`; thẻ ghi đúng ID diagram đã đọc. Danh sách use case theo vai:

| Vai           | Use case                                                                                                                                                                                                                                                                                                                                                 | Nhóm ca UC          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Explorer      | E01 đăng ký · E02 quản lý tài khoản · E03 GTKM · E04 chân dung · E05 khám phá nghề · E06 hồ sơ nghề · E07 nghề kề · E08 chọn scenario · E09 mô tả cấp · E10 nhiệm vụ phụ · E11 chơi màn · E12 ngữ cảnh · E13 xử lý hoạt động · E14 câu hỏi thêm · E15 hint · E16 báo nội dung sai · E17 đánh giá nghề · E18 lộ trình · E19 hồ sơ cá nhân · E20 góp ý app | A, B, G, H, I, J, L |
| Domain expert | D01 soạn · D02 sinh nội dung · D03 bộ tham chiếu · D04 duyệt · D05 tiêu chí · D06 xác nhận lại · D07 duyệt nội dung bị báo · D08 play-test · D09 độ tin cậy chấm · D10 chấm mù · D11 hồ sơ nghề                                                                                                                                                          | B, E, F, L          |
| Content admin | C01 nghề · C02 import · C03 tiêu chí duyệt · C04 mở scenario · C05 giao DE · C06 giao lại · C07 trình bày · C08 sinh asset · C09 xuất bản · C10 gỡ · C11 thống kê · C12 độ phủ · C13 yêu cầu xác nhận lại                                                                                                                                                | B, C, F             |
| System admin  | S01 tài khoản · S02 phân công · S03 nhật ký · S04 khoá · S05 xoá · S06 model · S07 chi phí · S08 chạy lại job · S09 phản hồi                                                                                                                                                                                                                             | A, L                |

Ghi chú: nhóm K không có use case riêng trong UC-00; ca kiểm nhóm K đi từ research (G-12).

## 6. Thuộc tính dẫn xuất: kiểm luồng dữ liệu

ERD đánh dấu 27 thuộc tính `<<derived>>`. Mỗi thuộc tính có một dòng kiểm "tính lại được từ dữ liệu gốc" (def-use: nơi định nghĩa giá trị, nơi dùng), gom trong thẻ `TC-<nhóm>-DU-01` của file nhóm chứa nó (nhóm B, C, D, E, G, H, I, J, K; nhóm A, F, L không có thuộc tính dẫn xuất).

| Entity hoặc relationship | Thuộc tính                                                                                                  | Nhóm |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ---- |
| EXPLORER                 | `zodiac_sign`, `balance`, `health_value`, `consecutive_ot`, `gap_slots_left`, `riasec_self`, `riasec_tried` | H, K |
| OCCUPATION               | `difficulty_tier`, `is_senior_entry`                                                                        | B    |
| OCCUPATION_LEVEL         | `xu_per_mission`, `main_mission_count`, `side_quest_budget`                                                 | B    |
| REQUIRES_PRIOR           | `min_band`                                                                                                  | B    |
| REQUIRES_KEYWORD         | `max_proficiency`                                                                                           | C    |
| BUDGETS                  | `is_focus`, `required_tier`                                                                                 | C    |
| LEVEL_PACK               | `onboarding_slides`                                                                                         | D    |
| SCENARIO                 | `estimated_minutes`                                                                                         | E    |
| SUGGESTION_EVENT         | `scored_scenarios`                                                                                          | H    |
| LEVEL_ENROLMENT          | `onboard_kind`                                                                                              | I    |
| SCENARIO_BEST            | `replay_pay_rate`                                                                                           | I    |
| SCENARIO_RUN             | `time_budget`, `health_tier`, `buff_total`                                                                  | J, K |
| GAP                      | `slots_used`                                                                                                | K    |
| KNOWS                    | `intimacy_level`, `chapters_done`                                                                           | G, K |

Chủ sở hữu của `min_band`, `max_proficiency`, `is_focus`, `required_tier` lấy theo vị trí trong file ERD (dòng 178 trong `REQUIRES_PRIOR`; dòng 283 trong `REQUIRES_KEYWORD`; dòng 299 và 300 trong `BUDGETS`); cần kiểm lại khi viết test.

## 7. Tiêu chí phủ white box (đề xuất)

Chưa project nào đặt ngưỡng coverage và CI không bật coverage (khảo sát 20/11). Đề xuất, chờ nhóm chốt:

| Đối tượng                                                       | Tiêu chí         | Ngưỡng đề xuất                                      |
| --------------------------------------------------------------- | ---------------- | --------------------------------------------------- |
| `packages/game-core` (hàm thuần)                                | Phủ nhánh        | ≥ 85%                                               |
| Guard SM-01, luật mở khoá, luật OT, buff                        | MC/DC            | Mọi điều kiện độc lập ảnh hưởng quyết định          |
| `shift/engine.ts` `step`                                        | Đường cơ sở      | Một ca cho mỗi đường độc lập trong bảng ở `WB-J-01` |
| Service API nhiều nhánh (`auth`, `review`, `lifecycle`, `play`) | Phủ nhánh        | ≥ 75%                                               |
| `ai/gateway`, `ai/judge`                                        | Phủ nhánh        | ≥ 90% (đã có nhiều spec)                            |
| Giá trị dẫn xuất                                                | def-use          | 27/27 thuộc tính có ca                              |
| Chất lượng bộ test                                              | Mutation testing | Tuỳ chọn, chạy thử trên `game-core`                 |

Cấu hình coverage đã có sẵn (v8, vitest; jest `coverageDirectory`), chỉ thiếu `collectCoverageFrom`, ngưỡng và bước CI.

## 8. Phi chức năng

Thẻ cụ thể nằm ở file nhóm liên quan (ký hiệu `NF`); mục này là tổng hợp.

| Loại               | Nội dung                                                                                                                                                           | Yêu cầu                        | Nhóm    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ------- |
| Hiệu năng          | k6 load, stress, soak; dẫn chiếu §7.2; thêm kịch bản nộp lượt → queue → SSE                                                                                        | NFR-01, NFR-02                 | J, L    |
| Bảo mật            | Mật khẩu salted hash; Bearer và refresh xoay vòng; phiên hết hạn; phân quyền theo vai và nghề; prompt injection; khử định danh trước lời gọi model; xoá tài khoản  | NFR-05, NFR-17                 | A, J, L |
| Tin cậy, tiêm lỗi  | Model lỗi hoặc hết giờ thì chuyển model cùng vai; hết model thì tạm dừng giữ tiến độ, báo trong 10 s; đóng trình duyệt giữa màn rồi tiếp tục; worker chết giữa job | NFR-03, NFR-04                 | J, L    |
| Khả dụng, truy cập | WCAG 2.1 AA gồm audit tự động và thủ công (bàn phím, screen reader); mobile, mạng chậm (dẫn chiếu §7.1); tiếng Việt đủ chữ; công bố AI                             | NFR-19, NFR-13, NFR-08, NFR-07 | H, J    |
| Riêng tư số liệu   | Ẩn số tổng hợp dưới ngưỡng; play-test không vào số liệu tổng hợp                                                                                                   | NFR-06, DR-11                  | F, L    |
| Khả dụng           | Giám sát uptime dịch vụ explorer, số khả dụng theo tháng so với mục tiêu cấu hình, báo trước bảo trì                                                               | NFR-18                         | L       |
| Chi phí            | Trần chi phí mỗi phiên                                                                                                                                             | NFR-11                         | L       |
| Bảo trì, truy xuất | Nghề mới không cần sửa code; log trạng thái đầy đủ; nội dung đã xuất bản bất biến                                                                                  | NFR-10, NFR-15, NFR-16         | E, F    |

## 9. Kiểm tĩnh, hồi quy, contract, migration

**Kiểm tĩnh.** Lint, typecheck, `nx format:check` (đã có trong CI); review theo checklist kiến trúc §5.3.1 của report. Validator nội dung (`ContentValidator`, `lintSeed`) và lint hồ sơ NPC là kiểm tĩnh trên **dữ liệu** seed.

**Hồi quy.**

- Bộ smoke chạy mỗi PR: đăng nhập, mở màn, nộp một lượt với `AI_MODE=fake`, một chuyển trạng thái SM-01.
- Bộ đầy đủ chạy trước khi merge vào `main`.
- Golden test: seed Back-end L3 m2, `npc-card-goldens`.
- Mỗi lỗi đã sửa thêm một ca kiểm lại.

**Contract.**

- API so với `openapi.yaml`; riêng `/shift-runs` là đề xuất ngoài openapi (`docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`), ghi rõ khi kiểm.
- Hợp đồng với nhà cung cấp model: `provider-contract.spec.ts` đã có.
- Schema zod dùng chung giữa web, staff và API.

**Migration** (chuyển Prisma hiện tại sang ERD mới; chưa có kế hoạch migrate nên mọi ca ở đây là _Chờ hiện thực_).

- Migrate lên chạy được trên DB có dữ liệu.
- Dữ liệu cũ (bảng ERD-01…04 đã migrate ngày 12/11, bảng prototype) được giữ hoặc chuyển đúng.
- Ràng buộc mới (unique, FK, bản số) có hiệu lực.
- Seed chạy lại được, không trùng.

## 10. Môi trường, dữ liệu, công cụ

**Đã có, dùng lại.**

| Thành phần                                             | Đường dẫn                                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Prisma giả trong bộ nhớ (unique `(runId, seq)`, P2002) | `apps/api/src/play/testing/memory-prisma.ts`                                                                      |
| Model giả ở tầng transport, server nhà cung cấp chặt   | `apps/api/src/ai/testing/` (`fake-model.ts`, `strict-provider.ts`, `sample-scene.ts`, `sample-turn.ts`)           |
| Checker và narrator giả                                | `packages/game-core/src/shift/testing/fakes.ts`, `fakeRules.ts`; `apps/api/src/ai/shift/fake.ts`                  |
| Fixture dữ liệu thật                                   | `packages/game-core/src/testing/fixture.ts`, `fixtures/npc-cast.v1.0.json`, `fixtures/npc-card-goldens.v1.0.json` |
| Seed ca làm                                            | `occupation-data/seeds/SWE_BACKEND/L3.pack.json`, `L3.m2.json`                                                    |
| Dựng web test                                          | `apps/web/src/test/renderWithProviders.tsx`; backend demo `apps/web/src/api/demo/`                                |
| Chế độ AI giả                                          | `AI_MODE=fake` (`apps/api/src/config/env.ts`; production từ chối)                                                 |

**Chưa có, đề xuất (cần nhóm duyệt, vì thêm dependency hoặc đổi CI).**

- Service Postgres và Redis trong `.github/workflows/ci.yml`; tách target `test-integration`.
- Playwright cho E2E (dependency mới).
- Factory dữ liệu cho entity ERD.
- Bật coverage trong CI, đặt ngưỡng ở mục 7.

**Quy tắc môi trường.** Test DB chạy trên Postgres local `:5433` (`infra/local/dev-stack.yml`) hoặc service trong CI. Không chạy migrate hay seed lên DB trong `.env` vì đó là DB dùng chung.

**Code chết không tính phạm vi.** `apps/api/src/app/{skills,career-graph,persistence}` không có trong `AppModule`; các spec của chúng không đếm vào coverage mục tiêu.

## 11. Tiêu chí vào/ra, quản lý lỗi, rủi ro, ưu tiên

**Tiêu chí vào một đợt test:** thiết kế của phần cần kiểm đã chốt (không còn `[CAM]`) hoặc ca đã gắn nhãn _Chặn_; môi trường mục 10 sẵn sàng; fixture có sẵn.

**Tiêu chí ra:** mọi ca Ưu tiên Cao của nhóm đã chạy và đạt; không còn lỗi mức Cao mở; coverage đạt ngưỡng mục 7 cho phần có code; ca _Chờ hiện thực_ còn lại được liệt kê, không tính là đạt.

**Quản lý lỗi.** Mỗi lỗi ghi: ID ca kiểm, nhóm ERD, mức (Cao: mất tiến độ, sai điểm, lộ dữ liệu cá nhân, phá bất biến; Vừa: sai luật nhưng có đường vòng; Thấp: hiển thị, câu chữ), bước tái hiện, nguồn thiết kế bị vi phạm. Lỗi do **thiết kế thiếu hoặc sai** không sửa tài liệu thiết kế để khớp; ghi vào `docs/project-hub/07-van-de-mo.md`.

**Rủi ro.**

| Rủi ro                                                                                 | Giảm thiểu                                                                              |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Schema đổi theo ERD mới làm test tích hợp viết bây giờ hỏng                            | Viết ca ở mức hành vi, giữ lớp truy cập dữ liệu sau interface; ưu tiên unit `game-core` |
| Nhiều số còn "giữ tạm" (G2) đổi sau chơi thử                                           | Tham số hoá, kiểm bất biến (mục 1)                                                      |
| Chấm bằng model không lặp lại hoàn toàn                                                | Đo theo §7.3 (kappa, alpha), không kiểm bằng so sánh chuỗi                              |
| Judge tiếng Việt kém tin cậy (kappa khoảng 0,3 giữa các judge nhiều ngôn ngữ, Seed E2) | Cần bộ nhỏ có người Việt gắn nhãn trước khi tin thư viện câu hỏi                        |
| DE và CA ít thời gian nghiệm thu                                                       | Gom ca acceptance thành một buổi play-test có kịch bản                                  |

**Thứ tự ưu tiên viết và chạy.**

1. F, J, E: đã có code, rủi ro cao (vòng đời nội dung, lượt chơi, chấm).
2. A, L: quyền truy cập, chi phí, failover.
3. H, I, C, D, G: phụ thuộc dữ liệu research chưa nối vào runtime.
4. K: chưa có code; viết ca làm tiêu chí nghiệm thu, đến khi hiện thực mới chạy.

## 12. Mâu thuẫn đã gỡ theo research, và mục còn chặn

### 12.1 Nguyên tắc

Theo yêu cầu 20/11, mâu thuẫn được gỡ theo `research/`:

- Research thắng FR và D-ID cũ hơn.
- Giữa hai chỗ trong research, chọn chỗ mới hơn hoặc ghi "đã chốt".
- Dữ liệu do pipeline research sinh ra thắng câu ước lượng trong văn bản.

Đây là **cách đọc để viết ca kiểm**, không phải quyết định của nhóm. Testing plan không sửa `02-quyet-dinh.md`, ERD, SM-01 hay report; nhóm xác nhận thì thêm D-ID mới (CLAUDE.md §1).

### 12.2 Bảng gỡ

| #    | Mâu thuẫn                                                                                                                     | Chọn                                                                                                      | Căn cứ                                                                                                      | Ca kiểm bị ảnh hưởng |
| ---- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------- |
| G-01 | Nhiệm vụ phụ có chấm không: D-101 (qua AI-5) và Cơ chế game ("chủ yếu cho điểm soft skill", ở bảng "ý tưởng để thiết kế sau") | **Không chấm**; thưởng cố định từ quỹ 10% của cấp                                                         | Kinh tế và sức khoẻ (N5, Phúc chốt 4/11) và bảng cửa hàng nhóm 2; D-133                                     | G, J                 |
| G-02 | Quy A/B/C ra mức: Seed E2 và `occupation-data/specs/spec-checklist-softskill.md`                                              | **Seed E2**: A và B → 1; A, B và C → 2; còn lại → 0                                                       | Seed scenario E2 ("Quy ra mức"); E2 còn nháp nên thẻ gắn nhãn "nháp E2"                                     | C, E, J              |
| G-03 | `KEYWORD` ↔ nhóm ESCO: M:N hay một nhóm                                                                                       | **M:N**; mức của nhóm = lớn nhất trong nhóm; mỗi keyword lấy nhóm tốt nhất, không cộng                    | Cơ chế game, khối G ("Nhảy nghề tính theo nhóm kỹ năng"); ERD vẽ M:N                                        | C, I                 |
| G-04 | FR-33 "một scenario mỗi task" và mô hình màn                                                                                  | **Nhiều màn cùng việc**, tách bằng tổ hợp việc × keyword trọng tâm × loại tình huống, theo hai luật trùng | Seed scenario, Khối 1 (đã chốt)                                                                             | E, F                 |
| G-05 | FR-22 (DE chọn định dạng câu hỏi, hint) và FR-35 (trang phục, hình cảnh)                                                      | DE chọn định dạng trong seed, engine sinh hint; engine tính trang phục, CA chọn hình cảnh                 | Seed scenario D3, D4; Hồ sơ NPC §5; 07 A28(2)                                                               | E, F, G              |
| G-06 | FR-03 "5 nghề gợi ý" từ quiz                                                                                                  | GTKM ra **2–3 vùng nên thử** trong 6 vùng; gợi ý nghề theo ba ô khối E                                    | D-125; Cơ chế game khối C và E                                                                              | H                    |
| G-07 | FR-13 "hint hạ +2 xuống 0"                                                                                                    | **Giảm trọng số mức** của mục con; hệ số chốt khi chơi thử                                                | Seed scenario E1 mục 4 (đã chốt)                                                                            | J                    |
| G-08 | FR-07/DR-03 bảng kề tĩnh và luật theo người chơi (07 A27)                                                                     | **Theo người chơi** (D-122, D-124); bảng tĩnh nếu còn chỉ là cache theo cặp (suy ra)                      | Cơ chế game khối G; D-124                                                                                   | I                    |
| G-09 | Điểm thời gian việc lớn: Seed D2 (3) và Luật dẫn truyện A1 (5)                                                                | **5**                                                                                                     | Luật dẫn truyện bản 3, chốt 5/11, mới hơn Seed D2                                                           | E                    |
| G-10 | Số keyword mỗi nghề: văn bản "6–10" và ERD `(5,10)`                                                                           | **(5,10)**; ca biên kiểm 5 và 10                                                                          | `occupation-data/generated/keyword_map.json`: nghề `ONET-43-4031.00` có 5 keyword, bù bằng kỹ năng tuỳ chọn | C                    |
| G-11 | Buff cột mốc: C2 "đã chốt 4/11" và L3 còn trong bảng "Cần chốt"                                                               | **+5% một nhóm, không cộng dồn trong cùng nhóm**, nằm trong trần +50%                                     | Kinh tế và sức khoẻ, C2 và khối 3 mục 3; giá trị ở L3 trùng. Giá cột mốc (L1) vẫn mở                        | K                    |
| G-12 | Nhóm K không có FR                                                                                                            | Ca kiểm truy về D-133 và research                                                                         | Không sửa report                                                                                            | K                    |

### 12.3 Mục còn chặn vì research chưa chốt

Những mục này không phải mâu thuẫn nên không gỡ được. Thẻ tương ứng ghi trạng thái _Chặn – chờ chốt_.

| Mục                                                                                                                                              | Nguồn chờ chốt              | Nhóm |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------- | ---- |
| `DEPARTMENT` (353 bộ phận)                                                                                                                       | Hồ sơ NPC §5.7, §8          | B    |
| `CHECK_QUESTION`, `CONDUCT_FLAG`, `SOFT_SKILL_ITEM.consider_condition`                                                                           | Seed E2 (nháp)              | C    |
| `SOFT_SKILL_GROUP.onet_elements`                                                                                                                 | Cơ chế game B2              | C    |
| `SKILL_TIER` và `TIER_NAME` (35 tên bậc)                                                                                                         | Cơ chế game H5/D2           | C    |
| `followup_cap` (chưa có số)                                                                                                                      | Seed D4, FR-12              | D, E |
| `SCENARIO.outcomes`                                                                                                                              | Seed scenario "chưa chốt"   | E    |
| `OUTFIT_GROUP`, `DRESSES`, `FALLS_BACK_TO`                                                                                                       | Hồ sơ NPC (chờ duyệt)       | G    |
| `DISTRESS_TERM` (H4), `ACHIEVEMENT` (D3, khoảng 100)                                                                                             | Cơ chế game                 | H    |
| `CASTS` (vai cố định theo cấp, N4)                                                                                                               | Seed scenario (`[VANG]`)    | I    |
| Giá cửa hàng (C5), giá cột mốc (L1), hồi sức khoẻ (S3), số mức thân (N2), tiền chơi lại (K5), `CAREER_HABIT` (S6), `PLACES_DECOR`, `WARNED` (S5) | Kinh tế và sức khoẻ         | K    |
| Ngưỡng ẩn số tổng hợp (NFR-06, `RATING_MIN_RESPONSES` mặc định 5 chưa có nguồn)                                                                  | 07 A26                      | L    |
| Hệ số giảm trọng số khi dùng hint                                                                                                                | Seed E1 (chốt khi chơi thử) | J    |
| Ngưỡng ở G2 (60%, 50%/30%, k^1,4, trần 5 keyword mỗi cấp)                                                                                        | Cơ chế game, "giữ tạm"      | I    |

### 12.4 Còn lại cần nhóm xác nhận

- Các lựa chọn G-01…G-12 ở trên.
- Có thêm Playwright và service Postgres/Redis vào CI không (mục 10).
- Ngưỡng coverage ở mục 7.
- Ai phụ trách viết ca kiểm cho từng nhóm ERD.
