# PASS 0 — Bảng phân loại Archetype & Band (78 role)

**Trạng thái dữ liệu**: toàn bộ bảng này là `C_INFERRED` — suy luận từ hiểu biết thị trường VN, **chưa xác minh bằng JD**. Đây là bước triage để bạn duyệt bằng mắt trước khi chạy Pass 1/2, không phải dữ liệu cuối.

**Cách đọc**: A = full ladder (có tuyển entry) · B = lateral entry (vào từ role khác, mức Mid+) · C = destination node (bản thân là một cấp bậc) · D = hybrid

**Ưu tiên duyệt**: các dòng có `⚑` là chỗ mình phân vân nhất — bạn nên tự quyết trước khi chạy tiếp.

---

## DOMAIN 1 — Software Engineering & Architecture (17)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `SWE_BACKEND` | A | L1–L7 | Ladder chuẩn nhất thị trường. Dùng làm role tham chiếu cho cả dataset. |
| `SWE_FRONTEND` | A | L1–L7 | Như trên. |
| `SWE_FULLSTACK` | A | L1–L7 | Product/startup dùng nhiều; outsourcing ít gọi title này. |
| `SWE_MOBILE` | A | L1–L7 | Tách iOS/Android/Flutter ở band thấp, gộp lại từ L5. |
| `SWE_WEB` | A | L1–L6 | Trần thấp hơn Backend; VN thường không có Principal Web Dev. |
| `SWE_GAME` | A | L1–L7 | Cụm riêng (VNG, Gameloft, Amanotes), ít giao thoa ladder chung. |
| `SWE_EMBEDDED` | A | L1–L7 | Gắn FDI Nhật/Hàn/Đức (Bosch, Renesas). Band map theo thang FDI. |
| `SWE_BLOCKCHAIN` | B | L2–L7 | Startup crypto có tuyển fresher, nhưng phần lớn chuyển ngang từ Backend. Bạn quyết A hay B. |
| `SWE_BRSE` | D | L2–L7 | Hybrid thật: vừa có route riêng (comtor/N2 → BrSE), vừa là điểm đến của dev học tiếng Nhật. |
| `SWE_UIUX` | A | L1–L7 | Ladder riêng, gần như không giao với ladder engineer. |
| `SWE_ARCH_SW` | C | L6–L8 | Điểm đến từ Senior/Lead Backend. |
| `SWE_ARCH_SOL` | C | L6–L8 | Điểm đến; nhiều ở SI, banking, cloud partner. |
| `SWE_ARCH_ENT` | C | L7–L9 | **Không có L1–L6.** Đây là ca test chính. |
| `SWE_TECHLEAD` | C | L6–L7 | Là một cấp bậc, không phải path. Nhánh IC. |
| `SWE_EM` | C | L7–L9 | Là một cấp bậc. Nhánh Management. |

## DOMAIN 2 — Data, AI & ML (14)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `DATA_DA` | A | L1–L6 | Cửa vào phổ biến nhất của cả domain Data tại VN. |
| `DATA_BI` | B | L2–L6 | Có tuyển fresher (đặc biệt ngân hàng, retail) nhưng cũng nhiều người từ DA sang. |
| `DATA_DE` | B | L3–L7 | Gần như không có Intern/Fresher DE. Vào từ Backend hoặc DA. |
| `DATA_ANALYTICSENG` | B | L4–L6 | Title còn hiếm tại VN; thường là DE hoặc DA làm kiêm. |
| `DATA_DS` | B | L3–L7 | Có fresher DS ở một số nơi nhưng rất mỏng, phần lớn yêu cầu Master/kinh nghiệm. |
| `DATA_ML` | B | L3–L7 | Vào từ DS, Backend, hoặc research. |
| `DATA_AI` | B | L3–L7 | Ranh giới với DATA_ML mờ — xem mục 3 của taxonomy. |
| `DATA_GENAI` | B | L4–L7 | Mới; phần lớn là Backend/AI engineer chuyển sang 2023+. |
| `DATA_PROMPT` | B | L3–L5 | Nghi ngờ đây không phải role độc lập tại VN. Nên verify sự tồn tại trước khi làm ladder. |
| `DATA_MLOPS` | B | L4–L7 | Giao thoa mạnh với CLOUD_DEVOPS. |
| `DATA_CV_NLP` | B | L3–L7 | Gắn viện nghiên cứu / VinAI / FPT AI. |
| `DATA_AIARCH` | C | L7–L8 | Destination node. |
| `DATA_GOV` | B | L4–L7 | Ngân hàng là nơi tuyển chính. |
| `DATA_PM` | C | L5–L7 | Destination; vào từ PROD_PM hoặc DATA_DA senior. |

