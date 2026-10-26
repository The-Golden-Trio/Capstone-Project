# Nguồn và quyết định — thang cấp nghề nhóm A

Phạm vi: 101 nghề thuộc 7 nhóm ngành (Nghệ thuật – thiết kế – giải trí – thể thao – truyền thông; Kinh doanh và tài chính; Sản xuất; Y tế chuyên môn và kỹ thuật y tế; Kiến trúc và kỹ thuật; Khoa học tự nhiên và xã hội; Quản lý). Dữ liệu: `thang_cap_nhom_A.csv`, mỗi dòng một cấp.

## Quy ước chung

- Thang băng dùng chung với 22 nghề IT: L1 thực tập/học việc, L2 Fresher (0–1 năm), L3 Junior (1–2), L4 Middle (2–4), L5 Senior (4–7), L6 Lead/trưởng nhóm (6–9), L7 chuyên gia hoặc quản lý cấp trung (8–12), L8 quản lý cấp cao/giám đốc bộ phận, L9 giám đốc/điều hành.
- Các cấp của một nghề luôn **liền nhau** trên thang băng (vì `bandsOf()` trong `packages/game-core/src/domain/bands.ts` cắt một đoạn liên tục từ `band_start` tới `band_end`), độ dài 2–7 cấp.
- `years_experience` là số năm làm nghề **thực tế của nghề đó ở Việt Nam**, không ép theo năm của băng. Nghề viên chức thường chậm hơn băng (ví dụ thăng hạng II cần giữ hạng III đủ 9 năm), nên số năm có thể vượt khung của băng.
- `evidence`: A = có văn bản pháp luật hoặc dữ liệu VN đã đọc được nội dung (dù qua trang sao chép văn bản); B = thực tế phổ biến ở VN (tin tuyển dụng, lộ trình nghề trên các trang việc làm), chưa có văn bản chính thức; C = suy luận của người dựng thang.
- Một cấp mang nhãn A nghĩa là **chức danh/điều kiện của cấp đó** có trong văn bản; việc đặt cấp đó vào băng nào vẫn là quyết định của người dựng.
- Nhãn kiểm chứng nguồn: "toàn văn" = đã đọc điều khoản trong bản sao toàn văn (caselaw.vn, hethongphapluat.com — là trang tư nhân sao lại văn bản, chưa đối chiếu Công báo); "tóm tắt" = chỉ đọc bài tóm tắt/trích đoạn; "thứ cấp" = bài tư vấn, báo, trang việc làm; "chưa xác nhận" = chưa đọc được nội dung, chỉ biết văn bản tồn tại hoặc suy ra.
- `basis` chỉ có 5 giá trị. Một số chuẩn chính thức không phải chứng chỉ hành nghề nhưng được xếp vào `chung_chi_hanh_nghe` vì gần nhất: đẳng cấp vận động viên, thẻ nhà báo, chứng chỉ kỹ năng nghề không bắt buộc. Ghi rõ ở từng nhóm.

---

## 1. Nghệ thuật, thiết kế, giải trí, thể thao và truyền thông (17 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Viên chức nghệ thuật biểu diễn và điện ảnh: đạo diễn nghệ thuật hạng I–IV (V.10.03.08–11), diễn viên hạng I–IV (V.10.04.12–15). Nhóm đạo diễn nghệ thuật gồm đạo diễn sân khấu, điện ảnh, biên đạo múa, huấn luyện múa, sáng tác và chỉ huy âm nhạc, biên kịch | Thông tư 10/2022/TT-BVHTTDL (hiệu lực 15/12/2022), sửa bởi Thông tư 15/2025/TT-BVHTTDL; thăng hạng theo Thông tư 02/2024/TT-BVHTTDL | Diễn viên, diễn viên múa, đạo diễn, chỉ huy/sáng tác âm nhạc | tóm tắt (mã số và danh sách chức danh qua trang tổng hợp); Thông tư 02/2024: trang chính thức VCCI, đọc điều kiện "đang giữ hạng liền kề" |
| Viên chức mỹ thuật: hoạ sĩ hạng III (V.10.08.27), II (V.10.08.26), I (V.10.08.25) | Thông tư 09/2022/TT-BVHTTDL; thăng hạng Thông tư 02/2024/TT-BVHTTDL | Hoạ sĩ, nghệ nhân | tóm tắt (mã số đọc qua Thông tư 02/2024 trên vcci.com.vn); chưa đọc Thông tư 09/2022 |
| Viên chức biên tập viên, phóng viên, biên dịch viên, đạo diễn truyền hình hạng I–III (V.11.01.01 … V.11.04.12) | Thông tư 13/2022/TT-BTTTT (26/8/2022) | Phóng viên, biên tập viên, phiên dịch | tóm tắt |
| Viên chức âm thanh viên, phát thanh viên, kỹ thuật dựng phim, quay phim (hạng I–IV) | Thông tư 46/2017/TT-BTTTT, sửa bởi Thông tư 07/2022/TT-BTTTT; mã số theo Thông tư 05/2018/TT-BNV | KTV âm thanh, quay dựng phim | tóm tắt |
| Viên chức thể dục thể thao: HLV cao cấp hạng I (V.10.01.01), HLV chính hạng II, HLV hạng III, hướng dẫn viên hạng IV | Thông tư 07/2022/TT-BVHTTDL; thăng hạng Thông tư 03/2024/TT-BVHTTDL | VĐV/HLV | tóm tắt |
| Đẳng cấp vận động viên: kiện tướng, cấp 1, cấp 2; dự Olympic/ASIAD/SEA Games được phong kiện tướng | Thông tư 06/2021/TT-BVHTTDL (hiệu lực 15/9/2021), sửa bởi Thông tư 14/2025/TT-BVHTTDL (hiệu lực 01/01/2026) | VĐV L2–L4 | tóm tắt |
| Thẻ nhà báo: cấp lần đầu cần công tác liên tục tại cơ quan báo chí từ 02 năm, có bằng đại học | Luật Báo chí 2016 (103/2016/QH13), Điều 27 | Phóng viên L2–L3 | thứ cấp (trích dẫn qua thuvienphapluat.vn); chưa kiểm tra Luật Báo chí có bị sửa/thay thế sau 2016 hay không |
| Thang chức danh doanh nghiệp: Thực tập sinh → Nhân viên → Chuyên viên (Junior/Middle) → Senior → Trưởng nhóm → Trưởng phòng/Giám đốc nghệ thuật | Tin tuyển dụng TopCV, VietnamWorks (trường "Cấp bậc" có giá trị "Thực tập sinh") | Thiết kế, hoạt hình, nội dung, sản xuất phim | thứ cấp; chưa xác nhận danh sách đầy đủ giá trị "Cấp bậc" của hai trang |

