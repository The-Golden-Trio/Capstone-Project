/**
 * Từ điển chuỗi giao diện.
 *
 * Tự viết thay vì kéo thư viện: chỉ có hai ngôn ngữ, không cần số nhiều phức
 * tạp hay tải lười, mà đổi lại được kiểu chặt — gõ sai khoá là TypeScript báo
 * ngay, không đợi tới lúc chạy mới thấy chữ trống.
 *
 * Bản tiếng Anh thiếu thì tự rơi về tiếng Việt (xem `translate`), nên dịch dần
 * từng màn được: màn chưa dịch vẫn hiện tiếng Việt bình thường chứ không vỡ.
 */

export type Language = 'vi' | 'en';

/** Một chuỗi: luôn có tiếng Việt, tiếng Anh có thể chưa dịch. */
interface Message {
  vi: string;
  en?: string;
}

export const MESSAGES = {
  /* ── Điều hướng ── */
  'nav.explore': { vi: 'Khám phá', en: 'Explore' },
  'nav.mine': { vi: 'Của tôi', en: 'Mine' },
  'nav.overview': { vi: 'Tổng quan', en: 'Overview' },
  'nav.jobs': { vi: 'Bản đồ nghề', en: 'Career map' },
  'nav.quiz': { vi: 'Get to Know Me', en: 'Get to Know Me' },
  'nav.profile': { vi: 'Hành trang', en: 'My journey' },
  'nav.account': { vi: 'Tài khoản', en: 'Account' },
  'nav.mainNav': { vi: 'Điều hướng chính', en: 'Main navigation' },
  'nav.openMenu': { vi: 'Mở menu', en: 'Open menu' },

  /* ── Thanh đầu trang ── */
  'top.skillPoints': { vi: 'điểm kỹ năng', en: 'skill points' },
  'top.sideQuests': { vi: 'nhiệm vụ phụ', en: 'side quests' },
  'top.language': { vi: 'Ngôn ngữ', en: 'Language' },

  /* ── Đang ở ── */
  'here.label': { vi: 'Đang ở', en: 'Currently in' },
  'here.continue': { vi: 'Tiếp tục', en: 'Continue' },
  'here.change': { vi: 'Đổi nơi', en: 'Go elsewhere' },
  'here.allDone': { vi: 'Đã làm hết việc ở đây', en: 'Nothing left to do here' },
  'here.left': { vi: 'Còn {count} việc', en: '{count} left to do' },
  'here.leftWithMain': {
    vi: 'Còn {count} việc, gồm cả nhiệm vụ chính',
    en: '{count} left, including the main quest',
  },
  'here.at': {
    vi: 'Đang ở {role}, cấp bậc {band}',
    en: 'Currently in {role}, level {band}',
  },

  /* ── Bảng nhân vật ── */
  'hud.toward': { vi: 'Tới', en: 'To' },
  'hud.guest': { vi: 'Khách', en: 'Guest' },
  'hud.skillPoints': { vi: '{count} điểm kỹ năng', en: '{count} skill points' },

  /* ── Xác thực ── */
  'auth.login': { vi: 'Đăng nhập', en: 'Sign in' },
  'auth.loggingIn': { vi: 'Đang vào…', en: 'Signing in…' },
  'auth.loginCta': { vi: 'Vào Nghề', en: 'Enter' },
  'auth.register': { vi: 'Tạo tài khoản', en: 'Create account' },
  'auth.registering': { vi: 'Đang tạo…', en: 'Creating…' },
  'auth.registerCta': { vi: 'Khởi hành', en: 'Begin' },
  'auth.identifier': {
    vi: 'Tên đăng nhập hoặc email',
    en: 'Username or email',
  },
  'auth.password': { vi: 'Mật khẩu', en: 'Password' },
  'auth.displayName': { vi: 'Tên hiển thị', en: 'Display name' },
  'auth.username': { vi: 'Tên đăng nhập', en: 'Username' },
  'auth.email': { vi: 'Email', en: 'Email' },
  'auth.dateOfBirth': { vi: 'Ngày sinh', en: 'Date of birth' },
  'auth.noAccount': { vi: 'Chưa có tài khoản?', en: 'No account yet?' },
  'auth.hasAccount': { vi: 'Đã có tài khoản?', en: 'Already have an account?' },
  'auth.or': { vi: 'hoặc', en: 'or' },
  'auth.subtitle': { vi: 'Mô phỏng nghề IT', en: 'IT career simulator' },
  'auth.dobWhy': {
    vi: 'Ngày sinh dùng để biết có cần người giám hộ đồng ý hay không, theo Nghị định 13/2023/NĐ-CP về dữ liệu cá nhân của trẻ vị thành niên.',
    en: 'Your date of birth tells us whether guardian consent is required, under Vietnam’s Decree 13/2023 on the personal data of minors.',
  },
  'auth.loginFailed': {
    vi: 'Đăng nhập không thành công',
    en: 'Sign-in failed',
  },
  'auth.registerFailed': { vi: 'Đăng ký không thành công', en: 'Sign-up failed' },
  'auth.googleFailed': {
    vi: 'Đăng nhập bằng Google không thành công',
    en: 'Google sign-in failed',
  },
  'auth.googleNoCredential': {
    vi: 'Google không trả về thông tin đăng nhập',
    en: 'Google returned no credential',
  },
  'auth.opening': { vi: 'Đang mở cổng…', en: 'Opening the gate…' },

  /* ── Get to Know Me ── */
  'quiz.title': { vi: 'Get to Know Me', en: 'Get to Know Me' },
  'quiz.lead': {
    vi: 'Sáu câu, không có đáp án đúng. Kết quả dùng để chỉ hướng trên bản đồ, không phải để chấm bạn.',
    en: 'Six questions, no right answers. They point you across the map — they are not a score.',
  },
  'quiz.question': { vi: 'CÂU {current}/{total}', en: 'QUESTION {current}/{total}' },
  'quiz.skip': { vi: 'Bỏ qua phần này', en: 'Skip for now' },
  'quiz.saveFailed': {
    vi: 'Không lưu được kết quả',
    en: 'Could not save your answers',
  },
  'quiz.welcome': {
    vi: 'Trước khi lên đường, kể cho chúng tôi nghe một chút về bạn.',
    en: 'Before you set off, tell us a little about yourself.',
  },
  'quiz.retake': { vi: 'Làm lại phần này', en: 'Take it again' },
  'quiz.resultTitle': {
    vi: 'Ba hành tinh gần bạn nhất',
    en: 'The three planets closest to you',
  },
  'quiz.resultLead': {
    vi: 'Tính bằng độ khớp giữa câu trả lời của bạn và tính chất của từng hành tinh.',
    en: 'Measured by how closely your answers match the character of each planet.',
  },
  'quiz.portrait': { vi: 'Chân dung của bạn', en: 'Your portrait' },
  'quiz.dimensions': { vi: '8 chiều', en: '8 dimensions' },
  'quiz.openMap': { vi: 'Mở toàn bản đồ', en: 'Open the full map' },
  'quiz.caveat': {
    vi: 'Sáu câu thì chưa đủ để kết luận về tính cách. Đây là gợi ý hướng khám phá, không phải kết quả đo.',
    en: 'Six questions cannot conclude anything about your personality. Treat this as a direction to explore, not a measurement.',
  },

  /* ── Tổng quan ── */
  'dash.greeting': { vi: 'Chào {name}', en: 'Hello {name}' },
  'dash.lead': {
    vi: 'Chọn một hành tinh, làm vài nhiệm vụ, rồi xem chân dung của bạn dần hiện ra.',
    en: 'Pick a planet, take on a few quests, and watch your portrait take shape.',
  },
  'dash.visited': { vi: 'Đã ghé', en: 'Visited' },
  'dash.ofPlanets': { vi: 'trên {total} hành tinh', en: 'of {total} planets' },
  'dash.skillPoints': { vi: 'Điểm kỹ năng', en: 'Skill points' },
  'dash.fromMainQuests': { vi: 'từ nhiệm vụ chính', en: 'from main quests' },
  'dash.sideQuests': { vi: 'Nhiệm vụ phụ', en: 'Side quests' },
  'dash.highestBand': { vi: 'Cấp bậc cao nhất', en: 'Highest level' },
  'dash.none': { vi: 'chưa có', en: 'none yet' },
  'dash.whereNow': { vi: 'Đang ở', en: 'Currently in' },
  'dash.whereStart': { vi: 'Khởi hành từ đâu', en: 'Where to begin' },
  'dash.continue': { vi: 'Tiếp tục hành trình', en: 'Continue the journey' },
  'dash.suitedPlanets': {
    vi: 'Hành tinh hợp với bạn',
    en: 'Planets that suit you',
  },
  'dash.byProfile': { vi: 'theo hồ sơ', en: 'by your profile' },
  'dash.openMap': { vi: 'Mở bản đồ', en: 'Open the map' },
  'dash.start': { vi: 'Bắt đầu', en: 'Start' },
  'dash.answerSix': { vi: 'Trả lời 6 câu', en: 'Answer six questions' },

  /* ── Hành trang ── */
  'profile.title': { vi: 'Hành trang', en: 'My journey' },
  'profile.lead': {
    vi: 'Hai loại điểm, đo hai chuyện khác nhau: kỹ năng mở cấp bậc kế, tính cách chỉ hướng hành tinh nên ghé.',
    en: 'Two kinds of points, measuring two different things: skill unlocks the next level, personality points you toward the right planet.',
  },
  'profile.serverScored': { vi: 'do máy chủ chấm', en: 'scored by the server' },
  'profile.mainQuests': { vi: 'Nhiệm vụ chính', en: 'Main quests' },
  'profile.completed': { vi: 'đã hoàn thành', en: 'completed' },
  'profile.drawsPortrait': { vi: 'vẽ nên chân dung', en: 'draws your portrait' },
  'profile.quizDone': { vi: 'Đã tự vấn', en: 'Reflected' },
  'profile.done': { vi: 'đã làm', en: 'done' },
  'profile.notDone': { vi: 'chưa làm', en: 'not yet' },
  'profile.strengths': { vi: 'Mạnh ở đâu', en: 'Where you are strong' },
  'profile.bySkill': { vi: 'theo kỹ năng', en: 'by skill' },
  'profile.overTime': { vi: 'Tiến bộ theo thời gian', en: 'Progress over time' },
  'profile.cumulative': { vi: 'cộng dồn', en: 'cumulative' },
  'profile.playedRuns': { vi: 'Những lượt đã chơi', en: 'Runs you have played' },
  'profile.points': { vi: '{count} điểm', en: '{count} points' },

  /* ── Chung ── */
  'common.loading': { vi: 'Đang tải…', en: 'Loading…' },
  'common.back': { vi: 'Quay lại', en: 'Back' },
  'common.save': { vi: 'Lưu thay đổi', en: 'Save changes' },
  'common.signOut': { vi: 'Đăng xuất', en: 'Sign out' },

  /* ── Ghi chú về ngôn ngữ của nội dung ── */
  'lang.contentVietnamese': {
    vi: 'Nội dung kịch bản nghề hiện chỉ có tiếng Việt.',
    en: 'Career scenarios are currently available in Vietnamese only.',
  },
} as const satisfies Record<string, Message>;

export type MessageKey = keyof typeof MESSAGES;

/**
 * Lấy chuỗi theo ngôn ngữ, thay các chỗ `{ten}` bằng giá trị truyền vào.
 *
 * Chưa có bản tiếng Anh thì trả tiếng Việt: dịch dần từng màn được mà không
 * để lại ô chữ trống ở những màn chưa đụng tới.
 */
export function translate(
  key: MessageKey,
  language: Language,
  vars?: Record<string, string | number>,
): string {
  const entry = MESSAGES[key] as Message;
  const raw = (language === 'en' ? entry.en : entry.vi) ?? entry.vi;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}
