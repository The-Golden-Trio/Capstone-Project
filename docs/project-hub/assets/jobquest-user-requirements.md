# JobQuest — User Requirements and their derivation to FR / NFR

> **Ghi chú cho nhóm (T2609.11, 07 B14).** Cô nhận xét 26/9: FR và NFR phải đi ra từ user requirement, và phải thấy mỗi user requirement sinh ra yêu cầu nào. File này viết user requirement (UR) trước, theo 4 vai trò cuối (D-16, DE dùng hệ thống trực tiếp), rồi ánh xạ xuống FR/NFR.
>
> - **Cơ sở:** FR-01…FR-22, NFR-01…NFR-15, BR và DC lấy từ `reports/2026-10-02_ch1-5/latex/chapters/ch4.tex` (trên `main` từ PR #4, 2/10). Hành trình người dùng lấy từ `assets/jobquest-user-journey.md`.
> - **Không đổi số FR/NFR hiện có.** Những chỗ UR không có FR nào phục vụ được ghi ở §4 dạng **đề xuất**, chưa phải quyết định.
> - Phần tiếng Anh (§1–§3) viết sẵn để đưa vào §4.3 của báo cáo.

## 1. Approach (report-ready)

Requirements are elicited first as user requirements: statements, in the terms of each user group, of what that group needs to accomplish with the system and of the qualities it expects while doing so. They are written as user stories for the four user groups identified in Section 4.2.1 — explorer, domain expert, content administrator, and system administrator. Each user requirement is then analysed into one or more functional requirements, stating what the system does, and non-functional requirements, stating how well it must do it. Because user requirements capture quality expectations as well as tasks, every non-functional requirement, like every functional one, traces back to a user need. Data requirements are derived in turn from the functional and non-functional requirements, and design constraints from the non-functional requirements (Table 4.x).

The priority of a user requirement is the highest priority among the requirements derived from it. Every functional and non-functional requirement traces to at least one user requirement (Section 3).

## 2. User requirements

### 2.1 Explorer

| ID | User requirement | Priority | Derived FR | Derived NFR |
|---|---|---|---|---|
| UR-E01 | As an explorer, I want to create an account and return to my own progress on every visit, with my guardian's consent if I am under sixteen, so that my exploration is kept and lawfully protected. | Must | FR-01 | NFR-05 |
| UR-E02 | As an explorer, I want to browse the occupations available and read what each involves, including its unfavourable aspects, before choosing one, so that my first impression is not a recruitment pitch. | Must | FR-02, *FR-23 (proposed, §4)* | — |
| UR-E03 | As an explorer who does not know where to begin, I want optional suggestions of occupations to start with, so that a blank choice does not stop me. | Should | FR-11 | — |
| UR-E04 | As an explorer, I want to try the entry level of any occupation without prerequisite, so that I can survey possibilities before committing attention to one. | Must | FR-02 | — |
| UR-E05 | As an explorer, I want to be told my role, team, and working context before the tasks of a level begin, so that my decisions are situated rather than abstract. | Must | FR-03 | — |
| UR-E06 | As an explorer, I want to perform tasks that practitioners would recognise and whose objective I can understand, so that what I learn reflects the occupation. | Must | FR-04 | NFR-09, NFR-15 |
| UR-E07 | As an explorer, I want to respond in the forms the work itself takes — choosing a course of action, ordering steps, writing an email, explaining or reviewing code — so that I experience how the work is done, not only what it is about. | Must | FR-05, FR-06 | — |
| UR-E08 | As an explorer, I want hints when I am stuck, so that I can continue while still learning. | Should | FR-22 | — |
| UR-E09 | As an explorer, I want my response judged as an expert in the occupation would judge it, and returned as a result, an explanation, and guidance, so that I can trust the judgment and know how to improve. | Must | FR-05, FR-06, FR-07 | NFR-14 |
| UR-E10 | As an explorer, I want scenarios and feedback to arrive without long waits, and to see progress while I wait, so that the experience keeps its momentum. | Must | — | NFR-01, NFR-02 |
| UR-E11 | As an explorer, I want to play on my phone and over a weak connection, without installing anything, so that I can explore wherever I am. | Must | — | NFR-13 |
| UR-E12 | As an explorer, I want to resume where I stopped after an interruption or a system failure, and to be told promptly if something has failed, so that I never lose work I have done. | Must | — | NFR-03, NFR-04 |
| UR-E13 | As an explorer, I want to know which content and judgments are produced by AI, so that I can weigh them accordingly. | Must | — | NFR-07 |
| UR-E14 | As an explorer, I want the competencies I demonstrate to be recorded and to open higher levels as they grow, without replaying the same scenario being enough to inflate them, so that my progress reflects what I can do rather than time spent. | Must | FR-08, FR-09 | — |
| UR-E15 | As an explorer, I want to move to an adjacent occupation, at a level my competencies support, when they qualify me, so that I need not restart when exploring related work. | Should | FR-10 | — |
| UR-E16 | As an explorer, I want career and life events to change the course of later runs, so that I see that fit also depends on circumstances and each run differs. | Could | FR-14 | — |
| UR-E17 | As an explorer, I want to rate an occupation after completing it and see how others rated it, without anyone's individual rating being exposed, so that I can compare my impression with a broader one. | Should | FR-12 | NFR-06 |
| UR-E18 | As an explorer, I want a private record of what I have attempted and demonstrated, so that my exploration accumulates into something I can reflect on. | Should | FR-13 | NFR-05 |
| UR-E19 | As an explorer, I want my individual responses and results never to be shown to others or passed to employers, and my data to be deleted when I ask, so that trying an occupation carries no risk to me. | Must | *FR-24 (proposed, §4)* | NFR-05, NFR-06 |
| UR-E20 | As an explorer, I want to use the platform in Vietnamese or English, so that language is not a barrier to exploring. | Should | — | NFR-08 |

### 2.2 Domain expert

| ID | User requirement | Priority | Derived FR | Derived NFR |
|---|---|---|---|---|
| UR-D01 | As a domain expert, I want to author a scenario's seed — required facts, target competencies, canon events, keyed response options, and rubric — directly in the system, with my authorship recorded, so that the content I own is traceable to me and needs no developer to enter. | Must | FR-15 | NFR-10 |
| UR-D02 | As a domain expert, I want every scenario generated from my seed to keep its canon events, required facts, and the effectiveness of each option as I keyed them, so that the system never misrepresents the work in my name. | Must | FR-04 | NFR-15 |
| UR-D03 | As a domain expert, I want to review, and play through, seeds I did not author together with a sample of their generated scenarios, and record my approval, rejection, or correction, so that only content experts judge accurate reaches explorers and my review play is not counted as explorer data. | Must | FR-16 | — |
| UR-D04 | As a domain expert, I want to see where the automated judge disagrees with expert judgments, so that I can refine the rubric. | Should | FR-17 | NFR-14 |
| UR-D05 | As a domain expert, I want to revalidate published content each year, or sooner when practice changes, so that what explorers see stays current. | Should | FR-16, FR-19 | — |
| UR-D06 | As a domain expert, I want to adapt the competencies and occupational adjacencies of my occupation to Vietnamese practice, so that progression and adjacency reflect how the work is organised here. | Should | *FR-25 (proposed, §4)* | — |
| UR-D07 | As a domain expert, I want to rate explorers' responses and generated scenarios blind, independently of other experts, so that the automated judge and the generator can be measured against expert judgment. | Should | *FR-26 (proposed, §4)* | NFR-14, NFR-15 |

### 2.3 Content administrator

| ID | User requirement | Priority | Derived FR | Derived NFR |
|---|---|---|---|---|
| UR-C01 | As a content administrator, I want to add a new occupation and track it through authoring, review, publication, and retirement without asking developers, so that catalogue growth is managed. | Must | FR-18 | NFR-10 |
| UR-C02 | As a content administrator, I want to arrange how approved content is laid out and presented in gameplay, without altering its substance, so that explorers receive it in a coherent form. | Must | *FR-27 (proposed, §4)* | — |
| UR-C03 | As a content administrator, I want to review an occupation as a whole and be able to publish it only when its seeds are approved, so that nothing unvalidated is released. | Must | FR-18 | — |
| UR-C04 | As a content administrator, I want to see coverage and last-validated dates across occupations, so that I can identify stale content and arrange its revalidation. | Should | FR-19 | — |
| UR-C05 | As a content administrator, I want scenarios generated from a seed to be withdrawn when that seed is revised, until it is approved again, so that explorers never meet content based on a superseded seed. | Should | FR-16, FR-18 | — |

### 2.4 System administrator

| ID | User requirement | Priority | Derived FR | Derived NFR |
|---|---|---|---|---|
| UR-S01 | As a system administrator, I want to configure which models generate and which assess, keep the two separate, and change provider without touching any authored content, so that assessment stays independent and the platform is not locked to one vendor. | Must | FR-20 | NFR-12 |
| UR-S02 | As a system administrator, I want to monitor usage, cost, and failures and keep the cost of each session within budget, so that the service remains operable on grant funding. | Must | FR-21 | NFR-11 |
| UR-S03 | As a system administrator, I want to manage accounts and grant staff the roles and occupations they work on, so that each person can do exactly their part. | Must | *FR-28 (proposed, §4)* | — |
| UR-S04 | As a system administrator, I want to handle data-subject requests and oversee data-protection controls, so that the platform meets its legal obligations to users, including minors. | Must | *FR-24 (proposed, §4)* | NFR-05, NFR-06 |

## 3. Traceability: requirement → user requirement

These columns are to be added to the FR and NFR tables (column "Derived from").

| FR | Derived from | | NFR | Derived from |
|---|---|---|---|---|
| FR-01 | UR-E01 | | NFR-01 | UR-E10 |
| FR-02 | UR-E02, UR-E04 | | NFR-02 | UR-E10 |
| FR-03 | UR-E05 | | NFR-03 | UR-E12 |
| FR-04 | UR-E06, UR-D02 | | NFR-04 | UR-E12 |
| FR-05 | UR-E07, UR-E09 | | NFR-05 | UR-E01, UR-E18, UR-E19, UR-S04 |
| FR-06 | UR-E07, UR-E09 | | NFR-06 | UR-E17, UR-E19, UR-S04 |
| FR-07 | UR-E09 | | NFR-07 | UR-E13 |
| FR-08 | UR-E14 | | NFR-08 | UR-E20 |
| FR-09 | UR-E14 | | NFR-09 | UR-E06 |
| FR-10 | UR-E15 | | NFR-10 | UR-D01, UR-C01 |
| FR-11 | UR-E03 | | NFR-11 | UR-S02 |
| FR-12 | UR-E17 | | NFR-12 | UR-S01 |
| FR-13 | UR-E18 | | NFR-13 | UR-E11 |
| FR-14 | UR-E16 | | NFR-14 | UR-E09, UR-D04, UR-D07 |
| FR-15 | UR-D01 | | NFR-15 | UR-E06, UR-D02, UR-D07 |
| FR-16 | UR-D03, UR-D05, UR-C05 | | | |
| FR-17 | UR-D04 | | | |
| FR-18 | UR-C01, UR-C03, UR-C05 | | | |
| FR-19 | UR-D05, UR-C04 | | | |
| FR-20 | UR-S01 | | | |
| FR-21 | UR-S02 | | | |
| FR-22 | UR-E08 | | | |

All 22 FR and 15 NFR trace to at least one user requirement. Six user requirements have no existing FR (§4).

## 4. Khoảng trống phát hiện khi đi ngược từ UR (đề xuất, cần nhóm chốt)

Viết UR trước làm lộ ra các nhu cầu mà báo cáo đã mô tả (§4.1.2, §4.2.1, §4.1.4) hoặc prototype đã có màn hình, nhưng **chưa có FR nào**. Số FR-23… chỉ là tạm.

| # | Đề xuất | Từ UR | Vì sao cần |
|---|---|---|---|
| G1 | **FR-23** Present the occupation catalogue and each occupation's introduction, including its unfavourable aspects (Must) | UR-E02 | UC-01 "Khám phá catalogue" và màn *Occupation map / Occupation profile* đã có, nhưng không có FR. BR-07 (phải nêu mặt không hay) hiện không được FR nào thực hiện |
| G2 | **FR-24** Accept and fulfil a user's request to delete their personal data (Must) | UR-E19, UR-S04 | NFR-05 ghi "deletable on request" nhưng không có chức năng nào nhận yêu cầu xoá |
| G3 | **FR-25** Let domain experts review and adapt the competency taxonomy and adjacency for their occupation (Should) | UR-D06 | DR-01…03 ghi "adapted by domain experts", journey có *Review competencies / Review adjacency*, nhưng không có FR |
| G4 | **FR-26** Present responses and generated scenarios to domain experts for blind, independent rating (Should) | UR-D07 | DR-09 Giai đoạn B cần chuyên gia chấm. **Hoặc** ghi rõ việc chấm làm ngoài hệ thống, khi đó bỏ UR-D07 |
| G5 | **FR-27** Let the content administrator arrange the layout and presentation of approved content without altering it (Must) | UR-C02 | §4.2.1 và D-16 giao việc này cho CA nhưng không có FR |
| G6 | **FR-28** Manage accounts and grant staff roles and the occupations they work on (Must) | UR-S03 | §4.2.1 ghi SA "administering accounts and access", journey có *Manage accounts and roles*, chưa có FR |

Sửa câu chữ FR hiện có (không thêm số):

- **FR-01** thêm *"…including guardian consent for users under sixteen"*: UR-E01 và §4.1.4 yêu cầu, prototype đã có màn đồng ý giám hộ, nhưng FR-01 bản 2/10 bỏ mất ý này.
- **FR-16** thêm *"…review attempts are recorded as such and excluded from explorer metrics"*: nếu không, trường *attempt type* của DR-07 không có FR nào sinh ra.
- **FR-18** nên có trạng thái *Under revalidation* (khớp state machine T2609.14), để UR-D05 / BR-15 (kiểm định lại hằng năm) có chức năng khởi động, không chỉ là báo ngày ở FR-19.

Nếu nhận cả 6 đề xuất: **28 FR, 15 NFR, 10 DR**, nhớ sửa con số ở §4.4 Summary và deck (T2609.12).