URL chính:
- Thông tư 10/2022/TT-BVHTTDL: https://luatvietnam.vn/can-bo/thong-tu-10-2022-tt-bvhttdl-233171-d1.html ; văn bản hợp nhất 7173/VBHN-BVHTTDL: https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/12/7173-vbhn-bvhttdl.pdf
- Thông tư 02/2024/TT-BVHTTDL: https://vcci.com.vn/legal-document/02-2024-tt-bvhttdl
- Thông tư 13/2022/TT-BTTTT: https://caselaw.vn/van-ban-phap-luat/412963-thong-tu-so-13-2022-tt-btttt-ngay-26-08-2022-cua-bo-truong-bo-thong-tin-va-truyen-thong-quy-dinh-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-va-xep-luong-doi-voi-vien-chuc-bien-tap-vien-phong-vien-bien-dich-vien-va-dao-dien-truyen-hinh-thuoc-chuyen-nganh-thong-tin-va-truyen-thong
- Thông tư 46/2017/TT-BTTTT: https://caselaw.vn/van-ban-phap-luat/304163-thong-tu-46-2017-tt-btttt-ve-quy-dinh-tieu-chuan-chuc-danh-nghe-nghiep-vien-chuc-am-thanh-vien-phat-thanh-vien-ky-thuat-dung-phim-quay-phim-thuoc-chuyen-nganh-thong-tin-va-truyen-thong-do-bo-truong-bo-thong-tin-va-truyen-thong-ban-hanh
- Thông tư 03/2024/TT-BVHTTDL: https://luatvietnam.vn/can-bo/thong-tu-03-2024-tt-bvhttdl-tieu-chuan-xet-thang-hang-vien-chuc-nganh-the-duc-the-thao-355225-d1.html
- Thông tư 06/2021/TT-BVHTTDL: https://luatvietnam.vn/van-hoa/thong-tu-06-2021-tt-bvhttdl-206124-d1.html ; Thông tư 14/2025/TT-BVHTTDL: https://thuvienphapluat.vn/van-ban/The-thao-Y-te/Thong-tu-14-2025-TT-BVHTTDL-sua-doi-Thong-tu-06-2021-TT-BVHTTDL-679652.aspx
- Điều 27 Luật Báo chí 2016 (trích): https://thuvienphapluat.vn/hoi-dap-phap-luat/dieu-kien-tieu-chuan-duoc-xet-cap-the-nha-bao-147391.html

### Quyết định và giả định

- **Nghề có ngạch viên chức** (hoạ sĩ, diễn viên, diễn viên múa, đạo diễn, phóng viên, biên tập viên, biên dịch, âm thanh viên, quay phim) dùng hạng IV→I làm khung, chèn thêm một cấp "vai chính / chính chuyên mục" (nhãn C, cơ sở `so_nam_kinh_nghiem`) giữa hạng III và hạng II, vì từ hạng III lên hạng II thường mất gần một thập kỷ và người chơi cần một mốc ở giữa.
- **Số năm giữ hạng** của các ngạch văn hoá, thông tin chưa đọc được; số năm trong CSV ước theo mẫu chung của viên chức (lên hạng II sau ~9 năm hạng III, lên hạng I sau ~6 năm hạng II — mẫu này **đã xác nhận cho ngạch khoa học công nghệ và bác sĩ**, chưa xác nhận cho ngạch văn hoá).
- **Ca sĩ, nhạc công**: chưa xác nhận ca sĩ, nhạc công thuộc nhóm "diễn viên" của Thông tư 10/2022, nên các hạng IV/III/II của họ để nhãn C. Cấp cuối "Nhạc sĩ, chỉ huy âm nhạc" có nhãn A vì "sáng tác, chỉ huy âm nhạc" có tên trong nhóm đạo diễn nghệ thuật.
- **VĐV/HLV**: gộp hai giai đoạn của một đời nghề: thi đấu (cấp 2 → cấp 1 → kiện tướng, L2–L4) rồi huấn luyện (HLV hạng III → II → I, L5–L7). Đẳng cấp VĐV xếp `chung_chi_hanh_nghe` vì là chuẩn do Nhà nước phong, dù không phải giấy phép hành nghề. Số năm là ước lượng.
- **Phóng viên**: L2 "phóng viên tập sự" gắn với điều kiện 02 năm của thẻ nhà báo; thẻ nhà báo xếp `chung_chi_hanh_nghe`.
- **Thiết kế, hoạt hình, nội dung**: không có hệ thống chính thức; dùng thang doanh nghiệp 7 cấp L1–L7 (nhãn B). Không đưa lên L8–L9 vì giám đốc sáng tạo đã là đỉnh phổ biến của nghề; các vị trí cao hơn là quản lý chung.
- **Nhà thiết kế nội thất**: chưa xác nhận thiết kế nội thất có cần chứng chỉ hành nghề kiến trúc hay không, nên không đưa chứng chỉ vào thang.
- Nghề job_zone 2–3 không có đường thực tập chính thức (diễn viên, diễn viên múa, hoạ sĩ, KTV âm thanh, quay phim) bắt đầu ở L2; nghề job_zone 4 bắt đầu ở L1.

---

