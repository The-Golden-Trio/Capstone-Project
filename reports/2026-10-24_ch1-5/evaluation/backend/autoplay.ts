// Tự chơi một màn bằng chính engine của game-core, với hạt giống do máy chủ phát,
// để chuỗi hành động nộp lên là chuỗi máy chủ chạy lại được (giống trình duyệt thật).
import {
  runReducer,
  startRun,
  currentActivity,
} from '../../../../packages/game-core/src/domain/scenarioEngine';
import { keywordGrader } from '../../../../packages/game-core/src/domain/grading/keywordGrader';
import { mulberry32 } from '../../../../packages/game-core/src/domain/rng';

const TEXTS = [
  'Em sẽ mở log của request lỗi, tìm stack trace, rồi viết test tái hiện lỗi trước khi sửa. Sau khi sửa em chạy lại test và nhờ anh review.',
  'Em nghĩ lỗi nằm ở chỗ kiểm tra null khi khách chưa có địa chỉ. Em sẽ thêm điều kiện và kiểm lại các chỗ gọi hàm này.',
  'Em chưa chắc lắm, em sẽ hỏi lại anh về phạm vi ticket trước khi sửa để tránh đụng vào phần khác.',
  'Sửa nhanh thôi anh.',
];

export function autoplay(content: any, seed: number, pickSeed: number): any[] {
  const scenario = content.scenario;
  const followups = content.followups || {};
  const deps: any = {
    scenario,
    followupLine: (id: string) => followups[id],
    grader: keywordGrader,
    rng: mulberry32(seed),
    now: () => Date.now(),
  };
  const pick = mulberry32(pickSeed);
  const actions: any[] = [];
  let s: any = startRun(content.key, deps);
  const act = (a: any) => {
    actions.push(a);
    s = runReducer(s, a, deps);
  };
  for (let guard = 0; s.phase !== 'ended' && guard < 200; guard++) {
    if (s.phase === 'event' || s.phase === 'closing') {
      act({ type: 'CONTINUE' });
      continue;
    }
    if (s.phase === 'followup') {
      act({
        type: 'ANSWER_TEXT',
        text: TEXTS[Math.floor(pick() * TEXTS.length)],
      });
      continue;
    }
    const a = currentActivity(s, scenario);
    if (a.type === 'CHOICE')
      act({
        type: 'ANSWER_CHOICE',
        optionIndex: Math.floor(pick() * (a.options?.length ?? 1)),
      });
    else if (a.type === 'FREETEXT')
      act({
        type: 'ANSWER_TEXT',
        text: TEXTS[Math.floor(pick() * TEXTS.length)],
      });
    else if (a.type === 'ORDERING') {
      const n = s.order?.length ?? 0;
      for (let i = 0; i < 3 && n > 1; i++)
        act({
          type: 'MOVE_ITEM',
          index: Math.floor(pick() * (n - 1)),
          direction: 1,
        });
      act({ type: 'ANSWER_ORDERING' });
    } else if (a.type === 'PRIORITIZING') {
      const ids = (a.items ?? []).map((x: any) => x.id ?? x.item_id);
      const k = a.pick_count ?? 1;
      for (let i = 0; i < k; i++)
        act({
          type: 'TOGGLE_PICK',
          itemId: ids[Math.floor(pick() * ids.length)],
        });
      act({ type: 'ANSWER_PRIORITIZING' });
    } else break;
  }
  return s.phase === 'ended' ? actions : [];
}
