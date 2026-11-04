# Nguồn và quyết định — môi trường làm việc nhóm IT

Phạm vi: 6 loại hình IT trong `occupation-data/datasets/work_environments.json` (nhóm ngành `IND_IT`), kiểm lại ngày 28/10/2026. Mã nguồn trong ngoặc vuông là khoá ở `_meta.sources` của file đó. Mức chứng cứ theo `README.md` của thư mục này.

## Kết luận kiểm lại

| Loại hình | Kết luận | Sửa gì |
|---|---|---|
| `WE_HYBRID_PRODUCT` | Sửa | Hybrid chỉ là một phần: toàn thị trường 64,5% làm 100% tại văn phòng, 28,6% hybrid, 6,9% remote [ITVIEC_2324]; TopDev đo được 88,2% onsite [TOPDEV_2425]. Ghi "onsite hoặc hybrid 2–4 ngày WFH", độ linh hoạt hạ xuống trung bình–cao. Giữ on-call xoay vòng cho backend/hạ tầng (JD Grab, Skedulo, chỉ đoạn trích, B yếu). |
| `WE_PROJECT_OUTSOURCING` | Sửa | Bỏ "khách Nhật/Hàn làm sớm": Việt Nam chỉ chậm Nhật 2 giờ, giờ làm gần như trùng [BRSE_BLOG]. Lệch múi giờ thật là với Mỹ/EU (C). Bỏ khẳng định "OT dồn cuối giai đoạn" thành "có thể OT khi sát mốc bàn giao" (C). Onsite nước ngoài có nhưng là tuỳ chọn [JD_SAP]; chỉ 11,6% dev coi cơ hội onsite là điểm hấp dẫn [ITVIEC_2324]. |
| `WE_ONSITE_ENTERPRISE` | Sửa | Giờ không cứng 8:00–17:00: JD Techcombank cho vào 7:30–9:00, ra 16:30–18:00 [JD_BANK_IT]. Không thấy JD IT ngân hàng nào làm sáng thứ 7 (chỉ quầy giao dịch). Bỏ "một số nơi bắt buộc đồng phục" vì không có nguồn. Change window đêm/cuối tuần vẫn C. |
| `WE_SHIFT_24_7` | Sửa | JD đọc được chỉ có ca 8 giờ (3 ca 7–15, 15–23, 23–7; đổi ca theo tháng) [JD_SOC_NOC]; chưa thấy ca 12 giờ nên bỏ "2 ca 12 tiếng". SOC senior ở ngân hàng lại làm giờ hành chính cộng trực [JD_BANK_IT]. Viễn thông thuộc nhóm được làm thêm tới 300 giờ/năm, IT và ngân hàng thì không [ND145_2020]. Ca đêm là 22h–6h [BLLD2019]. |
| `WE_FIELD_CLIENT` | Sửa, giữ loại hình | JD tư vấn ERP vẫn ghi đi công tác "khi có yêu cầu", tới 30% thời gian [JD_ERP]; không còn là "đi rất nhiều". Travel hạ xuống "trung bình, theo giai đoạn dự án". ERP ở ITviec: 65% tại văn phòng, 35% hybrid, 30% ở doanh nghiệp non-IT (n≈21) [ITVIEC_2324]. |
| `WE_REMOTE_GLOBAL` | Sửa | Remote hiếm: 6,9% [ITVIEC_2324], 2% [TOPDEV_2425]; dev muốn 18%. Bỏ "FDI" khỏi loại công ty điển hình (FDI đã ở product). "Cần 3–5 năm kinh nghiệm" vẫn C. |

**Câu hỏi mở của bản nháp cũ** ("có gộp INFRA_ERP vào WE_ONSITE_ENTERPRISE không"): không gộp. INFRA_ERP gán `WE_ONSITE_ENTERPRISE` 60%, `WE_FIELD_CLIENT` 40%, vì phần lớn ERP là IT nội bộ doanh nghiệp, phần còn lại ở đối tác triển khai vẫn đi công tác. Nhóm không còn mã INFRA_CRM trong 22 nghề nên không phải quyết.

## Trọng số random công ty

- Loại công ty của người trả lời ITviec 2023–2024 (n=2.207): product 50,1%; outsourcing 32,1%; IT nội bộ doanh nghiệp non-IT 9,3%; IT service 5,0%; consulting 3,5% [ITVIEC_2324]. Mẫu tự chọn trên ITviec nên IT ngân hàng có thể bị thiếu (C).
- Vì vậy nghề lập trình chung đặt product và outsourcing ngang nhau hoặc nghiêng product; doanh nghiệp/ngân hàng 15–20%.