## DOMAIN 3 — Cloud, DevOps & SRE (9)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `CLOUD_DEVOPS` | B | L3–L7 | Ca kinh điển của "không có fresher". Vào từ SysAdmin hoặc Backend. |
| `CLOUD_DEVSECOPS` | B | L4–L7 | Vào từ DevOps hoặc AppSec. |
| `CLOUD_ENG` | B | L2–L6 | AWS/Azure partner tại VN CÓ tuyển fresher cloud. Đây là ngoại lệ trong domain. Khá ít tuyển intern / fresher cho role này |
| `CLOUD_ARCH` | C | L6–L8 | Destination node. |
| `CLOUD_SRE` | B | L4–L7 | Chủ yếu ở big tech/fintech; entry band cao. |
| `CLOUD_PLATFORM` | B | L4–L7 | Title còn mới tại VN. |
| `CLOUD_AUTO` | B | L3–L6 | Giao thoa với QA_AUTO và CLOUD_DEVOPS. |
| `CLOUD_LEAD` | C | L6–L8 | Destination node. |

## DOMAIN 4 — Cyber Security (8)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `SEC_ENG` | B | L3–L7 | Vào từ Network/SysAdmin/SOC. |
| `SEC_SOC` | A | L1–L6 | **Cửa vào entry-level duy nhất của domain SEC.** Có tier L1/L2/L3 nội bộ — đừng nhầm với band toàn cục. |
| `SEC_PENTEST` | B | L3–L7 | Route đặc thù: CTF/bug bounty → pentest, không qua ladder công ty. |
| `SEC_APPSEC` | B | L4–L7 | Vào từ Dev hoặc Pentest. |
| `SEC_IR` | B | L4–L7 | Vào từ SOC L3. |
| `SEC_GRC` | B ⚑ | L3–L7 | Có thể có entry qua audit/compliance nền phi kỹ thuật. |
| `SEC_ISM` | C | L7–L9 | Destination node. |
| `SEC_AISEC` | B | L4–L7 | Rất mới; verify sự tồn tại tại VN trước. |

## DOMAIN 5 — Product & Project Management (8)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `PROD_PM` | D | L3–L9 | Vừa có Associate PM (entry) vừa là điểm đến của BA/dev. |
| `PROD_PO` | B | L4–L6 | Tại VN nhiều nơi PO ≈ BA cấp cao, không phải role riêng. |
| `PROD_BA` | A | L1–L7 | Ladder đầy đủ; cửa vào lớn, đặc biệt ngân hàng và outsourcing. |
| `PROD_PJM` | C | L6–L8 | Destination; vào từ PL, BA, Tech Lead. |
| `PROD_PL` | C | L5–L6 | Đặc thù outsourcing VN. Là một cấp bậc, không phải path. |
| `PROD_SM` | B | L4–L6 | Thường kiêm nhiệm, ít khi là ladder độc lập. |
| `PROD_AGILE` | C | L7–L8 | Destination node, số lượng rất nhỏ tại VN. |
| `PROD_DM` | C | L7–L8 | Đặc thù outsourcing lớn (FPT, KMS). |

## DOMAIN 6 — QA & Testing (7)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `QA_MANUAL` | A | L1–L5 | Cửa vào IT lớn nhất tại VN sau BA. Trần thấp — đây là điểm đáng phân tích. |
| `QA_AUTO` | D | L3–L7 | Vào từ QA_MANUAL upskill, hoặc tuyển thẳng từ dev. |
| `QA_SDET` | B | L4–L7 | Yêu cầu nền coding thật; vào từ Dev hoặc QA_AUTO senior. |
| `QA_PERF` | B | L4–L7 | Chuyên môn hoá; vào từ QA_AUTO hoặc DevOps. |
| `QA_SECTEST` | B | L4–L7 | Giao thoa mạnh với SEC_PENTEST — xem quy tắc phân định. |
| `QA_LEAD` | C | L6–L8 | Destination node. |

