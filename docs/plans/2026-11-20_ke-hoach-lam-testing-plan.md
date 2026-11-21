# Kế hoạch làm testing plan theo ERD Chen và research

Ngày: 20/11/2026. Trạng thái: **đề xuất**, chờ nhóm duyệt. Đây là kế hoạch _để soạn_ testing plan. **Testing plan đã soạn xong ở [2026-11-20_testing-plan.md](2026-11-20_testing-plan.md)** (file chiến lược) và thư mục [2026-11-20_testing-plan/](2026-11-20_testing-plan/) (12 file ca kiểm theo nhóm ERD). Quy ước ID ở mục 2 và các bước ở mục 3 của file này là bản nháp đầu; khi lệch thì theo file chiến lược (ID `TC-<nhóm>-<kỹ thuật>-<nn>`, thẻ theo khuôn IEEE 829).

Căn cứ: `reports/master/plantuml/erd/ERD_JobQuest_Chen.puml` (commit `d081bb9`, thay ERD-00…11 ngày 18/11), `research/reports/*.md`, `reports/master/report.md` §4.3.2–4.3.4 và Chương 7, `docs/project-hub/02-quyet-dinh.md`, `07-van-de-mo.md` (A27, A28).

## 1. Vì sao cần làm lại testing plan

- **Thiết kế dữ liệu vừa đổi hẳn.** ERD mới là một sơ đồ Chen gồm 12 nhóm (A–L), 104 entity, 236 relationship, 27 thuộc tính dẫn xuất (`<<derived>>`), vẽ theo research và mô hình "màn" của Seed scenario. Mọi ca kiểm viết theo ERD-00…11 cũ đều phải rà lại.
- **Code lệch thiết kế.** A28(4): Prisma hiện tại chưa có bảng nào của sơ đồ mới; các bảng explorer (`GameProfile`, `ScenarioRun`, `*Doc`…) và bảng ERD-01…04 đã migrate ngày 12/11 đều lệch. Testing plan phải kiểm **theo thiết kế**, không lấy prototype làm chuẩn.
- **Chương 7 chỉ phủ một phần.** Report đã có Lighthouse (NFR-13, NFR-19), k6 (năng lực §5.3.1) và phương pháp đánh giá AI (§7.3, ngưỡng cố định trước khi chạy model). Chưa có kiểm thử chức năng theo FR/DR, chưa có kiểm luật game của research, chưa có kiểm toàn vẹn dữ liệu theo ERD.
- **Hiện trạng test:** khoảng 109 file test (api 29, web 38, staff 15, game-core 13, ui 14), đều là unit/component. Không có E2E. CI có `DATABASE_URL` nhưng không dựng Postgres hay Redis, nên chưa có test tích hợp với DB, queue hay SSE. Một số test api nằm trong code chết (`app/skills`, `app/career-graph`).

## 2. Nguyên tắc cho testing plan (đề xuất)

1. **Mỗi ca kiểm truy được về nguồn.** ID ca kiểm `TC-<nhóm ERD>-<số>` (ví dụ `TC-K-03`), ghi kèm FR/NFR/DR/BR, entity hoặc relationship ERD, luật research (file + mục) và D-ID.
2. **Mỗi ca kiểm có một trong bốn trạng thái:**
   - **Chạy được:** code hiện có đã đúng thiết kế ở phần này.
   - **Chờ hiện thực:** thiết kế đã chốt, code chưa có hoặc đang lệch. Viết trước ca kiểm làm tiêu chí nghiệm thu.
   - **Chặn – chờ chốt:** dựa trên mục `[CAM]`/`[VANG]` của ERD hoặc mục "Cần chốt" của research. Chỉ ghi ý định, không viết kỳ vọng cụ thể.
   - **Chặn – mâu thuẫn:** hai nguồn nói khác nhau (mục 6). Không viết cho tới khi nhóm chọn.
3. **Số chưa chốt thì kiểm bất biến, không kiểm giá trị.** Giá cửa hàng (C5), mức hồi sức khoẻ (S3), số mức thân (N2), tiền khi chơi lại (K5): tham số hoá; ca kiểm kiểm quan hệ (trần, không âm, không tụt), không kiểm con số.
4. **Không có đường không AI (D-92).** `AI_MODE=fake` chỉ dùng ở unit/integration để kiểm luồng (queue, sự kiện, failover, provenance). Chất lượng AI chỉ đo bằng phương pháp §7.3, không bằng script chấm thay.
5. **DB test chạy trên Postgres local `:5433`** (`infra/local/dev-stack.yml`) hoặc service trong CI, không chạy trên DB dùng chung trong `.env`.
6. **Không sửa thiết kế để test qua.** Ca kiểm lộ ra chỗ thiết kế thiếu hoặc sai thì ghi vào 07, không tự đổi ERD/report.