## 2. Kinh doanh và tài chính (16 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Tiêu chuẩn kế toán trưởng: có chứng chỉ bồi dưỡng kế toán trưởng; thời gian công tác thực tế về kế toán ít nhất 02 năm (đại học trở lên) hoặc 03 năm (trung cấp, cao đẳng) | Luật Kế toán 2015 (88/2015/QH13), Điều 54 khoản 1 điểm d; Nghị định 174/2016/NĐ-CP Điều 20–21 | Kế toán L4 | toàn văn (hethongphapluat.com/luat-ke-toan-2015/dieu-54) |
| Đăng ký hành nghề kiểm toán: là kiểm toán viên (có chứng chỉ KTV), thời gian thực tế làm kiểm toán đủ 36 tháng, cập nhật kiến thức | Luật Kiểm toán độc lập 2011 (67/2011/QH12), Điều 14–15; hướng dẫn Thông tư 202/2012/TT-BTC, sửa bởi Thông tư 22/2024/TT-BTC | Kế toán – kiểm toán L5 | toàn văn (caselaw.vn); Thông tư 22/2024 chưa đọc |
| Ngạch công chức thuế: kiểm tra viên cao cấp thuế (06.036), kiểm tra viên chính thuế (06.037), kiểm tra viên thuế (06.038), kiểm tra viên trung cấp thuế (06.039); ngạch kế toán viên cao cấp/chính/kế toán viên/trung cấp | Thông tư 29/2022/TT-BTC (03/6/2022) | Cán bộ thuế | tóm tắt (mã số 06.036, 06.038, 06.039 thấy trong bài tóm tắt; 06.037 suy theo thứ tự — chưa xác nhận); chưa đọc điều kiện thời gian giữ ngạch thuế |
| Thẻ thẩm định viên về giá: tốt nghiệp đại học, có chứng chỉ đào tạo nghiệp vụ, thi đạt; giám đốc doanh nghiệp thẩm định giá phải có đủ 36 tháng là thẩm định viên về giá | Luật Giá 2023 (16/2023/QH15), Điều 44, 45, 51 (hiệu lực 01/7/2024) | Thẩm định viên L4, L7 | toàn văn Điều 44 (hethongphapluat.com); Điều 51 qua trích đoạn kết quả tìm kiếm (tóm tắt) |
| Chứng chỉ hành nghề định giá xây dựng hạng III/II/I: đại học + kinh nghiệm từ 02/04/07 năm (cao đẳng: hạng III cần 03 năm) | Nghị định 175/2024/NĐ-CP, Điều 79 khoản 2 (hiệu lực 30/12/2024) | Kỹ sư dự toán L4–L6 | toàn văn Điều 79 (hethongphapluat.com); điều kiện riêng của lĩnh vực định giá (số công trình) chưa đọc |
| Chứng chỉ hành nghề chứng khoán: môi giới, phân tích tài chính, quản lý quỹ; cá nhân có đại học, có chứng chỉ chuyên môn chứng khoán; do UBCKNN cấp | Luật Chứng khoán 2019 (54/2019/QH14), Điều 97; Nghị định 155/2020/NĐ-CP Điều 213 | Tư vấn đầu tư L2, L5 | thứ cấp (thuvienphapluat.vn trích luật) |
| Chứng chỉ nghiệp vụ khai hải quan (thi 3 môn: pháp luật hải quan, nghiệp vụ ngoại thương, nghiệp vụ hải quan) để được cấp mã số nhân viên đại lý làm thủ tục hải quan | Thông tư 12/2015/TT-BTC, sửa bởi Thông tư 22/2019/TT-BTC (có nguồn nhắc Thông tư 25/2026/TT-BTC — chưa xác nhận) | Logistics L3 | tóm tắt |
| Lộ trình RM ngân hàng: RM ≥1 năm, SRM ≥2 năm, SERM ≥3 năm kinh nghiệm tín dụng | Tin tuyển dụng VIB trên JobsGO; lộ trình RM → Senior RM → … trên cake.me | Tín dụng L3–L5 | thứ cấp (một ngân hàng, không phải chuẩn ngành) |
| Thang chức danh văn phòng doanh nghiệp: Thực tập sinh → Nhân viên → Chuyên viên → Chuyên viên chính → Chuyên viên cao cấp → Trưởng nhóm/Giám sát → Trưởng phòng | Thực tế tin tuyển dụng; tên "chuyên viên chính/cao cấp" mượn từ ngạch công chức và được nhiều ngân hàng, doanh nghiệp nhà nước dùng | Mua hàng, bồi thường bảo hiểm, tuân thủ, nhân sự, sự kiện, marketing | thứ cấp / chưa xác nhận như một chuẩn |

URL chính:
- https://hethongphapluat.com/luat-ke-toan-2015/dieu-54
- https://caselaw.vn/van-ban-phap-luat/115789-luat-kiem-toan-doc-lap-so-67-2011-qh12-ngay-29-03-2011-cua-quoc-hoi
- https://hethongphapluat.com/luat-gia-2023/dieu-44 ; https://hethongphapluat.com/luat-gia-2023/dieu-51
- https://hethongphapluat.com/nghi-dinh-175-2024-nd-cp-huong-dan-luat-xay-dung-ve-quan-ly-hoat-dong-xay-dung/dieu-79
- https://thuvienphapluat.vn/lao-dong-tien-luong/ca-nhan-nao-duoc-cap-chung-chi-hanh-nghe-chung-khoan-6237.html
- https://caselaw.vn/van-ban-phap-luat/264053-thong-tu-12-2015-tt-btc-quy-dinh-chi-tiet-thu-tuc-cap-chung-chi-nghiep-vu-khai-hai-quan-cap-va-thu-hoi-ma-so-nhan-vien-dai-ly-lam-thu-tuc-hai-quan-trinh-tu-thu-tuc-cong-nhan-va-hoat-dong-cua-dai-ly-lam-thu-tuc-hai-quan-do-bo-truong-bo-tai-chinh-ban-hanh
- https://luatvietnam.vn/lao-dong/thong-tu-29-2022-tt-btc-222581-d1.html ; https://thuvienphapluat.vn/lao-dong-tien-luong/kiem-tra-vien-cao-cap-thue-la-ai-36002.html
- https://jobsgo.vn/viec-lam/quan-ly-khach-hang-rm-luong-cung-10-25-trieu-khu-vuc-ho-chi-minh-27778940512.html ; https://www.cake.me/resources/industry-job-overview/cac-vi-tri-trong-ngan-hang

### Quyết định và giả định

- **Khuôn chung** (7 cấp, L1–L7) dùng cho 6 nghề văn phòng không có chuẩn chính thức. Đỉnh dừng ở L7 "Trưởng phòng" thay vì L8–L9, vì các vị trí giám đốc khối là quản lý chung, đã có ở nhóm Quản lý.
- **Kế toán, kiểm toán viên** là một nghề gộp hai đường; thang đi theo kế toán (L1–L4), chèn mốc kiểm toán viên hành nghề ở L5 (cần chứng chỉ KTV + 36 tháng), rồi quay lại quản lý tài chính (L6–L7). Đây là thang lai — nếu game cần tách, nên tách thành hai nghề.
- **Kế toán trưởng ở L4**: luật chỉ đòi tối thiểu 2 năm; ở doanh nghiệp vừa và lớn thực tế cần lâu hơn, nên ghi rõ "doanh nghiệp nhỏ".
- **Cán bộ thuế**: hai cấp "phụ trách nhóm doanh nghiệp" (L4) và "phó trưởng phòng" (L6) là chức vụ, không phải ngạch (nhãn C). Sau sắp xếp bộ máy 2025 (chi cục thuế → thuế cơ sở) tên các phòng/đội có thể đã đổi — chưa kiểm tra. Số năm giữa các ngạch là ước lượng.
- **Thẩm định viên về giá**: cấp L5 "cao cấp" là suy luận (C); không có hạng chính thức giữa thẩm định viên và giám đốc doanh nghiệp. Số năm trước khi thi thẻ (3–5) là ước lượng; Điều 44 không nêu số tháng kinh nghiệm.
- **Quant (job_zone 5)**: thị trường VN nhỏ, ít tin tuyển dụng; từ L4 trở lên là suy luận (C).
- **Người kinh doanh online**: không có thang chức danh; thang 5 cấp theo quy mô kinh doanh, toàn bộ nhãn C, cơ sở `so_nam_kinh_nghiem`.

---