## Chưa có nguồn

- Báo cáo ITviec 2025–2026 chỉ đọc được phần lương; số mô hình làm việc và OT bị khoá sau form email. Bản sao Scribd (47% có OT, 16,4% OT trên 8 giờ/tuần) là bên thứ ba, không dùng.
- Không có JD kiểm được cho kỹ sư mạng ở system integrator, helpdesk datacenter, outsourcing lớn (FPT Software, KMS, NashTech).
- Dress code, điều kiện vật lý, mùa cao điểm của mọi loại hình IT đều là C.

## Bảng nguồn

| Mã | Tên | URL | Đã đọc |
|---|---|---|---|
| ITVIEC_2324 | ITviec IT Salary & Job Expectation Report 2023–2024 (PDF, tr.14, 17, 70, 82, 102–104) | https://itviec.com/blog/wp-content/uploads/2023/12/ITviec-IT-Salary-Report-2023-2024-Full-EN-85777e.pdf | nội dung |
| ITVIEC_2526 | ITviec Vietnam IT Salary & Recruitment Market Report 2025–2026 | https://itviec.com/report/vietnam-it-salary-and-recruitment-market | chỉ phần lương |
| TOPDEV_2425 | TopDev Vietnam IT Market Report 2024–2025, tr.20 | https://shiftasia.com/wp-content/uploads/2024/12/TopDev_VietnamITMarketReport2024_2025_VietnamITTechTalentLandscape.pdf | nội dung |
| JD_SOC_NOC | JD SOC Tier 1 FPT Telecom; SOC và NOC CMC Telecom; Bellsystem24 IT Support (3 ca) | https://fptjobs.com/chuyen-vien-giam-sat-an-ninh-mang-247-tier-1-soc-tier-1-23426 ; https://cmctelecom.vn/recruit/chuyen-vien-phan-tich-bao-mat-soc/ ; https://123job.vn/viec-lam/ky-su-truc-van-hanh-noc-29GgnJL19E | nội dung (Bellsystem24 chỉ đoạn trích) |
| JD_BANK_IT | JD Senior SOC Engineer Techcombank (TopDev) | https://topdev.vn/viec-lam/senior-soc-engineer-techcombank-2030055 | nội dung |
| JD_ERP | JD tư vấn ERP FOXAI (11/11/2025); SAP B1 Khai Anh (đoạn trích) | https://fox.ai.vn/jobs/chuyen-vien-tu-van-trien-khai-erp-senior/ | nội dung |
| JD_SAP | JD SAP Consultant CMC Global, FPT IS (TopDev) | https://topdev.vn/viec-lam/sap-consultant-cmc-global-2025389 ; https://topdev.vn/viec-lam/sap-consultant-fpt-is-2128242 | nội dung |
| JD_HYBRID | JD Hybrid Salesforce Developer Keizu (TopDev) | https://topdev.vn/viec-lam/hybrid-senior-salesforce-developer-cloud-cong-ty-tnhh-keizu-viet-nam-2035616 | nội dung |
| BRSE_BLOG | Blog BrSE trên Viblo (29/11/2017), ý kiến cá nhân | https://viblo.asia/p/ブリッジseとしてベトナムでのオフショア開発を進めるときに気をつけること-brse-can-chu-y-gi-khi-lam-viec-voi-offshore-4dbZNg4glYM | nội dung |
| ND145_2020 | Nghị định 145/2020/NĐ-CP, Điều 61 (qua lsvn.vn) | https://lsvn.vn/doanh-nghiep-duoc-to-chuc-lam-them-tu-tren-200-gio-den-300-gio-trong-mot-nam-trong-truong-hop-nao-a162519.html | trang luật thứ cấp |

## Phụ lục: gán môi trường cũ trong dataset IT (đã xoá 29/10/2026)

Trường `work_environment_ids`, `work_environment_primary`, `work_environment_note` đã xoá khỏi `final_22_roles.json` và `78_roles_unmerged.json` theo quyết định của người dùng (29/10/2026); thay bằng `decisions/occupation_work_environments.csv`. Ghi chú gán cũ chép lại dưới đây vì một số dòng là bằng chứng đếm từ JD (mức B), dùng được khi duyệt lại trọng số.

