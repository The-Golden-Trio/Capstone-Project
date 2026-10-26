# Project context (written by the coordinator, 8 Oct 2026)

This file is not research. It states the project facts and design decisions the report must respect. Source: the project hub (`docs/project-hub/`), the report draft of 2 Oct 2026 (`reports/2026-10-02_ch1-5/report.md`), the scenario spec (`occupation-data/specs/spec-scenario-KHOI1.md`) and decisions taken by the team lead (Phúc) on 7–8 Oct 2026.

## The project

JobQuest is an "AI-native experiential career-exploration platform" (HCMUT Specialized Project, continuing as the capstone; advisor Assoc. Prof. Võ Thị Ngọc Châu). A user role-plays 10–15 minute work scenarios of an IT job in a visual-novel style, mostly answering in free text (Vietnamese or English). The system scores the answers per competency and uses the scores to unlock levels and adjacent occupations. Phase 1 covers IT occupations only. Three pilot roles: Backend, DevOps/Cloud, Business Analyst.

Four user groups: Explorer (player), Domain Expert (DE; senior practitioner, 3–4 per role, from at least two types of company, volunteers at about 7 hours each in Stage 1), Content Administrator (CA), System Administrator (SA).

Two research problems only: RP-1 grounded generation (do expert-seeded scenarios stay accurate and elicit the target competency, compared with unseeded generation?) and RP-2 validity of automated scoring (agreement of the automated judge with domain experts, quadratic weighted kappa, relative to expert–expert agreement).

Evaluation is staged. Stage A (this phase, no real experts and no real players yet): a synthetic benchmark where each free-text task has a strong reference answer and variants that each degrade exactly one rubric criterion to a known level, plus bias probes; the advisor checks about one fifth. Stage B (capstone): real responses rated blind by three experts per pilot role.

## The seed

All game content comes from a "seed": context, 2–4 characters (voice, pressure), 3–4 fixed activities ("canon events") in a defined order, required facts and numbers, response options with expert effectiveness keys, a rubric with behavioural anchors on one ordinal scale −1 / 0 / +1 / +2 per competency, hints, follow-up goals and caps, random events, endings.

## The five AI components (stated by the team lead, 8 Oct 2026)

- **AI-1, expert elicitation.** An LLM interviews Domain Experts: asks, probes and helps collect the information needed to build a seed; combines several experts' input into shared content.
- **AI-2, seed structuring.** An LLM helps the Content Administrator turn the experts' answers into the structured seed (context, characters, situations, canon events, scoring frame). Decided: the Domain Expert sets every scoring key and rubric anchor and approves the seed; CA plus AI-2 build the game frame.
- **AI-3, AI-assisted expert testing.** Because playthroughs contain many free-text answers, experts cannot review everything. AI-3 produces or collects test playthroughs, then surfaces the cases that need the expert's judgment. The expert decides. Decided: it uses both simulated answers and real human playthroughs; in the first stage the team stands in for players and experts, and results then show only that the machinery works.
- **AI-4, run-time narration.** From the seed, writes connecting narration and follow-up questions that fit the player's free-text answers.
- **AI-5, scoring.** Scores the player's answers "as a real Domain Expert would" and adds the result to the relevant skills. Decided: the feedback text shown to the player is written from AI-5's output.

Outside the five components: the optional orientation conversation and de-identification of answers before they are sent to a model provider.

## Decisions already taken that the solution must respect

- Canon content is displayed verbatim from the seed; the game engine, not the model, controls the order of activities; at run time the model's text is checked only by deterministic rules, and model-based checking is done offline (proposed decision D-89, direction approved 7 Oct).
- AI-5 is a panel of three LLM judges from different model families; ONE call per judge scores all competencies of an answer; output order is verbatim quote, rationale, level; the panel median is the score; answers where judges differ by more than one level are flagged for expert review but the median is returned immediately.
- Design constraint DC-01: "The assessor and generator shall use different model families." DC-02: the model provider must be replaceable without changing core application logic. DC-03: compliance with Vietnam's Law on Personal Data Protection (Law 91/2025/QH15) and Decree 356/2025/NĐ-CP; sending a user's answer to a foreign model provider is a cross-border transfer. Synthetic Stage A answers must be written by a family different from every judge. Consequence noted by the team: four model families are needed (one for generation tasks AI-1, AI-2, AI-4 and simulated answers; three for the AI-5 panel).
- Non-functional requirements: scenario generation within 5 s at the 95th percentile (NFR-01); scoring of a free-text answer within 8 s at p95 (NFR-02); on provider failure no committed progress is lost (NFR-04); Vietnamese and English (NFR-08); adding an occupation requires no code change (NFR-10); mean model cost per session within a configured ceiling (NFR-11); scoring meets QWK ≥ 0.70, standardised mean difference ≤ 0.15, at most 0.10 below expert–expert agreement (NFR-14); generated scenarios preserve at least 95% of required facts (NFR-15, proposed target).
- No user revenue: the platform is free, funded by grants, sponsorship and donations, so cost per session matters.
- Stack: back end TypeScript (NestJS), front end React, PostgreSQL; offline evaluation scripts may be Python. Proposed tooling: Inspect AI (UK AI Security Institute) as the offline harness with scikit-learn and the `krippendorff` package; at run time a thin TypeScript module over a provider SDK with zod structured output.
- The current prototype has no AI: two hand-written scenarios and keyword-matching grading written per scenario.

## What the advisor has asked about the AI part

1. Does the judging model need to be stronger than the generating model?
2. A framework for the LLM judge.
3. Benchmarks.
4. Scoring the play process and quality-assuring generated scenarios, which needs "game design data".
5. Prove "AI-native" thoroughly, including whether the system still runs when the AI is down.
6. Compare technology solutions including AI models, then design the architecture (report template sections 5.2.3 "AI algorithms/technologies/models" and 5.3.6 "AI Model Design").

## Standing rule from the team lead

Every argument about how the project uses AI must be logical and backed by scientific evidence from reputable sources. Where the literature does not cover the project's setting (IT occupations, Vietnamese, ordinal rubric scoring of short free-text answers, volunteer experts), the report must say so plainly and name the measurement that would close the gap.
