# Plan nghiên cứu · Hồ sơ nhân vật và Get to know me · tuần 42

> Soạn 12/10/2026 cho buổi họp nhóm 13/10. Mục đích: mỗi người tự tìm hiểu một phần, rồi họp để thống nhất ý tưởng.
> File này chỉ là plan. Chưa sửa gì trong báo cáo, hub hay code.
> Phạm vi: thiết kế nội dung và luật của hồ sơ người chơi và bước Get to know me. Chưa bàn đồ hoạ.

## 1. Buổi họp cần ra được gì

Năm thứ cần chốt, ít nhất ở mức phác thảo:

1. Danh sách trường của hồ sơ: trường nào bắt buộc, trường nào tuỳ chọn, trường nào người chơi tự gõ, trường nào hệ thống suy ra.
2. Bộ chỉ số của hồ sơ: đo cái gì, mấy trục, hiển thị dạng nào.
3. Bộ câu hỏi Get to know me: dạng câu, số câu, cách hỏi để người chơi trả lời thật. **Ưu tiên câu trả lời tự do có câu mồi ý**, trắc nghiệm thuần chỉ là phụ (mục 2).
4. Cách đi từ câu trả lời sang đoạn mô tả bản thân và gợi ý nhóm nghề.
5. Hệ hoàng đạo: có làm không, buff là gì, có đụng tới điểm không.

## 2. Ý tưởng của Phúc, chia thành sáu khối

| Khối | Nội dung |
|---|---|
| A. Thông tin cơ bản | Tên, tuổi, ngày sinh, sở thích; giống một trang cá nhân trên mạng xã hội |
| B. Insight về bản thân | Điểm mạnh, điểm yếu, tính cách, ứng xử, tư duy, hành vi, tâm lý, thế giới quan; như một bản tự soi, đồng thời là bước dựng nhân vật |
| C. Cách hỏi | Hỏi khéo để người chơi trả lời tự nhiên và thật |
| D. Trang hồ sơ | Đoạn tóm tắt về bản thân; biểu đồ chỉ số tính cách (kiểu ngũ giác); vài thống kê. Không phải điểm kỹ năng tích luỹ |
| E. Gợi ý và điểm năng khiếu | Gợi ý nhóm nghề phù hợp; có thể tặng một ít điểm năng khiếu |
| F. Hoàng đạo | Hỏi người chơi có tin chiêm tinh không; cung hoàng đạo theo ngày sinh thật, kèm buff và mô tả chòm sao |

**Nguyên tắc xuyên suốt (Phúc bổ sung 12/10):** ưu tiên để người chơi **trả lời bằng chữ tự do**, kèm **câu hỏi mồi ý** để họ dễ bắt đầu. Trắc nghiệm thuần dễ nhàm, chỉ dùng khi cần. Nguyên tắc này áp cho khối B và C, và kéo theo ba việc phải nghiên cứu: viết câu mồi thế nào để không dẫn dắt câu trả lời; AI đọc chữ tự do ra chỉ số thế nào cho kiểm lại được; gõ chữ trên điện thoại có làm người chơi bỏ giữa chừng không.

## 3. Đã có gì trong repo

### 3.1. Get to know me đang có ba bản lệch nhau

Đây là việc phải xử lý đầu tiên, vì ba nơi đang mô tả ba thiết kế khác nhau.

| | Code trên nhánh chính | Nhánh `feat/gtkm` của Nam (30/9, chưa merge) | Báo cáo, sau khi Nam sửa yêu cầu 8/10 |
|---|---|---|---|
| Bộ câu hỏi | 6 câu hai vế | 1 câu giai đoạn, 14 câu hai vế (chọn "rất giống" hoặc "hơi giống"), 3 câu kể ngắn | Bài trắc nghiệm RIASEC (FR-03) |
| Đo cái gì | 8 chiều cách làm việc | 8 chiều đó, thêm trục Người–Vật của Prediger | Hồ sơ RIASEC 6 chiều |
| Gợi ý nghề | 3 nghề, so cosine với hồ sơ nghề | 5 nghề, kèm lý do | 5 nghề, so với mã sở thích O\*NET của từng nghề, không dùng AI |
| Mô tả bản thân | Không có | AI viết 2–3 câu; AI đọc câu kể và phải trích nguyên văn | AI viết từ hồ sơ RIASEC (FR-04) |
| Chỉ số xã hội | Không có | 0–100, cập nhật theo lựa chọn ở nhiệm vụ phụ | Bằng điểm Social của RIASEC |

