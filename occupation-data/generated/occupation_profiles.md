# Hồ sơ nghề chuẩn: độ phủ

> Sinh bởi `occupation-data/scripts/build_occupation_profiles.py`. Đừng sửa tay.

221 nghề: 22 IT, 199 ngoài IT.

| Mục | Đường dẫn | IT (/22) | Ngoài IT (/199) |
|---|---|---|---|
| Tóm tắt | `overview.summary` | 22 | 199 |
| Hợp với ai | `overview.fit_summary` | 21 | 199 |
| Mặt trái | `overview.downsides` | 22 | 199 |
| Mã nghề Việt Nam | `codes.vsco` | 21 | 196 |
| Việc hằng ngày | `daily_work` | 22 | 199 |
| Kỹ năng O*NET | `skills.hard` | 21 | 199 |
| Công cụ (ITviec) | `skills.tools` | 15 | 0 |
| Kiến thức | `skills.knowledge` | 21 | 199 |
| Môi trường: câu mô tả | `work_environment.facts` | 21 | 199 |
| Nơi làm việc | `work_environment.settings` | 22 | 199 |
| Kiểu công ty (IT) | `work_environment.company_types` | 8 | 0 |
| Mức chuẩn bị | `education.preparation` | 22 | 199 |
| Ngành đại học | `education.majors_university` | 22 | 131 |
| Ngành cao đẳng, trung cấp | `education.majors_vocational` | 18 | 151 |
| Giấy phép hành nghề | `education.licence` | 0 | 30 |
| Thang cấp | `career.levels` | 22 | 0 |
| Lộ trình | `career.path` | 0 | 130 |
| Thăng tiến | `career.progresses_to` | 13 | 95 |
| Nghề gần | `career.similar` | 22 | 199 |
| Lương | `pay` | 22 | 199 |
| Nhu cầu tuyển | `outlook` | 22 | 127 |
| Lý do nghỉ việc | `work_life` | 14 | 0 |

## Lương theo nguồn

| Nguồn | Số nghề |
|---|---|
| group_average | 11 |
| itviec | 22 |
| job_postings | 75 |
| public_scale | 17 |
| reference | 96 |

## Đã bỏ vì kém tin cậy

- Mã nghề Việt Nam độ tin cậy thấp: PROD_PM, ONET-11-9032.00, ONET-11-9111.00, ONET-13-1041.00
- Phần O*NET (câu môi trường, hợp với ai, kỹ năng, kiến thức) của nghề IT có cùng bộ mã O*NET với nghề khác: SWE_MOBILE (giống SWE_BACKEND)
- Bước 'Vị trí gần, dễ vào hơn' của lộ trình: 80 nghề
- Lương rao VietJobs của nghề có dưới 20 tin có lương.
- Nhu cầu tuyển của nghề có dưới 5 tin trong VietJobs (bộ dữ liệu không phủ ngành đó, không phải ít tuyển): 57 nghề
