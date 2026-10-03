import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  MIN_ANSWER_LENGTH,
  SIDE_QUEST_POINTS,
  applySignal,
  bandsOf,
  blankFit,
  matchChoice,
  questKind,
  sideQuestsFor,
  type FitVector,
  type GameEvent,
  type GameIndex,
  type QuestKind,
  type Role,
} from '@datn/game-core';
import { ContentService } from '../content/content.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';

export interface GameProfileView {
  /** Tổng chân dung: phần từ bài tự vấn cộng phần từ các nhiệm vụ phụ. */
  fit: FitVector;
  quizDone: boolean;
  eventsPlayed: number;
  doneEventIds: string[];
}

/** Kết quả một lần trả lời nhiệm vụ phụ. */
export interface EventAnswerResult extends GameProfileView {
  outcome: string;
  /** Điểm kỹ năng vừa trao — 0 nếu nhiệm vụ này đã tính ở cấp bậc này rồi. */
  pointsAwarded: number;
  /** Tổng điểm của cấp bậc sau khi cộng. */
  bandPoints: number;
  /** Cấp bậc kế vừa mở nhờ lần này, nếu có. */
  unlockedBand: string | null;
  /** Hướng xử lý mà máy chủ đọc ra từ câu trả lời — để nói lại cho người chơi. */
  readAs: string;
}

/**
 * Phần hồ sơ không mở khoá gì: chân dung 8 chiều và các mốc đã qua.
 *
 * Khác với điểm kỹ năng, chân dung không quyết định quyền chơi gì — nó chỉ
 * gợi ý nên ghé hành tinh nào. Nhưng vẫn để máy chủ cộng: máy khách gửi lên
 * "đã chọn phương án số mấy", tín hiệu tương ứng thì tra từ bộ dữ liệu. Nhờ
 * vậy chân dung là suy ra được, không phải khai báo.
 *
 * Chỉ phần đến từ bài tự vấn được lưu; phần đến từ nhiệm vụ phụ cộng lại từ
 * bảng EventAnswer mỗi lần đọc. Làm lại bài tự vấn hay đổi một lựa chọn cũ
 * đều không thể làm lệch tổng, vì không có tổng nào được lưu để mà lệch.
 */
