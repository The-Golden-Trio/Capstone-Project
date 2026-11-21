# Nhóm A · Danh tính và phân công

Thuộc [testing plan](../2026-11-20_testing-plan.md). Trạng thái ca kiểm ghi theo khảo sát 20/11 (module, spec có sẵn); chưa chạy thử từng ca.

## Phạm vi

- **ERD:** `USER_ACCOUNT` (lớp con `EXPLORER`, `STAFF_MEMBER`), `USER_IDENTITY` (yếu), `AUTH_SESSION`, `PASSWORD_RESET_TOKEN`, `AUDIT_LOG`, quan hệ `ASSIGNED_TO` (STAFF_MEMBER nhiều–nhiều OCCUPATION, thuộc tính `role`, `assigned_at`).
- **Yêu cầu:** FR-01, FR-02, FR-40, FR-41; DR-16; NFR-05, NFR-17. **Use case:** UC-E01, UC-E02, UC-S01…S05. **Diagram:** `AD-01a`, `AD-01f`, `AD-05a`, `AD-05b`, `SD-04`; class `CL-01`.
- **Code:** Prisma có `UserAccount`, `UserRole`, `GoogleIdentity`, `StaffAssignment`, `AuthSession`, `PasswordResetToken`, `ActivityLog` theo ERD-01 cũ (lệch ERD mới: `roles` nhiều giá trị, `EXPLORER`/`STAFF_MEMBER` là lớp con). `AuthModule` (`auth.service.ts` 278 dòng, `token.service.ts`, `access-policy.service.ts`, `guards/roles.guard.ts`, `guards/occupation-access.guard.ts`) hiện **chưa có spec**. Auth là Bearer (Q2).
- **Ngoài ERD:** Prisma có `ParentalConsent` và `consent/consent.ts`; ERD không vẽ (07 A28(3)).

## Lớp tương đương và biên

| Biến                   | Lớp hợp lệ                                                                                 | Lớp không hợp lệ                                              | Biên                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------- |
| `email`                | đúng dạng, chưa dùng                                                                       | sai dạng; đã dùng (khác hoa thường); có khoảng trắng đầu/cuối |                                                      |
| Token đặt lại mật khẩu | chưa dùng, chưa hết hạn                                                                    | đã dùng (`used_at` ≠ rỗng); hết hạn                           | `expires_at` − 1 s, `expires_at`, `expires_at` + 1 s |
| Refresh token          | còn hạn, chưa thu hồi                                                                      | hết hạn; đã thu hồi; đã xoay (dùng lại token cũ)              |                                                      |
| Vai (`roles`)          | Explorer, Domain Expert, Content Admin, System Admin (nhiều giá trị)                       | giá trị khác                                                  |                                                      |
| Trạng thái tài khoản   | active → disabled → deleted (suy ra từ UC-S04, UC-S05; ERD chỉ ghi `status`, `deleted_at`) | chuyển ngược deleted → active                                 |                                                      |
| Số CA của một nghề     | 1                                                                                          | 0; 2                                                          | 0, 1, 2                                              |
| Số DE của một nghề     | ≥ 1                                                                                        | 0                                                             | 0, 1, 2                                              |

## Thẻ ca kiểm

### TC-A-EP-01 · Đăng ký bằng email: ba lớp đầu vào

