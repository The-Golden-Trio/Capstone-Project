# Môi trường làm việc và loại hình nơi làm

Ghi chú nguồn cho `occupation-data/datasets/work_environments.json` (110 loại hình nơi làm, 22 nhóm ngành) và `occupation-data/decisions/occupation_work_environments.csv` (221 nghề → 1–3 loại hình). Tra ngày 28–29/10/2026.

**Mục đích:** mỗi cấp nghề random một công ty hư cấu (quyết định 28/10). Công ty đem tới bối cảnh cho lời dẫn của AI-4 và slide 2 "Một ngày ở đây" của màn onboard (giờ làm, nhịp việc, nơi làm), không đổi thứ được chấm hay độ khó. Loại hình nơi làm là khuôn để dựng 2–3 công ty hư cấu mỗi loại (`company_slots`).

## Quy ước

- Mức chứng cứ của từng thuộc tính: **A** văn bản pháp luật hoặc số liệu chính thức Việt Nam đã đọc được nội dung (kể cả qua trang sao lại văn bản như caselaw.vn, hethongphapluat.com, chưa đối chiếu Công báo); **B** tin tuyển dụng, số đo VietJobs, báo cáo ngành, báo chí; **C** suy luận của nhóm. Giống thang ở `../Thang cấp nghề/`.
- Mã nguồn trong ngoặc vuông ở các file dưới là khoá của `_meta.sources` trong `work_environments.json`. Mỗi nguồn ghi `checked`: `toan_van` (đọc cả trang), `tom_tat` (bản tóm tắt hoặc bài báo về văn bản), `doan_trich` (chỉ đoạn trích kết quả tìm kiếm), `du_lieu` (dữ liệu gốc nhóm tự đo).
- Nguồn chỉ có đoạn trích mà không có URL bài gốc thì không đưa vào dữ liệu; thuộc tính đó ghi C.
- Không đọc được thuvienphapluat.vn (403) và phần khoá của báo cáo ITviec 2025–2026.

## File

| File | Phạm vi |
|---|---|
| `nguon_luat_chung_nha_nuoc.md` | Bộ luật Lao động 2019 (giờ làm, ca đêm, làm thêm, nghỉ tuần, lễ), Nghị định 145/2020, khu vực nhà nước, toà án, công an, phòng cháy, kiểm lâm, bảo vệ |
| `nguon_it.md` | Kiểm lại 6 loại hình IT của bản 0.1 |
| `nguon_y_te_xa_hoi.md` | Bệnh viện công, tư, phòng khám, trạm y tế, nhà thuốc, dưỡng lão, 115, thú y, công tác xã hội |
| `nguon_giao_duc_truyen_thong.md` | Trường công, tư, trung tâm, đại học, thư viện bảo tàng, báo chí, phim, nghệ thuật, thể thao |
| `nguon_san_xuat_nang_luong_khoa_hoc.md` | Nhà máy FDI, trong nước, xưởng nhỏ, phòng sạch, thực phẩm, điện, nước, dầu khí, mỏ, viện, kiểm nghiệm, kỹ thuật |
| `nguon_xay_dung_van_tai_nong_nghiep.md` | Công trường, tư vấn, tổ đội thợ, toà nhà, môi trường đô thị, sửa chữa, nông lâm ngư, vận tải |
| `nguon_tai_chinh_van_phong_dich_vu.md` | Ngân hàng, chứng khoán, bảo hiểm, kiểm toán, văn phòng doanh nghiệp, khách sạn, F&B, bán lẻ, dịch vụ cá nhân |

## Số đo của nhóm trên VietJobs

`occupation-data/scripts/build_vietjobs_stats.py` đọc cột giờ làm của 30.351 tin có ghi giờ (bộ VietJobs, đăng 2/3/2026) và ghi mục `schedule` cho 82 nghề có từ 20 tin ghi giờ. Kết quả toàn bộ: 66% tin có làm thứ 7 (13% chỉ sáng thứ 7), 5% làm Chủ nhật, trung vị 46,5 giờ/tuần, 20% rao trên 48 giờ/tuần (trần giờ thường của Điều 105). Nghề dịch vụ lệch xa: thu ngân 70% tin rao trên 48 giờ/tuần, chăm sóc da 64%, điều dưỡng 64%. Bảng đầy đủ ở `occupation-data/generated/vietjobs_stats.md`. Bộ dữ liệu nghiêng về việc văn phòng ở Hà Nội, TP.HCM và không phủ nghề tuyển qua thi công chức, công an, nên không có số cho các nghề đó.

