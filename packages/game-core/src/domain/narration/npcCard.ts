/**
 * Thẻ nhân vật cho AI-4 ở màn làm việc: xưng hô và chữ của thẻ.
 *
 * Theo `research/reports/Hồ sơ NPC JobQuest.md`, mục 3, 4, 6.1 (bản chốt v1.0).
 * Chép đúng `qa_v05/engine.py`; test đối chiếu từng chữ với thẻ engine đó dựng
 * cho mọi lá × vai × lựa chọn anh/chị.
 *
 * - Màn làm việc chỉ đọc `danh_tinh` và `nguoi`. Không có tham số nào nhận
 *   `doi_tu`, nên chuyện riêng của nhân vật không thể lọt vào thẻ (mục 1).
 * - Xưng hô do engine tính rồi ghi vào thẻ; AI-4 không tự suy (mục 4).
 * - Phần người ≤ 250 tiếng; quá trần thì bỏ "Giá trị", rồi "Tin rằng" (mục 6).
 *
 * Nhiệm vụ phụ (khuôn 6.2) chưa làm: thuộc tuyến truyện, chưa có trong ĐACN.
 */

/** Tuổi người chơi dùng để so ở vai không thứ bậc (mục 4). */
export const PLAYER_AGE = 22;

/** Phần người: trần số tiếng gửi AI-4 (mục 6). */
export const PERSON_PART_MAX_WORDS = 250;

export type PlayerAddress = 'anh' | 'chi';

export type SlotRelation =
  'cap_tren' | 'cap_duoi' | 'ngang_hang' | 'phong_ban_khac' | 'khach_hang';

export type ConflictStyle =
  'canh_tranh' | 'hop_tac' | 'thoa_hiep' | 'ne_tranh' | 'nhuong_nhin';

export interface SampleLine {
  quan_he: SlotRelation | 'bat_ky';
  bieu_cam: string;
  text: string;
}

/** Phần hồ sơ mà màn làm việc được đọc. `doi_tu` cố ý không có ở đây. */
export interface NpcWorkProfile {
  id: string;
  danh_tinh: {
    ten_goi: string;
    tuoi: number;
    gioi: 'nam' | 'nu';
    ho_ten?: string;
    sinh_nhat?: string;
  };
  nguoi: {
    mo_ta_ngan?: string;
    tinh_cach: {
      big5: Record<
        'huong_ngoai' | 'de_chiu' | 'tan_tam' | 'on_dinh_cam_xuc' | 'coi_mo',
        string
      >;
      ba_net: string[];
      xu_ly_bat_dong: { chu_dao: ConflictStyle };
    };
    cach_lam_viec: {
      diem_yeu: string;
      khi_ap_luc: string;
      gia_tri: string[];
      niem_tin_nen: string;
    };
    giong: {
      vung: string;
      mo_ta: string;
      tro_tu: string[];
      cau_cua_rieng: string[];
      khong_bao_gio: string[];
      cau_mau: SampleLine[];
    };
    bieu_cam: { hay_dung: string[]; hiem_dung: string[]; thoi_quen: string };
    xung_ho: {
      ngoai_le?: { tu_xung: string; goi: string };
      tu_xung?: string;
      goi_theo_lua_chon?: Record<PlayerAddress, string>;
      tu_xung_ngang_hang?: string;
    };
    vao_vai: {
      vai_hop_le: SlotRelation[];
      theo_quan_he: Partial<
        Record<
          SlotRelation,
          { stance_mac_dinh: string; xu_ly_phu: ConflictStyle }
        >
      >;
      ky_nang_chung: Record<string, number>;
    };
    luu_y?: Array<{ text: string }>;
  };
}

/**
 * Slot của seed, đã được engine ghép thành chữ (Seed C1, Hồ sơ NPC mục 3).
 * Trường trống thì thẻ ghi mặc định như engine mẫu.
 */
export interface WorkSlot {
  /** Mã slot, cũng là `speaker` trong đầu ra của AI-4. */
  id: string;
  relation: SlotRelation;
  /** Mô tả vai trong màn của seed. */
  vai: string;
  /** Kênh của slot hay của bước; trống thì "gặp trực tiếp". */
  kenh?: string;
  want?: string;
  pressure?: string;
  /** Trống thì lấy `stance_mac_dinh` của lá theo quan hệ. */
  stance?: string;
  /** Khúc mắc còn lại, đã bỏ những cái `hold_until` chưa tới (A13). */
  concerns?: string;
  /** Niềm tin còn giữ, đã bỏ những cái `drop_when` đã bật (A12). */
  beliefs?: string;
  /** Dữ kiện slot biết (`known_by`), đã lọc theo C2. */
  known?: string;
  expertise?: string;
  disclosure?: string;
}

const BIG5: Array<
  [keyof NpcWorkProfile['nguoi']['tinh_cach']['big5'], string]
