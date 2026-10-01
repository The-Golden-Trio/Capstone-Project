/**
 * Đoạn mô tả viết bằng khuôn cố định — đường lui khi không có AI.
 *
 * Tất định: cùng dữ kiện thì ra cùng câu. Giữ đúng luật của bản AI viết: tả
 * cách làm việc, nêu một điều có thể khó, và không bảo người chơi chọn nghề
 * nào.
 */
import type { SocialLabel } from '@datn/game-core';
import type {
  DescriptionWriter,
  PortraitFacts,
  PortraitLocale,
  WrittenDescription,
} from './portrait-ai';

/** Mỗi chiều: vế dương ("bạn …") và vế âm ("ít hứng thú khi …"). */
const PHRASES: Record<PortraitLocale, Record<string, [string, string]>> = {
  vi: {
    INTERRUPT: ['xoay xở tốt khi bị ngắt quãng', 'bị ngắt quãng liên tục'],
    DEEP_WORK: ['thích tập trung sâu vào một việc', 'phải ngồi một mình với một việc thật lâu'],
    AMBIGUITY: ['thấy hứng thú với yêu cầu còn mơ hồ', 'yêu cầu còn mơ hồ, thiếu thông tin'],
    DETAIL: ['để ý tới từng chi tiết nhỏ', 'phải soát từng chi tiết nhỏ'],
    PEOPLE: ['thích làm việc và thuyết phục người khác', 'phải trao đổi với nhiều người suốt ngày'],
    VISIBLE: ['cần thấy kết quả công việc rõ ràng', 'phải liên tục cho người khác thấy kết quả'],
    REPETITION: ['chịu được việc lặp lại đều đặn', 'việc cứ lặp đi lặp lại'],
    PRESSURE: ['làm tốt dưới áp lực thời gian', 'áp lực thời gian và sự cố dồn dập'],
  },
  en: {
    INTERRUPT: ['cope well with interruptions', 'you are interrupted all the time'],
    DEEP_WORK: ['like to focus deeply on one thing', 'you must sit alone with one task for long stretches'],
    AMBIGUITY: ['enjoy requests that are still vague', 'requests are vague and information is missing'],
    DETAIL: ['notice small details', 'you have to check every small detail'],
    PEOPLE: ['like working with and persuading people', 'you talk to many people all day'],
    VISIBLE: ['need to see clear results from your work', 'you must keep showing results to others'],
    REPETITION: ['are fine with steady, repeated work', 'the work repeats over and over'],
    PRESSURE: ['do well under time pressure', 'deadlines and incidents pile up'],
  },
};

const SOCIAL: Record<PortraitLocale, Record<SocialLabel, string>> = {
  vi: {
    people: 'Bạn nghiêng về làm việc qua con người: trao đổi, thuyết phục, gỡ rối cho người khác.',
    balanced: 'Bạn khá cân bằng giữa làm việc với người và làm việc với hệ thống.',
    things: 'Bạn nghiêng về làm việc với hệ thống, công cụ và dữ liệu hơn là với người.',
  },
  en: {
    people: 'You lean towards working through people: talking things through, persuading, unblocking others.',
    balanced: 'You are fairly balanced between working with people and working with systems.',
    things: 'You lean towards working with systems, tools and data rather than with people.',
  },
};

export function templateDescription(facts: PortraitFacts): string {
  const locale = facts.locale;
  const phrases = PHRASES[locale];
  const likes = facts.strengths
    .filter((s) => phrases[s.dimension])
    .slice(0, 2)
    .map((s) => phrases[s.dimension][0]);
  const dislike = facts.aversions.find((a) => phrases[a.dimension]);
  const sentences: string[] = [];

  if (likes.length > 0) {
    const joined = likes.join(locale === 'en' ? ' and ' : ' và ');
    const avoid = dislike ? phrases[dislike.dimension][1] : null;
    sentences.push(
      locale === 'en'
        ? `You seem to ${joined}${avoid ? `, but may find it hard when ${avoid}` : ''}.`
        : `Bạn có vẻ ${joined}${avoid ? `, nhưng có thể thấy khó khi ${avoid}` : ''}.`,
    );
  }
  if (facts.social) sentences.push(SOCIAL[locale][facts.social.label]);
  if (facts.topRoles.length > 0) {
    const roles = facts.topRoles.slice(0, 2).join(locale === 'en' ? ' and ' : ' và ');
    sentences.push(
      locale === 'en'
        ? `${roles} could be good places to start — try them and judge for yourself.`
        : `${roles} có thể là chỗ bắt đầu — hãy chơi thử rồi tự cảm nhận.`,
    );
  }
  if (sentences.length === 0) {
    return locale === 'en'
      ? 'There is not enough yet to describe how you like to work. Take the quiz or play a few tasks.'
      : 'Chưa đủ dữ kiện để tả cách bạn làm việc. Hãy làm bài tự vấn hoặc chơi vài nhiệm vụ.';
  }
  return sentences.join(' ');
}

export class TemplateDescriptionWriter implements DescriptionWriter {
  async write(facts: PortraitFacts): Promise<WrittenDescription> {
    return { text: templateDescription(facts), model: 'template' };
  }
}