Ghi chú:

- Tám chiều hiện có: chịu bị ngắt quãng, tập trung sâu, chịu mơ hồ, tỉ mỉ, làm việc với người, cần thấy kết quả, chịu lặp lại, chịu áp lực. Đây là **cách làm việc ưa thích**, không phải tính cách theo nghĩa tâm lý học.
- Đặc tả của Nam: `docs/project-hub/assets/jobquest-get-to-know-me.md`, chỉ có trên nhánh `origin/feat/gtkm`. Dòng quyết định của nhánh đó mang số **D-74**, trùng với D-74 (tên sản phẩm) đã có.
- Báo cáo yêu cầu mã sở thích O\*NET cho từng nghề. Mình tìm trong `occupation-data/` thì chưa thấy trường nào chứa mã này.
- Cả ba bản đều ghi rõ: câu hỏi tự soạn, chưa kiểm định (07 C6).

### 3.2. Các thứ khác liên quan

- **Tài khoản:** bảng `User` có tên hiển thị, email, ngày sinh. Ngày sinh hiện chỉ dùng để xét đồng ý của người giám hộ. Chưa có trường sở thích hay giới thiệu bản thân.
- **Hồ sơ game:** bảng `GameProfile` chỉ lưu kết quả bài tự vấn. Phần chân dung đến từ nhiệm vụ phụ được cộng lại từ bảng `EventAnswer` mỗi lần đọc.
- **Trang Hành trang** (`/profile`): thẻ nhân vật (tổng điểm, cơ cấu điểm cứng, mềm, nhiệm vụ phụ), kỹ năng theo ngày, lộ trình L1–L10, lịch sử lượt chơi, biểu đồ radar 8 chiều.
- **Ảnh đại diện:** `apps/web/src/domain/crest.ts` sinh huy hiệu bằng mã từ một định danh (khung, nền, dấu).
- **Hồ sơ hợp nghề của từng nghề** (`fit_profile`): suy ra từ chính các sự kiện của nghề, có cờ `_derived`, không phải số đo. Mới có cho 9 nghề nhóm Software.
- **97 sự kiện nhập vai:** mỗi lựa chọn phát tín hiệu trên 8 chiều. Nghĩa là hồ sơ đã có sẵn một nguồn cập nhật từ hành vi khi chơi.
- **ERD nháp** (`assets/jobquest-erd-mermaid.md`): có `orientation_session`, `orientation_answer`, `orientation_result`; chưa có bảng nào cho hồ sơ cá nhân, chỉ số hay hoàng đạo.
- **Yêu cầu trong báo cáo** (`reports/2026-10-02_ch1-5/report.md`): UR-E03 (gợi ý nghề để bắt đầu và một mô tả về bản thân giải thích gợi ý đó), UR-E17 (bản ghi riêng tư), FR-03, FR-04, FR-18, DR-12.
- **Lập luận trong báo cáo:** §1.1 phê bình cách làm trắc nghiệm (RIASEC, MBTI): chúng hỏi người ta nghĩ gì về mình, và nhãn loại MBTI hay đổi ở người có điểm gần ranh giới. §2.4 nêu bốn truyền thống lý thuyết nghề nghiệp.
- **Tài liệu đã có trong danh mục của báo cáo:** Holland [41], Pittenger về MBTI [6], Super [43], lý thuyết nhận thức xã hội về nghề [10][42], thang tự tin ra quyết định nghề [108], CareerSim [76], Future You [77], JobWay [90], O\*NET [62].

### 3.3. Ràng buộc đã chốt mà thiết kế phải theo