@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progress: ProgressService,
    private readonly content: ContentService,
  ) {}

  private ensureProfile(userId: string) {
    return this.prisma.gameProfile.upsert({
      where: { userId },
      create: { userId, quizFit: blankFit() },
      update: {},
    });
  }

  async get(userId: string): Promise<GameProfileView> {
    const [profile, answers, index] = await Promise.all([
      this.ensureProfile(userId),
      this.prisma.eventAnswer.findMany({ where: { userId } }),
      this.content.index(),
    ]);

    return {
      fit: addFit(readFit(profile.quizFit), fitFromAnswers(answers, index)),
      quizDone: profile.quizDone,
      eventsPlayed: profile.eventsPlayed,
      doneEventIds: answers.map((a) => a.eventId),
    };
  }

  /** Ghi kết quả bài tự vấn: tra tín hiệu của từng lựa chọn từ bộ câu hỏi. */
  async submitQuiz(
    userId: string,
    answers: Array<{ questionId: string; optionId: string }>,
  ): Promise<GameProfileView> {
    const { quiz } = (await this.content.index()).data;
    let quizFit = blankFit();

    for (const answer of answers) {
      const question = quiz.questions.find(
        (q) => q.question_id === answer.questionId,
      );
      const option = question?.options.find(
        (o) => o.option_id === answer.optionId,
      );
      if (!option) {
        throw new BadRequestException(
          `Câu trả lời không hợp lệ: ${answer.questionId}/${answer.optionId}`,
        );
      }
      quizFit = applySignal(quizFit, option.signal);
    }

    await this.prisma.gameProfile.upsert({
      where: { userId },
      create: { userId, quizFit, quizDone: true },
      update: { quizFit, quizDone: true },
    });

    return this.get(userId);
  }

  /**
   * Trả lời một nhiệm vụ phụ.
   *
   * Hai sổ được ghi, vì chúng trả lời hai câu khác nhau:
   *
   *   • chân dung — mỗi nhiệm vụ chỉ nói một lần. Đổi lựa chọn thì thay, không
   *     cộng đôi, nếu không vector tính cách phình theo số lần bấm.
   *   • tiến trình — một điểm kỹ năng cho cấp bậc đang học, tính một lần cho
   *     mỗi cặp (nhiệm vụ, cấp bậc). Đây là con đường duy nhất qua những cấp
   *     bậc chưa dựng nhiệm vụ chính.
   *
   * `band` do máy khách gửi lên nên KHÔNG tin được: nó quyết định điểm rơi vào
   * đâu, tức là quyết định mở khoá. Máy chủ kiểm lại cả ba điều — cấp bậc có
   * thuộc nghề này không, đã mở chưa, và đã ghi danh chưa — trước khi cộng.
   */
  async answerEvent(
    userId: string,
    roleCode: string,
    band: string,
    eventId: string,
    input: { answer?: string; choiceIndex?: number },
  ): Promise<EventAnswerResult> {
    const index = await this.content.index();
    const role = index.findRole(roleCode);
    if (!role) throw new BadRequestException('Không có nghề này');

    const event = index.findEvent(role, eventId);
    if (!event) throw new BadRequestException('Không có sự kiện này');

    if (!bandsOf(role).includes(band)) {
      throw new BadRequestException('Nghề này không có cấp bậc đó');
    }
    // Mỗi cấp bậc chỉ bày ra 3–4 nhiệm vụ phụ. Không kiểm lại ở đây thì máy
    // khách nộp được cả 11 nhiệm vụ của nghề vào cùng một cấp bậc và gom gấp
    // ba số điểm lẽ ra có. Danh sách sinh bằng hàm thuần nên hai bên luôn
    // đồng ý với nhau về việc cấp bậc này có những nhiệm vụ nào.
    if (
      !sideQuestsFor(role, band, index).some((e) => e.event_id === eventId)
    ) {
      throw new BadRequestException(
        `Nhiệm vụ này không thuộc cấp bậc ${band}`,
      );
    }
    if (!(await this.progress.isUnlocked(userId, role, band))) {
      throw new ForbiddenException(`Cấp bậc ${band} chưa mở`);
    }
    if (!(await this.progress.isEnrolled(userId, roleCode, band))) {
      throw new ForbiddenException(`Chưa ghi danh cấp bậc ${band}`);
    }

    // Kiểu hỏi quyết định dạng trả lời được nhận. Không kiểm thì một câu tự
    // luận vẫn nộp được bằng số thứ tự phương án, tức là bỏ qua đúng phần
    // bắt người chơi phải tự nghĩ.
    const choiceIndex = resolveChoice(role, band, event, input, index);
    const choice = event.choices[choiceIndex];

    const [existingAnswer, existingAward] = await Promise.all([
      this.prisma.eventAnswer.findUnique({
        where: { userId_eventId: { userId, eventId } },
        select: { id: true },
      }),
      this.prisma.eventAward.findUnique({
        where: { userId_eventId_band: { userId, eventId, band } },
        select: { id: true },
      }),
    ]);

    const pointsAwarded = existingAward ? 0 : SIDE_QUEST_POINTS;

    const bandPoints = await this.prisma.$transaction(async (tx) => {
      await tx.eventAnswer.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: { userId, eventId, roleCode, band, choiceIndex },
        update: { choiceIndex, roleCode, band, answeredAt: new Date() },
      });

      // `eventsPlayed` đếm số sự kiện khác nhau đã chơi, nên chỉ tăng lần đầu.
      if (!existingAnswer) {
        await tx.gameProfile.update({
          where: { userId },
          data: { eventsPlayed: { increment: 1 } },
        });
      }

      if (!pointsAwarded) {
        const row = await tx.userBandSkill.findUnique({
          where: { userId_roleCode_band: { userId, roleCode, band } },
          select: { points: true },
        });
        return row?.points ?? 0;
      }

      await tx.eventAward.create({
        data: { userId, roleCode, band, eventId, points: pointsAwarded },
      });

      const skill = await tx.userBandSkill.upsert({
        where: { userId_roleCode_band: { userId, roleCode, band } },
        create: { userId, roleCode, band, points: pointsAwarded },
        update: { points: { increment: pointsAwarded } },
        select: { points: true },
      });
      return skill.points;
    });

    return {
      ...(await this.get(userId)),
      outcome: choice.outcome,
      readAs: choice.text,
      pointsAwarded,
      bandPoints,
      unlockedBand: pointsAwarded
        ? await this.progress.unlockedAfter(userId, roleCode, band)
        : null,
    };
  }

  /**
   * Nhập tiến trình cũ lưu trong localStorage.
   *
   * Chỉ nhận chân dung và các mốc đã qua — KHÔNG nhận điểm kỹ năng. Điểm kỹ
   * năng mở cấp bậc, mà bản lưu cũ nằm trong trình duyệt nên ai cũng sửa
   * được; nhận vào là mở toang đúng cái cửa vừa khoá. Người chơi cũ vẫn phải
   * chơi lại các kịch bản để lấy điểm, nhưng chân dung thì giữ được.
   */
  async importLegacy(
    userId: string,
    legacy: { fit?: FitVector; quizDone?: boolean; eventsPlayed?: number },
  ): Promise<GameProfileView> {
    const profile = await this.ensureProfile(userId);

    await this.prisma.gameProfile.update({
      where: { userId },
      data: {
        quizFit: addFit(readFit(profile.quizFit), readFit(legacy.fit)),
        quizDone: profile.quizDone || Boolean(legacy.quizDone),
        eventsPlayed: Math.max(profile.eventsPlayed, legacy.eventsPlayed ?? 0),
      },
    });

    return this.get(userId);
  }
}