## 3. Các bước làm

| Bước | Việc                                                                                                                                                             | Đầu ra                                                         | Ước lượng  |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------- |
| B1   | Ma trận truy vết: duyệt 12 nhóm ERD; mỗi entity/relationship ghi FR/DR, luật research, D-ID, model Prisma tương ứng (nếu có) và mức lệch                         | Bảng truy vết (CSV hoặc bảng markdown)                         | 1 ngày     |
| B2   | Rút bất biến kiểm được: đọc phần "Đề xuất"/"đã chốt" của từng research report, đối chiếu ERD; khởi đầu từ danh sách ở mục 5                                      | Danh sách bất biến có nguồn, gắn trạng thái (mục 2.2)          | 1–1,5 ngày |
| B3   | Gán tầng kiểm cho từng bất biến theo kiến trúc (mục 4)                                                                                                           | Cột "tầng" trong ma trận                                       | 0,5 ngày   |
| B4   | Ghép phần phi chức năng: dẫn chiếu Ch7 (không viết lại), bổ sung NFR chưa có kế hoạch kiểm (mục 4, dòng cuối)                                                    | Mục NFR của testing plan                                       | 0,5 ngày   |
| B5   | Dữ liệu kiểm: fixture vàng từ `Seed mẫu Back-end L3 m2` (bản 4), factory cho entity ERD, explorer giả cho k6 và mô phỏng gợi ý nghề, probe set §7.3              | Danh mục fixture, chỗ đặt trong repo                           | 0,5 ngày   |
| B6   | Môi trường và CI: Postgres + Redis service trong `ci.yml`, tách target `test` (unit) và `test-integration`; đề xuất công cụ E2E (dependency mới, cần nhóm duyệt) | Đề xuất thay đổi CI                                            | 0,5 ngày   |
| B7   | Ưu tiên và lịch: xếp theo rủi ro × mức đã chốt; gắn task ID khi nhóm phân việc                                                                                   | Bảng ưu tiên                                                   | 0,5 ngày   |
| B8   | Viết testing plan hoàn chỉnh, đưa nhóm duyệt; nếu vào report thì đặt theo quyết định ở mục 7                                                                     | `docs/plans/…_testing-plan.md` (và/hoặc mục trong `report.md`) | 1 ngày     |

## 4. Tầng kiểm gắn với kiến trúc

| Tầng                             | Kiểm gì                                                                                       | Công cụ hiện có                       | Ví dụ bất biến                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `game-core` unit, property-based | Luật thuần: fold sự kiện, chấm 0/1/2, band, kinh tế, sức khoẻ, mở khoá nghề, gợi ý            | vitest                                | Fold cùng chuỗi sự kiện ra cùng state ở browser và server; trần buff +50% với mọi tổ hợp vật phẩm       |
| Validator nội dung               | Luật soạn seed (Luật dẫn truyện A1–A13), lint hồ sơ NPC (§9.5–9.6), schema seed               | vitest/jest, script `occupation-data` | Mỗi lựa chọn có người đáp lại (A6); câu mẫu NPC không có chữ số                                         |
| API integration (DB thật)        | Ràng buộc ERD, transaction, quyền, SM-01, append-only                                         | jest + Postgres                       | Mỗi chuyển trạng thái ghi `LIFECYCLE_LOG` trong cùng transaction; ghi vào release đã publish bị từ chối |
| Worker, queue, SSE               | Nộp lượt không gọi model, job vào queue, kết quả về qua SSE, failover, sổ chi phí             | jest + Redis, `AI_MODE=fake`          | Request nộp câu trả lời trả về trước khi có `MODEL_CALL` nào                                            |
| Frontend component               | Màn explorer, staff; tiếng Việt; công bố AI (NFR-07)                                          | vitest + Testing Library              | Mỗi màn có nội dung AI hiện nhãn công bố                                                                |
| E2E                              | Luồng UC chính: GTKM → bản đồ → chơi màn → tổng kết; CA/DE soạn → duyệt → dựng                | chưa có                               | NFR-03: đóng trình duyệt giữa màn, mở lại tiếp đúng chỗ                                                 |
| Đánh giá AI                      | Theo §7.3.2 (kappa, probe, injection, latency, cost, failover)                                | Inspect AI (offline)                  | Không làm lại; testing plan dẫn chiếu                                                                   |
| Phi chức năng                    | Lighthouse, k6 (§7.1, §7.2); NFR chưa có kế hoạch: 03, 04, 05, 06, 07, 08, 10, 11, 15, 16, 17 | Lighthouse, k6                        | NFR-05: request gửi model không chứa tên, email, account ID                                             |