## 3. Sản xuất (16 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Bậc trình độ kỹ năng nghề quốc gia 1–5 và điều kiện dự đánh giá: bậc 1 ai cũng dự được; bậc 2 = bậc 1 + 2 năm, hoặc trung cấp, hoặc 3 năm làm nghề liên tục; bậc 3 = bậc 2/trung cấp + 2 năm, bậc 1 + 5 năm, cao đẳng, hoặc 6 năm; bậc 4 = bậc 3/cao đẳng + 3 năm, bậc 2/trung cấp + 6 năm, bậc 1 + 9 năm, đại học, hoặc 10 năm; bậc 5 = bậc 4/đại học + 5 năm … hoặc 15 năm liên tục | Nghị định 31/2015/NĐ-CP, Điều 16 (hiệu lực 15/5/2015; Điều 7, 14 bãi bỏ và Điều 26 sửa bởi Nghị định 140/2018/NĐ-CP — Điều 16 không bị sửa) | Thợ CNC, thợ hàn, thợ mộc, thợ kim hoàn, vận hành nước thải | toàn văn (caselaw.vn) |
| Văn bản có thể đã thay thế Nghị định 31/2015: Nghị định 138/2026/NĐ-CP (07/4/2026) hướng dẫn Luật Việc làm 2025 (74/2025/QH15) về phát triển kỹ năng nghề, có Khung trình độ kỹ năng nghề quốc gia ở Phụ lục I | Nghị định 138/2026/NĐ-CP | Chưa dùng số liệu | chưa xác nhận (chỉ thấy qua bài tư vấn; chưa đọc số bậc và điều kiện mới) |
| Chức danh vận hành nhà máy điện theo ca, kíp: Trưởng ca, Trưởng kíp, Trực chính, Trực phụ | Thông tư 44/2014/TT-BCT (quy trình thao tác trong hệ thống điện quốc gia); chứng nhận vận hành theo Quyết định 45/QĐ-ĐTĐL năm 2015 (đã hết hiệu lực) | Vận hành nhà máy điện L2–L5 | tóm tắt; chưa kiểm tra văn bản thay thế hiện hành |
| Thang bếp bánh khách sạn (Commis → Demi Chef → Chef de Partie → Sous Chef → Pastry Chef), thang chuyền may (công nhân → thợ may mẫu → tổ trưởng chuyền), thang vận hành lọc hoá dầu (hiện trường → phòng điều khiển → trưởng ca), thang kỹ thuật viên bán dẫn (Operator → Technician → Senior Technician) | Thực tế tin tuyển dụng VN | Làm bánh, may, lọc hoá dầu, bán dẫn, lắp ráp, đóng gói, QC, labo nha khoa | thứ cấp (kiến thức chung về tin tuyển dụng; chưa trích nguồn cụ thể cho từng thang) |

URL chính:
- Nghị định 31/2015/NĐ-CP: https://caselaw.vn/van-ban-phap-luat/116867-nghi-dinh-31-2015-nd-cp-huong-dan-luat-viec-lam-ve-danh-gia-cap-chung-chi-ky-nang-nghe-quoc-gia ; bản Bộ Tư pháp: https://www.moj.gov.vn/vbpq/Lists/Vn%20bn%20php%20lut/Attachments/30346/31.2015.ND.CP.doc
- Nghị định 138/2026/NĐ-CP (tag tin): https://lsvn.vn/tag/nghi-dinh-1382026ndcp.html
- Thông tư 44/2014/TT-BCT: https://vbpl.moj.gov.vn/TW/Lists/vbpq/Attachments/55187/44.2014.TT.BCT.doc

### Quyết định và giả định

- **Khuôn bậc thợ** (6 cấp L1–L6): L1 học việc, L2–L6 = bậc 1–5. Số năm lấy theo đường "không có bằng, chỉ làm nghề liên tục" của Điều 16 (bậc 2 ~3 năm, bậc 3 ~6 năm, bậc 4 ~10 năm, bậc 5 ~15 năm), rút nhẹ cho người có bằng trung cấp. Dùng cho thợ CNC, thợ mộc, thợ kim hoàn; thợ hàn dùng cùng khuôn nhưng mô tả theo vị trí hàn (1G…6G) như tin tuyển dụng.
- **Nhãn A cho các bậc** chỉ có nghĩa là điều kiện bậc có trong Nghị định 31/2015. **Chưa kiểm tra từng nghề có tiêu chuẩn kỹ năng nghề quốc gia và có tổ chức đánh giá hay không.** Chứng chỉ kỹ năng nghề quốc gia cũng không bắt buộc với đa số nghề trong nhóm; doanh nghiệp thường tự đặt bậc lương riêng.
- **Rủi ro văn bản**: nếu Nghị định 138/2026/NĐ-CP đã thay Nghị định 31/2015 và đổi số bậc hoặc số năm, khuôn này cần cập nhật. Đây là điểm cần kiểm tra trước khi đưa vào game.
- **Nghề vận hành dây chuyền** (lắp ráp, chế biến thực phẩm, may, đóng gói, bán dẫn, in, lọc hoá dầu): thang 5 cấp L1–L5 theo chức danh doanh nghiệp (nhãn B), dừng ở tổ trưởng/trưởng ca. Quản đốc, giám đốc nhà máy thuộc nghề "Quản lý sản xuất" ở nhóm Quản lý.
- **Vận hành nhà máy điện**: chức danh ca kíp có trong văn bản ngành điện (nhãn A), nhưng số năm giữa các chức danh là ước lượng; mỗi nhà máy tự sát hạch.
- **Kỹ thuật viên phục hình (labo nha khoa)**: chưa xác nhận đây có là chức danh "kỹ thuật y" cần giấy phép hành nghề theo Luật Khám bệnh, chữa bệnh 2023 hay không, nên chỉ dùng thang labo tư nhân.
- **QC sản xuất** kéo tới L6 (trưởng phòng QA/QC) vì đường thăng tiến lên quản lý chất lượng rất phổ biến; các nghề vận hành khác dừng ở L5.

---

