# Nguồn và lập luận — thang cấp nghề nhóm B

Phạm vi: 98 nghề trong `danh_sach_199_nghe.csv` không thuộc 7 nhóm ngành do agent khác làm (Nghệ thuật; Kinh doanh và tài chính; Sản xuất; Y tế chuyên môn; Kiến trúc và kỹ thuật; Khoa học tự nhiên và xã hội; Quản lý). Kết quả nằm ở `thang_cap_nhom_B.csv` (mỗi dòng một cấp).

Ngày tra cứu: 22/10/2026.

## Quy ước chung

**Nhãn xác minh nguồn** (ghi sau mỗi nguồn):
- *toàn văn*: đã đọc điều khoản trong văn bản (bản gốc hoặc bản chép lại đầy đủ).
- *tóm tắt*: đọc bản tóm tắt trên cổng cơ quan nhà nước.
- *thứ cấp*: đọc qua trang tin pháp luật, báo, tin tuyển dụng; chưa đối chiếu văn bản gốc.
- *trang chính thức*: trang của cơ quan/doanh nghiệp chủ quản.
- *chưa xác nhận*: biết số hiệu hoặc nội dung theo hiểu biết, chưa tìm được nguồn trong phiên này.

**Cột `evidence`** trong CSV: A = chức danh/điều kiện có trong văn bản pháp luật Việt Nam đã đọc (toàn văn, tóm tắt hoặc thứ cấp có trích điều khoản); B = cách gọi phổ biến trong tin tuyển dụng, cẩm nang nghề ở Việt Nam; C = suy luận để lấp khoảng trống giữa các cấp có nguồn.

**Ánh xạ band.** Band L1–L9 đo *phạm vi trách nhiệm*, không đo số năm. Cột `years_experience` ghi số năm *trong nghề đó* theo thực tế Việt Nam, nên có thể dài hơn khung năm của IT (ví dụ công an, thẩm phán, giáo viên lên cấp chậm hơn IT). Nguyên tắc chung:
- L1 = học việc, thực tập, phụ việc chưa được tự làm.
- L2 = mới được tự làm phần việc chuẩn (có chứng chỉ/giấy phép đầu vào nếu nghề bắt buộc).
- L3–L4 = tự làm trọn vẹn, nhận việc khó dần.
- L5 = người giỏi nhất ở hiện trường, kèm người mới (thợ bậc 4, giáo viên cốt cán, cơ trưởng...).
- L6 = trưởng nhóm, tổ trưởng, trưởng ca.
- L7 = quản lý cấp trung hoặc chuyên gia đầu ngành.
- L8 = đứng đầu một đơn vị (hiệu trưởng, giám đốc bảo tàng, chánh án...).
- L9 = điều hành cả tổ chức lớn.

**Độ dài thang theo job_zone.** Job zone 2: 3–5 cấp, thường bắt đầu L1, dừng ở L5–L6. Job zone 3: 4–6 cấp, dừng ở L6–L7. Job zone 4–5: 6–7 cấp, dừng ở L7–L9. Nghề chỉ khác nhau theo số năm (lao động phổ thông) được để thang ngắn.

**Hai thay đổi pháp lý lớn năm 2025–2026 ảnh hưởng toàn bộ nhóm viên chức, công chức:**

1. *Viên chức bỏ hạng chức danh nghề nghiệp, chuyển sang bậc nghề nghiệp của vị trí việc làm.* Luật Viên chức số 129/2025/QH15 và Nghị định 232/2026/NĐ-CP (ban hành 26/6/2026) có hiệu lực từ 01/7/2026. Mỗi vị trí việc làm có tối đa 5 bậc nghề nghiệp (bậc 1 thấp nhất đến bậc 5). Trong thời gian chờ chế độ tiền lương mới, bậc 1 ↔ viên chức loại B, bậc 2 ↔ A0, bậc 3 ↔ A1, bậc 4 ↔ A2.1, bậc 5 ↔ A3.1. Đơn vị không được vượt khung bậc mà Phụ lục II, III của nghị định đặt cho từng vị trí; tỷ lệ bậc 5 ≤ 30%, bậc 4 ≤ 40% (nếu vị trí dùng đến bậc 5). Thay đổi bậc đi theo tuyển dụng, sử dụng, quản lý viên chức (có lên, có xuống), không còn thi/xét thăng hạng như trước.
   - Nguồn: tóm tắt của Sở Tư pháp Cần Thơ, https://pbgdpl.cantho.gov.vn/nghi-dinh-so-2322026nd-cp-ngay-2662026-cua-chinh-phu-quy-dinh-ve-vi-tri-viec-lam-vien-chuc (*tóm tắt*); https://danchuphapluat.vn/quan-ly-vien-chuc-theo-vi-tri-viec-lam-tu-luat-vien-chuc-nam-2025-va-nghi-dinh-2322026nd-cp-9811.html (*thứ cấp*, trích Điều 7, Điều 10).
   - Hệ quả cho thang: tên hạng cũ (hạng IV/III/II/I) vẫn ghi trong ngoặc vì người dùng Việt Nam còn quen gọi, nhưng tên chính dùng "bậc". Danh mục khung bậc cho từng vị trí (Phụ lục II, III) **chưa đọc được** (chỉ có bản ảnh); trừ giáo viên (xem nhóm Giáo dục), bậc tương ứng của các vị trí khác được suy ra từ loại lương cũ theo Điều 18, chưa đối chiếu phụ lục.
2. *Công chức chuyển sang xếp ngạch theo vị trí việc làm.* Luật Cán bộ, công chức 2025 (hiệu lực 01/7/2025) gom còn 6 ngạch: nhân viên, cán sự, chuyên viên, chuyên viên chính, chuyên viên cao cấp, chuyên gia cao cấp (mỗi ngạch "và tương đương"), bỏ thi nâng ngạch. Số hiệu luật chưa xác nhận trong phiên này (theo hiểu biết là 80/2025/QH15). Nguồn: https://thuvienphapluat.vn/hoi-dap-phap-luat/thu-bac-xep-ngach-cong-chuc-tu-01072025-la-gi-138057216.html (*thứ cấp*). Các ngạch chuyên ngành (kiểm tra viên hải quan, kiểm lâm viên...) được ghi là "tương đương" các ngạch chung; chưa xác nhận tên ngạch chuyên ngành còn giữ sau luật mới.

---

## 1. Giáo dục và thư viện (9 nghề)

