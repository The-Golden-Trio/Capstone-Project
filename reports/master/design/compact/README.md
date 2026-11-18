# Thiết kế gọn theo game design: ERD, class diagram NestJS, API

Bộ thiết kế thứ hai, dựng từ `research/` (cơ chế game, hồ sơ người chơi, seed scenario, luật dẫn truyện, NPC, kinh tế và sức khoẻ). Nó nằm cạnh bộ ERD-00…07, CL-00…07 và `api/openapi.yaml` hiện có, không thay chúng; nhóm chốt dùng bộ nào thì đổi `report.md` theo.

| Phần | File | Sinh từ |
|---|---|---|
| ERD 19 bảng, 1 trang A4 | `plantuml/erd/compact/ERD_JobQuest_Compact.puml` | viết tay |
| Class diagram NestJS (17 module) | `plantuml/class/compact/CL-00 … CL-07` | `gen_class.py` |
| Hợp đồng API (85 operation) | `api/compact/openapi.yaml` (OpenAPI 3.1) | `gen_openapi.py` |
| Swagger UI | `api/compact/swagger.html`: mở thẳng bằng trình duyệt (cần mạng để tải `swagger-ui-dist` từ unpkg) | `gen_openapi.py` |

Nguồn duy nhất cho class diagram và API là `nest-modules.yaml`: module, controller, route (`METHOD /path`, role), service, dependency, field của DTO vào (`dtos`) và ra (`views`). Sửa YAML rồi chạy:

```
python3 gen_class.py     # kiểm thiết kế module rồi vẽ CL-00…07
python3 gen_openapi.py   # sinh openapi.yaml và swagger.html
```

Cần `pyyaml`. Kiểm spec: `pip install openapi-spec-validator`, rồi `python3 -c "import yaml; from openapi_spec_validator import validate; validate(yaml.safe_load(open('../../api/compact/openapi.yaml')))"`.

## ERD: cách gom bảng

- **Bảng riêng:** dữ liệu tăng theo thời gian hoặc có bảng khác trỏ tới (run, run_turn, judgement, player_level, inventory, scenario_review, scenario_build, log).
- **Cột JSONB:** dữ liệu nhỏ, cố định, thuộc một dòng (7 nhóm soft skill, 22 NPC, keyword của người chơi, gói cấp, seed màn).
- **Danh mục cố định trong `game-core`, không có bảng:** 7 nhóm và 42 mục con soft skill, 18 thẻ Get to know me, 12 cung, món cửa hàng, thành tựu, 13 cờ chung.
- Bỏ bảng import O\*NET/ESCO: dữ liệu nghề dựng sẵn bằng `occupation-data/scripts` và nạp bằng lệnh `OccupationDataLoader`.

## Class diagram và API

| Sơ đồ | Module | Bảng |
|---|---|---|
| CL-01 | AuthModule, UserModule | user_account, auth_token, staff_assignment |
| CL-02 | CatalogueModule, ScenarioModule, LifecycleModule | occupation, occupation_level, npc, scenario |
| CL-03 | ReviewModule, PublishingModule | scenario_review, scenario_build |
| CL-04 | CareerModule, LifeModule | player_profile, player_level, inventory |
| CL-05 | PlayModule, AssessmentModule | run, run_turn, judgement |
| CL-06 | AiModule, FeedbackModule, MonitoringModule | ai_call, feedback |
| CL-07 | CoreModule, NotificationModule, GameCoreModule | audit_log, notification |

- **PlayModule** dùng đúng các route `/shift-runs` đã có trong `apps/api/src/play/shift-run.controller.ts` (đề xuất `docs/plans/2026-11-11_de-xuat-api-choi-ca-lam.md`), thêm `POST /shift-runs/{runId}/finish` để chấm điểm, trả xu, nâng bậc. Mọi thao tác trong ca đi qua `POST /turns` với `kind` (`action`, `say`, `choose`, `hint`, `overtime`, …).
- **CareerModule:** Get to know me (không AI), hồ sơ 7 nhóm, điều kiện vào cấp (bậc, độ phủ keyword ESCO, nghề đi trước D-121), random công ty, gợi ý nghề, thành tựu.
- **LifeModule:** xu, sức khoẻ và OT, cửa hàng, độ thân NPC. Nhiệm vụ phụ mở qua `POST /shift-runs` như mọi màn, nên LifeModule không import PlayModule.
- **AssessmentModule:** panel 3 judge trả lời câu có/không → mức 0/1/2 + cờ (D-116, D-132), cờ truyện (D-129), chấm mù của chuyên gia lưu chung bảng `judgement` với `rated_by`. Phạt chỉ áp vào câu viết đã chấm; dùng gợi ý không hạ điểm (quyết định 11/11).
- **ScenarioModule:** Domain Expert sửa một khối `seed` JSON, `SeedValidator` kiểm luật seed; không có endpoint AI sinh hay sửa nội dung (quyết định 11/11).
- Đăng nhập bằng bearer token (quyết định 11/11). Lỗi theo Problem Details (RFC 9457).

Generator kiểm trước khi vẽ: mỗi `METHOD /path` chỉ một route, mọi dependency đều được import hoặc export, không import thừa, không vòng import, mọi kiểu trả về có trong `dtos` hoặc `views`. `openapi.yaml` qua `openapi-spec-validator` (OpenAPI 3.1).

## Còn mở

- Kiểm định lại scenario đã publish (FR-27) chưa có trong bộ này.
- Sitemap và bảng trace chưa làm lại theo route mới.
- Cột `views` mô tả field ở mức hợp đồng; khi code NestJS, DTO class dùng `@nestjs/swagger` sẽ thay cho phần sinh tay này.