1. **Không phán "bạn hợp nghề X"** (D-02). Gợi ý chỉ là chỗ nên thử trước; người chơi tự kiểm bằng cách chơi.
2. **Cốt lõi là làm thử, không phải tự khai** (D-03). Hồ sơ tự khai chỉ là lớp phụ. Cần nói rõ hồ sơ thay đổi thế nào khi người chơi chơi thật.
3. **Get to know me là tuỳ chọn** (D-29). Hồ sơ phải dùng được cả khi người chơi bỏ qua.
4. **Thu dữ liệu cá nhân ở mức tối thiểu, xoá được** (NFR-05). Một trang kiểu mạng xã hội thu nhiều hơn mức hiện tại, nên mỗi trường phải có lý do dùng. Log hành vi có thể bị coi là dữ liệu nhạy cảm (07 mục E, chưa kiểm văn bản gốc).
5. **Điểm năng lực chỉ đến từ việc thể hiện** (BR-02, UR-E13) và cấp đầu của mọi nghề mở tự do (FR-06). Điểm năng khiếu tặng từ bài tự khai, hay buff hoàng đạo, không được chạm vào điểm này.
6. **Kết quả không gửi cho ai khác** (BR-06, UR-E18). Hồ sơ là riêng tư; nếu muốn có phần công khai kiểu mạng xã hội thì phải bàn lại.
7. **Báo cáo đã phê bình nhãn loại kiểu MBTI.** Nếu hồ sơ dùng nhãn loại thì phải tự bảo vệ được trước cô. Bản của Nam đã cấm AI dùng nhãn kiểu MBTI trong đoạn mô tả.
8. **Chỉ tiếng Việt** (D-96). Thang đo lấy từ nước ngoài phải có bản tiếng Việt hoặc nhóm tự dịch và ghi rõ chưa kiểm định.
9. **Giai đoạn này chỉ có nghề IT.** Chỉ số nào cũng phải phân biệt được 22 nghề IT với nhau, không chỉ phân biệt IT với ngành khác.

**Riêng với hướng ưu tiên chữ tự do**, bốn chỗ hiện có đang đi ngược hoặc cần tính lại:

- Bản của Nam cố ý **kẹp trọng số câu kể**: một câu kể không bao giờ nặng hơn một câu chọn "rất giống". Hướng mới đảo lại: chữ tự do là chính.
- Báo cáo ghi FR-03 ghép nghề **không dùng AI**. Nếu chữ tự do là đầu vào chính thì bước đọc phải dùng AI, và FR-03 phải viết lại.
- **Chơi được trên điện thoại, mạng yếu** (NFR-13, UR-E10). Gõ nhiều chữ trên điện thoại là gánh nặng thật; cần giới hạn độ dài và số câu.
- **Chữ tự do có thể chứa thông tin định danh** và sẽ được gửi cho model ở nước ngoài (07 mục E). Bản của Nam đã không gửi tên, email, ngày sinh; nhưng chính câu kể thì chưa được lọc. Mỗi lần đọc cũng tốn tiền model (NFR-11).

## 4. Chủ đề, từ khoá và tài liệu theo từng khối

Mỗi khối gồm: câu hỏi cần trả lời, từ khoá để tìm, tài liệu khởi đầu.

### Khối A · Thông tin cơ bản

**Câu hỏi:** Trường nào thật sự được dùng (cho gợi ý, cho giọng văn, cho hoàng đạo)? Trường nào chỉ để trang trí? Hồ sơ riêng tư hoàn toàn hay có phần cho người khác xem?

**Từ khoá:** player profile design, profile card, onboarding questionnaire, progressive profiling, data minimisation, self-presentation online, hồ sơ người chơi.

**Tài liệu khởi đầu:**
- Back và cộng sự (2010), *Facebook profiles reflect actual personality, not self-idealization*, Psychological Science.
- Kosinski, Stillwell và Graepel (2013), về việc suy ra đặc điểm riêng tư từ dấu vết số, PNAS. Đọc để hiểu mặt rủi ro về quyền riêng tư.
- Gosling và cộng sự (2002), *A room with a cue*: người lạ đoán tính cách qua không gian cá nhân.

### Khối B · Insight về bản thân: đo cái gì

**Câu hỏi:** Chọn những cấu trúc nào trong số: sở thích nghề, tính cách, giá trị, điểm mạnh, cách làm việc, mức sẵn sàng với nghề? Bộ nào có thang đo mở, dùng được không tốn phí? Bộ nào phân biệt được các nghề IT?

**Từ khoá và tài liệu theo nhóm:**