**Hệ thống dùng.**
- *Giáo viên mầm non, phổ thông:* trước 01/7/2026 là hạng III/II/I theo các Thông tư 01, 02, 03, 04/2021/TT-BGDĐT (mầm non, tiểu học, THCS, THPT), sửa đổi bởi Thông tư 08/2023/TT-BGDĐT (*chưa xác nhận* nội dung, chỉ biết số hiệu). Từ 01/7/2026 theo NĐ 232/2026: giáo viên mầm non dùng bậc 2–4 (hạng III → bậc 2, hạng II → bậc 3, hạng I → bậc 4); giáo viên tiểu học, THCS, THPT dùng bậc 3–4 (hạng III → bậc 3, hạng II và I → bậc 4); giáo viên chưa đạt chuẩn trình độ (loại B) → bậc 1. Giáo viên vẫn được xét thăng hạng theo đề án cũ đến hết 12/2026 nếu đề án được duyệt trước 30/6/2026. Nguồn: https://giaoduc.net.vn/ban-in/post261027.gd ; https://giaoduc.net.vn/ban-in/post261816.gd (*thứ cấp*, báo của Hội Khuyến học, trích Điều 7, Điều 18).
- Mức "đạt chuẩn nghề nghiệp mức khá/tốt" lấy từ chuẩn nghề nghiệp giáo viên cơ sở GDPT (Thông tư 20/2018/TT-BGDĐT, các mức Đạt/Khá/Tốt) — *chưa xác nhận* trong phiên này.
- *Giảng viên đại học:* Thông tư 40/2020/TT-BGDĐT (sửa đổi bởi 04/2022/TT-BGDĐT): giảng viên cao cấp hạng I (V.07.01.01), giảng viên chính hạng II (V.07.01.02), giảng viên hạng III (V.07.01.03); điều kiện xét thăng hạng tại Thông tư 05/2024/TT-BGDĐT. Nguồn: https://caselaw.vn/van-ban-phap-luat/412169-thong-tu-so-05-2024-tt-bgddt-ngay-29-03-2024-cua-bo-truong-bo-giao-duc-va-dao-tao-quy-dinh-ve-tieu-chuan-dieu-kien-xet-thang-hang-chuc-danh-nghe-nghiep-vien-chuc-giang-day-trong-cac-co-so-giao-duc-dai-hoc-cong-lap-va-truong-cao-dang-su-pham ; https://hcc.nghean.gov.vn/tin-tong-hop/quy-dinh-moi-ve-tieu-chuan-dieu-kien-xet-thang-hang-giang-vien-dai-hoc-cao-dang-967.html (*thứ cấp*). Số năm giữ hạng tối thiểu **chưa xác nhận**. Chức danh trợ giảng và GS/PGS (Quyết định 37/2018/QĐ-TTg) *chưa xác nhận*.
- *Thư viện:* Thông tư 02/2022/TT-BVHTTDL: thư viện viên hạng I (V.10.02.30), II (V.10.02.05), III (V.10.02.06), IV (V.10.02.07), lương tương ứng A3.2, A2.2, A1, B. Nguồn: https://caselaw.vn/van-ban-phap-luat/413049-thong-tu-so-02-2022-tt-bvhttdl-ngay-01-07-2022-cua-bo-truong-bo-van-hoa-the-thao-va-du-lich-quy-dinh-ve-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-va-xep-luong-vien-chuc-chuyen-nganh-thu-vien ; https://svhttdl.hanam.gov.vn/Lists/VanBanChiDao/Attachments/170/02-2022-TT-BVHTTDL%201-7-2022.pdf (*thứ cấp*, văn bản gốc trên trang Sở VHTTDL Hà Nam chưa mở).
- *Bảo tàng:* Thông tư 16/2021/TT-BVHTTDL, chức danh di sản viên hạng I–IV. Nguồn: https://vbpl.vn/TW/Lists/vbpq/Attachments/155692/16_2021_TT-BVHTTDL_498202_1.doc ; https://lsvn.vn/bo-chung-chi-tin-hoc-ngoai-ngu-voi-vien-chuc-nganh-di-san-van-hoa1644121409.html (*thứ cấp*).
- *Lưu trữ:* chức danh lưu trữ viên (Bộ Nội vụ) — *chưa xác nhận* số hiệu thông tư, nên thang "Thủ thư, chuyên viên lưu trữ" dựng trên hệ thư viện.
- *Gia sư, giáo viên trung tâm, giáo dục đặc biệt (ngoài công lập), chuyên viên phát triển chương trình:* thang doanh nghiệp theo tin tuyển dụng (TA → giáo viên → senior teacher → academic coordinator/manager; instructional designer → senior → trưởng nhóm → L&D director). *thứ cấp/B*.

**Quyết định.**
- Giáo viên phổ thông: bậc nghề nghiệp chỉ có 2 nấc (3–4) nên thang 7 cấp phải ghép thêm chức vụ quản lý (tổ trưởng chuyên môn, phó hiệu trưởng, hiệu trưởng) và mức chuẩn nghề nghiệp. Điều kiện bổ nhiệm phó hiệu trưởng/hiệu trưởng theo Điều lệ trường *chưa xác nhận*; số năm là ước lượng (C/B).
- Tập sự viên chức: một nguồn nói Nghị định 259/2026/NĐ-CP bỏ chế độ tập sự viên chức từ 01/7/2026 (*thứ cấp, chưa xác nhận*), nên không đặt cấp "giáo viên tập sự".
- Giảng viên: L2 trợ giảng, L3 giảng viên; L7 ghép "phó giáo sư/giảng viên cao cấp" vì ở Việt Nam hai danh hiệu này thường đi cùng nhau, dù về pháp lý là hai chế định khác nhau.
- Giáo viên giáo dục đặc biệt: O*NET là giáo viên mầm non chuyên biệt; ở Việt Nam phần lớn làm ở trung tâm can thiệp tư nhân hoặc trung tâm hỗ trợ phát triển giáo dục hòa nhập, nên dùng thang doanh nghiệp.

## 2. Cộng đồng và công tác xã hội (4 nghề)

**Hệ thống dùng.**
- *Công tác xã hội:* Thông tư 26/2022/TT-BLĐTBXH (hiệu lực 28/01/2023): công tác xã hội viên chính (V.09.04.01, lương A2.1), công tác xã hội viên (V.09.04.02, A1), nhân viên công tác xã hội (V.09.04.03, loại B, yêu cầu trung cấp). Theo NĐ 232/2026 tương ứng bậc 4, bậc 3, bậc 1 (suy từ loại lương). Nguồn: https://caselaw.vn/van-ban-phap-luat/412482-thong-tu-so-26-2022-tt-bldtbxh-ngay-12-12-2022-cua-bo-truong-bo-lao-dong-thuong-binh-va-xa-hoi-quy-dinh-ma-so-tieu-chuan-chuc-danh-nghe-nghiep-va-xep-luong-vien-chuc-chuyen-nganh-cong-tac-xa-hoi ; https://luatvietnam.vn/tin-van-ban-moi/luong-vien-chuc-chuyen-nganh-cong-tac-xa-hoi-186-92612-article.html (*thứ cấp*).
- *Hành nghề công tác xã hội:* Nghị định 110/2024/NĐ-CP (hiệu lực 15/10/2024) yêu cầu giấy chứng nhận đăng ký hành nghề sau khi đạt thực hành; cập nhật kiến thức 120 tiết/5 năm. Nguồn: https://pbgdpl.cantho.gov.vn/dieu-kien-hanh-nghe-cong-tac-xa-hoi (*tóm tắt*); văn bản gốc https://vbpl.vn/TW/Lists/vbpq/Attachments/173650/110.2024.NĐ-CP.docx (chưa mở).
- *Tâm lý lâm sàng:* Luật Khám bệnh, chữa bệnh 2023 (15/2023/QH15, hiệu lực 01/01/2024) đưa "tâm lý lâm sàng" vào danh sách chức danh phải có giấy phép hành nghề; Nghị định 96/2023/NĐ-CP quy định thời gian thực hành (một nguồn ghi 9 tháng, dự thảo ghi 6 tháng — *chưa xác nhận* con số cuối). Nguồn: https://lsvn.vn/cac-chuc-danh-chuyen-mon-phai-co-giay-phep-hanh-nghe-kham-benh-tu-nam-01-01-2024-1700539869-a137836.html ; https://thuvienphapluat.vn/lao-dong-tien-luong/tam-ly-lam-sang-co-duoc-lua-chon-hinh-thuc-tu-cap-nhat-kien-thuc-y-khoa-lien-tuc-khong-23381.html (*thứ cấp*).
- *Y tế thôn, bản:* Thông tư 07/2013/TT-BYT: nhân viên y tế thôn, bản cần y sơ cấp hoặc khóa đào tạo từ 3 tháng; cô đỡ thôn, bản từ 6 tháng. Nguồn: https://thuvienphapluat.vn/lao-dong-tien-luong/tieu-chuan-cua-nhan-vien-y-te-thon-ban-duoc-quy-dinh-ra-sao-10039.html (*thứ cấp*). Lưu ý: một trang ghi thông tư hết hiệu lực từ 01/01/2024, trang khác ghi còn hiệu lực — **chưa xác nhận** tình trạng.

