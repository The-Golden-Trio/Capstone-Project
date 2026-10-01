import { Inject, Injectable } from '@nestjs/common';
import {
  DIMENSIONS,
  orientationFromEvents,
  socialIndex,
  topMatches,
  type SocialIndex,
} from '@datn/game-core';
import { PrismaService } from '../prisma/prisma.service';
import {
  PORTRAIT_AI,
  type PortraitAi,
  type PortraitFacts,
  type PortraitLocale,
} from './ai/portrait-ai';
import { templateDescription } from './ai/template-description';
import {
  ProfileService,
  readQuizTexts,
  textOrientation,
  type ProfileState,
} from './profile.service';

/** Bản AI viết hỏng thì bản khuôn được giữ ít nhất chừng này rồi mới thử lại. */
const LLM_RETRY_AFTER_MS = 10 * 60 * 1000;

export interface PortraitMatch {
  roleCode: string;
  name: string;
  nameEn: string;
  bandStart: string;
  /** Cosine 0–1. */
  score: number;
  reasons: string[];
}

export interface PortraitView {
  quizDone: boolean;
  /** Đúng năm nghề (FR-10), rỗng khi chưa có hồ sơ. */
  top: PortraitMatch[];
  socialIndex: SocialIndex | null;
  description: {
    text: string;
    source: 'llm' | 'template';
    generatedAt: string;
  } | null;
  /** Có câu tự luận chưa được AI đọc. */
  textsPending: boolean;
}

/**
 * "Chân dung" (FR-10, FR-13): năm nghề hợp nhất, chỉ số xã hội và đoạn mô
 * tả người chơi.
 *
 * Năm nghề và chỉ số tính lại mỗi lần đọc từ những gì đã lưu, nên luôn theo
 * kịp lượt chơi mới. Đoạn mô tả thì tốn một lần gọi AI, nên chỉ viết lại khi
 * "nền" của nó đổi: làm lại bài, năm nghề đổi, nhãn chỉ số đổi, đổi ngôn ngữ.
 */
@Injectable()
export class PortraitService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profile: ProfileService,
    @Inject(PORTRAIT_AI) private readonly ai: PortraitAi | null,
  ) {}

  async get(userId: string, locale: PortraitLocale): Promise<PortraitView> {
    let state = await this.profile.state(userId);
    if (await this.profile.retryTextReading(userId, state.row)) {
      state = await this.profile.state(userId);
    }
    const { row, index, view } = state;

    const top = topMatches(view.fit, index).map(({ role, score, reasons }) => ({
      roleCode: role.role_code,
      name: role.role_name_vn,
      nameEn: role.role_name,
      bandStart: role.band_start,
      score,
      reasons,
    }));

    const fromText = textOrientation(row.quizTextEvidence);
    const social = socialIndex({
      quiz: {
        sum: row.quizOrientationSum + fromText.sum,
        n: row.quizOrientationN + fromText.n,
      },
      play: orientationFromEvents(state.eventAnswers, index),
    });

    return {
      quizDone: row.quizDone,
      top,
      socialIndex: social,
      description: await this.description(userId, locale, state, top, social),
      textsPending: Boolean(row.quizTexts) && !row.quizTextReadAt,
    };
  }

  private async description(
    userId: string,
    locale: PortraitLocale,
    state: ProfileState,
    top: PortraitMatch[],
    social: SocialIndex | null,
  ): Promise<PortraitView['description']> {
    const { row } = state;
    if (top.length === 0 && !social) return null;

    const basis = JSON.stringify({
      locale,
      stage: row.stage,
      top: top.map((m) => m.roleCode),
      social: social?.label ?? null,
      textsRead: Boolean(row.quizTextReadAt),
    });

    const stale =
      row.portraitBasis !== basis ||
      !row.portraitText ||
      // Lần trước AI lỗi nên phải dùng khuôn: thử lại, nhưng không phải lần
      // đọc nào cũng thử — mỗi lần hỏng tốn tới 8 giây.
      (this.ai !== null &&
        row.portraitSource === 'template' &&
        Date.now() - (row.portraitAt?.getTime() ?? 0) > LLM_RETRY_AFTER_MS);

    if (!stale && row.portraitText && row.portraitAt) {
      return {
        text: row.portraitText,
        source: row.portraitSource === 'llm' ? 'llm' : 'template',
        generatedAt: row.portraitAt.toISOString(),
      };
    }

    const facts = portraitFacts(locale, state, top, social);
    const written = this.ai ? await this.ai.write(facts) : null;
    const text = written?.text ?? templateDescription(facts);
    const source = written ? 'llm' : 'template';
    const generatedAt = new Date();

    await this.prisma.gameProfile.update({
      where: { userId },
      data: {
        portraitText: text,
        portraitSource: source,
        portraitModel: written?.model ?? 'template',
        portraitBasis: basis,
        portraitAt: generatedAt,
      },
    });

    return { text, source, generatedAt: generatedAt.toISOString() };
  }
}

/** Dữ kiện đưa cho người viết mô tả — không có thông tin định danh (NFR-05). */
export function portraitFacts(
  locale: PortraitLocale,
  state: ProfileState,
  top: PortraitMatch[],
  social: SocialIndex | null,
): PortraitFacts {
  const { row, index, view } = state;
  const described = DIMENSIONS.map((dimension) => ({
    dimension,
    description: index.data.fit_dimensions[dimension] ?? dimension,
    value: view.fit[dimension] ?? 0,
  }));
  const texts = readQuizTexts(row.quizTexts);

  return {
    locale,
    stage: row.stage,
    strengths: described
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3),
    aversions: described
      .filter((d) => d.value < 0)
      .sort((a, b) => a.value - b.value)
      .slice(0, 2),
    social: social && { value: social.value, label: social.label },
    topRoles: top.map((m) => (locale === 'en' ? m.nameEn : m.name)),
    texts: Object.entries(texts).map(([questionId, text]) => ({
      prompt:
        index.data.quiz.questions.find((q) => q.question_id === questionId)
          ?.prompt ?? '',
      text,
    })),
  };
}
