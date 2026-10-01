# JobQuest — Resolution of Open Issues B1–B6

*Working design document for team review. Once approved, each resolution is integrated into the report (sections listed at the end) and then into the presentation. Citations are author–year here; they will be numbered when merged into the report. Figures marked "estimate" are planning assumptions, not measured values.*

---

## Overview

| Block | Advisor question it answers | Resolution in one line |
|---|---|---|
| B1 | Where does the project start, and how does it grow? | A five-stage roadmap from a university project to a national public resource, each stage gated by evidence |
| B2 | Who are the experts, and how are they linked to the system? | Senior practitioners, 3–4 per role across company types, engaged in stages; linked through the expert role and a blind rating workflow |
| B3 | What does "task" include? | Nine response formats; choice formats scored as situational judgment items with expert effectiveness keys, not right/wrong keys |
| B4 | Where do responses for evaluation come from? | Stage A: a synthetic, criterion-perturbed benchmark judged by a panel of models; Stage B: real pilot responses judged against experts |
| B5 | Who are the partners and funders? | The Ministry and edtech organisations may each act as partner and funder, under one set of independence safeguards |
| B6 | Why Cohen's kappa, and what value is acceptable? | Quadratic weighted kappa with the ETS acceptance thresholds for RP-2; content validity indices and a paired comparison for RP-1 |

The six resolutions are interdependent. The expert panel (B2) supplies both the scenario content and the scoring keys for the task formats (B3), and it is the reference against which both research problems are evaluated (B6). Its availability is staged, so the evaluation is staged too (B4); and the staging follows the growth roadmap (B1).

---

## B1 — Starting point and growth roadmap

### The problem with the current version

Section 4.1.5 describes an end state — a Ministry partnership, grant funding, and an organisation of about eleven positions — without saying how the project reaches it. A public authority does not adopt an unproven platform, so the path must begin where the project already is and advance only as evidence accumulates.

### Policy context that makes the end goal realistic

The national scheme on career guidance and student streaming in general education, approved by Decision 522/QĐ-TTg of 14 May 2018, covered the period 2018–2025. Its results were formally reviewed on 4 November 2025, and a draft decree on career guidance and educational streaming indicates that guidance is becoming a pillar of the national education system. At city level, Ho Chi Minh City's education plans for 2025–2026 set a 2030 target of at least 35% of students in basic sciences, engineering, and technology. A free platform that lets students experience IT work before choosing a field is therefore aligned with an active policy direction, not a speculative one. The window matters: a successor framework to the 2018–2025 scheme is being prepared now, and the project should aim to have evidence ready as that framework is implemented.

### The roadmap

Each stage has a gate — the evidence that must exist before the next stage begins. Years are indicative.

| Stage | Period | What happens | Who is involved | Resources and funding | Gate to next stage |
|---|---|---|---|---|---|
| 0. University project (current) | ĐACN, to end of 2026 | Build the core system for the IT field; seeds authored by the team from authoritative public sources; Stage A evaluation (synthetic benchmark) | Team of three; advisor; HCMUT as host | Team time; model API costs, self-funded or covered by cloud credits | Working system; Stage A results meeting targets (B6) |
| 1. Capstone and first pilot | Capstone phase, 2027 | Complete the product; recruit the first expert panel for a pilot subset of roles; pilot with volunteer IT students at HCMUT; Stage B evaluation | Team; advisor; first experts (about 9, see B2); HCMUT student volunteers | University research or innovation support; cloud credits; competitions | RP-1 and RP-2 thresholds met on the pilot roles; pilot feedback |
| 2. Incubation and multi-site pilot | Year 1 after graduation, 2027–2028 | Establish the operating organisation; extend expert panels towards all IT roles through industry partners; pilot with partner high schools and university career centres in Ho Chi Minh City | Core team; industry partners supplying experts; partner schools | Edtech grants; in-kind expert consultation | Evidence from several sites (use, completion, user-reported decision clarity); expert coverage of the IT roles |
| 3. Public-sector partnership | 2028–2029 | Present multi-site evidence to the Ho Chi Minh City Department of Education and Training, then to the Ministry; align with the successor to Scheme 522 and the city's 2030 STEM target; begin a second occupational field | Department of Education and Training; Ministry; edtech partners | Public programme funding; edtech grants | A formal cooperation agreement |
| 4. National public resource | 2030 onward | Deployment through the public education system; further fields; annual expert revalidation | Ministry; schools nationwide; expert network | Public and philanthropic funding | Sustained operation |