**Quyết định.**
- Tư vấn tâm lý: ở Việt Nam tham vấn tâm lý ngoài cơ sở y tế chưa có giấy phép bắt buộc, nên thang chính là doanh nghiệp; chèn một cấp L4 "người hành nghề tâm lý lâm sàng có giấy phép" cho nhánh làm trong cơ sở khám chữa bệnh (A).
- Tư vấn học đường, hướng nghiệp: không tìm thấy chức danh viên chức riêng (thường là giáo viên kiêm nhiệm hoặc chuyên viên phòng công tác sinh viên), nên dùng thang doanh nghiệp/chức vụ, nhiều cấp C.
- Nhân viên y tế cộng đồng: L6 "trưởng trạm y tế xã" để C vì trạm trưởng thường là bác sĩ/y sĩ; người đi từ nhánh y tế thôn bản lên được vị trí này là trường hợp hiếm.

## 3. Dịch vụ bảo vệ an ninh và an toàn (8 nghề)

**Hệ thống dùng.**
- *Công an nhân dân (cảnh sát, PCCC và CNCH, quản giáo):* cấp bậc hàm theo Luật Công an nhân dân 2018 (37/2018/QH14), sửa đổi 2023. Thời hạn xét thăng cấp sĩ quan nghiệp vụ (khoản 3 Điều 22): Thiếu úy → Trung úy 2 năm; Trung úy → Thượng úy 3 năm; Thượng úy → Đại úy 3 năm; Đại úy → Thiếu tá và mỗi bậc từ Thiếu tá đến Đại tá 4 năm; hạ sĩ quan mỗi bậc 1 năm. Nguồn: https://thuvienphapluat.vn/hoi-dap-phap-luat/bao-lau-len-thieu-ta-cong-an-138017196.html ; https://thuvienphapluat.vn/lao-dong-tien-luong/ai-co-tham-quyen-quyet-dinh-nang-luong-cap-bac-ham-trung-tuong-cong-an-nhan-dan-42974.html (*thứ cấp*, trích điều khoản).
- *Điều tra viên:* Luật Tổ chức cơ quan điều tra hình sự 2015 (99/2015/QH13): ba ngạch sơ cấp, trung cấp, cao cấp (Điều 45). Sơ cấp: ≥ 4 năm công tác pháp luật + thi tuyển (Điều 47). Trung cấp: ≥ 5 năm làm sơ cấp + thi (Điều 48). Cao cấp: ≥ 5 năm trung cấp + thi, hoặc ≥ 14 năm công tác pháp luật nếu có nhu cầu (Điều 49). Cán bộ điều tra giúp điều tra viên (Điều 59). Thủ trưởng cơ quan điều tra là điều tra viên trung/cao cấp (Điều 57). Nhiệm kỳ điều tra viên lần đầu 5 năm. Nguồn: https://ketoananpha.vn/luat-to-chuc-co-quan-dieu-tra-hinh-su-2015 (*toàn văn*, bản chép lại); https://thuvienphapluat.vn/lao-dong-tien-luong/dieu-kien-bo-nhiem-dieu-tra-vien-cao-cap-la-gi-15363.html (*thứ cấp*). Chưa kiểm tra luật này có bị sửa đổi năm 2025 (khi bỏ công an cấp huyện) hay không.
- *Hải quan:* Thông tư 29/2022/TT-BTC: kiểm tra viên cao cấp hải quan (08.049), kiểm tra viên chính (08.050, A2.1), kiểm tra viên (08.051), kiểm tra viên trung cấp (08.052, A0), nhân viên hải quan (08.053). Nguồn: https://thuvienphapluat.vn/lao-dong-tien-luong/kiem-tra-vien-trung-cap-hai-quan-co-ma-so-ngach-bao-nhieu-21445.html ; https://vanban.vcci.com.vn/thong-tu-292022tt-btc-quy-dinh-ve-ma-so-tieu-chuan-chuyen-mon-nghiep-vu-va-xep-luong-doi-voi-cac-ngach-cong-chuc-chuyen-nganh-ke-toan-thue-hai-quan-du-tru (*thứ cấp*). Sau Luật CBCC 2025 các ngạch này được xếp "tương đương" ngạch chung — chưa xác nhận tên còn giữ.
- *Kiểm lâm:* Thông tư 08/2022/TT-BNNPTNT (hiệu lực 06/10/2022): kiểm lâm viên chính (10.225, A2.1), kiểm lâm viên (10.226, A1), kiểm lâm viên trung cấp (10.228, B). Nguồn: https://luatvietnam.vn/can-bo/thong-tu-08-2022-tt-bnnptnt-227888-d1.html ; https://thuvienphapluat.vn/hoi-dap-phap-luat/bang-luong-cong-chuc-chuyen-nganh-kiem-lam-nam-2023-138009279.html (*thứ cấp*).
- *Bảo vệ:* Nghị định 96/2016/NĐ-CP (sửa đổi bởi NĐ 56/2023/NĐ-CP): cơ sở kinh doanh dịch vụ bảo vệ chỉ được dùng nhân viên đã được đào tạo và cấp chứng chỉ nghiệp vụ bảo vệ (do Công an cấp sau sát hạch); nhân viên cần tốt nghiệp THCS trở lên. Nguồn: https://luatminhkhue.vn/trach-nhiem-cua-co-so-kinh-doanh-dich-vu-bao-ve.aspx ; https://ketoanthuanthien.vn/hoi-dap/doanh-nghiep-hoat-dong-trong-linh-vuc-bao-ve-phai-co-nhung-chung-chi-nao/ (*thứ cấp*). Một nguồn nhắc NĐ 58/2026/NĐ-CP sửa đổi tiếp — *chưa xác nhận*.
- *Cứu hộ:* Thông tư 03/2018/TT-BVHTTDL: nhân viên cứu hộ bơi, lặn phải có giấy chứng nhận tập huấn chuyên môn cứu hộ (Tổng cục TDTT, Hiệp hội Thể thao dưới nước VN hoặc Sở VHTTDL cấp); tối thiểu 1 nhân viên/200 m² mặt nước hoặc 50 người bơi. Nguồn: https://caselaw.vn/van-ban-phap-luat/303360-thong-tu-03-2018-tt-bvhttdl-quy-dinh-ve-co-so-vat-chat-trang-thiet-bi-va-tap-huan-nhan-vien-chuyen-mon-doi-voi-mon-boi-lan-do-bo-truong-bo-van-hoa-the-thao-va-du-lich-ban-hanh ; https://luatminhkhue.vn/dieu-kien-kinh-doanh-dich-vu-be-boi.aspx (*thứ cấp*).

