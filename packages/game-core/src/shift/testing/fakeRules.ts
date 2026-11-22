/** Deterministic dialogue and checks for seed walkthroughs in development and tests. */
import type { Beat } from '../schema.js';
import type { FakeCheckRules, FakeEventRules, FakeScript } from './fakes.js';

const mentor = (
  text: string,
  expression: Beat['expression'] = 'binh_thuong',
): Beat => ({
  speaker: 'mentor',
  text,
  expression,
});
const support = (
  text: string,
  expression: Beat['expression'] = 'binh_thuong',
): Beat => ({
  speaker: 'support',
  text,
  expression,
});

const lunchTalk = ['căn tin', 'trà sữa', 'trưa nay ăn gì', 'trưa ăn gì'];

export const FAKE_SCRIPTS: Record<string, FakeScript> = {
  'SWE_BACKEND.L3.m2': {
    replies: {
      mentor: [
        {
          when: ['sao a nghĩ là DB quá tải', 'sao anh nghĩ là DB quá tải'],
          beats: [
            mentor('Anh đoán thôi, giờ này đơn đông mà.', 'suy_nghi'),
            mentor('Anh chưa coi dashboard.'),
          ],
        },
        {
          when: ['API hỏi CSDL 901 lần', '900 đơn mà hỏi 901 lần'],
          beats: [
            mentor('900 đơn mà hỏi 901 lần… ờ, khớp.', 'ngac_nhien'),
            mentor('Vậy hổng phải DB rồi.'),
          ],
        },
        {
          when: ['em đổi thành loại'],
          beats: [mentor('Ok.')],
        },
        {
          when: lunchTalk,
          beats: [mentor('Chuyện ăn trưa tính sau nha em. Giờ mình coi vụ lịch sử đơn trước.')],
        },
      ],
      support: [
        {
          when: ['khách phàn nàn gì'],
          beats: [
            support(
              'Trời ơi em, sáng giờ chị nhận ba cuộc rồi á, toàn bên Minh Phát.',
              'lo_lang',
            ),
            support(
              'Nhân viên bếp nói mở lịch sử đơn cứ xoay xoay hoài, bốn năm giây mới hiện.',
              'lo_lang',
            ),
          ],
        },
        {
          when: ['hôm qua có gì thay đổi', 'sao hnay mới bị'],
          beats: [
            support(
              'À, tối qua bên vận hành mới gộp sáu tài khoản chi nhánh của họ làm một, cho dễ xuất hoá đơn.',
              'suy_nghi',
            ),
            support('Sáng nay mới bị vậy đó em.', 'suy_nghi'),
          ],
        },
        {
          when: [
            'khách dùng máy gì',
            'dùng app bản nào',
            'dùng app phiên bản nào',
            'minh phát dùng app gì',
          ],
          beats: [support('Minh Phát dùng app 2.x trên máy tính bảng em ơi.')],
        },
        {
          when: ['lỗi ở API bên em'],
          beats: [
            support(
              'Ủa, vậy là lỗi bên mình hả em? Chị tưởng mạng khách.',
              'ngac_nhien',
            ),
            support('Ừ, vậy 11 rưỡi chị chờ em nha.'),
          ],
        },
        {
          when: ['file em gửi liền'],
          beats: [support('Ừ, chị chờ em nha.')],
        },
        {
          when: ['em có bản sửa chạy thử rồi'],
          beats: [
            support('Ừ… vậy chị ráng giữ khách thêm chút.', 'lo_lang'),
            support('Có tin em báo chị liền nha.'),
          ],
        },
        {
          when: ['có duyệt em báo chị liền'],
          beats: [support('Ừ, nhanh nha em, khách hối quá trời.', 'lo_lang')],
        },
        {
          when: ['gọi báo chị', 'gọi chị như hẹn'],
          beats: [support('Ừ, tới giờ hẹn chị chờ em gọi lại nha.')],
        },
        {
          when: ['nhắn báo chị', 'em nhắn chị'],
          beats: [support('Ừ, chị chờ tin nhắn của em nha.')],
        },
        {
          when: lunchTalk,
          beats: [support('Để trưa rồi tính em ơi. Giờ chị đang chờ tin vụ lịch sử đơn nè.')],
        },
      ],
    },
    fallbackReplies: {
      mentor: [mentor('Ừ, anh nghe rồi. Em cứ kiểm tra vụ lịch sử đơn trước nhé.')],
      support: [support('Ừ, chị nghe nè. Có tin gì về lịch sử đơn thì báo chị nha.')],
    },
    probes: [
      {
        hook: 'Em dựa vào đâu để loại khả năng DB quá tải?',
        beats: [
          mentor('Em dựa vào đâu để loại khả năng DB quá tải?', 'suy_nghi'),
        ],
      },
      {
        hook: 'Mấy cái em để chưa rõ, em tính kiểm bằng gì?',
        beats: [
          mentor('Mấy cái em để chưa rõ, em tính kiểm bằng gì?', 'suy_nghi'),
        ],
      },
      {
        hook: 'Bản này lên rồi, gặp khách có nhiều đơn hơn nữa thì sao em?',
        beats: [
          mentor(
            'Bản này lên rồi, gặp khách có nhiều đơn hơn nữa thì sao em?',
            'suy_nghi',
          ),
        ],
      },
      {
        hook: 'Lên rồi có lỗi thì em làm gì?',
        beats: [mentor('Lên rồi có lỗi thì em làm gì?', 'suy_nghi')],
      },
      {
        hook: 'Lên rồi sao em biết là ổn?',
        beats: [mentor('Lên rồi sao em biết là ổn?', 'suy_nghi')],
      },
    ],
    reactions: {
      n2: [mentor('Số lần hỏi khớp số đơn, anh thấy rồi.')],
      n3: [
        mentor('Anh đọc rồi.'),
        mentor(
          'Anh chỉ sợ lên rồi hỏng chỗ khác, máy khách đủ loại mà.',
          'lo_lang',
        ),
      ],
    },
    defer: [mentor('Để anh coi kỹ đã.', 'suy_nghi')],
  },
};

