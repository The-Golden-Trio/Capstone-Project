# Nguyên tắc giao diện JobQuest (đề xuất 25/11/2026)

> Trạng thái: **đề xuất, đã hiện thực trên nhánh `feat/ui-ux-master`**, chờ nhóm duyệt. Không thay quyết định nào trong `02-quyet-dinh.md`; giữ nguyên concept art số 5 ("Cartoon viền đen") và bảng màu Celestial Night, chỉ đặt luật dùng cho nhất quán.
>
> Nguồn: góp ý UI của nhóm (25/11), kiểm kê mã `apps/web` và `packages/ui` (740 chỗ màu viết cứng, viền 2 / 2,5 / 3 / 4 / 5 px dùng lẫn, nút và nhãn cùng dáng).

## Vì sao cần luật

Trước đây mọi thứ đều là "thẻ kem, viền đen 3 px, bóng cứng": thẻ, nút, nhãn trạng thái, ô gập, ô ghi chú. Khi mọi thứ cùng một dáng thì mắt không biết cái gì bấm được, cái gì chỉ để đọc, cái gì quan trọng hơn. Bộ luật dưới đây cho mỗi loại phần tử một dáng riêng, để người chơi nhận ra bằng hình chứ không phải đọc chữ.

## 1. Nét viền: ba độ dày theo tầng

| Tầng                    | Độ dày                                                                                      | Dùng cho                              | Class                                            |
| ----------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| 1. Vật đứng trên nền    | **3 px** + bóng cứng chỉ cho **nút**; thẻ và panel không viền mực, bóng mềm (`shadow-soft`) | Nút bấm; thẻ trang, panel nổi         | `border-[3px]` (nút), `toon-card`, `shadow-soft` |
| 2. Điều khiển trong thẻ | **2 px**, không bóng                                                                        | Ô nhập, chip lọc, tab, thanh tiến độ  | `border-2`                                       |
| 3. Chia và chấm         | **1,5 px**                                                                                  | Đường chia hàng, viền chấm trạng thái | `border-[1.5px]`, `toon-rows`                    |

- Không dùng 2,5 / 4 / 5 px.
- Vật lồng bên trong không dày hơn vật chứa nó. **Không đặt thẻ có viền + bóng bên trong thẻ khác**: bên trong thẻ dùng hàng có đường chia (`toon-rows`) hoặc ô tô nền nhạt (`toon-inset`).
- Nét đứt chỉ để báo "chưa có, chưa tới": chỗ trống, đoạn đường chưa đi, nghề chưa có màn.

## 2. Màu: mỗi màu một vai

| Màu                                   | Vai                                                                                                             | Không dùng để            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Vàng sao `toon-star` / `toon-mustard` | Hành động chính và "bạn": nút chính, vị trí hiện tại, tiến độ của chính người chơi. Một màn chỉ có một nút vàng | trang trí, nền ô ghi chú |
| Màu vùng nghề (6 màu, D-125)          | Chỉ vùng nghề: tinh vân, hành tinh, ký hiệu vùng                                                                | trạng thái, nút          |
| Mint                                  | Đã xong, đạt                                                                                                    |                          |
| Xanh trời                             | Có thể vào, thông tin                                                                                           |                          |
| San hô                                | Mặt khó, cảnh báo                                                                                               | lỗi (lỗi dùng maroon)    |
| Cát / xám giấy                        | Khoá, chưa có                                                                                                   |                          |
| Giấy kem                              | Mặt đọc                                                                                                         |                          |
| Navy đêm                              | Không gian: bản đồ, nền ngoài ca làm                                                                            |                          |

Màu tô của nhãn và ô ghi chú luôn **nhạt hơn** màu nút, để nhìn là biết không bấm được.

## 3. Mỗi loại phần tử một dáng

| Loại                     | Dáng                                                                                                                    | Component                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Nút                      | Khối bo 14 px, viền 3 px, bóng cứng; nhấc lên khi rê, nhún xuống khi bấm                                                | `ToonButton`, `toonButtonClasses` |
| Chip lọc / bật tắt       | Viên thuốc viền 2 px, không bóng; chọn thì tô vàng                                                                      | `ToonChip`                        |
| Nhãn trạng thái          | Phẳng, bo 7 px, không viền mực, không bóng; ký hiệu đi trước chữ                                                        | `ToonBadge`, `ToonStatus`         |
| Phần gập                 | Dòng chữ đậm có mũi tên xoay, không đóng khung. **Mặc định mở**; chỉ đóng sẵn phần nguy hiểm (xoá tài khoản, đăng xuất) | `ToonDisclosure`                  |
| Ghi chú                  | Ô tô nhạt có ký hiệu, không viền mực                                                                                    | `ToonCallout`                     |
| Liên kết sang trang khác | Chữ gạch chân có mũi tên ↗                                                                                              |                                   |

