/**
 * Thư viện câu hỏi có/không của AI-5 cho ca làm: 7 nhóm, 43 mục con (D-143), 13 cờ chung.
 *
 * Chép từ `occupation-data/specs/spec-checklist-softskill.md` (bản v4.1, sau QA
 * lần 3, chờ DE kiểm). Câu chữ từng câu hỏi là suy luận của nhóm, chưa DE duyệt.
 * `checklist.spec.ts` đọc lại file spec và so khớp từng ô, nên sửa spec thì phải
 * sửa file này theo.
 *
 * Nhóm nhận phạt của mỗi cờ theo bảng Phúc chốt 5/11 (spec, mục "Cờ chung").
 */

export const SOFT_GROUP_NUMBERS = [1, 2, 3, 4, 5, 6, 7] as const;
export type SoftGroupNo = (typeof SOFT_GROUP_NUMBERS)[number];

export interface ChecklistGroup {
  no: SoftGroupNo;
  name: string;
}

export const CHECKLIST_GROUPS: readonly ChecklistGroup[] = [
  { no: 1, name: 'Giao tiếp & hợp tác' },
  { no: 2, name: 'Trí tuệ cảm xúc & xử lý xung đột' },
  { no: 3, name: 'Lãnh đạo & tư duy kinh doanh' },
  { no: 4, name: 'Tư duy & giải quyết vấn đề' },
  { no: 5, name: 'Tự quản lý & chịu áp lực' },
  { no: 6, name: 'Thích ứng & học hỏi' },
  { no: 7, name: 'Đạo đức & chuyên nghiệp' },
];

export const FLAG_CODES = [
  'C1',
  'C2',
  'C3',
  'C4',
  'C5',
  'C6',
  'C7',
  'C8',
  'C9',
  'C10',
  'C11',
  'C12',
  'C13',
] as const;
export type FlagCode = (typeof FLAG_CODES)[number];

export interface ChecklistFlag {
  code: FlagCode;
  behaviour: string;
  /** Cột "Không tính khi". */
  except: string;
  /** Nhóm nhận phạt (spec, "Mỗi cờ có một nhóm nhận phạt"). */
  group: SoftGroupNo;
}

export const CHECKLIST_FLAGS: readonly ChecklistFlag[] = [
  {
    code: 'C1',
    behaviour: 'Xúc phạm, hạ thấp năng lực hay giá trị của người khác',
    except:
      'Lời cộc, giục, ra lệnh thẳng. Gạt cảm xúc ("khóc gì") tính C11. Xúc phạm dựa trên nhóm người tính C12',
    group: 2,
  },
  {
    code: 'C2',
    behaviour:
      'Chế giễu, đùa trên lưng người khác, nói kẻ cả ("cái này dễ mà cũng không biết")',
    except: 'Giục, yêu cầu thẳng ("đừng làm chậm tụi em")',
    group: 2,
  },
  {
    code: 'C3',
    behaviour: 'Đổ phần lỗi của mình cho người khác',
    except:
      'Nêu phần của người khác **kèm** nhận phần mình gắn với một việc cụ thể ("em sai rồi" chung chung không đủ)',
    group: 7,
  },
  {
    code: 'C4',
    behaviour:
      'Bịa điều chưa xảy ra: khẳng định một dữ kiện, số liệu, kết quả hay việc đã làm mà không có nguồn nào trong màn, hoặc trái với điều người chơi đã biết',
    except:
      'Nói nhẹ đi một sự cố đã biết tính C5. Nói có rào ("có thể"). Lặp lại kết quả của công cụ hay người khác mà chưa kiểm (chấm ở 4.6, 4.7)',
    group: 7,
  },
  {
    code: 'C5',
    behaviour:
      'Che hoặc nói nhẹ đi một lỗi, sự cố hay vi phạm người chơi **đã biết** (con số, phạm vi), kể cả nói "không có gì", "đều đúng quy trình"',
    except: 'Rào đón lịch sự ("hơi có vấn đề tí") khi chưa biết mức thật',
    group: 7,
  },
  {
    code: 'C6',
    behaviour: 'Lộ thông tin bí mật cho người hay công cụ không có quyền',
    except:
      'Người chơi không có cách biết thông tin là bí mật (không nhãn, không quy định đã nghe)',
    group: 7,
  },
  {
    code: 'C7',
    behaviour:
      'Hứa chắc chắn một kết quả chưa chắc làm được; hoặc tới mốc đã hứa mà không làm và không báo',
    except: 'Rào đón "dạ chắc…", "em cố…"',
    group: 7,
  },
  {
    code: 'C8',
    behaviour: 'Làm trái một quy định mà người chơi **đã được nghe** trong màn',
    except: 'Người chơi chưa từng được nghe quy định',
    group: 7,
  },
  {
    code: 'C9',
    behaviour:
      'Từ chối một yêu cầu hợp lý thuộc vai mình ("không phải việc của em")',
    except: 'Từ chối việc ngoài vai, giữ bí mật, từ chối quà đúng mực',
    group: 1,
  },
  {
    code: 'C10',
    behaviour: 'Đe doạ, gây sức ép',
    except: '',
    group: 2,
  },
  {
    code: 'C11',
    behaviour:
      'Gạt người khác ra: nói chen, phớt lờ câu hỏi, gạt cảm xúc hay mối lo của họ ("khóc gì", "kệ ổng", "đừng hỏi nữa")',
    except: 'Có trả lời vào mối lo, dù lý do yếu (chấm ở mục con)',
    group: 2,
  },
  {
    code: 'C12',
    behaviour: 'Rập khuôn, phân biệt đối xử (tuổi, giới, vùng miền…)',
    except: '',
    group: 2,
  },
  {
    code: 'C13',
    behaviour: 'Nhận công người khác, lừa người khác để mình có lợi',
    except:
      'Nhận quà, tiền trái quy định đã nghe tính C8. Che giấu khi báo cáo tính C4 hoặc C5',
    group: 7,
  },
];