## 4. Y tế chuyên môn và kỹ thuật y tế (15 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Thời gian thực hành trước khi cấp giấy phép hành nghề: bác sĩ 12 tháng (9 tháng khám chữa bệnh + 3 tháng hồi sức cấp cứu); y sĩ 9 tháng; điều dưỡng, hộ sinh, kỹ thuật y 6 tháng (5 + 1); dinh dưỡng lâm sàng 6 tháng; tâm lý lâm sàng 9 tháng; cấp cứu viên ngoại viện 6 tháng (3 + 3) | Luật Khám bệnh, chữa bệnh 2023 (15/2023/QH15); Nghị định 96/2023/NĐ-CP, Điều 3 | Cấp L2 "thực hành" của mọi nghề có giấy phép | toàn văn Điều 3 (hethongphapluat.com) |
| Viên chức bác sĩ: bác sĩ cao cấp hạng I (V.08.01.01; CKII/tiến sĩ), bác sĩ chính hạng II (V.08.01.02; CKI/thạc sĩ), bác sĩ hạng III (V.08.01.03; bằng bác sĩ y khoa hoặc răng hàm mặt), y sĩ hạng IV (V.08.03.07). Lên hạng II: giữ hạng III đủ 9 năm (6 năm nếu có CKII/tiến sĩ/nội trú); lên hạng I: giữ hạng II đủ 6 năm | Thông tư 41/2025/TT-BYT (ban hành 03/11/2025, hiệu lực 18/12/2025), thay nhóm bác sĩ của TTLT 10/2015/TTLT-BYT-BNV | Bác sĩ, nha sĩ | tóm tắt (luatvietnam.vn, hethongphapluat.com — tin tóm tắt; chưa đọc PDF gốc) |
| Viên chức điều dưỡng hạng I–IV (hạng I V.08.05.31 mới bổ sung), hộ sinh hạng II–IV, kỹ thuật y hạng I–IV (hạng I V.08.07.32); không áp dụng cho cơ sở tư nhân; hạng I điều dưỡng cần CKII/tiến sĩ | Thông tư 02/2025/TT-BYT (hiệu lực 01/3/2025), thay TTLT 26/2015/TTLT-BYT-BNV | Điều dưỡng, hộ sinh, KTV khúc xạ, phục hồi chức năng, gây mê, xét nghiệm, chẩn đoán hình ảnh | tóm tắt; điều kiện "6 năm giữ hạng II lên hạng I" chỉ thấy trong bản dự thảo — chưa xác nhận |
| Viên chức dược: dược sĩ cao cấp hạng I (V.08.08.20), dược sĩ chính hạng II (V.08.08.21), dược sĩ hạng III (V.08.08.22), dược hạng IV (V.08.08.23); xét thăng hạng theo Thông tư 11/2024/TT-BYT (hiệu lực 01/9/2024) | TTLT 27/2015/TTLT-BYT-BNV, sửa bởi Thông tư 03/2022/TT-BYT | Dược sĩ | tóm tắt; chưa thấy văn bản 2025 thay thế nhóm dược |
| Chứng chỉ hành nghề dược: cấp bằng xét duyệt hoặc thi (sửa đổi 2024); có yêu cầu thời gian thực hành | Luật Dược 2016 (105/2016/QH13), sửa bởi Luật 44/2024/QH15; Nghị định 163/2025/NĐ-CP | Dược sĩ L2–L4 | thứ cấp; **số năm thực hành để phụ trách nhà thuốc chưa xác nhận** (thường được nhắc là 2 năm theo quy định cũ) |
| Viên chức chăn nuôi – thú y: chẩn đoán viên bệnh động vật hạng II (V.03.04.10), hạng III (V.03.04.11), kỹ thuật viên hạng IV (V.03.04.12) | TTLT 37/2015/TTLT-BNNPTNT-BNV, sửa bởi Thông tư 07/2022/TT-BNNPTNT | Bác sĩ thú y | tóm tắt |
| Lộ trình tư nhân: dược sĩ phụ trách chuyên môn nhà thuốc, chuỗi nhà thuốc; labo; phòng khám thú y; điều phối 115 | Thực tế tuyển dụng | Các cấp nhãn B | thứ cấp |

URL chính:
- Nghị định 96/2023/NĐ-CP Điều 3: https://hethongphapluat.com/nghi-dinh-96-2023-nd-cp-huong-dan-luat-kham-benh-chua-benh/dieu-3
- Thông tư 41/2025/TT-BYT: https://luatvietnam.vn/can-bo/thong-tu-41-2025-tt-byt-quy-dinh-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-bac-si-y-si-417672-d1.html ; https://hethongphapluat.com/phap-luat/chinh-sach-phap-luat/bac-si-hang-i-ii-iii-can-bang-cap-gi-tu-18122025-quy-dinh-moi-nhat-ban-can-biet.html
- Thông tư 02/2025/TT-BYT: https://thuvienphapluat.vn/hoi-dap-phap-luat/vien-chuc-dieu-duong-gom-cac-chuc-danh-nao-138042219.html ; https://lsvn.vn/quy-dinh-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-dieu-duong-ho-sinh-ky-thuat-y-a152652.html
- TTLT 27/2015 (dược): https://vbpl.vn:443/FileData/TW/Lists/vbpq/Attachments/93952/VanBanGoc_27.2015.TTLT.BYT.BNV.pdf ; Thông tư 11/2024/TT-BYT: https://hoatieu.vn/phap-luat/thong-tu-11-2024-tt-byt-225746
- Luật Dược sửa đổi, Nghị định 163/2025: https://vbpl.vn/TW/Lists/vbpq/Attachments/179702/163_2025_ND-CP_636862.doc
- TTLT 37/2015 (thú y): https://caselaw.vn/van-ban-phap-luat/276870-thong-tu-lien-tich-37-2015-ttlt-bnnptnt-bnv-quy-dinh-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-cua-vien-chuc-chuyen-nganh-chan-nuoi-va-thu-y-do-bo-truong-bo-nong-nghiep-va-phat-trien-nong-thon-bo-noi-vu-ban-hanh

### Quyết định và giả định

- **Khuôn y tế**: L1 sinh viên thực tập lâm sàng → L2 thực hành trước giấy phép (nhãn A theo Nghị định 96/2023) → L3 hạng III có giấy phép → L4 mốc chuyên sâu (CKI hoặc "chính", nhãn B) → L5 hạng II → L6/L7 hạng I hoặc trưởng khoa. Sinh viên và thực hành xếp `chung_chi_hanh_nghe` vì là chặng của lộ trình cấp phép.
- **Số năm thực tế dài hơn băng**: bác sĩ lên hạng II thường sau ≥10 năm (9 năm giữ hạng III), lên hạng I sau ≥16 năm. CSV ghi số năm thật; băng L5/L7 chỉ là vị trí trên thang điểm của game.
- **Hạng I và trưởng khoa đặt chung một cấp** ở bác sĩ (L7), nha sĩ (L6), kỹ thuật y (L6) vì cả hai là đỉnh chuyên môn của khoa; chức vụ quản lý bệnh viện thuộc nghề "Quản lý bệnh viện" ở nhóm Quản lý.
- **Nghề Mỹ quy về chức danh VN**: Optometrist → kỹ thuật y khúc xạ nhãn khoa; Physical therapist → kỹ thuật y phục hồi chức năng (vật lý trị liệu); Nurse anesthetist → kỹ thuật y gây mê hồi sức (ở VN chỉ phụ bác sĩ gây mê, không tự gây mê); Acupuncturist → bác sĩ y học cổ truyền. Đây là quyết định ánh xạ (C) dù từng cấp có nhãn A.
- **Y học cổ truyền**: chưa xác nhận Thông tư 41/2025 tính bằng bác sĩ y học cổ truyền vào hạng III, nên các hạng của nghề này để nhãn B.
- **Hộ sinh** không có hạng I theo Thông tư 02/2025 (theo tóm tắt), nên đỉnh là "hộ sinh trưởng khoa" (L6).
- **Dinh dưỡng**: chưa đọc được chức danh viên chức dinh dưỡng (TTLT 28/2015/TTLT-BYT-BNV — chưa xác nhận nội dung); thang dùng chức danh hành nghề "dinh dưỡng lâm sàng" của Luật Khám bệnh, chữa bệnh 2023 và chức vụ bệnh viện.
- **Hồ sơ bệnh án, cấp cứu ngoại viện, chẩn đoán hình ảnh** (job_zone 3) bắt đầu ở L2. Thang hồ sơ bệnh án hoàn toàn theo vị trí việc làm ở bệnh viện (B/C).

---

