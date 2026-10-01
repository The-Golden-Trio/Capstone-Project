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
  'nav.collapse': { vi: 'Thu gọn thanh bên', en: 'Collapse sidebar' },
  'nav.expand': { vi: 'Mở rộng thanh bên', en: 'Expand sidebar' },
  'nav.backToMap': { vi: 'Về bản đồ nghề', en: 'Back to the career map' },

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
    vi: 'Khoảng năm phút: vài câu chọn nhanh và ba câu kể ngắn. Không có đáp án đúng — kết quả chỉ để gợi ý nên ghé đâu trên bản đồ.',
    en: 'About five minutes: quick choices and three short stories. No right answers — the result only suggests where to look on the map.',
  },
  'quiz.question': { vi: 'CÂU {current}/{total}', en: 'QUESTION {current}/{total}' },
  'quiz.stageTag': { vi: 'TRƯỚC KHI BẮT ĐẦU', en: 'BEFORE WE START' },
  'quiz.storyTag': { vi: 'KỂ NGẮN', en: 'IN YOUR OWN WORDS' },
  'quiz.strong': { vi: 'Rất giống mình', en: 'Very me' },
  'quiz.lean': { vi: 'Hơi giống', en: 'Somewhat' },
  'quiz.back': { vi: 'Câu trước', en: 'Previous' },
  'quiz.next': { vi: 'Tiếp', en: 'Next' },
  'quiz.finish': { vi: 'Xem chân dung', en: 'See my portrait' },
  'quiz.chars': { vi: '{count}/{max} ký tự', en: '{count}/{max} characters' },
  'quiz.minChars': {
    vi: 'Viết thêm ít nhất {count} ký tự',
    en: 'Write at least {count} more characters',
  },
  'quiz.aiReads': {
    vi: 'AI đọc câu này để hiểu cách bạn làm việc và viết đoạn mô tả về bạn. Chỉ bạn thấy kết quả.',
    en: 'AI reads this to understand how you like to work and to write a description of you. Only you see the result.',
  },
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
  'quiz.resultTitle': { vi: 'Chân dung của bạn', en: 'Your portrait' },
  'quiz.resultLead': {
    vi: 'Năm hành tinh gần bạn nhất, một đoạn tả cách bạn làm việc, và bạn nghiêng về con người hay hệ thống.',
    en: 'The five planets closest to you, a short description of how you work, and whether you lean towards people or systems.',
  },
  'quiz.topTitle': {
    vi: 'Năm hành tinh gần bạn nhất',
    en: 'The five planets closest to you',
  },
  'quiz.topLead': {
    vi: 'Tính bằng độ khớp giữa câu trả lời của bạn và tính chất của từng hành tinh.',
    en: 'Measured by how closely your answers match the character of each planet.',
  },
  'quiz.because': { vi: 'vì bạn {reasons}', en: 'because you {reasons}' },
  'quiz.and': { vi: ' và ', en: ' and ' },
  'quiz.aboutYou': { vi: 'Về bạn', en: 'About you' },
  'quiz.aiWritten': { vi: 'AI viết · có thể chưa đúng', en: 'Written by AI · may be off' },
  'quiz.templateWritten': { vi: 'Viết theo khuôn', en: 'Template' },
  'quiz.textsPending': {
    vi: 'Phần kể ngắn của bạn chưa được đọc. Chân dung lúc này chỉ dựa trên các câu chọn.',
    en: 'Your written answers have not been read yet. For now the portrait is based on your choices only.',
  },
  'quiz.loading': { vi: 'Đang vẽ chân dung…', en: 'Drawing your portrait…' },
  'quiz.loadFailed': { vi: 'Không tải được chân dung', en: 'Could not load your portrait' },
  'quiz.empty': {
    vi: 'Chưa có gì để vẽ. Làm bài tự vấn hoặc chơi vài nhiệm vụ phụ.',
    en: 'Nothing to draw yet. Take the quiz or play a few side quests.',
  },
  'quiz.portrait': { vi: 'Tám chiều', en: 'Eight dimensions' },
  'quiz.dimensions': { vi: '8 chiều', en: '8 dimensions' },
  'quiz.showDimensions': { vi: 'Xem 8 chiều', en: 'Show the 8 dimensions' },
  'quiz.openMap': { vi: 'Mở toàn bản đồ', en: 'Open the full map' },
  'quiz.caveat': {
    vi: 'Bài này chưa được kiểm định, nên chưa đủ để kết luận về tính cách. Đây là gợi ý hướng khám phá, không phải kết quả đo.',
    en: 'This quiz is not validated yet, so it cannot conclude anything about your personality. Treat it as a direction to explore, not a measurement.',
  },

  /* ── Chỉ số xã hội ── */
  'social.title': { vi: 'Chỉ số xã hội', en: 'Social index' },
  'social.explain': {
    vi: 'Bạn thích làm việc qua con người hay qua hệ thống, công cụ, dữ liệu. Không bên nào tốt hơn.',
    en: 'Whether you prefer working through people or through systems, tools and data. Neither is better.',
  },
  'social.things': { vi: 'Hệ thống', en: 'Systems' },
  'social.people': { vi: 'Con người', en: 'People' },
  'social.label.things': { vi: 'Thiên về hệ thống', en: 'Leans towards systems' },
  'social.label.balanced': { vi: 'Cân bằng', en: 'Balanced' },
  'social.label.people': { vi: 'Thiên về con người', en: 'Leans towards people' },
  'social.basis': {
    vi: 'Từ {quiz} câu tự vấn và {play} lựa chọn khi chơi',
    en: 'From {quiz} quiz answers and {play} choices in play',
  },
  'social.none': {
    vi: 'Chưa có chỉ số. Làm bài tự vấn hoặc chơi vài nhiệm vụ phụ.',
    en: 'No index yet. Take the quiz or play a few side quests.',
  },

  /* ── Tám chiều, dạng ngắn để ghép câu "vì bạn …" ── */
  'dim.INTERRUPT': { vi: 'chịu được bị ngắt quãng', en: 'handle interruptions' },
  'dim.DEEP_WORK': { vi: 'thích tập trung sâu', en: 'like deep focus' },
  'dim.AMBIGUITY': { vi: 'không ngại việc mơ hồ', en: 'are fine with vague work' },
  'dim.DETAIL': { vi: 'tỉ mỉ', en: 'are meticulous' },
  'dim.PEOPLE': { vi: 'thích làm việc với người', en: 'like working with people' },
  'dim.VISIBLE': { vi: 'thích thấy kết quả rõ', en: 'like visible results' },
  'dim.REPETITION': { vi: 'chịu được việc lặp lại', en: 'tolerate repetition' },
  'dim.PRESSURE': { vi: 'chịu được áp lực', en: 'handle pressure' },

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
  'dash.takeQuiz': { vi: 'Làm bài tự vấn', en: 'Take the quiz' },

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
  'profile.hardSkills': { vi: 'Kỹ năng cứng', en: 'Hard skills' },
  'profile.hardHint': { vi: 'kỹ thuật, công cụ', en: 'technical, tools' },
  'profile.softSkills': { vi: 'Kỹ năng mềm', en: 'Soft skills' },
  'profile.softHint': { vi: 'cách làm việc với người', en: 'working with people' },
  'profile.position': { vi: 'Đang ở', en: 'Currently at' },
  'profile.noPosition': {
    vi: 'Chưa đặt chân lên hành tinh nào',
    en: 'Not on any planet yet',
  },
  'profile.breakdown': { vi: 'Điểm đến từ đâu', en: 'Where points come from' },
  'profile.noPointsYet': {
    vi: 'Chưa có điểm. Nhiệm vụ chính cho điểm theo kỹ năng, nhiệm vụ phụ cho điểm đều.',
    en: 'No points yet. Main quests score by skill; side quests award flat points.',
  },
  'profile.bandPath': { vi: 'Lộ trình cấp bậc', en: 'Career path' },
  'profile.unlocked': { vi: 'đã mở', en: 'unlocked' },
  'profile.missing': { vi: 'thiếu {count} điểm', en: '{count} points to go' },
  'profile.noScenario': { vi: 'chưa có nhiệm vụ', en: 'no quest yet' },
  'profile.mainDone': { vi: 'xong nhiệm vụ chính', en: 'main quest done' },
  'profile.inProgress': { vi: 'đang làm', en: 'in progress' },
  'profile.nextUnlocked': { vi: '{band} đã mở', en: '{band} unlocked' },
  'profile.retakeQuiz': { vi: 'Làm lại tự vấn', en: 'Retake' },
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
  'career.tabRoadmap': { vi: 'Lộ trình', en: 'Roadmap' },
  'career.tabRelated': { vi: 'Nghề lân cận', en: 'Related' },
  'career.stagesDone': { vi: '{done}/{total} chặng đã qua', en: '{done}/{total} stages done' },
  'career.pickStage': {
    vi: 'Bấm vào một chặng trên con đường để xem trong đó có gì.',
    en: 'Pick a stage on the path to see what is inside.',
  },

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
