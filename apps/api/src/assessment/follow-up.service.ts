/**
 * Hỏi vặn (AI-4) cho một câu tự luận mà engine đã cho phép hỏi (CL-04
 * `FollowUpService`).
 *
 * Dùng contract một câu follow-up (`NarratorService.narrate`): kịch bản đang
 * chơi được vẫn ở dạng activity; contract theo nhịp (D-130) cần seed dạng cảnh
 * mà runtime chưa có.
 *
 * AI-4 không cho được câu qua luật (hết model, hết giờ, bị lọc) thì dùng câu
 * hỏi vặn chuyên gia soạn sẵn cho hoạt động đó (SD-01 "Use default follow-up";
 * report §5.3.6). Không có câu soạn sẵn thì không hỏi, hoạt động đóng như
 * thường. Không bao giờ viết câu giả thay model (D-92).
 */
import { Injectable } from '@nestjs/common';
import {
  npcDisplayName,
  type KnownIdentity,
  type PlayEvent,
  type Provenance,
  type Scenario,
} from '@datn/game-core';
import { NARRATOR_PROFILE } from '../ai/narrator/narrator.profile';
import type { TranscriptLine } from '../ai/narrator/narrator.prompt';
import {
  NarratorService,
  type NarratorCallRecord,
} from '../ai/narrator/narrator.service';
import { NARRATOR_PROMPT_VERSION } from '../ai/narrator/prompts/narrator.v2';
import { ContentService } from '../content/content.service';
import type { UsageRow } from './usage';

export type FollowUpAsked = Extract<PlayEvent, { type: 'FOLLOWUP_ASKED' }>;

export interface FollowUpDecision {
  /** `null`: không hỏi, đóng hoạt động. */
  asked: FollowUpAsked | null;
  /** Vì sao không dùng câu của AI-4, để ghi log; `null` khi AI-4 cho câu dùng được. */
  aiOutcome: string | null;
  usage: UsageRow[];
}

export interface FollowUpInput {
  scenario: Scenario;
  scenarioKey: string;
  contentVersion: number;
  activityKey: string;
  transcript: TranscriptLine[];
  answer: string;
  identity: KnownIdentity;
}

@Injectable()
export class FollowUpService {
  constructor(
    private readonly narrator: NarratorService,
    private readonly content: ContentService,
  ) {}

  async decide(input: FollowUpInput): Promise<FollowUpDecision> {
    const result = await this.narrator.narrate({
      scenario: input.scenario,
      contentVersion: input.contentVersion,
      activityId: input.activityKey,
      transcript: input.transcript,
      answer: input.answer,
      followUpAllowed: true,
      identity: input.identity,
    });
    const usage = result.records.map(narratorUsage);

    if (result.status === 'ok') {
      const accepted =
        result.records.find((r) => r.outcome === 'accepted') ?? null;
      const provenance: Provenance | null = accepted && {
        modelKey: accepted.modelKey,
        promptVersion: `${NARRATOR_PROMPT_VERSION} · ${NARRATOR_PROFILE.version}`,
        costUsd: result.cost.usd,
        latencyMs: accepted.latencyMs,
      };
      return {
        asked: {
          type: 'FOLLOWUP_ASKED',
          activityKey: input.activityKey,
          followupNo: 1,
          npcKey: result.line.speaker,
          name: npcDisplayName(input.scenario, result.line.speaker),
          question: result.line.follow_up,
          source: 'ai',
          provenance,
        },
        aiOutcome: null,
        usage,
      };
    }

    const reason =
      result.status === 'unavailable'
        ? `unavailable:${result.reason}`
        : result.status;
    const lookup = await this.content.followupLookup(
      input.contentVersion,
      input.scenarioKey,
    );
    const line = lookup(input.activityKey);
    return {
      asked: line
        ? {
            type: 'FOLLOWUP_ASKED',
            activityKey: input.activityKey,
            followupNo: 1,
            npcKey: line.who,
            name: npcDisplayName(input.scenario, line.who),
            question: line.text,
            source: 'expert_default',
            provenance: null,
          }
        : null,
      aiOutcome: reason,
      usage,
    };
  }
}

const narratorUsage = (r: NarratorCallRecord): UsageRow => ({
  role: 'narrator',
  modelId: r.modelKey,
  tokensIn: r.usage?.input ?? 0,
  tokensOut: r.usage?.output ?? 0,
  costUsd: r.cost?.usd ?? 0,
  latencyMs: r.latencyMs,
  succeeded: r.outcome === 'accepted',
});
