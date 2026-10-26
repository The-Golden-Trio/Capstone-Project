# Gợi ý nghề: chấm thế nào và chứng minh ra sao

> Phần nghiên cứu đứng sau khối E của `Hồ sơ JobQuest cơ chế game.md`; công thức và ngưỡng đang dùng ghi ở khối E. Ghi chú nguồn đầy đủ ở `research/research_notes/Gợi ý nghề/` (ba file, mỗi nhận định có nhãn mức kiểm chứng). Số liệu kiểm định ở `occupation-data/generated/onet_similarity_eval.md`, sinh bởi `occupation-data/scripts/evaluate_onet_similarity.py`.

## Tóm tắt

| Phép tính | Câu hỏi | Dữ liệu | Cách tính |
|---|---|---|---|
| **1. Độ giống nghề–nghề** (Sim) | Nghề A giống nghề B tới đâu? | O\*NET: sở thích, kiến thức, kỹ năng, phong cách làm việc | Cosine trên vector đã chuẩn hoá, gộp các nhóm bằng trung bình có trọng số |
| **2a. Bạn có thể thích** (r) | Người chơi có thể thích nghề X không? | RIASEC của người chơi | Tương quan hồ sơ, như O\*NET Interest Profiler |
| **2b. Bạn làm tốt** (S) | Nghề X có cần những điều người chơi đã làm tốt không? | Soft skill của người chơi | Tương quan giữa tỉ lệ đạt 7 nhóm và mức nghề cần |
| **3. Chọn gợi ý** | Hiện nghề nào, nói lý do gì? | Kết quả 1 và 2, lịch sử chơi | Ba ô: cùng ngành bạn có thể thích, khác ngành bạn làm tốt, khác ngành bạn có thể thích |

