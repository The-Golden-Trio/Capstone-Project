# Kiểm kê thiết kế AI · 19/10/2026

> Bước 1 của **T1910.2** (Nhật): gom mọi thứ đã có về AI trước khi viết §5.3.6 *Thiết kế mô hình AI* và mail xin cô xác nhận phạm vi.
> Nguồn đã đọc: quyết định D-40…D-49, D-67, D-80…D-98 ([02](../../02-quyet-dinh.md)); báo cáo bản 16/10 ([`report.md`](../../../../reports/master/report.md)) §2.5, §2.6, §4.1.2, §4.2.2, §4.3, §5.1.2, §5.2.3, §5.3.1; deck AI tuần 41; spec `occupation-data/specs/spec-scenario-KHOI1.md` v2.2 (Khối A, B); code `packages/game-core` (`grading/`, `followups.ts`, `sideQuestGrader.ts`, `scenarioEngine.ts`, `data/schema.ts`).
> Mọi chỗ ghi **đề xuất** là của bản kiểm kê này, chưa phải quyết định.

> **Ràng buộc (19/10):** flow gamify do Phúc đang làm, nên mọi thứ thuộc về game **chưa chốt**: thang chấm và nghĩa từng mức (M3), hết giờ (M5), profile lựa chọn (M13), kết cục SECRET (T8), sự kiện ngẫu nhiên (T9), nhiệm vụ phụ (T10), luật chọn kết cục, cách gộp điểm thành năng lực. **Cách xử lý đề xuất:** §5.3.6 thiết kế AI theo một *hợp đồng trừu tượng* không phụ thuộc game. Mọi câu tự luận, dù ở nhiệm vụ chính, sự kiện hay nhiệm vụ phụ, đều đi qua cùng một đường chấm AI-5: đầu vào là *tiêu chí kèm mô tả từng mức*, đầu ra là *mức kèm câu trích và lý do*. Game design quyết định có những tiêu chí nào, bao nhiêu mức, và điểm đó dùng để làm gì (mở kết cục, cộng năng lực…). Như vậy viết được thiết kế AI ngay, còn game chốt sau chỉ cần điền nội dung, không phải đổi kiến trúc.

## 1. Flow AI hiện tại trong một trang

```
SOẠN NỘI DUNG (không người chơi nào chờ)
  DE ──► AI-1 phỏng vấn ──► tri thức thô ──► AI-2 (cùng CA) dựng seed ──► DE đặt khoá chấm, mốc rubric, duyệt
                                                                              │
  AI-3 chạy lượt thử (AI-4 + AI-5) ◄───────────────────────────────────────────┘
  └─► xếp ca cần DE xem: judge lệch > 1 mức · lượt vi phạm luật · mẫu ngẫu nhiên kiểm mù ──► DE phán quyết, duyệt xuất bản

CHƠI (người chơi đang chờ)
  seed đã duyệt ──► engine giữ thứ tự canon event (không phải AI)
                    ├─ câu đóng: game-core chấm theo khoá của DE (không phải AI)
                    └─ tự luận: AI-4 viết lời nối + follow-up ──► luật kiểm lúc chạy (không phải AI)
  hết tình huống ──► AI-5: panel 3 judge, 3 họ model, ≤ 3 tiêu chí/lượt gọi, chạy nền, lấy trung vị
                    └─► kết quả + nhận xét + hướng cải thiện ở màn tổng kết

VÒNG PHẢN HỒI (đang rải rác, chưa thành một mạch trong báo cáo)
  ca bị cờ / người chơi báo sai ──► AI-3 ──► DE phán quyết ──► rubric phiên bản mới, ví dụ hiệu chỉnh cho judge
  log lượt chơi ──► model khác họ rà lại sau (D-89)
```

## 2. Mọi chỗ trong hệ thống có chạm tới AI

Báo cáo §5.2.3 chỉ nói "năm chỗ dùng AI", nhưng yêu cầu, use case, §5.3.1 và code nhắc tới nhiều chỗ hơn.