### Why this starting point is right

- **It starts from what exists.** Stage 0 requires no partner and no funding beyond model costs, which is exactly the project's current situation.
- **It moves from local to national.** The city department is a realistic intermediate step: the Ministry is more likely to adopt a platform already in use in a major city with its own STEM target than one that is only a proposal.
- **Evidence gates every stage.** The research problems are not only academic: meeting the RP-1 and RP-2 thresholds is the evidence that justifies approaching funders and authorities. This connects the business model to the evaluation design, which the advisor's comment implicitly asked for.

### Organisational form

The project begins as a university-hosted project (Stages 0–1), which requires no separate legal entity and gives immediate institutional standing. The operating organisation formed in Stage 2 should take a non-commercial form consistent with free access; Vietnam's enterprise law provides for social enterprises, and a university-affiliated centre is an alternative. The choice requires legal advice at Stage 2 and does not need to be fixed now.

### Keeping infrastructure sustainable without revenue

Three cost levers are available, in addition to the per-session cost ceiling already specified (NFR-11, DC-04):

- **A panel of smaller judging models** is cheaper than a single large judge — over seven times less expensive in one study (Verga et al., 2024) — while also reducing bias (B4).
- **Pre-generated, validated scenario pools.** Because every scenario must be expert-validated before it is served (BR-05), most generation can happen offline in batches. Runtime cost then falls mainly on judging free-text responses. *(This is a design option for the team to confirm.)*
- **Provider portability** (NFR-12, DC-02) lets inference move to cheaper or institutionally hosted models as funding changes.

---

## B2 — The expert panel

### Who counts as an expert

| Criterion | Proposed standard | Reason |
|---|---|---|
| Seniority | Senior or lead practitioner in the job family, with about five or more years of experience and experience supervising or mentoring junior staff | Supervisors know what entry-level work actually demands and where newcomers typically fail, which is what seeds and rubrics must encode |
| Currency | Currently or recently working in the role | Occupational practice changes; annual revalidation depends on current knowledge |
| Diversity | For each role, experts from at least two organisation types — for example product, outsourcing/services, startup, and in-house enterprise IT | The same job title involves different work in different organisations; a single-context panel would make scenarios unrepresentative |
| Independence | No expert rates scenarios or responses generated from a seed they authored | Prevents authors from confirming their own work |

**Panel size.** Three to four experts per role follows the content-validation literature. Three experts is the accepted minimum for a content-validation effort (Lynn, 1986; Polit, Beck & Owen, 2007). With 22 IT roles, the full network is roughly 66–88 experts. That is a long-term target reached through partners, not a Phase 1 requirement.

### Staged involvement

| Stage | Expert involvement | What the team does instead |
|---|---|---|
| 0 (ĐACN) | No industry experts. The advisor reviews method and content. | The team authors seeds from authoritative public sources (O\*NET task statements, ESCO skill definitions, job descriptions aggregated across several companies, public incident reports and engineering documentation). Every seed element records its source. Seeds are labelled *provisional, pending expert validation* and are not claimed as expert-validated. |
| 1 (capstone) | A first panel for a pilot subset of about three roles, 3 experts each (about 9 people), recruited through the advisor's and university's networks and alumni | The team prepares materials and runs the rating protocol |
| 2 onward | Panels extended towards all IT roles through partner organisations; part-time and invited, with most effort in the initial authoring period and a lighter annual revalidation | Content lead coordinates |

This staging is honest about Phase 1. The team can build and test the machinery with provisional content, but claims about occupational accuracy require the Stage 1 panel.

### How experts are linked to the system

There are two separate links, one for each purpose.

**1. Authoring and validation — inside the system.** Experts hold accounts in the *domain expert* role, invited by the content administrator. Through this role they:
- author seeds and rubrics (UC-07);
- validate generated scenarios (UC-08);
- review cases where the automated judge disagrees with expert judgment (UC-09).