## 5. Kiến trúc và kỹ thuật (13 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Chứng chỉ hành nghề hoạt động xây dựng của cá nhân hạng I/II/III: hạng I đại học + kinh nghiệm từ 07 năm; hạng II đại học + từ 04 năm; hạng III từ 02 năm (đại học) hoặc 03 năm (cao đẳng); kèm điều kiện số công trình theo lĩnh vực (ví dụ thiết kế hạng III: 03 công trình cấp III hoặc 05 công trình cấp IV — Điều 82) | Nghị định 175/2024/NĐ-CP, Điều 79 khoản 2, Điều 82, 83, 86 (hiệu lực 30/12/2024) | Kỹ sư xây dựng L4–L6; kỹ sư điện L4–L6; (và kỹ sư dự toán, quy hoạch ở nhóm khác) | toàn văn Điều 79 (hethongphapluat.com); Điều 82, 86 qua trích đoạn (tóm tắt) |
| Chứng chỉ hành nghề kiến trúc: đại học kiến trúc + tối thiểu 03 năm tham gia dịch vụ kiến trúc + đạt sát hạch; một hạng, thời hạn 10 năm | Luật Kiến trúc 2019 (40/2019/QH14), Điều 28 khoản 1; Nghị định 85/2020/NĐ-CP | Kiến trúc sư L4 | toàn văn Điều 28 (hethongphapluat.com) |
| Chứng chỉ hành nghề đo đạc và bản đồ: hạng I đại học + ít nhất 05 năm liên tục; hạng II đại học + 02 năm hoặc trung cấp/cao đẳng + 03 năm; sát hạch | Luật Đo đạc và Bản đồ 2018 (27/2018/QH14), Điều 53; Nghị định 27/2019/NĐ-CP, sửa bởi 136/2021/NĐ-CP, 22/2023/NĐ-CP và (có thể) 39/2026/NĐ-CP | Kỹ sư trắc địa L3, L5 | thứ cấp (luatminhkhue.vn trích luật) |
| Viên chức khoa học công nghệ nhóm công nghệ: kỹ thuật viên (IV), kỹ sư (III), kỹ sư chính (II, cần giữ hạng III đủ 9 năm), kỹ sư cao cấp (I, cần giữ hạng II đủ 6 năm) | Thông tư 11/2024/TT-BKHCN (hiệu lực 15/02/2025), thay TTLT 24/2014/TTLT-BKHCN-BNV | Chỉ dùng làm đối chiếu, không đưa vào thang kỹ sư doanh nghiệp | toàn văn (hethongphapluat.com) |
| Thang kỹ sư doanh nghiệp: Thực tập sinh → Kỹ sư mới → Kỹ sư (Junior) → Kỹ sư (Middle) → Kỹ sư cao cấp (Senior) → Trưởng nhóm (Lead) → Trưởng phòng kỹ thuật | Tin tuyển dụng (nhãn Junior/Middle/Senior phổ biến ở tin kỹ thuật VN) | 9 nghề kỹ sư ngoài xây dựng | thứ cấp |

URL chính:
- https://hethongphapluat.com/nghi-dinh-175-2024-nd-cp-huong-dan-luat-xay-dung-ve-quan-ly-hoat-dong-xay-dung/dieu-79 ; Điều 82: https://hethongphapluat.com/nghi-dinh-175-2024-nd-cp-huong-dan-luat-xay-dung-ve-quan-ly-hoat-dong-xay-dung/dieu-82
- https://hethongphapluat.com/luat-kien-truc-2019/chuong-3/muc-2
- https://luatminhkhue.vn/thu-tuc-cap-chung-chi-hanh-nghe-do-dac-va-ban-do-theo-quy-dinh-moi.aspx
- https://hethongphapluat.com/thong-tu-11-2024-tt-bkhcn-3bb3eb042db495cff951a4bed19bba64.html

### Quyết định và giả định

- **Kỹ sư xây dựng**: L4/L5/L6 = hạng III/II/I; số năm lấy thẳng từ Điều 79 (2/4/7 năm) nên khớp tốt với băng L4–L6. Đây là nghề có bằng chứng mạnh nhất nhóm.
- **Kỹ sư điện**: dùng cùng khuôn hạng III/II/I với giả định kỹ sư điện công trình thuộc lĩnh vực "thiết kế cơ – điện công trình" của Phụ lục VI Nghị định 175/2024 — **chưa đọc Phụ lục VI**, nên các cấp này để nhãn B. Kỹ sư điện ngoài ngành xây dựng (truyền tải, nhà máy) không cần chứng chỉ này.
- **Kiến trúc sư**: chứng chỉ hành nghề kiến trúc chỉ có một mức (không có hạng), nên chỉ tạo một mốc chính thức ở L4; các cấp trên theo chức danh văn phòng thiết kế (chủ trì → chủ nhiệm đồ án → kiến trúc sư trưởng).
- **Kỹ sư trắc địa**: thang 6 cấp, hạng II ở L3 và hạng I ở L5; điều kiện số năm chỉ đọc qua bài tư vấn trích luật.
- **9 nghề kỹ sư còn lại** (y sinh, hoá – vật liệu, điện tử – viễn thông, môi trường, công nghiệp, cơ khí, ô tô, mỏ – dầu khí, cơ điện tử) dùng thang doanh nghiệp 7 cấp (nhãn B). Không lồng ngạch viên chức KHCN vào vì phần lớn kỹ sư VN làm ở doanh nghiệp; người làm ở viện/trường đi theo ngạch kỹ sư hạng III → chính → cao cấp (xem nhóm 6).
- **Kỹ sư mỏ**: L6 "quản đốc mỏ", L7 "giám đốc điều hành mỏ" — điều kiện bằng cấp, kinh nghiệm của giám đốc điều hành mỏ theo luật khoáng sản **chưa xác nhận**, nên nhãn B.

---

## 6. Khoa học tự nhiên và xã hội (13 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Viên chức khoa học công nghệ nhóm nghiên cứu: trợ lý nghiên cứu hạng IV (V.05.01.04), nghiên cứu viên hạng III (V.05.01.03), nghiên cứu viên chính hạng II (V.05.01.02; cần giữ hạng III hoặc tương đương đủ 09 năm), nghiên cứu viên cao cấp hạng I (V.05.01.01; cần giữ hạng II đủ 06 năm); kèm điểm quy đổi công trình khoa học (Điều 14–17) | Thông tư 11/2024/TT-BKHCN (30/12/2024, hiệu lực 15/02/2025), thay TTLT 24/2014/TTLT-BKHCN-BNV và các sửa đổi | Sinh học, dịch tễ, vật lý, địa chất – KTTV, kinh tế, xã hội học; L6–L7 kỹ sư nông nghiệp | toàn văn (hethongphapluat.com) |
| Ngạch công chức kiểm lâm: kiểm lâm viên chính (10.225, A2.1), kiểm lâm viên (10.226, A1), kiểm lâm viên trung cấp (10.228, B) | Thông tư 08/2022/TT-BNNPTNT (hiệu lực 06/10/2022) | Lâm nghiệp và bảo tồn | tóm tắt |
| Chức danh hành nghề tâm lý lâm sàng; thực hành 9 tháng trước khi cấp giấy phép | Luật Khám bệnh, chữa bệnh 2023; Nghị định 96/2023/NĐ-CP Điều 3 | Nhà tâm lý học L2–L3 | toàn văn Điều 3 |
| Chứng chỉ hành nghề cho chủ nhiệm lập nhiệm vụ quy hoạch, chủ nhiệm lập quy hoạch, chủ trì lĩnh vực — cấp theo pháp luật xây dựng, hạng I/II/III | Luật Quy hoạch đô thị và nông thôn 2024 (47/2024/QH15); Nghị định 178/2025/NĐ-CP; điều kiện năm theo Nghị định 175/2024/NĐ-CP Điều 79 | Quy hoạch đô thị L4–L6 | tóm tắt (Nghị định 178/2025); toàn văn Điều 79 |
| Thang phòng thử nghiệm (ISO/IEC 17025: quản lý kỹ thuật, trưởng phòng), R&D thực phẩm, HSE (Officer → Supervisor → Manager) | Thực tế tuyển dụng | Nhà hoá học – kiểm nghiệm, kỹ sư công nghệ thực phẩm, HSE | thứ cấp |