- **Nguồn:** FR-01; UC-E01; ERD `USER_ACCOUNT.email`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Cao
- **Tiền điều kiện:** DB test trống; đã có một tài khoản `an@example.test`
- **Dữ liệu vào:** (a) `binh@example.test` hợp lệ; (b) `binh@` sai dạng; (c) `AN@example.test`; (d) `binh@example.test` có khoảng trắng
- **Các bước:** 1. Gọi đăng ký với từng giá trị. 2. Đọc `USER_ACCOUNT` sau mỗi lần.
- **Kết quả mong đợi:** (a) tạo tài khoản vai Explorer, mật khẩu lưu dưới dạng hash; (b) từ chối, không tạo dòng; (c) từ chối vì trùng; (d) chuẩn hoá rồi xử lý như (a) hoặc từ chối, nhưng không tạo hai tài khoản cho cùng một địa chỉ
- **Hậu điều kiện:** mỗi email chỉ có một `USER_ACCOUNT`
- **Tự động hoá:** `apps/api/src/app/auth/auth.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-A-EP-02 · Một Google identity chỉ gắn một tài khoản

- **Nguồn:** DR-16; UC-E01; ERD `USER_IDENTITY` (khoá `provider` + `subject`)
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, phân hoạch tương đương
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** tài khoản X đã gắn `(google, s1)`
- **Dữ liệu vào:** tài khoản Y thử gắn `(google, s1)`; tài khoản Y gắn `(google, s2)`
- **Các bước:** 1. Gắn `(google, s1)` cho Y. 2. Gắn `(google, s2)` cho Y.
- **Kết quả mong đợi:** bước 1 bị từ chối; bước 2 thành công; X giữ nguyên identity
- **Hậu điều kiện:** không có hai tài khoản chung một `(provider, subject)`
- **Tự động hoá:** `auth.service.spec.ts` (dự kiến) cùng ràng buộc unique ở DB
- **Trạng thái:** Chạy được

### TC-A-BVA-01 · Token đặt lại mật khẩu quanh hạn dùng

- **Nguồn:** FR-01; ERD `PASSWORD_RESET_TOKEN.expires_at`, `used_at`
- **Cấp · loại · kỹ thuật:** Unit · chức năng · black box, giá trị biên
- **Ưu tiên:** Cao
- **Tiền điều kiện:** token chưa dùng; đồng hồ giả (`FakeClock`)
- **Dữ liệu vào:** thời điểm dùng = `expires_at` − 1 s, `expires_at`, `expires_at` + 1 s; dùng lần thứ hai
- **Các bước:** 1. Đặt đồng hồ. 2. Gửi token cùng mật khẩu mới. 3. Gửi lại đúng token đó.
- **Kết quả mong đợi:** − 1 s chấp nhận; tại `expires_at` và + 1 s từ chối (biên: hết hạn tính từ đúng `expires_at`, ghi rõ nếu code chọn khác); lần thứ hai luôn từ chối
- **Hậu điều kiện:** `used_at` được ghi một lần; mật khẩu cũ không còn hiệu lực sau lần thành công
- **Tự động hoá:** `auth.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-A-ST-01 · Vòng đời tài khoản: active, disabled, deleted

- **Nguồn:** UC-S04, UC-S05; NFR-05; ERD `USER_ACCOUNT.status`, `deleted_at` (vòng đời suy ra từ use case, ERD không liệt kê giá trị)
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** tài khoản active có phiên đăng nhập
- **Dữ liệu vào:** hành động khoá; mở khoá; xoá; thử đăng nhập ở từng trạng thái; thử chuyển deleted → active
- **Các bước:** 1. Khoá. 2. Đăng nhập. 3. Mở khoá. 4. Xoá. 5. Đăng nhập. 6. Mở khoá tài khoản đã xoá.
- **Kết quả mong đợi:** disabled không đăng nhập được và phiên hiện có bị thu hồi; mở khoá về active; deleted không đăng nhập được; bước 6 bị từ chối
- **Hậu điều kiện:** mỗi chuyển có dòng `AUDIT_LOG`
- **Tự động hoá:** `apps/api/src/app/auth/account.lifecycle.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (ERD mới chưa có trong Prisma; ghi giả định "suy ra" trong test)

### TC-A-ST-02 · Phiên đăng nhập: tạo, xoay refresh, thu hồi

- **Nguồn:** NFR-17 (phiên hết hạn khi rảnh); ERD `AUTH_SESSION.refresh_hash`, `expires_at`, `revoked_at`
- **Cấp · loại · kỹ thuật:** Unit · bảo mật · black box, chuyển trạng thái
- **Ưu tiên:** Cao
- **Tiền điều kiện:** phiên mới tạo
- **Dữ liệu vào:** refresh hợp lệ; refresh đã xoay; refresh sau khi đăng xuất; refresh quá hạn rảnh
- **Các bước:** 1. Refresh lần 1. 2. Dùng lại refresh cũ. 3. Đăng xuất rồi refresh. 4. Đẩy đồng hồ qua hạn rảnh rồi refresh.
- **Kết quả mong đợi:** bước 1 cấp cặp token mới; bước 2, 3, 4 từ chối; refresh chỉ lưu dạng hash (`refresh_hash`)
- **Hậu điều kiện:** `revoked_at` đặt đúng. Việc thu hồi cả chuỗi phiên khi phát hiện dùng lại token cũ chưa có trong thiết kế: ghi vào câu hỏi mở, không kiểm
- **Tự động hoá:** `token.service.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-A-DT-01 · Phân công nghề: số CA và DE

