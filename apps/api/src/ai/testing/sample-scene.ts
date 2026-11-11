/**
 * Các lượt mẫu theo nhịp (D-130), dựng từ seed SWE_BACKEND.L3.m2 bản 4
 * (`research/reports/Seed mẫu Back-end L3 m2.md`). Dùng cho test và
 * `narrator-try`; không phải engine.
 *
 * Phần engine phải làm (Luật dẫn truyện phần B) ở đây làm tay, theo đúng luật:
 * - Slot điền bằng lá thật của Hồ sơ NPC v1.0: mentor là XVIII Sang (cấp
 *   trên), support là VIII Thương (phòng ban khác). Seed bản 4 còn ghi tên
 *   "anh An", "chị Linh", trước khi Hồ sơ NPC chốt "seed khai vai, không khai
 *   người" (mục 8); tên trong lời canon và hook đổi theo lá được điền.
 * - Thẻ chỉ có dữ kiện slot biết (C2). Dữ kiện `ai_only` mà mentor biết
 *   (f7, f8) có trong thẻ mentor, ghi rõ chỉ xác nhận khi người chơi tự nói ra.
 * - Khúc mắc `hold_until` chưa tới và dữ kiện `reserved_for` nút chưa tới thì
 *   không có trong thẻ, mà nằm ở `hidden` cho R3 (A13).
 * - Câu kiểm của bộ phán không bao giờ gửi cho AI-4 (A12), nhưng KHÔNG đưa vào
 *   R3: câu kiểm viết bằng lời thường ("không phải DB quá tải"), nhân vật nói
 *   ra cũng hợp lệ. Đưa vào thì R3 bắt oan; gặp khi gọi thật 11/11/2026.
 * - Cờ, niềm tin, khúc mắc và hook theo đúng việc engine làm: ghi chú n2 nêu
 *   nguyên nhân kèm bằng chứng thì bộ phán bật `nguyen_nhan_da_noi_voi_mentor`,
 *   niềm tin "DB quá tải" bỏ (`drop_when`), khúc mắc `nguyen_nhan` gỡ, và probe
 *   dùng hook của nhánh có cờ đó.
 * - Diễn biến trong `recent` là lượt chơi giả, viết để có ngữ cảnh.
 */
import {
  PLAYER_SPEAKER,
  workCard,
  type NpcWorkProfile,
  type SceneLine,
  type SceneTurn,
  type WorkSlot,
} from '@datn/game-core';
import { npcCast } from '@datn/game-core/testing';

export const SAMPLE_SEED = 'SWE_BACKEND.L3.m2';

const MENTOR_CARD = 'XVIII_mat_trang';
const SUPPORT_CARD = 'VIII_suc_manh';

const stage: SceneTurn['stage'] = {
  title: 'Sự cố hệ thống giờ cao điểm!',
  situation:
    'Sáng đầu tuần, bạn vừa ngồi xuống thì app nội bộ báo đỏ: API lịch sử đơn chậm hẳn.',
  goal: 'Tìm ra vì sao API chậm và báo mentor hướng xử lý trước 12:00.',
  stakes:
    'Tới trưa vẫn chậm thì đơn giờ cao điểm sẽ rớt. Chỉ mentor nói, khi hợp.',
  limits:
    'Người chơi tự làm: xem log; chạy thử trên staging; viết và test bản sửa. Cần mentor duyệt: đưa bản sửa lên hệ thống thật. Không được: hứa giờ xong với khách.',
};

const company =
  'Giao Nhanh (hư cấu): startup giao đồ ăn và đi chợ hộ, khoảng 120 nhân viên, văn phòng quận 1 TP.HCM. Team Back-end có 6 người. Văn phòng, giờ hành chính 8:30–17:30. Có chat nội bộ và kênh #su-co để báo sự cố. Quy định: đụng tới production thì nhắn #su-co trước, mentor duyệt rồi mới đưa lên; không hứa giờ xong với khách khi chưa chắc.';

const mentorSlot = (over: Partial<WorkSlot> = {}): WorkSlot => ({
  id: 'mentor',
  relation: 'cap_tren',
  vai: 'mentor của người chơi, review API người chơi viết và duyệt mọi bản sửa trước khi lên production',
  kenh: 'chat',
  want: 'sự cố xử lý gọn, không trễ release 14:00',
  pressure: 'đang gấp release module thanh toán',
  stance: 'tin người chơi, muốn người chơi tự tìm ra',
  concerns: 'muốn chắc nguyên nhân trước khi cho sửa',
  beliefs: 'Chắc DB quá tải giờ cao điểm',
  known:
    'API lịch sử đơn chậm từ 8:00: thường 0,2 giây, giờ hơn 4 giây; API do người chơi viết ba tuần trước, mình review; mình gấp release module thanh toán lúc 14:00; app bản cũ không gửi số trang khi xem lịch sử đơn, nhiều khách sỉ vẫn dùng app cũ (chỉ nói khi được hỏi về app cũ hay số trang). Chỉ xác nhận khi người chơi tự nói ra, không nói trước: nguyên nhân là lấy chi tiết từng đơn trong một vòng lặp; API không giới hạn số đơn trả về',
  expertise: 'back-end 3',
  disclosure: 'nói thẳng',
  ...over,
});

