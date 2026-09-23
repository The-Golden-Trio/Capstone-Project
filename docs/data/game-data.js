/* SINH TU DONG — dung sua tay. Sinh lai: node docs/data/build.mjs */

window.GAME = {
  "_meta": {
    "generated_at": "2026-09-23",
    "source_dataset": "occupation-data/datasets/dataset_22_roles_enriched_v3.json",
    "group": "Software Engineering & Architecture",
    "note": "SINH TU DONG. Sinh lai: node docs/data/build.mjs"
  },
  "fit_dimensions": {
    "INTERRUPT": "Chịu được bị ngắt quãng, gọi ngoài giờ",
    "DEEP_WORK": "Thích tập trung sâu, làm một mình",
    "AMBIGUITY": "Chịu được yêu cầu mơ hồ, thiếu thông tin",
    "DETAIL": "Tỉ mỉ, chú ý chi tiết nhỏ",
    "PEOPLE": "Thích làm việc và thuyết phục người khác",
    "VISIBLE": "Cần thấy kết quả công việc rõ ràng",
    "REPETITION": "Chịu được công việc lặp lại",
    "PRESSURE": "Chịu áp lực thời gian và sự cố"
  },
  "all_roles": {
    "SWE_FRONTEND": {
      "name_vn": "Lập trình viên Front-end",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_BACKEND": {
      "name_vn": "Lập trình viên Back-end / Kỹ sư Back-end",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_MOBILE": {
      "name_vn": "Lập trình viên Mobile / Kỹ sư ứng dụng di động",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_GAME": {
      "name_vn": "Lập trình viên Game",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_UIUX": {
      "name_vn": "Chuyên viên thiết kế UI/UX",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_EMBEDDED": {
      "name_vn": "Kỹ sư phần mềm nhúng / Kỹ sư IoT",
      "group": "Software Engineering & Architecture",
      "bands": "L1-L7"
    },
    "SWE_ARCH_SOL": {
      "name_vn": "Kiến trúc sư giải pháp",
      "group": "Software Engineering & Architecture",
      "bands": "L6-L8"
    },
    "SWE_TECHLEAD": {
      "name_vn": "Trưởng nhóm kỹ thuật",
      "group": "Software Engineering & Architecture",
      "bands": "L6-L7"
    },
    "SWE_EM": {
      "name_vn": "Trưởng phòng Kỹ thuật",
      "group": "Software Engineering & Architecture",
      "bands": "L7-L9"
    },
    "QA_MANUAL": {
      "name_vn": "Kỹ sư kiểm thử thủ công / Tester",
      "group": "Quality Assurance & Testing",
      "bands": "L1-L5"
    },
    "DATA_DA": {
      "name_vn": "Chuyên viên phân tích dữ liệu",
      "group": "Data, AI & Machine Learning",
      "bands": "L1-L6"
    },
    "DATA_AI": {
      "name_vn": "Kỹ sư trí tuệ nhân tạo",
      "group": "Data, AI & Machine Learning",
      "bands": "L3-L7"
    },
    "DATA_DE": {
      "name_vn": "Kỹ sư dữ liệu",
      "group": "Data, AI & Machine Learning",
      "bands": "L3-L7"
    },
    "CLOUD_DEVOPS": {
      "name_vn": "Kỹ sư DevOps",
      "group": "Cloud, DevOps & SRE",
      "bands": "L3-L7"
    },
    "CLOUD_ENG": {
      "name_vn": "Kỹ sư điện toán đám mây",
      "group": "Cloud, DevOps & SRE",
      "bands": "L2-L6"
    },
    "SEC_ENG": {
      "name_vn": "Kỹ sư an ninh mạng / Kỹ sư bảo mật",
      "group": "Cyber Security",
      "bands": "L1-L7"
    },
    "SEC_PENTEST": {
      "name_vn": "Chuyên viên kiểm thử xâm nhập / Hacker mũ trắng",
      "group": "Cyber Security",
      "bands": "L3-L7"
    },
    "PROD_BA": {
      "name_vn": "Chuyên viên phân tích nghiệp vụ / BA",
      "group": "Product & Project Management",
      "bands": "L1-L7"
    },
    "PROD_PM": {
      "name_vn": "Quản lý sản phẩm / Product Manager",
      "group": "Product & Project Management",
      "bands": "L3-L9"
    },
    "INFRA_ERP": {
      "name_vn": "Chuyên viên tư vấn giải pháp ERP",
      "group": "IT Infrastructure & Enterprise Systems",
      "bands": "L3-L7"
    },
    "INFRA_HELPDESK": {
      "name_vn": "Nhân viên hỗ trợ kỹ thuật / IT Support",
      "group": "IT Infrastructure & Enterprise Systems",
      "bands": "L1-L4"
    },
    "INFRA_NETWORK": {
      "name_vn": "Kỹ sư hệ thống mạng",
      "group": "IT Infrastructure & Enterprise Systems",
      "bands": "L1-L7"
    }
  },
  "quiz": {
    "_meta": {
      "file": "shared/fit_quiz.json",
      "version": "0.1-draft",
      "status": "CHUA_VERIFY",
      "evidence_level": "C_INFERRED",
      "purpose": "Bộ câu hỏi cho bước 2 'Hiểu bản thân'. Đo người chơi trên 8 chiều fit_dimensions của dataset_22_roles_enriched_v3.json, rồi ghép với hồ sơ hợp nghề của từng nghề để gợi ý.",
      "method_note": "Đây là câu tự soạn, KHÔNG lấy từ bộ đo tâm lý đã chuẩn hoá nào (không phải RIASEC, không phải Big Five). Chưa kiểm định độ tin cậy. Dùng để gợi ý hướng khám phá, KHÔNG dùng làm kết luận về tính cách.",
      "scoring": "Mỗi vế cộng điểm cho 1-2 chiều. Cộng dồn thành vector 8 chiều, chuẩn hoá, rồi so cosine với hồ sơ nghề.",
      "usage": "Bỏ qua được. Người chơi bỏ qua thì vào thẳng màn chọn nghề, không bị thiệt gì.",
      "unknowns": [
        "Sáu câu là quá ít để đo tin cậy 8 chiều. Mỗi chiều chỉ được chạm 1-3 lần.",
        "Chiều REPETITION và VISIBLE khó hỏi trực tiếp mà không lộ đáp án mong muốn — người chơi dễ chọn vế nghe hay hơn thay vì vế đúng với mình.",
        "Chưa đối chiếu kết quả gợi ý với lựa chọn nghề thật của người chơi sau đó, nên chưa biết gợi ý có đúng không."
      ]
    },
    "dimensions": [
      "INTERRUPT",
      "DEEP_WORK",
      "AMBIGUITY",
      "DETAIL",
      "PEOPLE",
      "VISIBLE",
      "REPETITION",
      "PRESSURE"
    ],
    "questions": [
      {
        "question_id": "q1",
        "prompt": "Một buổi chiều làm việc lý tưởng với bạn là",
        "options": [
          {
            "option_id": "q1a",
            "text": "Bốn tiếng liền không ai làm phiền, làm xong đúng một thứ",
            "signal": {
              "DEEP_WORK": 2,
              "INTERRUPT": -1
            }
          },
          {
            "option_id": "q1b",
            "text": "Họp với ba nhóm khác nhau, gỡ được vài chỗ đang tắc",
            "signal": {
              "PEOPLE": 2,
              "INTERRUPT": 1
            }
          }
        ]
      },
      {
        "question_id": "q2",
        "prompt": "Bạn nhận một yêu cầu chỉ có đúng một câu, không rõ phải làm gì",
        "options": [
          {
            "option_id": "q2a",
            "text": "Thấy thú vị. Tự tìm hiểu rồi đề xuất cách làm",
            "signal": {
              "AMBIGUITY": 2
            }
          },
          {
            "option_id": "q2b",
            "text": "Thấy khó chịu. Muốn có đề bài rõ rồi mới bắt đầu",
            "signal": {
              "AMBIGUITY": -2,
              "DETAIL": 1
            }
          }
        ]
      },
      {
        "question_id": "q3",
        "prompt": "Điện thoại reo lúc 10 giờ tối, hệ thống đang có chuyện",
        "options": [
          {
            "option_id": "q3a",
            "text": "Mở máy xử lý luôn. Cảm giác gỡ được sự cố khá đã",
            "signal": {
              "PRESSURE": 2,
              "INTERRUPT": 2
            }
          },
          {
            "option_id": "q3b",
            "text": "Nếu hay xảy ra thì mình không trụ được lâu ở chỗ đó",
            "signal": {
              "PRESSURE": -2,
              "INTERRUPT": -2
            }
          }
        ]
      },
      {
        "question_id": "q4",
        "prompt": "Trong một bản báo cáo dài, bạn thường là người",
        "options": [
          {
            "option_id": "q4a",
            "text": "Phát hiện ra con số ở trang 7 không khớp với trang 2",
            "signal": {
              "DETAIL": 2,
              "DEEP_WORK": 1
            }
          },
          {
            "option_id": "q4b",
            "text": "Nhìn ra kết luận chung, chi tiết nhỏ để người khác soát",
            "signal": {
              "DETAIL": -1,
              "AMBIGUITY": 1
            }
          }
        ]
      },
      {
        "question_id": "q5",
        "prompt": "Sau một tuần làm việc, điều khiến bạn thấy đáng nhất là",
        "options": [
          {
            "option_id": "q5a",
            "text": "Có thứ chạy được để đưa người khác xem ngay",
            "signal": {
              "VISIBLE": 2
            }
          },
          {
            "option_id": "q5b",
            "text": "Một phần nền móng chưa ai thấy, nhưng mình biết nó chắc",
            "signal": {
              "VISIBLE": -1,
              "DEEP_WORK": 2
            }
          }
        ]
      },
      {
        "question_id": "q6",
        "prompt": "Một công việc phải lặp lại gần như y hệt mỗi tuần",
        "options": [
          {
            "option_id": "q6a",
            "text": "Không sao. Làm quen tay rồi thì nhanh và ít sai",
            "signal": {
              "REPETITION": 2,
              "DETAIL": 1
            }
          },
          {
            "option_id": "q6b",
            "text": "Chịu được vài tuần, sau đó phải tìm cách tự động hoá nó đi",
            "signal": {
              "REPETITION": -2,
              "AMBIGUITY": 1
            }
          }
        ]
      }
    ]
  },
  "roles": [
    {
      "role_code": "SWE_FRONTEND",
      "role_name": "Frontend Developer",
      "role_name_vn": "Lập trình viên Front-end",
      "role_group": "Software Engineering & Architecture",
      "experience": "Dựng giao diện, thấy kết quả ngay trên màn hình",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Chiếm 31,3% tổng nhu cầu tuyển dụng",
      "reasons_to_leave": [
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 31.5
        },
        {
          "label": "Few or no opportunities for promotion",
          "pct": 20.7
        },
        {
          "label": "Few or no opportunities for salary increases",
          "pct": 20.7
        },
        {
          "label": "Company ran out of financial resources",
          "pct": 17.4
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_UIUX",
          "role_name": "UI/UX Designer",
          "weight": 0.55,
          "why": "Cùng làm phần người dùng nhìn thấy: UI/UX thiết kế, Frontend hiện thực",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_MOBILE",
          "role_name": "Mobile Developer",
          "weight": 0.385,
          "why": "Cùng làm giao diện; React Native khiến hai nghề chồng lấn mạnh",
          "shared_skills_top": [
            "dart",
            "react native"
          ]
        },
        {
          "role_code": "SWE_BACKEND",
          "role_name": "Backend Developer",
          "weight": 0.284,
          "why": "Hai nửa của một ứng dụng web, thường làm việc cặp với nhau",
          "shared_skills_top": [
            "apl"
          ]
        }
      ],
      "progresses_to": [
        "SWE_ARCH_SOL",
        "SWE_TECHLEAD"
      ],
      "events": [
        {
          "event_id": "SWE_FRONTEND_01",
          "role_code": "SWE_FRONTEND",
          "scope": "role_specific",
          "title": "Designer gửi bản thiết kế không thể hiện thực được",
          "setup": "Bản Figma có hiệu ứng đổ bóng và animation mà trình duyệt không render mượt trên máy yếu.",
          "measures": [
            "PEOPLE",
            "VISIBLE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Ngồi cùng designer tìm phương án thay thế",
              "outcome": "Ra được bản đơn giản hơn mà vẫn đẹp. Designer học được giới hạn kỹ thuật.",
              "signal": {
                "PEOPLE": 2,
                "VISIBLE": 1
              }
            },
            {
              "text": "Cố làm đúng thiết kế bằng mọi giá",
              "outcome": "Đẹp đúng ý nhưng trang tải chậm 2 giây trên điện thoại tầm trung.",
              "signal": {
                "VISIBLE": 2,
                "DETAIL": -1
              }
            },
            {
              "text": "Làm đơn giản hơn mà không báo designer",
              "outcome": "Designer phát hiện lúc nghiệm thu và không hài lòng.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_FRONTEND_02",
          "role_code": "SWE_FRONTEND",
          "scope": "role_specific",
          "title": "Trang chạy chậm nhưng không rõ vì đâu",
          "setup": "Người dùng phàn nàn trang tải lâu. Bạn mở DevTools và thấy hàng trăm request.",
          "measures": [
            "DEEP_WORK",
            "DETAIL"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Đo từng phần, tìm ra ảnh chưa nén là thủ phạm",
              "outcome": "Giảm thời gian tải từ 6 giây xuống 1,8 giây. Chỉ số Core Web Vitals xanh hết.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2,
                "VISIBLE": 2
              }
            },
            {
              "text": "Thêm màn hình chờ cho đỡ cảm giác chậm",
              "outcome": "Người dùng bớt phàn nàn nhưng vấn đề gốc còn nguyên.",
              "signal": {
                "VISIBLE": 1,
                "DETAIL": -1
              }
            },
            {
              "text": "Báo backend rằng API chậm",
              "outcome": "Backend kiểm tra và chứng minh API chỉ mất 200ms. Bạn mất uy tín một chút.",
              "signal": {
                "PEOPLE": -1,
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_FRONTEND_03",
          "role_code": "SWE_FRONTEND",
          "scope": "role_specific",
          "title": "Cùng một nút bấm, mỗi trang một kiểu",
          "setup": "Codebase có 7 phiên bản nút 'Xác nhận' khác nhau do nhiều người viết ở nhiều thời điểm.",
          "measures": [
            "DETAIL",
            "DEEP_WORK"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Dựng design system chung, thay dần toàn bộ",
              "outcome": "Mất 2 tuần nhưng từ đó mọi trang đồng nhất và code giảm 30%.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Chỉ sửa những chỗ khách hàng phàn nàn",
              "outcome": "Nhanh, nhưng vấn đề quay lại sau 3 tháng.",
              "signal": {
                "DETAIL": -1
              }
            },
            {
              "text": "Viết tài liệu quy chuẩn cho người sau",
              "outcome": "Có tài liệu nhưng không ai đọc, code vẫn lệch.",
              "signal": {
                "DETAIL": 1,
                "PEOPLE": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_FRONTEND_04",
          "role_code": "SWE_FRONTEND",
          "scope": "role_specific",
          "title": "Khách hàng dùng trình duyệt cũ từ 2019",
          "setup": "5% người dùng vẫn dùng phiên bản trình duyệt không hỗ trợ tính năng bạn vừa viết.",
          "measures": [
            "DETAIL",
            "AMBIGUITY"
          ],
          "band_range": [
            "L3",
            "L4"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Viết thêm mã dự phòng cho trình duyệt cũ",
              "outcome": "Mất thêm 3 ngày, nhưng 5% người dùng đó chiếm 12% doanh thu.",
              "signal": {
                "DETAIL": 2
              }
            },
            {
              "text": "Hiện thông báo yêu cầu nâng cấp trình duyệt",
              "outcome": "Một nửa nâng cấp, một nửa bỏ đi.",
              "signal": {
                "AMBIGUITY": 1,
                "PEOPLE": -1
              }
            },
            {
              "text": "Bỏ qua vì chỉ 5%",
              "outcome": "Bộ phận kinh doanh phát hiện và phản ứng gay gắt.",
              "signal": {
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.571,
        "AMBIGUITY": 0.143,
        "DETAIL": 1,
        "PEOPLE": 0.286,
        "VISIBLE": 0.857,
        "REPETITION": 0,
        "PRESSURE": 0
      }
    },
    {
      "role_code": "SWE_BACKEND",
      "role_name": "Backend Developer",
      "role_name_vn": "Lập trình viên Back-end / Kỹ sư Back-end",
      "role_group": "Software Engineering & Architecture",
      "experience": "Viết logic nghiệp vụ và xử lý dữ liệu — phần người dùng không nhìn thấy",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Chiếm 54,2% tổng nhu cầu tuyển dụng — cao nhất thị trường",
      "reasons_to_leave": [
        {
          "label": "The salary is less than expected",
          "pct": 25.4
        },
        {
          "label": "Few or no opportunities for salary increases",
          "pct": 18.5
        },
        {
          "label": "The company and its product have no potential for growth",
          "pct": 16.8
        },
        {
          "label": "Limited career development opportunities",
          "pct": 15.9
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "DATA_DE",
          "role_name": "Data Engineer",
          "weight": 0.45,
          "why": "Data Engineer phần lớn đi lên từ Backend, chia sẻ kỹ năng hệ thống",
          "shared_skills_top": []
        },
        {
          "role_code": "CLOUD_DEVOPS",
          "role_name": "DevOps Engineer",
          "weight": 0.45,
          "why": "DevOps là hướng đi tự nhiên của Backend quan tâm vận hành",
          "shared_skills_top": []
        },
        {
          "role_code": "DATA_AI",
          "role_name": "AI Engineer",
          "weight": 0.35,
          "why": "Đưa mô hình vào sản phẩm cần kỹ năng backend",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_MOBILE",
          "role_name": "Mobile Developer",
          "weight": 0.3,
          "why": "Mobile cần backend; chia sẻ tư duy API và dữ liệu",
          "shared_skills_top": []
        }
      ],
      "progresses_to": [
        "SWE_ARCH_SOL",
        "SWE_TECHLEAD",
        "DATA_AI",
        "DATA_DE",
        "CLOUD_DEVOPS",
        "SEC_PENTEST",
        "PROD_PM"
      ],
      "events": [
        {
          "event_id": "SWE_BACKEND_01",
          "role_code": "SWE_BACKEND",
          "scope": "role_specific",
          "title": "Truy vấn chạy 30 giây trên dữ liệu thật",
          "setup": "Trên môi trường test với 1.000 bản ghi thì nhanh. Production có 8 triệu bản ghi.",
          "measures": [
            "DEEP_WORK",
            "DETAIL"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Phân tích kế hoạch truy vấn, thêm chỉ mục phù hợp",
              "outcome": "Xuống còn 200ms. Bạn hiểu sâu hơn về cơ sở dữ liệu.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Thêm bộ nhớ đệm để tránh truy vấn lại",
              "outcome": "Nhanh với dữ liệu cũ, nhưng người dùng thấy số liệu trễ 5 phút.",
              "signal": {
                "DETAIL": 1,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Tăng cấu hình máy chủ",
              "outcome": "Nhanh hơn được 2 tháng rồi lại chậm, và chi phí tăng gấp đôi.",
              "signal": {
                "DEEP_WORK": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_BACKEND_02",
          "role_code": "SWE_BACKEND",
          "scope": "role_specific",
          "title": "Hệ thống cũ không có tài liệu, người viết đã nghỉ",
          "setup": "Bạn phải sửa một module 4.000 dòng, không comment, không test, không ai hiểu.",
          "measures": [
            "AMBIGUITY",
            "DEEP_WORK"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Đọc kỹ, viết test bao quanh trước khi sửa",
              "outcome": "Mất 1 tuần nhưng sửa an toàn và để lại tài liệu cho người sau.",
              "signal": {
                "DEEP_WORK": 2,
                "AMBIGUITY": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Sửa đúng chỗ cần, không động vào phần khác",
              "outcome": "Xong nhanh. Nhưng gây lỗi phụ ở một luồng không ai ngờ tới.",
              "signal": {
                "AMBIGUITY": 1,
                "DETAIL": -1
              }
            },
            {
              "text": "Đề xuất viết lại toàn bộ module",
              "outcome": "Quản lý từ chối vì không có thời gian. Bạn vẫn phải sửa theo cách cũ.",
              "signal": {
                "PEOPLE": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_BACKEND_03",
          "role_code": "SWE_BACKEND",
          "scope": "role_specific",
          "title": "API của bạn làm sập ứng dụng mobile",
          "setup": "Bạn đổi tên một trường trong phản hồi. App mobile crash với 40.000 người dùng.",
          "measures": [
            "PRESSURE",
            "PEOPLE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Quay lui ngay, xin lỗi đội mobile, lập quy trình versioning",
              "outcome": "Khôi phục sau 15 phút. Từ đó có quy trình thông báo thay đổi API.",
              "signal": {
                "PRESSURE": 2,
                "PEOPLE": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Yêu cầu đội mobile phát hành bản vá gấp",
              "outcome": "Mất 6 tiếng chờ duyệt trên store. Quan hệ hai đội căng thẳng.",
              "signal": {
                "PEOPLE": -2
              }
            },
            {
              "text": "Giữ cả trường cũ và trường mới",
              "outcome": "Sửa nhanh, nhưng code tích tụ thêm một chỗ rác.",
              "signal": {
                "DETAIL": -1,
                "PRESSURE": 1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_BACKEND_04",
          "role_code": "SWE_BACKEND",
          "scope": "role_specific",
          "title": "PM muốn tính năng xong trong 3 ngày, bạn ước tính 2 tuần",
          "setup": "Áp lực từ khách hàng. PM hỏi có cách nào nhanh hơn không.",
          "measures": [
            "PEOPLE",
            "PRESSURE"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Chia nhỏ, đề xuất làm phần lõi trong 3 ngày, phần còn lại sau",
              "outcome": "PM đồng ý. Khách hàng có thứ để xem, bạn không phải làm ẩu.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Nhận làm trong 3 ngày, bỏ qua test",
              "outcome": "Kịp. Nhưng 2 tuần sau phải sửa lỗi mất nhiều thời gian hơn số đã tiết kiệm.",
              "signal": {
                "PRESSURE": 2,
                "DETAIL": -2
              }
            },
            {
              "text": "Giữ nguyên ước tính 2 tuần",
              "outcome": "PM phải giải thích với khách. Bạn làm đúng chất lượng nhưng bị xem là cứng nhắc.",
              "signal": {
                "DETAIL": 2,
                "PEOPLE": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.444,
        "AMBIGUITY": 0.556,
        "DETAIL": 1,
        "PEOPLE": 0.444,
        "VISIBLE": 0,
        "REPETITION": 0,
        "PRESSURE": 0.556
      }
    },
    {
      "role_code": "SWE_MOBILE",
      "role_name": "Mobile Developer",
      "role_name_vn": "Lập trình viên Mobile / Kỹ sư ứng dụng di động",
      "role_group": "Software Engineering & Architecture",
      "experience": "Làm app chạy trên chính chiếc điện thoại của mình",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Số cho Mobile Developer 1-2 năm kinh nghiệm",
      "reasons_to_leave": [
        {
          "label": "Salary is lower than expected",
          "pct": 23.1
        },
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 15.4
        },
        {
          "label": "Limited career development opportunities",
          "pct": 15.4
        },
        {
          "label": "Toxic or overly political work environment",
          "pct": 15.4
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_FRONTEND",
          "role_name": "Frontend Developer",
          "weight": 0.385,
          "why": "Cùng làm giao diện; React Native khiến hai nghề chồng lấn mạnh",
          "shared_skills_top": [
            "dart",
            "react native"
          ]
        },
        {
          "role_code": "SWE_BACKEND",
          "role_name": "Backend Developer",
          "weight": 0.3,
          "why": "Mobile cần backend; chia sẻ tư duy API và dữ liệu",
          "shared_skills_top": []
        }
      ],
      "progresses_to": [
        "SWE_TECHLEAD"
      ],
      "events": [
        {
          "event_id": "SWE_MOBILE_01",
          "role_code": "SWE_MOBILE",
          "scope": "role_specific",
          "title": "App bị Apple từ chối duyệt lần thứ ba",
          "setup": "Lý do mơ hồ: 'không tuân thủ hướng dẫn 4.3'. Bản cập nhật đã trễ 2 tuần.",
          "measures": [
            "AMBIGUITY",
            "PRESSURE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Đọc kỹ guideline, viết thư giải trình chi tiết",
              "outcome": "Được duyệt sau 3 ngày. Bạn hiểu quy trình duyệt sâu hơn hẳn.",
              "signal": {
                "AMBIGUITY": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Gỡ tính năng bị nghi ngờ rồi nộp lại",
              "outcome": "Duyệt được ngay nhưng mất một tính năng đã làm 3 tuần.",
              "signal": {
                "AMBIGUITY": 1,
                "PRESSURE": -1
              }
            },
            {
              "text": "Nộp lại y nguyên hy vọng gặp người duyệt khác",
              "outcome": "Bị từ chối lần thứ tư. Mất thêm 1 tuần.",
              "signal": {
                "AMBIGUITY": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_MOBILE_02",
          "role_code": "SWE_MOBILE",
          "scope": "role_specific",
          "title": "App chạy mượt trên máy bạn, giật trên máy người dùng",
          "setup": "Bạn dùng iPhone đời mới. 60% người dùng dùng Android tầm trung 3 năm tuổi.",
          "measures": [
            "DETAIL",
            "DEEP_WORK"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Mượn máy cũ test thật, tối ưu theo đó",
              "outcome": "Tìm ra vấn đề ở việc tải ảnh. Sửa xong app mượt trên cả máy yếu.",
              "signal": {
                "DETAIL": 2,
                "DEEP_WORK": 2
              }
            },
            {
              "text": "Dùng giả lập để test",
              "outcome": "Phát hiện được một phần, còn sót vấn đề về nhiệt độ máy.",
              "signal": {
                "DETAIL": 1
              }
            },
            {
              "text": "Ghi yêu cầu cấu hình tối thiểu trên store",
              "outcome": "Người dùng máy yếu đánh giá 1 sao.",
              "signal": {
                "DETAIL": -2,
                "PEOPLE": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_MOBILE_03",
          "role_code": "SWE_MOBILE",
          "scope": "role_specific",
          "title": "Người dùng đánh giá 1 sao vì lỗi bạn đã sửa",
          "setup": "Bản vá đã phát hành nhưng nhiều người chưa cập nhật, vẫn đánh giá xấu.",
          "measures": [
            "PEOPLE",
            "VISIBLE"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Trả lời từng đánh giá, hướng dẫn cập nhật",
              "outcome": "Nhiều người sửa lại đánh giá. Điểm app tăng từ 3,2 lên 4,1.",
              "signal": {
                "PEOPLE": 2,
                "VISIBLE": 2
              }
            },
            {
              "text": "Thêm cơ chế buộc cập nhật trong app",
              "outcome": "Hiệu quả nhưng một số người thấy khó chịu vì bị ép.",
              "signal": {
                "VISIBLE": 1,
                "PEOPLE": -1
              }
            },
            {
              "text": "Chờ tự nhiên người dùng cập nhật",
              "outcome": "Mất 2 tháng điểm mới hồi phục.",
              "signal": {
                "VISIBLE": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_MOBILE_04",
          "role_code": "SWE_MOBILE",
          "scope": "role_specific",
          "title": "Phải hỗ trợ cả iOS và Android với một mình bạn",
          "setup": "Đội chỉ có bạn làm mobile. Hai nền tảng, hai bộ lỗi khác nhau.",
          "measures": [
            "PRESSURE",
            "DEEP_WORK"
          ],
          "band_range": [
            "L3",
            "L4"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Đề xuất chuyển sang React Native để dùng chung code",
              "outcome": "Mất 1 tháng chuyển đổi nhưng sau đó nhanh gấp đôi.",
              "signal": {
                "DEEP_WORK": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Làm lần lượt, iOS trước Android sau",
              "outcome": "Mọi tính năng lên Android trễ 2 tuần. Người dùng Android phàn nàn.",
              "signal": {
                "PRESSURE": 1,
                "PEOPLE": -1
              }
            },
            {
              "text": "Đề nghị tuyển thêm người",
              "outcome": "Được duyệt sau 3 tháng. Trong lúc đó bạn vẫn phải gánh cả hai.",
              "signal": {
                "PEOPLE": 1,
                "PRESSURE": 2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.8,
        "AMBIGUITY": 1,
        "DETAIL": 1,
        "PEOPLE": 0.6,
        "VISIBLE": 0.6,
        "REPETITION": 0,
        "PRESSURE": 0.6
      }
    },
    {
      "role_code": "SWE_GAME",
      "role_name": "Game Developer",
      "role_name_vn": "Lập trình viên Game",
      "role_group": "Software Engineering & Architecture",
      "experience": "Làm game: đồ hoạ, gameplay, cảm giác chơi",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Chưa có số riêng trong báo cáo",
      "reasons_to_leave": [
        {
          "label": "Have better job opportunities",
          "pct": 36.4
        },
        {
          "label": "organizational structure",
          "pct": 27.3
        },
        {
          "label": "Family commitments and inability to balance work and personal life",
          "pct": 18.2
        },
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 18.2
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_UIUX",
          "role_name": "UI/UX Designer",
          "weight": 0.3,
          "why": "Cùng quan tâm trải nghiệm và cảm giác người dùng",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_EMBEDDED",
          "role_name": "Embedded Engineer",
          "weight": 0.248,
          "why": "Cùng phải tối ưu hiệu năng sát phần cứng",
          "shared_skills_top": [
            "pandas"
          ]
        }
      ],
      "progresses_to": [],
      "events": [
        {
          "event_id": "SWE_GAME_01",
          "role_code": "SWE_GAME",
          "scope": "role_specific",
          "title": "Game vui khi bạn chơi, người mới không hiểu gì",
          "setup": "Buổi playtest đầu tiên: 8/10 người thử không qua nổi màn 1 và bỏ cuộc.",
          "measures": [
            "AMBIGUITY",
            "VISIBLE",
            "PEOPLE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Xem lại toàn bộ video playtest, thiết kế lại phần hướng dẫn",
              "outcome": "Tỷ lệ qua màn 1 tăng lên 90%. Bạn học được rằng mình không phải người chơi.",
              "signal": {
                "AMBIGUITY": 2,
                "PEOPLE": 2
              }
            },
            {
              "text": "Thêm bảng hướng dẫn chữ ở đầu game",
              "outcome": "Tỷ lệ tăng lên 60%. Nhiều người vẫn bỏ qua không đọc.",
              "signal": {
                "VISIBLE": 1
              }
            },
            {
              "text": "Giảm độ khó màn 1 xuống thật thấp",
              "outcome": "Qua được hết, nhưng người chơi thấy nhàm và bỏ ở màn 3.",
              "signal": {
                "AMBIGUITY": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_GAME_02",
          "role_code": "SWE_GAME",
          "scope": "role_specific",
          "title": "Sếp muốn thêm cơ chế nạp tiền vào game",
          "setup": "Bạn thấy nó sẽ phá vỡ cân bằng gameplay mình đã tinh chỉnh 3 tháng.",
          "measures": [
            "PEOPLE",
            "AMBIGUITY"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Đề xuất mô hình chỉ bán vật phẩm trang trí",
              "outcome": "Sếp chấp nhận. Doanh thu thấp hơn kỳ vọng nhưng người chơi ở lại lâu.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Làm theo yêu cầu",
              "outcome": "Doanh thu tháng đầu tốt. Sau 3 tháng người chơi rời đi vì thấy bất công.",
              "signal": {
                "PEOPLE": -1
              }
            },
            {
              "text": "Phản đối gay gắt trong họp",
              "outcome": "Bạn giữ được nguyên tắc nhưng bị xem là khó hợp tác.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_GAME_03",
          "role_code": "SWE_GAME",
          "scope": "role_specific",
          "title": "Hiệu ứng đẹp nhưng làm game tụt xuống 20 khung hình/giây",
          "setup": "Bạn vừa làm xong hệ thống hạt lửa rất đẹp. Máy tầm trung không chịu nổi.",
          "measures": [
            "DETAIL",
            "VISIBLE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Tối ưu bằng cách gộp hiệu ứng, giảm số hạt",
              "outcome": "Giữ được 80% độ đẹp, chạy 60 khung hình. Mất 2 ngày.",
              "signal": {
                "DETAIL": 2,
                "DEEP_WORK": 2
              }
            },
            {
              "text": "Thêm tuỳ chọn chất lượng đồ hoạ cho người chơi tự chọn",
              "outcome": "Giải quyết được, nhưng phải làm và test 3 phiên bản.",
              "signal": {
                "DETAIL": 1,
                "VISIBLE": 1
              }
            },
            {
              "text": "Giữ nguyên, coi đây là game cho máy cấu hình cao",
              "outcome": "Mất khoảng 40% thị trường người chơi Việt Nam.",
              "signal": {
                "VISIBLE": 2,
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_GAME_04",
          "role_code": "SWE_GAME",
          "scope": "role_specific",
          "title": "Crunch trước ngày phát hành",
          "setup": "Còn 2 tuần đến ngày ra mắt đã công bố. Còn 40 lỗi chưa sửa, đội bắt đầu làm đến 10 giờ tối.",
          "measures": [
            "PRESSURE"
          ],
          "band_range": [
            "L3",
            "L4",
            "L5"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Đề xuất hoãn ra mắt 1 tháng",
              "outcome": "Bị phản đối vì đã quảng bá. Nhưng cuối cùng được chấp nhận và game ra mắt tốt.",
              "signal": {
                "PRESSURE": -1,
                "PEOPLE": 2
              }
            },
            {
              "text": "Cùng đội làm thêm giờ 2 tuần",
              "outcome": "Kịp ra mắt. Ba người trong đội nghỉ việc trong tháng sau đó.",
              "signal": {
                "PRESSURE": 2,
                "PEOPLE": -1
              }
            },
            {
              "text": "Ưu tiên sửa 15 lỗi nghiêm trọng, phát hành với 25 lỗi nhỏ",
              "outcome": "Ra mắt đúng hạn, đánh giá 3,8 sao. Sửa nốt trong bản vá tuần sau.",
              "signal": {
                "PRESSURE": 1,
                "AMBIGUITY": 2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.333,
        "AMBIGUITY": 1,
        "DETAIL": 0.5,
        "PEOPLE": 1,
        "VISIBLE": 0.667,
        "REPETITION": 0,
        "PRESSURE": 0.5
      }
    },
    {
      "role_code": "SWE_UIUX",
      "role_name": "UI/UX Designer",
      "role_name_vn": "Chuyên viên thiết kế UI/UX",
      "role_group": "Software Engineering & Architecture",
      "experience": "Sáng tạo thị giác và trải nghiệm — KHÔNG cần code",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "15,5 triệu (mới ra trường) đến 53 triệu (cấp quản lý). Chiếm 14,1% kế hoạch tuyển 2026",
      "reasons_to_leave": [],
      "work_life_evidence": "C_INFERRED",
      "similar_ranked": [
        {
          "role_code": "SWE_FRONTEND",
          "role_name": "Frontend Developer",
          "weight": 0.55,
          "why": "Cùng làm phần người dùng nhìn thấy: UI/UX thiết kế, Frontend hiện thực",
          "shared_skills_top": []
        },
        {
          "role_code": "PROD_PM",
          "role_name": "Product Manager",
          "weight": 0.35,
          "why": "Cùng tập trung vào trải nghiệm và nhu cầu người dùng",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_GAME",
          "role_name": "Game Developer",
          "weight": 0.3,
          "why": "Cùng quan tâm trải nghiệm và cảm giác người dùng",
          "shared_skills_top": []
        }
      ],
      "progresses_to": [
        "PROD_PM"
      ],
      "events": [
        {
          "event_id": "SWE_UIUX_01",
          "role_code": "SWE_UIUX",
          "scope": "role_specific",
          "title": "Sếp bảo 'làm cho nó đẹp hơn' mà không nói rõ là gì",
          "setup": "Bạn đã sửa 4 lần, lần nào sếp cũng nói 'chưa đúng ý' nhưng không mô tả được ý là gì.",
          "measures": [
            "AMBIGUITY",
            "PEOPLE"
          ],
          "band_range": [
            "L2",
            "L3",
            "L4"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Đưa 3 phương án khác hẳn nhau để sếp chọn hướng",
              "outcome": "Sếp chỉ ngay được phương án 2. Từ đó bạn luôn làm cách này.",
              "signal": {
                "AMBIGUITY": 2,
                "PEOPLE": 2
              }
            },
            {
              "text": "Hỏi sếp xem có sản phẩm nào sếp thấy đẹp không",
              "outcome": "Sếp đưa 2 ví dụ. Bạn hiểu được gu và làm đúng ngay lần sau.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Sửa tiếp theo cảm nhận của mình",
              "outcome": "Lần thứ 7 mới được duyệt. Mất 2 tuần cho một màn hình.",
              "signal": {
                "AMBIGUITY": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_UIUX_02",
          "role_code": "SWE_UIUX",
          "scope": "role_specific",
          "title": "Kết quả nghiên cứu người dùng trái với ý sếp",
          "setup": "Bạn phỏng vấn 12 người dùng, tất cả đều thấy tính năng sếp muốn là không cần thiết.",
          "measures": [
            "PEOPLE",
            "DETAIL"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Trình bày dữ liệu phỏng vấn có trích dẫn cụ thể",
              "outcome": "Sếp đổi ý sau khi nghe băng ghi âm người dùng. Tính năng được thiết kế lại.",
              "signal": {
                "PEOPLE": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Thiết kế cả hai, đề xuất thử nghiệm A/B",
              "outcome": "Mất gấp đôi công sức nhưng có dữ liệu thuyết phục sau 1 tháng.",
              "signal": {
                "DETAIL": 2,
                "PEOPLE": 1
              }
            },
            {
              "text": "Làm theo ý sếp",
              "outcome": "Tính năng ra mắt, tỷ lệ sử dụng 3%. Không ai nhắc lại chuyện này.",
              "signal": {
                "PEOPLE": -1,
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_UIUX_03",
          "role_code": "SWE_UIUX",
          "scope": "role_specific",
          "title": "Dev nói thiết kế của bạn mất 3 tuần để làm",
          "setup": "Bạn nghĩ nó đơn giản. Dev giải thích phần animation cần viết lại toàn bộ hệ thống hiển thị.",
          "measures": [
            "PEOPLE",
            "AMBIGUITY"
          ],
          "band_range": [
            "L3",
            "L4"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Ngồi cùng dev tìm phiên bản làm được trong 1 tuần",
              "outcome": "Ra được bản gọn hơn, giữ 85% ý tưởng. Dev đánh giá cao bạn.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Học thêm về giới hạn kỹ thuật để thiết kế thực tế hơn",
              "outcome": "Mất thời gian đầu tư nhưng các thiết kế sau đều khả thi.",
              "signal": {
                "DEEP_WORK": 2,
                "PEOPLE": 1
              }
            },
            {
              "text": "Giữ nguyên thiết kế, để dev tự lo",
              "outcome": "Dev làm một bản đơn giản hoá và bạn không hài lòng với kết quả.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_UIUX_04",
          "role_code": "SWE_UIUX",
          "scope": "role_specific",
          "title": "Không ai đo được thiết kế của bạn có tốt hơn không",
          "setup": "Bạn thiết kế lại luồng đăng ký, nhưng công ty không có công cụ đo tỷ lệ hoàn thành.",
          "measures": [
            "AMBIGUITY",
            "VISIBLE"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Đề xuất gắn công cụ đo, chờ 2 tuần lấy dữ liệu",
              "outcome": "Chứng minh được tỷ lệ hoàn thành tăng từ 42% lên 68%. Công việc của bạn có bằng chứng.",
              "signal": {
                "DETAIL": 2,
                "VISIBLE": 2
              }
            },
            {
              "text": "Làm khảo sát nhỏ với 20 người dùng",
              "outcome": "Có dữ liệu định tính, đủ thuyết phục nhưng không mạnh bằng số.",
              "signal": {
                "PEOPLE": 1,
                "DETAIL": 1
              }
            },
            {
              "text": "Tin vào chuyên môn của mình",
              "outcome": "Không ai phản đối, nhưng khi cắt giảm ngân sách thì mảng thiết kế bị cắt đầu tiên.",
              "signal": {
                "VISIBLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.182,
        "AMBIGUITY": 0.364,
        "DETAIL": 0.636,
        "PEOPLE": 1,
        "VISIBLE": 0.182,
        "REPETITION": 0,
        "PRESSURE": 0
      }
    },
    {
      "role_code": "SWE_EMBEDDED",
      "role_name": "Embedded Engineer",
      "role_name_vn": "Kỹ sư phần mềm nhúng / Kỹ sư IoT",
      "role_group": "Software Engineering & Architecture",
      "experience": "Lập trình điều khiển thiết bị phần cứng thật",
      "archetype": "A",
      "bands": "L1-L7",
      "band_start": "L1",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L1",
          "label": "Thực tập sinh",
          "salary_avg": 6900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L2",
          "label": "Mới ra trường / dưới 1 năm",
          "salary_avg": 14700000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L3",
          "label": "Junior 1-3 năm",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L4",
          "label": "Junior cao / chuyển tiếp Senior",
          "salary_avg": 19800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L5",
          "label": "Senior 3-5 năm",
          "salary_avg": 31200000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Từ 21,4 triệu (dưới 1 năm) lên 60,65 triệu (chuyên viên). Lộ trình tăng lương rõ ràng nhất",
      "reasons_to_leave": [],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "INFRA_NETWORK",
          "role_name": "Network Engineer",
          "weight": 0.25,
          "why": "Cùng làm việc với thiết bị phần cứng thật",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_GAME",
          "role_name": "Game Developer",
          "weight": 0.248,
          "why": "Cùng phải tối ưu hiệu năng sát phần cứng",
          "shared_skills_top": [
            "pandas"
          ]
        }
      ],
      "progresses_to": [],
      "events": [
        {
          "event_id": "SWE_EMBEDDED_01",
          "role_code": "SWE_EMBEDDED",
          "scope": "role_specific",
          "title": "Lỗi chỉ xuất hiện sau 6 tiếng chạy liên tục",
          "setup": "Thiết bị chạy ổn trong test 1 tiếng. Khách hàng báo treo sau nửa ngày.",
          "measures": [
            "DEEP_WORK",
            "DETAIL",
            "PRESSURE"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Chạy test dài, ghi log bộ nhớ từng phút",
              "outcome": "Sau 3 ngày tìm ra rò rỉ bộ nhớ 4 byte mỗi vòng lặp. Sửa 1 dòng.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Thêm cơ chế tự khởi động lại mỗi 4 tiếng",
              "outcome": "Che được triệu chứng. Khách hàng chấp nhận nhưng đây không phải giải pháp.",
              "signal": {
                "DETAIL": -1,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Đổ lỗi cho phần cứng",
              "outcome": "Bộ phận phần cứng kiểm tra 2 tuần rồi chứng minh không phải lỗi của họ.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_EMBEDDED_02",
          "role_code": "SWE_EMBEDDED",
          "scope": "role_specific",
          "title": "Chỉ còn 2KB bộ nhớ, cần thêm một tính năng",
          "setup": "Vi điều khiển đã dùng 62/64KB. Khách hàng muốn thêm chức năng ghi nhật ký.",
          "measures": [
            "DEEP_WORK",
            "DETAIL"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Tối ưu code cũ để lấy thêm 8KB",
              "outcome": "Mất 1 tuần đọc lại toàn bộ, nhưng giải phóng đủ chỗ và code sạch hơn.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Đề xuất đổi sang chip có bộ nhớ lớn hơn",
              "outcome": "Giải quyết triệt để nhưng đội phần cứng phải làm lại mạch, chi phí tăng.",
              "signal": {
                "PEOPLE": 1,
                "AMBIGUITY": 1
              }
            },
            {
              "text": "Làm phiên bản rút gọn của tính năng",
              "outcome": "Vừa đủ chỗ. Khách hàng chấp nhận nhưng không hài lòng lắm.",
              "signal": {
                "AMBIGUITY": 1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_EMBEDDED_03",
          "role_code": "SWE_EMBEDDED",
          "scope": "role_specific",
          "title": "Phải nạp lại firmware cho 200 thiết bị đã bán",
          "setup": "Phát hiện lỗi sau khi hàng đã ra thị trường. Thiết bị không hỗ trợ cập nhật từ xa.",
          "measures": [
            "PRESSURE",
            "REPETITION"
          ],
          "band_range": [
            "L4",
            "L5"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Tổ chức thu hồi, nạp lại từng máy",
              "outcome": "Mất 3 tuần và nhiều công sức, nhưng khách hàng đánh giá cao sự trách nhiệm.",
              "signal": {
                "REPETITION": 2,
                "PRESSURE": 2
              }
            },
            {
              "text": "Chỉ nạp lại cho khách hàng gặp lỗi khi họ báo",
              "outcome": "Rẻ hơn nhiều nhưng danh tiếng bị ảnh hưởng dần.",
              "signal": {
                "PRESSURE": -1
              }
            },
            {
              "text": "Đề xuất bổ sung cập nhật từ xa cho phiên bản sau",
              "outcome": "Giải quyết cho tương lai, nhưng 200 máy hiện tại vẫn phải xử lý tay.",
              "signal": {
                "DEEP_WORK": 1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_EMBEDDED_04",
          "role_code": "SWE_EMBEDDED",
          "scope": "role_specific",
          "title": "Không có công cụ gỡ lỗi, chỉ có một đèn LED",
          "setup": "Chip đang dùng không hỗ trợ debug. Cách duy nhất biết chương trình chạy tới đâu là nháy đèn.",
          "measures": [
            "DEEP_WORK",
            "AMBIGUITY"
          ],
          "band_range": [
            "L3",
            "L4"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Tự viết giao thức nháy đèn theo mã lỗi",
              "outcome": "Mất 1 ngày nhưng từ đó gỡ lỗi nhanh hơn nhiều. Đồng nghiệp cũng dùng theo.",
              "signal": {
                "DEEP_WORK": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Dùng cổng nối tiếp in log ra máy tính",
              "outcome": "Hiệu quả hơn đèn LED, nhưng chiếm mất 2 chân của vi điều khiển.",
              "signal": {
                "DEEP_WORK": 1,
                "DETAIL": 1
              }
            },
            {
              "text": "Suy luận bằng cách đọc code",
              "outcome": "Đôi khi đoán đúng, đôi khi mất cả ngày cho một lỗi đơn giản.",
              "signal": {
                "DEEP_WORK": 2,
                "AMBIGUITY": -1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 1,
        "AMBIGUITY": 0.5,
        "DETAIL": 0.5,
        "PEOPLE": 0.1,
        "VISIBLE": 0,
        "REPETITION": 0.2,
        "PRESSURE": 0.2
      }
    },
    {
      "role_code": "SWE_ARCH_SOL",
      "role_name": "Solution Architect",
      "role_name_vn": "Kiến trúc sư giải pháp",
      "role_group": "Software Engineering & Architecture",
      "experience": "Thiết kế kiến trúc tổng thể cho cả hệ thống, chọn công nghệ và cân đối đánh đổi",
      "archetype": "D",
      "bands": "L6-L8",
      "band_start": "L6",
      "band_end": "L8",
      "salary_by_band": [
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L8",
          "label": "Trên 8 năm / Senior Manager",
          "salary_avg": 52400000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Trên 5 năm kinh nghiệm. Top 5 vị trí khó tuyển dụng",
      "reasons_to_leave": [
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 24.5
        },
        {
          "label": "Limited career development opportunities",
          "pct": 19.4
        },
        {
          "label": "The company and its product have no potential for growth",
          "pct": 17.3
        },
        {
          "label": "Uncaring or uninspiring leadership",
          "pct": 15.3
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_TECHLEAD",
          "role_name": "Tech Lead",
          "weight": 0.438,
          "why": "Cùng nhánh IC cấp cao, khác phạm vi: một đội và một hệ thống",
          "shared_skills_top": [
            "spring",
            "next.js"
          ]
        },
        {
          "role_code": "CLOUD_ENG",
          "role_name": "Cloud Engineer",
          "weight": 0.35,
          "why": "Kiến trúc hệ thống hiện đại gắn chặt với hạ tầng đám mây",
          "shared_skills_top": []
        },
        {
          "role_code": "DATA_AI",
          "role_name": "AI Engineer",
          "weight": 0.35,
          "why": "Đưa AI vào production đòi hỏi tư duy kiến trúc",
          "shared_skills_top": []
        }
      ],
      "progresses_to": [
        "SWE_EM"
      ],
      "events": [
        {
          "event_id": "SWE_ARCH_SOL_01",
          "role_code": "SWE_ARCH_SOL",
          "scope": "role_specific",
          "title": "Chọn giữa giải pháp mua sẵn và tự phát triển",
          "setup": "Mua thì nhanh 3 tháng nhưng phụ thuộc nhà cung cấp. Tự làm mất 9 tháng nhưng chủ động.",
          "measures": [
            "AMBIGUITY",
            "DETAIL"
          ],
          "band_range": [
            "L6",
            "L7",
            "L8"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Tính tổng chi phí sở hữu 5 năm cho cả hai, kèm rủi ro",
              "outcome": "Chọn được phương án có căn cứ rõ ràng và bảo vệ được trước ban lãnh đạo.",
              "signal": {
                "DETAIL": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Đề xuất mua trước để ra thị trường sớm, tự làm sau",
              "outcome": "Cân bằng được tốc độ và chủ động. Nhưng phải làm việc gấp đôi.",
              "signal": {
                "AMBIGUITY": 2,
                "PRESSURE": 1
              }
            },
            {
              "text": "Chọn tự làm vì đội muốn thử công nghệ mới",
              "outcome": "Dự án trễ 6 tháng. Bài học đắt về việc để sở thích kỹ thuật dẫn dắt quyết định.",
              "signal": {
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "A_VERIFIED",
          "source_note": "JD Solution Architect của NAB: 'dẫn dắt phân tích phương án kiến trúc, cân bằng tốc độ ra giá trị, chi phí, bảo mật và độ khớp trạng thái mục tiêu'."
        },
        {
          "event_id": "SWE_ARCH_SOL_02",
          "role_code": "SWE_ARCH_SOL",
          "scope": "role_specific",
          "title": "Kiến trúc bạn thiết kế bị đội phát triển phàn nàn là quá phức tạp",
          "setup": "Bạn thiết kế cho quy mô 5 năm tới. Đội nói hiện tại chỉ cần 1/10 mức đó.",
          "measures": [
            "PEOPLE",
            "AMBIGUITY"
          ],
          "band_range": [
            "L6",
            "L7"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Đơn giản hoá phần lõi, giữ khả năng mở rộng ở điểm nối",
              "outcome": "Đội làm nhanh hơn mà vẫn không bị khoá đường. Cả hai bên hài lòng.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Giải thích tầm nhìn dài hạn và giữ nguyên thiết kế",
              "outcome": "Đội làm theo nhưng chậm hơn 40%. Ba năm sau mới thấy giá trị.",
              "signal": {
                "DETAIL": 2,
                "PEOPLE": -1
              }
            },
            {
              "text": "Bỏ hẳn phần mở rộng, làm đơn giản nhất",
              "outcome": "Nhanh. Nhưng 18 tháng sau phải viết lại toàn bộ.",
              "signal": {
                "AMBIGUITY": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_ARCH_SOL_03",
          "role_code": "SWE_ARCH_SOL",
          "scope": "role_specific",
          "title": "Phải trình bày kiến trúc cho ban lãnh đạo không có nền kỹ thuật",
          "setup": "Bạn có 15 phút để giải thích vì sao cần đầu tư 4 tỷ vào hạ tầng.",
          "measures": [
            "PEOPLE",
            "AMBIGUITY"
          ],
          "band_range": [
            "L7",
            "L8"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Trình bày bằng rủi ro kinh doanh và chi phí nếu không làm",
              "outcome": "Được duyệt ngay. Bạn học được ngôn ngữ của ban lãnh đạo.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Vẽ sơ đồ đơn giản kèm ví dụ tương tự dễ hiểu",
              "outcome": "Được duyệt một phần. Cần thêm một buổi nữa để duyệt hết.",
              "signal": {
                "PEOPLE": 1,
                "VISIBLE": 1
              }
            },
            {
              "text": "Trình bày chi tiết kỹ thuật đầy đủ",
              "outcome": "Ban lãnh đạo không theo kịp và hoãn quyết định 2 tháng.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_ARCH_SOL_04",
          "role_code": "SWE_ARCH_SOL",
          "scope": "role_specific",
          "title": "Ba hệ thống của ba đội không nói chuyện được với nhau",
          "setup": "Mỗi đội tự chọn công nghệ. Giờ cần tích hợp mà định dạng dữ liệu khác nhau hoàn toàn.",
          "measures": [
            "AMBIGUITY",
            "PEOPLE",
            "DEEP_WORK"
          ],
          "band_range": [
            "L6",
            "L7",
            "L8"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Thiết kế lớp trung gian chuẩn hoá, đặt quy tắc cho tương lai",
              "outcome": "Tích hợp được sau 2 tháng. Và không tái diễn nhờ có quy chuẩn.",
              "signal": {
                "DEEP_WORK": 2,
                "DETAIL": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Buộc hai đội đổi theo chuẩn của đội thứ ba",
              "outcome": "Nhanh hơn nhưng hai đội phải làm lại nhiều và không hài lòng.",
              "signal": {
                "PEOPLE": -1,
                "PRESSURE": 1
              }
            },
            {
              "text": "Viết mã chuyển đổi riêng cho từng cặp hệ thống",
              "outcome": "Chạy được. Nhưng có 6 điểm chuyển đổi cần bảo trì, và sẽ thành 12 khi có đội thứ tư.",
              "signal": {
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.2,
        "AMBIGUITY": 1,
        "DETAIL": 0.8,
        "PEOPLE": 0.5,
        "VISIBLE": 0.1,
        "REPETITION": 0,
        "PRESSURE": 0.2
      }
    },
    {
      "role_code": "SWE_TECHLEAD",
      "role_name": "Tech Lead",
      "role_name_vn": "Trưởng nhóm kỹ thuật",
      "role_group": "Software Engineering & Architecture",
      "experience": "Dẫn dắt kỹ thuật một đội, vẫn code nhưng quyết định hướng đi",
      "archetype": "C",
      "bands": "L6-L7",
      "band_start": "L6",
      "band_end": "L7",
      "salary_by_band": [
        {
          "band": "L6",
          "label": "Senior 5-8 năm / Lead",
          "salary_avg": 41900000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Số công bố trực tiếp cho Tech Lead",
      "reasons_to_leave": [
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 25.3
        },
        {
          "label": "The company and its product have no potential for growth",
          "pct": 20
        },
        {
          "label": "The work is no longer challenging",
          "pct": 17.3
        },
        {
          "label": "Toxic or overly political work environment",
          "pct": 17.3
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_EM",
          "role_name": "Engineering Manager",
          "weight": 0.5,
          "why": "Điểm rẽ nhánh IC/Management — cùng xuất phát, khác hướng",
          "shared_skills_top": []
        },
        {
          "role_code": "SWE_ARCH_SOL",
          "role_name": "Solution Architect",
          "weight": 0.438,
          "why": "Cùng nhánh IC cấp cao, khác phạm vi: một đội và một hệ thống",
          "shared_skills_top": [
            "spring",
            "next.js"
          ]
        }
      ],
      "progresses_to": [
        "SWE_ARCH_SOL",
        "SWE_EM"
      ],
      "events": [
        {
          "event_id": "SWE_TECHLEAD_01",
          "role_code": "SWE_TECHLEAD",
          "scope": "role_specific",
          "title": "Hai thành viên trong đội bất đồng gay gắt về kiến trúc",
          "setup": "Cuộc họp căng thẳng. Cả hai đều có lý và không ai nhường.",
          "measures": [
            "PEOPLE",
            "AMBIGUITY"
          ],
          "band_range": [
            "L6",
            "L7"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Yêu cầu mỗi bên làm bản mẫu nhỏ trong 2 ngày rồi so sánh",
              "outcome": "Có dữ liệu thật để quyết. Cả hai chấp nhận kết quả.",
              "signal": {
                "PEOPLE": 2,
                "DETAIL": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Quyết định theo hướng bạn thấy đúng, giải thích rõ lý do",
              "outcome": "Đội tiếp tục được. Người thua hơi ấm ức nhưng tôn trọng quyết định.",
              "signal": {
                "PEOPLE": 1,
                "PRESSURE": 1
              }
            },
            {
              "text": "Để hai người tự thống nhất",
              "outcome": "Bốn ngày trôi qua, chưa ai nhường, sprint bị trễ.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_TECHLEAD_02",
          "role_code": "SWE_TECHLEAD",
          "scope": "role_specific",
          "title": "Bạn không còn thời gian để code",
          "setup": "Lịch họp kín tuần. Task kỹ thuật của bạn không ai làm.",
          "measures": [
            "PEOPLE",
            "DEEP_WORK"
          ],
          "band_range": [
            "L6",
            "L7"
          ],
          "frequency": "weekly",
          "choices": [
            {
              "text": "Giao task đó cho thành viên, dành thời gian review kỹ",
              "outcome": "Đội học được, bạn tập trung dẫn dắt. Đây là chuyển đổi vai trò cần thiết.",
              "signal": {
                "PEOPLE": 2,
                "DEEP_WORK": -1
              }
            },
            {
              "text": "Chặn 2 buổi sáng mỗi tuần không họp để code",
              "outcome": "Giữ được cảm giác kỹ thuật. Nhưng vài cuộc họp phải dời.",
              "signal": {
                "DEEP_WORK": 2,
                "PRESSURE": 1
              }
            },
            {
              "text": "Code buổi tối sau giờ làm",
              "outcome": "Task xong. Nhưng bạn làm 55 giờ/tuần và bắt đầu kiệt sức.",
              "signal": {
                "DEEP_WORK": 2,
                "PRESSURE": 2
              }
            }
          ],
          "evidence_level": "A_VERIFIED",
          "source_note": "Golden role SWE_FRONTEND: band L6 (Lead) vẫn tự quyết kiến trúc cấp component và viết code — chưa phải quản lý thuần."
        },
        {
          "event_id": "SWE_TECHLEAD_03",
          "role_code": "SWE_TECHLEAD",
          "scope": "role_specific",
          "title": "Thành viên giỏi nhất đội xin nghỉ",
          "setup": "Bạn ấy nhận offer lương cao hơn 40%. Đội đang giữa dự án quan trọng.",
          "measures": [
            "PEOPLE",
            "PRESSURE"
          ],
          "band_range": [
            "L6",
            "L7"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Nói chuyện thẳng thắn tìm hiểu lý do thật",
              "outcome": "Phát hiện lý do là thiếu cơ hội phát triển, không phải lương. Giữ được bằng lộ trình mới.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Đề xuất công ty tăng lương giữ chân",
              "outcome": "Giữ được 6 tháng. Nhưng các thành viên khác biết và cũng đòi tăng.",
              "signal": {
                "PEOPLE": 1,
                "PRESSURE": 1
              }
            },
            {
              "text": "Chấp nhận, lập kế hoạch bàn giao kiến thức gấp",
              "outcome": "Mất người giỏi nhưng đội không bị hổng kiến thức.",
              "signal": {
                "DETAIL": 2,
                "PRESSURE": 1
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_TECHLEAD_04",
          "role_code": "SWE_TECHLEAD",
          "scope": "role_specific",
          "title": "Kiến trúc bạn chọn năm ngoái giờ đang cản trở đội",
          "setup": "Quyết định hồi đó hợp lý với quy mô cũ. Giờ hệ thống lớn gấp 5 lần và kiến trúc đó thành gánh nặng.",
          "measures": [
            "AMBIGUITY",
            "PEOPLE"
          ],
          "band_range": [
            "L6",
            "L7"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Thừa nhận công khai và dẫn dắt kế hoạch chuyển đổi dần",
              "outcome": "Đội tôn trọng sự trung thực. Chuyển đổi mất 4 tháng nhưng suôn sẻ.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2,
                "DETAIL": 2
              }
            },
            {
              "text": "Đề xuất viết lại toàn bộ",
              "outcome": "Quản lý từ chối vì rủi ro và chi phí. Vấn đề vẫn còn.",
              "signal": {
                "AMBIGUITY": 1,
                "PEOPLE": -1
              }
            },
            {
              "text": "Bảo vệ quyết định cũ",
              "outcome": "Đội mất niềm tin. Hai người giỏi rời đi trong 6 tháng.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.4,
        "AMBIGUITY": 0.7,
        "DETAIL": 0.6,
        "PEOPLE": 1,
        "VISIBLE": 0,
        "REPETITION": 0,
        "PRESSURE": 0.6
      }
    },
    {
      "role_code": "SWE_EM",
      "role_name": "Engineering Manager",
      "role_name_vn": "Trưởng phòng Kỹ thuật",
      "role_group": "Software Engineering & Architecture",
      "experience": "Chịu trách nhiệm về con người: tuyển, đánh giá hiệu suất, phát triển đội",
      "archetype": "C",
      "bands": "L7-L9",
      "band_start": "L7",
      "band_end": "L9",
      "salary_by_band": [
        {
          "band": "L7",
          "label": "Tech Lead / Manager / Principal",
          "salary_avg": 51800000,
          "evidence_level": "B_TITLE_SEEN"
        },
        {
          "band": "L8",
          "label": "Trên 8 năm / Senior Manager",
          "salary_avg": 52400000,
          "evidence_level": "B_TITLE_SEEN"
        }
      ],
      "salary_note": "Số công bố cho IT Manager",
      "reasons_to_leave": [
        {
          "label": "Career transition to a startup, freelancing, or a new job direction",
          "pct": 34.4
        },
        {
          "label": "Few or no opportunities for promotion",
          "pct": 21.9
        },
        {
          "label": "Limited career development opportunities",
          "pct": 21.9
        },
        {
          "label": "The company and its product have no potential for growth",
          "pct": 21.9
        }
      ],
      "work_life_evidence": "A_VERIFIED",
      "similar_ranked": [
        {
          "role_code": "SWE_TECHLEAD",
          "role_name": "Tech Lead",
          "weight": 0.5,
          "why": "Điểm rẽ nhánh IC/Management — cùng xuất phát, khác hướng",
          "shared_skills_top": []
        },
        {
          "role_code": "PROD_PM",
          "role_name": "Product Manager",
          "weight": 0.277,
          "why": "Cùng cấp quản lý: PM quản sản phẩm, EM quản con người",
          "shared_skills_top": [
            "asp.net"
          ]
        }
      ],
      "progresses_to": [],
      "events": [
        {
          "event_id": "SWE_EM_01",
          "role_code": "SWE_EM",
          "scope": "role_specific",
          "title": "Phải đánh giá hiệu suất thấp cho một người bạn quý",
          "setup": "Bạn ấy cố gắng nhưng kết quả không đạt. Đây là kỳ đánh giá thứ hai liên tiếp.",
          "measures": [
            "PEOPLE",
            "PRESSURE"
          ],
          "band_range": [
            "L7",
            "L8"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Trao đổi thẳng thắn kèm kế hoạch cải thiện cụ thể 3 tháng",
              "outcome": "Bạn ấy tiến bộ rõ và cảm ơn bạn sau đó. Đây là phần khó nhất của nghề quản lý.",
              "signal": {
                "PEOPLE": 2,
                "DETAIL": 2,
                "PRESSURE": 2
              }
            },
            {
              "text": "Đánh giá đúng nhưng không nói rõ vấn đề",
              "outcome": "Bạn ấy bất ngờ và tổn thương. Quan hệ xấu đi.",
              "signal": {
                "PEOPLE": -1
              }
            },
            {
              "text": "Nâng đánh giá lên mức đạt để giữ hoà khí",
              "outcome": "Vấn đề kéo dài. Các thành viên khác thấy bất công.",
              "signal": {
                "PEOPLE": -2,
                "DETAIL": -2
              }
            }
          ],
          "evidence_level": "A_VERIFIED",
          "source_note": "JD Engineering Manager của NAB liệt kê line management gồm 1:1, kế hoạch phát triển cá nhân, đánh giá thử việc và đánh giá hiệu suất."
        },
        {
          "event_id": "SWE_EM_02",
          "role_code": "SWE_EM",
          "scope": "role_specific",
          "title": "Công ty cắt 20% ngân sách, bạn phải chọn ai nghỉ",
          "setup": "Đội 10 người, phải giảm 2. Ai cũng có đóng góp.",
          "measures": [
            "PEOPLE",
            "PRESSURE"
          ],
          "band_range": [
            "L7",
            "L8"
          ],
          "frequency": "rare",
          "choices": [
            {
              "text": "Đánh giá theo tiêu chí rõ ràng, trao đổi riêng với từng người",
              "outcome": "Quyết định khó nhưng minh bạch. Người ở lại vẫn tin tưởng bạn.",
              "signal": {
                "PEOPLE": 2,
                "DETAIL": 2,
                "PRESSURE": 2
              }
            },
            {
              "text": "Đề xuất giảm giờ làm toàn đội thay vì cắt người",
              "outcome": "Được chấp nhận. Đội trải qua 6 tháng khó khăn nhưng không ai mất việc.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Để cấp trên quyết định",
              "outcome": "Tránh được trách nhiệm. Nhưng đội thấy bạn không bảo vệ họ.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_EM_03",
          "role_code": "SWE_EM",
          "scope": "role_specific",
          "title": "Bạn không còn hiểu chi tiết kỹ thuật đội đang làm",
          "setup": "Đã 2 năm bạn không code. Trong họp kỹ thuật bạn bắt đầu không theo kịp.",
          "measures": [
            "AMBIGUITY",
            "PEOPLE"
          ],
          "band_range": [
            "L7",
            "L8"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Thừa nhận và hỏi đội giải thích, tập trung vào quyết định cấp cao",
              "outcome": "Đội đánh giá cao sự trung thực. Bạn quyết định tốt hơn nhờ hỏi đúng câu hỏi.",
              "signal": {
                "PEOPLE": 2,
                "AMBIGUITY": 2
              }
            },
            {
              "text": "Dành mỗi tuần vài giờ đọc code và học lại",
              "outcome": "Giữ được cảm giác kỹ thuật. Nhưng thời gian quản lý bị ảnh hưởng.",
              "signal": {
                "DEEP_WORK": 2,
                "PRESSURE": 1
              }
            },
            {
              "text": "Giả vờ hiểu để giữ uy tín",
              "outcome": "Đội nhận ra và bắt đầu không tham vấn bạn về kỹ thuật nữa.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        },
        {
          "event_id": "SWE_EM_04",
          "role_code": "SWE_EM",
          "scope": "role_specific",
          "title": "Đội làm tốt nhưng sếp trên chỉ thấy vấn đề",
          "setup": "Sếp chỉ nhắc tới 1 sự cố trong quý, không nói gì tới 8 tính năng giao đúng hạn.",
          "measures": [
            "PEOPLE",
            "VISIBLE"
          ],
          "band_range": [
            "L7",
            "L8"
          ],
          "frequency": "monthly",
          "choices": [
            {
              "text": "Chuẩn bị báo cáo có số liệu về những gì đội đã giao",
              "outcome": "Sếp thay đổi cách nhìn. Đội được ghi nhận trong họp toàn công ty.",
              "signal": {
                "PEOPLE": 2,
                "DETAIL": 2,
                "VISIBLE": 2
              }
            },
            {
              "text": "Tự bảo vệ đội và chịu áp lực thay họ",
              "outcome": "Đội không biết, vẫn làm việc thoải mái. Bạn căng thẳng một mình.",
              "signal": {
                "PEOPLE": 2,
                "PRESSURE": 2
              }
            },
            {
              "text": "Truyền áp lực xuống đội",
              "outcome": "Đội mất tinh thần. Hai người xin chuyển sang đội khác.",
              "signal": {
                "PEOPLE": -2
              }
            }
          ],
          "evidence_level": "C_INFERRED",
          "source_note": "Suy luận từ đặc thù nghề, chưa neo vào JD hay nguồn cụ thể"
        }
      ],
      "fit_profile": {
        "_derived": true,
        "INTERRUPT": 0,
        "DEEP_WORK": 0.167,
        "AMBIGUITY": 0.333,
        "DETAIL": 0.5,
        "PEOPLE": 1,
        "VISIBLE": 0.167,
        "REPETITION": 0,
        "PRESSURE": 0.583
      }
    }
  ],
  "shared_events": [
    {
      "event_id": "SH_LAYOFF",
      "role_code": null,
      "scope": "shared",
      "title": "Công ty cắt giảm nhân sự",
      "setup": "Sáng thứ Hai, quản lý gọi họp toàn bộ phận. Công ty gặp khó khăn, 15% nhân sự sẽ nghỉ. Bạn chưa biết mình có trong danh sách không.",
      "measures": [
        "PRESSURE"
      ],
      "band_range": [
        "L2",
        "L3",
        "L4",
        "L5",
        "L6",
        "L7"
      ],
      "frequency": "rare",
      "choices": [
        {
          "text": "Chủ động hỏi thẳng quản lý về tình hình của mình",
          "outcome": "Được biết bạn an toàn, nhưng hai đồng nghiệp thân thì không. Không khí đội trầm hẳn.",
          "signal": {
            "PRESSURE": 1,
            "PEOPLE": 1
          }
        },
        {
          "text": "Im lặng chờ, tập trung làm việc như bình thường",
          "outcome": "Ba ngày sau mới có thông báo. Bạn ở lại, nhưng ba ngày đó gần như không làm được gì.",
          "signal": {
            "PRESSURE": -1
          }
        },
        {
          "text": "Bắt đầu cập nhật CV và tìm việc mới ngay",
          "outcome": "Bạn không bị cắt, nhưng đã có hai cuộc phỏng vấn. Giờ phải quyết định ở hay đi.",
          "signal": {
            "PRESSURE": 1
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "Thị trường IT VN 2023-2024 có nhiều đợt cắt giảm. Báo cáo ITviec 2025-2026 cho thấy nhu cầu đang phục hồi nhưng 'thận trọng và chọn lọc'."
    },
    {
      "event_id": "SH_OFFER",
      "role_code": null,
      "scope": "shared",
      "title": "Nhận offer từ công ty khác",
      "setup": "Một công ty khác mời bạn với lương cao hơn 30%. Nhưng dự án hiện tại đang giữa chừng và đội đang thiếu người.",
      "measures": [
        "PEOPLE",
        "PRESSURE"
      ],
      "band_range": [
        "L3",
        "L4",
        "L5",
        "L6"
      ],
      "frequency": "rare",
      "choices": [
        {
          "text": "Nhận offer mới, bàn giao đầy đủ trong 30 ngày",
          "outcome": "Lương tăng thật. Nhưng mất 3 tháng để quen môi trường mới, và bạn nhớ đội cũ.",
          "signal": {
            "PRESSURE": 1
          }
        },
        {
          "text": "Ở lại, dùng offer để đàm phán tăng lương",
          "outcome": "Được tăng 15%. Quản lý ghi nhận, nhưng quan hệ có chút gượng.",
          "signal": {
            "PEOPLE": 1
          }
        },
        {
          "text": "Ở lại vì trách nhiệm với dự án",
          "outcome": "Dự án thành công, bạn được ghi nhận. Sáu tháng sau mới được tăng lương.",
          "signal": {
            "PEOPLE": 2
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "Báo cáo ITviec khảo sát riêng về tỷ lệ và lý do chuyển việc — đây là tình huống rất phổ biến."
    },
    {
      "event_id": "SH_CONFLICT",
      "role_code": null,
      "scope": "shared",
      "title": "Bất đồng kỹ thuật với người có kinh nghiệm hơn",
      "setup": "Bạn tin cách làm của mình tốt hơn. Senior trong đội không đồng ý và đã quyết theo hướng của họ.",
      "measures": [
        "PEOPLE",
        "AMBIGUITY"
      ],
      "band_range": [
        "L2",
        "L3",
        "L4",
        "L5"
      ],
      "frequency": "monthly",
      "choices": [
        {
          "text": "Viết tài liệu so sánh hai phương án, đưa ra họp",
          "outcome": "Đội thảo luận nghiêm túc. Cuối cùng chọn phương án lai. Bạn được xem là người biết phản biện có căn cứ.",
          "signal": {
            "PEOPLE": 2,
            "DETAIL": 1
          }
        },
        {
          "text": "Làm theo senior, giữ ý kiến cho mình",
          "outcome": "Dự án chạy. Ba tháng sau gặp đúng vấn đề bạn đã lo — nhưng không ai biết bạn từng nghĩ tới.",
          "signal": {
            "PEOPLE": -1
          }
        },
        {
          "text": "Tự làm thử phương án của mình ngoài giờ để chứng minh",
          "outcome": "Bạn chứng minh được, nhưng mất hai buổi tối và senior thấy hơi khó chịu vì bị qua mặt.",
          "signal": {
            "DEEP_WORK": 2,
            "PEOPLE": -1
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "Golden role SWE_FRONTEND ghi nhận 'peer review và phản biện quyết định' là phần việc thật từ band L5 trở lên (JD NAB)."
    },
    {
      "event_id": "SH_OT",
      "role_code": null,
      "scope": "shared",
      "title": "Deadline trùng dịp gia đình",
      "setup": "Sprint kết thúc thứ Sáu. Chủ Nhật là sinh nhật mẹ bạn, cả nhà đã đặt bàn. Còn 2 task chưa xong.",
      "measures": [
        "PRESSURE",
        "PEOPLE"
      ],
      "band_range": [
        "L2",
        "L3",
        "L4",
        "L5"
      ],
      "frequency": "monthly",
      "choices": [
        {
          "text": "Làm thêm tối thứ Năm và thứ Sáu để kịp",
          "outcome": "Kịp deadline, đi được sinh nhật. Nhưng bạn mệt cả tuần sau.",
          "signal": {
            "PRESSURE": 2
          }
        },
        {
          "text": "Báo quản lý sớm, xin dời 2 task sang sprint sau",
          "outcome": "Quản lý đồng ý. Sprint bị trượt một chút nhưng không ai phàn nàn.",
          "signal": {
            "PEOPLE": 2,
            "PRESSURE": -1
          }
        },
        {
          "text": "Nhờ đồng nghiệp gánh hộ",
          "outcome": "Xong việc, nhưng lần sau bạn sẽ phải gánh lại cho họ.",
          "signal": {
            "PEOPLE": 1
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "JD outsourcing VN thường ghi 'OT theo mốc release' — đây là thực tế của nhóm này."
    },
    {
      "event_id": "SH_NEWTECH",
      "role_code": null,
      "scope": "shared",
      "title": "Công ty đổi công nghệ đang dùng",
      "setup": "Quản lý thông báo đội sẽ chuyển toàn bộ sang một công nghệ mới trong 3 tháng. Bạn vừa mới thành thạo cái cũ.",
      "measures": [
        "AMBIGUITY",
        "PRESSURE"
      ],
      "band_range": [
        "L3",
        "L4",
        "L5",
        "L6"
      ],
      "frequency": "rare",
      "choices": [
        {
          "text": "Chủ động học trước, làm demo cho đội",
          "outcome": "Bạn thành người hiểu công nghệ mới sớm nhất, được giao dẫn dắt phần chuyển đổi.",
          "signal": {
            "AMBIGUITY": 2,
            "DEEP_WORK": 1
          }
        },
        {
          "text": "Học theo lịch đào tạo của công ty",
          "outcome": "Bắt kịp cùng cả đội. Không nổi bật nhưng không tụt lại.",
          "signal": {
            "AMBIGUITY": 0
          }
        },
        {
          "text": "Đề xuất giữ công nghệ cũ cho phần mình phụ trách",
          "outcome": "Được chấp nhận tạm thời. Sáu tháng sau phần của bạn thành 'legacy' mà không ai muốn động vào.",
          "signal": {
            "AMBIGUITY": -2
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "Báo cáo ITviec: 'khả năng ứng dụng AI đang nổi lên như tiêu chí tuyển dụng mới' — đổi công nghệ là chuyện thường xuyên."
    },
    {
      "event_id": "SH_ONBOARD",
      "role_code": null,
      "scope": "shared",
      "title": "Người mới vào đội, bạn được giao kèm",
      "setup": "Đội tuyển một bạn fresher. Quản lý giao bạn kèm cặp trong 2 tháng, song song với việc của mình.",
      "measures": [
        "PEOPLE",
        "REPETITION"
      ],
      "band_range": [
        "L4",
        "L5",
        "L6"
      ],
      "frequency": "rare",
      "choices": [
        {
          "text": "Dành 1 tiếng mỗi ngày kèm sát",
          "outcome": "Bạn fresher tiến bộ nhanh. Việc của bạn chậm lại một chút nhưng quản lý ghi nhận.",
          "signal": {
            "PEOPLE": 2,
            "REPETITION": 1
          }
        },
        {
          "text": "Đưa tài liệu, để bạn ấy tự học, có gì hỏi",
          "outcome": "Bạn ấy loay hoay 3 tuần đầu rồi cũng ổn. Bạn giữ được tiến độ công việc.",
          "signal": {
            "PEOPLE": -1,
            "DEEP_WORK": 1
          }
        },
        {
          "text": "Từ chối vì đang quá tải",
          "outcome": "Quản lý hiểu nhưng hơi thất vọng. Cơ hội thể hiện khả năng dẫn dắt bị bỏ lỡ.",
          "signal": {
            "PEOPLE": -2
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "Nhiều JD từ band L4 trở lên có ghi 'training for fresher/junior developer' (JD One Mount)."
    },
    {
      "event_id": "SH_REVIEW",
      "role_code": null,
      "scope": "shared",
      "title": "Bị đánh giá hiệu suất thấp hơn kỳ vọng",
      "setup": "Kỳ đánh giá cuối năm, bạn nghĩ mình làm tốt nhưng nhận mức 'đạt yêu cầu' chứ không phải 'vượt'.",
      "measures": [
        "PEOPLE",
        "PRESSURE"
      ],
      "band_range": [
        "L3",
        "L4",
        "L5",
        "L6"
      ],
      "frequency": "rare",
      "choices": [
        {
          "text": "Hỏi quản lý cụ thể cần cải thiện gì",
          "outcome": "Nhận được góp ý rõ ràng về việc bạn ít chia sẻ tiến độ. Năm sau bạn sửa và được đánh giá cao.",
          "signal": {
            "PEOPLE": 2
          }
        },
        {
          "text": "Chấp nhận, tự tìm cách thể hiện tốt hơn",
          "outcome": "Bạn làm nhiều hơn nhưng không ai biết. Năm sau vẫn vậy.",
          "signal": {
            "DEEP_WORK": 1,
            "PEOPLE": -1
          }
        },
        {
          "text": "Thấy bất công, bắt đầu tìm việc mới",
          "outcome": "Chuyển việc với lương cao hơn. Nhưng vấn đề cũ có thể lặp lại nếu chưa hiểu nguyên nhân.",
          "signal": {
            "PRESSURE": 1
          }
        }
      ],
      "evidence_level": "A_VERIFIED",
      "source_note": "JD NAB Engineering Manager mô tả line management gồm 'đánh giá hiệu suất' là phần việc chính thức."
    }
  ],
  "scenarios": {
    "SWE_BACKEND_L1_S_EXEC": {
      "_meta": {
        "spec_version": "scenario-2.2",
        "generated_at": "2026-09-14",
        "source_dataset": "9_roles_tier1_pass2.json",
        "fallback_tier": 2,
        "golden_used": [
          "scenarios/SWE_BACKEND/L3_S_INCIDENT.json"
        ],
        "note": "Kịch bản mở màn của nghề Back-end. Cố ý phủ cả bốn loại activity (PRIORITIZING, CHOICE, ORDERING, FREETEXT) vì L1 là chỗ các loại đóng hợp lý nhất — intern nhận việc đã chia sẵn, phần lớn quyết định là chọn và sắp xếp trong phạm vi đã giới hạn."
      },
      "scenario_title": "Tham gia fix các bug mức độ ưu tiên thấp",
      "shortname": "Sửa bug nhỏ",
      "job": {
        "role_code": "SWE_BACKEND",
        "role_name_vn": "Lập trình viên Back-end",
        "band": "L1",
        "title_vn": "Backend Engineer Intern",
        "years_experience": "0",
        "user_context": "Bạn thực tập được ba tuần. Đã merge hai PR nhỏ, cả hai đều do An sửa lại kha khá trước khi duyệt. Hôm nay là lần đầu bạn được giao nguyên một nhóm bug để tự xử.",
        "core_output": "Hiện thực logic nghiệp vụ đơn giản và viết API endpoint theo mẫu có sẵn dưới sự giám sát trực tiếp của kỹ sư cấp cao, chưa tự quyết định về schema dữ liệu hay lựa chọn thư viện."
      },
      "context": {
        "scenario_archetype": "S_EXEC",
        "task": "Tham gia fix các bug mức độ ưu tiên thấp",
        "skills_hard": [
          "SQL (MySQL/PostgreSQL)",
          "Git"
        ],
        "skills_soft": [
          "Chủ động học hỏi",
          "Giao tiếp cơ bản trong team"
        ],
        "company_type": "product_local",
        "work_environment_id": "WE_HYBRID_PRODUCT",
        "situation": "8:50 sáng thứ Hai, tại một công ty product tầm trung. Hà bên QA vừa gán cho bạn năm bug mức thấp còn tồn từ tuần trước. An — người kèm bạn — đang họp sprint planning tới 10 giờ. Sprint này bạn được giao đúng nhóm bug đó, không có việc nào khác.",
        "stakes": "Không có gì sập. Nhưng đây là lần đầu bạn tự chọn thứ tự làm việc, và An sẽ nhìn vào đó để biết có thể giao thêm cho bạn hay chưa.",
        "time_pressure": "Cả buổi sáng",
        "estimated_minutes": 10
      },
      "cast": [
        {
          "npc_id": "an",
          "role_in_scene": "Senior Backend, người kèm bạn",
          "pressure": "Đang họp sprint planning tới 10 giờ, chỉ trả lời tin nhắn giữa hai phiên họp",
          "voice": "Ngắn gọn, hay hỏi ngược lại kiểu 'em đã thử chưa?'"
        },
        {
          "npc_id": "ha",
          "role_in_scene": "QA, người tìm ra nhóm bug này",
          "pressure": "Cần biết bug nào được sửa trong sprint này để lên kế hoạch test lại",
          "voice": "Thẳng thắn, mô tả bug rất chi tiết, không ngại nhắc lại"
        }
      ],
      "activities": [
        {
          "activity_id": "a1",
          "type": "PRIORITIZING",
          "choice_reason": "Việc đầu tiên của buổi là chọn làm gì trước. Ngoài đời đây là một thao tác trên bảng ticket — kéo hai cái lên đầu — chứ không phải viết một đoạn giải thích. Cho gõ tự do ở đây là đo sai thứ cần đo.",
          "summary": "Chọn hai bug làm trước trong năm bug được giao",
          "isOrigin": true,
          "forward_to": "a2",
          "context": {
            "skills_in_play": [
              "Chủ động học hỏi"
            ],
            "company_flavour": "Công ty product không có quy trình phân loại mức độ nghiêm trọng chính thức — mọi bug đều gắn nhãn 'thấp', người làm phải tự đọc mô tả để biết cái nào thật sự chạm tới người dùng.",
            "job_scope": "L1 ĐƯỢC tự chọn thứ tự làm trong đúng nhóm bug đã được giao. KHÔNG ĐƯỢC tự nhận thêm việc ngoài nhóm này, cũng không được tự ý refactor code không nằm trong bug nào."
          },
          "setup": "Bảng ticket của bạn sáng nay có năm dòng. Tất cả đều gắn nhãn 'ưu tiên thấp', nhưng nhãn đó do hệ thống tự gán khi Hà tạo hàng loạt chứ không phải Hà cân nhắc từng cái.",
          "npc_line": "Hà: 'Em xem qua rồi làm cái nào trước cũng được nhé, chị chỉ cần biết sprint này em đụng tới cái nào để chị xếp lịch test lại.'",
          "input_prompt": "Chọn hai bug bạn sẽ làm trước sáng nay.",
          "options": null,
          "items": [
            {
              "item_id": "i1",
              "text": "Nút 'Xuất Excel' lệch 2px trên Safari",
              "note": "Chỉ lệch trên một trình duyệt, không ai báo"
            },
            {
              "item_id": "i2",
              "text": "API /profile trả lỗi 500 khi tài khoản chưa có ảnh đại diện",
              "note": "Hà ghi: gặp ở 3 tài khoản test, app mobile hiện màn hình trắng"
            },
            {
              "item_id": "i3",
              "text": "Sai chính tả 'Đăng nhâp' ở màn hình đăng nhập",
              "note": "Hà ghi: sửa 5 phút, ai mở app cũng thấy"
            },
            {
              "item_id": "i4",
              "text": "Log ghi trùng hai dòng mỗi request",
              "note": "Gây nhiễu khi đọc log, không ảnh hưởng người dùng"
            },
            {
              "item_id": "i5",
              "text": "Gộp lại class UserMapper cho gọn",
              "note": "Không phải bug. Một bạn trong team ghi chú lại từ tháng trước"
            }
          ],
          "pick_count": 2,
          "must_pick": [
            "i2"
          ],
          "should_pick": [
            "i3"
          ],
          "must_not_pick": [
            "i5"
          ],
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "Hà: 'Chị ghi chú khá kỹ ở từng cái đấy, em đọc phần ghi chú trước khi chọn nhé.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 0,
          "followup_goal": null,
          "closing_prompt": "Bạn kéo hai ticket lên đầu bảng. Hà thả tim vào tin nhắn.",
          "observes": [
            {
              "skill_type": "soft",
              "skill": "Chủ động học hỏi",
              "anchors": {
                "0": "Chọn được cái gây lỗi cho người dùng nhưng cái còn lại là việc ít ai thấy",
                "+2": "Tự đọc ghi chú để nhận ra cái nào thật sự chạm tới người dùng, thay vì làm theo thứ tự danh sách",
                "-1": "Bỏ qua cái gây lỗi 500, hoặc tự nhận việc gộp class vốn không phải bug và không được giao"
              }
            }
          ]
        },
        {
          "activity_id": "a2",
          "type": "CHOICE",
          "choice_reason": "Khoảnh khắc nhìn thấy dòng query và phải chọn hướng sửa. Đây là một quyết định kỹ thuật nhỏ có sẵn vài phương án chuẩn, không phải chỗ để diễn đạt suy nghĩ dài.",
          "summary": "Chọn cách sửa lỗi 500 khi ảnh đại diện rỗng",
          "isOrigin": false,
          "forward_to": "a3",
          "context": {
            "skills_in_play": [
              "SQL (MySQL/PostgreSQL)"
            ],
            "company_flavour": "Tự chủ tech stack nên không có chuẩn code cứng cho việc xử lý giá trị rỗng — mỗi người làm một kiểu, và đó chính là lý do bug này tồn tại.",
            "job_scope": "L1 ĐƯỢC sửa câu truy vấn và code xử lý trong đúng endpoint được giao. KHÔNG ĐƯỢC đổi schema bảng hay thêm ràng buộc mới — theo core_output, quyết định về schema chưa thuộc về bạn."
          },
          "setup": "Bạn mở /profile. Câu truy vấn nối bảng users với bảng avatars bằng INNER JOIN. Tài khoản nào chưa upload ảnh thì không có dòng nào bên avatars, câu truy vấn trả về rỗng, và đoạn code phía sau gọi thẳng vào kết quả rỗng đó rồi văng lỗi.",
          "npc_line": null,
          "input_prompt": null,
          "options": [
            "Đổi INNER JOIN thành LEFT JOIN, và xử lý trường hợp ảnh rỗng ở tầng code",
            "Thêm một dòng ảnh mặc định vào bảng avatars cho mọi tài khoản đang thiếu",
            "Bọc đoạn gọi đó trong try-catch, lỗi thì trả về ảnh mặc định"
          ],
          "optionGrade": [
            "+2",
            "-1",
            "0"
          ],
          "optionWhy": [
            "Sửa đúng nguyên nhân: quan hệ giữa hai bảng vốn là tùy chọn, nên phép nối cũng phải là tùy chọn",
            "Đụng vào dữ liệu của bảng khác để lách một lỗi code — vượt phạm vi của L1 và để lại dữ liệu rác",
            "Chặn được lỗi văng ra nhưng nguyên nhân vẫn còn, và try-catch sẽ nuốt luôn những lỗi khác chưa biết"
          ],
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [],
          "limitFollowup": 0,
          "followup_goal": null,
          "closing_prompt": "Bạn sửa xong, chạy thử với một tài khoản chưa có ảnh. Lần này trả về bình thường.",
          "observes": [
            {
              "skill_type": "hard",
              "skill": "SQL (MySQL/PostgreSQL)",
              "anchors": {
                "0": "Chặn được lỗi văng ra nhưng không chạm tới nguyên nhân ở câu truy vấn",
                "+2": "Nhận ra quan hệ giữa hai bảng là tùy chọn nên phải dùng phép nối tùy chọn",
                "-1": "Sửa bằng cách chèn thêm dữ liệu vào bảng khác thay vì sửa câu truy vấn"
              }
            }
          ]
        },
        {
          "activity_id": "a3",
          "type": "ORDERING",
          "choice_reason": "Quy trình đưa một thay đổi lên nhánh chính là một chuỗi thao tác có thứ tự đúng. Hỏi bằng lời thì người chơi kể lại được mà chưa chắc làm đúng; bắt sắp xếp thì thấy ngay ai nhớ bước nào đứng trước bước nào.",
          "summary": "Sắp xếp các bước đưa bản sửa lên nhánh chính",
          "isOrigin": false,
          "forward_to": "a4",
          "context": {
            "skills_in_play": [
              "Git"
            ],
            "company_flavour": "Nhánh chính khoá lại, mọi thay đổi đều phải qua pull request và ít nhất một người duyệt — kể cả sửa một dòng.",
            "job_scope": "L1 ĐƯỢC tự tạo nhánh, commit và mở pull request. KHÔNG ĐƯỢC tự merge vào nhánh chính — luôn cần An duyệt trước."
          },
          "setup": "Code đã sửa xong trên máy bạn. Giờ là phần đưa nó lên. Team có quy ước rõ ràng cho việc này, An đã dặn từ tuần đầu.",
          "npc_line": "An: 'Anh ra khỏi phòng họp 5 phút. Em cứ làm theo quy trình như anh dặn nhé, xong ping anh.'",
          "input_prompt": "Sắp xếp các bước theo đúng thứ tự bạn sẽ làm.",
          "options": null,
          "items": [
            {
              "item_id": "s1",
              "text": "Tạo nhánh mới từ nhánh chính đã cập nhật"
            },
            {
              "item_id": "s2",
              "text": "Viết một unit test tái hiện đúng lỗi 500"
            },
            {
              "item_id": "s3",
              "text": "Sửa câu truy vấn và code xử lý"
            },
            {
              "item_id": "s4",
              "text": "Chạy lại toàn bộ test, thấy test vừa viết đã qua"
            },
            {
              "item_id": "s5",
              "text": "Commit và đẩy nhánh lên, mở pull request gán cho An"
            }
          ],
          "correct_order": [
            "s1",
            "s2",
            "s3",
            "s4",
            "s5"
          ],
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "An: 'Nhớ là mình viết test trước khi sửa nhé — có thế mới biết chắc là test bắt được đúng cái lỗi đó.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 0,
          "followup_goal": null,
          "closing_prompt": "Pull request đã mở. An được gán làm người duyệt.",
          "observes": [
            {
              "skill_type": "hard",
              "skill": "Git",
              "anchors": {
                "0": "Thứ tự gần đúng nhưng đảo một hai chỗ, ví dụ sửa code xong mới viết test",
                "+2": "Đúng toàn bộ thứ tự: tách nhánh từ bản mới nhất, viết test tái hiện lỗi trước khi sửa, chạy lại test rồi mới mở pull request",
                "-1": "Sai thứ tự ở nhiều chỗ, hoặc mở pull request trước khi chạy test"
              }
            }
          ]
        },
        {
          "activity_id": "a4",
          "type": "FREETEXT",
          "choice_reason": null,
          "summary": "Nhắn An sau khi mở pull request",
          "isOrigin": false,
          "forward_to": "END",
          "context": {
            "skills_in_play": [
              "Giao tiếp cơ bản trong team"
            ],
            "company_flavour": "Không có mẫu báo cáo nào cả — một tin nhắn trong nhóm là toàn bộ thủ tục bàn giao.",
            "job_scope": "L1 ĐƯỢC tự viết tin nhắn và tự nêu chỗ mình chưa chắc. KHÔNG ĐƯỢC tự quyết bao giờ merge — đó là việc của An."
          },
          "setup": "9:55. Pull request đã mở. An sắp ra khỏi phòng họp.",
          "npc_line": "An: 'Anh xong họp rồi. Em làm tới đâu rồi, có gì cần anh xem không?'",
          "input_prompt": "Nhắn lại cho An.",
          "options": null,
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "An: 'Em cứ nói cả chỗ nào em chưa chắc nhé, hỏi sớm đỡ mất công sửa lại.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 1,
          "followup_goal": "Nếu người chơi chỉ báo đã xong mà không nêu chỗ nào mình chưa chắc, hoặc không nói mình đã sửa bug nào trong năm cái, hỏi lại đúng chỗ thiếu đó.",
          "closing_prompt": "An: 'Ok, để anh xem. Chiều mình nói chuyện về mấy cái còn lại nhé.'",
          "observes": [
            {
              "skill_type": "soft",
              "skill": "Giao tiếp cơ bản trong team",
              "anchors": {
                "0": "Báo được là đã xong nhưng thiếu cách sửa hoặc không nêu chỗ nào cần hỏi",
                "+2": "Nói rõ đã làm bug nào, cách sửa ra sao, và chủ động nêu ít nhất một chỗ mình chưa chắc",
                "-1": "Chỉ nhắn 'em xong rồi ạ' mà không cho An biết gì thêm"
              }
            }
          ]
        }
      ],
      "random_events": [
        {
          "event_id": "re_ha_them_bug",
          "chance": 0.3,
          "after_activity": "a2",
          "condition": null,
          "text": "Hà nhắn riêng: 'Em ơi chị vừa tìm thêm một cái nữa, màn hình đơn hàng cũng trắng y hệt. Em xem luôn được không?'",
          "outcome": "DIVERT",
          "divert_note": "An vừa liếc thấy tin nhắn, trả lời thay: 'Hà để anh xếp vào sprint sau nhé, hôm nay em ấy làm nốt phần đang dở đã.' Kéo người chơi về a3 mà không mở nhánh việc mới — đồng thời cho thấy ở L1 việc chặn phạm vi là của mentor, không phải của người chơi.",
          "early_ending_id": null
        }
      ],
      "endings": [
        {
          "ending_id": "e_pattern",
          "type": "SECRET",
          "priority": 1,
          "condition": {
            "min_plus2": 2,
            "max_minus1": 0,
            "extra": "Người chơi tự nêu ra rằng lỗi ảnh đại diện rỗng có thể còn ở những endpoint khác cùng kiểu, và hỏi An xem có nên rà thêm không — tức nhìn ra đây là một kiểu sai lặp lại chứ không phải một bug lẻ. Nêu ở a4 hoặc trong lượt đào sâu đều tính."
          },
          "text": "An đọc tin nhắn, dừng lại một lúc rồi trả lời: 'Ừ… em hỏi câu đấy hay đấy. Để chiều anh với em cùng rà xem còn chỗ nào nối bảng kiểu đấy nữa không.' Chiều hôm đó hai anh em tìm thêm được bốn chỗ. Cuối sprint, An đề xuất đưa việc rà soát đó thành một ticket riêng và ghi tên bạn vào.",
          "reveals": "Một bug lẻ thì sửa xong là hết. Một kiểu sai lặp lại thì sửa một chỗ chỉ là dọn phần nổi. Người mới thường dừng ở chỗ 'đã hết lỗi'; thứ khiến An chú ý là câu hỏi 'chỗ khác có bị giống thế không?'.",
          "reachable_by_event": false
        },
        {
          "ending_id": "e_good",
          "type": "GOOD",
          "priority": 2,
          "condition": {
            "min_plus2": 3,
            "max_minus1": 0,
            "extra": null
          },
          "text": "An duyệt pull request trong buổi chiều, chỉ sửa lại đúng một dòng đặt tên biến. Đây là PR đầu tiên của bạn gần như không phải làm lại. Cuối tuần An giao cho bạn thêm hai bug nữa, lần này không dặn gì thêm.",
          "reveals": null,
          "reachable_by_event": false
        },
        {
          "ending_id": "e_partial",
          "type": "PARTIAL",
          "priority": 3,
          "condition": {
            "min_plus2": 1,
            "max_minus1": 1,
            "extra": null
          },
          "text": "Pull request được duyệt sau hai vòng sửa. An không nói gì nặng, chỉ để lại vài bình luận về chỗ nên viết test trước khi sửa. Bug đã hết, nhưng buổi chiều bạn ngồi đọc lại phần bình luận đó khá lâu.",
          "reveals": null,
          "reachable_by_event": false
        },
        {
          "ending_id": "e_bad",
          "type": "BAD",
          "priority": 4,
          "condition": {
            "min_plus2": null,
            "max_minus1": null,
            "extra": null
          },
          "text": "An mở pull request ra, im lặng một lúc, rồi gọi bạn sang bàn. Hai anh em sửa lại cùng nhau trong bốn mươi phút. Cuối buổi An nói: 'Không sao, lần đầu mà. Nhưng lần sau em ping anh sớm hơn nhé, đừng đợi tới lúc mở PR.'",
          "reveals": null,
          "reachable_by_event": false
        }
      ],
      "evidence_level": "B_TITLE_SEEN",
      "coverage_note": "Fallback tier 2. Band L1 của SWE_BACKEND có tasks[] rỗng trong 9_roles_tier1_pass2.json, nên mượn từ band liền kề L2 (A_VERIFIED): task 'Tham gia fix các bug mức độ ưu tiên thấp', skills_hard 'SQL (MySQL/PostgreSQL)' và 'Git', skills_soft 'Chủ động học hỏi' và 'Giao tiếp cơ bản trong team'. Đã hiệu chỉnh phạm vi hậu quả xuống đúng L1 theo bảng A4: không có gì sập, mọi thay đổi đều qua An duyệt, và job_scope của cả bốn activity đều ghi rõ giới hạn 'chưa tự quyết định schema' lấy từ core_output của chính L1. Phủ toàn bộ skills_soft và cả hai skills_hard đã khai. Ngân sách A7: 1 PRIORITIZING + 1 CHOICE + 1 ORDERING + 1 FREETEXT + 1 follow-up = 1.5 + 1 + 2 + 2 + 1.5 + 2 = 10 phút.",
      "unknowns": [
        "Toàn bộ task và skill của kịch bản này mượn từ band L2. Nếu sau này thu thập được JD thật cho vị trí thực tập backend tại VN thì phải sinh lại, vì công việc thực tập có thể khác hẳn công việc fresher.",
        "Chưa rõ một người chưa từng dùng Git có sắp đúng thứ tự năm bước ở a3 hay không. Nếu tỉ lệ sai quá cao thì mốc hành vi ở đó đang đòi mức 'proficient' trong khi người chơi L1 mới ở mức tập làm quen.",
        "Ngưỡng min_plus2 = 3 cho kết cục tốt đặt trên tổng 4 mốc khả dĩ, chưa hiệu chỉnh trên người chơi thật. Ai bấm gợi ý ở hai activity trở lên thì gần như không đạt được.",
        "Luật 'tối đa 3 activity đóng ở L1–L2' là mới ở bản 2.2, chưa kiểm chứng trên nhiều kịch bản. Có thể ba loại đóng liên tiếp khiến lượt chơi thấy giống bài trắc nghiệm hơn là mô phỏng công việc.",
        "Bộ năm bug ở a1 là tình huống minh hoạ, không lấy từ backlog thật của công ty nào."
      ]
    },
    "SWE_BACKEND_L3_S_INCIDENT": {
      "_meta": {
        "spec_version": "scenario-2.2",
        "generated_at": "2026-09-09",
        "source_dataset": "9_roles_tier1_pass2.json",
        "fallback_tier": 1,
        "golden_used": [],
        "note": "Golden anchor cho spec-scenario-KHOI1.md. Chọn SWE_BACKEND L3 vì level này là A_VERIFIED (task/skill lấy từ JD thật), nằm giữa thang nên thể hiện rõ cả trục ROLE lẫn trục BAND, và là role có nhiều tin tuyển nhất theo outlook/posting_counts.csv."
      },
      "scenario_title": "Tối ưu hóa các API bị chậm",
      "shortname": "Tối ưu API",
      "job": {
        "role_code": "SWE_BACKEND",
        "role_name_vn": "Lập trình viên Back-end",
        "band": "L3",
        "title_vn": "Junior Backend Engineer",
        "years_experience": "1-2",
        "user_context": "Bạn vào công ty được 8 tháng. Đã tự sửa vài bug production dưới sự kèm cặp của An, nhưng chưa lần nào tự dẫn một sự cố từ đầu tới cuối. Endpoint /orders/history là tính năng đầu tiên bạn viết trọn vẹn một mình.",
        "core_output": "Tự hiện thực trọn vẹn một tính năng backend đã được xác định rõ — API, xử lý nghiệp vụ, truy vấn CSDL — tham gia code review hai chiều, nhưng chưa tự quyết định kiến trúc service hay chọn công nghệ mới."
      },
      "context": {
        "scenario_archetype": "S_INCIDENT",
        "task": "Tối ưu hóa các API bị chậm",
        "skills_hard": [
          "Redis",
          "RESTful API Design"
        ],
        "skills_soft": [
          "Giải quyết vấn đề",
          "Làm việc độc lập"
        ],
        "company_type": "product_local",
        "work_environment_id": "WE_HYBRID_PRODUCT",
        "situation": "9:40 sáng thứ Ba, tại một công ty product tầm trung. API /orders/history trả về chậm hẳn từ 8:00, p95 nhảy từ 200ms lên 4.2s. Chưa sập, nhưng app mobile đang hiện spinner rất lâu và bộ phận support bắt đầu nhận phàn nàn. Bạn là người viết endpoint này ba tuần trước.",
        "stakes": "Chưa mất tiền, nhưng nếu tới trưa chưa xử lý thì lượt đặt hàng giờ cao điểm sẽ rơi.",
        "time_pressure": "Trong buổi sáng",
        "estimated_minutes": 13
      },
      "cast": [
        {
          "npc_id": "an",
          "role_in_scene": "Senior Backend, reviewer của bạn",
          "pressure": "Đang bận release một module khác, sẵn sàng giúp nhưng không muốn bị hỏi những thứ bạn tự tra được",
          "voice": "Ngắn gọn, hay hỏi ngược lại kiểu 'em đã xem log chưa?'"
        },
        {
          "npc_id": "linh",
          "role_in_scene": "Team Lead",
          "pressure": "Đang bị support hỏi, cần một mốc thời gian để trả lời họ",
          "voice": "Bình tĩnh, không đổ lỗi, nhưng hỏi rất cụ thể"
        }
      ],
      "activities": [
        {
          "activity_id": "a1",
          "type": "CHOICE",
          "choice_reason": "Khoảnh khắc vừa nhận ra sự cố. Ngoài đời người ta phản xạ trong vài giây rồi mới nghĩ — không ai ngồi viết một đoạn giải thích trước khi mở log. Cho gõ tự do ở đây là đo sai thứ cần đo.",
          "summary": "Phát hiện sự cố, chọn nước đi đầu tiên",
          "isOrigin": true,
          "forward_to": "a2",
          "context": {
            "skills_in_play": [
              "Làm việc độc lập"
            ],
            "company_flavour": "Công ty product tự chủ tech stack nên không có quy trình incident cứng: không ai gán việc, người viết endpoint tự nhận lấy.",
            "job_scope": "L3 ĐƯỢC tự quyết nước đi đầu tiên trên chính endpoint mình viết. KHÔNG ĐƯỢC đụng vào cấu hình hạ tầng hay restart service của người khác."
          },
          "setup": "Bạn mở dashboard, thấy p95 dựng đứng lúc 8:03. Không có deploy nào sáng nay.",
          "npc_line": null,
          "options": [
            "Xem lại query plan của endpoint và log DB quanh mốc 8:03",
            "Nhắn An ngay: 'anh ơi API /orders/history chậm, anh xem giúp em với'",
            "Restart service, xem có hết không rồi tính tiếp"
          ],
          "optionGrade": [
            "+2",
            "-1",
            "0"
          ],
          "optionWhy": [
            "Tự khoanh vùng bằng dữ liệu trước khi gọi người khác",
            "Ném vấn đề sang senior khi chưa tự xem gì",
            "Restart để thử — có lý nhưng không thu được thông tin gì về nguyên nhân"
          ],
          "input_prompt": null,
          "quick_action": true,
          "time_limit_seconds": 30,
          "hints": [],
          "limitFollowup": 0,
          "followup_goal": null,
          "closing_prompt": "Màn hình log bắt đầu chạy. Bạn kéo xuống mốc 8:00.",
          "observes": [
            {
              "skill_type": "soft",
              "skill": "Làm việc độc lập",
              "anchors": {
                "0": "Restart để thử — có lý nhưng không thu được thông tin gì về nguyên nhân",
                "+2": "Tự khoanh vùng bằng dữ liệu (log, query plan) trước khi gọi người khác",
                "-1": "Ném vấn đề sang senior khi chưa tự xem gì, hoặc để hết giờ không làm gì"
              }
            }
          ]
        },
        {
          "activity_id": "a2",
          "type": "FREETEXT",
          "choice_reason": null,
          "summary": "Chẩn đoán N+1 và đề xuất cách sửa",
          "isOrigin": false,
          "forward_to": "a3",
          "context": {
            "skills_in_play": [
              "Giải quyết vấn đề",
              "RESTful API Design"
            ],
            "company_flavour": "Product local focus vào scale, nên câu hỏi 'còn ai nữa sẽ dính' là câu An mong đợi chứ không phải câu thừa.",
            "job_scope": "L3 ĐƯỢC đề xuất cách sửa và được nêu ý kiến về hợp đồng API. KHÔNG ĐƯỢC tự đổi hợp đồng API đang chạy — phải qua An duyệt."
          },
          "setup": "Log cho thấy mỗi request /orders/history đang bắn 1 query lấy danh sách đơn, rồi N query lấy chi tiết từng đơn. Sáng nay có một khách sỉ với 900 đơn trong lịch sử.",
          "npc_line": "An: 'Ừ nhìn giống N+1 đấy. Em định xử thế nào? Nói anh nghe cách trước khi code.'",
          "options": null,
          "input_prompt": "Trả lời An: bạn chẩn đoán vấn đề là gì và định sửa ra sao?",
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "An: 'Em thử đếm xem một request đang chạm DB bao nhiêu lần, rồi nhìn lại con số 900 kia xem.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 2,
          "followup_goal": "Đào sâu chỗ người chơi hay bỏ qua: endpoint có nên giới hạn dữ liệu trả về cho tài khoản nhiều đơn không. Hỏi khi họ chỉ nói tới tầng truy vấn mà không đụng gì tới hợp đồng API.",
          "closing_prompt": "An: 'Ok, anh hiểu rồi. Em làm đi, xong ping anh nhé.'",
          "observes": [
            {
              "skill_type": "soft",
              "skill": "Giải quyết vấn đề",
              "anchors": {
                "0": "Nhận ra là query quá nhiều nhưng đề xuất chung chung kiểu 'tối ưu lại query'",
                "+2": "Gọi đúng tên N+1, nêu cách sửa cụ thể (join / batch load / eager load), và giải thích được vì sao hôm nay mới bung ra",
                "-1": "Đề xuất tăng cấu hình DB hoặc nới timeout — chữa triệu chứng, không chạm nguyên nhân"
              }
            },
            {
              "skill_type": "hard",
              "skill": "RESTful API Design",
              "anchors": {
                "0": "Chỉ sửa tầng truy vấn, không đụng gì tới hợp đồng API",
                "+2": "Có nhắc tới phân trang hoặc giới hạn dữ liệu trả về cho tài khoản có nhiều đơn",
                "-1": "Đề xuất trả toàn bộ lịch sử đơn trong một response"
              }
            }
          ]
        },
        {
          "activity_id": "a3",
          "type": "FREETEXT",
          "choice_reason": null,
          "summary": "Quyết định có cache hay không, và vì sao",
          "isOrigin": false,
          "forward_to": "a4",
          "context": {
            "skills_in_play": [
              "Redis"
            ],
            "company_flavour": "Tự chủ tech stack nên Redis có sẵn, thêm cache không phải xin phép hạ tầng — nhưng vẫn phải giải thích được lý do.",
            "job_scope": "L3 KHÔNG tự quyết chiến lược cache cho toàn hệ thống. Ở đây An là người gợi ý, người chơi chỉ ĐƯỢC quyết trong phạm vi endpoint của chính mình. Skill Redis ở L3 là mức 'familiar' nên chỉ đòi hiểu đúng chỗ dùng, không đòi thiết kế phương án cache."
          },
          "setup": "Bạn sửa xong phần batch load, đo ở local còn 180ms. An gợi ý thêm: lịch sử đơn đã đóng thì gần như không đổi, cache được.",
          "npc_line": "An: 'Em thấy sao? Có cache không hay để vậy đã? Nói anh nghe lý do, đừng chỉ nói có hay không.'",
          "options": null,
          "input_prompt": "Trả lời An về chuyện cache.",
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "An: 'Em nghĩ xem trong cái response đó, phần nào thì không bao giờ đổi nữa, phần nào thì vẫn có thể đổi.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 1,
          "followup_goal": "Nếu người chơi chọn cache mà không phân biệt được phần lịch sử đã đóng với đơn đang chạy, hỏi lại đúng chỗ đó. Nếu người chơi chọn không cache, hỏi họ ngưỡng nào thì sẽ cần cache.",
          "closing_prompt": "An: 'Ừ, hợp lý. Em ghi lại vào PR description nhé.'",
          "observes": [
            {
              "skill_type": "hard",
              "skill": "Redis",
              "anchors": {
                "0": "Chốt có hoặc không cache nhưng không nêu được lý do gắn với dữ liệu",
                "+2": "Nêu được ranh giới dữ liệu nào bất biến (lịch sử đã đóng) và đánh đổi kèm theo, dù chọn cache hay chưa cache",
                "-1": "Đề xuất cache toàn bộ response gồm cả đơn đang chạy — dữ liệu sẽ cũ ngay"
              }
            }
          ]
        },
        {
          "activity_id": "a4",
          "type": "FREETEXT",
          "choice_reason": null,
          "summary": "Báo cáo tình hình cho Team Lead",
          "isOrigin": false,
          "forward_to": "END",
          "context": {
            "skills_in_play": [
              "Giải quyết vấn đề"
            ],
            "company_flavour": "Không có quy trình incident report chính thức: một tin nhắn cho lead là toàn bộ thủ tục.",
            "job_scope": "L3 ĐƯỢC tự viết báo cáo và tự đưa mốc thời gian. KHÔNG ĐƯỢC quyết bao giờ deploy lên prod — đó là việc của Linh."
          },
          "setup": "11:15. Fix đã lên staging, p95 về 210ms. Linh nhắn trong nhóm.",
          "npc_line": "Linh: 'Support đang hỏi anh. Em tóm tắt giúp anh: nguyên nhân là gì, đã xử tới đâu, bao giờ lên prod được?'",
          "options": null,
          "input_prompt": "Nhắn lại cho Linh.",
          "quick_action": false,
          "time_limit_seconds": null,
          "hints": [
            {
              "text": "Linh: 'Em cứ viết như đang nói với người không rành kỹ thuật nhé, support họ đọc lại cho khách.'",
              "costs_ceiling": true
            }
          ],
          "limitFollowup": 0,
          "followup_goal": null,
          "closing_prompt": "Linh: 'Rõ rồi. Anh trả lời support đây.'",
          "observes": [
            {
              "skill_type": "soft",
              "skill": "Giải quyết vấn đề",
              "anchors": {
                "0": "Nói đã sửa xong nhưng thiếu mốc thời gian hoặc thiếu nguyên nhân",
                "+2": "Nêu đủ nguyên nhân, trạng thái hiện tại và mốc thời gian, có nói rõ điều gì còn chưa chắc",
                "-1": "Trả lời 'em sửa xong rồi ạ' và hết"
              }
            }
          ]
        }
      ],
      "random_events": [
        {
          "event_id": "re_second_complaint",
          "chance": 0.3,
          "after_activity": "a2",
          "condition": null,
          "text": "Linh forward vào nhóm một phàn nàn nữa, lần này từ khách khác: 'app quay mãi không vào được lịch sử đơn'. Trong hai phút có thêm ba tin nhắn tương tự.",
          "outcome": "DIVERT",
          "divert_note": "An trấn: 'Cùng một nguyên nhân thôi, chưa phải chuyện mới. Em cứ làm nốt phần đang dở, đừng nhảy sang cái khác.' Kéo người chơi về b3 mà không mở nhánh điều tra mới.",
          "early_ending_id": null
        },
        {
          "event_id": "re_escalate",
          "chance": 0.35,
          "after_activity": "a3",
          "condition": {
            "min_plus2": null,
            "max_minus1": null,
            "min_minus1": 2
          },
          "text": "10:50. Service thanh toán bắt đầu timeout theo, vì nó gọi sang chính endpoint này. Incident được nâng cấp lên mức toàn hệ thống. An mở laptop, không nói gì thêm, và bắt đầu tự đọc log.",
          "outcome": "EARLY_END",
          "divert_note": null,
          "early_ending_id": "e_bad"
        }
      ],
      "endings": [
        {
          "ending_id": "e_root_cause",
          "type": "SECRET",
          "priority": 1,
          "condition": {
            "min_plus2": 2,
            "max_minus1": 0,
            "extra": "Người chơi tự nêu ra rằng endpoint này không có giới hạn dữ liệu đầu vào, nên bất kỳ tài khoản nào tích đủ đơn cũng sẽ gây lại sự cố — tức nhìn ra đây là lỗi thiết kế chờ sẵn chứ không phải sự cố của riêng sáng nay. Nêu ở a2, a3 hoặc a4 đều tính, kể cả khi nêu trong một lượt follow-up."
          },
          "text": "Fix lên prod lúc 11:40. Chiều đó Linh nhắn riêng: 'Cái ý em nói về việc không giới hạn dữ liệu ấy, anh nghĩ đúng. Em mở giúp anh một ticket, tuần sau mình bàn.' Ba tuần sau, một khách sỉ khác có 2000 đơn — và lần này không ai phải sửa gì cả.",
          "reveals": "Sự cố hôm nay không phải là vấn đề. Nó là triệu chứng của một quyết định thiết kế từ ba tuần trước. Người làm nghề lâu năm khác người mới ở chỗ họ hỏi 'còn ai nữa sẽ dính?' trong khi việc đang cháy.",
          "reachable_by_event": false
        },
        {
          "ending_id": "e_good",
          "type": "GOOD",
          "priority": 2,
          "condition": {
            "min_plus2": 3,
            "max_minus1": 0,
            "extra": null
          },
          "text": "Fix lên prod trước giờ cao điểm. Linh trả lời support được bằng chính lời tóm tắt của bạn. An ghi chú lại case này cho buổi retro.",
          "reveals": null,
          "reachable_by_event": false
        },
        {
          "ending_id": "e_partial_slow",
          "type": "PARTIAL",
          "priority": 3,
          "condition": {
            "min_plus2": 2,
            "max_minus1": 1,
            "extra": null
          },
          "text": "Fix kịp, nhưng tới 12:30 mới xong. Support đã phải gửi lời xin lỗi tới vài khách. Không ai trách bạn — Linh chỉ hỏi một câu ở retro: 'lần sau mình biết sớm hơn bằng cách nào?' và câu đó dành cho cả team, không riêng bạn.",
          "reveals": null,
          "reachable_by_event": false
        },
        {
          "ending_id": "e_partial_borrowed",
          "type": "PARTIAL",
          "priority": 4,
          "condition": {
            "min_plus2": 1,
            "max_minus1": null,
            "extra": null
          },
          "text": "Việc xong, nhưng phần lớn là An làm. Bạn hiểu vấn đề sau khi An chỉ ra, không phải trước đó. Trong retro tên bạn được nhắc tới như người báo sự cố, chứ không phải người xử lý nó.",
          "reveals": null,
          "reachable_by_event": false
        },
        {
          "ending_id": "e_bad",
          "type": "BAD",
          "priority": 5,
          "condition": {
            "min_plus2": null,
            "max_minus1": null,
            "extra": null
          },
          "text": "An tiếp quản và xử lý nốt. Câu trả lời gửi cho support là của An chứ không phải của bạn. Không ai nói gì nặng, nhưng buổi chiều đó bạn ngồi đọc lại đúng đoạn log mà lẽ ra nên đọc lúc 9:40.",
          "reveals": null,
          "reachable_by_event": true
        }
      ],
      "evidence_level": "A_VERIFIED",
      "coverage_note": "Fallback tier 1. Neo trực tiếp vào tasks[2] ('Tối ưu hóa các API bị chậm') và skills của chính band L3 trong 9_roles_tier1_pass2.json, không mượn band nào khác. Level gốc là A_VERIFIED (evidence_company: VNG Corporation, evidence_title_observed: Backend Software Engineer). Phủ toàn bộ skills_soft[] của level ('Giải quyết vấn đề', 'Làm việc độc lập') và cả 2 skills_hard đã khai ('RESTful API Design', 'Redis'). Bộ scenario đầy đủ của job này gồm 3 archetype đang mở ở L3 (S_EXEC, S_AMBIG, S_INCIDENT); file này là S_INCIDENT. Ngân sách A7: 1 CHOICE + 3 FREETEXT + 3 follow-up = 1 + 6 + 4.5 + 2 = 13.5 phút, ghi 13.",
      "unknowns": [
        "Không có JD nào nói rõ junior backend tại VN có được tự quyết định thêm cache hay không. Activity a3 đặt An làm người gợi ý để tránh đẩy quyền quyết định vượt band; nếu thu thập được JD nói khác thì phải chỉnh lại beat này.",
        "Các con số p95 200ms/4.2s, 900 đơn, 180ms, 210ms là minh hoạ hợp lý về mặt kỹ thuật, KHÔNG lấy từ dữ liệu vận hành của bất kỳ công ty thật nào.",
        "Hệ số ngân sách thời lượng (FREETEXT 2 phút / CHOICE 1 phút / follow-up 1.5 phút / +2 phút đọc) là ước lượng chưa đo trên người chơi thật. estimated_minutes: 13 cần được kiểm lại bằng bấm giờ thực tế.",
        "Ngưỡng min_plus2 của các ending (3 cho GOOD, 2 cho PARTIAL) đặt theo cảm tính trên tổng 4 mốc khả dĩ. Ngưỡng 3 khá sát trần: người chơi phải đạt +2 ở 3 trong 4 chỗ quan sát mới vào được GOOD, và ai dùng hint ở hai beat trở lên thì gần như không thể đạt vì hint hạ trần beat đó xuống 0. Cần hiệu chỉnh sau khi có phân bố thật.",
        "Chưa rõ tỉ lệ người chơi L3 thật sự nhìn ra được điều kiện của ending SECRET, nhất là khi nó phụ thuộc vào việc follow-up của a2 có được kích hoạt hay không.",
        "30 giây của beat quick_action a1 là ước lượng. Nếu tỉ lệ timeout vượt khoảng 15% khi có người chơi thật thì phải nới, vì lúc đó đồng hồ đang phạt người đọc chậm chứ không phạt người thiếu phản xạ.",
        "Xác suất 0.3 và 0.35 của hai random event đặt theo cảm tính. Chưa rõ tần suất này khiến lượt chơi thấy sống động hay thấy nhiễu.",
        "job.user_context là bối cảnh TĨNH viết sẵn trong file, chưa nối với lịch sử chơi thật của người dùng. Phần động đã được hoãn — xem mục CÒN THIẾU của spec."
      ]
    }
  }
};
