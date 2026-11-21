# Class diagram: domain (từ ERD Chen) và module NestJS

Bộ class diagram duy nhất của hệ thống, vẽ ngày 20/11 từ `plantuml/erd/ERD_JobQuest_Chen.puml` (ERD **không bị sửa**) và `research/`. Nó **thay** hai bộ cũ (`class/CL-00…07` vẽ ngày 6/11 và `class/compact/`). Cả hai nhóm file đều **sinh bằng script** rồi mới render, nên sửa nguồn rồi chạy lại, đừng sửa tay file `.puml`.

| Nhóm                                                                                               | File                                  | Nguồn                     | Script           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------- | ---------------- |
| Domain (UML OOP: thuộc tính, method, kế thừa, composition, aggregation, association class, bội số) | `plantuml/class/domain/CD-01 … CD-08` | ERD Chen + `domain.yaml`  | `gen_domain.py`  |
| Module NestJS (controller, service, processor, guard, port, DTO)                                   | `plantuml/class/CL-00 … CL-08`        | `nest-modules.yaml` + ERD | `gen_class.py`   |
| ERD tách 6 sơ đồ (`plantuml/erd/ERD-01 … ERD-06`, 21/11)                                           | A+L · B+C · D+E · F · G+K · H+I+J     | ERD Chen                  | `gen_erd.py`     |
| Hợp đồng API (`api/compact/openapi.yaml`, `swagger.html`)                                          | sinh lại 21/11 (109 operation)        | `nest-modules.yaml`       | `gen_openapi.py` |

```
python3 gen_domain.py [--types]   # đọc ERD, vẽ CD-01…08; --types in các cột chưa có kiểu riêng
python3 gen_erd.py                # tách ERD Chen thành ERD-01…06: entity vẽ đủ ở sơ đồ chủ, mượn sang sơ đồ khác chỉ còn key
python3 gen_class.py              # kiểm module (DI, import, route, sở hữu bảng) rồi vẽ CL-00…08
```

Cần `pyyaml`. Render: `java -jar plantuml.jar -tsvg plantuml/class/**/*.puml` (cần Graphviz `dot`).

`api/compact/openapi.yaml` và `swagger.html` đã sinh lại ngày 21/11 từ `nest-modules.yaml`: 109 operation. Mỗi operation có `x-status`: `approved` (50, có trong hợp đồng 11/11 `api/openapi.yaml`) hoặc `proposed` (59, lấy từ SD-05…09 và nhóm F của ERD, chờ nhóm duyệt); 58 route của hợp đồng 11/11 không còn trong thiết kế mới. `api/openapi.yaml` giữ nguyên làm lịch sử.

## Domain: cách đọc ERD Chen thành UML

ERD là nguồn duy nhất. Không thêm, bớt, đổi tên entity, quan hệ hay thuộc tính; tên lớp là tên entity viết PascalCase (`SCENARIO_SLOT` → `ScenarioSlot`), tên thuộc tính viết camelCase như Prisma.

| Chen                                                         | UML                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `entity`                                                     | class; `<<weak>>` thì nền xanh nhạt; `[CAM]` thì tô cam «pending A28»                       |
| `USER_ACCOUNT ->- o { EXPLORER, STAFF_MEMBER }`              | generalization `{overlapping, incomplete}`                                                  |
| quan hệ `<<identifying>>` có một chủ                         | composition ◆ (đầu chủ là whole)                                                            |
| weak entity có 2 chủ trở lên (`SCENARIO_BEST`, `ASSESSMENT`) | association thường tới từng chủ + ghi chú `{id = (…)}` (UML composition chỉ cho một chủ)    |
| quan hệ có thuộc tính                                        | association class (xanh lá) trên đường association                                          |
| quan hệ ba ngôi (`DRESSES`, `EARNED_KEYWORD`)                | diamond n-ngôi (+ association class khi có thuộc tính)                                      |
| quan hệ trong danh sách `aggregation` của `domain.yaml`      | aggregation ◇ (phần là entity mạnh, không chết theo tổng thể)                               |
| nhiều quan hệ `0..1` thay nhau trỏ tới một đích              | các association riêng + `{xor}` và ghi chú trên lớp chung (`LOGS_*`, `REVIEWS_*`, `TXN_*`…) |
| `<<multi>>` `<<derived>>` `<<key>>`                          | `attr : T [0..*]`, `/attr`, `{id}` hoặc `{partial id}`                                      |
| thuộc tính ghép `{…}`                                        | phẳng hoá thành `salary.enterpriseMin`                                                      |