export interface ChecklistItem {
  /** Mã mục con "nhóm.số", ví dụ "7.1". */
  sub: string;
  group: SoftGroupNo;
  name: string;
  /** Cột "Xét khi". */
  when: string;
  /** Hành vi lõi: có A thì mức 1. */
  A: string;
  B: string;
  C: string;
  /** Cột "Cờ": cờ hay gặp của mục con, dùng cho luật ép về 0. */
  flags: readonly FlagCode[];
}

export const CHECKLIST_ITEMS: readonly ChecklistItem[] = [
  {
    sub: '1.1',
    group: 1,
    name: 'Viết rõ ràng, ngắn gọn',
    when: 'Nút email/báo cáo, hoặc tin nhắn báo cáo gửi người khác',
    A: 'Trong hai câu đầu (không tính chào hỏi, xưng hô, xin lỗi làm phiền) có nêu điều chính?',
    B: 'Có nói rõ người nhận cần làm gì?',
    C: 'Có kèm con số hay bằng chứng cụ thể cho điều chính?',
    flags: ['C4'],
  },
  {
    sub: '1.2',
    group: 1,
    name: 'Giải thích cho người không chuyên',
    when: 'Người chơi giải thích một điều chuyên môn cho người khác chuyên môn (không giải thích gì thì không xét)',
    A: 'Điều chính có được nói bằng lời người không chuyên hiểu được?',
    B: 'Có nói vấn đề ảnh hưởng gì tới chính người đó?',
    C: 'Có dùng ví dụ hoặc so sánh quen thuộc?',
    flags: [],
  },
  {
    sub: '1.3',
    group: 1,
    name: 'Lắng nghe chủ động, hỏi làm rõ',
    when: 'Có người đưa thông tin, yêu cầu, phàn nàn chưa rõ',
    A: 'Có hỏi ít nhất một câu để làm rõ điều người kia nói hoặc cần?',
    B: 'Có nhắc lại hoặc tóm ý người kia để xác nhận?',
    C: 'Có hỏi tiếp dựa trên câu trả lời vừa nhận?',
    flags: [],
  },
  {
    sub: '1.4',
    group: 1,
    name: 'Phối hợp đồng đội, liên phòng ban',
    when: 'Việc cần người/nhóm khác tham gia',
    A: 'Có nhờ đúng người/nhóm nắm việc làm một việc cụ thể?',
    B: 'Có thống nhất lúc cần xong (giờ, ngày, hoặc mốc tương đối như "trước khi deploy")? Chỉ nói việc dùng cho dịp nào ("cho đêm thứ Sáu") chưa tính',
    C: 'Có chia rõ phần mình làm và phần họ làm?',
    flags: ['C9'],
  },
  {
    sub: '1.5',
    group: 1,
    name: 'Chia sẻ thông tin, cập nhật đúng lúc',
    when: 'Tình hình thay đổi, hoặc có người đang chờ kết quả',
    A: 'Có chủ động báo cập nhật cho người đang chờ?',
    B: 'Có nói hiện trạng cụ thể (đã xong gì hoặc còn gì)?',
    C: 'Có hẹn mốc cập nhật tiếp?',
    flags: ['C5'],
  },
  {
    sub: '1.6',
    group: 1,
    name: 'Hỗ trợ đồng nghiệp',
    when: 'Đồng nghiệp gặp khó hoặc nhờ giúp',
    A: 'Có đưa một giúp đỡ cụ thể (thông tin, cách làm, thời gian)?',
    B: 'Có hỏi họ đang vướng ở đâu trước khi giúp?',
    C: 'Có hỏi lại đã ổn chưa?',
    flags: ['C9'],
  },
  {
    sub: '2.1',
    group: 2,
    name: 'Đồng cảm',
    when: 'Người kia bày tỏ lo lắng, khó chịu, áp lực',
    A: 'Có ghi nhận cảm xúc hoặc mối lo của họ?',
    B: 'Có nói ra điều họ đang sợ, hoặc đang chờ được nghe?',
    C: 'Có chỉnh đề xuất để gỡ đúng mối lo đó?',
    flags: [],
  },
  {
    sub: '2.2',
    group: 2,
    name: 'Kiểm soát cảm xúc',
    when: 'Bị chỉ trích, nói nặng, tình huống căng',
    A: 'Có đáp lại bằng lời lẽ bình tĩnh, tập trung vào vấn đề?',
    B: 'Có đưa hướng xử lý?',
    C: 'Có thêm bước chủ động (hẹn trao đổi riêng, hẹn cập nhật)?',
    flags: [],
  },
  {
    sub: '2.3',
    group: 2,
    name: 'Xử lý bất đồng, hoà giải',
    when: 'Seed dựng hai ý kiến trái nhau',
    A: 'Có nói ra chỗ hai bên khác nhau?',
    B: 'Có hỏi hoặc nhắc lý do của bên kia?',
    C: 'Có đề xuất phương án hoặc tiêu chí chung để chọn?',
    flags: [],
  },
  {
    sub: '2.4',
    group: 2,
    name: 'Cho feedback xây dựng',
    when: 'Người chơi cần góp ý người khác',
    A: 'Có chỉ ra một việc cụ thể cần sửa?',
    B: 'Có nói ảnh hưởng của việc đó?',
    C: 'Có gợi ý cách cải thiện?',
    flags: [],
  },
  {
    sub: '2.5',
    group: 2,
    name: 'Nhận feedback',
    when: 'Người chơi nhận góp ý',
    A: 'Có ghi nhận nội dung góp ý (nhắc lại hoặc thừa nhận điểm được góp, không chỉ "dạ vâng")?',
    B: 'Có hỏi lại để hiểu rõ?',
    C: 'Có nêu một việc cụ thể sẽ đổi (bước, công cụ, thời điểm)?',
    flags: ['C3'],
  },
  {
    sub: '2.6',
    group: 2,
    name: 'Nhạy cảm với khác biệt',
    when: 'Người đối diện khác vai trò, tuổi, văn hoá, chuyên môn, hoặc có nhu cầu riêng',
    A: 'Có đổi cách nói hoặc cách làm cho hợp một đặc điểm cụ thể của người đó (tuổi, vai trò, chuyên môn, nhu cầu)? Xưng hô lễ phép thông thường không đủ',
    B: 'Có hỏi hoặc tính tới nhu cầu riêng của họ?',
    C: 'Có đổi cách làm hoặc kênh liên lạc cho hợp?',
    flags: [],
  },
  {
    sub: '2.7',
    group: 2,
    name: 'Xây dựng và giữ quan hệ',
    when: 'Sau khi được giúp, hoặc sau một va chạm',
    A: 'Có cảm ơn hoặc ghi nhận cụ thể việc người kia đã làm?',
    B: 'Có hỏi han tình hình của họ?',
    C: 'Có đề nghị giúp lại hoặc hẹn phối hợp tiếp?',
    flags: ['C13'],
  },
  {
    sub: '3.1',
    group: 3,
    name: 'Ra quyết định, chịu trách nhiệm',
    when: 'Cần chọn hướng trong phạm vi được quyết',
    A: 'Có chọn một hướng rõ ràng?',
    B: 'Có nêu lý do gắn với thông tin trong màn?',
    C: 'Có nói sẽ theo dõi hệ quả thế nào?',
    flags: ['C3'],
  },
  {
    sub: '3.2',
    group: 3,
    name: 'Giao việc, dẫn dắt, mentor',
    when: 'Có người cần hướng dẫn hoặc việc để giao (thường L4+)',
    A: 'Có giao một việc cụ thể kèm kết quả mong đợi?',
    B: 'Có nói hạn hoặc mức ưu tiên?',
    C: 'Có hướng dẫn cách làm hoặc hẹn kiểm tra giữa chừng?',
    flags: ['C13'],
  },
  {
    sub: '3.3',
    group: 3,
    name: 'Thuyết phục, đàm phán, stakeholder',
    when: 'Cần người khác đồng ý, hoặc lợi ích các bên khác nhau',
    A: 'Có trả lời khúc mắc hoặc phản đối của người kia bằng thông tin, lý do hay phương án nhắm vào đúng khúc mắc đó? Chỉ gọi tên hay ghi nhận khúc mắc ("em hiểu anh lo…") chưa đủ',
    B: 'Có nêu lý do gắn với điều họ quan tâm?',
    C: 'Có đưa nhượng bộ, phương án khác hoặc bước nhỏ để đi tới đồng ý?',
    flags: ['C7'],
  },
  {
    sub: '3.4',
    group: 3,
    name: 'Chi phí – lợi ích – rủi ro',
    when: 'Có từ hai cách làm, hoặc cách làm có rủi ro',
    A: 'Có nêu một rủi ro hoặc chi phí của phương án mình chọn?',
    B: 'Có nêu cách giảm rủi ro đó?',
    C: 'Có so phương án đó với một phương án khác về lợi và hại?',
    flags: [],
  },
  {
    sub: '3.5',
    group: 3,
    name: 'Hiểu khách hàng, giá trị kinh doanh',
    when: 'Việc ảnh hưởng khách, người dùng, doanh thu',
    A: 'Có hỏi khách vì sao cần, hoặc dùng vào việc gì?',
    B: 'Có nói lại nhu cầu của khách bằng lời mình và hỏi khách xác nhận?',
    C: 'Có đề xuất xếp ưu tiên theo giá trị với khách?',
    flags: ['C7'],
  },
  {
    sub: '3.6',
    group: 3,
    name: 'Chiến lược dài hạn',
    when: 'Quyết định có hệ quả về sau',
    A: 'Có nhắc một hệ quả sau màn này?',
    B: 'Có phân biệt chữa cháy trước mắt với sửa lâu dài?',
    C: 'Có đề xuất một việc cho lâu dài?',
    flags: [],
  },
  {
    sub: '4.1',
    group: 4,
    name: 'Tư duy phản biện',
    when: 'Có giả định, kết luận vội, thông tin chưa kiểm',
    A: 'Có chỉ ra một giả định hoặc kết luận chưa có bằng chứng?',
    B: 'Có hỏi hoặc tìm bằng chứng cho nó?',
    C: 'Có nêu một khả năng khác?',
    flags: [],
  },
  {
    sub: '4.2',
    group: 4,
    name: 'Phân tích, nguyên nhân gốc',
    when: 'Có sự cố hay kết quả bất thường',
    A: 'Có nêu một nguyên nhân cụ thể kèm một dữ kiện trong màn ủng hộ nó?',
    B: 'Có loại một khả năng khác bằng dữ kiện?',
    C: 'Có nêu cách kiểm để chắc chắn nguyên nhân?',
    flags: ['C4'],
  },
  {
    sub: '4.3',
    group: 4,
    name: 'Đề xuất, so sánh giải pháp',
    when: 'Cần chọn cách xử lý',
    A: 'Có đưa ít nhất hai cách xử lý làm được với nguồn lực trong màn?',
    B: 'Có so các cách theo một tiêu chí?',
    C: 'Có nêu khi nào nên đổi sang cách kia?',
    flags: [],
  },
  {
    sub: '4.4',
    group: 4,
    name: 'Sáng tạo',
    when: 'Cách quen không dùng được, hoặc màn để ngỏ',
    A: 'Có đề xuất một cách khác các cách đã nêu trong màn và làm được với nguồn lực có?',
    B: 'Có nêu cách thử nhỏ để kiểm?',
    C: 'Có nêu rủi ro của cách mới?',
    flags: [],
  },
  {
    sub: '4.5',
    group: 4,
    name: 'Tư duy hệ thống',
    when: 'Thay đổi có thể ảnh hưởng chỗ khác',
    A: 'Có nhắc một phía khác bị ảnh hưởng và ảnh hưởng đó là gì?',
    B: 'Có đề xuất kiểm ảnh hưởng đó?',
    C: 'Có báo hoặc đề nghị báo cho phía đó?',
    flags: [],
  },
  {
    sub: '4.6',
    group: 4,
    name: 'Thu thập, kiểm chứng thông tin, công cụ số',
    when: 'Cần thông tin để quyết định',
    A: 'Có lấy thông tin từ một nguồn trong màn trước khi kết luận (câu hỏi hoặc mã hành động)?',
    B: 'Có đối chiếu hai nguồn hoặc kiểm lại trước khi dùng?',
    C: 'Có nói rõ thông tin nào còn thiếu hoặc chưa chắc?',
    flags: ['C4'],
  },
  {
    sub: '4.7',
    group: 4,
    name: 'Dùng AI hiệu quả, có trách nhiệm',
    when: 'Màn có công cụ AI hoặc tình huống dùng AI',
    A: 'Có kiểm lại kết quả AI trước khi dùng?',
    B: 'Có nói rõ việc mình giao cho AI?',
    C: 'Có nêu một chỗ kết quả AI chưa đáng tin hay chưa có bằng chứng, hoặc dữ liệu không được đưa vào AI?',
    flags: ['C6'],
  },
  {
    sub: '5.1',
    group: 5,
    name: 'Quản lý thời gian, ưu tiên',
    when: 'Nhiều việc cùng lúc hoặc ít thời gian',
    A: 'Có chọn việc làm trước và nói lý do?',
    B: 'Có gọi tên ít nhất một việc sẽ hoãn hoặc nhờ người khác? "Mấy cái còn lại làm sau" chưa tính',
    C: 'Có báo người bị ảnh hưởng bởi việc hoãn?',
    flags: [],
  },
  {
    sub: '5.2',
    group: 5,
    name: 'Tổ chức, lập kế hoạch',
    when: 'Việc có nhiều bước',
    A: 'Có nêu các bước theo thứ tự?',
    B: 'Có gắn bước với mốc thời gian?',
    C: 'Có nêu một bước kiểm kết quả (ví dụ kiểm health-check) hoặc một phương án dự phòng khi hỏng?',
    flags: [],
  },
  {
    sub: '5.3',
    group: 5,
    name: 'Chủ động',
    when: 'Có việc cần làm chưa ai giao hay nhắc',
    A: 'Có tự làm hoặc đề nghị làm một việc phục vụ mục tiêu mà chưa ai giao?',
    B: 'Có báo người liên quan về việc mình chủ động làm?',
    C: 'Có nêu một rủi ro mình phát hiện trước khi ai hỏi?',
    flags: ['C9'],
  },
  {
    sub: '5.4',
    group: 5,
    name: 'Cẩn thận, chú ý chi tiết',
    when: 'Seed có chi tiết dễ sót',
    A: 'Có nêu một chi tiết quan trọng mà chưa ai trong màn nhắc tới (con số, điều kiện, sai sót)?',
    B: 'Có kiểm lại hoặc đề nghị kiểm lại trước khi gửi hay làm?',
    C: 'Có sửa hoặc báo chỗ sai đó cho người liên quan?',
    flags: ['C4'],
  },
  {
    sub: '5.5',
    group: 5,
    name: 'Làm việc dưới deadline, áp lực',
    when: 'Seed đánh dấu hạn chót **chặt** (không đủ thời gian làm hết)',
    A: 'Khi quyết định, có chọn việc hoặc phạm vi làm kịp trước hạn?',
    B: 'Có báo sớm nếu thấy không kịp, kèm phương án?',
    C: 'Có để lại kế hoạch cho phần chưa kịp?',
    flags: ['C7'],
  },
  {
    sub: '5.6',
    group: 5,
    name: 'Tự chịu trách nhiệm việc mình',
    when: 'Việc thuộc phần người chơi phụ trách',
    A: 'Có nhận việc là của mình?',
    B: 'Có theo tới khi xong hoặc bàn giao rõ?',
    C: 'Có nêu một việc cụ thể sẽ làm khác lần sau?',
    flags: ['C3', 'C9'],
  },
  {
    sub: '6.1',
    group: 6,
    name: 'Linh hoạt khi kế hoạch đổi',
    when: 'Yêu cầu hoặc kế hoạch đổi giữa màn',
    A: 'Có điều chỉnh việc của mình theo thay đổi?',
    B: 'Có nói thay đổi ảnh hưởng gì tới hạn hoặc việc khác?',
    C: 'Có báo cho người bị ảnh hưởng (ngoài người đưa ra thay đổi) và nói rõ điều đã đổi?',
    flags: ['C9'],
  },
  {
    sub: '6.2',
    group: 6,
    name: 'Xử lý mơ hồ, thiếu thông tin',
    when: 'Thông tin chưa đủ để chắc',
    A: 'Có nói rõ điều gì còn chưa biết?',
    B: 'Có hỏi hoặc tìm thêm để bớt mơ hồ?',
    C: 'Có đưa một bước làm tạm an toàn trong lúc chờ?',
    flags: ['C4'],
  },
  {
    sub: '6.3',
    group: 6,
    name: 'Học nhanh, tự học',
    when: 'Màn đưa kiến thức, công cụ, quy trình mới',
    A: 'Có dùng đúng thông tin mới mà màn cung cấp?',
    B: 'Có hỏi hoặc tra thêm khi chưa hiểu?',
    C: 'Ở một bước sau, có làm theo một nội dung cụ thể khác của điều mới học, mà câu trích hoặc mã hành động chỉ ra được nội dung đó? Lặp lại đúng việc đã làm chưa tính',
    flags: [],
  },
  {
    sub: '6.4',
    group: 6,
    name: 'Cởi mở với phản hồi, sửa sai',
    when: 'Được chỉ ra sai hoặc nhận phản hồi trái ý',
    A: 'Có sửa cách làm theo phản hồi (thấy ở câu trả lời hoặc hành động sau đó)?',
    B: 'Có hỏi thêm để hiểu vì sao sai?',
    C: 'Có nêu một việc cụ thể để lần sau không lặp lại?',
    flags: ['C3'],
  },
  {
    sub: '6.5',
    group: 6,
    name: 'Phục hồi sau thất bại',
    when: 'Sau kết quả xấu hoặc sai sót trong màn',
    A: 'Có tiếp tục xử lý sau sai sót?',
    B: 'Có nêu một điều rút ra cụ thể?',
    C: 'Có đổi bước tiếp theo dựa trên điều rút ra?',
    flags: ['C3'],
  },
  {
    sub: '7.1',
    group: 7,
    name: 'Trung thực, nhận lỗi, báo sớm',
    when: 'Có lỗi hay sự cố',
    A: 'Có báo cho người liên quan về lỗi hoặc sự cố?',
    B: 'Có chỉ ra phần nào thuộc việc mình (nói vòng lịch sự vẫn tính nếu chỉ ra được phần việc)?',
    C: 'Có nêu một việc cụ thể để sửa hoặc để không lặp lại?',
    flags: ['C3', 'C4', 'C5'],
  },
  {
    sub: '7.2',
    group: 7,
    name: 'Giữ bí mật',
    when: 'Có người hỏi hoặc có dịp lộ thông tin hạn chế',
    A: 'Có từ chối, hoặc chuyển yêu cầu sang người có quyền trả lời?',
    B: 'Có nêu lý do gắn với bảo mật hay quy định?',
    C: 'Có chỉ cho người hỏi cách hợp lệ để có thông tin?',
    flags: ['C6'],
  },
  {
    sub: '7.3',
    group: 7,
    name: 'Tuân thủ quy trình',
    when: 'Màn đã nêu quy định và người chơi đã được nghe',
    A: 'Có làm hoặc xin làm bước bắt buộc **trước** hành động mà quy định nhắm tới?',
    B: 'Có nêu cách làm đúng quy định mà vẫn kịp mục tiêu?',
    C: 'Khi quy định cản mục tiêu, có xin ngoại lệ đúng kênh thay vì tự bỏ qua?',
    flags: ['C8'],
  },
  {
    sub: '7.4',
    group: 7,
    name: 'Đáng tin cậy, giữ lời hứa',
    when: 'Người chơi đưa ra cam kết',
    A: 'Cam kết có nói rõ làm gì và khi nào?',
    B: 'Có nói điều kiện hoặc giới hạn của việc mình kiểm soát được (rào "dạ chắc" không tính là điều kiện)?',
    C: 'Có nói sẽ báo lại thế nào nếu không kịp?',
    flags: ['C7'],
  },
  {
    sub: '7.5',
    group: 7,
    name: 'Ranh giới, ứng xử đúng mực',
    when: 'Yêu cầu ngoài vai, quà, sức ép, người đối diện thô',
    A: 'Có giữ giới hạn (từ chối quà, việc ngoài vai, sức ép trái quy định) bằng lời lẽ tôn trọng? Nhận lễ phép không tính',
    B: 'Có nói lý do gắn với vai trò hay quy định, bằng lời dễ hiểu?',
    C: 'Có chỉ đường đúng để xử lý?',
    flags: ['C8', 'C10'],
  },
  {
    sub: '7.6',
    group: 7,
    name: 'Cân nhắc tác động đạo đức',
    when: 'Quyết định ảnh hưởng người khác',
    A: 'Có nêu người hoặc nhóm bị ảnh hưởng và tác hại hay lợi ích cụ thể cho họ?',
    B: 'Có so hai phương án theo tác hại đó?',
    C: 'Có chọn phương án ít hại hơn và nói vì sao?',
    flags: ['C13'],
  },
];

