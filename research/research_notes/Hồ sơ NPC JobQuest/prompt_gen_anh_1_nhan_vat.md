# Prompt cho agent: sinh bộ ảnh của 1 nhân vật, 1 theme công ty, 2 cảnh nền

Dán nguyên phần trong khung dưới vào agent. Chỉ cần điền mục "ĐIỀN TRƯỚC KHI CHẠY". Ví dụ đã điền sẵn cho lá IV Hồng.

Căn cứ: `Hồ sơ NPC JobQuest.md` mục 5.3 đến 5.6 (số ảnh, luật đồ đeo, mặt và màu, quy trình giữ đồng nhất). Bản này thu nhỏ quy trình đó cho một người và một công ty.

---

```text
VAI TRÒ
Bạn sinh một bộ ảnh nhân vật 2D cho game nghề nghiệp JobQuest. Bộ này gồm MỘT nhân vật, MỘT theme công ty và HAI cảnh nền. Làm đúng thứ tự, không bỏ bước duyệt.

ĐIỀN TRƯỚC KHI CHẠY
NHÂN VẬT (lấy từ hồ sơ, đừng tự bịa thêm):
- Tên gọi: Hồng. Lá bài: IV Hoàng Đế. Nữ, 39 tuổi.
- Dáng: Cao vừa, vai thẳng, hay khoanh nhẹ hai tay.
- Tóc: Tóc ngắn ngang cằm, kẹp gọn một bên.
- Màu chủ đạo: #7A2E2E (viền thẻ, bong bóng chat; dùng làm màu nhấn nhỏ trên người, không phủ cả áo).
- Món nhận diện (giữ ở MỌI ảnh thân): Đồng hồ dây da đeo mặt vào trong cổ tay.
- Vai trong game: cấp trên của người chơi trong màn làm việc. Trông đúng vai người quản lý, nghiêm nhưng không dữ.
- Biểu cảm hay dùng: binh_thuong, suy_nghi, kho_chiu, vui. Hiếm dùng: cuoi_lon, ngac_nhien.

THEME CÔNG TY (điền một):
- Loại hình: ví dụ "văn phòng công ty phần mềm"
- Bộ phận của nhân vật: ví dụ "quản lý dự án"
- Trang phục theo theme: ví dụ "sơ mi trắng, áo vest không cài, thẻ đeo"
- Màu công ty (HEX): ví dụ "#1F5FAE"
- Tên công ty: chỉ để bạn hiểu ngữ cảnh. TUYỆT ĐỐI không vẽ nó lên ảnh.

HAI CẢNH NỀN (điền hai):
- Nền 1: ví dụ "khu làm việc chung, bàn dài, cửa kính nhìn ra thành phố, ánh sáng ban ngày"
- Nền 2: ví dụ "phòng họp nhỏ, bảng trắng trống, rèm kéo một nửa, ánh sáng chiều"

PHONG CÁCH CHUNG (áp cho cả 13 ảnh)
- Một phong cách duy nhất: minh hoạ 2D, nét rõ, tô phẳng có đổ bóng nhẹ, bảng màu dịu. Chốt phong cách ở ảnh đầu, các ảnh sau bám theo; không đổi giữa chừng.
- KHÔNG có chữ, số, logo, biển hiệu đọc được ở bất kỳ ảnh nào (AI hay sinh chữ lỗi). Thẻ đeo và màn hình để trống hoặc là mảng màu.
- Không dùng nhãn hiệu, quân hiệu, phù hiệu thật.
- Nhân vật là người Việt, trông đúng tuổi đã ghi.

THỨ TỰ LÀM (dừng ở các điểm DUYỆT, báo kết quả cho người dùng và chờ trả lời)

BƯỚC 1. Tờ tham chiếu (1 ảnh)
- Một ảnh gồm: chính diện, 3/4, cận mặt, bảng màu (màu chủ đạo + màu công ty), và món nhận diện phóng to ở góc.
- Nền xám nhạt trơn.
- DỪNG, chờ DUYỆT. Nếu bị sửa, sinh lại. Từ đây mọi ảnh sau lấy tờ này làm tham chiếu.

BƯỚC 2. Khung tư thế chuẩn (không cần xuất ảnh riêng, chỉ ghi lại)
- Nửa người, xoay 3/4, tay buông, mặt hướng về phía người xem.
- Cùng khổ ảnh và cùng tỉ lệ đầu cho mọi ảnh thân. Mọi ảnh thân dưới đây dùng đúng khung này.
- Ghi lại toạ độ mũi và hai mắt (px) trên ảnh thân ngoài giờ làm "neo mặt". Các mặt ở bước 5 phải dán đúng chỗ này.

BƯỚC 3. Ảnh thân ngoài giờ (1 ảnh)
- Nhân vật mặc đồ thường ngày hợp tính cách (không theo công ty), đúng khung ở bước 2, mặt biểu cảm binh_thuong.
- Nền trơn, dễ tách.
- Đây là ảnh gốc để cắt 8 mặt, nên ánh sáng đều, không bóng đổ lên mặt, tóc không che mắt.

BƯỚC 4. Ảnh thân theo công ty (1 ảnh)
- Cùng khung, cùng người, mặc trang phục theo theme công ty đã điền.
- Vùng màu công ty vẽ ĐÚNG màu HEX đã cho (chỉ một công ty nên không cần mặt nạ).
- Món nhận diện vẫn còn. Nếu nó đụng đồ của theme thì dời sang chỗ khác và ghi lại chỗ dời.
- KHÔNG che mặt: không khẩu trang, không kính đen, không mũ che mắt. Nếu theme có đồ đó, kéo xuống cằm, đẩy lên trán, hoặc để phần mũ chừa mặt.
- Chừa mặt đúng neo ở bước 2 để dán biểu cảm.
- DỪNG, chờ DUYỆT hai ảnh thân (bước 3 và 4).

BƯỚC 5. Tám biểu cảm mặt (8 ảnh)
- Sinh một lần trên ảnh thân ngoài giờ, rồi cắt theo vùng mặt. Mỗi ảnh là phần mặt và cổ, nền trong suốt, cùng kích thước, cùng toạ độ neo.
- Tên file và nghĩa:
  binh_thuong: nhìn thẳng, thả lỏng
  vui: cười nhẹ, mắt cong
  cuoi_lon: cười hở răng, mắt nheo
  ngac_nhien: mắt mở to, lông mày nhướng, miệng hé
  suy_nghi: mắt nhìn lệch lên hoặc sang bên, môi mím
  lo_lang: lông mày chụm lên, mắt hơi ướt, môi mím nhẹ
  kho_chiu: chân mày nhíu, khoé miệng trễ, hơi nghiêng đầu (vẽ đậm, vì người xem khó nhận ra giận và khó chịu)
  buon: mắt cụp, khoé miệng trễ, ánh nhìn xuống
- Các mặt phải cùng một người: cùng mũi, cùng mắt, cùng tóc mái. Chỉ đổi biểu cảm.
- Làm 4 mặt hay dùng trước và duyệt, rồi mới làm 4 mặt còn lại.
- DỪNG, chờ DUYỆT.

BƯỚC 6. Hai cảnh nền (2 ảnh)
- Khổ ngang 16:9, cùng phong cách với ảnh nhân vật.
- Không có người trong cảnh. Không chữ, không logo.
- Dùng màu công ty làm màu nhấn nhỏ (ghế, rèm, vách), không phủ cả cảnh.
- Chừa trống nửa dưới ở giữa và một bên cho nhân vật đứng vào (nhân vật sẽ được ghép lên sau). Đường chân trời đặt ngang tầm một người đứng.
- Ánh sáng hai nền hơi khác nhau (ví dụ ban ngày và chiều) nhưng cùng tông màu.
- Sau khi sinh, ghép thử ảnh thân theo công ty (bước 4) lên mỗi nền để kiểm tỉ lệ và màu. Nếu nhân vật chìm vào nền hoặc to nhỏ lệch, sinh lại nền.

KIỂM TRA TRƯỚC KHI GIAO (làm cho cả 13 ảnh, đánh dấu đạt hoặc không đạt, không đạt thì sinh lại)
1. Đúng người: cùng khuôn mặt, tóc, vóc dáng với tờ tham chiếu.
2. Món nhận diện còn ở mọi ảnh thân.
3. Mặt dán lên ảnh thân khớp neo, lệch chỉ vài px, không thấy viền.
4. Không chữ, không logo, không phù hiệu thật.
5. Màu công ty đúng HEX ở ảnh thân theo công ty và hợp lý ở hai nền.
6. Mặt không bị che ở mọi ảnh thân.
7. Tám biểu cảm đọc ra khác nhau. Đặc biệt kho_chiu không bị đọc thành buon hay suy_nghi.
8. Nhân vật trông đúng tuổi và đúng vai, không quá trẻ.

GIAO
- 13 ảnh: ref_sheet, than_ngoai_gio, than_cong_ty, 8 file mặt, nen_1, nen_2.
- Quy ước tên: ref_sheet.png, body_off.png, body_company.png, face/<biểu_cảm>.png, bg_1.png, bg_2.png.
- Kèm một file ghi: prompt đã dùng cho từng ảnh, toạ độ neo mặt, chỗ dời món nhận diện, ảnh nào phải sinh lại và vì sao.

LUẬT KHI GẶP VIỆC KHÔNG RÕ
- Thiếu thông tin ngoại hình hoặc theme: hỏi, đừng đoán.
- Công cụ sinh hình có tính phí hoặc cần đăng ký tài khoản: báo người dùng trước, không tự dùng.
- Không đọc hay sửa gì ngoài thư mục xuất ảnh.
```

---

## Ghi chú cho người dùng

- **Số ảnh 13** = 1 tờ tham chiếu + 2 ảnh thân + 8 mặt + 2 nền. Hồ sơ mục 5.5 đếm cho cả cast nhiều nhóm đồ và mặt nạ màu; ở đây chỉ một công ty nên vẽ thẳng màu công ty, không cần mặt nạ.
- **Hồ sơ không nói gì về cảnh nền** (mục 5 chỉ nói ảnh người). Phần bước 6 (khổ 16:9, chừa chỗ cho nhân vật, ghép thử) là mình đề xuất, bạn sửa theo UI thật.
- **Tên 8 biểu cảm** lấy từ luật lint của seed (`Luật dẫn truyện JobQuest.md`). Cách tả từng nét mặt là của mình, chưa qua người vẽ duyệt.
- **Muốn đổi nhân vật:** thay mục NHÂN VẬT bằng các trường `ngoai_hinh`, `danh_tinh`, `do_rieng`, `hay_dung` của lá đó trong `cast_a.yaml` hoặc `cast_b.yaml`.
- **Chưa có công cụ sinh hình được chọn** (mục 5.6). Prompt này không gắn với công cụ nào.