- **Sở thích nghề:** RIASEC, Holland codes, vocational interests, O\*NET Interest Profiler (bản 60 câu và bản 30 câu, miễn phí), People–Things và Data–Ideas, interest congruence.
  - Holland (1997), đã có trong báo cáo [41].
  - Prediger (1982), *Dimensions underlying Holland's hexagon*, Journal of Vocational Behavior: nguồn của trục Người–Vật.
  - Nye, Su, Rounds và Drasgow (2012), tổng hợp 60 năm nghiên cứu về sở thích nghề và hiệu suất, Perspectives on Psychological Science.
  - Su, Rounds và Armstrong (2009), *Men and things, women and people*, Psychological Bulletin: trục Người–Vật chênh lớn theo giới. Phải đọc trước khi dùng trục này để gợi ý nghề.
- **Tính cách:** Big Five, five-factor model, IPIP (kho câu hỏi mở), BFI-2, Mini-IPIP 20 câu, TIPI 10 câu, HEXACO.
  - Goldberg và cộng sự (2006), về kho câu hỏi IPIP, Journal of Research in Personality.
  - Soto và John (2017), BFI-2, Journal of Personality and Social Psychology.
  - Donnellan và cộng sự (2006), Mini-IPIP, Psychological Assessment.
  - Ashton và Lee (2009), HEXACO-60, Journal of Personality Assessment.
  - Barrick và Mount (1991), tính cách và hiệu suất công việc, Personnel Psychology.
- **Vì sao không dùng nhãn loại:** MBTI reliability, type versus trait, Pittenger (2005) đã có trong báo cáo [6]. Tìm thêm: 16Personalities thực chất dựa trên mô hình nào; DISC và Enneagram có bằng chứng tới đâu.
- **Giá trị:** Schwartz basic values, work values, O\*NET Work Importance Profiler, theory of work adjustment.
  - Schwartz (1992), *Universals in the content and structure of values*.
- **Điểm mạnh:** character strengths, VIA classification, strengths-based.
  - Peterson và Seligman (2004), *Character Strengths and Virtues*.
- **Tự đánh giá có đúng không:** self-assessment accuracy, self-efficacy, Dunning–Kruger.
  - Zell và Krizan (2014), *Do people have insight into their abilities?*, Perspectives on Psychological Science. Liên quan trực tiếp tới câu hỏi "điểm mạnh, điểm yếu" và ý tặng điểm năng khiếu.
- **Mức sẵn sàng với nghề:** career adaptability, career maturity, career construction theory. Cô từng gợi ý mức trưởng thành nghề nghiệp (07 B8).
  - Savickas và Porfeli (2012), Career Adapt-Abilities Scale, đo ở 13 nước, Journal of Vocational Behavior.
- **Bản tiếng Việt:** tìm "thích ứng thang đo tiếng Việt", "Vietnamese validation" kèm tên từng thang.

### Khối C · Hỏi thế nào để người chơi trả lời thật

**Câu hỏi:** Dạng câu nào ít bị trả lời cho đẹp? Câu kể tự do do AI đọc có đáng tin không? "Dựng nhân vật" và "trả lời thật" có kéo ngược nhau không?

**Từ khoá:** social desirability bias, faking on personality tests, forced-choice format, ipsative, situational judgment, behavioural versus hypothetical questions, self-disclosure to computers, conversational survey, narrative identity, avatar and ideal self, game-based assessment, stealth assessment.

**Tài liệu khởi đầu:**
- Paulhus (1984), hai thành phần của việc trả lời cho đẹp, Journal of Personality and Social Psychology.
- Birkeland và cộng sự (2006), tổng hợp về việc ứng viên làm đẹp bài tính cách.
- Cao và Drasgow (2019), *Does forcing reduce faking?*, Journal of Applied Psychology. Câu hai vế của Nam chính là dạng forced-choice.
- Moon (2000), *Intimate exchanges*, Journal of Consumer Research: người ta mở lòng hơn khi máy tự chia sẻ trước.
- Lucas và cộng sự (2014), *It's only a computer*, Computers in Human Behavior.
- Bessière, Seay và Kiesler (2007), *The ideal elf*: người chơi tạo nhân vật gần với con người lý tưởng hơn con người thật.
- Yee và Bailenson (2007), *The Proteus effect*: nhân vật tác động ngược lại hành vi người chơi.
- Shute (2011), stealth assessment, đã có trong báo cáo [20].

**Ưu tiên chữ tự do và câu mồi ý: phần phải nghiên cứu thêm**

Câu hỏi cần trả lời:

- Câu mồi nên ở dạng nào: câu hỏi phụ gợi hướng, câu bỏ lửng để điền tiếp, hay ví dụ câu trả lời? Dạng nào giúp người chơi bắt đầu mà **không gài sẵn câu trả lời**?
- Hỏi một lần rồi thôi, hay AI hỏi tiếp một câu dựa trên chữ người chơi vừa gõ?
- Mỗi câu nên dài tới đâu, tối đa mấy câu, để không ai bỏ giữa chừng?
- AI đọc chữ tự do ra chỉ số bằng cách nào để kiểm lại được? Bản của Nam đã có một cách: mỗi giá trị phải kèm câu trích nguyên văn, trích sai thì bỏ. Cách này cùng khuôn với phần chấm bài của AI-5.
- Chỗ nào chữ tự do không đủ thì bù bằng gì: vài câu chọn nhanh chỉ cho những chiều còn thiếu bằng chứng?

Từ khoá: open-ended questions, conversational survey, AI interviewer, probing questions, elaboration prompts, sentence completion, sentence stems, guided reflection, leading questions, priming, demand characteristics, satisficing, respondent burden, text-based personality assessment, language-based assessment, câu hỏi mở, câu hỏi gợi mở.

Tài liệu khởi đầu:

- Xiao và cộng sự (2020), *Tell me about yourself*, ACM TOCHI: chatbot hỏi câu mở và hỏi tiếp, so với bảng hỏi tĩnh. Đã có trong báo cáo [116].
- Chopra và Haaland, *Conducting Qualitative Interviews with AI* (working paper): đã có trong ghi chú nghiên cứu tuần 41 cho phần AI phỏng vấn chuyên gia. Cùng kỹ thuật, đổi người được hỏi từ chuyên gia sang người chơi.
- Krosnick (1991), về việc người trả lời chọn đại cho xong khi câu hỏi tốn sức, Applied Cognitive Psychology. Dùng cho cả hai phía: trắc nghiệm nhàm thì bấm bừa, câu mở nặng thì gõ qua loa.
- Smyth, Dillman, Christian và McBride (2009), về cách ô nhập và lời dẫn ảnh hưởng chất lượng câu trả lời mở trên web, Public Opinion Quarterly.
- Pennebaker và King (1999), *Linguistic styles*, và Park và cộng sự (2015), *Automatic personality assessment through social media language*, đều ở Journal of Personality and Social Psychology: tính cách có lộ qua chữ viết không, và lộ tới mức nào.
- Các bài trắc nghiệm hoàn thành câu trong tâm lý học (Rotter Incomplete Sentences Blank; bài của Loevinger): tiền lệ lâu đời của dạng "câu bỏ lửng".
- Tìm thêm bằng từ khoá, mình chưa có nguồn cụ thể: LLM suy ra tính cách từ văn bản; AI viết nhật ký có hỏi tiếp.

Ví dụ ba dạng mồi để nhóm so sánh (chỉ là minh hoạ):

- Câu hỏi phụ: "Kể một lần bạn làm việc gì đó mà quên cả giờ. *Lúc đó bạn làm một mình hay với ai? Điều gì giữ bạn lại lâu vậy?*"
- Câu bỏ lửng: "Mình thấy mệt nhất khi phải…"
- Chọn rồi kể: chọn một trong ba tấm thẻ tình huống, rồi viết một hai câu vì sao chọn.

**Một điểm căng cần bàn:** "dựng nhân vật" mời người chơi tả con người họ muốn trở thành, còn "trả lời thật" cần con người hiện tại. Có thể tách hai lớp: "bạn bây giờ" và "bạn muốn thành". Câu T3 của Nam (một ngày làm việc lý tưởng sau năm năm) đã là lớp thứ hai; Future You [77] trong báo cáo cũng theo hướng này.

### Khối D · Trang hồ sơ: mô tả và chỉ số

**Câu hỏi:** Viết mô tả thế nào để người chơi hiểu mình hơn mà không rơi vào câu chung chung ai đọc cũng thấy đúng? Mấy trục thì vừa? Chỉ số có thay đổi theo lượt chơi không?

**Từ khoá:** Barnum effect, Forer effect, personality feedback report, strengths-based feedback, radar chart readability, trait spectrum versus type label, personalised summary, Spotify Wrapped design, LLM personality inference from text.