const supportSlot = (over: Partial<WorkSlot> = {}): WorkSlot => ({
  id: 'support',
  relation: 'phong_ban_khac',
  vai: 'nhân viên bộ phận hỗ trợ khách hàng, đang nghe khách sỉ phàn nàn',
  kenh: 'chat',
  want: 'có câu trả lời cho khách sỉ',
  pressure: 'khách sỉ Minh Phát gọi liên tục',
  stance: 'quý người chơi, đang hoảng',
  concerns: 'cần một câu để nói với khách',
  beliefs: 'App lag là do mạng của khách',
  known:
    'API lịch sử đơn chậm từ 8:00; bộ phận hỗ trợ đã nhận 3 phàn nàn; khách sỉ Minh Phát (MP-0042) có 900 đơn trong lịch sử (nói khi được hỏi về khách)',
  expertise: 'kỹ thuật 0',
  disclosure: 'nói thẳng, kể dài',
  ...over,
});

/** Câu kiểm của bộ phán (A12): AI-4 chỉ nhận cờ, không bao giờ nhận câu hỏi. Test kiểm chúng không có trong prompt. */
export const SAMPLE_NOT_SENT = [
  'Bản vá có bỏ việc gọi cơ sở dữ liệu trong vòng lặp, thay bằng một truy vấn gom không?',
  'Bản vá có giới hạn số đơn trả về mỗi lần (phân trang hoặc giới hạn) không?',
  'Bản vá có nói cách xử lý request không gửi số trang không?',
  'Email có nêu cách kiểm tra hay theo dõi sau khi đưa lên production không?',
  'Email có nêu cách lùi lại (rollback) nếu bản sửa gây lỗi không?',
  'Người chơi có đưa ra bằng chứng cho thấy không phải DB quá tải (ví dụ khách ít đơn cùng giờ vẫn nhanh, số query tăng theo số đơn) không?',
];

/** Khúc mắc giấu tới nút kết (A13) và dữ kiện để dành cho n1. */
const HELD_BACK = [
  'sợ bản sửa làm hỏng chỗ khác trên production',
  'Minh Phát doạ huỷ hợp đồng nếu trưa còn chậm',
  'khách đòi giờ chắc',
];

const opening: SceneLine[] = [
  {
    speaker: 'mentor',
    text: 'Em ơi, API lịch sử đơn chậm từ 8 giờ, 0,2 giây lên hơn 4 giây. Chắc DB quá tải giờ cao điểm.',
    expression: 'lo_lang',
  },
  {
    speaker: 'mentor',
    text: 'Anh đang dí release thanh toán 2 giờ chiều, em coi giùm, trưa có hướng xử lý báo anh nha.',
    expression: 'binh_thuong',
  },
  {
    speaker: 'mentor',
    text: 'À, đụng production thì nhắn #su-co trước, anh duyệt rồi mới lên. Đừng hứa giờ với khách khi chưa chắc nha.',
    expression: 'binh_thuong',
  },
];

const NOTE =
  'Hiện tượng: API lịch sử đơn chậm từ 8:00, hơn 4 giây. Nguyên nhân nghi ngờ: lấy chi tiết từng đơn trong vòng lặp; bằng chứng: log cho thấy mở lịch sử đơn của MP-0042 thì hỏi cơ sở dữ liệu 901 lần, khách 3 đơn chỉ 4 lần. Đã làm gì: mở log, mở bảng số liệu. Giả thuyết: h1 có, h2 không.';

export type SampleSceneId =
  'n0' | 'pha_support' | 'bridge_n1' | 'n2_reaction' | 'n2_probe' | 'n2_after';

export const SAMPLE_SCENE_IDS: readonly SampleSceneId[] = [
  'n0',
  'pha_support',
  'bridge_n1',
  'n2_reaction',
  'n2_probe',
  'n2_after',
];

/**
 * Một lượt mẫu. `choice` là lựa chọn xưng hô của người chơi (Hồ sơ NPC mục 4);
 * `cast` mặc định là 22 lá của bản chốt v1.0.
 */
