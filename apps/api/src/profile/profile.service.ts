import { BadRequestException, Injectable } from '@nestjs/common';
import {
  GAME,
  applySignal,
  blankFit,
  eventsForRole,
  findEvent,
  findRole,
  type FitVector,
} from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';

export interface GameProfileView {
  /** Tổng chân dung: phần từ bài tự vấn cộng phần từ các nhiệm vụ phụ. */
  fit: FitVector;
  quizDone: boolean;
  eventsPlayed: number;
  doneEventIds: string[];
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
  constructor(private readonly prisma: PrismaService) {}

  private ensureProfile(userId: string) {
    return this.prisma.gameProfile.upsert({
      where: { userId },
      create: { userId, quizFit: blankFit() },
      update: {},
    });
  }

  async get(userId: string): Promise<GameProfileView> {
    const [profile, answers] = await Promise.all([
      this.ensureProfile(userId),
      this.prisma.eventAnswer.findMany({ where: { userId } }),
    ]);

    return {
      fit: addFit(readFit(profile.quizFit), fitFromAnswers(answers)),
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
    let quizFit = blankFit();

    for (const answer of answers) {
      const question = GAME.quiz.questions.find(
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

  /** Trả lời một nhiệm vụ phụ. Trả lời lại thì thay lựa chọn, không cộng đôi. */
  async answerEvent(
    userId: string,
    roleCode: string,
    band: string,
    eventId: string,
    choiceIndex: number,
  ): Promise<GameProfileView & { outcome: string }> {
    const role = findRole(roleCode);
    if (!role) throw new BadRequestException('Không có nghề này');

    const event = findEvent(role, eventId);
    if (!event) throw new BadRequestException('Không có sự kiện này');

    const choice = event.choices[choiceIndex];
    if (!choice) throw new BadRequestException('Lựa chọn không hợp lệ');

    const existing = await this.prisma.eventAnswer.findUnique({
      where: { userId_eventId: { userId, eventId } },
      select: { id: true },
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.eventAnswer.upsert({
        where: { userId_eventId: { userId, eventId } },
        create: { userId, eventId, roleCode, band, choiceIndex },
        update: { choiceIndex, roleCode, band, answeredAt: new Date() },
      });

      // `eventsPlayed` đếm số sự kiện khác nhau đã chơi, nên chỉ tăng lần đầu.
      if (!existing) {
        await tx.gameProfile.update({
          where: { userId },
          data: { eventsPlayed: { increment: 1 } },
        });
      }
    });

    return { ...(await this.get(userId)), outcome: choice.outcome };
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
): FitVector => {
  let fit = blankFit();
  for (const answer of answers) {
    const role = findRole(answer.roleCode);
    if (!role) continue;
    const event = eventsForRole(role).find((e) => e.event_id === answer.eventId);
    const choice = event?.choices[answer.choiceIndex];
    if (choice) fit = applySignal(fit, choice.signal);
  }
  return fit;
};