**Tài liệu khởi đầu:**
- Forer (1949), *The fallacy of personal validation*: thí nghiệm gốc của hiệu ứng Barnum. Dùng làm phép thử cho đoạn mô tả do AI viết: nếu đem mô tả của người này đưa người khác mà vẫn thấy đúng thì mô tả đó vô dụng.
- McAdams (2001), *The psychology of life stories*: con người hiểu mình qua câu chuyện, không chỉ qua điểm số.
- Đặc tả của Nam, mục 6: luật viết đoạn mô tả (2–3 câu, nêu một điều có thể khó, không nói hợp hay không hợp).

**Gợi ý về số trục:** Big Five cho đúng năm trục (ngũ giác). RIASEC cho sáu trục (lục giác). Tám chiều hiện có cho bát giác. Chọn mô hình trước, hình dạng theo sau.

### Khối E · Gợi ý nhóm nghề và điểm năng khiếu

**Câu hỏi:** Ghép hồ sơ với nghề bằng dữ liệu nào? Điểm năng khiếu là gì nếu không được chạm vào điểm năng lực?

**Từ khoá:** person–environment fit, person–job fit, interest congruence, O\*NET work styles, O\*NET work values, occupational interest profile, aptitude versus interest, cold-start recommendation.

**Tài liệu khởi đầu:**
- Kristof-Brown, Zimmerman và Johnson (2005), tổng hợp về các loại fit trong công việc, Personnel Psychology.
- Dữ liệu O\*NET: mỗi nghề có mã sở thích, work styles, work values. Cần xem các nghề IT của nhóm có khác nhau đủ trên các trường này không.

**Lưu ý:** tự đánh giá năng lực khớp yếu với năng lực thật (Zell và Krizan). Nếu vẫn muốn có "năng khiếu", nên là một chỉ số thiên hướng tách riêng, hiện trên hồ sơ, không cộng vào điểm mở level.

### Khối F · Hoàng đạo

**Câu hỏi:** Người chơi được gì từ hệ này? Buff là gì? Người không tin thì sao? Trình bày với cô thế nào khi báo cáo đang phê bình cả MBTI?

**Từ khoá:** astrology validity test, Barnum effect and horoscopes, zodiac system in games, birthsign mechanics, cosmetic buff, opt-in flavour system, con giáp, ngũ hành.

**Tài liệu khởi đầu:**
- Carlson (1985), *A double-blind test of astrology*, Nature: phép thử mù đôi, chiêm tinh không dự đoán được tính cách.
- Forer (1949), như trên.

**Hướng an toàn để bàn:** hỏi trước, ai không thích thì tắt; buff chỉ là trang trí hoặc lời dẫn (danh hiệu, màu hành tinh, một câu mô tả chòm sao), không đụng tới chấm điểm, mở level hay gợi ý nghề; mọi cung ngang nhau; ghi rõ là để vui. Người Việt quen cả mười hai con giáp lẫn ngũ hành, có thể cân nhắc thay cho hoặc đi cùng mười hai cung phương Tây.

## 5. Hướng khám phá

### 5.1. Game có bước hỏi để dựng nhân vật

- **Ultima IV:** trả lời các tình huống đạo đức để ra lớp nhân vật. Mẫu kinh điển của "hỏi gián tiếp".
- **Dragon Quest III:** bài hỏi mở đầu quyết định tính cách, tính cách ảnh hưởng mức tăng chỉ số.
- **Ogre Battle, Tactics Ogre:** rút bài tarot và trả lời câu hỏi để định hình chỉ huy.
- **The Elder Scrolls (Morrowind, Oblivion):** bài hỏi chọn lớp nhân vật.
- **Fallout 3 và Fallout: New Vegas:** bài thi G.O.A.T. và bài trắc nghiệm tâm lý của bác sĩ.
- **Pokémon Mystery Dungeon:** bài hỏi tính cách quyết định bạn là Pokémon nào.
- **Bài phân nhà của Pottermore:** câu hỏi mơ hồ có chủ đích, khó đoán đáp án "đẹp".
- **Silent Hill: Shattered Memories, Until Dawn:** buổi gặp bác sĩ tâm lý lập hồ sơ người chơi rồi đổi nội dung game theo đó.
- **Persona 5:** năm chỉ số xã hội (Knowledge, Guts, Proficiency, Kindness, Charm) vẽ thành ngũ giác, tăng theo hành động hằng ngày. Gần nhất với ý "ngũ giác chỉ số".
- **Disco Elysium:** kỹ năng là các giọng nói trong đầu nhân vật; hệ Thought Cabinet.
- **The Sims:** đặc điểm tính cách và khát vọng sống.
- **Cyberpunk 2077, Mass Effect:** chọn xuất thân, xuất thân mở ra lựa chọn hội thoại riêng.

