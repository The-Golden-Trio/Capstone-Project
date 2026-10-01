/**
 * Bản tiếng Anh cho phần nội dung lấy từ bộ dữ liệu.
 *
 * Bộ dữ liệu (`occupation-data`) viết bằng tiếng Việt và là dữ liệu nghiên cứu
 * của đồ án, nên không dịch thẳng trong đó. Thay vào đó, ở đây phủ một lớp
 * tiếng Anh tra theo đúng id của dữ liệu — không có bản dịch thì rơi về tiếng
 * Việt gốc.
 *
 * Phạm vi cố ý hẹp: các câu Get to Know Me và tám chiều tính cách. Kịch bản
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
  stage: 'Where are you right now?',
  q7: 'In a group project, you usually take the part that',
  q8: 'A teammate is stuck on a bug you have seen before',
  q9: 'The deadline is tomorrow and three things are still open',
  q10: 'Work messages keep arriving while you are working',
  q11: 'You get to pick one thing to fix',
  q12: 'For the same job, you would rather work at',
  q13: 'You need to win the team over to your solution',
  q14: 'Before every release, your checks are',
  t1: 'Tell us about a time you did something and lost track of time. What were you doing — alone or with whom?',
  t2: 'What kind of work or environment drains you the most? Why?',
  t3: 'Five years from now, if someone filmed your ideal working day, what would they see you doing?',
};

/** Gợi ý dưới câu tự luận, tra theo `question_id`. */
export const QUIZ_HINT_EN: Record<string, string> = {
  t1: 'It does not have to be study or work. Gaming, a school project, organising an event… all count.',
  t2: 'The more concrete the better: a situation, a feeling, a reason.',
  t3: 'Describe the scene: where you are, what you do, who with. No need to name a job.',
};

/** Lựa chọn, tra theo `option_id`. */
export const QUIZ_OPTION_EN: Record<string, string> = {
  q1a: 'Four uninterrupted hours, finishing exactly one thing',
  q1b: 'Meeting three different teams and unblocking a few things',
  q2a: 'Interesting. You dig in and propose an approach yourself',
  q2b: 'You ask what goes in and what should come out before starting',
  q3a: 'You open the laptop and fix it. Solving an incident feels good',
  q3b: 'If this happens often, you would not last long there',
  q4a: 'Spots that the number on page 7 contradicts page 2',
  q4b: 'Sees the overall conclusion and leaves details to others',
  q5a: 'Something that runs, that you can show someone right away',
  q5b: 'A piece of groundwork nobody sees, but you know it is solid',
  q6a: 'Fine by you. Once it is muscle memory it is fast and accurate',
  q6b: 'Bearable for a few weeks, then you have to automate it',
  stage_student: 'A high-school student choosing a major',
  stage_university: 'A university student or new graduate',
  stage_switcher: 'Working already, thinking about switching careers',
  stage_curious: 'Just curious to try',
  q7a: 'Asks users and stakeholders what they really need',
  q7b: 'Is technically hardest, that few others could do',
  q8a: 'You pull up a chair and debug it together until they get it',
  q8b: 'You send the doc link and the fix, then get back to your work',
  q9a: 'Push through tonight — pressure like this makes you faster',
  q9b: 'You hate this, so you would have split the work last week',
  q10a: 'Reply as they come, so nobody waits on you',
  q10b: 'Mute notifications and batch replies twice a day',
  q11a: 'The checkout flow customers complain is hard to use',
  q11b: 'A slow query nobody sees but that is costing money',
  q12a: 'A stable product with a steady, clear rhythm',
  q12b: 'A startup where priorities can change every week',
  q13a: 'Present it in a meeting and answer questions on the spot',
  q13b: 'Write a careful doc with numbers for people to read',
  q14a: 'A fixed checklist you follow step by step every time',
  q14b: 'Different each time, depending on what changed',
};