**Quyết định.**
- Ngành công an lên cấp chậm và gắn với cấp hàm, nên `years_experience` ghi theo thời hạn thăng cấp (ví dụ Trưởng phòng công an tỉnh 16–25 năm) dù band chỉ là L7. Cấp hàm (A) lấy từ luật; gắn cấp hàm với chức vụ (đội trưởng, trưởng công an xã...) là thông lệ, không phải quy định cứng (B). Chức danh "trưởng công an xã, phường" dùng vì công an cấp huyện đã bỏ từ 2025 (thông tin báo chí, *chưa xác nhận* văn bản).
- Lính cứu hỏa ở Việt Nam là Cảnh sát PCCC và CNCH thuộc Bộ Công an, nên thang đi theo cấp hàm + chức vụ; L1 là chiến sĩ nghĩa vụ. Quản giáo dùng chức danh của Luật Thi hành án hình sự (giám thị, phân trại) theo cách gọi phổ biến, *chưa đọc* luật.
- "Cán bộ hải quan và biên phòng cửa khẩu": chỉ dựng thang hải quan. Bộ đội biên phòng theo cấp bậc quân hàm (Luật Sĩ quan QĐND) không được nghiên cứu trong phiên này. Chức vụ cấp chi cục sau sắp xếp 2025 (chi cục hải quan khu vực, hải quan cửa khẩu) để C vì chưa xác nhận cơ cấu.
- Điều tra viên: L6 (đội trưởng) chen giữa trung cấp và cao cấp vì ngạch cao cấp thực tế đến muộn hơn chức vụ đội trưởng; đây là suy luận (B).

## 4. Pháp lý (3 nghề)

**Hệ thống dùng.**
- *Thẩm phán:* Luật Tổ chức Tòa án nhân dân 2024 (34/2024/QH15, hiệu lực 01/01/2025). Điều 94: từ đủ 28 tuổi, cử nhân luật, đã đào tạo nghiệp vụ xét xử, có thời gian công tác pháp luật; Điều 95 khoản 1: ≥ 5 năm công tác pháp luật và trúng tuyển kỳ thi tuyển chọn Thẩm phán. Nguồn: https://tapchitoaan.vn/tieu-chuan-dieu-kien-bo-nhiem-tham-phan-toa-an-nhan-dan-toa-an-nhan-dan-toi-cao-tu-0101202512737.html (*thứ cấp*, Tạp chí Tòa án nhân dân, trích nguyên văn).
- *Bậc Thẩm phán:* Nghị quyết 67/2025/UBTVQH15, sửa đổi bởi Nghị quyết 82/2025/UBTVQH15, hợp nhất tại Văn bản hợp nhất 160/VBHN-VPQH: ba bậc Thẩm phán TAND. Bậc 1: xét xử vụ việc của TAND khu vực. Bậc 2: bậc 1 từ đủ 5 năm, hoặc người có ≥ 10 năm công tác pháp luật bổ nhiệm lần đầu. Bậc 3: bậc 2 từ đủ 5 năm, hoặc ≥ 15 năm công tác pháp luật; xử vụ khó, giám đốc thẩm, tái thẩm. Nâng bậc xét chất lượng xét xử 5 năm liền kề, ít nhất 1 năm hoàn thành xuất sắc. Nguồn: https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/9/160-vbhn-vpqh.pdf (*toàn văn*, trang chính thức Cổng TTĐT Chính phủ).
- *Luật sư:* Luật Luật sư 2006 (65/2006/QH11), sửa đổi 2012 (20/2012/QH13): đào tạo nghề luật sư 12 tháng; tập sự 12 tháng tại tổ chức hành nghề (giảm còn 4 hoặc 6 tháng cho một số đối tượng); kiểm tra kết quả tập sự do Liên đoàn Luật sư Việt Nam tổ chức; sau đó cấp chứng chỉ hành nghề, gia nhập Đoàn luật sư, cấp thẻ luật sư. Nguồn: https://baophapluat.vn/luat-luat-su-sua-doi-thoang-hon-cho-luat-su-hanh-nghe-post109182.html ; https://lsvn.vn/thoi-gian-phai-dang-ky-kiem-tra-ket-qua-tap-su-hanh-nghe-luat-su-sau-khi-tap-su-xong-1677638860-a128220.html (*thứ cấp*). Thang trong công ty luật (associate → senior associate → partner → managing partner) theo tin tuyển dụng (B).
- *Pháp chế doanh nghiệp:* thang doanh nghiệp theo tin tuyển dụng (B). Nghị định 55/2011/NĐ-CP về công tác pháp chế — *chưa xác nhận* phạm vi áp dụng cho doanh nghiệp.

**Quyết định.**
- Thẩm phán dùng đủ 7 cấp từ L2 (thư ký Tòa án) đến L9 (Thẩm phán TAND tối cao); L4 bị bỏ trống vì không có chức danh trung gian giữa thẩm tra viên và thẩm phán bậc 1. Tên chức danh thư ký, thẩm tra viên lấy theo cách gọi trong ngành, *chưa đọc* quy định ngạch.
- Luật sư: L2–L4 đều có căn cứ luật (đào tạo nghề → tập sự → chứng chỉ hành nghề); từ L5 trở lên là thang công ty.

## 5. Vận tải và bốc dỡ hàng hóa (11 nghề)