> = [
  ['huong_ngoai', 'hướng ngoại'],
  ['de_chiu', 'dễ chịu'],
  ['tan_tam', 'tận tâm'],
  ['on_dinh_cam_xuc', 'ổn định cảm xúc'],
  ['coi_mo', 'cởi mở'],
];

const CONFLICT_VN: Record<ConflictStyle, string> = {
  canh_tranh: 'cạnh tranh',
  hop_tac: 'hợp tác',
  thoa_hiep: 'thoả hiệp',
  ne_tranh: 'né tránh',
  nhuong_nhin: 'nhường nhịn',
};

const ADDRESS_VN: Record<PlayerAddress, string> = { anh: 'anh', chi: 'chị' };

/** `NHAN_KY_NANG` của engine mẫu: mã kỹ năng in bằng nhãn tiếng Việt. */
export const SKILL_LABELS: Readonly<Record<string, string>> = {
  am_nhac: 'âm nhạc',
  ban_hang: 'bán hàng',
  co_khi_dong_tau: 'cơ khí đóng tàu',
  cong_nghe: 'công nghệ',
  dich_vu_khach_san: 'dịch vụ khách sạn',
  dien_toa_nha: 'điện toà nhà',
  giao_duc: 'giáo dục',
  giao_tiep: 'giao tiếp',
  huong_nghiep: 'hướng nghiệp',
  ke_toan: 'kế toán',
  kinh_doanh_nho: 'kinh doanh nhỏ',
  lam_moc: 'làm mộc',
  luat_lao_dong: 'luật lao động',
  nau_an: 'nấu ăn',
  nhan_su: 'nhân sự',
  nhiep_anh: 'nhiếp ảnh',
  quan_ly_doi: 'quản lý đội',
  sua_chua_co_khi: 'sửa chữa cơ khí',
  sua_chua_dien_thoai: 'sửa điện thoại',
  suc_khoe_tinh_than: 'sức khoẻ tinh thần',
  tai_chinh_ca_nhan: 'tài chính cá nhân',
  the_thao: 'thể thao',
  thiet_ke: 'thiết kế',
  van_chuyen: 'vận chuyển',
  xay_dung: 'xây dựng',
  y_te: 'y tế',
};

/**
 * NPC tự xưng gì, gọi người chơi là gì, trong màn làm việc (mục 4).
 *
 * Xét theo thứ tự: cấp dưới → ngoại lệ → cấp trên → NPC nhỏ tuổi hơn → lớn hơn
 * từ 5 tuổi → xấp xỉ tuổi. Cấp bậc thắng tuổi (chốt 6/11).
 */
export function workAddress(
  profile: NpcWorkProfile,
  relation: SlotRelation,
  choice: PlayerAddress,
): { self: string; player: string } {
  const xh = profile.nguoi.xung_ho;
  const elder = profile.danh_tinh.gioi === 'nam' ? 'anh' : 'chị';
  const diff = profile.danh_tinh.tuoi - PLAYER_AGE;

  if (relation === 'cap_duoi')
    return { self: 'em', player: ADDRESS_VN[choice] };
  if (xh.ngoai_le)
    return { self: xh.ngoai_le.tu_xung, player: xh.ngoai_le.goi };
  if (relation === 'cap_tren') return { self: elder, player: 'em' };
  if (diff < 0) {
    const goi = xh.goi_theo_lua_chon?.[choice];
    // Engine mẫu đánh lỗi khi thiếu trường này; lá dưới 22 tuổi bắt buộc khai.
    if (!goi)
      throw new Error(
        `Lá ${profile.id} nhỏ tuổi hơn người chơi mà thiếu xung_ho.goi_theo_lua_chon`,
      );
    return { self: xh.tu_xung ?? 'em', player: goi };
  }
  if (diff >= 5) return { self: elder, player: 'em' };
  return {
    self:
      xh.tu_xung_ngang_hang ||
      (profile.nguoi.giong.vung === 'bac' ? 'tớ' : 'tui'),
    player: 'bạn',
  };
}

/** `{goi}`, `{xung}` trong câu mẫu dùng chung; đứng đầu câu thì viết hoa. */
function fillPronouns(text: string, player: string, self: string): string {
  let out = text;
  for (const [key, value] of [
    ['{goi}', player],
    ['{xung}', self],
  ] as const) {
    if (out.startsWith(key))
      out =
        value.slice(0, 1).toUpperCase() +
        value.slice(1) +
        out.slice(key.length);
    out = out.split(key).join(value);
  }
  return out;
}

const wordCount = (lines: readonly string[]): number =>
  lines.join(' ').split(/\s+/).filter(Boolean).length;