Every action is logged with the expert's identity and date, so each published seed can be traced to who validated it and when (BR-05).

**2. Evaluation — a blind rating workflow.** For the research evaluation, experts rate scenarios and responses through a rating interface that hides three things: whether a scenario came from the seeded or unseeded condition, the automated judge's score, and the other experts' ratings. Items are presented in random order. The ratings form the reference set (DR-09).

### Expert workload (Stage 1 estimate, per expert)

| Activity | Assumption | Estimate |
|---|---|---|
| RP-1 scenario ratings | 48 scenarios for the expert's role at about 4 minutes each | about 3.2 hours |
| RP-2 response ratings | 50 responses at about 4 minutes each | about 3.3 hours |
| Option-effectiveness keying (B3) | 40 options at about 1 minute each | about 0.7 hours |
| **Total** | | **about 7 hours per expert** |

At roughly a working day per expert, participation is feasible for part-time senior practitioners. This number answers the advisor's feasibility question directly.

---

## B3 — What a task includes

### Definition

A **task** is one scenario within an occupation level. It places the user in a work situation with its role, team, and context, and asks for one response in one of the formats below. Every task declares, in its seed, which competencies it targets, and every response is evidence for those competencies.

### Response formats

| Format | What it captures | How it is scored | Part of RP-2? |
|---|---|---|---|
| Multiple choice (single answer) | Judgment among alternative actions | Situational-judgment scoring: each option carries an expert-rated effectiveness profile across competencies | No |
| Checkbox (multiple answers) | Judgment when several actions combine | Sum of the selected options' effectiveness profiles; combinations experts rate as harmful are flagged | No |
| Ordering | Prioritisation | Distance from the expert consensus ranking, with partial credit; defensible alternative orders can be keyed as equivalent | No |
| Matching | Relating items, such as symptoms to likely causes | Answer key where the relation is factual; otherwise an effectiveness key | No |
| True/false | Factual knowledge checks | Answer key; used sparingly, since guessing succeeds half the time | No |
| Timed / quick action | Decisions under time pressure | The chosen option's effectiveness profile, plus response time recorded as evidence | No |
| Free text | Written reasoning and communication | Rubric scored by the judging panel | **Yes** |
| Simplified email | Professional written communication in approachable form | Rubric (free text) | **Yes** |
| Simplified code | Technical work, simplified | Executable tests where the task is completion or debugging; rubric where the task is explaining or reviewing code | Explanations and reviews only |

**Hints.** Hints are available in all formats. Using one is recorded in the evidence model: it lowers the weight of that response as evidence of *independent* competence, but it does not block progress. This keeps hints genuinely supportive while keeping the assessment honest.

**Timed tasks and fairness.** Response time is measured on the user's device, excluding network delay, so that users on low-end phones or slow connections — whom NFR-13 commits to supporting — are not penalised for their connection.

### Choices as trade-offs: the situational judgment basis

Your design — options that are not simply right or wrong but trade-offs that develop different skills — corresponds to an established assessment method: the **situational judgment test (SJT)**. SJTs present work situations with response options that differ in effectiveness, and a meta-analysis of 102 coefficients from 10,640 people found them validly and generalizably related to job performance (ρ = .34; McDaniel et al., 2001). SJTs are commonly described as *low-fidelity simulations* (Motowidlo, Dunnette & Carter, 1990), which is exactly what a JobQuest task is. They also measure distinguishable constructs, such as interpersonal skills, teamwork, and leadership (Christian, Edwards & Bradley, 2010). That supports scoring each option against several competencies rather than a single right-or-wrong key.

The established development process is also the answer to your coherence requirement:

1. **Critical incidents.** Experts describe real situations in the role and how people handled them, well or badly (Flanagan, 1954).
2. **Options.** Response options are written from those real behaviours, so every option is something a practitioner has actually done.
3. **Keying.** A *different* group of experts rates each option's effectiveness, and the averaged ratings form the scoring key (Whetzel, Sullivan & McCloy, 2020).

### Coherence rules for options

Each option must be:

- **grounded** — derived from a critical incident or documented practice, never invented to fill a slot;
- **plausible** — something a competent practitioner might realistically do, with no strawman options;
- **intentional** — carrying a declared trade-off (for example, fast but risky versus slow but safe) and the competencies it develops or costs;
- **consistent** — coherent with the scenario's current state and the user's earlier choices;
- **distinct** — no two options in a task share the same effectiveness profile.

Experts check all five at validation (UC-08). The generative model may rephrase an option's wording to vary the narrative, but it **may not change the option's keyed profile**. This extends the curated-seed principle to options, and should be added as a design constraint.

### One construct choice to confirm

Research on SJTs shows that the instruction wording changes what is measured. "What would you do?" (behavioural tendency) relates more to personality; "what is the most effective action?" (knowledge) relates more to cognitive ability (McDaniel et al., 2007). JobQuest's narrative framing is naturally "what do you do?", which suits exploration: it reveals how the user tends to act, and that is information about fit. The report should state this choice explicitly, and scoring should use expert effectiveness keys either way.

---

## B4 — Where the responses for evaluation come from

### Resolution: a two-stage evaluation

**Stage A (ĐACN) — synthetic, criterion-perturbed benchmark.** For each free-text task, the team writes a strong reference response. It then derives variants that each **degrade exactly one rubric criterion** to a known level, from strongly negative to strongly positive, while holding the other criteria constant. Because the intended level of every criterion in every variant is known by construction, the benchmark has ground truth without any human raters. This follows the perturbation-checklist method for evaluating automated evaluators, which uses templates to alter output quality along one targeted dimension only (Sai et al., 2021).

The benchmark also includes bias probes: the same response padded to greater length, reformatted, or with its options reordered. The judged score should not change.

**The judging panel.** Your "isolated, different personalities" idea should be implemented as a panel of judges drawn from **different model families**, each scoring independently, with scores aggregated. A panel of smaller models from disjoint families outperformed a single large judge and showed less intra-model bias (Verga et al., 2024). Each judge is also run several times on the same items to measure test–retest consistency. Synthetic responses are produced by a model family *different from every judge*, extending DC-01 so the judges are not grading their own family's writing.

**What Stage A can and cannot show.** It shows whether the judging panel is *sensitive* to each rubric criterion and robust to known biases. It does **not** show agreement with human experts on real learners' responses, and the report must say so plainly. There is also a circularity risk: the team defines what each level means. To reduce it, the advisor confirms the intended levels on a random sample of about 20% of variants.

**Stage B (capstone, complete product) — real responses.** Volunteer participants — IT students at HCMUT, or participants reached through partner organisations — complete tasks on the finished platform with informed consent. Different years of study give a natural range of quality. Their free-text responses are rated independently by the Stage 1 expert panel and by the judging panel. This stage answers RP-2 in full.

| Stage | Responses | Ground truth | Answers |
|---|---|---|---|
| A | Synthetic, about 240 per the illustrative sizing (3 roles × 5 free-text tasks × 4 criteria × 4 levels) plus bias probes — *estimate* | Designed levels, sample-checked by the advisor | Criterion sensitivity, robustness, consistency |
| B | About 150 real responses (3 roles × 50) — *estimate* | Independent ratings by 3 experts per role | RP-2 as stated: agreement with experts relative to expert–expert agreement |

---

## B5 — Partners and funders

The Ministry and edtech organisations can each take both roles. What matters is that the roles are defined and bounded.

| Organisation | As partner | As funder |
|---|---|---|
| Ministry of Education and Training (and city departments first) | Distribution through schools; legitimacy; data-governance framework for minors | Public programme funding |
| Edtech organisations | Implementation: pilot hosting, distribution, technical cooperation | Grants; in-kind support such as cloud credits |
| Industry partners and associations | Supplying and coordinating domain experts (B2) | In-kind expert time |
| HCMUT | Host institution; academic oversight | Research or innovation support |

**One set of safeguards applies to every partner and funder, whatever its role:**

