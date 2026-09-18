/**
 * Bản tiếng Anh cho phần nội dung lấy từ bộ dữ liệu.
 *
 * Bộ dữ liệu (`occupation-data`) viết bằng tiếng Việt và là dữ liệu nghiên cứu
 * của đồ án, nên không dịch thẳng trong đó. Thay vào đó, ở đây phủ một lớp
 * tiếng Anh tra theo đúng id của dữ liệu — không có bản dịch thì rơi về tiếng
 * Việt gốc.
 *
 * Phạm vi cố ý hẹp: sáu câu Get to Know Me và tám chiều tính cách. Kịch bản
 * nghề, thoại NPC và kết cục vẫn là tiếng Việt — dịch chỗ đó là việc biên soạn
 * nội dung, không phải việc của giao diện, và giao diện sẽ nói rõ điều đó.
 */

/** Tám chiều tính cách, tra theo khoá trong `GAME.fit_dimensions`. */
export const DIMENSION_EN: Record<string, string> = {
  INTERRUPT: 'Handles interruptions and after-hours calls',
  DEEP_WORK: 'Prefers deep focus, working alone',
  AMBIGUITY: 'Copes with vague, under-specified requests',
  DETAIL: 'Meticulous, notices small details',
  PEOPLE: 'Enjoys working with and persuading people',
  VISIBLE: 'Needs to see visible results',
  REPETITION: 'Tolerates repetitive work',
  PRESSURE: 'Holds up under time pressure and incidents',
};

/** Câu hỏi, tra theo `question_id`. */
export const QUIZ_PROMPT_EN: Record<string, string> = {
  q1: 'Your ideal working afternoon looks like',
  q2: 'You get a request that is one sentence long and says little',
  q3: 'The phone rings at 10pm — something is wrong with the system',
  q4: 'In a long report, you are usually the person who',
  q5: 'After a week of work, what feels most worth it is',
  q6: 'Work that repeats almost identically every week',
};

/** Lựa chọn, tra theo `option_id`. */
export const QUIZ_OPTION_EN: Record<string, string> = {
  q1a: 'Four uninterrupted hours, finishing exactly one thing',
  q1b: 'Meeting three different teams and unblocking a few things',
  q2a: 'Interesting. You dig in and propose an approach yourself',
  q2b: 'Frustrating. You want a clear brief before starting',
  q3a: 'You open the laptop and fix it. Solving an incident feels good',
  q3b: 'If this happens often, you would not last long there',
  q4a: 'Spots that the number on page 7 contradicts page 2',
  q4b: 'Sees the overall conclusion and leaves details to others',
  q5a: 'Something that runs, that you can show someone right away',
  q5b: 'A piece of groundwork nobody sees, but you know it is solid',
  q6a: 'Fine by you. Once it is muscle memory it is fast and accurate',
  q6b: 'Bearable for a few weeks, then you have to automate it',
};