Bội số: nhãn cạnh entity là cardinality của entity đó, `=` là tham gia toàn phần (cận dưới 1). Riêng 13 quan hệ trong `partners_reading` của `domain.yaml`, nhãn `(min,max)` đếm **số đối tác** của entity đứng cạnh nó (ví dụ `REQUIRES_KEYWORD`: một nghề có 5–10 keyword), nên đọc sang đầu bên kia; mỗi dòng ghi lý do.

Thứ ERD không có và `domain.yaml` thêm vào, đều ghi rõ nguồn:

- **Kiểu dữ liệu** suy từ tên cột (`*_at` → DateTime, `is_*` → Boolean…) và bảng riêng cho phần còn lại. Đây là **đề xuất**, không phải quyết định. Cột kiểu trạng thái chưa có giá trị trong ERD hay research ghi `String «enum?»`.
- **Enum** chỉ vẽ khi có nguồn (Prisma, SM-01, ghi chú ERD, hub).
- **Method** là luật nghiệp vụ kèm nguồn («D-113», «SM-01»…). Dữ liệu của lớp là model Prisma; luật thuần nằm ở `packages/game-core`, luật chạm DB nằm ở service sở hữu bảng (CL-0x).
- **OCL** cho ràng buộc chỉ có trong comment ERD (FR-40, N1…).

| Sơ đồ | Nhóm ERD                                                        |
| ----- | --------------------------------------------------------------- |
| CD-01 | A danh tính                                                     |
| CD-02 | B danh mục nghề, C dữ liệu tham chiếu, soft skill, keyword      |
| CD-03 | D gói cấp, E nội dung màn                                       |
| CD-04 | F soạn bằng AI, duyệt, trình bày, play-test, xuất bản, vòng đời |
| CD-05 | G NPC tarot, K kinh tế, sức khoẻ, lịch                          |
| CD-06 | H hồ sơ explorer, I tiến trình                                  |
| CD-07 | J lượt chơi và chấm                                             |
| CD-08 | L chất lượng chấm, phản hồi, vận hành AI                        |

## Module NestJS

19 module. Quy ước vẽ: association `-->` là constructor injection (controller giữ service), `..> Entity : «write»` là module **ghi** lớp domain đó, `..|>` là realization (port AI, guard), `Controller ..> DTOs` là kiểu vào/ra của route. Lớp ở sơ đồ khác vẽ dạng stub xám.

| Sơ đồ | Module                                         |
| ----- | ---------------------------------------------- |
| CL-01 | AuthModule, UserModule                         |
| CL-02 | CatalogueModule, ImportModule                  |
| CL-03 | ScenarioModule, LifecycleModule                |
| CL-04 | ReviewModule, PublishingModule                 |
| CL-05 | CareerModule, LifeModule                       |
| CL-06 | PlayModule, AssessmentModule, QualityModule    |
| CL-07 | AiModule, FeedbackModule, MonitoringModule     |
| CL-08 | CoreModule, NotificationModule, GameCoreModule |

`nest-modules.yaml` là nguồn: module, controller, route (`METHOD /path`, role), service, dependency, field của DTO vào (`dtos`) và ra (`views`), cùng `owns` (module) và `writes` (provider). `gen_class.py` kiểm trước khi vẽ (lỗi thì `exit 1`):

- mỗi `METHOD /path` chỉ một route; mọi kiểu trong chữ ký route có trong `dtos` hoặc `views`; mọi DTO có route dùng
- mọi dependency được provide trong module, export của module được import, hoặc là global; không import thừa; không vòng import; mỗi module nằm đúng một sơ đồ
- **sở hữu bảng:** mỗi entity và mỗi association class của ERD (113 entity và 35 association class) thuộc **đúng một** module; provider chỉ ghi cái module sở hữu; cái nào được sở hữu thì có provider ghi

Bảng sở hữu (module ghi) theo nhóm ERD:

| Phần ERD                                    | Module                                                           |
| ------------------------------------------- | ---------------------------------------------------------------- |
| A, trừ phân công                            | AuthModule (qua `AccountStore`, nơi duy nhất ghi bảng danh tính) |
| `ASSIGNED_TO`                               | UserModule                                                       |
| B, soft skill, bậc, NPC, trang phục (G)     | CatalogueModule (nạp bằng lệnh `OccupationDataLoader`)           |
| import O\*NET/ESCO, `KEYWORD`               | ImportModule                                                     |
| D, E, phỏng vấn, sinh nháp                  | ScenarioModule                                                   |
| `LIFECYCLE_LOG`                             | LifecycleModule                                                  |
| tiêu chí, duyệt, kiểm định lại              | ReviewModule                                                     |
| asset, trình bày, build, play-test, release | PublishingModule                                                 |
| H, I                                        | CareerModule                                                     |
| K, nhiệm vụ phụ                             | LifeModule                                                       |
| lượt chơi (J)                               | PlayModule                                                       |
| chấm (J)                                    | AssessmentModule                                                 |
| cờ nội dung, chấm mù, chấm lại              | QualityModule                                                    |
| prompt, model, job, lượt gọi                | AiModule                                                         |
| đánh giá nghề, góp ý app                    | FeedbackModule                                                   |
| `AUDIT_LOG`, `PLATFORM_SETTING`             | CoreModule                                                       |
| `NOTIFICATION`                              | NotificationModule                                               |

Thiết kế đã chốt ở đây (khác thiết kế cũ):

- **Sinh nháp bằng AI giữ theo ERD** (`EXPERT_INTERVIEW`, `GENERATION_RUN`, SD-05). Bản compact cũ ghi "không có endpoint AI sinh nội dung (quyết định 11/11)", nhưng `02-quyet-dinh.md` không có D-ID nào như vậy.
- **Prompt là bảng toàn cục** (`PROMPT_TEMPLATE` không gắn nghề trong ERD), nên route là `/staff/prompts`, không còn `/staff/occupations/{id}/prompts`.
- **Cờ nội dung** (`CONTENT_FLAG`) chuyển sang QualityModule; góp ý app chỉ còn ở `/admin/feedback`.
- **GameData** là ảnh chụp các bảng tham chiếu, dựng một lần lúc khởi động bằng factory provider; game-core không đọc DB.
- Tên AI trong thiết kế (`ModelGatewayService`, `ModelProvider`) khác code hiện có (`ModelGateway`, `ProviderAdapter`, adapter là object): giữ theo thiết kế, ghi ở 07 A29.

## Đối chiếu sequence diagram với method

Mỗi message trong SD-01…09 phải có method (hoặc được ghi là chưa có).