Mỗi game xem ba thứ: hỏi mấy câu, câu hỏi có lộ thứ đang đo không, kết quả ảnh hưởng gì về sau.

### 5.2. Sản phẩm ngoài game

- **16Personalities:** cách viết mô tả và dựng nhân vật đại diện.
- **Spotify Wrapped:** biến dữ liệu hành vi thành câu chuyện về người dùng.
- **Lời nhắc trên hồ sơ của Hinge:** các câu gợi mở được thiết kế để người ta lộ tính cách một cách tự nhiên.
- **Trang cá nhân của Steam, Duolingo, GitHub, LinkedIn:** thống kê, thành tích, chuỗi ngày.
- **Co-Star, The Pattern:** cách viết lời chiêm tinh.
- **Bộ thẻ trò chuyện** (We're Not Really Strangers, Where Should We Begin): câu hỏi xếp theo mức sâu dần.
- **Ứng dụng viết nhật ký có AI hỏi tiếp** (ví dụ Rosebud, Reflectly, Stoic): cách mồi ý, cách hỏi tiếp từ chữ người dùng vừa viết, độ dài mỗi lượt.
- **Game và sản phẩm nhập bằng chữ tự do** (AI Dungeon, Hidden Door đã có trong báo cáo mục 3.2, Façade, Character.AI): người chơi gõ gì, hệ thống đáp lại thế nào để họ muốn gõ tiếp.

### 5.3. Câu hỏi của nhà tâm lý và nhà tham vấn nghề

- **Career Construction Interview của Savickas:** năm câu hỏi về hình mẫu thời nhỏ, tạp chí hay chương trình yêu thích, câu chuyện yêu thích, phương châm sống, ký ức sớm nhất. Đây là cách một nhà tham vấn nghề lấy ra hình dung về bản thân mà không hỏi thẳng "bạn là người thế nào". Kèm bộ bài tập *My Career Story* (Savickas và Hartung).
- **Life Story Interview của McAdams:** đỉnh cao, đáy sâu, bước ngoặt.
- **36 câu hỏi của Aron và cộng sự (1997):** câu hỏi mở dần mức riêng tư.
- **Bảng hỏi Proust:** các câu ngắn về giá trị và sở thích.
- **Twenty Statements Test** (Kuhn và McPartland, 1954): hoàn thành hai mươi câu "Tôi là…".
- **Kỹ thuật laddering** (Reynolds và Gutman, 1988): hỏi liên tiếp "vì sao điều đó quan trọng với bạn" để tới giá trị.
- **Phỏng vấn tạo động lực** (Miller và Rollnick): câu hỏi mở, phản hồi lại, tóm tắt.
- **Bài viết "bản thân tốt nhất có thể"** (King, 2001).
- **Trò "bữa tiệc" của Holland** trong sách *What Color Is Your Parachute*: sáu nhóm người ở sáu góc phòng, bạn tới góc nào trước.
- Từ khoá thêm: Johari window, values card sort, ikigai, reflective prompts, journaling prompts.

### 5.4. Câu hỏi tuyển dụng về hợp văn hoá và hợp việc

- **Từ khoá:** behavioural interview, STAR method, situational interview, structured interview, culture fit versus culture add, values-based interviewing, person–organisation fit, work style preferences, realistic job preview.
- **Tài liệu khởi đầu:**
  - O'Reilly, Chatman và Caldwell (1991), Organizational Culture Profile: xếp 54 phát biểu giá trị để đo độ hợp văn hoá, Academy of Management Journal.
  - Campion, Palmer và Campion (1997), tổng quan về phỏng vấn có cấu trúc, Personnel Psychology.
- **Nguồn thực tế:** bộ nguyên tắc lãnh đạo của Amazon và các câu hỏi đi kèm; tài liệu văn hoá của Netflix; các bài "culture fit interview questions" của công ty IT ở Việt Nam.
- **Dạng câu nên thu thập:** "Kể về một lần bạn…" (hành vi đã xảy ra), "Môi trường nào làm bạn làm việc tốt nhất", "Điều gì khiến bạn bỏ một việc đang làm". Câu T2 của Nam (môi trường nào làm bạn kiệt sức) thuộc loại này.

### 5.5. Hoàng đạo trong game

- **Final Fantasy Tactics:** người chơi nhập ngày sinh; độ hợp giữa các cung ảnh hưởng sát thương và tỉ lệ trúng. Ví dụ về buff có tác động thật, và cả tranh cãi quanh nó.
- **The Elder Scrolls (Morrowind, Oblivion):** chọn chòm sao lúc sinh, mỗi chòm cho một lợi thế. Skyrim đổi thành đá, đổi được bất cứ lúc nào: lý do đổi là bài học thiết kế.
- **Final Fantasy XII:** hệ nghề gắn với mười hai cung.
- **Animal Crossing:** dân làng có ngày sinh và cung; thuần trang trí.

## 6. Chia việc gợi ý

Ba gói, mỗi người một gói. Đây là gợi ý, Phúc phân lại tuỳ ý.

- **Gói 1 · Đo cái gì và ghép nghề thế nào** (khối B và E). Gợi ý: Nam, vì Nam đã viết đặc tả v0.2 và phần yêu cầu RIASEC. Việc đầu tiên: nói rõ ba bản ở mục 3.1 khác nhau vì sao và nên giữ bản nào.
- **Gói 2 · Hỏi thế nào và viết mô tả thế nào** (khối C, D, mục 5.3, 5.4). Gợi ý: Phúc, vì gắn với phần AI đọc câu kể và AI viết mô tả. Gói này mang cả phần "chữ tự do và câu mồi ý": mang tới buổi họp ít nhất mười câu hỏi mở kèm câu mồi, viết theo ba dạng ở khối C.
- **Gói 3 · Hồ sơ trong game và hoàng đạo** (khối A, F, mục 5.1, 5.2, 5.5). Gợi ý: Nhật.

**Mỗi người mang tới buổi họp một trang:**

1. Ba điều tìm được, mỗi điều kèm nguồn đã tự mở đọc.
2. Hai đề xuất cụ thể cho JobQuest.
3. Một rủi ro hoặc điều chưa trả lời được.
4. Năm tới mười câu hỏi mẫu sưu tầm được, ghi lấy từ đâu.

## 7. Câu cần chốt ở buổi họp

1. Get to know me đi theo bản nào: tám chiều cách làm việc, RIASEC, hay kết hợp? Báo cáo đang ghi RIASEC.
2. Hồ sơ đo những nhóm nào trong khối B, và mỗi nhóm mấy câu, để tổng thời gian không quá khoảng năm phút?
3. Trường cơ bản nào bắt buộc? Hồ sơ có phần công khai không?
4. Chỉ số hồ sơ có đổi theo lượt chơi không, và đổi theo cái gì (lựa chọn, không phải điểm, như bản của Nam)?
5. Điểm năng khiếu: bỏ, hay giữ như một chỉ số thiên hướng tách khỏi điểm năng lực?
6. Hoàng đạo: có làm không; nếu có thì buff thuần trang trí hay có tác động?
7. Phần nào do AI làm (đọc câu kể, viết mô tả) và khi AI lỗi thì hồ sơ hiện gì?
8. Chữ tự do chiếm bao nhiêu phần của bài: toàn bộ, hay chữ tự do là chính và vài câu chọn nhanh bù cho chiều còn thiếu? Câu mồi theo dạng nào? AI có hỏi tiếp không, tối đa mấy lượt?

## 8. Ghi chú về nguồn

- Các tài liệu ở mục 4 và 5 mình liệt kê theo hiểu biết sẵn có, **chưa mở bản gốc trong phiên này**. Ai nhận chủ đề nào thì kiểm lại tên, năm và kết luận trước khi dùng. Những mục ghi "đã có trong báo cáo" thì số trích dẫn lấy từ `report.md` hiện tại.
- Thông tin về các game là mô tả cơ chế theo trí nhớ, cần xem lại bằng video hoặc wiki của game.
- Phần "đã có trong repo" mình đã đọc trực tiếp: code và dữ liệu trên nhánh hiện tại, đặc tả của Nam qua `git show origin/feat/gtkm`, báo cáo ở `reports/2026-10-02_ch1-5/report.md`.