const productionChecks = [
  'canh log',
  'theo dõi',
  'kiểm tra sau',
  'mở lịch sử dưới',
];
const rollback = ['rollback', 'lùi lại', 'đưa về bản cũ', 'deploy lại bản cũ'];

export const FAKE_RULES: Record<string, FakeCheckRules> = {
  'SWE_BACKEND.L3.m2': {
    support_biet_tim_ra_loi: [
      'lỗi ở API bên em',
      'lỗi bên mình',
      'tìm ra lỗi',
      'đang sửa',
      'sửa xong',
      'thấy lỗi',
    ],
    support_biet_co_ban_sua: [
      'có bản sửa',
      'có bản vá',
      'bản sửa xong',
      'chạy thử rồi',
    ],
    de_support_tin_sai: [
      'lỗi do mạng khách',
      'do mạng bên khách',
      'bản sửa đã lên production',
    ],
    hua_bao_lai: [
      'gọi báo chị',
      'em vẫn gọi chị như hẹn',
      'em gọi chị như hẹn',
      'có duyệt em báo chị',
      'em báo chị',
      'báo lại',
    ],
    hua_chac_trua: ['trưa là xong', 'chắc chắn trưa xong'],
    cho_cau_noi_voi_khach: ['chị nói khách', 'nói với khách là'],
    nguyen_nhan_da_noi_voi_mentor: ['vòng lặp', '901 lần', 'n+1'],
    da_loai_db_bang_chung: ['khách ít đơn', 'không phải db', 'cpu'],
    xin_duyet: ['duyệt giúp', 'anh duyệt cho em', 'cho em đưa lên'],
    'email.co_cach_kiem': productionChecks,
    'email.co_rollback': rollback,
    'n3.co_cach_kiem': productionChecks,
    'n3.co_rollback': rollback,
  },
};

export const FAKE_EVENTS: Record<string, FakeEventRules> = {
  'SWE_BACKEND.L3.m2': {
    'su_kien.duyet': [
      'có duyệt',
      'khi anh An duyệt',
      'khi a An duyệt',
      'được duyệt',
    ],
    'su_kien.staging_ok': ['khi chạy thử', 'staging ổn', 'chạy thử xong'],
  },
};