Không hiện con số hay phần trăm. Chính O\*NET ghi rằng mối liên hệ giữa kết quả bài sở thích và thành công trong nghề "chưa được xác định" (O\*NET Interest Profiler User's Guide, trang chính thức, toàn văn).

Tách "thích" và "làm tốt" theo thuyết điều chỉnh công việc (Dawis & Lofquist 1984, thứ cấp): độ hợp với nghề có hai mặt, sở thích khớp với nghề (đi cùng hài lòng) và năng lực khớp với yêu cầu (đi cùng hiệu suất).

## 1. Độ giống nghề–nghề

**Cách tính.** Với mỗi nhóm mô tả: chuẩn hoá z từng mục trên toàn bộ nghề O\*NET, lấy cosine giữa hai nghề, chuẩn hoá z ma trận độ giống của nhóm đó trên mọi cặp, rồi gộp các nhóm bằng trung bình có trọng số. Đây là khung O\*NET dùng để dựng danh sách Related Occupations: các độ giống chuẩn hoá z rồi lấy trung bình (Dahlke và cộng sự 2022, *Developing Related Occupations for the O\*NET Program*, toàn văn). Hàm khoảng cách (cosine, Euclid…) ít quan trọng; dữ liệu đầu vào quan trọng hơn (Mealy và cộng sự 2018, working paper, toàn văn).

**Kiểm định.** So với danh sách Related Occupations của O\*NET 31.0 (mỗi nghề 20 nghề liên quan đã qua chuyên gia rà, chia ba tầng), trên 878 nghề có đủ dữ liệu. Chỉ số chính: trong 10 nghề giống nhất do JobQuest tính, bao nhiêu nghề nằm trong 10 nghề liên quan tầng Primary.

| Cách đo | Trúng trong 10 nghề đầu |
|---|---|
| Chọn ngẫu nhiên | 1,3% |
| Xếp theo cùng nhóm mã nghề SOC | 30,7% |
| Soft skill 7 nhóm | 14,6% |
| RIASEC | 26,7% |
| RIASEC + soft skill 7 nhóm | 27,9% |
| Sáu nhóm, trọng số bằng nhau | 38,4% |
| **Trọng số chọn trên một nửa số nghề, kiểm trên nửa còn lại:** RIASEC ×2, kiến thức ×2, kỹ năng ×1, phong cách làm việc ×1 | **43,9%** (nửa kiểm) |
| Như trên nhưng không dùng kiến thức: RIASEC ×3, phong cách làm việc ×3, kỹ năng ×1 | 36,7% (nửa kiểm) |

Hai điều cần nói rõ khi đưa vào báo cáo:

- **Có một phần vòng lặp.** Related Occupations được dựng từ mô tả công việc chi tiết, kiến thức và tên nghề; nó không dùng RIASEC, phong cách làm việc hay kỹ năng (Dahlke 2022). Vì kiến thức có mặt ở cả hai phía, bộ trọng số không dùng kiến thức (36,7%) là con số độc lập hơn để trích.
- **Không có mốc công bố để so.** Không tìm được bài nào báo tỉ lệ trúng kiểu này cho độ giống nghề–nghề; mốc so sánh là ngẫu nhiên và "cùng nhóm mã" do nhóm tự dựng.

Bảng 7 nhóm soft skill là cách tốt để *chấm người chơi*, nhưng làm *mô tả nghề* thì kém (14,6%), vì gộp 41 hoạt động và 21 phong cách vào 7 nhóm làm mất thông tin. Độ giống nghề–nghề dùng dữ liệu O\*NET gốc.

## 2a. Bạn có thể thích

**Gộp hai nguồn sở thích trên mỗi trục RIASEC:** P = (2 · tự kể + n · sau khi thử) / (2 + n). Tự kể được tính như 2 lần chạm; đây là ước lượng co rút chuẩn (Gelman và cộng sự, *Bayesian Data Analysis* bản 3, §2.5, toàn văn). Sau 2 lần chạm hai nguồn nặng ngang nhau; sau 10 lần trải nghiệm chiếm 83%. Số 2 là lựa chọn thiết kế.

**Độ hợp r = tương quan Pearson** giữa 6 điểm P và 6 điểm sở thích O\*NET (1–7) của nghề. Đây là cách O\*NET Interest Profiler ghép người với nghề (Lewis & Morris 2025; Gregory & Lewis 2016, báo cáo O\*NET, toàn văn). Trên 257.320 người, tương quan hồ sơ dự báo tốt hơn các chỉ số một-số khác (Granillo-Velasquez và cộng sự 2025, IJSA, tóm tắt). Chỉ số theo mã chữ cái (chữ đầu, mã 3 chữ, chỉ số C) bỏ phí thông tin và không ổn với 2 thẻ mỗi trục.

**Ngưỡng** theo quy ước O\*NET (ý nghĩa thống kê một phía với 6 điểm, p < 0,05 / 0,10 / 0,20): 0,729 · 0,608 · 0,426. Không phải ngưỡng đã kiểm với kết quả nghề nghiệp.

**Hồ sơ phẳng** (độ lệch chuẩn 6 trục < 0,15): không xếp hạng. O\*NET cũng coi hồ sơ phẳng là không dùng được.

## 2b. Bạn làm tốt

**Tỉ lệ đạt** mỗi nhóm = điểm kiếm được / điểm tối đa kiếm được ở các scenario đã chơi, không tính buff chòm sao. **S = tương quan Pearson** giữa các tỉ lệ đạt và mức nghề cần các nhóm đó. Ngưỡng tính cùng cách O\*NET, với 7 điểm: 0,669 · 0,551 · 0,380. Thêm chốt chặn: 2 nhóm nghề cần nhất phải ở bậc ≥ 2, vì S chỉ so hình dạng.

**Vì sao chỉ nói "bạn đã làm tốt X", không nói "bạn sẽ giỏi nghề này":** độ khớp giữa năng lực và yêu cầu nghề chỉ dự báo hiệu suất ở mức ρ = 0,12 (Kristof-Brown và cộng sự 2005, toàn văn); chương trình ASVAB dặn không dùng điểm năng lực để loại nghề với học sinh (sổ tay tư vấn viên, trang chính thức, toàn văn); điểm trong game chưa phải phép đo đã kiểm định.

**Kỹ năng nghề (keyword)** không vào r hay S. Dùng cho lời giải thích và cho phần "điều bạn sẽ học thêm"; không phạt khi người chơi có nhiều hơn nghề cần.

## 3. Chọn gợi ý

Ba ô, mỗi ô 0–3 nghề; điều kiện từng ô ở khối E. Phần nghiên cứu đứng sau:

- **Ô khác ngành bạn có thể thích luôn có ít nhất 1 nghề ở nhóm ngành chưa ghé.** Đa dạng hoá danh sách làm giảm độ chính xác nhưng tăng hài lòng của người dùng (Ziegler và cộng sự 2005, hơn 2.100 người, tóm tắt); tính mới góp vào cảm nhận hữu ích (Pu, Chen & Hu 2011, toàn văn).
- **Không dùng giới tính, mức lương hay độ "danh giá" của nghề** để xếp hạng. Tuổi teen hay tự loại nghề sớm theo giới và uy tín (thuyết giới hạn và thoả hiệp của Gottfredson, thứ cấp).
- **Lời lý do** một dòng, chỉ ra bằng chứng cụ thể và nói rõ nguồn ("bạn đã làm…" khác "bạn nói bạn thích…"). Lời giải thích làm tăng cảm nhận minh bạch (Pu 2011); mục tiêu là để người chơi hiểu vì sao, không phải để họ bấm nhiều (Tintarev & Masthoff 2012, tóm tắt).
- **Chưa có dữ liệu:** hiện 3 nghề ở 3 vùng RIASEC cách xa nhau, không lấy nghề phổ biến.

## 4. Kiểm định

| Bước | Làm gì | Đo gì | Trạng thái |
|---|---|---|---|
| **A. Độ giống nghề–nghề** | So với O\*NET Related Occupations, chọn trọng số trên một nửa, kiểm trên nửa còn lại | Tỉ lệ trúng trong 5, 10, 20 nghề đầu | Đã chạy (mục 1) |
| **B. Mô phỏng** | 20–30 người chơi giả (mỗi kiểu RIASEC chủ đạo × vài mức soft skill), chạy 5 cấp | Số nghề từng được gợi ý; độ đa dạng mỗi màn; luật nhóm ngành chưa ghé đúng 100%; đổi giới tính thì gợi ý không đổi; hồ sơ phẳng xử lý đúng | Nhóm làm khi có code |
| **C. Chuyên gia** | 2–3 giáo viên hướng nghiệp chấm *cùng* 10–15 người chơi giả | Gợi ý hợp lý không, lời lý do đúng và dễ hiểu không; độ đồng thuận (kappa) | Nhóm làm |
| **D. Thử với học sinh** | Khoảng 34 học sinh, đo trước và sau; người dưới 18 tuổi cần đồng ý của phụ huynh | Tỉ lệ bấm từng ô; số nghề muốn tìm hiểu thêm; bộ câu hỏi ResQue bản ngắn; một câu "nghề này hợp với mình không?" để chỉnh tham số | Nhóm làm. Hiệu ứng mức trung bình (d = 0,5) bằng phép so cặp cần khoảng 34 người |

**Điều được phép nói trong báo cáo:** JobQuest giúp người chơi *khám phá rộng hơn*. Không tìm được nghiên cứu nào cho thấy hệ gợi ý nghề bằng thuật toán làm học sinh tự tin hơn khi chọn nghề; công cụ tự khám phá chủ yếu làm tăng việc tìm hiểu và số lựa chọn được cân nhắc (Wong, Quek & Yang 2026, Frontiers, toàn văn khoảng 60%).

## Cái giá phải biết

- Khớp sở thích tương quan khoảng 0,19 với hài lòng trong công việc (Hoff và cộng sự 2020, tóm tắt). Chỉ đủ cho "đáng thử", đúng nguyên tắc D-02.
- Chạm "thích" ngay sau scenario đo *hứng thú tình huống*, dễ bị kéo bởi chất lượng màn chơi; mỗi trục nên được gắn với hoạt động ở nhiều scenario khác nhau.
- 22 nghề IT rất giống nhau (cao Tìm tòi và Tổ chức): người thích Tìm tòi + Tổ chức đạt mức ≥ 0,608 ở 19/22 nghề, người thích Kết nối + Dẫn dắt không đạt nghề IT nào. Hai ô khác ngành xử lý chỗ này.
- Dữ liệu nghề là dữ liệu Mỹ (O\*NET 31.0, CC BY 4.0); gán mã O\*NET cho nghề của game là nhận định của nhóm.