**Hệ thống dùng.**
- *Giấy phép lái xe:* Luật Trật tự, an toàn giao thông đường bộ 2024 (36/2024/QH15), Điều 57 (hạng GPLX) và Điều 60 khoản 3 (các đường nâng hạng B → C1/C/D1/D2; C1 → C/D1/D2; C → D1/D2/D; D1 → D2/D; D2 → D; và lên các hạng kéo rơ moóc BE, C1E, CE, D1E, D2E, DE). Luật sửa đổi 10 luật về an ninh, trật tự 2025 cho phép nâng từ C, D1, D2, D lên CE. Thời gian lái xe an toàn tối thiểu để nâng hạng theo Thông tư 14/2025/TT-BXD, sửa đổi bởi Thông tư 17/2026/TT-BXD (hiệu lực 01/7/2026): phần lớn đường nâng 2 năm; B → D2, C → CE, C → D, D1/D2 → CE 3 năm. Nguồn: https://lsvn.vn/sua-doi-thoi-gian-lai-xe-an-toan-de-nang-hang-gplx-a172726.html ; https://thuviennhadat.vn/phap-luat/dieu-kien-nang-hang-giay-phep-lai-xe-608059.html (*thứ cấp*). Định nghĩa từng hạng theo tải trọng/số chỗ (C1 xe tải 3,5–7,5 tấn; C trên 7,5 tấn; D1 đến 16 chỗ; D2 đến 29 chỗ; D trên 29 chỗ) theo hiểu biết, *chưa đọc toàn văn* Điều 57.
- *Lái tàu:* Luật Đường sắt 2017 Điều 36 (tuổi 23–55 nam, 23–50 nữ; bằng/chứng chỉ chuyên ngành; thời gian làm phụ lái; sát hạch). Thông tư 15/2023/TT-BGTVT Điều 28: phụ lái tàu an toàn liên tục ≥ 24 tháng (≥ 12 tháng với một loại giấy phép); Cục Đường sắt VN sát hạch, cấp giấy phép; giấy phép thời hạn 10 năm. Nguồn: https://thuvienphapluat.vn/hoi-dap-phap-luat/giay-phep-lai-tau-tren-duong-sat-gom-co-may-loai-138072147.html ; https://thuvienphapluat.vn/lao-dong-tien-luong/dieu-kien-cap-giay-phep-lai-tau-tren-duong-sat-la-gi-7333.html (*thứ cấp*). Một nguồn nhắc văn bản thay thế năm 2025 thuộc Bộ Xây dựng — *chưa xác nhận*.
- *Thuyền viên tàu biển:* Thông tư 20/2023/TT-BGTVT (hiệu lực 01/9/2023). Sĩ quan boong tàu ≥ 500 GT: thực tập ghi sổ ≥ 12 tháng hoặc đi biển ≥ 36 tháng (trong đó ≥ 18 tháng trên tàu ≥ 500 GT, có 6 tháng làm thủy thủ trực ca AB) (Điều 28). Đại phó tàu ≥ 3000 GT: ≥ 24 tháng làm sĩ quan boong tàu ≥ 500 GT; thuyền trưởng tàu ≥ 3000 GT: ≥ 24 tháng làm đại phó tàu ≥ 3000 GT, hoặc 12 tháng thuyền trưởng tàu 500–3000 GT + 12 tháng đại phó tàu ≥ 3000 GT (Điều 24); kèm tiếng Anh hàng hải, bồi dưỡng và thi. Nguồn: https://luatvietnam.vn/lao-dong/thong-tu-20-2023-tt-bgtvt-tieu-chuan-chuyen-mon-chung-chi-dao-tao-huan-luyen-thuyen-vien-262241-d1.html (*toàn văn* các điều đã đọc). Trang này ghi TT 20/2023 đã được thay thế bởi Thông tư 77/2026/TT-BXD — **chưa đọc** văn bản mới, số tháng có thể đã đổi.
- *Đăng kiểm:* Nghị định 139/2018/NĐ-CP sửa đổi bởi NĐ 30/2023/NĐ-CP: đăng kiểm viên xe cơ giới cần tốt nghiệp đại học kỹ thuật cơ khí phù hợp, ≥ 12 tháng thực tập nghiệp vụ (rút còn 6 hoặc 3 tháng nếu từng làm ở xưởng bảo hành ô tô), có GPLX ô tô, đạt đánh giá nghiệp vụ; đăng kiểm viên bậc cao được Cục Đăng kiểm đánh giá trên dây chuyền (5 công đoạn); người lãnh đạo đơn vị đăng kiểm phải là đăng kiểm viên bậc cao. Nguồn: https://thuvienphapluat.vn/phap-luat/de-duoc-cap-chung-chi-dang-kiem-vien-xe-co-gioi-thi-ca-nhan-phai-co-toi-thieu-12-thang-thuc-tap-ngh-18101-128305.html ; https://thuvienphapluat.vn/lao-dong-tien-luong/nguoi-lanh-dao-don-vi-dang-kiem-phai-la-dang-kiem-vien-xe-co-gioi-bac-cao-5258.html ; https://thuvienphapluat.vn/hoi-dap-phap-luat/danh-gia-nghiep-vu-dang-kiem-vien-xe-co-gioi-bac-cao-206982.html (*thứ cấp*; một phần trích Thông tư 51/2016 có thể đã cũ).
- *Phi công, kiểm soát viên không lưu, tiếp viên:* giấy phép và năng định do Cục Hàng không Việt Nam cấp; KSVKL cần tiếng Anh ICAO mức 4. Thang chức danh (cơ phó → cơ trưởng → cơ trưởng giáo viên; KSVKL tại sân → tiếp cận/đường dài → kíp trưởng; tiếp viên phổ thông → thương gia → tiếp viên trưởng) là thông lệ hãng/VATM. Một nguồn báo chí nêu cơ trưởng cần tối thiểu 3.500 giờ bay (≥ 500 giờ cơ trưởng A320/321) và cơ phó ≥ 1.000 giờ, không rõ của hãng nào. Nguồn: https://www.careerlink.vn/cam-nang-viec-lam/dinh-huong-nghe-nghiep/nghe-kiem-soat-khong-luu ; https://vov.vn/kinh-te/chi-tiet-bang-luong-moi-cua-phi-cong-vietnam-airlines-377301.vov ; https://www.vcci.com.vn/tin-tuc/doanh-nghiep-hang-khong-ham-nong-bau-troi-viet (*thứ cấp*). Văn bản giấy phép nhân viên hàng không (Thông tư 10/2018/TT-BGTVT, Bộ quy chế an toàn hàng không VAR) — *chưa xác nhận*.
- *Xe nâng, cần cẩu, bốc xếp, thu gom rác:* bậc kỹ năng nghề quốc gia (xem nhóm 6) cho thợ vận hành cẩu; còn lại là thang doanh nghiệp/số năm. Chứng chỉ vận hành xe nâng và huấn luyện an toàn cho công việc có yêu cầu nghiêm ngặt (Nghị định 44/2016/NĐ-CP) — *chưa xác nhận*.

**Quyết định.**
- Tài xế xe tải và xe khách: các cấp L2–L4 dựng trực tiếp trên hạng GPLX (A), vì ở Việt Nam hạng bằng là thứ phân biệt lương và loại xe được lái. Số năm cộng dồn theo thời gian lái xe an toàn tối thiểu khi nâng hạng. Không có thợ lái nào lên L7+, nên thang dừng ở điều hành đội xe (L6).
- Thuyền viên: dùng các chức danh trong thông tư (thủy thủ trực ca → sĩ quan boong → đại phó → thuyền trưởng), chưa tách hạng tàu < 500 GT / 500–3000 GT / ≥ 3000 GT để giữ thang trong 7 cấp; L7 "thuyền trưởng tàu lớn/superintendent" là B.
- Đăng kiểm viên, thanh tra giao thông: chỉ dựng nhánh đăng kiểm; nhánh thanh tra (ngạch thanh tra viên) đưa vào L7 dưới dạng C.
- KSVKL: cấp OJTI (huấn luyện tại vị trí) để C vì chưa tìm được tên chức danh trong văn bản Việt Nam.
- Công nhân lái xe ép rác (L3) để C: cần GPLX hạng C1/C, suy ra từ tải trọng xe ép rác thông dụng.

## 6. Lắp đặt, bảo trì, sửa chữa (9 nghề) và Xây dựng, khai khoáng (8 nghề)