| SD  | Message                                                            | Method                                                                                          |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| 01  | Get current activity                                               | `ShiftRunController.getScene`                                                                   |
| 01  | Post answer, post follow-up answer                                 | `ShiftRunController.takeTurn` (`kind` = `choose`/`say`…)                                        |
| 01  | Validate with rules                                                | `RuleEngine.validateAnswer`                                                                     |
| 01  | Score answer, request assessment, enqueue assessment job           | `AssessmentService.recordClosed`, `requestGrading`                                              |
| 01  | Apply expert scores, apply hint cap                                | `RuleEngine.closedLevels`, `ScoringService.groupPoints` (gợi ý không hạ điểm)                   |
| 01  | De-identify answer                                                 | `DeIdentifierService.strip`                                                                     |
| 01  | Grade with rubric, combine judge scores                            | `JudgePanelService.grade`, `combine`                                                            |
| 01  | Decide on follow-up                                                | `NarrationProcessor.process` (việc `probe`)                                                     |
| 01  | Draft feedback note                                                | `FeedbackNoteProcessor.process`                                                                 |
| 01  | Check quotes verbatim, check output                                | `OutputCheckService.verifyQuotes`, `checkNarration`, `checkNote`                                |
| 01  | Store judge scores, grade, cost                                    | `GradingProcessor` (`JUDGE_RESULT`), `CostLedgerService.record`                                 |
| 01  | Publish follow-up, result, delay notice                            | `StreamService.publish`                                                                         |
| 01  | **Use default follow-up**                                          | **không có**: lệch D-92 (không có đường thay thế không dùng AI); thay bằng `TurnService.resume` |
| 02  | Request scenario summary, get private record                       | `ShiftRunController.finishRun`, `getSummary`; `ProfileController.getJournal`                    |
| 02  | Total activity scores, cap competency points                       | `ScoringService.sceneScore`, `groupPoints`                                                      |
| 02  | Combine feedback notes, publish notes ready                        | `SummaryService.finish`, `StreamService.publish`                                                |
| 02  | Unlock next level                                                  | `PlayerLevelService.completeIfDone`                                                             |
| 02  | Pick practice tasks                                                | `SideQuestService.eligible`                                                                     |
| 02  | Store progress, history, badges                                    | `ProfileService.applyRun`, `AchievementService.evaluate`                                        |
| 02  | **Pick ending by score**                                           | **không có** trong thiết kế mới (không còn khái niệm kết thúc theo điểm)                        |
| 03  | Get quiz questions, post answers                                   | `GetToKnowMeController.getCards`, `submitGetToKnowMe`                                           |
| 03  | Calculate RIASEC profile, set social index, label as self-reported | `GetToKnowMeService.submit` (`riasecSelf`)                                                      |
| 03  | Pick 5 closest occupations                                         | `SuggestionService.forPlayer`                                                                   |
| 03  | **Pick portrait for top type**                                     | **không có**: research đã bỏ `portrait_text`                                                    |
| 04  | Sign in, sign in with code, register                               | `AuthController.signIn`, `signInWithGoogle`, `register`                                         |
| 04  | Verify password hash, hash password                                | `PasswordService.verify`, `hash`                                                                |
| 04  | Verify ID token, exchange code                                     | `GoogleOAuthService.exchangeCode`                                                               |
| 04  | Find or create account, create account                             | `AccountStore.findByEmail`, `createExplorer`, `linkIdentity`                                    |
| 04  | Start session, log sign-in                                         | `TokenService.issue`, `AuditLogService.log`                                                     |
| 05  | Open scenario, save assignment                                     | `ScenarioController.openScenario`, `assignAuthor`                                               |
| 05  | **Get situation options**                                          | thay bằng phỏng vấn: `InterviewController.startInterview`                                       |
| 05  | Request generation, request revision                               | `GenerationController.requestGeneration`, `requestRevision`                                     |
| 05  | Save scenario details, run checks, submit                          | `SeedController.saveSeed`, `checkSeed`, `submitScenario`                                        |
| 05  | Check content rules                                                | `SeedValidator.check`                                                                           |
| 05  | Generate scenario content, revise requested part                   | `GenerationProcessor.process` → `ModelGatewayService.complete`                                  |
| 05  | Publish content ready, email author/reviewer                       | `StreamService.publish`, `NotificationService.notify`                                           |
| 06  | Get scenario for review, post review decision                      | `ReviewController.openReview`, `decideReview`                                                   |
| 06  | Check reviewer access                                              | `AccessPolicyService.isReviewerOf`                                                              |
| 06  | Check all criteria answered                                        | `ReviewService.decide`                                                                          |
| 06  | Set in review, set retired/draft/approved, log                     | `ScenarioStateMachine.apply` (`LIFECYCLE_LOG`)                                                  |
| 07  | Request suggestions, save presentation choices                     | `PresentationController.requestSuggestions`, `savePresentation`                                 |
| 07  | Suggest task types, NPCs, backgrounds                              | `SuggestionProcessor.process`                                                                   |
| 07  | Request asset, generate asset, check asset for bias                | `AssetController.requestAsset`, `AssetProcessor.process`, `AssetService.checkBias`              |
| 07  | Store checked asset                                                | `StorageService.putObject`                                                                      |
| 07  | Build draft game, load draft game                                  | `BuildController.buildDraftGame`, `getBuild`                                                    |
| 07  | Save findings, return to presentation/drafting, pass play-test     | `reportFindings`, `ScenarioStateMachine.apply`, `passPlaytest`                                  |
| 07  | Run game-core locally                                              | phía client (`GameCoreModule` chỉ dùng ở server)                                                |
| 08  | Publish scenario, compare with approved content                    | `ReleaseController.publishScenario`, `BuildSnapshotter.hash`                                    |
| 08  | Store release by version                                           | `StorageService.putObject` + `ReleaseService` (`SCENARIO_RELEASE`)                              |
| 08  | Set published on date                                              | `ReleaseScheduler.publishDueReleases`                                                           |
| 08  | Start scenario                                                     | `ShiftRunController.startRun`                                                                   |
| 09  | Start import, save record fixes, save adapted data                 | `ImportController.startImport`, `resolveIssue`, `saveAdaptation`                                |
| 09  | Look up source identifiers                                         | `ReferenceSourceClient.lookup`                                                                  |
| 09  | Match records to sources                                           | `ImportProcessor.process`                                                                       |
| 09  | Email domain experts                                               | `NotificationService.notify`                                                                    |

## Còn mở

- Kiểm định lại scenario đã publish (FR-27) mới có hai route đề xuất.
- `ScenarioStateMachine` chỉ có chuyển trạng thái cho scenario (SM-01); `LIFECYCLE_LOG` còn ghi gói cấp, nghề, chương NPC (07 A29).
- Sitemap và bảng trace chưa làm lại theo route mới.
- Cột `views` mô tả field ở mức hợp đồng; khi code NestJS, DTO class dùng `@nestjs/swagger` sẽ thay cho phần sinh tay này.