| # | Chỗ | Làm gì | Nguồn | Phân loại đề xuất |
|---|---|---|---|---|
| T1 | AI-1 | Phỏng vấn DE theo khung critical incident | §5.2.3, D-90 | Lõi, ĐACN ở mức thiết kế và bản thử (D-95) |
| T2 | AI-2 | Dựng seed từ lời DE, cùng CA | §5.2.3, D-90; FR-22, FR-23 (xem M9) | Lõi, mức thiết kế và bản thử |
| T3 | AI-3 | Chạy lượt thử, xếp ca cho DE | §5.2.3; FR-28 | Lõi, mức phép thử |
| T4 | AI-4, lời nối | Viết lời NPC nối giữa các canon event | §5.2.3, D-89; spec B2 | Lõi, làm thật |
| T5 | AI-4, follow-up | Hỏi đào sâu câu tự luận, trong trần theo cấp | FR-12, UC-E14; `followups.ts` (`followupCap`) | Lõi, làm thật |
| T6 | AI-5, chấm | Panel 3 judge, trích nguyên văn, lý do, mức | §5.2.3, D-91; FR-11, UC-E13 | Lõi, làm thật. Trọng tâm của RP-2 |
| T7 | Viết phản hồi | Điểm mạnh, điểm cần cải thiện, một mẹo cho lần sau, viết từ đầu ra của AI-5 | FR-14, UC-E11 bước 9; spec B6 (debrief) | Lõi, gắn với AI-5. **Chưa có thiết kế riêng** trong §5.2.3 |
| T8 | Nhận ra kết cục SECRET | Người chơi có tự nhận ra "lỗi thiết kế chờ sẵn" không | code `TextGrader.hitsSecret`; spec B5 | **Chưa có ở đâu trong báo cáo.** Đề xuất: một tiêu chí của AI-5, hoặc bỏ |
| T9 | Chấm câu trả lời sự kiện ngẫu nhiên | Cộng bằng chứng kỹ năng mềm | UC-E11 ngoại lệ 3; FR-15 | Chưa có thiết kế. Đề xuất: gộp vào AI-5 |
| T10 | Chấm nhiệm vụ phụ tự luận | Câu trả lời gần hướng nào nhất | code `sideQuestGrader.ts` (từ khoá, ghi "sẽ thay bằng AI") | Chưa có trong báo cáo. Đề xuất: phụ, ngoài phạm vi ĐACN |
| T11 | Chân dung RIASEC | AI viết đoạn mô tả từ hồ sơ RIASEC | FR-04, UC-E04 | Phụ, hỏi cô |
| T12 | Thiết kế trình bày | AI giúp CA biến nội dung đã duyệt thành màn chơi | FR-35, UC-C07 | Phụ, hỏi cô |
| T13 | Sinh hình | Model sinh ảnh cho thư viện tài sản, có kiểm thiên kiến | FR-36, UC-C08; §5.3.1 (image model) | Phụ, hỏi cô |
| T14 | Rà log sau | Model khác họ đọc lại log lượt chơi | D-89; §5.2.3 | Lõi (chốt kiểm thứ tư). Chưa có thiết kế chi tiết |
| T15 | Sinh không có seed | Đường so sánh của RP-1 | §4.2.2 | Chỉ dùng khi đánh giá, không chạy trong sản phẩm |
| — | Kiểm luật lúc chạy | Số và tên riêng phải có trong seed hoặc câu người chơi; đếm follow-up; trích dẫn là chuỗi con | D-89; §5.3.1 (game-core) | **Không phải AI**, là luật tất định. Cần nói rõ để thấy AI chỉ đặt ở chỗ cần |

## 3. Kiểm kê theo các đầu việc của §5.3.6