**Hệ thống dùng.**
- *Bậc kỹ năng nghề quốc gia (5 bậc):* Nghị định 31/2015/NĐ-CP, Điều 16 — điều kiện dự đánh giá. Theo con đường chỉ có kinh nghiệm: bậc 1 ai cũng dự được; bậc 2 cần ≥ 3 năm làm liên tục trong nghề; bậc 3 ≥ 6 năm; bậc 4 ≥ 10 năm; bậc 5 ≥ 15 năm. Có bằng thì nhanh hơn: tốt nghiệp trung cấp → dự bậc 2 ngay, bậc 3 sau 2 năm; cao đẳng → dự bậc 3 ngay, bậc 4 sau 3 năm; đại học → bậc 4 ngay, bậc 5 sau 3–5 năm. Kinh nghiệm chứng minh bằng hợp đồng lao động hoặc xác nhận của UBND xã. Nguồn: https://caselaw.vn/van-ban-phap-luat/116867-nghi-dinh-31-2015-nd-cp-huong-dan-luat-viec-lam-ve-danh-gia-cap-chung-chi-ky-nang-nghe-quoc-gia (*toàn văn*, bản chép lại); văn bản gốc trên moj.gov.vn (chưa mở).
- *Lưu ý hiệu lực:* Luật Việc làm 2025 (74/2025/QH15, hiệu lực 01/01/2026) có Chương V (Điều 22–26) về khung trình độ, tiêu chuẩn và chứng chỉ kỹ năng nghề quốc gia; nghị định hướng dẫn mới đang được Bộ GD&ĐT soạn (theo công văn lịch đánh giá 2026). **Chưa xác nhận** NĐ 31/2015 còn áp dụng hay đã có nghị định thay thế; số năm theo NĐ 31/2015 có thể đổi. Nguồn: https://hrspring.vn/tin-tuc/luat-viec-lam-2025-so-74-2025-qh15 ; https://tsd.mitc.edu.vn/wp-content/uploads/2025/12/CV-8417-BGDDT-Cong-bo-lich-trinh-2026.pdf (*thứ cấp*).
- *Bậc an toàn điện (1/5–5/5):* Thông tư 05/2021/TT-BCT. Bậc 1/5 không tiếp xúc điện; 2/5 làm ở nơi đã cắt điện hoàn toàn; 3/5 làm với đường dây, thiết bị hạ áp mang điện và nơi cắt điện từng phần; 4/5 làm với cao áp mang điện, lập biện pháp an toàn, giám sát người khác. Nguồn: https://luatminhkhue.vn/noi-dung-huan-luyen-sat-hach-xep-bac-va-cap-the-an-toan-dien.aspx ; https://lawnet.vn/thong-tin-phap-luat/en/tu-van-luat/what-are-the-tasks-permitted-for-each-safety-grade-in-vietnam-116073.html (*thứ cấp*). Trang atld.vn ghi thông tư đã được thay bởi 02/2025/TT-BCT — **chưa xác nhận** nội dung mới.
- *Bảo dưỡng tàu bay:* giấy phép nhân viên bảo dưỡng (B1/B2) do Cục Hàng không cấp — *chưa xác nhận* văn bản; thang hãng/công ty bảo dưỡng là B.
- *Ô tô, xe máy, viễn thông, khai thác mỏ:* thang doanh nghiệp (kỹ thuật viên → kỹ thuật viên trưởng → quản đốc/giám đốc dịch vụ; thợ lò → lò trưởng → quản đốc phân xưởng) theo cách gọi trong tin tuyển dụng (B).

**Quyết định.**
- Mẫu chung cho thợ: L1 thợ phụ/học việc → L2 bậc 1 → L3 bậc 2 → L4 bậc 3 → L5 thợ cả bậc 4 → L6 tổ trưởng/giám sát. Cột năm theo con đường kinh nghiệm thuần (3/6/10 năm); người học trung cấp/cao đẳng lên nhanh hơn. Bậc 5 (≥ 15 năm) không tách thành cấp riêng vì ở công trường bậc 5 ít khi khác thợ cả về trách nhiệm.
- Nghề job zone 2 (thợ xây, mộc, sơn, kết cấu thép) gộp bậc 1–2 thành một cấp để thang còn 5 cấp.
- Gắn chức danh "thợ ... bậc N" với chứng chỉ kỹ năng nghề quốc gia là ánh xạ của nhóm (A cho điều kiện bậc). Ngoài thị trường nhiều thợ không đi thi chứng chỉ; "thợ bậc" vẫn là cách gọi trong thang lương nội bộ doanh nghiệp.
- Công nhân đường dây: dùng song song bậc thợ và bậc an toàn điện vì việc được phép làm phụ thuộc bậc an toàn điện.
- Khai thác mỏ: O*NET là người vận hành máy khai thác liên tục; ở Việt Nam gần nhất là thợ lò than. Thang lò trưởng → quản đốc là B, chưa đọc quy chế của TKV.

## 7. Bán hàng (9 nghề)

**Hệ thống dùng.**
- *Đại lý bảo hiểm:* Luật Kinh doanh bảo hiểm 2022 (08/2022/QH15) và Thông tư 69/2022/TT-BTC (sửa đổi bởi 85/2024/TT-BTC) về chứng chỉ đại lý bảo hiểm (thi 40 câu/60 phút; chứng chỉ cấp trước 01/01/2023 phải chuyển đổi trước 31/12/2025). Nguồn: https://luatvietnam.vn/tin-van-ban-moi/chung-chi-dai-ly-bao-hiem-cap-truoc-2023-chi-duoc-su-dung-den-het-2025-186-92396-article.html ; https://thuvienphapluat.vn/hoi-dap-phap-luat/quy-dinh-ve-to-chuc-thi-chung-chi-dai-ly-bao-hiem-tu-15012025-138041750.html (*thứ cấp*). Thang kênh đại lý (tư vấn viên → UM → SM/DM → giám đốc khu vực) theo ví dụ Chubb Life, Hanwha Life: https://accgroup.vn/sdm-la-chuc-vu-gi ; https://www.careerlink.vn/cam-nang-luong/chuyen-vien-tu-van-bao-hiem-la-gi/ (*thứ cấp*, B).
- *Môi giới chứng khoán:* Luật Chứng khoán 2019 (54/2019/QH14) Điều 97: ba loại chứng chỉ hành nghề (môi giới, phân tích tài chính, quản lý quỹ), cần đại học + chứng chỉ chuyên môn + thi sát hạch; thu hồi nếu không hành nghề 3 năm liên tục; thủ tục tại Điều 213 NĐ 155/2020/NĐ-CP. Nguồn: https://thuvienphapluat.vn/hoi-dap-phap-luat/dap-ung-dieu-kien-nao-de-duoc-cap-chung-chi-hanh-nghe-chung-khoan-138002658.html (*thứ cấp*).
- *Môi giới bất động sản:* Luật Kinh doanh bất động sản 2023 (29/2023/QH15, hiệu lực 01/01/2025) Điều 61: cá nhân hành nghề phải có chứng chỉ hành nghề và hành nghề trong một sàn giao dịch hoặc doanh nghiệp môi giới; Điều 70: dự sát hạch cần tốt nghiệp THPT và giấy chứng nhận hoàn thành khóa bồi dưỡng. Nguồn: https://plo.vn/moi-gioi-bat-dong-san-phai-co-chung-chi-hanh-nghe-post781015.html ; https://thuvienphapluat.vn/banan/tin-tuc/moi-gioi-bat-dong-san-phai-co-chung-chi-khong-tu-do-hanh-nghe-tu-thang-012025-8999 (*thứ cấp*).
- *Thu ngân, bán lẻ, sales B2B, kỹ sư kinh doanh, kinh doanh tour, người mẫu:* thang doanh nghiệp theo cách gọi trên tin tuyển dụng (B). Điều kiện người phụ trách kinh doanh lữ hành (Luật Du lịch 2017) — *chưa xác nhận*, không dùng làm cấp riêng.