URL chính:
- https://hethongphapluat.com/thong-tu-11-2024-tt-bkhcn-3bb3eb042db495cff951a4bed19bba64.html ; https://caselaw.vn/van-ban-phap-luat/412429-thong-tu-so-11-2024-tt-bkhcn-ngay-30-12-2024-cua-bo-truong-bo-khoa-hoc-va-cong-nghe-quy-dinh-ma-so-va-tieu-chuan-chuc-danh-nghe-nghiep-vien-chuc-chuyen-nganh-khoa-hoc-va-cong-nghe-tieu-chuan-dieu-kien-xet-thang-hang-chuc-danh-nghe-nghiep-vien-chuc-chuyen-nganh-khoa-hoc-va-cong-nghe
- https://luatvietnam.vn/can-bo/thong-tu-08-2022-tt-bnnptnt-227888-d1.html
- https://thuvienphapluat.vn/van-ban/Xay-dung-Do-thi/Decree-178-2025-ND-CP-elaborating-the-Law-on-Urban-and-Rural-Planning-666811.aspx

### Quyết định và giả định

- **Khuôn nghiên cứu viên** (7 cấp L1–L7): hạng IV ở L2, hạng III ở L3, hai mốc trung gian theo cấp đề tài (cơ sở → bộ/tỉnh, nhãn B, cơ sở `so_nam_kinh_nghiem`), hạng II ở L6, hạng I ở L7. Hai mốc trung gian có vì 9 năm giữ hạng III là quá dài cho một cấp chơi. Số năm 10–15 (hạng II) và 16+ (hạng I) suy từ điều kiện 9 + 6 năm.
- Thang này giả định người chơi đi đường viện nghiên cứu công lập. Nhà kinh tế, nhà xã hội học, nhà sinh học ở doanh nghiệp hoặc tổ chức quốc tế có lộ trình khác (chuyên viên phân tích → trưởng nhóm), chưa dựng.
- **Địa chất, khí tượng thuỷ văn**: dùng khuôn nghiên cứu viên, thay hai mốc trung gian bằng "dự báo viên chính / chủ trì khảo sát". **Chưa đọc** chức danh viên chức chuyên ngành khí tượng thuỷ văn, địa chất của Bộ Tài nguyên và Môi trường (nay Bộ Nông nghiệp và Môi trường) — chỉ biết có TTLT 2015 và Thông tư 12/2022/TT-BTNMT sửa đổi.
- **Kỹ sư nông nghiệp**: L1–L5 theo doanh nghiệp/khuyến nông (nhãn B), L6–L7 nối vào ngạch nghiên cứu viên. Chưa đọc chức danh viên chức trồng trọt – bảo vệ thực vật, khuyến nông (thấy mã khuyến nông viên V.03.09.25/26 nhưng chưa đọc tiêu chuẩn).
- **Lâm nghiệp và bảo tồn**: ngạch kiểm lâm là ngạch công chức, không phải viên chức; vẫn ghi `vien_chuc` vì không có giá trị `cong_chuc` trong bộ nhãn.
- **Nhà tâm lý học**: chỉ dựng đường tâm lý lâm sàng (có giấy phép). Tâm lý học đường, nhân sự… không có trong thang.
- **Quy hoạch đô thị**: số năm hạng III/II/I lấy từ quy định chung Điều 79 Nghị định 175/2024; chưa đọc điều kiện riêng (số đồ án) của lĩnh vực quy hoạch.
- **HSE**: có yêu cầu huấn luyện an toàn vệ sinh lao động bắt buộc (Luật An toàn, vệ sinh lao động 2015; Nghị định 44/2016/NĐ-CP) nhưng chưa đọc điều kiện cho người làm công tác an toàn; thang để nhãn B.

---

## 7. Quản lý (11 nghề)

### Hệ thống cấp bậc VN đã dùng

| Hệ thống | Văn bản | Nội dung dùng | Kiểm chứng |
|---|---|---|---|
| Điều kiện năng lực chỉ huy trưởng công trường hạng I/II/III: hạng I đại học + 7 năm + đã làm chỉ huy trưởng 01 công trình cấp I hoặc 02 công trình cấp II; hạng II đại học + 4 năm + 01 công trình cấp II hoặc 02 cấp III; hạng III 2 năm (đại học)/3 năm (cao đẳng) + đã tham gia thi công 01 công trình cấp III hoặc 02 cấp IV. Phụ lục VI ghi lĩnh vực chỉ huy trưởng **không yêu cầu cấp chứng chỉ hành nghề** | Nghị định 175/2024/NĐ-CP, Điều 86 và Phụ lục VI | Quản lý xây dựng L5–L7 | tóm tắt (trích trong tin đấu thầu, hỏi đáp Bộ Xây dựng trên baodauthau.vn) |
| Trưởng khoa bệnh viện và người chịu trách nhiệm chuyên môn kỹ thuật: hành nghề toàn thời gian, giấy phép phù hợp, tối thiểu 36 tháng hành nghề trong phạm vi chuyên môn | Luật Khám bệnh, chữa bệnh 2023 (15/2023/QH15); Thông tư 32/2023/TT-BYT | Quản lý bệnh viện L6, L8 | thứ cấp (luatvietan.vn trích luật); chưa đọc điều luật gốc |
| Tiêu chí kinh tế trang trại: trồng trọt ≥1,0 tỷ đồng/năm và ≥1,0 ha; chăn nuôi, thuỷ sản, tổng hợp ≥2,0 tỷ đồng/năm; lâm nghiệp ≥1,0 tỷ đồng/năm và ≥10 ha | Thông tư 02/2020/TT-BNNPTNT (hiệu lực 14/4/2020), Điều 3 | Chủ trang trại L5 | tóm tắt (thuvienphapluat.vn, caselaw.vn) |
| Điều lệ trường THCS, THPT và trường nhiều cấp học: nhiệm kỳ hiệu trưởng 05 năm, tối đa 2 nhiệm kỳ liên tiếp tại một trường công lập; phó hiệu trưởng trường nhiều cấp học đã dạy ít nhất 05 năm ở cấp cao nhất (04 năm ở vùng khó khăn); điều kiện thời gian công tác của hiệu trưởng ở Điều 11 khoản 3 | Thông tư 32/2020/TT-BGDĐT; chuẩn hiệu trưởng Thông tư 14/2018/TT-BGDĐT | Quản lý giáo dục L5–L6 | tóm tắt; **số năm của hiệu trưởng chưa đọc được** |
| Thang quản lý doanh nghiệp, khách sạn, nhà hàng, toà nhà: Supervisor → Assistant Manager → Manager → Director/GM | Thực tế tuyển dụng ngành dịch vụ và sản xuất VN | 8 nghề còn lại | thứ cấp |