1. **Content independence.** No partner or funder authors, validates, or ranks occupational content. This extends the existing sponsor rule in §4.1.5 to partners.
2. **No access to identifiable user data.** Partners receive only aggregate, anonymised statistics (consistent with BR-08).
3. **Free access preserved.** No partner may introduce charges, advertising, or monetisation of users.
4. **Disclosed relationships.** Partnerships and funding are stated publicly on the platform.

These safeguards protect the candour of occupational representation (BR-07), the platform's central claim.

---

## B6 — Evaluation design for RP-1 and RP-2

### RP-1 — grounded generation

**Question (unchanged).** When generation is constrained by an expert-authored seed, what proportion of generated scenarios do domain experts judge occupationally accurate and requiring the target competency, and how does this compare with generation from the same instructions without the seed?

| Measure | Method | Acceptance |
|---|---|---|
| Fact preservation | Automatic check of each seed-required fact against the generated scenario, with experts confirming a sample | Target of at least 95% of required facts preserved — *proposed target* |
| Occupational accuracy and competency requirement | Each expert rates each scenario on a 4-point relevance scale; item-level content validity index (I-CVI) per scenario; scale-level average (S-CVI/Ave) per role | I-CVI ≥ .78 (good content validity with three or more experts); S-CVI/Ave ≥ .90 (Polit, Beck & Owen, 2007) |
| Seeded versus unseeded | Pairs generated from identical instructions; experts blind to condition; McNemar's test on the paired acceptable/not-acceptable judgments | Seeded condition significantly higher, p < .05 |
| Rater reliability | Krippendorff's α across the panel | α ≥ .800; .667–.800 supports only tentative conclusions (Krippendorff, 2004) |

Content validity indices come from instrument development and have been used for software engineering assessment instruments. They fit RP-1 because the question is exactly whether experts judge content to represent a real domain.

### RP-2 — validity of automated judging

**Why kappa at all.** Raw agreement overstates performance, because some agreement occurs by chance, especially when most responses fall into one category. Kappa-type statistics remove chance agreement. This is the reason given in the report, and it stands.

**Why *quadratic weighted* kappa rather than plain Cohen's kappa.** Rubric scores are ordinal (for example, 0–3). Plain Cohen's kappa treats a disagreement of one point the same as a disagreement of three points. Quadratic weighted kappa (QWK) penalises larger disagreements more heavily, and it is the standard metric in automated scoring of constructed responses. The RP-2 wording should therefore change from "Cohen's kappa" to "quadratic weighted kappa". Since the advisor saw the earlier wording, this change should be pointed out to her explicitly.

**Acceptable values — the ETS framework.** The most widely used acceptance criteria for automated scoring come from Williamson, Xi & Breyer (2012), and are applied operationally at ETS:

| Criterion | Threshold |
|---|---|
| QWK between automated and human scores | ≥ 0.70 |
| Standardised mean score difference between automated and human scores | ≤ 0.15 |
| Degradation from human–human agreement to automated–human agreement | ≤ 0.10 |

The third criterion is what RP-2 already asks ("relative to the agreement between experts themselves"), so the research question and an established standard coincide. Report exact and adjacent agreement alongside, since kappa can behave paradoxically when score distributions are highly skewed.

**The full RP-2 protocol:**

- **Stage A.** Judging-panel scores against designed levels: QWK per criterion (target ≥ 0.70); rank correlation between designed level and judged score; bias probes showing no systematic score change; test–retest consistency across repeated runs.
- **Stage B.** Automated–expert QWK per role and per difficulty stratum; expert–expert agreement as the ceiling; the three ETS criteria applied to each role.
- **Interpretation.** A role meets RP-2 if all three ETS criteria hold. Failure in a particular difficulty stratum is reported as such, not averaged away.

### Answers to the advisor's four questions

| Question | Answer |
|---|---|
| Who are the experts? | Senior or lead practitioners with about five or more years in the role, 3–4 per role across organisation types, independent of the seeds they rate; the first panel of about 9 for a pilot subset of roles at the capstone stage |
| How are they linked to the system? | Through the domain-expert role for authoring and validation (UC-07, UC-08, UC-09, logged per BR-05), and through a blind rating workflow for evaluation, whose ratings form the reference set (DR-09) |
| Why Cohen's kappa, and what value is acceptable? | Chance correction is the reason; refined to quadratic weighted kappa because scores are ordinal; acceptable means QWK ≥ 0.70, standardised mean difference ≤ 0.15, and no more than 0.10 below expert–expert agreement (Williamson, Xi & Breyer, 2012) |
| What does "task" include? | One scenario with one response in one of nine formats; RP-2 covers the free-text formats (free text, simplified email, code explanation or review); choice formats are scored with expert situational-judgment keys |