## DOMAIN 7 — IT Infrastructure & Enterprise Systems (10)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `INFRA_HELPDESK` | A | L1–L4 | Trần rất thấp; giá trị của role này là làm feeder cho SysAdmin/SOC. |
| `INFRA_SYSADMIN` | D | L2–L6 | Có entry, đồng thời là điểm đến của Helpdesk. |
| `INFRA_SYSENG` | B | L3–L6 | Vào từ SysAdmin. |
| `INFRA_NETWORK` | A | L1–L7 | Ladder riêng theo chứng chỉ (CCNA→CCNP→CCIE), không theo band phần mềm. |
| `INFRA_DBA` | B | L3–L7 | Vào từ SysAdmin hoặc Backend. |
| `INFRA_ITOPS` | B | L3–L6 | Giao thoa với CLOUD_DEVOPS. |
| `INFRA_ERP` | B | L3–L7 | Ladder theo module (SAP MM/FI/SD), không theo band chung. |
| `INFRA_SAPBASIS` | B | L4–L7 | Rất chuyên biệt, ít công ty tại VN. |
| `INFRA_CRM` | B | L3–L7 | Salesforce partner tại VN có tuyển junior — cân nhắc D. |
| `INFRA_ITMANAGER` | C | L7–L9 | Destination node. |

## DOMAIN 8 — Tầng điều hành (6)

| Mã Role | Arch | Bands | Ghi chú phân loại |
|---|---|---|---|
| `EXEC_CTO` | C | L9–L10 | Tại startup VN, CTO có thể xuất hiện ở L7 — ghi rõ biến thiên theo quy mô. |
| `EXEC_CIO` | C | L9–L10 | Gần như chỉ tồn tại ở enterprise/ngân hàng. |
| `EXEC_VPOE` | C | L9–L10 | Hiếm tại VN; chủ yếu FDI và unicorn. |
| `EXEC_CISO` | C | L9–L10 | Ngân hàng bắt buộc có theo quy định. |
| `EXEC_CDO` | C | L9–L10 | Mới, số lượng rất nhỏ. |
| `EXEC_CPO` | C | L9–L10 | Chủ yếu product company. |

---

## Tổng hợp

| Archetype | Số role | Ý nghĩa vận hành |
|---|---|---|
| A — full ladder | 13 | Chạy Pass 1 chuẩn, chi phí thấp, dễ verify (JD entry rất nhiều). |
| B — lateral entry | 39 | **Nhóm lớn nhất.** Trường `feeder_roles` mới là dữ liệu có giá trị, không phải bảng level. |
| C — destination node | 20 | KHÔNG sinh ladder. Verify sự tồn tại của title + band là đủ. |
| D — hybrid | 6 | Tốn công nhất, nên làm cuối. |

**Ba quan sát đáng chú ý:**

1. **Chỉ 13/78 role có cửa vào entry-level thật.** Nếu bạn dùng prompt gốc, 65 role còn lại đều sẽ có bảng Intern→Fresher bịa. Đây là quy mô của lỗi.

2. **Nhóm B chiếm một nửa dataset** — nghĩa là câu chuyện nghề nghiệp IT tại VN chủ yếu là *chuyển ngang*, không phải *leo thang*. Với capstone hướng nghiệp của bạn, đồ thị `feeder_roles` có thể là output giá trị hơn cả bảng level.

3. **Cửa vào thật sự của ngành chỉ có 4 role**: `QA_MANUAL`, `PROD_BA`, `INFRA_HELPDESK`, `SEC_SOC` — cộng với các role SWE_ chuẩn. Đáng verify kỹ nhất vì học sinh cấp 3 dùng sản phẩm của bạn sẽ vào ngành qua đúng mấy cửa này.