/** Mỗi màn chỉ chọn một mục trong mỗi nhóm trùng (spec, "Luật trùng"). */
export const OVERLAP_GROUPS: ReadonlyArray<readonly string[]> = [
  ['7.1', '5.6'],
  ['2.5', '6.4', '2.2'],
  ['3.1', '4.3'],
  ['3.6', '4.5'],
  ['1.3', '3.5'],
  ['7.2', '7.5'],
  ['1.2', '2.6'],
  ['7.4', '5.5'],
  ['4.1', '4.7'],
];

/** Cờ nặng: ép về 0 ở đoạn chứa câu vi phạm (spec, "Ép về 0"). */
export const HARD_FLAGS: readonly FlagCode[] = ['C4', 'C5', 'C6', 'C8'];

const ITEM_BY_SUB = new Map(CHECKLIST_ITEMS.map((i) => [i.sub, i]));
const FLAG_BY_CODE = new Map(CHECKLIST_FLAGS.map((f) => [f.code, f]));

export const checklistItem = (sub: string): ChecklistItem | undefined =>
  ITEM_BY_SUB.get(sub);
export const checklistFlag = (code: string): ChecklistFlag | undefined =>
  FLAG_BY_CODE.get(code as FlagCode);
export const isFlagCode = (code: string): code is FlagCode =>
  FLAG_BY_CODE.has(code as FlagCode);
