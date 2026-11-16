# Dữ liệu explorer app cần từ API (đề xuất cho người làm API)

> **Trạng thái: ĐỀ XUẤT, chờ nhóm duyệt.** Viết 16/11/2026 khi làm lại giao diện explorer (nhánh `feat/explorer-ui-v0`).
>
> Không phải hợp đồng đã chốt. Nguồn: game design đã chốt (`research/reports/Hồ sơ JobQuest cơ chế game.md` khối A–G, `Seed scenario JobQuest.md`, `Luật dẫn truyện JobQuest.md`), `reports/master/api/openapi.yaml`, đề xuất API ca làm `2026-11-11_de-xuat-api-choi-ca-lam.md`.
>
> Kiểu dữ liệu đầy đủ ở `apps/web/src/api/types.ts`, interface ở `apps/web/src/api/port.ts`. Màn hình chỉ đọc qua interface đó; mỗi nhóm dịch vụ chuyển từ dữ liệu mẫu sang API thật bằng một dòng trong `apps/web/src/api/index.ts` (`HYBRID_SOURCES`).

## Hiện trạng nguồn dữ liệu của từng nhóm

| Nhóm (port.ts) | Endpoint đã có                                      | Giao diện đang dùng                                   | Còn thiếu để chuyển sang thật                                                                      |
| -------------- | --------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `auth`         | `/v1/auth/*`                                        | Thật                                                  | —                                                                                                  |
| `account`      | `/v1/me` + `/auth/account*` (prototype, 07 A25)     | Thật                                                  | `Me` thiếu `dateOfBirth`, `stage` (khối A); `PATCH/DELETE /me` của openapi                         |
| `catalogue`    | Chưa (prototype `/content/galaxy`)                  | Mẫu                                                   | `GET /occupations`, `GET /occupations/{code}` theo hình dạng bên dưới                              |
| `quiz`         | Chưa                                                | Mẫu                                                   | Get to know me theo khối C (18 thẻ ba mức + năm câu mục tiêu), không phải thang Likert của openapi |
| `progress`     | Chưa (prototype `/profile/*`)                       | Mẫu                                                   | Vào cấp, bản đồ đảo, hồ sơ người chơi bốn tab                                                      |
| `play`         | `/v1/shift-runs/*`, `/v1/stream`                    | Mẫu (engine game-core chạy trong trình duyệt, AI giả) | Mở lượt gắn với enrolment; câu "thích tới đâu"; chấm điểm ca làm                                   |
| `feedback`     | `/v1/occupations/{id}/ratings*`, `/v1/app-feedback` | Thật                                                  | `RatingForm` thêm nhãn hai đầu thang và tên nghề                                                   |

## Chỗ khác openapi.yaml và vì sao

| Chỗ              | openapi                                                                        | Giao diện cần                                                                                                                                                                                              | Căn cứ                            |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Danh mục nghề    | `DomainOnMap[]` (domain → occupations)                                         | 6 vùng → 23 nhóm → 221 nghề; mỗi nghề có `regionId`, `group`, `levelCount`, `playable`, `gate` (D-121), tiến độ của người chơi                                                                             | D-125, khối G                     |
| Hồ sơ nghề       | `downsides`, `careerPath`                                                      | Thêm việc hằng ngày theo cấp, lương theo nguồn, môi trường làm việc, ngành học, keyword ESCO, dòng ghi nguồn O*NET/ESCO                                                                                    | D-126, BR-07, giấy phép CC BY 4.0 |
| Cấp nghề         | `access`, `accessReason` enum                                                  | Thêm điều kiện vào cấp (bậc soft skill từng nhóm, keyword đầu vào), keyword đầu ra, `lockedReason` bằng lời                                                                                                | Khối G                            |
| Get to know me   | `QuizQuestion{scale}` + `QuizResult{scores, topType, portrait, suggestions≤5}` | 18 thẻ (cụm 1–2 theo trục, cụm 3 theo vùng), 3 mức; năm câu mục tiêu; kết quả: vạch "tự kể", 2–3 vùng nên thử, thẻ mục tiêu, tối đa 3 gợi ý có một dòng lý do. Không `topType`, không chân dung do AI viết | Khối C, E; D-107, D-108, D-125    |
| Bản đồ đảo       | `credit`, `creditThreshold`                                                    | Công ty random theo trọng số loại hình, 6 slide onboard, màn chính từ seed ca làm, nhiệm vụ phụ                                                                                                            | Seed khối G; D-119                |
| Hồ sơ người chơi | `PrivateRecord{attempts, competencies, awards}`                                | Bốn tab: 7 nhóm soft skill (điểm, bậc đã đạt, lịch sử theo scenario, phần cộng chòm sao), RIASEC hai vạch, mục tiêu, keyword theo mức, đang chơi kèm điều kiện cấp sau, thống kê, thành tựu, nhật ký       | Khối D, F, G                      |
| Tổng kết ca      | `ScenarioSummary`                                                              | Câu "thích tới đâu" **trước** khi hiện điểm (2–3 việc có gắn trục), điểm 0–100, kết cục, ba phần nhận xét (FR-07), điểm cộng trừ từng nhóm soft skill gồm phần chòm sao, lên bậc, keyword nhận được        | Khối B, G                         |

## Endpoint đề xuất thêm

| Method, path                                                              | Trả về (types.ts)   | Ghi chú                                                                               |
| ------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------- |
| `GET /v1/occupations`                                                     | `Catalogue`         | Có thể tách phần tiến độ sang `GET /v1/me/progress` để cache danh mục                 |
| `GET /v1/occupations/{code}`                                              | `OccupationProfile` | Nhận cả mã nghề lẫn uuid như ratings                                                  |
| `GET /v1/quiz/form`                                                       | `QuizForm`          | Nội dung thẻ thuộc vòng đời nội dung, không cứng trong code                           |
| `POST /v1/quiz/attempts` · `GET /v1/quiz/attempts/current`                | `QuizResult`        | Không gọi AI (FR-04)                                                                  |
| `DELETE /v1/me/about`                                                     | 204                 | Rút đồng ý, xoá phần kể về bạn (Luật 91/2025 Điều 24 khoản 3)                         |
| `POST /v1/enrolments` `{occupation, levelNo}` · `GET /v1/enrolments/{id}` | `IslandMap`         |                                                                                       |
| `POST /v1/enrolments/{id}/onboard-seen`                                   | 204                 |                                                                                       |
| `GET /v1/me/record`                                                       | `PlayerRecord`      |                                                                                       |
| `PUT /v1/me/goals` · `PUT /v1/me/pinned-achievements`                     | 204                 |                                                                                       |
| `POST /v1/shift-runs/{id}/reflection` `{answers, realism}`                | 204                 | Câu "thích tới đâu" và "màn này có giống thực tế không" tách hai câu (khối B)         |
| `GET /v1/shift-runs/{id}/summary`                                         | `RunSummary`        | Thêm `grade` khi chấm xong; đang chấm thì `status: PENDING`, kèm tin SSE `run.graded` |

## Việc nhóm cần quyết

1. Duyệt các hình dạng trên, hay giữ openapi rồi giao diện tự ghép.
2. Danh sách sở thích có sẵn (khối A) chưa có trong tài liệu; dữ liệu mẫu đang tạm soạn.
3. 35 tên bậc soft skill (D2) chưa chốt; giao diện hiện "Bậc n" và nhận `tierName` khi có.
4. Danh sách thành tựu (D3) chưa chốt; giao diện đang dùng danh sách mẫu ở chế độ dữ liệu mẫu.