| Nghề | Mã cũ (chính in đậm) | Ghi chú cũ | File |
|---|---|---|---|
| `CLOUD_DEVOPS` | **WE_HYBRID_PRODUCT**, WE_REMOTE_GLOBAL | Thường xuyên có trực On-call. | `final_22_roles.json` |
| `DATA_DA` | WE_ONSITE_ENTERPRISE, **WE_HYBRID_PRODUCT** | Ngân hàng yêu cầu bảo mật cao nên thường làm onsite. | `final_22_roles.json` |
| `INFRA_HELPDESK` | **WE_ONSITE_ENTERPRISE**, WE_SHIFT_24_7 | Phải có mặt tại văn phòng để hỗ trợ phần cứng. | `final_22_roles.json` |
| `PROD_BA` | WE_ONSITE_ENTERPRISE, **WE_PROJECT_OUTSOURCING** | Phụ thuộc vào khách hàng. | `final_22_roles.json` |
| `QA_MANUAL` | **WE_PROJECT_OUTSOURCING**, WE_HYBRID_PRODUCT | Dễ làm remote nhưng do yếu tố bảo mật thường phải tới văn phòng ở dự án outsource. | `final_22_roles.json` |
| `SEC_SOC` | **WE_SHIFT_24_7**, WE_ONSITE_ENTERPRISE | Trực ca đêm là đặc trưng lớn nhất của role này ở band thấp. | `78_roles_unmerged.json` |
| `SWE_ARCH_ENT` | **WE_ONSITE_ENTERPRISE** | Techcombank, HDBank, TPBank, MEGAZONE đều ghi 'At office'; TPBank ghi thêm chính sách No OT. HDBank là ngoại lệ đáng ghi: mô hình 'SWAT Team, cường độ cao trong giai đoạn triển khai trọng điểm' — mâu thuẫn với hình dung 'ngân hàng thì nhàn'. NAB ghi hybrid, nhưng KHÔNG archetype nào trong work_environments.json mô tả 'hybrid tại doanh nghiệp lớn' — WE_HYBRID_PRODUCT được định nghĩa cho công ty làm product in-house. Xem VF-05. | `78_roles_unmerged.json` |
| `SWE_BACKEND` | **WE_HYBRID_PRODUCT**, WE_PROJECT_OUTSOURCING, WE_ONSITE_ENTERPRISE | Product/Startup thường hybrid, ngân hàng thường onsite 100%. | `final_22_roles.json` |
| `SWE_FRONTEND` | WE_PROJECT_OUTSOURCING, **WE_HYBRID_PRODUCT**, WE_REMOTE_GLOBAL, WE_ONSITE_ENTERPRISE | Hybrid chiếm ưu thế rõ rệt: Axon (onsite T3-T6, remote T2), NAB (toàn bộ 5 JD ghi hybrid working model), Holistics, ANDPAD, what3words (tối đa 2 ngày WFH + 6 tuần làm việc từ bất kỳ đâu mỗi năm), Workday (Flex Work tính 50% theo quý thay vì ngày/tuần). Remote hoàn toàn chỉ ở Employment Hero và Binance, cả hai đều là công ty nước ngoài và đều ở band L5+. Onsite 100%: Nexlab, Axon SWE II, FireGroup, FinX, Moatable (có on-site bonus 2,5 triệu/tháng), One Mount. KHÔNG có JD nào trong 37 mẫu nhắc tới ca kíp, on-call hay công tác tới site khách hàng — WE_SHIFT_24_7 và WE_FIELD_CLIENT không áp dụng cho role này. ĐÍNH CHÍNH so với bản trước: FE38 (Engineering Manager Frontend/Mobile) mô tả mô hình 'You Build It, You Run It' cùng trách nhiệm xử lý sự cố Sev1/Sev2 — hàm ý có trực sự cố. Đây là JD DUY NHẤT trong 40 mẫu có yếu tố vận hành production, và nó xuất hiện ở nhánh Management chứ không phải ở các band IC. Kết luận 'role này không có on-call' chỉ đúng với nhánh IC. | `final_22_roles.json` |
| `SWE_FULLSTACK` | **WE_HYBRID_PRODUCT**, WE_PROJECT_OUTSOURCING | Startup chuộng Fullstack để tiết kiệm resource. | `78_roles_unmerged.json` |
| `SWE_MOBILE` | **WE_HYBRID_PRODUCT**, WE_PROJECT_OUTSOURCING | App phát hành liên tục nên thường áp dụng Agile/Scrum. | `final_22_roles.json` |