URL chính:
- https://baodauthau.vn/dieu-kien-lam-chi-huy-truong-cong-truong-post197525.html ; https://baodauthau.vn/trao-doi-nghiep-vu-ngay-1372026-tieu-chi-nhan-su-chu-chot-post202666.html
- https://luatvietan.vn/dieu-kien-nhan-su-khi-thanh-lap-benh-vien.html ; https://caselaw.vn/van-ban-phap-luat/413094-thong-tu-so-32-2023-tt-byt-ngay-31-12-2023-cua-bo-truong-bo-y-te-huong-dan-luat-kham-benh-chua-benh
- https://caselaw.vn/van-ban-phap-luat/351337-thong-tu-so-02-2020-tt-bnnptnt-ngay-28-02-2020-cua-bo-truong-bo-nong-nghiep-va-phat-trien-nong-thon-quy-dinh-ve-tieu-chi-kinh-te-trang-trai
- https://thuvienphapluat.vn/lao-dong-tien-luong/tieu-chuan-hieu-truong-truong-trung-hoc-pho-thong-la-gi-13206.html ; https://thuvienphapluat.vn/hoi-dap-phap-luat/dieu-kien-de-tro-thanh-pho-hieu-truong-truong-trung-hoc-la-gi-138032692.html

### Quyết định và giả định

- **Nghề quản lý bắt đầu cao**: thang bắt đầu ở L3–L5 tuỳ độ "cửa vào" của nghề (nhà hàng L2 vì quản lý nhà hàng thường đi lên từ phục vụ; khách sạn, toà nhà, hành chính L3; xây dựng, sản xuất, giáo dục, bệnh viện L4; giám đốc điều hành và quản lý kỹ thuật L5) và đi tới L7–L9. Đây là nhóm duy nhất dùng tới L8–L9.
- **Chỉ huy trưởng hạng III/II/I** xếp `chung_chi_hanh_nghe` để nhất quán với các hạng khác của Nghị định 175/2024, dù văn bản ghi lĩnh vực này không yêu cầu cấp chứng chỉ (chỉ là điều kiện năng lực). Số năm hạng III (2–5) chồng lên cấp L4 vì người có bằng đại học có thể làm chỉ huy trưởng hạng III sau 2 năm.
- **Quản lý giáo dục**: lộ trình trường phổ thông công lập. Hai cấp Sở Giáo dục và Đào tạo (L7–L8) là chức vụ công chức lãnh đạo, nhãn C. Từ 01/7/2025 chính quyền địa phương bỏ cấp huyện, nên không dùng "Phòng Giáo dục và Đào tạo cấp huyện" làm một cấp.
- **Quản lý bệnh viện**: L9 gộp "tổng giám đốc hệ thống bệnh viện" (tư nhân) và "Giám đốc Sở Y tế" (công) — nhãn C.
- **Chủ trang trại**: L5 lấy ngưỡng giá trị sản xuất của Thông tư 02/2020 làm mốc "trang trại" (A); các cấp khác theo quy mô (C/B). Tiêu chí trang trại xếp `chung_chi_hanh_nghe` cho gần nhất, dù đây là tiêu chí phân loại chứ không phải giấy phép.
- **Khách sạn**: không dùng VTOS / tiêu chuẩn ASEAN cho nghề du lịch vì chưa đọc được nội dung; thang theo chức danh khách sạn quốc tế tại VN (nhãn B).

---

## Tổng kết

- 101 nghề, 631 dòng cấp. Độ dài thang: 5 cấp — 25 nghề; 6 cấp — 26 nghề; 7 cấp — 50 nghề. Không nghề nào dưới 5 cấp.
- Băng bắt đầu: L1 (81 nghề), L2 (10), L3 (4), L4 (4), L5 (2). Băng kết thúc: L5 (11), L6 (29), L7 (54), L8 (1), L9 (6) — chỉ nhóm Quản lý chạm L8–L9.
- Nhãn bằng chứng theo dòng: A 174, B 426, C 31. Cơ sở: doanh_nghiep 393, vien_chuc 107, chung_chi_hanh_nghe 63, so_nam_kinh_nghiem 45, bac_tho 23.

### Những giả định yếu nhất (nên kiểm tra trước khi đưa vào game)

1. **Bậc thợ 1–5 theo Nghị định 31/2015/NĐ-CP** có thể đã bị Nghị định 138/2026/NĐ-CP (hướng dẫn Luật Việc làm 2025) thay thế; chưa đọc được số bậc và điều kiện mới.
2. **Ngạch văn hoá, thông tin** (hoạ sĩ, diễn viên, đạo diễn, phóng viên, biên tập viên, âm thanh viên, quay phim): mới có mã số hạng, chưa đọc số năm giữ hạng; số năm trong CSV mượn mẫu 9 + 6 năm của ngạch KHCN và bác sĩ.
3. **Ánh xạ nghề Mỹ sang chức danh VN** ở nhóm Y tế (optometrist → kỹ thuật y khúc xạ; nurse anesthetist → kỹ thuật y gây mê; acupuncturist → bác sĩ y học cổ truyền) và việc ca sĩ, nhạc công thuộc nhóm "diễn viên" của Thông tư 10/2022.
4. **Thang doanh nghiệp (nhãn B)** chiếm ~2/3 số dòng; tên cấp "Chuyên viên chính / Chuyên viên cao cấp", "(Junior)/(Middle)/(Senior)" là quy ước dựng thang, không phải chuẩn ngành. Danh sách giá trị "Cấp bậc" của TopCV/VietnamWorks chưa xác nhận đầy đủ.
5. **Kỹ sư điện** dùng hạng chứng chỉ xây dựng với giả định lĩnh vực "thiết kế cơ – điện công trình" có trong Phụ lục VI Nghị định 175/2024 (chưa đọc Phụ lục).
6. **Số năm thực hành để dược sĩ phụ trách nhà thuốc** sau Luật Dược sửa đổi 2024 và Nghị định 163/2025 chưa xác nhận.
7. Hầu hết văn bản được đọc qua trang sao chép tư nhân (caselaw.vn, hethongphapluat.com, thuvienphapluat.vn, luatvietnam.vn), chưa đối chiếu Công báo hay Cơ sở dữ liệu quốc gia về văn bản pháp luật.