export function sampleScene(
  id: SampleSceneId,
  options: {
    choice?: 'anh' | 'chi';
    cast?: Record<string, NpcWorkProfile>;
  } = {},
): SceneTurn {
  const cast = options.cast ?? npcCast();
  const choice = options.choice ?? 'chi';
  const mentor = (over?: Partial<WorkSlot>) =>
    workCard(cast[MENTOR_CARD], mentorSlot(over), choice);
  const support = (over?: Partial<WorkSlot>) =>
    workCard(cast[SUPPORT_CARD], supportSlot(over), choice);
  const base = {
    stage,
    company,
    storyFlags: [] as string[],
    hidden: HELD_BACK,
  };
  const office = 'bàn làm việc ở văn phòng Giao Nhanh';

  switch (id) {
    case 'n0':
      // Nút mở: người chơi đáp một câu (không chấm), AI-4 viết 1–2 nhịp của mentor rồi thả vào pha (A2).
      return {
        ...base,
        task: 'reply',
        lead: 'mentor',
        cards: [mentor()],
        scene: { time: '9:40', place: office, channel: 'chat' },
        recent: opening,
        playerLine: 'Dạ em coi liền anh. Em mở log trước rồi báo anh nha.',
        maxBeats: 2,
        questionAllowed: false,
      };
    case 'pha_support':
      return {
        ...base,
        task: 'reply',
        lead: 'support',
        cards: [support()],
        scene: { time: '10:05', place: office, channel: 'chat' },
        storyFlags: ['da_mo_log'],
        recent: [
          ...opening,
          {
            speaker: PLAYER_SPEAKER,
            text: 'Dạ em coi liền anh. Em mở log trước rồi báo anh nha.',
          },
        ],
        playerLine:
          'Chị ơi, sáng giờ khách nào than chậm nhiều nhất vậy chị? Khách đó có nhiều đơn không?',
        ambient: ['Nhóm chat team bàn trưa nay ăn cơm tấm hay bún đậu.'],
        maxBeats: 4,
      };
    case 'bridge_n1':
      // 10:50 chị Thương gọi, chen ngang (A1b). Bridge chỉ dẫn vào; lời adapt của seed theo sau.
      return {
        ...base,
        task: 'bridge',
        lead: 'support',
        cards: [support({ kenh: 'gọi điện' })],
        scene: { time: '10:50', place: office, channel: 'gọi điện' },
        storyFlags: ['da_mo_log', 'da_mo_bang'],
        recent: [
          { speaker: 'canh', text: 'Bạn đang viết dở bản vá trong editor.' },
        ],
        bridgeTo:
          'Chị Thương bên hỗ trợ gọi điện tới, chen ngang lúc người chơi đang viết bản vá.',
        maxBeats: 2,
        questionAllowed: false,
      };
    case 'n2_reaction':
    case 'n2_probe':
    case 'n2_after': {
      // n2: người chơi lưu ghi chú sự cố. Seed: reaction một nhịp soạn sẵn, AI-4 thêm tối đa 1 nhịp
      // xác nhận hay bác bỏ điều mentor biết; rồi probe theo hook; rồi E4 đáp 1–2 nhịp, không đánh giá.
      // Ghi chú nêu nguyên nhân kèm bằng chứng: niềm tin bỏ, khúc mắc `nguyen_nhan` gỡ (A12).
      const n2 = {
        ...base,
        lead: 'mentor',
        cards: [mentor({ beliefs: undefined, concerns: undefined })],
        scene: { time: '11:05', place: office, channel: 'chat' },
        storyFlags: [
          'da_mo_log',
          'da_mo_bang',
          'da_viet_ban_va',
          'nguyen_nhan_da_noi_voi_mentor',
          'resolved_nguyen_nhan',
        ],
      };
      const afterNote: SceneLine[] = [
        { speaker: PLAYER_SPEAKER, text: NOTE },
        {
          speaker: 'mentor',
          text: 'Anh coi ghi chú rồi nè.',
          expression: 'suy_nghi',
        },
      ];
      if (id === 'n2_reaction')
        return {
          ...n2,
          task: 'reaction',
          recent: [],
          playerLine: NOTE,
          seedReaction: [
            {
              speaker: 'mentor',
              text: 'Anh coi ghi chú rồi nè.',
              expression: 'suy_nghi',
            },
          ],
          maxBeats: 2,
          questionAllowed: false,
        };
      // Nhánh có `nguyen_nhan_da_noi_voi_mentor`, hook 1; `da_loai_db_bang_chung` chưa bật nên không bỏ qua.
      const hook =
        'anh Sang cần ghi vào báo cáo vì sao loại khả năng DB quá tải, điều chính anh từng tin; hỏi em lấy gì để loại';
      if (id === 'n2_probe')
        return { ...n2, task: 'probe', recent: afterNote, hook, maxBeats: 2 };
      return {
        ...n2,
        task: 'reply',
        storyFlags: [...n2.storyFlags, 'da_loai_db_bang_chung'],
        recent: [
          ...afterNote,
          {
            speaker: 'mentor',
            text: 'Anh phải ghi vào báo cáo nè: em lấy gì để loại khả năng DB quá tải?',
            expression: 'suy_nghi',
          },
        ],
        playerLine:
          'Em so khách 3 đơn với khách 900 đơn cùng giờ, khách ít đơn vẫn nhanh, số query tăng theo số đơn nên em loại DB quá tải.',
        maxBeats: 2,
        questionAllowed: false,
      };
    }
  }
}