---

## Decisions still needed from the team

1. The final list of about 22 IT roles, and which roughly 3 form the Stage 1 pilot subset.
2. Confirmation of the expert standard (about five years of experience, supervisory experience).
3. Whether to pre-generate validated scenario pools, which strongly reduces runtime cost.
4. Whether experts receive an honorarium or contribute purely in kind.
5. The indicative years in the roadmap.
6. The fact-preservation target for RP-1 (95% is proposed).

---

## Integration plan once approved

| Report section | Change |
|---|---|
| 1.2 Objectives | Objective 4 refers to the roadmap |
| 4.1.5 Business model | Add the roadmap with stage gates, organisational form, cost levers, and partner/funder roles with safeguards |
| 4.2.2 Research problems | RP-2 wording: Cohen's kappa → quadratic weighted kappa; add the two-stage evaluation |
| 4.2.3 Challenges | Expert recruitment as a staged challenge; Stage A's limitation stated |
| 4.3 Requirements | Formats in FR-05/FR-06; hint and timing evidence; a new design constraint that the generator may not alter an option's keyed profile |
| DR-09 | Reference set redefined in two stages |
| Chapter 2 | Short background on situational judgment tests and content validation (new references below) |

### References introduced

- Christian, M. S., Edwards, B. D., & Bradley, J. C. (2010). Situational judgment tests: Constructs assessed and a meta-analysis of their criterion-related validities. *Personnel Psychology, 63*, 83–117.
- Decision 522/QĐ-TTg (14 May 2018) approving the scheme "Career guidance and orientation for student streaming in general education, 2018–2025". Prime Minister of Vietnam.
- Flanagan, J. C. (1954). The critical incident technique. *Psychological Bulletin, 51*(4), 327–358.
- Krippendorff, K. (2004). *Content analysis: An introduction to its methodology* (2nd ed.). Sage.
- Lynn, M. R. (1986). Determination and quantification of content validity. *Nursing Research, 35*(6), 382–385.
- McDaniel, M. A., Hartman, N. S., Whetzel, D. L., & Grubb, W. L. (2007). Situational judgment tests, response instructions, and validity: A meta-analysis. *Personnel Psychology, 60*, 63–91.
- McDaniel, M. A., Morgeson, F. P., Finnegan, E. B., Campion, M. A., & Braverman, E. P. (2001). Use of situational judgment tests to predict job performance: A clarification of the literature. *Journal of Applied Psychology, 86*(4), 730–740.
- Motowidlo, S. J., Dunnette, M. D., & Carter, G. W. (1990). An alternative selection procedure: The low-fidelity simulation. *Journal of Applied Psychology, 75*(6), 640–647.
- Polit, D. F., Beck, C. T., & Owen, S. V. (2007). Is the CVI an acceptable indicator of content validity? Appraisal and recommendations. *Research in Nursing & Health, 30*, 459–467.
- Sai, A. B., Dixit, T., Sheth, D. Y., Mohan, S., & Khapra, M. M. (2021). Perturbation CheckLists for evaluating NLG evaluation metrics. In *Proc. EMNLP 2021*, 7219–7234.
- Verga, P., et al. (2024). Replacing judges with juries: Evaluating LLM generations with a panel of diverse models. arXiv:2404.18796. [Preprint.]
- Whetzel, D. L., Sullivan, T. S., & McCloy, R. A. (2020). Situational judgment tests: An overview of development practices and psychometric characteristics. *Personnel Assessment and Decisions, 6*(1).
- Williamson, D. M., Xi, X., & Breyer, F. J. (2012). A framework for evaluation and use of automated scoring. *Educational Measurement: Issues and Practice, 31*(1), 2–13.