**Quyết định.**
- Bảo hiểm và bất động sản: cấp L2 gắn với chứng chỉ bắt buộc (A); từ L3 là thang doanh số, lên nhanh hơn IT (trưởng nhóm sau 2–4 năm) vì thăng tiến dựa vào doanh số và số người tuyển được.
- Người mẫu: thang ngắn (5 cấp), "vedette" để C vì không có tiêu chuẩn chính thức; điểm cuối là huấn luyện viên/giám đốc người mẫu thay vì cấp quản lý cao.

## 8. Chăm sóc và dịch vụ cá nhân (10 nghề)

**Hệ thống dùng.**
- *Hướng dẫn viên du lịch:* Luật Du lịch 2017 (09/2017/QH14): ba loại thẻ — tại điểm, nội địa, quốc tế. Thẻ nội địa: trung cấp chuyên ngành hướng dẫn du lịch hoặc trung cấp ngành khác + chứng chỉ nghiệp vụ nội địa. Thẻ quốc tế: cao đẳng chuyên ngành hướng dẫn hoặc ngành khác + chứng chỉ nghiệp vụ quốc tế, và thành thạo ngoại ngữ đăng ký (khoản 2 Điều 59; tiêu chuẩn ngoại ngữ tại Thông tư 06/2017/TT-BVHTTDL sửa bởi 13/2019/TT-BVHTTDL). Hướng dẫn viên phải có hợp đồng với doanh nghiệp lữ hành hoặc là hội viên tổ chức nghề nghiệp. Nguồn: https://thuvienphapluat.vn/lao-dong-tien-luong/dieu-kien-nao-de-duoc-cap-the-huong-dan-vien-du-lich-quoc-te-5423.html ; https://thuvienphapluat.vn/hoi-dap-phap-luat/can-dap-ung-cac-dieu-kien-gi-de-tro-thanh-mot-huong-dan-vien-du-lich-278754.html (*thứ cấp*).
- *Còn lại (thú cưng, tang lễ, làm tóc, trang điểm, nail, spa, bảo mẫu, PT, hoạt náo):* không tìm thấy hệ thống bậc chính thức; dùng thang salon/spa/phòng tập phổ biến (học viên → thợ phụ/assistant → thợ chính/stylist → senior/top → quản lý). B.
- Ghi chú pháp lý liên quan nhưng chưa dùng làm cấp: spa chỉ được làm dịch vụ không xâm lấn (thẩm mỹ xâm lấn thuộc Luật Khám bệnh, chữa bệnh 2023); quản lý nghĩa trang, nhà tang lễ theo Nghị định 23/2016/NĐ-CP; người hướng dẫn tập luyện thể thao ở cơ sở kinh doanh cần chứng nhận chuyên môn theo thông tư từng môn — cả ba **chưa xác nhận** trong phiên này.

**Quyết định.**
- Hướng dẫn viên: thang L2–L4 đi theo ba loại thẻ (tại điểm → nội địa → quốc tế), dù trên thực tế có thể xin thẻ quốc tế ngay nếu đủ bằng cấp; thứ tự này phản ánh phạm vi hành nghề rộng dần.
- Bảo mẫu: thang 4 cấp; cấp "cô nuôi có chứng chỉ chăm sóc trẻ" để C vì chưa xác định văn bản yêu cầu chứng chỉ cho nhóm trẻ độc lập.
- "Nhân viên tổ chức hoạt động vui chơi giải trí" có job zone 4 trong O*NET (Recreation Workers) nhưng ở Việt Nam gần nhất là animator/hoạt náo viên của resort, khu vui chơi; thang dừng ở L7 (giám đốc vận hành khu vui chơi).

## 9. Chế biến và phục vụ ăn uống (3 nghề)