Quy tắc ngắn: **có viền mực và bóng cứng thì bấm được; phẳng hoặc bóng mềm thì chỉ để đọc.**

Bổ sung 25/11 sau góp ý thứ hai của nhóm:

- **Không bắt người chơi đi tìm.** Phần gập mặc định mở; không cắt đoạn văn hay danh sách sau "Xem thêm". Nội dung dài thì chia chương có mục lục, không giấu.
- **Không quá hai lớp.** Trong một thẻ chỉ có hàng và đường chia; không đặt ô màu trong hàng trong thẻ. Ghi chú trong hàng dùng ký hiệu và một vạch màu bên trái, không đóng hộp.
- **Trạng thái bằng màu, không bằng danh sách.** Ví dụ chòm sao trong Thống kê: nghề đã thử sáng màu vùng, nghề chưa thử là chấm mờ; chạm sao nào mở hồ sơ nghề đó.

## 4. Ký hiệu trước chữ

Bảng ký hiệu trạng thái dùng chung ở mọi màn (`TOON_STATUS`, `ToonStatusGlyph`):

| Ký hiệu          | Trạng thái                   |
| ---------------- | ---------------------------- |
| ● ✓ (mint)       | Đã xong                      |
| ● ▶ (vàng)       | Đang chơi                    |
| ● có vành (xanh) | Có màn chơi                  |
| 🔒               | Đang khoá, cần nghề đi trước |
| ◌ nét đứt        | Chưa có màn chơi             |
| ✦                | Gợi ý cho bạn                |
| ▲ (san hô)       | Mặt khó, lưu ý               |

- Chỗ dày hàng (danh sách, bản đồ, chuỗi cấp) chỉ hiện ký hiệu; chữ nằm ở `aria-label` và tooltip.
- Sáu vùng nghề có sáu ký hiệu cố định (`RegionGlyph`): cờ lê, nhịp tim, cặp, chip, bảng màu, chuông phục vụ.
- Nơi nào chỉ dùng ký hiệu thì phải có chú giải (bản đồ có bảng "Ý nghĩa ký hiệu").

## 5. Dữ liệu có thứ tự đi theo chuỗi, không xếp lưới thẻ

Dữ liệu có thứ tự (cấp, bước, lịch sử, lương theo năm kinh nghiệm, chương của hồ sơ nghề) trình bày trên **một đường**:

- `ToonSteps`: chuỗi dọc. Đoạn đã qua là nét liền, đoạn chưa tới là nét đứt, bước hiện tại sáng lên.
- `ToonDots`: chuỗi ngắn trong một dòng (cấp 1…n của một nghề, màn trong cấp).
- Danh sách cùng loại (nghề trong vùng, nghề đang chơi) là **hàng trong một thẻ**, không phải lưới thẻ con.

## 6. Bản đồ ngân hà

- Vùng nghề là **tinh vân mờ biên** tụ quanh các chòm của vùng, không vẽ đường viền. Hai vùng gần nhau hoà màu thay vì cắt nhau thành mảnh.
- Chọn một vùng (bấm chip hoặc bấm vào tinh vân) thì cả vùng sáng lên cùng một màu, các vùng khác lùi lại.
- Bầu trời có dải ngân hà trôi chậm, hai lớp sao lấp lánh lệch nhịp, sao băng thỉnh thoảng bay qua. Lớp trời dịch chậm hơn bản đồ khi kéo (thị sai) để có chiều sâu.
- Thanh tìm và bộ lọc gom thành **một bảng nổi** trên bản đồ, không còn hai dải ngang tách bản đồ khỏi đầu trang.
- Mọi chuyển động trang trí tắt khi người dùng bật `prefers-reduced-motion`.

## 7. Phạm vi đã áp dụng trên nhánh

- `packages/ui`: `ToonKit.tsx` (mới), `ToonControls.tsx` (nhãn phẳng, điều khiển trong thẻ 2 px), `toon.css` (`toon-inset`, `toon-rows`, chữ phụ trên nền đêm).
- `apps/web`: bản đồ ngân hà (bản đồ, bảng điều khiển, chú giải, danh sách theo vùng), hồ sơ nghề (chuỗi chương có mục lục, lộ trình dạng chuỗi), Hành trang (hàng nghề đang chơi, gom phần gập), khung app.
- **Chưa đụng** màn trong ca làm (`features/play`, `features/summary`) vì nhánh `feat/play-relayout` đang dựng lại các màn đó; khi gộp, áp cùng luật.