## Bộ thuộc tính (bước 1 của plan)

Giữ: `location`, `hours`, `on_call`, `travel`, `pace`. `schedule_type`, `flexibility` thành mã cố định trong `levels`. `release_cadence` đổi thành `peak_season`. Thêm: `customer_contact`, `physical_conditions`. Người dùng đã chốt ngày 29/10/2026:

1. **Tách `shifts` (ca kíp) và `workweek` (tuần làm, cuối tuần, lễ).** Làm thứ 7 là nét riêng của Việt Nam (66% tin), xảy ra cả ở nghề không làm ca. Mức `weekend` có thêm `theo_viec` cho nghề "làm khi có việc, không cố định ngày" (tổ đội thợ, freelance sáng tạo, dịch vụ tận nhà, bán hàng online, môi giới bất động sản).
2. **Thêm `overtime` (tăng ca)**, kèm hai mức `overtime_level` (ít, dồn theo đợt, thường xuyên) và `overtime_pay` (được trả thêm, phụ cấp cố định, lương trọn gói giờ dài, theo sản phẩm, áp lực không lương, nghỉ bù). Lý do theo lời người dùng: OT khác nhau theo việc, chế độ công ty và tính chất công việc, có thể được trả phù hợp hoặc là áp lực không lương. Trên 110 loại hình: trả thêm 32, theo sản phẩm 21, lương trọn gói 18, áp lực không lương 18, phụ cấp cố định 14, nghỉ bù 6, tự làm chủ 1. Chứng cứ `overtime_pay`: A 7, B 19, C 84.
3. **Gộp đồng phục và bảo hộ vào `dress_code`.** Nhóm sẽ thiết kế asset trang phục riêng cho NPC từ thuộc tính này.
4. **Xoá `work_environment_ids`, `_primary`, `_note`** khỏi `final_22_roles.json`, `78_roles_unmerged.json` và `generated/onet_all_roles.json`; spec sinh kịch bản và trang `tools/visualize_dataset.html` đã trỏ sang `decisions/occupation_work_environments.csv`. Ghi chú gán cũ chép ở phụ lục `nguon_it.md`.
5. Thêm 7 mức có mã (`levels`) để game lọc hoặc tạo tương phản khi random công ty mà không phải đọc chữ.

6. **Trọng số random của từng nghề: chấp nhận tạm.** 157/221 dòng có lý do mức C được đánh `weight_status = tam_thoi` trong `decisions/occupation_work_environments.csv`; đây là trọng số tạm thời, sửa khi có số liệu (tỉ lệ đơn vị theo loại hình, số tin tuyển theo loại công ty). 64 dòng mức A, B là `co_so_lieu`.

## Kết quả

- 110 loại hình, 22 nhóm ngành; mọi loại hình đều có ít nhất một nghề dùng.
- Chứng cứ theo thuộc tính (1.320 ô): A 86 (7%), B 192 (15%), C 1.042 (79%).
- 17 loại hình toàn C: thú y, NGO, tham vấn tâm lý tư, dạy trực tuyến, trại giam, văn phòng tập đoàn lớn, R&D kỹ thuật, chủ đầu tư, ban quản lý toà nhà, khách sạn nhỏ, quán độc lập, khu vui chơi, pet shop, bưu điện, đăng kiểm, công ty giải trí, trung tâm huấn luyện thể thao.
- Gán nghề (221 dòng): 1 loại hình 36 nghề, 2 loại hình 91, 3 loại hình 94. Lý do: A 18, B 46, C 157.
- 6 loại hình IT giữ mã cũ (kịch bản `SWE_BACKEND` trỏ `WE_HYBRID_PRODUCT`), đã kiểm lại và bỏ cờ `CHUA_VERIFY`.

## Còn yếu nguồn, nên làm tiếp

- Phỏng vấn ngắn người trong nghề là cách nâng C lên B nhanh nhất, nhất là 17 loại hình toàn C.
- Văn bản gốc: phụ lục Thông tư 11/2020 (loại nặng nhọc của từng nghề), giới hạn giờ bay tổ bay, Điều 63 Bộ luật Hàng hải, chế độ trực của công an, trại giam.
- Số đếm đơn vị: phòng khám tư, trường ngoài công lập toàn quốc, bảo tàng, nhà hát, công ty bảo vệ, bưu cục.
- Báo cáo ITviec 2025–2026 phần mô hình làm việc và OT (bị khoá sau form email); số IT hiện dùng bản 2023–2024.