/* ── Hàm thuần ─────────────────────────────────────────────────────── */

/**
 * Quy câu trả lời về số thứ tự của một hướng, theo đúng kiểu mà nhiệm vụ hỏi.
 *
 * Câu tự luận thì máy chủ đọc; câu chọn hay xếp thứ tự thì máy khách đã quyết
 * định và chỉ cần kiểm số có hợp lệ không. Hai đường đi, một kết quả — phần
 * cộng điểm phía sau không cần biết người chơi đã tới đó bằng cách nào.
 */
function resolveChoice(
  role: Role,
  band: string,
  event: GameEvent,
  input: { answer?: string; choiceIndex?: number },
  index: GameIndex,
): number {
  const kind: QuestKind = questKind(role, band, event.event_id, index);

  if (kind === 'WRITE') {
    if (input.answer === undefined) {
      throw new BadRequestException('Nhiệm vụ này phải tự viết câu trả lời');
    }
    if (input.answer.trim().length < MIN_ANSWER_LENGTH) {
      throw new BadRequestException(
        `Viết dài hơn một chút (ít nhất ${MIN_ANSWER_LENGTH} ký tự) để mình hiểu bạn định làm gì.`,
      );
    }

    // Không đoán bừa: đọc không ra hướng nào thì mời viết rõ hơn, chứ chấm
    // một người theo hướng họ không hề chọn thì còn tệ hơn là không chấm.
    const match = matchChoice(event, input.answer);
    if (!match) {
      throw new BadRequestException(
        'Chưa rõ bạn định làm gì. Viết cụ thể hơn: bạn sẽ làm gì trước, và vì sao.',
      );
    }
    return match.choiceIndex;
  }

  if (input.choiceIndex === undefined) {
    throw new BadRequestException('Nhiệm vụ này phải chọn một phương án');
  }
  if (!event.choices[input.choiceIndex]) {
    throw new BadRequestException('Phương án không hợp lệ');
  }
  return input.choiceIndex;
}

const readFit = (value: unknown): FitVector => {
  const base = blankFit();
  if (value && typeof value === 'object') {
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (key in base && typeof raw === 'number') base[key] = raw;
    }
  }
  return base;
};

const addFit = (a: FitVector, b: FitVector): FitVector => {
  const out = blankFit();
  for (const key of Object.keys(out)) out[key] = (a[key] ?? 0) + (b[key] ?? 0);
  return out;
};

const fitFromAnswers = (
  answers: Array<{ roleCode: string; eventId: string; choiceIndex: number }>,
  index: GameIndex,
): FitVector => {
  let fit = blankFit();
  for (const answer of answers) {
    const role = index.findRole(answer.roleCode);
    if (!role) continue;
    const event = index.eventsForRole(role).find((e) => e.event_id === answer.eventId);
    const choice = event?.choices[answer.choiceIndex];
    if (choice) fit = applySignal(fit, choice.signal);
  }
  return fit;
};