function personPart(
  profile: NpcWorkProfile,
  slot: WorkSlot,
  choice: PlayerAddress,
  shorten: 0 | 1 | 2,
): string[] {
  const { danh_tinh: d, nguoi: n } = profile;
  const { self, player } = workAddress(profile, slot.relation, choice);
  const roleStyle = n.vao_vai.theo_quan_he[slot.relation];
  if (!roleStyle)
    throw new Error(`Lá ${profile.id} không đóng được vai ${slot.relation}`);

  const samples = n.giong.cau_mau
    .filter((c) => c.quan_he === slot.relation)
    .slice(0, 2);
  if (samples.length < 2)
    samples.push(
      ...n.giong.cau_mau
        .filter((c) => c.quan_he === 'bat_ky')
        .slice(0, 2 - samples.length),
    );

  const lines = [
    `[${slot.id}] ${d.ten_goi}, ${d.tuoi} tuổi. Vai trong màn: ${slot.vai}.`,
    `Xưng "${self}", gọi người chơi "${player}". Kênh: ${slot.kenh || 'gặp trực tiếp'}.`,
    'Tính cách: ' +
      BIG5.filter(([key]) => n.tinh_cach.big5[key] !== 'trung bình')
        .map(([key, vn]) => `${vn} ${n.tinh_cach.big5[key]}`)
        .join(', ') +
      '.',
    `Ba nét: ${n.tinh_cach.ba_net.join('; ')}.`,
    `Điểm yếu: ${n.cach_lam_viec.diem_yeu}.`,
    `Khi áp lực: ${n.cach_lam_viec.khi_ap_luc}.`,
    `Bất đồng: ${CONFLICT_VN[n.tinh_cach.xu_ly_bat_dong.chu_dao]}; trong vai này nghiêng về ${CONFLICT_VN[roleStyle.xu_ly_phu]}.`,
  ];
  const values: string[] = [];
  if (shorten < 1)
    values.push(`Giá trị: ${n.cach_lam_viec.gia_tri.join(', ')}.`);
  if (shorten < 2) values.push(`Tin rằng: ${n.cach_lam_viec.niem_tin_nen}.`);
  if (values.length > 0) lines.push(values.join(' '));
  lines.push(
    `Giọng: ${n.giong.mo_ta}. Trợ từ (≤1/4 số câu): ${n.giong.tro_tu.join(', ')}. Không bao giờ: ${n.giong.khong_bao_gio.join('; ')}.`,
    'Câu của riêng (cả cuộc trò chuyện tối đa 1 lần): ' +
      n.giong.cau_cua_rieng.map((s) => `"${s}"`).join(' '),
    'Câu mẫu: ' +
      samples.map((c) => `"${fillPronouns(c.text, player, self)}"`).join(' · '),
    `Mặt hay dùng: ${n.bieu_cam.hay_dung.join(', ')}. Hiếm: ${n.bieu_cam.hiem_dung.join(', ')}.`,
    `Thói quen: ${n.bieu_cam.thoi_quen}.`,
  );
  if (n.luu_y && n.luu_y.length > 0)
    lines.push(`Lưu ý: ${n.luu_y.map((x) => x.text).join('; ')}.`);
  return lines;
}

function slotPart(profile: NpcWorkProfile, slot: WorkSlot): string[] {
  const n = profile.nguoi;
  const skills = Object.entries(n.vao_vai.ky_nang_chung)
    .map(([key, level]) => `${SKILL_LABELS[key] ?? key} ${level}`)
    .join(', ');
  return [
    '── Trong màn này (từ seed) ──',
    `Trong màn muốn: ${slot.want ?? 'không có'}. Vướng: ${slot.pressure ?? 'không có'}. Thái độ: ${
      slot.stance || n.vao_vai.theo_quan_he[slot.relation]?.stance_mac_dinh
    }. Khúc mắc: ${slot.concerns ?? 'không có'}.`,
    `Nghĩ là: ${slot.beliefs ?? 'không có'}.   Biết: ${slot.known ?? 'không có'}.`,
    `Hiểu biết nghề: ${slot.expertise || 'đúng mức của vai trong màn'}. Kỹ năng chung: ${skills}.`,
    `Cách nói ra điều mình biết: ${slot.disclosure || 'nói thẳng'}.`,
  ];
}

export interface WorkCard {
  slot: string;
  text: string;
  /** Số tiếng của phần người, sau khi đã rút gọn nếu cần. */
  personWords: number;
}

/**
 * Thẻ một nhân vật ở màn làm việc (khuôn 6.1). Chỉ điền lá vào slot khi
 * `relation` nằm trong `vai_hop_le` của lá (mục 3).
 */
export function workCard(
  profile: NpcWorkProfile,
  slot: WorkSlot,
  choice: PlayerAddress,
): WorkCard {
  if (!profile.nguoi.vao_vai.vai_hop_le.includes(slot.relation))
    throw new Error(
      `Lá ${profile.id} không có vai ${slot.relation} trong vai_hop_le`,
    );

  let person: string[] = [];
  let words = 0;
  for (const shorten of [0, 1, 2] as const) {
    person = personPart(profile, slot, choice, shorten);
    words = wordCount(person);
    if (words <= PERSON_PART_MAX_WORDS) break;
  }
  return {
    slot: slot.id,
    text: [...person, ...slotPart(profile, slot)].join('\n'),
    personWords: words,
  };
}
