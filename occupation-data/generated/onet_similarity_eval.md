# Độ giống nghề–nghề so với O*NET Related Occupations

Sinh bởi `occupation-data/scripts/evaluate_onet_similarity.py`. 878 nghề có đủ mọi nhóm mô tả. Cách tính: cosine trên vector z (chuẩn hoá từng mục trên toàn bộ nghề), chuẩn hoá ma trận độ giống của từng nhóm, gộp bằng trung bình có trọng số.

| Cách đo | Trúng trong 5 nghề đầu (Primary-Short) | Trúng trong 10 nghề đầu (Primary) | Bắt được trong 20 nghề đầu (cả 20) |
|---|---|---|---|
| riasec | 20.3% | 26.7% | 32.2% |
| soft | 10.6% | 14.6% | 18.6% |
| riasec3+styles3+skills1 (đang dùng) | 29.7% | 35.6% | 39.6% |
| activities | 15.7% | 20.0% | 24.2% |
| skills | 16.5% | 22.2% | 27.5% |
| knowledge | 27.1% | 32.6% | 40.1% |
| skills+knowledge | 30.1% | 36.0% | 42.4% |
| skills+knowledge+activities | 29.2% | 34.6% | 40.3% |
| tất cả 6 nhóm, bằng nhau | 33.3% | 38.4% | 43.1% |
| *Mốc: ngẫu nhiên* | 0.6% | 1.3% | 2.3% |
| *Mốc: cùng nhóm mã SOC* | 27.6% | 30.7% | 32.2% |

## Trọng số chọn trên một nửa số nghề, đo trên nửa còn lại

Trọng số: Sở thích RIASEC (6) × 2, Work Styles (21) × 1, Essential + Transferable Skills (35) × 1, Knowledge (33) × 2.

- Nửa dùng để chọn: trúng 42.1% trong 10 nghề đầu.
- Nửa để kiểm: trúng 43.9% (cùng nửa này, 6 nhóm bằng nhau: 39.3%).

Related Occupations được dựng một phần từ Knowledge, nên bộ trọng số dưới đây bỏ Knowledge để đo phần khớp không vòng lặp.

Trọng số: Sở thích RIASEC (6) × 3, Work Styles (21) × 3, Essential + Transferable Skills (35) × 1.

- Nửa dùng để chọn: trúng 34.6%; nửa để kiểm: 36.7% (5 nhóm bằng nhau: 32.8%).

## 5 nghề giống nhất của một số nghề IT, cách đo: riasec3+styles3+skills1 (đang dùng)

✓ là nghề có trong tầng Primary của Related Occupations.

- **Lập trình viên Front-end** (15-1254.00): Computer and Information Research Scientists; ✓ Computer Programmers; ✓ Software Developers; ✓ Web and Digital Interface Designers; Data Scientists
- **Lập trình viên Back-end (gồm Mobile)** (15-1252.00): ✓ Computer Systems Analysts; ✓ Database Architects; Computer and Information Research Scientists; ✓ Computer Systems Engineers/Architects; Bioinformatics Scientists
- **Chuyên viên thiết kế UI/UX** (15-1255.00): ✓ Video Game Designers; ✓ Web Developers; Commercial and Industrial Designers; ✓ Graphic Designers; Special Effects Artists and Animators
- **Kiến trúc sư giải pháp** (15-1299.08): ✓ Computer Network Architects; Information Security Analysts; Telecommunications Engineering Specialists; ✓ Software Developers; ✓ Information Security Engineers
- **Trưởng phòng Kỹ thuật** (11-3021.00): Logisticians; ✓ Information Technology Project Managers; ✓ Management Analysts; Business Continuity Planners; Transportation, Storage, and Distribution Managers
- **Kiểm thử** (15-1253.00): Bioinformatics Technicians; ✓ Computer Programmers; Geographic Information Systems Technologists and Technicians; Statisticians; ✓ Database Architects
- **Chuyên viên phân tích dữ liệu** (15-2051.01): ✓ Operations Research Analysts; Financial Quantitative Analysts; Economists; Intelligence Analysts; Blockchain Engineers
- **Kỹ sư trí tuệ nhân tạo** (15-2051.00): ✓ Bioinformatics Scientists; ✓ Mathematicians; ✓ Biostatisticians; ✓ Statisticians; ✓ Operations Research Analysts
- **Kỹ sư an ninh mạng** (15-1299.05): ✓ Information Security Analysts; Digital Forensics Analysts; ✓ Computer Systems Engineers/Architects; ✓ Network and Computer Systems Administrators; ✓ Computer Network Architects
- **Chuyên viên kiểm thử xâm nhập** (15-1299.04): Digital Forensics Analysts; ✓ Information Security Analysts; ✓ Information Security Engineers; ✓ Blockchain Engineers; Bioinformatics Technicians
- **Chuyên viên phân tích nghiệp vụ** (15-1211.00): ✓ Software Developers; ✓ Computer Systems Engineers/Architects; Computer and Information Research Scientists; Computer Network Architects; ✓ Database Architects
- **Quản lý sản phẩm** (15-1299.09): ✓ Project Management Specialists; Logisticians; Medical and Health Services Managers; Chief Executives; Business Continuity Planners
- **Nhân viên hỗ trợ kỹ thuật / IT Support** (15-1232.00): Medical Assistants; ✓ Computer Systems Analysts; ✓ Computer Network Support Specialists; ✓ Network and Computer Systems Administrators; ✓ Computer Systems Engineers/Architects