**Hệ thống dùng.** Thang bếp kiểu brigade (phụ bếp/commis → đầu bếp/demi chef → chef de partie → bếp phó/sous chef → bếp trưởng → bếp trưởng điều hành) được khách sạn, nhà hàng Việt Nam dùng nguyên tên tiếng Anh trên tin tuyển dụng (ví dụ Hoteljob.vn: https://www.hoteljob.vn/viec-lam/333258-chef-de-partie-commissary). Thang phục vụ, pha chế theo khách sạn/chuỗi F&B. B. Nghề "kỹ thuật chế biến món ăn" có thể có tiêu chuẩn kỹ năng nghề quốc gia hoặc tiêu chuẩn nghề du lịch VTOS — *chưa xác nhận*, nên không gắn bậc.

**Quyết định.** Đầu bếp lên đến L7 dù job zone 2, vì bếp trưởng điều hành của khách sạn/chuỗi thực sự quản lý nhiều bếp. Phục vụ lên L6 (giám đốc F&B khách sạn) theo lộ trình phổ biến ở khách sạn.

## 10. Hỗ trợ y tế (5 nghề)

**Hệ thống dùng.** Không có chức danh viên chức riêng đã xác nhận cho hộ lý, trợ thủ nha khoa, trợ lý y khoa, chăm sóc tại nhà, massage trị liệu. NĐ 232/2026 có Phụ lục III (vị trí hỗ trợ) — chưa đọc được, có thể chứa "hộ lý". Thang dùng thông lệ bệnh viện, phòng khám tư (B/C).

**Quyết định.**
- Không cho các nghề này "leo" sang chức danh có giấy phép hành nghề (điều dưỡng, kỹ thuật viên vật lý trị liệu, bác sĩ) vì đó là nghề khác, cần bằng và giấy phép theo Luật Khám bệnh, chữa bệnh 2023; thang dừng ở L5–L6 (tổ trưởng, quản lý vận hành).
- Chăm sóc tại nhà và hộ lý chỉ 4 cấp: công việc chủ yếu khác nhau theo số năm và độ nặng của người bệnh.

## 11. Nông nghiệp, ngư nghiệp, lâm nghiệp (4 nghề)

**Hệ thống dùng.**
- *Thuyền viên tàu cá:* Thông tư 22/2018/TT-BNNPTNT (hiệu lực 01/01/2019) về thuyền viên tàu cá, sửa đổi nhiều lần, gần nhất bởi Thông tư 30/2025/TT-BNNMT; văn bản hợp nhất 27/VBHN-BNNMT (2025) trên trang Chính phủ: https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/8/27-vbhn-bnnmt.pdf (chưa đọc nội dung). Chứng chỉ thuyền trưởng tàu cá hạng I, II, III (hạng cao được làm hạng thấp hơn); tàu cá chia nhóm theo chiều dài (≥ 24 m; 15–< 24 m; 12–< 15 m; 6–< 12 m). Nguồn: https://lawnet.vn/thong-tin-phap-luat/en/chinh-sach-moi/vietnam-new-regulations-on-certificates-and-certifications-for-fishermen-on-fishing-vessels-154254.html ; https://lawnet.vn/thong-tin-phap-luat/en/chinh-sach-moi/vietnam-details-of-04-groups-of-fishing-vessels-according-to-circular-22-2018-tt-bnnptnt-154252.html (*thứ cấp*). Điều kiện thời gian đi biển từng hạng **chưa xác nhận** → cột năm là ước lượng.
- *Trồng trọt, chăn nuôi, lâm nghiệp:* bậc kỹ năng nghề quốc gia (NĐ 31/2015) cho cấp "công nhân kỹ thuật bậc 2–3"; các cấp khác là số năm hoặc chức vụ nông trường/trang trại.

**Quyết định.** Lao động nông lâm ngư là nhóm thang ngắn nhất (5–6 cấp), dừng ở L5–L6 (chủ/quản lý trang trại, chủ tàu). "Trưởng trạm/quản đốc lâm trường" để C vì phần lớn lâm trường quốc doanh đã chuyển đổi thành công ty lâm nghiệp, chức danh thực tế khác nhau.

## 12. Toán học và thống kê (3 nghề)

**Hệ thống dùng.**
- *Thống kê:* Thông tư 08/2023/TT-BKHĐT (hiệu lực 15/11/2023): thống kê viên cao cấp (23.261, A3.1), thống kê viên chính (23.262, A2.1), thống kê viên (23.263, A1), thống kê viên trung cấp (23.264, A0), nhân viên thống kê (23.265, B). Nguồn: https://luatvietnam.vn/lao-dong/thong-tu-08-2023-tt-bkhdt-xep-luong-doi-voi-ngach-cong-chuc-chuyen-nganh-thong-ke-268654-d1.html ; https://hcc.nghean.gov.vn/tin-tong-hop/quy-dinh-moi-xep-luong-cac-ngach-cong-chuc-chuyen-nganh-thong-ke-775.html (*thứ cấp*). Sau Luật CBCC 2025 và sắp xếp bộ máy 2025 (cơ quan thống kê chuyển về Bộ Tài chính), tên ngạch có thể đổi — *chưa xác nhận*.
- *Định phí bảo hiểm:* Luật Kinh doanh bảo hiểm 2022 Điều 81 và Nghị định 46/2023/NĐ-CP (Điều 29, 30) quy định doanh nghiệp bảo hiểm phải có chuyên gia tính toán đáp ứng điều kiện. Nguồn: https://luatminhkhue.vn/quy-dinh-chuyen-gia-tinh-toan-cua-doanh-nghiep-bao-hiem-nhan-tho.aspx ; https://hoatieu.vn/phap-luat/nghi-dinh-46-2023-nd-cp-221616 (*thứ cấp*). Điều kiện chi tiết (số năm, hội viên hiệp hội actuary) **chưa xác nhận**; các cấp ASA/FSA lấy theo thông lệ nghề (B).
- *Nghiên cứu vận trù:* thang doanh nghiệp (analyst → senior → lead → manager → director), B.

**Quyết định.** Thống kê dùng ngạch công chức vì người làm thống kê chuyên nghiệp ở Việt Nam tập trung ở hệ thống thống kê nhà nước; nhánh doanh nghiệp (data analyst) thuộc nghề khác. Cấp L4 "thống kê viên phụ trách chuyên đề" là C.

## 13. Văn phòng và hỗ trợ hành chính (9 nghề)

**Hệ thống dùng.**
- *Tiếp nhận hồ sơ hành chính công:* công chức theo Luật Cán bộ, công chức 2025 (ngạch cán sự/chuyên viên/chuyên viên chính, xem Quy ước chung). Cơ chế một cửa theo Nghị định 61/2018/NĐ-CP (sửa đổi 107/2021/NĐ-CP) — *chưa xác nhận* có văn bản thay thế sau sắp xếp chính quyền hai cấp 2025.
- *Giao dịch viên ngân hàng, bưu chính, CSKH, lễ tân, shipper, điều phối, kho, hành chính:* thang doanh nghiệp (B). Không tìm thấy hệ thống bậc chính thức; tên chức danh lấy theo cách gọi phổ biến của ngân hàng thương mại, Bưu điện Việt Nam, khách sạn, công ty giao nhận.

**Quyết định.**
- Nhóm job zone 2 nhưng đa số có lộ trình quản lý rõ trong doanh nghiệp, nên thang 5–6 cấp, dừng ở L5–L6 (giám đốc phòng giao dịch, trưởng bộ phận tiền sảnh, trưởng phòng hành chính). Không đưa lên L7+ vì từ đó là nghề quản lý (thuộc nhóm "Quản lý" do agent khác làm).
- Shipper: cấp L3 (xe tải nhẹ) ngầm cần GPLX hạng B/C1 — không ghi bắt buộc vì nhiều công ty chỉ dùng xe máy.

## 14. Vệ sinh và bảo dưỡng tòa nhà, cảnh quan (3 nghề)

**Hệ thống dùng.** Thang buồng phòng khách sạn (room attendant → floor supervisor → assistant executive housekeeper → executive housekeeper), B. Cây xanh đô thị: bậc kỹ năng nghề quốc gia cho cấp công nhân kỹ thuật; tổ, đội theo công ty công viên cây xanh. Kiểm soát côn trùng: thang công ty dịch vụ; yêu cầu tập huấn sử dụng hóa chất diệt côn trùng (Nghị định 91/2016/NĐ-CP) — *chưa xác nhận*.

**Quyết định.** "Nhân viên vệ sinh và buồng phòng" bỏ trống L3 vì từ nhân viên lên thẳng giám sát tầng là bước phổ biến; job zone 3 của O*NET (Janitors) có vẻ cao so với thực tế Việt Nam, nên thang dừng ở L6.

---

## Tổng kết

- 98/98 nghề, 564 dòng cấp. Độ dài thang: 4 cấp × 5 nghề, 5 cấp × 35, 6 cấp × 37, 7 cấp × 21. Không có thang 2–3 cấp: kể cả nghề lao động phổ thông vẫn có ít nhất thời vụ → chính thức → lành nghề → tổ trưởng.
- Band bắt đầu: L1 cho 91 nghề, L2 cho 7 nghề (công an, quản giáo, kiểm lâm, hải quan, điều tra viên, thẩm phán, giảng viên — vào nghề bằng tuyển dụng sau đào tạo chính quy, không có cấp học việc trong tổ chức). Band kết thúc: L5 (21), L6 (35), L7 (19), L8 (21), L9 (2: giảng viên đại học, thẩm phán).
- Bằng chứng: A 131 dòng (23%), B 411 (73%), C 22 (4%).

**Giả định yếu nhất (nên kiểm lại trước khi dùng cho game):**
1. Ánh xạ hạng → bậc nghề nghiệp viên chức cho các ngành ngoài giáo dục suy từ loại lương (Điều 18 NĐ 232/2026), chưa đối chiếu Phụ lục II, III.
2. NĐ 31/2015 về bậc kỹ năng nghề có thể đã bị thay sau Luật Việc làm 2025; số năm 3/6/10/15 có thể đổi.
3. Thông tư thuyền viên tàu biển (20/2023) được ghi là đã bị thay bởi TT 77/2026/TT-BXD; bậc an toàn điện (05/2021/TT-BCT) có thể đã bị thay bởi 02/2025/TT-BCT.
4. Gắn cấp hàm công an với chức vụ (đội trưởng, trưởng phòng) là thông lệ, không phải quy định.
5. Số năm kinh nghiệm cho các cấp doanh nghiệp (B/C) là ước lượng từ tin tuyển dụng, không phải số liệu khảo sát.