- **Nguồn:** FR-40, FR-41; DR-16; ERD `ASSIGNED_TO` (chú thích "one content admin per occupation")
- **Cấp · loại · kỹ thuật:** Integration · chức năng · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** nghề `SWE_BACKEND`; hai CA, hai DE, một System Admin
- **Dữ liệu vào:** các tổ hợp dưới đây
- **Các bước:** 1. System Admin áp tổ hợp. 2. Đọc lại phân công.
- **Kết quả mong đợi:**

| CA  | DE  | Kết quả            |
| --- | --- | ------------------ |
| 1   | ≥ 1 | chấp nhận          |
| 0   | ≥ 1 | từ chối (thiếu CA) |
| 2   | ≥ 1 | từ chối (thừa CA)  |
| 1   | 0   | từ chối (thiếu DE) |

- **Hậu điều kiện:** mỗi nghề đúng một CA và ít nhất một DE; mỗi lần đổi có dòng `AUDIT_LOG`
- **Tự động hoá:** `apps/api/src/app/auth/staff-assignment.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (code hiện có theo `StaffAssignment` cũ; kiểm lại ràng buộc "đúng một CA")

### TC-A-DT-02 · Phân quyền theo vai và theo nghề

- **Nguồn:** NFR-17; FR-41; `guards/roles.guard.ts`, `guards/occupation-access.guard.ts`
- **Cấp · loại · kỹ thuật:** Integration · bảo mật · black box, bảng quyết định
- **Ưu tiên:** Cao
- **Tiền điều kiện:** Explorer E, DE (nghề A) D, CA (nghề A) C, System Admin S
- **Dữ liệu vào:** từng chủ thể gọi: endpoint staff của nghề A, endpoint staff của nghề B, endpoint explorer, endpoint quản trị
- **Các bước:** 1. Gọi bằng Bearer của từng vai. 2. Gọi không có Bearer.
- **Kết quả mong đợi:** không Bearer → 401; vai sai → 403; D và C chỉ thao tác được nghề được giao; E không vào endpoint staff; chỉ S vào endpoint quản trị
- **Hậu điều kiện:** không có thay đổi dữ liệu ở các lần bị từ chối
- **Tự động hoá:** `apps/api/src/app/auth/guards/*.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-A-GB-01 · Mọi hành động tài khoản ghi `AUDIT_LOG`

- **Nguồn:** DR-16; UC-S03; ERD `PERFORMS`, `AUDIT_LOG`
- **Cấp · loại · kỹ thuật:** Integration · chức năng · grey box
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** Postgres thật
- **Dữ liệu vào:** đăng ký, đổi mật khẩu, khoá, mở khoá, xoá, gán nghề, bỏ gán nghề
- **Các bước:** 1. Thực hiện từng hành động. 2. Đọc `AUDIT_LOG` theo `USER_ACCOUNT`.
- **Kết quả mong đợi:** mỗi hành động đúng một dòng có `action`, `subject_type`, `subject_ref`, `at`; hành động thất bại không ghi dòng "thành công"
- **Hậu điều kiện:** dòng log không sửa, không xoá được qua API
- **Tự động hoá:** `auth.audit.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chờ hiện thực (`ActivityLog` cũ; ERD mới có `AUDIT_LOG` với `subject_type`, `subject_ref`, `detail`)

### TC-A-GB-02 · Xoá tài khoản

- **Nguồn:** FR-02; NFR-05; UC-S05; DR-16
- **Cấp · loại · kỹ thuật:** Integration · riêng tư · grey box
- **Ưu tiên:** Cao
- **Tiền điều kiện:** Explorer có hồ sơ, phiên, lượt chơi, góp ý; một DE có scenario đã soạn
- **Dữ liệu vào:** xoá từng tài khoản
- **Các bước:** 1. Xoá Explorer. 2. Xoá DE. 3. Đếm dữ liệu cá nhân còn lại theo `user_id`.
- **Kết quả mong đợi:** dữ liệu cá nhân của Explorer (email, tên, ngày sinh, câu trả lời gắn người) bị xoá hoặc khử định danh; bản ghi do staff soạn được giữ, không còn dữ liệu định danh trực tiếp (suy ra từ UC-S05, ghi rõ trong test)
- **Hậu điều kiện:** `deleted_at` được đặt; có dòng `AUDIT_LOG`
- **Tự động hoá:** thủ công cho phần rà soát dữ liệu, tự động cho phần đếm bản ghi (dự kiến)
- **Trạng thái:** Chờ hiện thực

### TC-A-EG-01 · Đăng ký song song cùng email

- **Nguồn:** ERD `USER_ACCOUNT.email`; NFR-17
- **Cấp · loại · kỹ thuật:** Integration · độ tin cậy · đoán lỗi
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** hai yêu cầu đăng ký cùng email gửi đồng thời
- **Dữ liệu vào:** 20 cặp yêu cầu song song
- **Các bước:** 1. Bắn cặp yêu cầu. 2. Đếm dòng.
- **Kết quả mong đợi:** mỗi cặp đúng một thành công; không có lỗi 500; ràng buộc unique ở DB giữ
- **Hậu điều kiện:** không có tài khoản trùng
- **Tự động hoá:** `auth.concurrency.integration.spec.ts` (dự kiến)
- **Trạng thái:** Chạy được

### TC-A-BLK-01 · Đồng ý của người giám hộ (người dưới 18 tuổi)

- **Nguồn:** `Hồ sơ JobQuest cơ chế game.md` mục "Cần chốt" C7; 07 A28(3); D-97 đã bỏ khỏi báo cáo; ERD `USER_ACCOUNT.date_of_birth`
- **Cấp · loại · kỹ thuật:** Acceptance · riêng tư
- **Ưu tiên:** Cao
- **Trạng thái:** Chặn – chờ chốt. Mục tiêu: người dưới ngưỡng tuổi do nhóm chốt không dùng được app nếu thiếu đồng ý. Lý do chặn: ngưỡng tuổi và cách thu đồng ý chưa chốt; Prisma có `ParentalConsent` ngoài ERD

### TC-A-NF-01 · Bảo mật phiên và mật khẩu

- **Nguồn:** NFR-17
- **Cấp · loại · kỹ thuật:** System · bảo mật · kiểm tra theo checklist
- **Ưu tiên:** Cao
- **Tiền điều kiện:** môi trường staging có TLS
- **Dữ liệu vào:** yêu cầu HTTP thường; đọc cột mật khẩu trong DB; phiên để rảnh quá hạn
- **Các bước:** 1. Gọi bằng HTTP. 2. Đọc `password_hash`. 3. Để phiên rảnh.
- **Kết quả mong đợi:** HTTP được chuyển hướng hoặc từ chối; mật khẩu là hash có muối, không đảo ngược; phiên hết hạn sau thời gian rảnh cấu hình
- **Hậu điều kiện:** không có
- **Tự động hoá:** thủ công trên staging; phần hash kiểm tự động ở `TC-A-EP-01`
- **Trạng thái:** Chờ hiện thực (cần môi trường có TLS)

### TC-A-UC-01 · UC-E01 đăng ký, đăng nhập, đăng xuất

- **Nguồn:** UC-E01, UC-E02; `AD-01a`, `AD-01f`, `SD-04`
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Cao
- **Tiền điều kiện:** web trỏ API thật (`VITE_API_MODE=live`)
- **Dữ liệu vào:** luồng chính (đăng ký → đăng nhập → sửa hồ sơ → đăng xuất); luồng lỗi (sai mật khẩu, email trùng, token reset hết hạn)
- **Các bước:** 1. Chạy luồng chính. 2. Chạy từng luồng lỗi. Chi tiết bước đối chiếu với activity và sequence ở trên.
- **Kết quả mong đợi:** mỗi nhánh lỗi hiện thông báo tiếng Việt, không lộ lý do làm lộ tài khoản (đăng nhập sai không nói rõ email hay mật khẩu sai, nếu thiết kế ghi như vậy; kiểm lại với `AD-01a`)
- **Hậu điều kiện:** phiên đóng sau đăng xuất
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chạy được (luồng cơ bản), E2E chờ công cụ

### TC-A-UC-02 · UC-S02 gán nhân sự cho nghề

- **Nguồn:** UC-S02; `AD-05b`; FR-40
- **Cấp · loại · kỹ thuật:** E2E · chức năng · use case
- **Ưu tiên:** Vừa
- **Tiền điều kiện:** System Admin đăng nhập; nghề chưa có CA
- **Dữ liệu vào:** gán CA, thêm hai DE, đổi CA
- **Các bước:** 1. Gán CA. 2. Thêm DE. 3. Đổi CA.
- **Kết quả mong đợi:** đúng bảng `TC-A-DT-01`; CA cũ mất quyền với nghề, giữ quyền với nghề khác
- **Hậu điều kiện:** `AUDIT_LOG` đủ
- **Tự động hoá:** Playwright (đề xuất)
- **Trạng thái:** Chờ hiện thực

## Mục tiêu white box

### WB-A-01 · `apps/api/src/app/auth/auth.service.ts`

- **Tiêu chí phủ:** phủ nhánh; đường cơ sở cho đăng nhập, refresh, đặt lại mật khẩu
- **Nhánh cần phủ:** tài khoản không tồn tại, bị khoá, đã xoá, sai mật khẩu; refresh hợp lệ, đã xoay, quá hạn; token reset hợp lệ, đã dùng, quá hạn
- **Dữ liệu qua từng đường:** lấy từ ba bảng lớp ở trên
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được

### WB-A-02 · `guards/roles.guard.ts`, `guards/occupation-access.guard.ts`

- **Tiêu chí phủ:** MC/DC cho điều kiện "có vai" và "được giao nghề này"
- **Nhánh cần phủ:** không Bearer; vai không khớp; vai khớp nhưng nghề không được giao; System Admin bỏ qua kiểm nghề (nếu thiết kế cho phép; xác nhận khi đọc code)
- **Hiện có:** chưa có spec
- **Trạng thái:** Chạy được

### WB-A-03 · `token.service.ts`, `access-policy.service.ts`, `consent/consent.ts`

- **Tiêu chí phủ:** phủ nhánh
- **Nhánh cần phủ:** tạo, xác thực, xoay, thu hồi token; chính sách truy cập theo vai
- **Hiện có:** chưa có spec; `consent.ts` thuộc phần ngoài ERD, ghi rõ khi viết
- **Trạng thái:** Chạy được
