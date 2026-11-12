/**
 * Nội dung email theo `notification.template` (tiếng Việt). Mỗi template nhận
 * `payload` đã lưu và phần `secret` chỉ đi trong email (link đặt lại mật khẩu).
 */
export interface RenderedMail {
  subject: string;
  text: string;
}

type Vars = Record<string, unknown>;

const str = (v: unknown, fallback = ''): string =>
  typeof v === 'string' && v.length > 0 ? v : fallback;

const dateVi = (v: unknown): string => {
  const d = typeof v === 'string' ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    : '';
};

const TEMPLATES: Record<string, (p: Vars, s: Vars) => RenderedMail> = {
  PASSWORD_RESET: (_p, s) => ({
    subject: 'Đặt lại mật khẩu JobQuest',
    text:
      `Có người (hy vọng là bạn) vừa yêu cầu đặt lại mật khẩu.\n\n` +
      `Mở link sau trong vòng 1 giờ để đặt mật khẩu mới:\n${str(s['link'])}\n\n` +
      `Nếu không phải bạn, hãy bỏ qua email này.`,
  }),
  SCENARIO_ASSIGNED: (p) => ({
    subject: `Bạn được giao viết scenario: ${str(p['taskText'], 'scenario mới')}`,
    text:
      `Bạn được giao làm tác giả scenario cho task "${str(p['taskText'])}" ` +
      `(${str(p['occupationName'])}).\n\nMở staff app để bắt đầu soạn: ${str(p['link'])}`,
  }),
  REVIEW_ASSIGNED: (p) => ({
    subject: `Bạn được giao duyệt scenario: ${str(p['taskText'], 'scenario')}`,
    text:
      `Bạn được giao duyệt scenario cho task "${str(p['taskText'])}" ` +
      `(${str(p['occupationName'])}). Hạn duyệt: ${dateVi(p['deadlineAt'])}.\n\n` +
      `Scenario sẽ vào hàng đợi duyệt khi tác giả nộp.`,
  }),
  SCENARIO_SUBMITTED: (p) => ({
    subject: `Scenario chờ bạn duyệt: ${str(p['taskText'], 'scenario')}`,
    text:
      `Tác giả đã nộp scenario cho task "${str(p['taskText'])}". ` +
      `Hạn duyệt: ${dateVi(p['deadlineAt'])}.\n\nMở hàng đợi duyệt: ${str(p['link'])}`,
  }),
  REVIEW_DECIDED: (p) => ({
    subject: `Kết quả duyệt scenario: ${str(p['decisionText'])}`,
    text:
      `Scenario cho task "${str(p['taskText'])}" vừa được duyệt: ${str(p['decisionText'])}.\n` +
      (str(p['comment']) ? `\nNhận xét: ${str(p['comment'])}\n` : '') +
      `\nXem chi tiết: ${str(p['link'])}`,
  }),
  REVIEW_DUE_SOON: (p) => ({
    subject: `Sắp tới hạn duyệt scenario: ${str(p['taskText'])}`,
    text: `Hạn duyệt scenario cho task "${str(p['taskText'])}" là ${dateVi(p['deadlineAt'])}.`,
  }),
  REVIEW_OVERDUE: (p) => ({
    subject: `Quá hạn duyệt scenario: ${str(p['taskText'])}`,
    text:
      `Lượt duyệt scenario cho task "${str(p['taskText'])}" đã quá hạn ` +
      `(${dateVi(p['deadlineAt'])}). Content Admin có thể giao lại cho người khác.`,
  }),
  DRAFT_READY: (p) => ({
    subject: `Bản game nháp đã sẵn sàng: ${str(p['taskText'])}`,
    text:
      `Content Admin đã dựng bản game nháp cho scenario "${str(p['taskText'])}". ` +
      `Bạn có thể chơi thử khi màn Play-test được mở.`,
  }),
};

export function renderMail(
  template: string,
  payload: Vars,
  secret: Vars = {},
): RenderedMail {
  const render = TEMPLATES[template];
  if (render) return render(payload, secret);
  return {
    subject: `Thông báo JobQuest (${template})`,
    text: JSON.stringify(payload),
  };
}

/** Câu ngắn cho chuông thông báo trong staff app dùng chung template với email. */
export const KNOWN_TEMPLATES = Object.keys(TEMPLATES);