## 5. Danh sách bất biến khởi đầu (để B2 đối chiếu, chưa đầy đủ)

Trạng thái ghi theo hiểu biết hiện tại; B1/B2 phải kiểm lại với code.

| Nhóm ERD | Bất biến                                                                                                                                                                                                                  | Nguồn                                                      | Trạng thái dự kiến                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| A        | Một Google identity chỉ gắn một tài khoản; mỗi nghề đúng một CA và ít nhất một DE; mọi hành động tài khoản ghi `AUDIT_LOG`                                                                                                | DR-16, FR-40                                               | Một phần chạy được (ERD-01 cũ), phần còn lại chờ hiện thực                 |
| B, C     | Bản ghi import khớp mã nguồn O\*NET/ESCO; mỗi tiêu chí rubric trỏ tới một mục taxonomy; mỗi nghề thuộc đúng một vùng quan tâm                                                                                             | DR-01, DR-02, D-125                                        | Chờ hiện thực                                                              |
| C        | `KEYWORD` ↔ `ESCO_SKILL_GROUP`; `SKILL_TIER`, `TIER_NAME`, `CHECK_QUESTION`, `CONDUCT_FLAG`                                                                                                                               | D-120, Seed scenario E2                                    | Chặn: `[CAM]`, và mâu thuẫn M:N (mục 6)                                    |
| D, E     | Seed hợp lệ theo Luật dẫn truyện A1–A13 và Seed scenario khối 1, A–D, M; nút kết chỉ bấm được khi mọi nút giữa đã xảy ra (E7); câu hỏi thêm không vượt `followup_cap`                                                     | Luật dẫn truyện, Seed scenario                             | Một phần chạy được (`ContentValidator`, engine `shift/`); gói cấp `[VANG]` |
| F        | Mọi chuyển trạng thái SM-01 có log cùng transaction; release bất biến, có version; tối đa một lượt duyệt ACTIVE; mỗi review gắn `CRITERIA_VERSION`                                                                        | NFR-16, DR-13, DR-19, SM-01                                | Một phần chạy được; còn thiếu P5 (xuất bản)                                |
| G        | NPC chỉ biết trong vai (C2); xưng hô đổi theo quan hệ, giọng giữ nguyên; độ thân không tụt; nhiệm vụ phụ không chấm                                                                                                       | Hồ sơ NPC §9, D-133                                        | Chờ hiện thực; "không chấm" bị chặn bởi mâu thuẫn D-101                    |
| H        | GTKM không gọi AI; RIASEC tính lại được từ câu trả lời; làm lại thay hồ sơ cũ; cung hoàng đạo chỉ trang trí, không vào gợi ý                                                                                              | FR-04, DR-12, Hồ sơ người chơi F                           | Chờ hiện thực                                                              |
| I        | Mở nghề kề: độ phủ keyword ≥ 50% (30% nếu Sim ≥ 1,2) chỉ trên keyword đã đạt                                                                                                                                              | D-122, D-124                                               | Chặn: A27 chưa chốt                                                        |
| I, gợi ý | Ô khác ngành luôn có ≥ 1 nghề ở nhóm chưa ghé; đổi giới tính không đổi gợi ý; không xếp theo lương hay độ danh giá                                                                                                        | Gợi ý nghề §3, §4B                                         | Chờ hiện thực (mô phỏng 20–30 người chơi giả)                              |
| J        | `RUN_EVENT` chỉ ghi thêm; state bằng fold; output model là sự kiện có provenance, không tính lại; server là nguồn chân lý của điểm; chơi lại không cộng điểm quá trần; play-test không vào số liệu explorer               | §5.3.1, DR-06, DR-07, DR-11, D-116                         | Một phần chạy được (luồng `/runs`, `/shift-runs`); ca làm chưa chấm        |
| K        | Số dư = tổng sổ giao dịch, sổ chỉ ghi thêm; không chuyển xu giữa người chơi; không trừ xu làm phạt; mỗi màn tối đa một vật phẩm buff, tổng buff ≤ +50%; sức khoẻ trong 0–100; OT ≤ 2 lần mỗi màn; tối đa 3 thói quen nghề | D-133, Kinh tế và sức khoẻ khối 1–3, ERD `HAS_HABIT (0,3)` | Chờ hiện thực; giá, mức hồi chặn (`[CAM]`)                                 |
| L        | Mọi lần gọi model qua gateway và vào sổ chi phí; trần chi phí mỗi phiên; đánh giá nghề chỉ sau khi xong mọi cấp, đủ 5 tiêu chí; số tổng hợp ẩn dưới ngưỡng                                                                | NFR-11, DR-08, DR-10, NFR-06, ERD `SCORES_ATTR (5,5)`      | Một phần chạy được (gateway, FR-19); A26 còn mở                            |
| Mọi nhóm | Mỗi thuộc tính `<<derived>>` (27 chỗ, ví dụ `EXPLORER.balance`, `health_value`, `riasec_self`) tính lại được từ dữ liệu gốc                                                                                               | ERD                                                        | Chờ hiện thực; một ca kiểm cho mỗi thuộc tính                              |