| # | Đầu việc | Đã có, ở đâu | Còn thiếu | Phụ thuộc |
|---|---|---|---|---|
| 1 | Định khung: hệ thống ghép nhiều LLM, không huấn luyện; bảng thẩm quyền AI và người; phần cố ý không dùng AI | Bảng "AI làm / người quyết" ở §5.2.3; nguyên tắc "AI drafts, connects, scores and filters" | Câu định khung "không huấn luyện model, vì sao"; danh sách phần cố ý không dùng AI | Cô xác nhận cách hiểu |
| 2 | Danh mục thành phần AI | §5.2.3 (5 thành phần) | Phân loại T1–T15 ở mục 2 | Cô xác nhận phạm vi T7–T13 |
| 3 | Hợp đồng và pipeline dữ liệu | Schema hiện tại trong code (`ActivitySchema`: `observes` 3 mốc, `hints`, `followup_goal`, `limitFollowup`, `optionGrade`); evidence có `quote` ở spec B3; run là chuỗi sự kiện chỉ ghi thêm (§5.3.1 DR-3) | Seed mới: canon event, fact bắt buộc, profile lựa chọn trên nhiều năng lực, rubric có mô tả từng mức; schema kết quả chấm của từng judge; schema phán quyết của DE; bộ đánh giá; ghim phiên bản (seed, rubric, prompt, model) cho từng lượt chơi | Game design (D-95) cho các trường chấm điểm |
| 4 | Thẻ thiết kế từng thành phần | Văn xuôi ở §5.2.3; giao thức lượt JSON ở spec B3 (đã cũ, xem M2) | Mỗi thành phần một thẻ: input, output, schema, cấu trúc prompt, ngân sách context, tham số decode, đồng bộ hay worker, luật kiểm, dự phòng | — |
| 5 | Thuật toán chấm và gộp điểm | Trung vị panel, cờ khi lệch > 1 mức (D-91); hint giảm trọng số (D-86); trần khi chơi lại (BR-11); mở cấp theo điểm (BR-02); sang nghề kề (BR-03) | Công thức có tham số (kiểu §5.3 của aBridgeAI): từ mức của từng judge → điểm tiêu chí → bằng chứng có trọng số → điểm năng lực có trần → mở khoá | Giá trị tham số chờ game design (D-95); công thức thì viết được ngay |
| 6 | Hạ tầng AI | Gateway, registry chặn trùng họ (DC-01), hàng đợi BullMQ, SSE, sổ chi phí (§5.3.1); Inspect AI cho chạy thử, module TypeScript trong sản phẩm (D-94) | **Quyết định adapter**: SDK riêng từng hãng hay một lớp tương thích OpenAI (§5.3.1 hẹn "quyết ở 5.2.3" nhưng 5.2.3 chưa quyết); định dạng file prompt và rubric dùng chung giữa Python và TypeScript; bảng giá và token cache (kiểu phụ lục C.15 của aBridgeAI) | — |
| 7 | An toàn và pháp lý | Ẩn danh trước khi gọi model; câu trả lời là dữ liệu phân tách, không phải lệnh (NFR-17); nhà cung cấp không lưu, không huấn luyện (NFR-05) | Cách ẩn danh câu tiếng Việt (tên người Việt, tên công ty); bộ thử prompt injection; chặn rò rubric ở đầu ra (spec B2 cấm lộ rubric); §5.3.10 chưa viết | Xem M19 |
| 8 | Hành vi khi lỗi | Chuyển model trong cùng vai; judge chuyển sang bậc khác cùng họ; không còn model thì tạm dừng phiên (§5.2.3, §5.3.1, NFR-04, D-92) | Trần số lần sinh lại khi không qua luật kiểm (M17); ý tưởng LLM local làm dự phòng (D-98, chỉ nêu) | — |
| 9 | Chi phí và độ trễ | Ngân sách độ trễ 4,6 s cho dẫn truyện, 7,6 s cho panel (§5.3.1); ước 0,015 và 0,086 USD mỗi lượt chơi (§5.2.3) | Số token giả định cho từng loại gọi (07 A21); tiếng Việt tốn token hơn tiếng Anh; NFR-02 lệch (M6) | — |
| 10 | Kế hoạch đánh giá | DE chơi thử và chấm, so với judge, QWK kèm khoảng tin cậy (D-93); bốn lớp lượt thử cho luật của AI-4 (§5.2.3); ngưỡng RP-1, RP-2 (D-48) | Khung phép thử đầu T0610.17 theo cách của aBridgeAI §7.4: phương pháp, chất lượng, độ trễ và chi phí, phân tích lỗi từng model, khuyến nghị; ai trả tiền gọi model | Cô xác nhận cỡ dữ liệu và phần cô kiểm |
| 11 | Vòng phản hồi chuyên gia | Từng mảnh: AI-3 xếp ca, rubric có phiên bản, ví dụ hiệu chỉnh "lấy từ phán quyết của DE" (§5.2.3), người chơi báo nội dung sai (FR-14, UC-E16) | Vẽ thành một vòng; luật khi rubric đổi: lượt chơi cũ có chấm lại không (aBridgeAI để chấm lại là hướng phát triển) | — |

## 4. Mâu thuẫn cần gỡ

