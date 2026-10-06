# Mẫu báo cáo ĐACN và đối chiếu với báo cáo hiện tại

> Mẫu gốc: [`2026-08-30_DACN_Final_Report_Template_English.pdf`](2026-08-30_DACN_Final_Report_Template_English.pdf) (*Final report template, English*, bản 30/8/2026, 5 trang). Phúc đưa vào repo 6/10.
> **Mọi báo cáo trong `reports/` phải theo cấu trúc này.** Tên chương và tên mục đã ghi trong mẫu thì giữ nguyên; chỗ mẫu ghi `…` thì nhóm tự đặt tên.

## 1. Cấu trúc theo mẫu

Chữ nghiêng là ghi chú của mẫu, giữ nguyên tiếng Anh.

**Phần đầu:** Abstract · Tóm tắt báo cáo · Table of Contents · List of Abbreviations · List of Figures · List of Tables

*"for any extracted part which is from the other sources and AI's supports, citations are required from Chapter 1 to the end of the report"*

| Chương | Mục | Ghi chú của mẫu |
|---|---|---|
| **1 – Introduction** | 1.1 Motivations | *(why)* |
| | 1.2 Objectives | *(what)* |
| | 1.3 Scope | |
| | 1.4 Significance of the Project: 1.4.1 from the Practical Perspectives · 1.4.2 from the Scientific Perspectives | |
| | 1.5 Report Structure | |
| **2 – Background Knowledge and Technologies** | 2.1 … · 2.2 … | |
| | 2.x Summary (mục cuối) | *summarize what has been presented and confirm if they can cover all the background knowledge and technologies required and intended for your project* |
| **3 – Related Work** | 3.1 … | *Existing Similar/Related Works from reviewed papers/articles* |
| | 3.2 … | *Existing Similar/Related Works from software/tools/systems* |
| | 3.3 Summary | *Identify and analyze the gaps from the related works and position the work you are working on* |
| **4 – The Proposed System** | 4.1 Business Context | *Application domain and its business processes along with business rules. Business organization descriptions including policies, especially those with legal and ethical issues* |
| | 4.2 System Description: 4.2.1 System Overview · 4.2.2 Research Problems · 4.2.3 Challenges and Difficulties | 4.2.1: *An overall view about the proposed system, its purposes and users/user groups* |
| | 4.3 User's Requirements: 4.3.1 Functional · 4.3.2 Non-functional · 4.3.3 Data Requirements | *Requirement analysis is also included for each group* |
| | 4.4 Summary | |
| **5 – Analysis and Design** | 5.1 Analysis: 5.1.1 Business Process Modeling · 5.1.2 Use Case Modeling | 5.1.1: *activity diagrams or anything else you prefer*. 5.1.2: *use case diagrams and tabular description of each key use case* |
| | 5.2 Technology Solution: 5.2.1 Frontend · 5.2.2 Backend · 5.2.3 AI algorithms/technologies/models/… | *Technology stack. Each technology solution is selected according to some criteria after compared with the others* |
| | 5.3 Design: 5.3.1 System Architecture · 5.3.2 Sitemap Design · 5.3.3 Sequence Diagrams · 5.3.4 Class Diagrams · 5.3.5 Database Design · 5.3.6 AI Model Design · 5.3.7 API Design · 5.3.8 UI/UX Design · 5.3.9 Test Case Design · 5.3.10 Policies for the Processing of the Proposed System and Third-parties | 5.3.1: *general with component diagram and the one with the selected technologies* |
| | 5.4 Summary | |
| **6 – Implementation and Testing** | 6.1 Implementation · 6.2 Testing · 6.3 Summary | |
| **7 – System Evaluation** | 7.1 … · 7.2 … · 7.3 … · 7.4 Summary | 7.1: *Frontend-related evaluation*. 7.2: *Backend-related evaluation*. 7.3: *AI-related evaluation* |
| **8 – Conclusion** | 8.1 Achievements | *what has been done and achieved* |
| | 8.2 Future Works | *all limitations of your current work are described here and then linked to your future works. For the first phase, they are included in the plan for the next phase* |

**Phần cuối:** Plan for Capstone Project (*make a plan for a 15-week capstone project*) · References (*use any well-known format from IEEE, ACM, Springer Verlag, etc.*) · Appendix 1 · Appendix 2 (*pay attention to the number of pages to properly prepare for appendices*)

## 2. Yêu cầu của cô ứng với mục nào của mẫu

| Cô yêu cầu (email 1/10) | Mục của mẫu |
|---|---|
| Tìm hiểu và đối sánh các giải pháp công nghệ, kể cả mô hình AI | **5.2** Technology Solution: 5.2.1 Frontend · 5.2.2 Backend · 5.2.3 AI |
| Từ đó thiết kế kiến trúc hệ thống, giải pháp của đề tài | **5.3.1** System Architecture, rồi 5.3.2 đến 5.3.10 |
| Xây dựng giải pháp AI/ML | **5.3.6** AI Model Design (thiết kế) · **6.1** Implementation (xây dựng) · **7.3** AI-related evaluation (đánh giá) |
| Build prototype cho một số user requirement | **6.1** Implementation · **6.2** Testing |

## 3. Đối chiếu bản nháp 2/10 với mẫu (6/10)

| Phần | Bản 2/10 | So với mẫu |
|---|---|---|
| Abstract, List of Abbreviations | Có | Khớp |
| **Tóm tắt báo cáo** | **Không có**: handoff 29/9 ghi phần Tóm tắt tiếng Việt đã bỏ, chỉ giữ Abstract | ⚠️ Lệch mẫu. Cần chốt: thêm lại, hay cô đã cho phép bỏ ([07](../07-van-de-mo.md) A19) |
| Table of Contents, List of Figures, List of Tables | Chỉ có trong bản LaTeX | Khớp |
| **Trích dẫn phần có AI hỗ trợ** | Chưa có | ⚠️ Mẫu yêu cầu trích dẫn cả phần do AI hỗ trợ, từ Chương 1 tới hết. Cần chốt cách ghi (A19) |
| Chương 1 | 1.1 đến 1.5, có 1.4.1 và 1.4.2 | Khớp |
| Chương 2 | 2.1 đến 2.7, kết bằng 2.8 Summary | Khớp |
| Chương 3 | 3.1 từ bài báo · 3.2 từ hệ thống · 3.3 *Comparison, gap analysis, and positioning* | Nội dung 3.3 đúng ý mẫu, nhưng **tên mục không phải "Summary"** (A19) |
| Chương 4 | 4.1 (có 4.1.1 đến 4.1.5) · 4.2.1 đến 4.2.3 · 4.3.1 đến 4.3.3 · 4.4 Summary | Khớp. User story theo từng nhóm ở 4.3.1 đáp ứng ghi chú của 4.3 |
| Chương 5 | Mới có 5.1.1 và 5.1.2 | **Thiếu 5.2, 5.3.1 đến 5.3.10, 5.4** |
| Chương 6, 7, 8 | Chưa viết | Thiếu |
| Plan for Capstone Project | Chưa có | Thiếu. Kế hoạch 15 tuần cho capstone |
| References | 113 tài liệu, kiểu IEEE | Khớp |
| Appendix | §5.1.2 hẹn "Appendix 1" cho các use case còn lại | Chưa viết |
| Tiêu đề chương trong LaTeX | In "1 Introduction" | Mẫu ghi "Chapter 1 – Introduction". Class `hcmut-report` lấy từ môn khác, không phải mẫu của ĐACN |