## 5 nghề giống nhất của một số nghề IT, cách đo: tất cả 6 nhóm, bằng nhau

✓ là nghề có trong tầng Primary của Related Occupations.

- **Lập trình viên Front-end** (15-1254.00): Data Warehousing Specialists; ✓ Web and Digital Interface Designers; ✓ Computer Programmers; ✓ Database Architects; ✓ Software Developers
- **Lập trình viên Back-end (gồm Mobile)** (15-1252.00): ✓ Computer Systems Analysts; ✓ Database Architects; Blockchain Engineers; Data Warehousing Specialists; ✓ Web Developers
- **Chuyên viên thiết kế UI/UX** (15-1255.00): ✓ Web Developers; ✓ Software Developers; ✓ Video Game Designers; ✓ Computer Programmers; ✓ Computer Systems Analysts
- **Kiến trúc sư giải pháp** (15-1299.08): ✓ Computer Network Architects; ✓ Information Security Engineers; Information Security Analysts; ✓ Computer Hardware Engineers; Telecommunications Engineering Specialists
- **Trưởng phòng Kỹ thuật** (11-3021.00): ✓ Information Technology Project Managers; ✓ Project Management Specialists; Medical and Health Services Managers; General and Operations Managers; Business Continuity Planners
- **Kiểm thử** (15-1253.00): ✓ Database Architects; Data Warehousing Specialists; ✓ Software Developers; ✓ Computer Programmers; ✓ Information Security Engineers
- **Chuyên viên phân tích dữ liệu** (15-2051.01): Financial Quantitative Analysts; Economists; ✓ Data Scientists; Statisticians; Data Warehousing Specialists
- **Kỹ sư trí tuệ nhân tạo** (15-2051.00): ✓ Statisticians; ✓ Mathematicians; ✓ Biostatisticians; ✓ Financial Quantitative Analysts; ✓ Bioinformatics Technicians
- **Kỹ sư an ninh mạng** (15-1299.05): ✓ Computer Systems Engineers/Architects; ✓ Computer Network Architects; ✓ Information Security Analysts; ✓ Penetration Testers; Digital Forensics Analysts
- **Chuyên viên kiểm thử xâm nhập** (15-1299.04): ✓ Information Security Analysts; ✓ Information Security Engineers; Digital Forensics Analysts; Computer Network Architects; ✓ Computer Systems Engineers/Architects
- **Chuyên viên phân tích nghiệp vụ** (15-1211.00): ✓ Software Developers; Computer and Information Research Scientists; ✓ Computer Systems Engineers/Architects; Computer Network Architects; ✓ Database Architects
- **Quản lý sản phẩm** (15-1299.09): Chief Executives; Medical and Health Services Managers; Purchasing Managers; ✓ Project Management Specialists; ✓ General and Operations Managers
- **Nhân viên hỗ trợ kỹ thuật / IT Support** (15-1232.00): ✓ Computer Network Support Specialists; ✓ Computer Systems Engineers/Architects; ✓ Computer Systems Analysts; ✓ Information Security Analysts; ✓ Network and Computer Systems Administrators

## Nguồn

- This page includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).
- Used under the CC BY 4.0 license.
- O*NET® is a trademark of USDOL/ETA.
- JobQuest has modified all or some of this information.
- USDOL/ETA has not approved, endorsed, or tested these modifications.