## 6. Mâu thuẫn phải chốt trước khi viết ca kiểm liên quan

> **Đã gỡ theo research (20/11).** Theo yêu cầu của người dùng, năm điểm dưới đây (cộng thêm hint, điểm thời gian việc lớn, ngưỡng GTKM, số keyword mỗi nghề và buff cột mốc) được gỡ theo `research/`, kết quả ở bảng G-01…G-12, mục 12 của [file chiến lược](2026-11-20_testing-plan.md). Đây là cách đọc để viết ca kiểm, chưa phải quyết định của nhóm. Danh sách gốc giữ lại bên dưới để đối chiếu.

Lấy từ 07 A28(2) và A27:

1. Nhiệm vụ phụ: D-101 (chấm qua AI-5) và N5/D-133 (không chấm); Cơ chế game L756, L804 còn ghi có điểm soft skill.
2. Quy đổi mức A/B/C: Seed scenario E2 (A+B → 1) và `occupation-data/specs/spec-checklist-softskill.md` (A → 1, A+B hoặc C → 2).
3. `KEYWORD` ↔ nhóm ESCO: M:N (Cơ chế game l.748) hay một nhóm (ghi chú Bản đồ keyword).
4. FR-33 "một scenario mỗi task" và research "nhiều màn cùng việc"; FR-22, FR-35 lệch Seed scenario.
5. FR-07: bảng kề tĩnh hay tính theo người chơi (A27).

Các ca kiểm phụ thuộc những điểm này để trạng thái "Chặn – mâu thuẫn".

## 7. Câu hỏi cho nhóm trước khi bắt đầu

Người dùng đã trả lời câu 1 và 2 (20/11):

1. **Vị trí:** tài liệu riêng trong `docs/plans/` (không đưa vào `report.md`).
2. **Phạm vi:** toàn bộ ERD (nhóm A–L, kể cả phần chưa có code).
3. Ngoài ra "testing plan" được hiểu là kế hoạch theo kỹ thuật kiểm thử (black box, white box, grey box, kinh nghiệm), cấp kiểm thử, loại phi chức năng, kiểm tĩnh, hồi quy, contract, migration; ca kiểm viết theo thẻ IEEE 829.

Còn cần nhóm quyết (đã đưa thành đề xuất trong file chiến lược, mục 7, 10, 12.4):

1. Có thêm công cụ E2E (ví dụ Playwright) và service Postgres/Redis vào CI không? Đây là dependency và thay đổi CI mới.
2. Ngưỡng coverage đề xuất ở mục 7 của file chiến lược.
3. Xác nhận cách gỡ mâu thuẫn G-01…G-12 để thêm D-ID nếu đồng ý.
4. Ai phụ trách từng nhóm ERD khi viết test (ví dụ Phúc cho G, I, K vì là chủ game design)?
