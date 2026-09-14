/* SINH TU DONG — dung sua tay. Sinh lai: node docs/data/build.mjs */

window.SCENARIO_FILES = {
  /* occupation-data/scenarios/SWE_BACKEND/L1_S_EXEC.json */
  "SWE_BACKEND_L1_S_EXEC": {
    "_meta": {
      "spec_version": "scenario-2.2",
      "generated_at": "2026-09-14",
      "source_dataset": "9_roles_tier1_pass2.json",
      "fallback_tier": 2,
      "golden_used": [
        "scenario-golden/SWE_BACKEND_L3.json"
      ],
      "note": "Kịch bản mở màn của nghề Back-end. Cố ý phủ cả bốn loại activity (PRIORITIZING, CHOICE, ORDERING, FREETEXT) vì L1 là chỗ các loại đóng hợp lý nhất — intern nhận việc đã chia sẵn, phần lớn quyết định là chọn và sắp xếp trong phạm vi đã giới hạn."
    },
    "scenario_title": "Tham gia fix các bug mức độ ưu tiên thấp",
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

  /* occupation-data/scenario-golden/SWE_BACKEND_L3.json */
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
  },

};