| # | Bên A | Bên B | Đề xuất | Ai chốt |
|---|---|---|---|---|
| M1 | §5.2.3: năm chỗ dùng AI | §5.3.1 điều phối thêm chân dung, thiết kế trình bày, sinh hình; code có `hitsSecret`, chấm nhiệm vụ phụ; UC-E11 có AI chấm sự kiện ngẫu nhiên | Bảng T1–T15 ở mục 2 vào §5.3.6; hỏi cô T11–T13 | Nhật, Phúc; cô |
| M2 | Spec B3: **một** model vừa dẫn truyện vừa phát evidence mỗi lượt | D-91, DC-01: model chấm tách khỏi model dẫn truyện, chấm nền theo tình huống | Spec Khối B ghi là đã thay; giữ các luật còn dùng được (mục 5) | Người giữ spec |
| M3 | Code, spec A8, B3: 3 mốc +2 / 0 / −1; UC-E11 bước 8 chọn kết cục bằng cách đếm +2 và −1 | D-87: 4 mức −1 / 0 / +1 / +2, chờ game design (D-95) | Thuật toán viết dạng tham số theo thang thứ bậc K mức; luật chọn kết cục đổi sang theo điểm | Game design |
| M4 | FR-13, UC-E11, UC-E13, spec B2, code `costs_ceiling`: dùng hint thì +2 hạ xuống 0 | D-86: hint chỉ giảm trọng số bằng chứng | Theo D-86; sửa FR-13 và hai use case | Nam |
| M5 | Spec A11, B3: hết giờ tính −1 | D-86: hết giờ là không trả lời, không trừ điểm | Theo D-86; sửa spec | Người giữ spec |
| M6 | NFR-02 (8 s mỗi câu); UC-E13 chấm từng câu ngay | D-91: chấm nền khi hết tình huống, kết quả ở màn tổng kết; §5.3.1 đã tự ghi chỗ lệch này | Viết lại NFR-02 thành "kết quả có trên màn tổng kết trong X s ở p95"; UC-E13 chạy khi hết tình huống | Nam |
| M7 | FR-11, UC-E13: "the AI model grades" | D-91: panel ba judge, lấy trung vị | Sửa FR-11, UC-E13 cho có panel | Nam |
| M8 | FR-24, UC-D03, UR-D09: câu trả lời mẫu có điểm của chuyên gia | D-91: judge không dùng đáp án mẫu | **Không hẳn mâu thuẫn**: câu trả lời mẫu có điểm là *dữ liệu kiểm định* (D-93) và có thể là *ví dụ hiệu chỉnh*, không phải đáp án đưa cho judge. Viết rõ ở §5.3.6 | Nhật, Phúc |
| M9 | FR-22, FR-23, UC-D01, UC-D02: DE tự viết bối cảnh rồi sinh nội dung bằng AI | D-90: DE cung cấp tri thức qua AI-1, CA cùng AI-2 dựng seed | ✅ 19/10 **D-99**: một pipeline, hai cửa vào (AI-1 phỏng vấn là cửa chính, DE sửa trực tiếp là cửa phụ). Còn: Nam sửa FR-22, FR-23, UC-D01, UC-D02 | Nam |
| M10 | FR-42: chặn trùng *nhà cung cấp* | DC-01: khác *họ model*; §5.3.1: chặn trùng cả hai | Sửa FR-42 theo DC-01 | Nam |
| M11 | — | §5.3.1 hẹn "chọn SDK riêng hay lớp hợp nhất ở 5.2.3"; 5.2.3 chưa chọn | ✅ 19/10 **D-100**: adapter tự viết, API tương thích OpenAI làm định dạng chung. Còn: viết phần so sánh vào §5.2.3 | Nhật |
| M12 | `TextGrader.grade()` trong code chạy đồng bộ, trả về ngay | §5.3.1: chấm tự luận là job chạy nền, kết quả vào run như một sự kiện | Đã ghi trong §5.3.1 ("prototype → target"); nhắc lại ở §6.1 khi hiện thực | — |
| M13 | Code `optionGrade`: mỗi lựa chọn một mốc | D-81, D-87: mỗi lựa chọn có profile trên nhiều năng lực | Schema seed mới (mục 3, đầu việc 3) | Game design |
| M14 | FR-12, FR-14: không qua luật kiểm thì sinh lại | Không có trần số lần sinh lại; NFR-15 đòi mọi thứ hiện ra đều đã qua kiểm | Trần N lần, quá trần thì tạm dừng như khi model lỗi (D-92) | Nhật, Phúc |

## 5. Tài sản thiết kế đang bị bỏ quên (spec Khối B, tháng 8)

Khối B của spec viết cho mô hình "một model làm tất cả" (M2), nhưng nhiều luật trong đó vẫn đúng và báo cáo chưa có:

- **Luật debrief** (B6): gọi tên *hành vi*, không gọi tên kỹ năng, để không lộ rubric; mỗi ý phải kèm câu trích của người chơi; "cần cải thiện" tối đa 2 ý; không số, không sao, không xếp hạng. Dùng được ngay cho T7 (viết phản hồi).
- **Người chơi đi lạc** (B4): hỏi ngoài phạm vi thì NPC trả lời ngắn trong vai rồi kéo về; ba lượt lạc liên tiếp thì NPC ép quyết định; đòi làm việc vượt quyền của cấp thì NPC chặn trong vai. Dùng cho thẻ thiết kế AI-4.
- **Danh sách cấm của model dẫn truyện** (B2): không đổi rubric, không bịa số liệu hay tên công ty thật, không lộ rubric, không hỏi follow-up ở câu lựa chọn hay câu có đếm giờ. Nhiều mục trong đó kiểm được bằng luật (D-89).
- **Luật `quote`** (B3): trích dẫn phải là chuỗi con có thật, không trích được thì không có bằng chứng. Đã thành luật của AI-5 (D-91).
- **Đánh giá scenario của người chơi tách khỏi bằng chứng** (B7): không bao giờ ảnh hưởng tới điểm của chính họ.
- **Interface `TextGrader`** trong code: đúng một chỗ thay bộ chấm từ khoá bằng AI. Là bằng chứng cho §6.1 rằng prototype đã chừa sẵn chỗ cắm.

## 6. Ngoài phạm vi ĐACN, chỉ ghi làm ý tưởng

- **LLM chạy local làm dự phòng khi mọi nhà cung cấp cùng sập** (D-98, cô gợi ý). Ghi ở §5.3.6 (hành vi khi lỗi) và §8.2.
- Tinh chỉnh (fine-tune) model chấm từ dữ liệu chuyên gia đã chấm: chỉ làm được khi Giai đoạn B có dữ liệu thật.
- Tương tác bằng giọng nói cho giao tiếp miệng (§4.2.3 đã nêu).
- Ngữ cảnh theo kinh nghiệm người chơi (spec "Còn thiếu" #1): phá tính so sánh giữa các lượt chơi.

## 7. Câu hỏi

**Đưa vào mail cô:**

1. Hiểu "thiết kế mô hình AI" là thiết kế hệ thống ghép nhiều LLM, không huấn luyện model riêng, có được không?
2. Phạm vi ĐACN: làm thật AI-4 và AI-5, AI-3 ở mức phép thử, AI-1 và AI-2 ở mức thiết kế và bản thử (D-95). Như vậy đã đủ chưa?
3. Các chỗ dùng AI phụ (T11 chân dung, T12 thiết kế trình bày, T13 sinh hình) giữ trong thiết kế hay để ngoài phạm vi?
4. Đánh giá giai đoạn này: nhóm đóng vai DE, khoảng 30 bản ghi, cô kiểm một phần. Như vậy có đủ cho 7.3 không?
5. Tên bài "sáu tiêu chí của sản phẩm AI-native" (07 B26).

**Hỏi nội bộ trước khi gửi:**

- ~~Phúc: M9, M11, chia việc §5.2.3~~ → 19/10: D-99, D-100; Nhật nhận luôn T1010.1 đến T1010.4 nên viết cả §5.2.3 lẫn §5.3.6.
- Nam: M4, M6, M7, M10 (sửa yêu cầu và use case).
- Phúc (flow gamify): T8 kết cục SECRET giữ hay bỏ; với AI chỉ là một tiêu chí của AI-5 (D-101).
- Cả nhóm: đồng ý chia chi phí gọi model (D-102).

## 8. Phát hiện ngoài AI, khi đối chiếu bản 16/10

- §4.4 ghi 43 user requirement và 44 FR, nhưng bảng chỉ có 41 UR và 43 FR (FR-44 đã bỏ).
- §5.3.1 đổi mã architectural driver từ AD-1…AD-8 sang **DR-1…DR-8**, trùng tiền tố với data requirement DR-01…DR-19. Đề xuất đổi sang một tiền tố khác, ví dụ AR-1…AR-8.
- Bản 16/10 bỏ các câu về **hồ sơ đánh giá tác động chuyển dữ liệu ra nước ngoài** (§4.1.4, FR-44, NFR-05, DC-03), trong khi 07 §E ghi Luật 91/2025 Đ.20 bắt buộc khi gọi API LLM ở nước ngoài. Cần xác nhận đây là cố ý.
- Bìa và Abstract vẫn ghi "Chapters 1 to 5.1".
