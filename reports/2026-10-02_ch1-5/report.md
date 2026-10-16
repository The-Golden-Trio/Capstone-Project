# Abstract {-}

Occupational choice is commonly made with limited direct knowledge of the work involved. Research on career decision-making identifies insufficient occupational information as a principal source of difficulty, and the realistic job preview literature establishes that balanced, candid previews improve person–job fit and reduce subsequent regret. Delivering such previews has historically required either workplace exposure or content authored occupation by occupation, neither of which scales. This project designs, implements, and evaluates a platform that uses generative language models to deliver experiential occupational exposure at greater breadth, and establishes whether competence demonstrated within such an experience can be measured with sufficient reliability to be useful.

The report establishes the evidence base for this approach, reviews existing research prototypes and deployed systems against criteria derived from properties the literature identifies as consequential for learning systems, and specifies a proposed platform in which occupations are presented as performable tasks, responses are assessed against expert-authored rubrics, and demonstrated competence determines subsequent exploration. The review finds that the constituent techniques have been demonstrated separately but not in combination, and that existing systems in this area report assessment agreement without chance correction or difficulty stratification. The proposed evaluation addresses this through an expert-reviewed reference set constructed within a single occupational field. The report covers Chapters 1 to 5.1: introduction, background, related work, the proposed system, and its analysis.

**Keywords:** career exploration, experiential learning, realistic job preview, large language models, automated assessment, stealth assessment, serious games.

# List of Abbreviations {-}

| Abbreviation | Expansion |
|---|---|
| API | Application Programming Interface |
| ASVS | Application Security Verification Standard |
| BR | Business Rule |
| CDN | Content Delivery Network |
| DC | Design Constraint |
| DR | Data Requirement |
| ECD | Evidence-Centered Design |
| ESCO | European Skills, Competences, Qualifications and Occupations |
| FR | Functional Requirement |
| HCMUT | Ho Chi Minh City University of Technology |
| I-CVI | Item-level Content Validity Index |
| JWT | JSON Web Token |
| LLM | Large Language Model |
| MBTI | Myers–Briggs Type Indicator |
| MOET | Ministry of Education and Training (Vietnam) |
| NFR | Non-functional Requirement |
| OWASP | Open Worldwide Application Security Project |
| O\*NET | Occupational Information Network |
| RIASEC | Realistic, Investigative, Artistic, Social, Enterprising, Conventional |
| RJP | Realistic Job Preview |
| RP | Research Problem |
| S-CVI/Ave | Scale-level Content Validity Index, averaging method |
| SCCT | Social Cognitive Career Theory |
| SDT | Self-Determination Theory |
| SSE | Server-Sent Events |
| TLS | Transport Layer Security |
| UC | Use Case |
| UML | Unified Modeling Language |
| UR | User Requirement |
| ĐACN | Đồ án chuyên ngành (Specialized Project) |

---

# Chapter 1 — Introduction

## 1.1 Motivations

Occupational choice is among the most consequential decisions an individual makes, and it is typically made with limited direct knowledge of the work itself. A prospective entrant selects a field on the basis of job titles, salary figures, and descriptions authored by parties with an interest in recruiting them. The texture of the work — its daily pressures, its trade-offs, the tasks that occupy most of its hours — generally becomes apparent only after entry, when the cost of reversing the decision is high.

Research on career decision-making identifies the mechanism behind this difficulty. In the taxonomy of Gati, Krausz and Osipow [1], whose structure was recently confirmed across thirteen countries [2], insufficient information about occupations constitutes a principal category of decision difficulty, distinct from indecisiveness or inadequate self-knowledge. The obstacle is informational rather than dispositional: individuals are not primarily unable to decide, but unable to decide on an adequate basis.

Conditions in Vietnam illustrate the problem in a particularly compressed form. Entry to higher education is mediated by national examination results and published admission benchmark scores, so the selection of a field of study is effectively completed at seventeen or eighteen, under time pressure, and is constrained by the applicant's score relative to institutional thresholds rather than by any assessment of occupational fit [3]. The decision is frequently not the applicant's own. A 2026 survey of approximately 9,200 students across ten Vietnamese universities reported that more than one fifth had selected their field on parental direction, that nearly one fifth had entered without a defined occupational goal, and that around a third were subsequently uncertain whether they would choose the same field again [4]. Labour-market data indicate the downstream cost. Analysing successive waves of the national Labour Force Survey, Tran et al. [5] found the proportion of graduates in fully matched employment declining over time, with vertical and combined mismatch carrying measurable wage penalties; related analyses associate the same pattern with underutilised human capital at national scale. Employer-reported skills shortages, particularly in science and technology fields, compound the effect.

The prevailing response, in Vietnam and elsewhere, is psychometric. Interest inventories derived from Holland's typology, personality instruments in the Myers-Briggs tradition, and their commercial derivatives dominate career guidance provision. These instruments are informative about preferences but structurally unable to address the difficulty Gati's taxonomy identifies: they elicit what an individual believes about themselves rather than supplying information about occupations, and they cannot establish whether that individual would perform or persist in a given role. Their measurement properties are also contested. Early retest studies found that a substantial share of respondents were assigned a different Myers-Briggs type after only a few weeks [6], whereas the publisher reports test–retest coefficients of 0.81 to 0.86 on the underlying continuous scales [7]; the instability concerns the dichotomised type labels on which guidance is usually based, for respondents whose scores lie near a boundary. The more fundamental limitation is not reliability but what is measured: a stable preference remains a preference, not information about the work.

An alternative is well established in organisational psychology but rarely applied to career exploration. The realistic job preview literature demonstrates that balanced previews, including a role's unattractive features, improve person–job fit and reduce subsequent turnover, with perceived honesty identified as the operative mechanism [8][9]. Such previews are, in effect, information about the work delivered before commitment. Their delivery, however, has historically depended on either direct workplace exposure or content authored case by case, neither of which scales to the breadth of occupations an undecided student might wish to consider. Recent advances in generative language models alter this constraint, and that change in feasibility motivates the present project.

## 1.2 Objectives

The overall objective is to enable a person facing an occupational decision to experience the work of an occupation, receive an assessment of how they performed it, and use that assessment to decide which occupations to explore further — before committing to one. This objective is realised by JobQuest, a deployable platform specified in Chapter 4. The present phase delivers a working system covering the information technology field; the subsequent capstone phase extends its occupational coverage and operational maturity.

The overall objective is pursued through four specific objectives:

1. To deliver occupational tasks that remain faithful to the occupations they represent, by constraining AI generation with expert-authored material, so that the experience a user receives conveys accurate information about the work.
2. To assess users' responses, including open-ended ones, through automated judgment whose agreement with domain experts is established, so that the result, feedback, and guidance a user receives can be relied upon for formative use.
3. To convert demonstrated competence into guidance on which occupations a user is prepared to explore next, so that exploration builds on what the user has shown they can do.
4. To make the platform freely and sustainably available, with occupational content governed by domain experts, so that access to occupational experience does not depend on a user's ability to pay.

The first two specific objectives correspond to the research problems stated in Section 4.2.2; the third and fourth are realised through the system's design and its business model (Section 4.1.5).

## 1.3 Scope

The system delivered in this phase is complete in function and bounded in coverage to the information technology field and its specialisations. The coverage boundary is methodological: constructing a reference set of gold-standard scenarios and expert judgments requires domain expertise that the project holds in this field, and without such a set the first two specific objectives cannot be verified. The design is domain-agnostic, so extending coverage to further fields requires expert authoring rather than redesign.

Within this coverage the work comprises the authoring of occupational scenario material by domain experts and their review of the scenarios generated from it; the presentation and publication of that material by content administrators; AI generation and adaptation of task scenarios from that material; automated assessment of structured and open-ended responses, returning a result, feedback, and guidance; a competence-based progression model linking levels and adjacent occupations; the presentation and engagement design described in Section 4.2.1; a supporting orientation conversation for users uncertain where to begin; administration of the occupation catalogue and of the AI models; and an offline evaluation of generation quality and assessment accuracy against the expert reference set.

## 1.4 Significance of the Project

### 1.4.1 Significance from the Practical Perspectives

The practical contribution is a freely accessible means of acquiring occupational information experientially before commitment, for students selecting a field of study, graduates entering the labour market, workers considering transition, and the institutions that guide them. Its value rests on three established findings: that balanced, honest previews improve fit and reduce later regret [8][9]; that the obstacle they address, insufficient occupational information, is a principal source of career decision difficulty [1][2]; and that performing authentic tasks is the strongest source of self-efficacy, which social cognitive career theory identifies as a determinant of choice and persistence [10][11]. Because the platform is designed to be offered without charge and operated in partnership with public education authorities (Section 4.1.5), its reach does not depend on users' ability to pay. This matters particularly in Vietnam, where the decision falls at an age and within a family setting that leave most applicants little opportunity to observe the work they are selecting, and where the existing guidance market consists almost entirely of self-report instruments.

### 1.4.2 Significance from the Scientific Perspectives

The scientific contribution lies in artificial intelligence applied to education, in two problems that current research identifies as open. The first is grounded generation of educational content: language models produce fluent instructional material readily, but fidelity to a specified domain requires explicit constraint, and the project contributes an expert-in-the-loop generation method evaluated against a domain reference set. The second is validated automated assessment: language models are increasingly used in educational technology to judge open-ended learner responses, yet reported agreement is systematically optimistic, and chance-corrected, difficulty-stratified validation is rarely reported. The project contributes such a validation in the setting of behavioural, or stealth, assessment, where the evidence of competence is the learner's performance of a task rather than an answer to a test item.

The application setting is itself a contribution to educational technology. Experiential career education has not previously combined these techniques, and the systems that approach it are research prototypes evaluated through small qualitative or within-subject studies. An evaluation reporting chance-corrected agreement, difficulty stratification, and test–retest consistency offers a more reproducible basis for the claims such systems make.

## 1.5 Report Structure

Chapter 2 establishes the background: the evidence that experiential exposure conveys occupational information more effectively than description, the basis for measuring competence from behaviour, the conditions under which game-based delivery supports rather than displaces learning, relevant career-development theory, the generative and assessment technologies involved, and the data resources and benchmarks available for grounding and evaluation. Chapter 3 reviews related work, examining research prototypes and deployed systems, deriving criteria for comparison, and identifying the gap the project addresses. Chapters 4 to 8 follow the prescribed structure for the specialized project, covering the proposed system, its analysis and design, implementation and testing, evaluation, and conclusions.

---

# Chapter 2 — Background Knowledge and Technologies

This chapter assembles the evidence on which the proposed design rests. Sections 2.1 and 2.2 concern learning and measurement: whether performing a task conveys understanding that description cannot, and whether competence can be inferred from performance. Section 2.3 examines game-based delivery, including evidence qualifying its effectiveness. Section 2.4 summarises career-development theory. Sections 2.5 and 2.6 address the generative and assessment technologies and the data resources available for grounding and evaluation, and Section 2.7 considers responsibility constraints arising from the intended user population.

## 2.1 Experiential learning and realistic job previews

Kolb's model of experiential learning [12] characterises learning as a cycle in which concrete experience is transformed through reflective observation into abstract conceptualisation and subsequent active experimentation. The model's implication for occupational information is direct: an occupational description supplies conceptual content without the experience from which, on this account, durable understanding is constructed. Whatever a description conveys, it does not engage the transformation process the model describes.

The realistic job preview literature provides the corresponding empirical tradition [13]. A realistic job preview presents a balanced account of a role, including features an applicant might find unattractive, in place of a promotional account. Four meta-analyses converge on its effects [8][9][14][15]. Phillips [8], synthesising forty studies, associated such previews with reduced inflation of expectations, increased self-selection, improved performance and lower voluntary turnover, and additionally found richer audiovisual previews more effective than written ones — a finding that bears directly on delivery format. Earnest, Allen and Landis [9], in a path analysis over fifty-two studies and approximately seventeen thousand participants, identified perceived honesty as the mediating mechanism, indicating that the effect depends on the preview's candour rather than merely on its informational content. No meta-analysis has since superseded it; the most recent umbrella review of the field identifies it as the current synthesis [16].

Whether simulated experience transfers to real performance is addressed by the simulation-based learning literature. Cook et al. [17] and McGaghie et al. [18] established substantial effects for technology-enhanced simulation within health professions education, where the paradigm originated. Of greater relevance here, Chernikova et al. [19], synthesising 145 studies in higher education, reported a large overall effect that generalised across academic domains rather than remaining confined to clinical training, and further found that scaffolding — worked examples for novices, reflective prompts for more advanced learners — moderated outcomes.

Taken together, these three literatures support a specific proposition: that an honest, performed representation of a role conveys occupational information more effectively than description, and that the effect is not restricted to the clinical domains in which simulation research began.

## 2.2 Assessment of competence from behaviour, and competency-based progression

If a learner performs tasks rather than answering questions about themselves, the assessment problem changes accordingly. Evidence-centered design, developed for assessment within game environments under the term stealth assessment [20], addresses this by decomposing the problem into three linked models: a competency model specifying what is claimed to be measured, an evidence model specifying which observable behaviours constitute evidence for those claims and with what weight, and a task model specifying situations that elicit the relevant behaviour.

| Model | Function | Requirement it imposes |
|---|---|---|
| Competency | Defines the constructs claimed to be measured | Constructs must be specified independently of any single task if inferences are to transfer |
| Evidence | Maps observed behaviour to inferences about the constructs | Each observable must be attributable to a named construct; unattributable observations yield uninterpretable scores |
| Task | Specifies situations that elicit relevant behaviour | The target construct must be necessary to task completion, not merely permitted by it |

: Evidence-centered design models and the requirements they impose.

The third requirement is the most demanding and the most frequently unmet. Shute et al. [21] obtained significant correlations between in-game estimates of problem-solving and external measures precisely because the tasks could not be completed without deploying the measured competency. Where a task admits a route that bypasses the target construct, the evidence model measures something other than what it claims. Task authoring in such systems is consequently a psychometric activity rather than a purely editorial one.

A related question is what an assessment result entitles a learner to do next. Competency-based progression [22] treats competence as a transferable and independently verifiable unit rather than as an attribute of a completed course or an occupied role. On this account, competence demonstrated in one context constitutes evidence bearing on readiness for adjacent contexts. Establishing which contexts are genuinely adjacent requires an external basis, and standard occupational taxonomies supply one by describing occupations in terms of constituent skills and work activities, discussed in Section 2.6.

Where a task asks the learner to choose among actions rather than to write, the relevant assessment tradition is the situational judgment test, which presents work situations with response options that differ in effectiveness and is commonly characterised as a low-fidelity simulation [23]. A meta-analysis of 102 validity coefficients from 10,640 people found situational judgment tests validly and generalisably related to job performance (ρ = .34) [24], and their items measure distinguishable constructs such as interpersonal skill, teamwork, and leadership rather than a single ability [25]. Two further findings bear on design. The established development process derives scenarios and response options from critical incidents supplied by subject-matter experts [26], and a separate group of experts rates each option's effectiveness to form the scoring key [27]. The wording of the response instruction also changes the construct measured: asking what a respondent would do relates more to personality, whereas asking which action is most effective relates more to cognitive ability [28]. Options scored in this way are keyed along a range from ineffective or harmful to highly effective, and each carries an expert-rated profile of effectiveness across competencies. An option may accordingly be correct, in the sense of the most effective response; a trade-off, effective for one competency at a cost to another; or wrong, ineffective or harmful and keyed with negative effectiveness.

## 2.3 Game-based delivery: evidence, moderators, and limits

Game-based delivery is frequently proposed for educational systems and frequently overstated. The evidence supports it conditionally, and the conditions are specific enough to constrain design.

Effects and moderators. Hamari, Koivisto and Sarsa [29] found gamification effects generally positive but dependent on context and user. Sailer and Homner [30], in the principal learning-specific synthesis, reported significant but modest effects — cognitive g = .49, motivational g = .36, behavioural g = .25 — and identified narrative and the combination of competition with collaboration as moderators, noting the effectiveness of narrative paired with a persistent developing avatar. Bai, Hew and Huang [31] and Clark, Tanner-Smith and Killingsworth [32] report comparable medium effects with design features moderating outcomes.

The competence qualification. A meta-analysis by Li, Hew and Du [33] disaggregates these effects by psychological need and yields a result that materially constrains claims made for such systems: gamification produced large gains in perceived autonomy (g = 0.638) and relatedness (g = 1.776) but only a marginal effect on competence (g = 0.277). Gamification, in other words, reliably improves how learners feel about an activity while doing comparatively little for what they can do. Zeng et al. [34] add that particular element combinations underperform, with one common configuration associating negatively with academic performance. Any system asserting skill development must therefore locate the mechanism of that development in something other than reward structures.

Evidence by genre. Genre-level findings differentiate more usefully than aggregate ones. Role-play methods show an overall effect of approximately 0.82 with the largest component on skill acquisition [35], the strongest genre-level support for role-based designs. Simulation games carry the most occupationally relevant evidence and the clearest caveat: Sitzmann [36], synthesising sixty-five studies, found simulation-taught trainees exceeded comparison groups on self-efficacy, declarative and procedural knowledge and retention, but only where the game actively conveyed material, permitted learner control, and supplemented other instruction — when it constituted the sole method, comparison groups performed better, and the analysis reported evidence of publication bias. Wouters et al. [37] similarly found serious games effective for learning and retention while not necessarily more motivating than conventional instruction, and most effective as a supplement across multiple sessions. Narrative and branching-story formats reinforce engagement and learning [38], consistent with the narrative moderator above. Procedurally varied and randomised formats support replayability, but the evidence here is double-edged: randomised-reward mechanisms are robustly associated with problem gambling and reduced wellbeing among purchasers [39], which distinguishes variation used for content variety from variable-ratio reward scheduling.

Motivational basis. These findings are commonly interpreted through self-determination theory [40], under which motivation depends on satisfaction of needs for competence, autonomy and relatedness. The mapping is reasonably direct: progression and mastery structures address competence, meaningful choice addresses autonomy, and social or comparative features address relatedness, the least studied of the three in game research.

The implication for design is that engagement mechanisms and learning mechanisms should not be conflated. Narrative, progression and choice are supported as engagement structures; skill acquisition, on this evidence, must derive from the authenticity of the tasks themselves.

## 2.4 Career-development theory

Four theoretical traditions inform career guidance provision and the design of systems supporting it. Holland's typology [41] models occupational choice as person–environment congruence and underlies the interest inventories in widespread use, including the public-domain instrument distributed with the O\*NET occupational database. Social cognitive career theory [10][42] identifies self-efficacy, built principally through mastery experience, as a determinant of interest formation and choice — a mechanism accessible to systems in which users perform tasks rather than report preferences, and inaccessible to instruments that only elicit self-description. Super's life-span theory [43] holds that vocational self-concept develops over time, so that occupational fit is properly understood as changing rather than fixed. Krumboltz's happenstance learning theory [44] extends this by treating unplanned events as a normal and potentially productive component of career development rather than as disruption.

Social cognitive career theory also specifies how self-efficacy forms, which determines what a system of this kind can and cannot affect. Following Bandura [45], self-efficacy derives from four sources: mastery experiences, vicarious experiences of others' performance, verbal and social persuasion, and affective and physiological states. Their contributions are unequal. A model-based meta-analysis identified mastery experience as the strongest source [11]; the finding has been extended to career exploration and decision-making [46] and confirmed longitudinally in a three-wave study of 1,512 university students, in which mastery experience exerted the greatest sustained influence on career decision self-efficacy [47]. Two qualifications follow for systems that deliver experience through simulated tasks. Such systems engage mastery experience directly and persuasion through feedback, but provide little vicarious experience and do not target affective states. And because self-efficacy is task-specific, a system can build it only for the tasks it actually presents: where interaction is text-based, it can address competencies expressed through written analysis, prioritisation, and decision-making, but not those expressed through speech or physical performance, such as oral fluency in an interview. Section 4.2.3 compares these competencies with their counterparts in live work situations.

The last two traditions jointly support a position that career guidance systems seldom represent: that a career decision is situated within a whole life, subject to circumstances — obligations, health, relationships, relocation, changing values — that alter what constitutes a suitable path. Where a system models occupational fit as a fixed verdict, this dimension is lost. The consideration carries particular weight in contexts where career decisions are made within strong family and social expectations, as the Vietnamese survey data indicate [4], and it provides the theoretical basis for treating work–life balance as an attribute of an occupation rather than as an externality.

The limitations of self-report instruments follow from the same body of theory. Beyond the contested stability of type classifications noted in Section 1.1 [6], self-report is subject to social desirability effects, and congruence measures derived from interest typologies correlate only modestly with subsequent satisfaction. These are not implementation defects but properties of the method: asking what a person believes they would enjoy produces evidence of a different kind from observing what they do.

Frameworks of career decision difficulty. The taxonomy of Gati, Krausz and Osipow [1], on which Section 1.1 relies, is one of several frameworks describing why career decisions stall, and it is among the oldest still in use, so its choice requires justification. Table 2.2 compares it with five others.

| Framework | Year | What it describes | Structure | Missing occupational information as a separate component |
|---|---|---|---|---|
| Taxonomy of career decision-making difficulties (CDDQ) [1] | 1996 | Difficulties arising before and during the decision | Ten categories in three clusters: lack of readiness, lack of information, inconsistent information | Yes: within the lack-of-information cluster, alongside information about the self, the process, and ways of obtaining information |
| Emotional and personality-related career decision-making difficulties (EPCD) [106] | 2008 | Emotional and personality-related difficulties | Three clusters: pessimistic views, anxiety, self-concept and identity | No |
| Career Indecision Profile [107] | 2013 | Sources of indecision, including personality | Four factors: neuroticism and negative affectivity, choice and commitment anxiety, lack of readiness, interpersonal conflicts | No separate component |
| Career Decision Self-Efficacy scale [108] | 1983 | Confidence in carrying out decision tasks | Five subscales: self-appraisal, occupational information, goal selection, planning, problem solving | Partly: confidence in gathering information, not the information that is lacking |
| Career Thoughts Inventory [109] | 1996 | Dysfunctional career thoughts | Three scales: decision-making confusion, commitment anxiety, external conflict | No |
| Career Decision Scale [110] | 1976 | Certainty and indecision | A certainty scale and an indecision scale | No separate component |

: Frameworks of career decision difficulty compared with the taxonomy of Gati, Krausz and Osipow.

The comparison shows a division of labour rather than a succession. The later frameworks do not replace the taxonomy; they describe other sources of difficulty — emotional and personality-related dispositions [106][107][109], or confidence in carrying out decision tasks [108] — and the first of them was developed with the taxonomy's own author to complement it [106]. Only the taxonomy isolates missing information about occupations as a separately measured category, distinct from readiness and from inconsistent information. That category is the difficulty a system supplying occupational information can address directly, whereas dispositions are unlikely to be changed by information alone. The taxonomy's age is offset by recent structural evidence: its structure was re-examined across thirteen countries in 2023 [2], a study that re-validates the taxonomy rather than proposing an alternative to it.

Applicability to Vietnam. The cross-national evidence concerns the taxonomy's structure. Levin et al. [2] compared factor models on thirty-nine samples (N = 19,562) in nine language versions, which the authors describe as covering thirteen countries, and found the original structure to fit best, including in the South Korean and Malaysian samples, the only Asian ones. Measurement invariance could be tested only within the English and the French versions; it held at the scalar level for the French version but not at the metric level for the English one, so scores are not established as comparable across countries. The lack-of-information cluster was the most reliable of the three and the lack-of-readiness cluster the weakest, which is also where earlier Taiwanese, Chinese, and Korean studies reported departures from the original structure [111][112][113], one of them placing external conflicts, which include the expectations of family, with readiness [111]. No validated Vietnamese version of the questionnaire was identified. The project therefore relies on the taxonomy only for the category that replicates most consistently, missing information, and does not use the questionnaire's scores; using it as an outcome measure with Vietnamese users would first require local validation, with particular attention to readiness and to family-related external conflicts.

## 2.5 Generative and assessment technologies

Content generation. Automatic generation of educational content predates large language models but was long confined to shallow factual items [48]. Language models extended this substantially: Sarsa et al. [49] generated programming exercises with solutions, tests and explanations, a domain directly relevant to information technology scenarios, while noting that quality oversight remained necessary; Doughty et al. [50] generated items calibrated to specified cognitive levels. Controlled comparison indicates the outputs can be psychometrically adequate — one study found model-authored assessment items statistically indistinguishable from human-authored items on difficulty, discrimination and reliability, with the effect most pronounced in computer science [51]. The consistent qualification across this literature concerns grounding: fluent generation is readily obtained, while factual fidelity to a specified domain requires explicit constraint, typically through retrieval or authored scaffolding [52].

Interactive narrative and its control. Systems in which a language model conducts an interactive scenario draw on work demonstrating that such models can maintain memory, synthesise reflections and plan behaviour over extended interaction [53], and can track game state while a human retains narrative authority [54][55]. The same literature documents the principal failure mode, namely degradation of consistency over long horizons, and the mitigations that address it. Plan-driven generation frameworks report improved continuity and reduced spatiotemporal inconsistency relative to unconstrained prompting [56], indicating that authored structure rather than model scale is the operative variable.

Automated assessment of open responses. The use of language models as evaluators has developed through three identifiable stages, each imposing a different requirement on systems that adopt it. Zheng et al. [57] established feasibility, reporting agreement with human preferences above eighty per cent — comparable to inter-human agreement — while documenting position, verbosity and self-preference biases in the same work. Liu et al. [58] addressed method, showing that structured chain-of-thought prompting against an explicit rubric improves alignment, while noting a residual preference for model-generated text. The third stage concerns validation and is the most consequential. A systematic evaluation of twenty-one evaluators across approximately 541,000 judgments [59] found that raw agreement systematically overstates chance-corrected performance, reporting an approximately forty-one point discrepancy between exact-match agreement and Cohen's kappa on one benchmark, and that high test–retest consistency can coexist with severe position bias. Dedicated benchmarks quantify the ceiling: on deliberately difficult response pairs with objective correctness labels, the strongest general-purpose evaluator without extended reasoning reached approximately sixty-four per cent accuracy, and models with extended reasoning seventy-five to eighty-one per cent [60].

Reliability of rubric scoring by language models. Whether such evaluators are themselves reliable for rubric-based scoring of learners' constructed responses has been studied directly, and the evidence supports a conditional answer. A synthesis of sixty-five studies of essay scoring found agreement between language models and human raters to be highly context-dependent, with reported quadratic weighted kappa spanning nearly the whole range and many values below the 0.70 conventionally required [101]. Agreement approaches that between human raters under identifiable conditions: a strong model, an explicit rubric, and calibration examples. With few-shot prompting, GPT-4 marked short answers in school subjects at a Cohen's kappa of 0.70, against 0.75 between human markers [102], and with calibration examples its ratings of short second-language essays approached those of dedicated scoring systems [103]. Without such support agreement is moderate: a small open model reached a mean quadratic weighted kappa of about 0.5 zero-shot on a standard essay corpus, against 0.79 for a fine-tuned scorer [104]. Consistency across repeated runs can be high, with intraclass correlations of 0.94 to 0.99 reported for GPT-4 [105], but consistency is not validity. Two implications follow. Judging models should be strong, anchored to an explicit rubric, and supplied with scored examples; and reliability cannot be inferred from the literature for a new task and domain, none of these studies concerning occupational tasks, but must be established against experts in each case.

Four requirements follow for any system adopting this technique. Agreement must be reported with chance correction rather than as exact match. The evaluator should be drawn from a different model family than the generator, since self-preference otherwise contaminates the loop. Option ordering and response length must be controlled, since both bias scores independently of quality. And because accuracy degrades unevenly with item difficulty, aggregate figures conceal failure on precisely the reasoning-intensive items such systems most need to assess, which requires stratified reporting.

Expert involvement in authoring. Maintaining accuracy in generated instructional content is a multi-party problem. Recent work converges on a layered pipeline: a curated source of truth, retrieval-grounded generation, expert review prior to publication, and a feedback loop from use. Evaluation of such pipelines indicates that automated checks reliably enforce verifiable properties while domain experts remain necessary for pedagogical adequacy and for the distinctions that make an item discriminating [61]. The division of labour this implies — automated first-pass generation under expert validation — is the current best-supported arrangement for content that must remain factually accurate about a real domain.

## 2.6 Data resources and benchmarks

Systems making claims about occupations and about assessment accuracy can be grounded in, and evaluated against, established resources rather than bespoke data collection.

Occupational and skills taxonomies. The O\*NET database maintained by the United States Department of Labor describes approximately nine hundred occupations linked to more than nineteen thousand task statements across some two thousand detailed work activities [62]. The European ESCO classification describes 3,039 occupations and 13,939 skills across twenty-eight languages, with an official correspondence to O\*NET [63]. Both express occupations as compositions of skills and activities, which supplies an external basis for claims about occupational adjacency and a source for authoring occupationally representative tasks.

Evaluation benchmarks. For automated assessment, MT-Bench and the associated arena methodology [57], JudgeBench [60] and RewardBench [64] provide difficulty-calibrated reference sets and, more importantly, an established reporting methodology. For generated instructional content, EQGBench [65] and EduBench [66] provide protocols for evaluating generation quality. Text-based interactive environments including TextWorld [67] and Jericho [68] serve as established settings for evaluating agents in branching narrative.

Measurement practice. Two constructs require separate instruments and should not be reported as a single accuracy figure. Generation quality concerns whether produced content preserves required domain facts and elicits the intended constructs. Expert review of such content has an established quantitative form in content validation: experts rate each item's relevance on a four-point scale, and the item-level content validity index (I-CVI) is the proportion of experts rating it relevant. Three experts is the accepted minimum for a content-validation effort [69][70], and an I-CVI of .78 or higher with three or more experts, together with a scale-level average (S-CVI/Ave) of at least .90, indicates good content validity [70]. Assessment accuracy concerns agreement between automated and expert judgment of the same response. Chance-corrected agreement is required because raw agreement overstates performance, and because rubric scores are ordinal, quadratic weighted kappa is the appropriate statistic, penalising large disagreements more heavily than small ones. For automated scoring, Williamson, Xi and Breyer [71] set acceptance at a quadratic weighted kappa of at least 0.70 between automated and human scores, a standardised mean score difference of at most 0.15, and a degradation of no more than 0.10 from human–human to automated–human agreement. Agreement among the human raters themselves is assessed with Krippendorff's alpha, for which .800 indicates reliable ratings and .667 is the lower bound for tentative conclusions [72]. Agreement is reported stratified by item difficulty and alongside test–retest consistency. Two further techniques allow evaluation before human responses are available. Perturbation checklists alter a response along a single targeted criterion while holding the others constant, which supplies ground truth by construction and exposes whether an evaluator is sensitive to that criterion [73]; and a panel of judging models drawn from different model families has been found to outperform a single large judge, with less intra-model bias and at lower cost [74], a result obtained for binary and pairwise judgments whose extension to ordinal rubric scoring remains to be tested. The distinction matters because the three failure modes — biased judgment, unstable judgment, and judgment that fails selectively on difficult items — are separately diagnosable only when reported separately. As to expected magnitude, the closest methodological precedent, a multi-agent architecture performing unobtrusive assessment in a serious game, reports correlations between behavioural estimates and external outcomes in the range of 0.28 to 0.33, with near-zero correlation against prior attainment [75]. The latter figure is as informative as the former, since it evidences discriminant validity. Moderate correlations are the realistic expectation for open-ended behavioural assessment.

## 2.7 Responsibility considerations

Three considerations arise from the intended user population and the nature of the data involved, each corresponding to a requirement of the project's specification.

Data protection. A system of this kind processes behavioural and performance data about its users, engaging Vietnam's Law on Personal Data Protection [99] and its implementing decree [100], both in force from 1 January 2026, and comparable frameworks for users elsewhere. Under that law, processing data collected in Vietnam on a platform located abroad is a cross-border transfer of personal data, which bears on any system that sends users' responses to a model provider outside the country. Aggregated statistics derived from individual performance carry a residual privacy surface, since aggregate presentations can under some conditions permit inference about individuals.

Fairness in automated assessment. An automated judgment of a user's demonstrated competence may influence that user's estimation of their own capability. The evaluator biases documented in Section 2.5 are therefore not solely accuracy concerns but fairness concerns, and the corresponding controls — chance-corrected validation, cross-family evaluation, rubric anchoring — function as fairness safeguards. Presenting assessment formatively, and not as a determination affecting access to opportunity, keeps the consequences proportionate to the reliability the method can currently support.

Accuracy of occupational representation. The realistic job preview evidence carries an ethical as well as a pedagogical implication: a system's value depends on representing occupations candidly, including their disadvantages, and is undermined if representation is shaped by commercial interest. Expert validation of authored material, discussed in Section 2.5, is the principal safeguard against a system conveying an inaccurate picture of a real profession with apparent authority.

## 2.8 Summary

The background supports a coherent position. Performed, honest representation of occupational work conveys information that description does not, and this effect generalises across domains (2.1). Competence can be inferred from behaviour provided the assessment is constructed so that target constructs are necessary to task completion, and such competence is meaningfully transferable across related occupations (2.2). Game-based delivery sustains engagement, but its contribution to competence is marginal, so skill development must rest on task authenticity rather than reward structures, and randomisation must serve variety rather than reward scheduling (2.3). Career theory supports treating occupational fit as changing and as situated within a whole life, while explaining why self-report alone is a weak basis for guidance (2.4). Generative and assessment technologies make scenario production and open-response evaluation feasible, subject to explicit grounding, validated judgment, and expert oversight (2.5), and established taxonomies and benchmarks permit both grounding and evaluation without bespoke data collection (2.6). The user population imposes data protection, fairness and accuracy obligations that are design constraints rather than subsequent considerations (2.7).

Two qualifications in this evidence bear directly on what any such system may claim. The first is the marginal effect of gamification on competence [33]; the appropriate response is to locate skill development in authentic task performance and validated assessment rather than in reward mechanisms. The second is Sitzmann's finding that simulation exceeds comparison instruction only as a supplement, and underperforms as a sole method [36]; a system of this kind is therefore properly positioned as informing occupational choice and building initial self-efficacy, not as a substitute for employment or formal instruction. Both qualifications are treated in what follows as constraints on claims rather than as objections to be set aside.

---

# Chapter 3 — Related Work

Chapter 2 established what the evidence indicates should be effective. This chapter examines what has been built. Section 3.1 reviews research prototypes; Section 3.2 reviews deployed systems, internationally and in Vietnam; Section 3.3 derives comparison criteria from the attributes the background identifies as consequential for learning systems, applies them, and states the resulting gap. Throughout, attention is given both to the limitations of existing work and to the design solutions worth adopting from it.

## 3.1 Related work from research literature

A growing body of research applies games and generative models to career development. It establishes the direction as active and credible, and three limitations recur across it.

Reflection as the terminal outcome. The most developed prototypes assist users in thinking about a career rather than performing one. CareerSim [76] is a language-model-driven career development game combining generated content with alumni data and career construction theory, advancing an avatar through life stages to produce a personalised report; a preliminary study with twelve participants reported improved understanding and reflection. Its interaction concerns a career trajectory rather than the tasks constituting an occupation, and the authors note limited contextual depth and difficulty with distant scenarios. Future You [77], in which participants conversed with a model-generated future self, reduced anxiety and increased future self-continuity across 344 participants, and Letters from Future Self [78] found comparable benefits for career exploration and resilience with thirty-six participants. Both demonstrate measurable psychological benefit from structured imagination of a future self. Neither provides the basis on which a user might discover, through performance, that the imagined self would find the work unsuitable — the informational deficit identified in Section 2.1. The design element worth adopting is the prospective framing itself, which these studies show is motivationally effective and which can be applied at the entry point of an experiential system rather than as its substance.

Trajectory abstraction without task fidelity. A second group models career development under uncertainty while abstracting from the work. CareerPooler [79] represents career development through a physical metaphor in which generated events perturb a trajectory, and reports significant gains in engagement, information gain, satisfaction and career clarity relative to a conversational baseline across twenty-four participants. It constitutes the strongest available evidence that generated, interactive career exploration outperforms conversational advice, and its treatment of unplanned events accords with the theoretical position in Section 2.4. Because the representation is metaphorical, however, the user does not perform occupational tasks, and outcomes are consequently reported in terms of clarity rather than demonstrated capability. Its event-generation pipeline, which balances favourable and unfavourable outcomes to avoid a uniformly positive trajectory, is directly adaptable to any system incorporating stochastic career events. Comparable abstraction characterises generative career imagination for children [80] and career simulation for self-regulation in secondary students [81].

Guidance without measurement. A third group improves the guidance interaction while leaving assessment unaddressed. A career counselling agent grounded in self-determination theory [82] reduced decision-making difficulty and improved engagement, confirming the applicability of the motivational framework in Section 2.3; its outcomes are measured through self-report instruments rather than through anything the user demonstrably did. Among the systems reviewed here, none infers competence from behaviour within a task, and none validates automated judgment against an expert-constructed standard. The techniques required are established outside the career domain — memory-consistent interactive narrative [53][56], rubric-based automated evaluation with its attendant validation requirements [57][59][60], and unobtrusive behavioural assessment [75] — but have not been combined within it.

Evaluation practice in this literature is a further limitation. Sample sizes range from twelve to thirty-six, with one exception at 344, and designs are predominantly qualitative or within-subject. Such designs are appropriate for establishing feasibility and eliciting user response, but they do not support claims about assessment accuracy, which requires comparison against an external standard.

## 3.2 Related work from deployed systems

### 3.2.1 International systems

Authored task simulation. Forage [83] is the established platform in experiential career exposure: employer-authored simulations in which users attempt representative tasks and compare their work against a model answer, distributed without charge and funded through employer talent acquisition. It substantiates the underlying premise that users will voluntarily attempt occupational tasks, and its task decomposition — discrete, self-contained work products with supporting context — is a directly adaptable model for scenario structure. Its constraints follow from its authoring model. Content expands only as employers commission it; repetition yields identical material, limiting exploration to a single pass; and assessment terminates in a fixed model answer, which demonstrates what a competent response looks like without evaluating the response the user produced. The catalogue also reflects its funding, concentrating in fields that sponsor recruitment. Human-mediated alternatives such as Virtual Internships and Extern provide genuine workplace exposure at correspondingly limited scale, while career video and mentoring platforms provide exposure without performance.

Generated task simulation and workplace assessment. A more recent group generates content rather than commissioning it. EntryLevel [84] produces AI-generated job simulations parameterised by field, skill and difficulty with an accompanying automated tutor, establishing commercially that occupational task content can be generated; it delivers these as discrete projects without progression or a connecting structure between occupations. Anthropos [85] conducts extended workplace scenarios in which a user interacts with several model-driven colleagues and produces work artefacts, explicitly generating behavioural evidence rather than self-report ratings. It is the closest deployed analogue to behavioural assessment as described in Section 2.2, and its multi-role scenario construction is adaptable. Its orientation is nonetheless towards personnel selection: the evidence generated serves an employer's hiring decision rather than a user's exploration, which determines both what is measured and who receives it. A third group — including conversation and interview practice systems with adaptive personas and scored feedback [86] — rehearses the selection process rather than the work, and its scoring dimensions, being conversational, do not generalise to occupational task performance.

Generative narrative systems. The systems that have most successfully solved the generation problems described in Section 2.5 are not career systems. AI Dungeon [87] and character.ai [88] established substantial demand for model-driven interactive narrative, particularly among the demographic most relevant to career exploration, and equally demonstrate the consistency degradation that unconstrained generation produces at scale. Hidden Door [89] is the more instructive case: it generates narrative within bounded authored components rather than through open generation, with the reported consequence that its narratives remain coherent across sessions. This is independent commercial corroboration of the finding in Section 2.5 that authored structure, not model capability, governs consistency, and its architecture is the most directly adaptable element identified in this review. What these systems lack is any representational commitment to a real domain, any model of competence, and any assessment.

Assessment and orientation instruments. O\*NET and its associated public interfaces, together with commercial and institutional counterparts, constitute the most widely used category. They administer an inventory, return ranked occupational suggestions, and terminate. Their occupational databases are a genuine asset — and, as noted in Section 2.6, a usable one — but the guidance model rests on the self-report foundation whose limitations Section 2.4 describes.

### 3.2.2 Vietnamese systems

The domestic market is materially homogeneous, which is itself the relevant finding.

Assessment-based provision. JobWay [90], reported in Vietnamese government press as the first digitised career orientation application in the country, comprises interest and personality assessment, descriptions of approximately three hundred occupations drawn from international sources, and linked institutional information. Notably, its occupational descriptions include the common difficulties of each occupation — an implicit application of the realistic job preview principle, delivered as text. JobTest.vn [91] is the most instrumentally developed, offering multiple validated inventories alongside an aptitude instrument adapted and standardised for Vietnamese use and an occupational database of substantial scale; its sophistication is concentrated in the measurement of self-report. Hướng nghiệp Sông An [92] combines counsellor training with a library of licensed instruments, representing the most methodologically careful domestic provision and remaining entirely assessment- and counsellor-based. Hướng Nghiệp LwL [93] advertises experiential activity alongside assessment and occupational information for a younger audience, though its substance remains assessment, content and mentoring.

Generative systems in the domestic market. Recent entrants apply generative models to career guidance, uniformly in conversational form. AI Hay [94] provides a model-driven agent predicting admission likelihood and recommending institutions and fields, together with an automated career-personality instrument; a parallel development across Vietnamese universities has produced admissions advisory agents at institutional scale. These establish market acceptance of AI-assisted career guidance domestically. None provides performed experience of occupational work, and none assesses demonstrated capability. Among the systems surveyed, no Vietnamese system offers generated, performed occupational simulation — a claim that should be re-verified close to submission, given the rate of change in this market.

## 3.3 Comparison, gap analysis, and positioning

### 3.3.1 Derivation of comparison criteria

Comparing systems against the features of a proposed system produces a circular result. The criteria below are instead derived from attributes that Chapter 2 identifies as determining whether a system of this general class — one intended to help a person learn about and choose an occupation — achieves its purpose. Each is stated as a general property, applicable to any system in the category, and each traces to an evidential basis rather than to a design preference.

The first concerns the nature of what the user does. Experiential learning and simulation transfer research (2.1) indicate that engagement with representative tasks of actual practice conveys understanding that description does not; task authenticity is therefore a primary attribute. The second concerns what is conveyed. The realistic job preview literature (2.1) and the decision-difficulty taxonomy (1.1) establish that balanced information, including unattractive aspects, is what improves fit — hence completeness and candour of occupational representation. The third concerns responsiveness: adaptive instruction and the generative literature (2.5) indicate that content which responds to the individual outperforms fixed content, giving adaptivity to the learner. The fourth concerns whether the system knows what the user can do: evidence-centered design (2.2) establishes both the possibility of inferring competence from behaviour and the conditions under which such inference is valid, giving validity of competence measurement. The fifth follows from it — assessment is educationally inert without actionable response, giving quality of feedback and guidance. The sixth derives from the gamification and self-determination literatures (2.3): sustained engagement determines whether any learning occurs at all. The seventh concerns navigation: career theory and competency-based progression (2.2, 2.4) indicate that occupational choice involves comparing and moving among related options, giving support for pathway navigation. The eighth concerns durability: the authoring literature (2.5) shows that content about real occupations degrades unless it can be extended and maintained, giving scalability and currency of content. A ninth attribute, the existence of empirical validation, is treated in the discussion rather than tabulated, since it concerns the evidence for a system rather than a property of it.

### 3.3.2 Comparative assessment

Ratings use three levels, defined as follows. Full (●) indicates the attribute is a core designed property of the system. Partial (◐) indicates it is present but limited in scope, incidental, or a by-product of another objective. Absent (○) indicates it is not provided. Ratings reflect the systems as surveyed and would require revision as products change.

\begin{landscape}
\begin{scriptsize}
\setlength{\tabcolsep}{3pt}
\renewcommand{\arraystretch}{1.3}
\begin{longtable}{@{}p{3.1cm} *{7}{p{2.55cm}}@{}}
\caption{Comparison of system classes against the derived criteria.}\\
\toprule
\textbf{Attribute} & \textbf{Authored simulation (Forage)} & \textbf{Generated simulation (EntryLevel, Anthropos)} & \textbf{Interview practice (careersim.ai etc.)} & \textbf{Generative narrative games (Hidden Door etc.)} & \textbf{Assessment \& orientation (O\textasteriskcentered NET, VN market)} & \textbf{Research prototypes (CareerSim, CareerPooler)} & \textbf{Proposed system} \\
\midrule
\endhead
C1 \newline Task authenticity & {\small$\bullet$}\  employer-authored real work products & {\small$\bullet$}\  generated role tasks & {\small$\ominus$}\  interview talk, not work & {\small$\circ$}\  fictional worlds & {\small$\circ$}\  inventory only & {\small$\ominus$}\  trajectory, not tasks & {\small$\bullet$}\  tasks drawn from occupational taxonomies \\
C2 \newline Candour of occupational representation & {\small$\bullet$}\  includes unglamorous tasks & {\small$\ominus$}\  varies by generation & {\small$\circ$}\  not its purpose & {\small$\circ$}\  no real occupations & {\small$\ominus$}\  text lists difficulties & {\small$\ominus$}\  events skew narrative & {\small$\bullet$}\  candour is a design requirement \\
C3 \newline Adaptivity to the learner & {\small$\circ$}\  fixed content, identical on repeat & {\small$\bullet$}\  parameterised generation & {\small$\bullet$}\  adaptive personas & {\small$\bullet$}\  fully generative & {\small$\ominus$}\  branching by score & {\small$\bullet$}\  generated per user & {\small$\bullet$}\  seeded generation per user \\
C4 \newline Validity of competence measurement & {\small$\circ$}\  model answer, no judgment & {\small$\ominus$}\  behavioural evidence, unvalidated & {\small$\ominus$}\  scored, conversational only & {\small$\circ$}\  none & {\small$\circ$}\  self-report only & {\small$\circ$}\  self-report outcomes & {\small$\ominus$}\  designed; validity to be established \\
C5 \newline Quality of feedback and guidance & {\small$\ominus$}\  exemplar, not response-specific & {\small$\ominus$}\  automated tutor & {\small$\bullet$}\  per-dimension coaching & {\small$\circ$}\  none & {\small$\ominus$}\  generic occupation reports & {\small$\ominus$}\  reflective prompts & {\small$\bullet$}\  result, feedback and guidance separated \\
C6 \newline Sustained engagement & {\small$\circ$}\  one-pass certificate & {\small$\circ$}\  discrete projects & {\small$\circ$}\  practice utility & {\small$\bullet$}\  high replayability & {\small$\circ$}\  single sitting & {\small$\ominus$}\  short study exposure & {\small$\ominus$}\  designed; retention untested \\
C7 \newline Support for pathway navigation & {\small$\circ$}\  isolated simulations & {\small$\circ$}\  unconnected projects & {\small$\circ$}\  single-role focus & {\small$\ominus$}\  world, not career, traversal & {\small$\bullet$}\  ranked occupational lists & {\small$\ominus$}\  linear life stages & {\small$\bullet$}\  competence-linked adjacency \\
C8 \newline Scalability and currency of content & {\small$\circ$}\  commissioned per employer & {\small$\bullet$}\  generated on demand & {\small$\bullet$}\  generated on demand & {\small$\bullet$}\  generated on demand & {\small$\ominus$}\  periodic database updates & {\small$\ominus$}\  prototype scale & {\small$\bullet$}\  generation with expert validation \\
\bottomrule
\end{longtable}
\end{scriptsize}

\noindent\scriptsize{$\bullet$~Full — a core designed property \quad $\ominus$~Partial — limited, incidental, or a by-product \quad $\circ$~Absent. Annotations state the basis for each rating. Ratings for the proposed system denote design intent; those marked $\ominus$ are targeted but not yet empirically established.}
\end{landscape}


### 3.3.3 Gap and positioning

The assessment indicates no systematic deficiency in any single system so much as a consistent failure to combine attributes that have been demonstrated separately. Authored simulation platforms achieve task authenticity and candour but cannot adapt or scale, and do not assess. Generated simulation systems achieve authenticity, adaptivity and scale, and where they assess behaviour they do so for selection rather than exploration, without pathway structure. Generative narrative systems achieve adaptivity and sustained engagement at high quality while making no representational commitment to real occupations. Assessment and orientation instruments — including the entire Vietnamese market surveyed — achieve pathway navigation and scale while omitting performance altogether. Research prototypes achieve adaptivity and engagement but stop short of task performance and competence measurement, and their evaluations do not support accuracy claims.

The consequent gap is not a missing feature but an unrealised combination: performed, candid occupational tasks that adapt to the individual, from which competence is measured with validated automated judgment, connected by a structure that relates occupations through the competencies they share, and maintained through expert authoring. Each constituent has been demonstrated — task authenticity by Forage, generation and behavioural evidence by EntryLevel and Anthropos, coherent generative narrative by Hidden Door, pathway structure by occupational taxonomies, engagement by the research prototypes — and their integration has not.

The present project addresses this combination. Its design adopts specific solutions identified above: bounded authored components as the means of maintaining generative consistency, discrete self-contained task structure for scenario construction, multi-role scenario composition for eliciting interpersonal competencies, balanced event generation for representing career uncertainty, and prospective framing at the entry point. Its contribution beyond assembly lies in the assessment and evaluation layer, where the requirements established in Section 2.5 — chance-corrected agreement, cross-family evaluation, difficulty stratification — are applied to a class of system in which such validation has not previously been reported. The claims the project may make are correspondingly bounded by Section 2.8: engagement and clarity effects are supported by existing evidence, whereas competence gain is a hypothesis to be tested against the reference set rather than a property the design confers.

---

---

# Chapter 4 — The Proposed System

## 4.1 Business Context

### 4.1.1 Application domain

The application domain is career guidance and exploration, situated at the intersection of educational technology and occupational information provision. Participants in this domain are individuals facing an occupational decision, institutions supporting them, and the bodies that publish occupational information. The domain's characteristic activity is the transfer of occupational information to a person who must act on it, and Chapter 1 established that this transfer is currently incomplete: guidance provision is dominated by instruments that elicit self-description rather than convey what work involves.

The proposed system, JobQuest, addresses this by allowing a user to perform representative tasks of an occupation, receive an assessment of the competencies those tasks elicited, and use that assessment to determine which further occupations to explore. It is a platform for informed exploration rather than a placement, recruitment, or credentialing service, and this boundary determines several of the business rules below.

### 4.1.2 Business processes

Three processes constitute the operation of the platform. They are modelled formally in Section 5.1.1.

The exploration process is the primary user-facing process. A registered user optionally completes an orientation conversation, which is provided for users who do not know which occupation to begin with and is not a prerequisite. The user selects an occupation and a level within it, is presented with the role, team, and working context before any task begins, and then works through the tasks comprising that level. Each task is a scenario drawn from the occupation and is answered in one of nine formats — multiple choice, multiple selection, ordering, matching, true/false, timed choice, free text, simplified email, or simplified code — with hints available throughout. Tasks ask what the user does in the situation, a behavioural-tendency instruction [28], because how a user tends to act is itself information about fit; scoring uses expert effectiveness keys in either case. Each response option is of one of three types: correct, the most effective response; trade-off, effective for one competency at a cost to another; or wrong, ineffective or harmful. Options and rubric criteria are scored on a single ordinal scale per competency, from −1 (ineffective or harmful) through 0 and +1 to +2 (most effective), so that evidence from choices and from written responses accumulates in the same competence record and agreement with experts can be computed on an ordinal scale. Using a hint is recorded and lowers the weight of that response as evidence of independent competence without blocking progress; a timed task that expires is recorded as unanswered, with its response time, and carries no separate penalty. The system evaluates each response, records the competencies it evidences, and returns a result, feedback specific to the response, and guidance for improvement. Completing a level awards competence credit; accumulated credit unlocks higher levels of the same occupation or, where competencies overlap sufficiently, entry to an adjacent occupation above its entry level. On completing an occupation, the user may rate it on five attributes, which contribute to that occupation's aggregate profile.

The content lifecycle process governs how occupations enter the catalogue, and it involves two roles with distinct responsibilities. Domain experts own the occupational content and author it in the system: for each scenario they enter the required facts, the competencies it must elicit, the critical incidents from which response options are drawn, the effectiveness of each option, and the rubric against which free responses are judged, which together form the scenario's seed. A seed is a template rather than a script: it fixes the canon events of a scenario — the situations every run must pass through, at set points — together with the keyed options and rubric attached to them, and leaves the narrative between those events to be developed by the model in response to the user's answers. Validation accordingly has two layers. In the first, the system generates a sample of scenarios from the seed, and experts other than the seed's authors review the seed and the sample in the system, judging their accuracy and returning approvals, rejections, or corrections, each recorded with the identity of the reviewing expert. In the second, every scenario generated at run time is checked automatically against its seed — that it passes through every canon event, preserves the required facts, and leaves each option's keyed profile unchanged (NFR-15) — and one that fails is regenerated or replaced by an instance from the approved sample. The content administrator does not author occupational content. The administrator manages the occupation as an entry in the catalogue, arranges how approved content is laid out and presented in gameplay, reviews the occupation as a whole before release, publishes it, and operates its lifecycle thereafter. Published content is revalidated annually by the experts, since occupational practice changes. In the present phase, in which no industry experts are yet engaged, the project team performs the expert role on provisional seeds (Section 4.2.1).

The evaluation process is internal and supports the research objectives. It proceeds in two stages (Section 4.2.2): a synthetic benchmark constructed by the project team, and a reference set of real responses and generated scenarios rated independently by domain experts, against which generation quality and assessment accuracy are measured offline as specified in Section 2.6.

### 4.1.3 Business rules

Business rules are stated here as policies and constraints of the domain that hold independently of any particular implementation. Constraints arising from implementation choices — which models are used, how cost is bounded, where data is processed — are recorded separately as design constraints in Section 4.3.3.

| ID | Rule | Origin |
|---|---|---|
| BR-01 | The entry level of every occupation is accessible without prerequisite. | Exploration is the purpose; gating discovery defeats it |
| BR-02 | Access to a higher level requires the competence credit specified for that level. | Competency-based progression (Section 2.2) |
| BR-03 | Demonstrated competencies that overlap an adjacent occupation's requirements, as determined from the occupational taxonomy, count towards that occupation's levels, so that a user may enter it above its entry level. | Sections 2.2, 2.6; a user exploring related work need not restart |
| BR-04 | An occupation may be rated only by a user who has completed it. | Rating validity depends on exposure |
| BR-05 | No scenario seed or rubric is published without domain-expert validation of the seed and of a sample of the scenarios generated from it. | Section 2.5; accuracy of occupational representation |
| BR-06 | Assessment results are formative. They are not transmitted to employers and do not determine access to any external opportunity. | Section 2.7; proportionality to assessment reliability |
| BR-07 | Occupational representation must include the unfavourable aspects of the work. | Realistic job preview evidence (Section 2.1) |
| BR-11 | Replaying a scenario cannot raise a competency beyond the credit that scenario can award. | Keeps unlocks tied to demonstrated competence (BR-02) |
| BR-13 | An occupation's content becomes available to explorers only when the content administrator publishes it, which requires approved seeds (BR-05). | Scenario lifecycle (Section 5.1.1) |
| BR-14 | Revising a seed withdraws the scenarios generated from it until the revised seed is approved. | Scenario lifecycle; accuracy of occupational representation |
| BR-15 | Published content is revalidated by domain experts every year. | Occupational practice changes |
| BR-16 | A retired occupation remains in the records of users who attempted it but can no longer be started. | Scenario lifecycle; continuity of users' records |

: Business rules governing the proposed system.

BR-01 and BR-03 are complementary. BR-01 keeps discovery free: the entry level of any occupation can be tried without prerequisite. BR-03 concerns what earlier work is worth: competence already demonstrated in one occupation is credited towards an adjacent one, so that the user does not begin it again from the entry level.

### 4.1.4 Organisational policies and legal-ethical considerations

The platform processes personal data, including performance data, and is therefore subject to Vietnam's Law on Personal Data Protection and its implementing decree [99][100] and to comparable frameworks for users in other jurisdictions. Three policies follow. Data minimisation limits collection to what the exploration and assessment functions require. Aggregate-only publication governs any statistic derived from user performance, with suppression thresholds applied so that small populations cannot be de-anonymised; as a privacy measure rather than a rule of the domain, it is specified as a non-functional requirement (NFR-06). Formative-use limitation (BR-06) prevents assessment output from acquiring consequences the method's reliability does not support.

One provision of the law shapes the design directly. Sending a user's response to a model provider located abroad is a cross-border transfer of personal data, for which the law requires a transfer impact assessment to be filed with the competent authority within sixty days of the first transfer; responses are therefore stripped of identifying details before they leave the platform, since de-identified data is not personal data under the law, and the assessment is to be prepared before any deployment to real users. How this provision applies to a university-hosted project, and whether behavioural logs fall within the decree's sensitive categories, are to be confirmed with the university's legal office.

Two further policies concern the system's use of generative models. Provenance disclosure requires that users be informed that scenarios are machine-generated from expert-authored material and that assessments are machine-produced. Expert accountability assigns responsibility for the occupational accuracy of published content to the authoring and reviewing domain experts, as recorded in the system, rather than to the generating model. Under the intended partnership described in Section 4.1.5, data governance would additionally follow the requirements of the Ministry of Education and Training for systems serving students. Detailed processing policies, including third-party model providers, are specified in Section 5.3.10.

### 4.1.5 Business model and organisation

JobQuest is designed as a public-benefit platform rather than a commercial product, and its business model follows from that position and from the evidence on which the system rests.

Value and beneficiaries. The platform offers learners experiential occupational information before commitment, and offers education authorities and institutions a scalable complement to limited counselling capacity. All content is available to all users without charge; access to levels and occupations is governed by demonstrated competence (BR-01 to BR-03) rather than by payment. The choice is deliberate: the users who most need occupational information — secondary students choosing a field under examination and family pressure — are those least able to pay for it, and the platform's effect depends on reaching them.

Partners and funders. The Ministry of Education and Training and educational-technology organisations may each act both as partners and as funders. As a partner, the Ministry — preceded by city-level education departments — supplies distribution through schools, legitimacy with schools and families, and a governance framework for students' data, while edtech organisations supply pilot hosting, distribution, and technical cooperation. As funders, both may provide programme funding, grants, or in-kind support such as cloud credits. Industry partners and professional associations supply and coordinate domain experts, and the host university provides academic oversight. One set of safeguards applies to every partner and funder, whatever its role: none authors, validates, or ranks occupational content; none receives identifiable user data, only aggregate statistics (NFR-06); none may introduce charges, promotional content, or monetisation of users; and every partnership and source of funding is disclosed on the platform.

Funding and sustainability. Without user revenue, operation is funded through public and philanthropic support: grant funding sought from the Ministry and from educational-technology organisations; sponsorship from companies, which may contribute experts as well as funds; voluntary donations through a donation box on the platform; and in-kind contribution of expert consultation. The first expert panel, in Stage 1, contributes voluntarily; from Stage 2 an honorarium for experts is budgeted within grant funding. The cost structure determines how that funding must be managed. The dominant variable cost is language-model inference, incurred per session, which is why per-session cost is a monitored requirement (NFR-11). The system manages it by enforcing a configured ceiling on the model cost of each session, a cost-management mechanism specified with the design in Chapter 5. The dominant fixed cost is expert authoring, incurred per occupation, which is why coverage expands field by field rather than all at once. Model access is provider-portable (NFR-12, DC-02), so that inference can move to lower-cost or institutionally hosted models as funding conditions change. Two further levers reduce cost. A panel of smaller judging models from different families is less expensive than a single large judge [74], and because a seed fixes a scenario's canon events, keyed options, and rubric in advance (BR-05), run-time generation is confined to the narrative between those events, which bounds the length and therefore the cost of each generation.

Sponsorship and content integrity. A model in which employers paid to shape how occupations are portrayed would reward favourable portrayal, in direct conflict with the realistic job preview evidence (Section 2.1) and with BR-07. Sponsorship is therefore admitted only as acknowledgement. Sponsoring companies are named, with their logos, under a plain "Supported by" heading; the acknowledgement carries no slogans, product claims, or links to product pages, and it never appears within scenarios, assessments, or rankings. Sponsors do not author, approve, or rank content, and every sponsorship is disclosed. Whether such an acknowledgement falls within the advertising regulations is subject to legal review, to be settled with the university's legal or partnership office before any logo is displayed.

Perception of a free service. A service offered without charge can be taken to be of low quality. The platform answers this with signals of credibility rather than with a price. Sponsor acknowledgements and the donation box are present from the outset. A badge marks scenarios validated by domain experts; it is shown only on scenarios that experts have actually approved, and therefore from Stage 1. Evaluation results are published once Stage A or Stage B has produced them, with the stage stated, since Stage A does not establish agreement with experts. Endorsement by the Ministry or by partner institutions is deferred to Stage 3. No paid tier is introduced.

Starting point and growth roadmap. A public authority does not adopt an unproven platform, so the project begins where it stands and advances only as evidence accumulates. The policy direction supports the end goal: the national scheme on career guidance and student streaming in general education, approved by Decision 522/QĐ-TTg, covered the period 2018–2025 [95]; its results were reviewed in November 2025, with a decree on career guidance and educational streaming in preparation [96]; and Ho Chi Minh City has set a 2030 target of at least 35% of students in basic sciences, engineering, and technology [97]. Table 4.2 sets out the stages. Each has a gate — the evidence required before the next begins — and meeting the thresholds of the two research problems is the evidence that justifies approaching funders and authorities.

| Stage | Indicative period | Activities | Resources and funding | Gate to next stage |
|---|---|---|---|---|
| 0. University project | Present phase, to the end of 2026 | Core system for the IT field; provisional seeds prepared by the team from authoritative public sources under advisor guidance; Stage A evaluation | Project team; advisor; host university; model costs self-funded or covered by cloud credits | Working system; Stage A targets met |
| 1. Capstone and first pilot | Capstone phase, 2027 | Complete product; first expert panel for three pilot roles (back-end engineering, DevOps and cloud engineering, and business analysis); pilot with volunteer IT students; Stage B evaluation | University research or innovation support; cloud credits; competitions; donations | RP-1 and RP-2 thresholds met for the pilot roles |
| 2. Incubation and multi-site pilot | 2027–2028 | Operating organisation established; expert panels extended through industry partners; pilots with partner schools and university career centres in Ho Chi Minh City | Edtech grants; company sponsorship; donations; in-kind expert consultation | Multi-site evidence of use and decision clarity; expert coverage of the IT roles |
| 3. Public-sector partnership | 2028–2029 | Evidence presented to the city Department of Education and Training, then to the Ministry; alignment with the successor to Scheme 522; a second occupational field begins | Public programme funding; edtech grants; company sponsorship; donations | A formal cooperation agreement |
| 4. National public resource | 2030 onward | Deployment through the public education system; further fields; annual expert revalidation | Public and philanthropic funding; company sponsorship; donations | Sustained operation |

: Staged roadmap from university project to national public resource.

The project remains university-hosted during Stages 0 and 1, which gives it institutional standing without a separate legal entity. The operating organisation formed in Stage 2 is to take a non-commercial form consistent with free access, such as a social enterprise or a university-affiliated centre, to be settled with legal advice at that stage.

Organisational structure. The organisation is staged. During the present phase and the capstone phase, the three-member project team holds every operating role, one member holding several where necessary; domain experts join from the capstone phase; and the project advisor provides academic oversight. For sustained operation after the capstone phase, the proposed structure places a steering committee — with representatives of the Ministry, the host university, funding organisations, and the project lead — above five operating units, advised by an expert board of senior domain and assessment specialists. Table 4.3 sets out the units, their positions, and their responsibilities. The indicative core is about eleven full-time positions, with domain leads part-time and contributing experts engaged per occupation, a size chosen to remain sustainable on grant funding. The numbers of positions are indicative and the structure is not rigid: in the early stages one person may hold more than one position.

| Unit | Positions (indicative number) | Responsibilities | Corresponding user group or constraint |
|---|---|---|---|
| Product and Engineering | Engineering lead (1); full-stack engineers (2); AI engineer (1); DevOps and system administrator (1) | Platform development and operation; AI model integration, configuration, and cost control; infrastructure and security | System administrator; DC-01, DC-02, DC-05; NFR-11 |
| Content and Occupational Expertise | Content lead (1); assessment and rubric specialist (1); domain leads, one per occupational domain (part-time); domain experts (part-time, three to four per role) | Occupation catalogue; authoring of seeds, rubrics, and keyed options by domain experts, and their review of generated scenarios; presentation, review, and publication of occupations; annual revalidation | Domain expert; content administrator; BR-05, BR-07 |
| Research and Evaluation | Research lead (1); evaluation analyst (1) | Construction of the expert reference set; offline evaluation; subsequent user studies | Evaluation process; RP-1, RP-2 |
| Partnerships and Outreach | Partnerships manager (1); school and institution outreach coordinator (1) | Liaison with the Ministry, schools, and universities; grant applications and reporting; recruitment of domain experts | — |
| Data Protection and Compliance | Data protection officer (1, part-time initially) | Consent; data-subject requests; regulatory compliance | DC-03; policies in Section 4.1.4 |

: Proposed organisational structure for sustained operation.

Occupational domains are the unit of content governance: each has a domain lead accountable for its accuracy. Within the information technology field covered in the present phase, the proposed domains are software engineering; data and artificial intelligence; network and systems infrastructure; information security; and IT product and business analysis. Each further field is added as a new domain with its own lead, which is how coverage expands without restructuring the organisation.

## 4.2 System Description

### 4.2.1 System overview

JobQuest is a web-based platform that presents occupations as sequences of performable tasks, assesses the competencies a user demonstrates while performing them, and uses those assessments to structure further exploration. Its purpose is to supply occupational information experientially, at a breadth that authored content cannot reach, to people who must choose or change an occupation.

The experience is delivered through three presentation and progression conventions selected against the evidence in Section 2.3 rather than by preference. Progression follows a role-playing convention, in which levels and access to further occupations are earned through demonstrated competence rather than time spent, which the role-play evidence supports as the genre most associated with skill acquisition. Scenarios are presented in a branching narrative form comparable to a visual novel, the narrative moderator being among the strongest identified in the gamification meta-analyses. Career and life events are introduced probabilistically across sessions, a convention drawn from roguelike design, so that the circumstances bearing on occupational fit vary between runs; consistent with the harm evidence in Section 2.3, this randomisation governs narrative variety only and is not coupled to any reward schedule or monetisation. These conventions carry engagement; consistent with Section 2.8 they are not relied upon for competence development, which rests on task authenticity and assessment.

The system serves four user groups: the explorer, the domain expert, the content administrator, and the system administrator.

The explorer is the primary user: a student choosing a field of study, a graduate entering the labour market, or a worker considering transition. The explorer performs tasks, receives assessment and guidance, accumulates competence credit, and navigates among occupations. All other groups exist to make this possible.

The content administrator manages the occupation catalogue and is responsible for how expert-authored content reaches explorers: arranging its layout and presentation in gameplay; creating, reviewing, and publishing occupations; and operating the content lifecycle, including monitoring coverage and currency across occupations and arranging revalidation. The content administrator does not author or alter occupational content, which belongs to the domain experts.

The system administrator operates the platform: configuring and monitoring the generation and assessment models, managing capacity and cost, administering accounts and access, and overseeing data protection controls.

Domain experts are senior or lead practitioners in an occupation, typically with around five or more years in the role and experience supervising junior staff, who therefore know what entry-level work demands and where newcomers typically fail. They use the system directly: they author and own the occupational content of scenarios — the required facts, target competencies, response options and their effectiveness keys, and rubrics — and they review the scenarios the system generates and the cases in which automated judgment departs from their own. Each role is served by three to four experts, three being the accepted minimum for content validation [69], drawn from at least two types of organisation — such as product, outsourcing, startup, and in-house enterprise IT — because the same job title involves different work in different organisations; no expert reviews scenarios generated from a seed they helped prepare. Their involvement is heaviest when an occupation's seeds are first prepared and lighter thereafter, through annual revalidation, and is arranged part-time through partner organisations; the first panel is recruited through the advisor's and the university's alumni networks and contributes voluntarily. Across the approximately twenty-two IT roles in scope, the full network is some sixty-six to eighty-eight experts, reached progressively (Section 4.1.5). In the present phase the project team prepares provisional seeds from authoritative public sources under the advisor's guidance, and these are not presented as expert-validated. This group is the guarantor of the system's central claim, that its representations correspond to real work.

### 4.2.2 Research problems

In this report, a research problem is a question that meets three conditions: the answer is not established in the existing literature; the answer constitutes knowledge that generalises beyond this particular system; and the project's evaluation produces evidence that answers it. A question resolved by a design decision fails the second condition, and a question about how evidence is gathered concerns method rather than a problem. Two questions meet all three conditions, both in artificial intelligence applied to education, and they correspond to the first two specific objectives in Section 1.2.

RP-1, grounded generation of occupational scenarios. The literature establishes that language models generate fluent instructional content but that fidelity to a specified domain requires explicit constraint (Section 2.5); it does not establish how accurate expert-seeded generation is for task-based occupational content, nor whether generated tasks preserve the competency they target (Section 2.2). The question is therefore: when generation is constrained by an expert-authored seed specifying required facts and target competencies, what proportion of generated scenarios do domain experts judge to be occupationally accurate and to require the target competency, and how does this compare with generation from the same instructions without the seed? The comparison is what makes the answer knowledge rather than description, since without it an accuracy figure cannot be attributed to the seeding.

RP-2, validity of language-model stealth assessment. Reported agreement between automated judges and human raters is systematically optimistic, and chance-corrected, difficulty-stratified validation is rarely reported (Section 2.5); nor has such assessment been validated where the evidence of competence is the performance of a task rather than an answer to a test item (Section 2.2). The question is therefore: to what extent does rubric-based automated judgment of task responses agree with domain-expert judgment of the same responses, measured by quadratic weighted kappa, relative to the agreement between experts themselves, and how does that agreement vary with item difficulty and across repeated runs? Expert–expert agreement provides the ceiling against which the automated judge is interpreted.

Both problems are evaluated in two stages, because the experts on whom they depend are engaged progressively (Section 4.2.1). In Stage A, during the present phase, the project team constructs a synthetic benchmark: for each free-text task, a strong reference response and variants that each degrade one rubric criterion to a known level, together with probes for length, format, and ordering bias, following the perturbation-checklist method [73]. A panel of judging models from different families, none of which produced the synthetic responses, scores them independently and repeatedly [74], and the advisor confirms the designed levels on a random sample of about a fifth of the variants. Stage A establishes whether the judge is sensitive to each criterion, robust to known biases, and consistent across runs; it cannot establish agreement with experts on real responses, and is not presented as doing so. In Stage B, on the completed product, volunteer participants complete tasks with informed consent, and their responses, together with generated scenarios, are rated independently and blind by three experts per pilot role. RP-1 is then answered by content validity indices, with I-CVI of at least .78 and S-CVI/Ave of at least .90 [70], by a paired comparison of seeded and unseeded generation using McNemar's test on acceptability, and by a fact-preservation target of 95% of seed-required facts. RP-2 is answered against the three acceptance criteria of Williamson, Xi and Breyer [71], with agreement among experts measured by Krippendorff's alpha [72].

Three further questions arise in the project and are addressed, but they are not research problems under these conditions.

| Question | Condition not met | Where it is addressed |
|---|---|---|
| How should demonstrated competence determine access to adjacent occupations? | Resolved by a design decision based on occupational taxonomies; the project does not generate new knowledge about it | Design (Chapter 5) |
| Does the engagement design sustain exploration without displacing learning? | Answerable only through longitudinal user study, which the offline evaluation does not provide | Subsequent work |
| How should the expert reference set be constructed? | Concerns how evidence is gathered — a matter of method rather than a problem | Evaluation (Chapter 7) |

: Questions addressed in the project but not treated as research problems.

### 4.2.3 Challenges and difficulties

Generation fidelity is the principal technical difficulty. Occupational content is factual, and a scenario that is plausible but inaccurate is worse than no scenario, since it conveys a confident false impression of a real profession. Long-horizon consistency compounds this within multi-task levels.

Assessment validity is the principal methodological difficulty. Section 2.5 indicates that agreement figures for automated judgment are frequently overstated and that performance degrades unevenly with difficulty; obtaining defensible figures requires a reference set that is stratified and expert-authored, which is expensive to produce.

Expert availability constrains breadth. Each role requires three to four senior practitioners for authoring and review, whose time must be arranged through partner organisations; in Stage 1, an estimated seven hours per expert covers scenario ratings, response ratings, and option keying for a pilot role. The three pilot roles are back-end engineering, DevOps and cloud engineering, and business analysis, the last chosen so that assessment is also examined on work whose output is requirements and communication with stakeholders rather than code. Because experts are engaged progressively, the present phase relies on provisional seeds prepared from public sources, and occupational accuracy can be claimed only once the Stage 1 panel has reviewed them. This is the reason for restricting the first phase to a single field, and for treating expert authoring as a first-class activity of the system rather than an administrative convenience.

Cold start affects the aggregate occupational profiles, which require a population of completions before they are informative. Until that population exists, profiles are absent or unreliable, and the interface must represent this honestly rather than display an unfounded figure.

Evaluation without deployment limits what the project can establish. Offline benchmarking substantiates generation quality and assessment accuracy but cannot establish engagement retention or effects on career decisions, which require longitudinal study. The claims are bounded accordingly, consistent with Section 2.8.

Operating without user revenue makes cost a design constraint rather than a commercial concern. Inference cost per session must remain within what grant funding can sustain, which constrains model choice, response length, and caching strategy.

Interaction modality limits what the platform can represent, and the limit differs by competency. Hamstra et al. [98] argue that the realism of a simulation should be understood not as physical resemblance but as functional task alignment — the correspondence between what a task demands and what the real situation demands — noting that physical fidelity has been found largely independent of educational effectiveness. On this view the relevant question is not whether a screen-based task looks like a workplace but whether it demands what the work demands. Table 4.5 compares the competencies a JobQuest task can involve with their counterparts in a live work situation, rating alignment on four levels: high, moderate, partial, and low.

| Competency | In a JobQuest task | In a live work situation | Alignment |
|---|---|---|---|
| Technical analysis and problem-solving, such as diagnosing a failing service | Performed through the same text and code interfaces used in practice | Largely screen-based in IT roles | High |
| Written communication, such as incident reports, documentation, and messages to colleagues | Produced and assessed as text | Produced as text | High |
| Prioritisation and decision-making under constraints | Decisions made with consequences represented in the scenario | The same decisions, with real consequences for users and colleagues | Moderate: decision structure aligned, stakes attenuated |
| Adaptability to changing requirements | Changes introduced as scenario events | Changes arrive unpredictably and compound | Moderate |
| Collaboration and handling of stakeholders | Text interaction with AI-driven colleagues and clients | Real people with their own goals, relationships, and history | Partial: structure aligned, social dynamics simplified |
| Working under time pressure and regulating stress | Time limits can be simulated, with low personal stakes | Sustained pressure with genuine stakes | Low |
| Oral communication and presentation | Represented only through what is written; delivery, tone, and listening are not exercised | Central in many roles | Low |
| Interviews | The content of answers can be rehearsed in text; live delivery under observation is not exercised | The gateway to most roles | Low |
| Physical and manual skill | Procedures can be described and sequenced; manual execution is not exercised | Central in some occupations | Low |

: Alignment of competencies between screen-based tasks and live work situations.

Two consequences follow. Alignment is highest for the competencies at the core of information technology work, which is itself largely screen-mediated — a further reason for the first phase's coverage. Conversely, competencies that depend on live interpersonal dynamics, genuine stakes, speech, or physical performance are attenuated: oral communication, interviewing, and physical skill are represented only through their written or procedural content, and alignment for them is low. Both the assessment and the self-efficacy the platform builds (Section 2.4) are therefore evidence about the well-aligned competencies only, and results must not be presented as indicating readiness for the others. Voice interaction could extend coverage to oral communication; genuine stakes and physical skill lie outside what any screen-based simulation can provide.

Localisation presents a further difficulty: occupational taxonomies are authored in English for other labour markets, and their occupational structures do not map cleanly onto Vietnamese practice, requiring expert adaptation rather than translation.

## 4.3 User's Requirements

Requirements are expressed first as user requirements per group, each with a priority (Must, Should, Could). These are then analysed into functional, non-functional, and data requirements. Each of these carries two verification methods: a business verification, by which a stakeholder — an explorer, a domain expert, a content administrator, or a system administrator — confirms that the requirement meets its purpose, through acceptance tests, walkthroughs, or expert review; and a technical verification, by which the development team confirms that the implementation behaves correctly, through automated, integration, boundary, load, or fault-injection tests.

### 4.3.1 User requirements

User requirements — explorer:

| ID | User requirement | Priority |
|---|---|---|
| UR-E01 | As an explorer, I want to create an account, recover it if I forget my password, and return to my own progress on every visit, so that my exploration is kept safe. | Must |
| UR-E02 | As an explorer, I want to browse the occupations available, read what each involves at every level, including its unfavourable aspects, and try the entry level of any of them without prerequisite, so that I can survey possibilities before committing to one. | Must |
| UR-E03 | As an explorer who does not know where to begin, I want optional suggestions of occupations to start with, and a description of myself that explains them, so that a blank choice does not stop me. | Should |
| UR-E04 | As an explorer, I want to be told my role, team, and working context before each scenario begins, so that my decisions are situated rather than abstract. | Must |
| UR-E05 | As an explorer, I want to perform tasks that practitioners would recognise and whose objective I can understand, so that what I learn reflects the occupation. | Must |
| UR-E06 | As an explorer, I want to respond in the forms the work itself takes — choosing a course of action, ordering steps, prioritising tasks, or writing an answer such as an email or a code review — so that I experience how the work is done, not only what it is about. | Must |
| UR-E07 | As an explorer, I want hints when I am stuck, at a small cost to my best possible score, so that I can continue while still learning. | Should |
| UR-E08 | As an explorer, I want my response judged as an expert in the occupation would judge it, probed further when my answer is unclear, and returned as a result, an explanation, and guidance, so that I can trust the judgment and know how to improve. | Must |
| UR-E09 | As an explorer, I want follow-up questions and feedback to arrive without long waits, and to see progress while I wait, so that the experience keeps its momentum. | Must |
| UR-E10 | As an explorer, I want to play on my phone, over a weak connection, and with assistive technology if I need it, without installing anything, so that I can explore wherever I am. | Must |
| UR-E11 | As an explorer, I want to resume where I stopped after an interruption or a system failure, and to be told promptly if something has failed, so that I never lose work I have done. | Must |
| UR-E12 | As an explorer, I want to know which content and judgments are produced by AI, so that I can weigh them accordingly. | Must |
| UR-E13 | As an explorer, I want to choose scenarios within a level, have the competencies I demonstrate recorded, and open higher levels as they grow, without replaying the same scenario being enough to inflate them, so that my progress reflects what I can do rather than time spent. | Must |
| UR-E14 | As an explorer, I want to start an adjacent occupation at a level my competencies support, so that I need not restart from the entry level when exploring related work. | Should |
| UR-E15 | As an explorer, I want to see the career path across the levels of an occupation — the role held at each level — so that I understand where the occupation could lead me. | Should |
| UR-E16 | As an explorer, I want to rate an occupation after completing it and see how others rated it, without anyone's individual rating being exposed, so that I can compare my impression with a broader one. | Should |
| UR-E17 | As an explorer, I want a private record of what I have attempted and demonstrated, so that my exploration accumulates into something I can reflect on. | Should |
| UR-E18 | As an explorer, I want my individual responses and results never to be shown to others or passed to employers, and my data to be deleted when I ask, so that trying an occupation carries no risk to me. | Must |
| UR-E19 | As an explorer, I want to use the platform in Vietnamese or English, so that language is not a barrier to exploring. | Should |
| UR-E20 | As an explorer, I want short side quests I can answer on the spot for bonus points, so that I can engage with an occupation in small steps. | Could |
| UR-E21 | As an explorer, I want to send feedback about the whole app, so that problems and ideas reach the team. | Should |

: User requirements of explorers.

User requirements — domain expert:

| ID | User requirement | Priority |
|---|---|---|
| UR-D01 | As a domain expert, I want to write a scenario's context with AI assistance and set the allowed question types, the score of each option, the grading rubric, hints, random events, and side quests directly in the system, with my authorship recorded, so that the content I own is traceable to me and needs no developer to enter. | Must |
| UR-D02 | As a domain expert, I want every published scenario to keep the required facts and option scores exactly as I set them, so that the system never misrepresents the work in my name. | Must |
| UR-D03 | As a domain expert, I want to review scenarios written by another expert of my occupation against shared criteria and approve them, request changes, or reject them, so that only content experts judge accurate, and AI output kept within the limits they set, reaches explorers. | Must |
| UR-D04 | As a domain expert, I want to see where the automated judge disagrees with expert judgments, so that I can refine the rubric. | Should |
| UR-D05 | As a domain expert, I want to revalidate published content when practice changes, so that what explorers see stays current. | Should |
| UR-D06 | As a domain expert, I want to create and keep up to date the knowledge of an occupation once the content administrator has created it — levels, salary, generation rules, competencies, and adjacency — so that progression and adjacency reflect how the work is organised in Vietnam. | Should |
| UR-D07 | As a domain expert, I want to rate explorers' responses and generated scenarios blind, independently of other experts, so that the automated judge and the generator can be measured against expert judgment. | Should |
| UR-D08 | As the author of a scenario, I want to play the draft game before it is published, without my play being counted as explorer data, so that I can confirm it presents my content correctly. | Must |
| UR-D09 | As the author of a scenario, I want to add sample answers with expert scores while preparing it, so that the automated judge can be checked against my judgment. | Should |

: User requirements of domain experts.

User requirements — content administrator:

| ID | User requirement | Priority |
|---|---|---|
| UR-C01 | As a content administrator, I want to add a new occupation and track it through authoring, review, publication, and retirement without asking developers, so that catalogue growth is managed. | Must |
| UR-C02 | As a content administrator, I want to arrange how approved content is presented in gameplay — question types, characters, and scenes — without altering its substance, so that explorers receive it in a coherent form. | Must |
| UR-C03 | As a content administrator, I want to publish a scenario only after it has been approved and play-tested by its author, so that nothing unvalidated is released. | Must |
| UR-C04 | As a content administrator, I want to see coverage and play statistics for my occupations, so that I can identify outdated or weak content and arrange its revalidation. | Should |
| UR-C05 | As a content administrator, I want to replace an outdated scenario by removing the old one first and then opening a new one, so that explorers never meet superseded content. | Should |
| UR-C06 | As a content administrator, I want to open a scenario for each task and assign a domain expert other than its author to review it, so that every scenario is reviewed independently. | Must |
| UR-C07 | As a content administrator, I want to import occupational reference data from O\*NET and ESCO, so that occupations start from an established source. | Should |
| UR-C08 | As a content administrator, I want to define the criteria domain experts use to review scenarios, so that every review follows the same standard. | Must |

: User requirements of content administrators.

User requirements — system administrator:

| ID | User requirement | Priority |
|---|---|---|
| UR-S01 | As a system administrator, I want to configure which models generate and which assess, keep the two separate, and change provider without touching any authored content, so that assessment stays independent and the platform is not locked to one vendor. | Must |
| UR-S02 | As a system administrator, I want to monitor usage, cost, and failures, re-run failed AI jobs, and keep the cost of each session within budget, so that the service remains operable on grant funding. | Must |
| UR-S03 | As a system administrator, I want to manage every account, explorers included — grant staff their roles and occupations, view activity logs, and disable or delete accounts — so that each person can do exactly their part and misuse can be stopped. | Must |
| UR-S04 | As a system administrator, I want to handle data-subject requests and oversee data-protection controls, so that the platform meets its legal obligations to users, including minors. | Must |
| UR-S05 | As a system administrator, I want to review feedback sent about the app, so that recurring problems are found and fixed. | Should |

: User requirements of system administrators.

### 4.3.2 Functional requirements

| ID | Functional requirement | Group | Business verification | Technical verification |
|---|---|---|---|---|
| FR-01 | Register, sign in, and recover the account | Explorer | Acceptance test: a user registers, signs in, resets a forgotten password, and reaches their own progress | Authentication tests; unauthenticated requests for progress are refused; reset links expire after one use |
| FR-02 | Edit, sign out of, and delete the account | Explorer | Walkthrough of each account action | Account deletion removes personal data as defined in NFR-05 |
| FR-03 | Run an optional, retakable RIASEC orientation quiz suggesting occupations [41] | Explorer | Pilot users complete the quiz and find the suggested occupations meaningful | Quiz yields a RIASEC profile; the five suggested occupations (project-defined) come from matching it with each occupation's O\*NET interest code, without AI; skipping leads to the Galaxy Map; retaking replaces the earlier result |
| FR-04 | Write the explorer's portrait from the RIASEC profile with AI, including the social index | Explorer | Pilot users judge the description relevant and not misleading | The AI writes only the description text; the social index is the profile's Social score; the portrait is labelled as self-reported and not validated |
| FR-05 | Browse occupations on the Galaxy Map and show each profile with its downsides and level descriptions | Explorer | Explorers find an occupation on the map and can state its main downsides and what each level involves | Every published occupation appears on the map with all profile fields and a description for every level; ratings follow FR-19 suppression |
| FR-06 | Open the entry level of every published occupation to every explorer | Explorer | Acceptance test: a new explorer opens the entry level of any published occupation | Entry level reachable with zero credit and without any adjacency check |
| FR-07 | Let explorers start an adjacent occupation at a higher level when overlap conditions are met | Explorer | Domain experts judge the offered starting levels as plausible for seeded profiles | Overlap only unlocks higher starting levels and never blocks an entry level; no offer is made where adjacency data is missing |
| FR-08 | Enrol in levels, choose scenarios, award credit, and unlock the next level | Explorer | Acceptance test: an explorer enrols, chooses scenarios, and progresses through levels as expected | Threshold boundary tests unlock at and only at the specified credit; below the threshold, tasks for the missing competencies are suggested |
| FR-09 | Show the role, team, and context before each scenario | Explorer | Explorer walkthrough: the context is shown and understood before each scenario | End-to-end test: the context screen precedes every scenario; an unavailable scenario returns the explorer to the map |
| FR-10 | Support choice, ordering, prioritising, and free-text answers | Explorer | Explorers complete each response form without help | Known-input tests return the expected scores for each closed form |
| FR-11 | Score free-text answers with anchor points backed by quotations | Explorer | Domain experts judge a sample of scored responses as fair and well-evidenced | Every quotation is found verbatim in the response; scores outside the rubric anchors are rejected; agreement with experts is checked under NFR-14 |
| FR-12 | Answer follow-up questions generated by AI on free-text answers | Explorer | Explorers judge the follow-up questions relevant to what they wrote | Follow-ups stay within the expert's follow-up goal and the activity's limit; each follow-up passes the output check before display, otherwise the expert's default follow-up is shown; each follow-up answer is assessed |
| FR-13 | Offer hints when the explorer is stuck | Explorer | Explorers continue after a hint and still find the task meaningful | Using a hint removes the +2 option for that activity; hint use is recorded and shown in the summary; hints do not reveal grading criteria |
| FR-14 | Return result, feedback, and guidance separately | Explorer | Usability test: explorers identify the result, the feedback, and the guidance separately | All three present and distinguishable for every assessed scenario; AI-written feedback is built from the rubric anchors and passes the output check (on topic, no grading criteria, correct language), otherwise the expert's default feedback is shown; explorers can flag wrong content to the domain expert |
| FR-15 | Record evidenced expertise and soft-skill competencies, capped per skill per scenario | Explorer | Domain experts spot-check sampled sessions: recorded competencies match the observed behaviour | Records correspond to rubric criteria and are split into expertise and soft skills; random-event answers add bonus soft-skill evidence only; replay test confirms accumulation never exceeds the cap |
| FR-16 | Offer optional side quests for bonus points | Explorer | Explorers find side quests short and optional | Side quests are authored by the domain expert (FR-22); side-quest points are recorded separately from main-quest competence credit |
| FR-17 | Show the career path of each occupation level | Explorer | Explorers can describe the role held at each level of an occupation | Career path lists every level of the occupation with its role and description, as written by the domain expert |
| FR-18 | Show a private record of attempts, expertise and soft-skill points, and awards | Explorer | Explorers confirm their record is accurate and complete | Record reconstructs from session history for a seeded account; both point types shown in the top bar, summary, and profile; not accessible to other users |
| FR-19 | Collect occupation ratings and feedback | Explorer | Acceptance test: the rating and feedback form appears only after full completion; aggregated results are shown or withheld as expected | Form accepted only once every level is completed; aggregated result updates after each new submission; suppressed below the response-count threshold |
| FR-20 | Send app feedback and review it | Explorer, System administrator | An explorer sends feedback and a system administrator finds it in the review list | Every submission is stored with time and app version; the system administrator can mark it as handled |
| FR-21 | Create and update occupation knowledge: levels, salary, generation rules, competencies, adjacency | Domain expert | Experts approve the adaptation for Vietnamese practice | Knowledge can be created only for an occupation the content administrator has created; every rubric criterion resolves to a competency; routes without enough data are hidden, not guessed |
| FR-22 | Author scenario context, question types, option scores, rubric, hints, random events, and side quests | Domain expert | Walkthrough: an author prepares a scenario for an assigned task end to end, including its hints, random events, and side quests | Edits persist with authorship recorded; access limited to domain experts assigned to that occupation; every free-text activity has a follow-up goal, a default follow-up, and default feedback; random events are dropped into sessions at random within the configured probability, target the scenario's reviewed skills, and never lower the main score |
| FR-23 | Generate scenario content with AI from the author's context, keeping its generation history | Domain expert | Domain-expert review of sampled generations against the required facts and the occupation's rules | Automated validator passes on every stored generation; a scenario that fails the checks cannot be submitted; each run's context, model, cost, and check result are viewable |
| FR-24 | Add reference answers with expert scores | Domain expert | Experts confirm the stored criteria reflect what they intended | Item is stored only when validation passes; failing items return the reasons |
| FR-25 | Review another expert's scenario against the review criteria | Domain expert | Walkthrough: an expert approves, rejects, and requests changes on sample scenarios using the criteria | Reviewer is never the author; every criterion is answered before a decision; unapproved scenarios are never served to explorers; a rejected scenario cannot be reopened |
| FR-26 | Play-test the draft game before publication | Domain expert | Walkthrough: the author is invited, play-tests a draft game, and reports findings | Author is notified when the draft game is built; play-test sessions are excluded from every explorer aggregate; display findings return the scenario to presentation, content findings return it to the author and to review |
| FR-27 | Revalidate a published scenario on request | Domain expert | Experts revalidate a sample of published scenarios on request | A domain expert or content administrator can send a published scenario back to the review queue; the scenario stays published and playable meanwhile; the result is recorded; outdated scenarios are flagged for replacement |
| FR-28 | Report disagreements between AI and expert grading | Domain expert | Experts confirm the disagreement list helps them refine grading criteria | Disagreement list matches recomputation over the reference set |
| FR-29 | Rate responses and scenarios blind | Domain expert | Experts confirm they cannot see AI scores or other experts' ratings while rating | Blind-rating records exist per expert; inter-expert agreement is computable |
| FR-30 | Create and manage own occupations | Content administrator | Walkthrough: a content administrator takes their occupation from draft to published to retired | State transitions follow the defined lifecycle; publication requires completed review; actions on other occupations are refused; a domain that still holds occupations cannot be deleted |
| FR-31 | Import O\*NET and ESCO reference data | Content administrator | A content administrator imports a sample and adjusts it | Imported records resolve against source identifiers; unresolved records are listed; domain experts are notified to derive competencies once the import completes |
| FR-32 | Define the scenario review criteria | Content administrator | Domain experts confirm the criteria are clear enough to apply | Reviews cannot start until criteria exist for the occupation; each review records an answer per criterion |
| FR-33 | Open one active scenario per task | Content administrator | Walkthrough: a content administrator opens a scenario and the author is notified | A second active scenario for the same task is refused; retired and rejected scenarios do not count |
| FR-34 | Assign a domain expert as reviewer, with a deadline, and reassign overdue reviews | Content administrator | Walkthrough: a content administrator assigns a domain expert to review a scenario and reassigns an overdue review | Assigning the author is refused; the domain expert is notified; the deadline appears in the review queue; the reviewer is reminded before the deadline; once it passes, the content administrator is notified and can reassign the review |
| FR-35 | Design the scenario presentation with AI | Content administrator | Walkthrough: a content administrator gamifies an approved scenario | Question types outside the allowed set are refused; content text is read-only in this step |
| FR-36 | Maintain a bias-checked asset library; AI generates missing assets | Content administrator | Reviewers judge sampled assets, including AI-generated ones, free of stereotyping | Every asset carries its source and bias-check result; an AI-generated asset enters the library only after its bias check passes |
| FR-37 | Publish a scenario after review and play-test | Content administrator | Walkthrough: a content administrator publishes a ready scenario with an effective date and release note | Publish is disabled unless the status is ready |
| FR-38 | Retire or delete a published scenario | Content administrator | Walkthrough: a content administrator replaces an outdated scenario | Played scenarios are retired and keep their history; unplayed scenarios are deleted permanently |
| FR-39 | Monitor own occupations: statistics and coverage | Content administrator | A content administrator spots a weak or outdated scenario from the dashboard | Figures match stored records; ratings follow the suppression threshold; coverage matches stored metadata |
| FR-40 | Assign and reassign one content administrator and domain experts to each occupation | System administrator | Walkthrough: a system administrator assigns staff to an occupation and moves it to another content administrator | Every occupation carries exactly one content administrator and at least one domain expert once assigned; reassigning an occupation moves its pending work to the new content administrator |
| FR-41 | Manage all user accounts, roles, and role-based access | System administrator | Walkthrough: a system administrator views the activity log of an explorer and a staff member, then disables and deletes an account | Staff sign in on the shared login screen and see only the work for their assigned occupations; wrong-role access to admin screens is refused; disabled accounts cannot sign in; deleted accounts follow NFR-05; staff-authored records are kept |
| FR-42 | Configure separate generation and assessment models | System administrator | A system administrator changes a provider through the configuration screen | Configuration rejects an identical provider for both roles |
| FR-43 | Monitor usage, cost, and errors, and re-run failed AI jobs | System administrator | A system administrator uses the monitoring screen to spot cost or error spikes | Metrics consistent with generated load; alerts raised when a cost threshold is crossed; failed generation and grading runs listed with cause and can be re-run |
| FR-44 | Handle data requests and data-protection settings | System administrator | Data-protection walkthrough of a deletion request | Requests are completed and logged; settings take effect on the next computation; a transfer impact assessment is documented and kept current for each AI provider |

: Functional requirements with business and technical verification.

### 4.3.3 Non-functional requirements

| ID | Non-functional requirement | Category | Business verification | Technical verification |
|---|---|---|---|---|
| NFR-01 | Follow-up generation within 5 s (95th percentile); progress shown after 2 s | Performance | Usability session: explorers find the wait for follow-up questions acceptable and see progress feedback | Latency distribution measured over at least 200 sampled follow-ups |
| NFR-02 | Free-text assessment within 8 s (95th percentile) | Performance | Usability session: explorers find the wait for feedback acceptable | Latency distribution measured over at least 200 sampled assessments |
| NFR-03 | Progress survives interruption | Reliability | Acceptance test: an explorer closes the browser mid-scenario, returns, and continues | Forced-interruption tests resume at the recorded position |
| NFR-04 | No progress lost on provider failure; user notified within 10 s | Reliability | Explorers receive a clear message and find their progress intact | Fault injection against the provider interface; zero progress-record loss across injected failures |
| NFR-05 | Minimal, encrypted, deletable personal data; only de-identified answers sent to AI providers | Security and privacy | Data-protection review against applicable regulation; walkthrough of a deletion request | Data inventory review; encryption check; deletion request removes records; AI requests contain no name, e-mail, or account ID; providers are configured with no training on submitted data and no retention |
| NFR-06 | Suppress aggregates below a minimum population | Security and privacy | Privacy review confirms small-population figures are withheld and the reason is stated | Aggregates below threshold are withheld |
| NFR-07 | Disclose AI generation and AI assessment | Transparency | Pilot users can state that scenarios and assessments are machine-produced | Disclosure present at the point of use in every relevant screen |
| NFR-08 | Vietnamese and English support | Usability | Native speakers review both locales for completeness and accuracy | Both locales render complete content with no missing text |
| NFR-09 | At least 80% of readers state the task objective correctly | Usability | Comprehension check with a minimum of 20 representative readers | Validator confirms every scenario states an explicit objective in its context |
| NFR-10 | New occupations need no code change | Maintainability | A content administrator publishes a new occupation through the authoring interface alone | No code change or redeployment is recorded for the new occupation |
| NFR-11 | Session cost stays within the configured ceiling | Cost | System administrator reviews cost against the agreed budget | Cost telemetry aggregated per session and compared against the configured ceiling |
| NFR-12 | Model provider replaceable without content changes | Portability | Domain experts confirm scenario quality is unchanged after a provider switch | Provider substitution test with unchanged content; regression suite passes |
| NFR-13 | Works in a mobile browser on a slow connection | Compatibility | Explorers complete a scenario on their own phone | Test on reference devices and a throttled network profile agreed for testing |
| NFR-14 | AI grading validated against expert judgment | Fairness | Domain experts accept the agreement report for their occupation | Cohen's kappa per difficulty stratum recomputed whenever the assessment model changes |
| NFR-15 | Published scenarios match approved content; AI content during play stays within expert-set limits | Accuracy | Reviewers confirm sampled published scenarios and sampled follow-ups and feedback stay within the approved content | Automated comparison between approved and published content shows no difference; every follow-up and feedback shown passed the output check or is an expert default |
| NFR-16 | Scenario status changes logged; published content immutable | Auditability | A content administrator traces who approved and published a scenario | Lifecycle log complete for every scenario; write attempts on published content are refused |
| NFR-17 | Passwords hashed, all traffic encrypted, idle sessions expire, AI prompts protected against injection | Security and privacy | Security review of sign-in, session handling, and AI prompts | Stored passwords are salted hashes; plain-HTTP requests are redirected or refused; sessions end after the configured idle time; explorer answers reach the AI as separated data whose instructions are ignored; an injection test set in the regression suite never changes a score |
| NFR-18 | Explorer service available within the agreed operating target | Availability | A system administrator reviews monthly availability against the agreed target | Uptime monitoring records availability; planned maintenance is announced in advance |
| NFR-19 | Explorer screens meet WCAG 2.1 level AA | Accessibility | Users with assistive technology complete a scenario | Automated and manual accessibility audit against WCAG 2.1 AA |

: Non-functional requirements with business and technical verification.

Design constraints are recorded separately from business rules, since they arise from implementation choices rather than from the domain. Each derives from at least one non-functional requirement: the requirement states what must be achieved, and the constraint fixes or prohibits a design choice so that it can be.

| ID | Design constraint | Derived from | Rationale |
|---|---|---|---|
| DC-01 | The assessor and generator shall use different model families. | NFR-14 | Reduces correlated failure modes and self-preference bias, thereby improving the independence of automated evaluation (Section 2.5) |
| DC-02 | The system shall support replacing the underlying model provider without requiring changes to the core application logic. | NFR-12, NFR-04 | Dependence on third-party model providers; portability as funding conditions change |
| DC-03 | Personal data is processed and stored in compliance with Vietnam's Law on Personal Data Protection and its implementing decree, including the provisions for cross-border transfer. | NFR-05, NFR-06 | Legal obligation (Sections 2.7, 4.1.4) |
| DC-05 | The platform is delivered as a web application usable through standard browsers without installation. | NFR-13 | Universal access (Section 4.1.5) |

: Design constraints.

### 4.3.4 Data requirements

| ID | Data requirement | Source | Business verification | Technical verification |
|---|---|---|---|---|
| DR-01 | Occupational reference data (occupations, tasks, skills) | O\*NET and ESCO, imported by the content administrator and adapted for Vietnamese practice by domain experts | Domain experts review the adaptation for Vietnamese practice | Imported records resolve against source identifiers |
| DR-02 | Competency taxonomy with observable indicators | Derived from DR-01 under expert adaptation | Domain experts review definitions and indicators | Every rubric criterion resolves to a taxonomy entry |
| DR-03 | Occupational adjacency with overlap measures | Computed from DR-01/DR-02 | Domain experts review computed adjacency for plausibility | Overlap values are reproducible from DR-01/DR-02 |
| DR-04 | Scenario content: context, activities, option scores, rubric, hints, random events, side quests | Author domain expert with AI assistance | Reviewer sign-off recorded before presentation | Context schema validation; automatic checks pass before submission |
| DR-05 | Generated scenarios with provenance | System | A content administrator traces any served scenario back to its context and model | Every served scenario carries resolvable provenance |
| DR-06 | User progress: enrolled levels, competence credit capped per scenario, side-quest points, play history, awards | System | Explorers confirm their progress and awards are shown correctly | Progress reconstructs from stored records; replaying a scenario never adds credit beyond the cap |
| DR-07 | Assessment records, including hint use and explorer flags | System, with flags from explorers | Domain experts audit a sample of assessment records and review flagged content | Records complete for every assessed response; every flag reaches a domain expert of that occupation |
| DR-08 | Five-attribute occupation ratings (project-defined) | Explorers | Acceptance test of the rating flow after full completion | Ratings exist only for fully completed occupations |
| DR-09 | Expert reference set stratified by difficulty | Domain experts | Inter-expert agreement recorded for the reference set | Set covers the defined difficulty strata; every item passed validation |
| DR-10 | Operational telemetry | System | A system administrator answers cost and error questions from the telemetry | Telemetry present and queryable |
| DR-11 | Play-test session flag | System | Staff confirm dashboards are unchanged after play-testing | Play-test sessions are absent from explorer-facing aggregates |
| DR-12 | Quiz answers, RIASEC profile with social index, and AI portrait | Explorers and AI model | Pilot users judge the description relevant and not misleading | Profile recalculates from stored answers; retaking the quiz replaces the profile and portrait |
| DR-13 | Scenario lifecycle record, including review decisions, comments, and revalidation results | System, from staff actions | A content administrator reconstructs a scenario's history | Every transition in SM-01 is logged; every review and revalidation result is stored with actor and time; at most one active scenario per task |
| DR-14 | Presentation data and asset library | Content administrator with AI | Reviewers check sampled assets for stereotyping | Every presented asset resolves to a library entry with a bias-check result |
| DR-15 | Occupation catalogue, including level descriptions and future roles | Content administrator and domain experts | A content administrator reviews the catalogue for completeness | Every published occupation has all required fields and a description for every level |
| DR-16 | User accounts, roles, assignments, and activity log | System administrator; activity log from the system | A system administrator confirms each occupation's staff and reviews an account's activity | Exactly one content administrator and at least one domain expert per occupation; every account action is logged |
| DR-17 | Platform settings | System administrator | A system administrator reviews settings against policy | Every change is versioned with actor and time |
| DR-18 | App feedback records | Explorers | A system administrator reviews recent feedback | Each record holds text, time, app version, and handling status |
| DR-19 | Scenario review criteria | Content administrator | Domain experts confirm the criteria match how they review | Criteria are versioned; each review links to the version it used |

: Data requirements with source, business verification, and technical verification.

Personal data within DR-06, DR-07, DR-08, DR-11, DR-12, DR-16, and DR-18 is subject to the policies in Section 4.1.4. DR-09 contains no personal data and is retained as a research asset.

## 4.4 Summary

This chapter specified the proposed system against the domain established in Chapters 1 to 3. The business context identified three operating processes — exploration, content lifecycle, and evaluation — and twelve business rules, several of which derive from the evidence reviewed in Chapter 2 rather than from product preference: accessible entry levels, competence-gated progression, taxonomy-derived adjacency, mandatory expert validation, and formative-only assessment. It set out a public-benefit business model in which all content is free to users, operation is funded through grants, acknowledged sponsorship, donations, and an intended partnership with the Ministry of Education and Training, and sponsors are excluded from content so that the candour of occupational representation is protected, together with a five-stage roadmap in which each stage is gated by evidence, and a staged organisation of five operating units under a steering committee, with content governed by occupational domain. The system description identified four user groups — explorers, domain experts, content administrators, and system administrators — two research problems in AI applied to education — grounded generation and the validity of stealth assessment, each stated with the comparison that makes its answer knowledge — and the principal difficulties, the most consequential being generation fidelity, assessment validity, expert availability, cost sustainability without revenue, and the uneven alignment between screen-based tasks and live work. The requirements analysis produced forty-three prioritised user requirements, from which forty-four functional, nineteen non-functional, and nineteen data requirements were derived, each paired with a business and a technical verification method, together with four design constraints, each derived from a non-functional requirement and recorded separately from the business rules. Chapter 5 models the processes and interactions these requirements imply.

---

# Chapter 5 — Analysis and Design

## 5.1 Analysis

### 5.1.1 Business process modelling

The three processes identified in Section 4.1.2 are modelled below. Diagram sources are given in a text notation for reproduction in the project's modelling tool.

Exploration process. The process begins with authentication and ends either in occupation completion and rating or in the user selecting a different occupation. The decision points are the optional orientation, the response type within a task, and the unlock evaluation on level completion.

```mermaid
flowchart TD
    A[Register / sign in] --> B{Knows which<br/>occupation to try?}
    B -- No --> C[Orientation conversation]
    C --> D[Candidate occupations presented]
    B -- Yes --> E[Browse catalogue]
    D --> E
    E --> F[Select occupation and level]
    F --> G[Present role, team, working context]
    G --> H[Present task scenario]
    H --> I{Response type}
    I -- Structured --> J[Score against answer key]
    I -- Free text --> K[Score against rubric]
    J --> L[Record competencies evidenced]
    K --> L
    L --> M[Return result, feedback, guidance]
    M --> N{More tasks<br/>in level?}
    N -- Yes --> H
    N -- No --> O[Award competence credit]
    O --> P{Credit meets<br/>threshold?}
    P -- Higher level --> Q[Unlock next level]
    P -- Adjacent occupation --> R[Offer adjacent occupation]
    P -- Neither --> S[Suggest further practice]
    Q --> T{Occupation<br/>complete?}
    R --> T
    S --> T
    T -- Yes --> U[Collect five-attribute rating]
    U --> V[Update aggregate profile]
    T -- No --> E
    V --> E
```

*Exploration process.*


Content lifecycle process. This process governs occupational accuracy and is the operational expression of BR-05. Domain experts author and review content in the system; the content administrator presents, publishes, and maintains it.

```mermaid
flowchart TD
    A[Content administrator creates occupation] --> B[Domain expert authors seed:<br/>facts, competencies, canon events, keyed options, rubric]
    B --> C[System generates sample scenarios]
    C --> D[Other domain experts review seed and sample]
    D --> E{Accurate and<br/>eliciting?}
    E -- No --> F[Rejection or correction recorded;<br/>seed revised]
    F --> C
    E -- Yes --> G[Approval recorded<br/>with reviewing expert]
    G --> H[Content administrator arranges layout,<br/>reviews and publishes occupation]
    H --> I[Available to explorers;<br/>each run checked against its seed]
    I --> J{Annual revalidation<br/>due?}
    J -- Yes --> D
```

*Content lifecycle process.*


Evaluation process. This process is internal to the project and supports RP-1 and RP-2. Experts construct reference items stratified by difficulty; generation output and assessor output are compared against them; agreement is computed with chance correction and reported per stratum, together with test–retest consistency.

### 5.1.2 Use case modelling

Four actors correspond to the user groups in Section 4.2.1. Two external systems also participate, though they are not drawn in the diagram: the model provider, which performs generation and assessment, and the occupational data source, which supplies reference data. Use cases in the diagram are named rather than numbered, and the descriptions and the traceability matrix below refer to them by name. A use case joined to another by an include relation is always performed as part of it; one joined by an extend relation is performed only under the condition stated in the flow of the use case it extends.

![Use case diagram for the proposed system.](latex/figures/jobquest_ucdiagram-1.png)


Tabular descriptions of the key use cases follow. Author scenario and Review scenario are the use cases on which RP-1 depends, and Perform scenario, through Assess answer, is the one on which RP-2 depends.

Perform scenario

| Field | Content |
|---|---|
| Actor | Explorer (primary); model provider (supporting) |
| Goal | Attempt a task representative of the occupation and receive an assessment of it |
| Precondition | The explorer is signed in, is enrolled in the level, and has chosen a published scenario in it (Choose scenario) |
| Trigger | The explorer starts the chosen scenario |
| Main flow | 1. System shows the role, team, and working context of the scenario (View scenario context). 2. System presents the next activity in its question type: choice, ordering, prioritising, or free text. 3. Explorer submits an answer. 4. System assesses the answer (Assess answer): a closed answer against the option scores set by the domain expert, a free-text answer against the rubric anchors, each score backed by quotations found verbatim in the answer. 5. System records the expertise and soft-skill competencies evidenced, capped per skill per scenario. 6. System returns the result, the feedback, and the guidance separately. 7. Steps 2 to 6 repeat for each activity; the scenario ends with a summary of expertise and soft-skill points and of hint use. |
| Alternative flow | 3a. Explorer is stuck and asks for a hint (Get hint): the hint is shown, the +2 option is removed for that activity, and hint use is recorded. 4a. A free-text answer needs probing: system asks a follow-up question within the expert's follow-up goal and the activity's limit (Answer follow-up question), and assesses the follow-up answer as well. 5a. A random event is dropped into the session within the configured probability: its answer adds bonus soft-skill evidence only and never lowers the main score. 6a. Explorer judges the content wrong (Flag wrong content): the flag is recorded and reaches a domain expert of the occupation. 7a. Credit reaches the threshold of the next level (Unlock next level). 7b. Explorer has completed every level of the occupation (Rate occupation). 7c. Explorer leaves mid-scenario: progress is kept and resumes at the recorded position (NFR-03). |
| Exception flow | 1a. Scenario is unavailable: explorer is returned to the Galaxy Map. 4b. An AI-written follow-up or feedback fails the output check: the expert's default follow-up or default feedback is shown instead. 4c. Model provider fails: the answer and progress are kept, the explorer is told within 10 s, and assessment completes when the provider recovers (NFR-04). |
| Postcondition | An assessment record exists, with hint use and any flag (DR-07), and progress is updated within the per-scenario cap (DR-06) |
| Business rules | BR-06 assessment is formative; BR-07 representation includes unfavourable aspects; BR-11 replay cannot exceed the cap; design constraint DC-01 requires the assessor to differ from the generator |
| Requirements | FR-09, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15; NFR-01, NFR-02, NFR-03, NFR-04, NFR-07, NFR-14, NFR-15, NFR-17 |

: Use case Perform scenario.

Unlock next level

| Field | Content |
|---|---|
| Actor | Explorer (primary); occupational data source (supporting) |
| Goal | Convert demonstrated competence into access to further exploration |
| Precondition | The explorer has completed a scenario in an enrolled level and competence credit has been awarded |
| Trigger | A scenario ends with credit awarded (extends Perform scenario) |
| Main flow | 1. System computes accumulated competence credit against the next level's threshold. 2. If it is met, the next level is unlocked and the explorer is told. 3. System recomputes the overlap between demonstrated competencies and the levels of adjacent occupations. 4. Where overlap conditions are met, the adjacent occupation is offered at the higher starting level the competencies support (Enter adjacent occupation). 5. Explorer enrols in the next level, chooses another scenario, or returns to the Galaxy Map. |
| Alternative flow | 2a. Threshold not met: system indicates the competencies outstanding and suggests tasks that elicit them. |
| Exception flow | 3a. Adjacency data is missing: no adjacent offer is made rather than one guessed; the entry level of every occupation stays open (BR-01). |
| Postcondition | Accessible levels and offered starting levels reflect demonstrated competence |
| Business rules | BR-01, BR-02, BR-03, BR-11 |
| Requirements | FR-06, FR-07, FR-08; DR-02, DR-03, DR-06 |

: Use case Unlock next level.

Author scenario

| Field | Content |
|---|---|
| Actor | Domain expert (primary); model provider (supporting) |
| Goal | Record expert knowledge as the scenario content from which tasks are presented and answers judged |
| Precondition | The content administrator has opened a scenario for the task (FR-33); the expert is assigned to the occupation; its knowledge exists (FR-21) |
| Trigger | The expert is notified that a scenario has been opened for the task |
| Main flow | 1. The expert writes the scenario context: role, team, situation, and objective. 2. System generates the scenario content with AI from the context (Generate scenario content), keeping the run's context, model, cost, and check result. 3. The expert edits the content and sets the allowed question types, the score of each option, the rubric, each criterion resolving to a competency, the hints, the random events, and the side quests. 4. For each free-text activity, the expert sets a follow-up goal, a default follow-up, and default feedback. 5. The expert adds reference answers with expert scores (Build reference set). 6. System runs the automatic checks and records the authorship. 7. The expert submits the scenario for review. |
| Alternative flow | 2a. The expert regenerates the content or writes it without AI; every run is kept in the generation history. |
| Exception flow | 5a. A reference answer fails validation: it is not stored and the reasons are returned. 6a. A check fails: the scenario cannot be submitted, and the failing items are identified. |
| Postcondition | A checked scenario with author provenance and generation history awaits review |
| Business rules | BR-05 |
| Requirements | FR-22, FR-23, FR-24; NFR-10, NFR-16; DR-04, DR-05, DR-09 |

: Use case Author scenario.

Review scenario

| Field | Content |
|---|---|
| Actor | Domain expert (primary) |
| Goal | Ensure only scenarios that experts judge occupationally accurate and competency-eliciting reach explorers |
| Precondition | The scenario has been submitted; review criteria exist for the occupation (FR-32); the content administrator has assigned this expert, who is not the author, with a deadline (FR-34) |
| Trigger | The expert is notified of the assignment, or a published scenario is sent back for revalidation |
| Main flow | 1. System shows the scenario with its context, activities, option scores, rubric, and generation history, next to the review criteria. 2. The expert answers every criterion (Apply review criteria). 3. The expert approves the scenario, requests changes, or rejects it, with comments. 4. System records the decision with the reviewer, the time, and the criteria version used; an approved scenario passes to the content administrator for presentation. |
| Alternative flow | 1a. The scenario is under revalidation (Revalidate scenario): it stays published and playable meanwhile, the result is recorded, and an outdated scenario is flagged for replacement. 3a. Changes requested: the scenario returns to its author and re-enters review once revised. 3b. Rejected: the scenario is closed and cannot be reopened; the content administrator may open a new scenario for the task. |
| Exception flow | 2a. A criterion is left unanswered: no decision can be submitted. 1b. The deadline passes: the content administrator is notified and may reassign the review (Reassign overdue review). |
| Postcondition | Every scenario reaching presentation carries a recorded approval against the review criteria |
| Business rules | BR-05, BR-07 |
| Requirements | FR-25, FR-27, FR-34; NFR-15, NFR-16; DR-13, DR-19 |

: Use case Review scenario.

Rate occupation

| Field | Content |
|---|---|
| Actor | Explorer |
| Goal | Record an impression of the occupation and contribute to its aggregate profile |
| Precondition | The explorer has completed every level of the occupation (BR-04) |
| Trigger | Completion of the occupation's last level (extends Perform scenario) |
| Main flow | 1. System presents the five rating attributes and a feedback field. 2. Explorer submits ratings and feedback. 3. System records them and recomputes the aggregate profile. 4. System presents the aggregate alongside the explorer's own ratings, and on the occupation profile. |
| Alternative flow | 2a. Explorer declines to rate: completion is recorded without a rating. |
| Exception flow | 3a. Population below the suppression threshold: the aggregate is withheld and the condition is stated rather than displaying an unfounded figure. |
| Postcondition | Rating recorded; aggregate updated or suppressed |
| Business rules | BR-04 |
| Requirements | FR-19; NFR-06; DR-08 |

: Use case Rate occupation.

The remaining use cases in the diagram are specified in the same form in Appendix 1.

The traceability matrix below traces every requirement to the use case realising it, so that no requirement is left unrealised and no use case introduces behaviour the requirements do not specify. Use cases are listed by actor, in the order explorer, domain expert, content administrator, and system administrator, each followed by the use cases it includes or is extended by.

| Use case | Functional | Non-functional | Data |
|---|---|---|---|
| Register account | FR-01 | NFR-05, NFR-17 | DR-16 |
| Manage account | FR-02 | NFR-05 | DR-16 |
| Complete orientation quiz | FR-03 | NFR-08 | DR-01, DR-12 |
| Build user portrait | FR-04 | NFR-05, NFR-07 | DR-12 |
| View career path | FR-17 | — | DR-15 |
| View personal record | FR-18 | NFR-05 | DR-06, DR-07 |
| Send app feedback | FR-20 | — | DR-18 |
| Explore occupations | FR-05, FR-06 | NFR-08, NFR-13, NFR-18, NFR-19 | DR-01, DR-15 |
| View occupation profile | FR-05 | NFR-06 | DR-08, DR-15 |
| Enter adjacent occupation | FR-07 | — | DR-02, DR-03, DR-06 |
| Choose scenario | FR-08 | — | DR-06 |
| View level description | FR-05 | — | DR-15 |
| Complete side quest | FR-16 | — | DR-04, DR-06 |
| Perform scenario | FR-10, FR-15 | NFR-03, NFR-04, NFR-07, NFR-11, NFR-13, NFR-19 | DR-04, DR-05, DR-06 |
| View scenario context | FR-09 | NFR-09 | DR-04 |
| Assess answer | FR-11, FR-14, FR-15 | NFR-02, NFR-05, NFR-07, NFR-14, NFR-15, NFR-17 | DR-07 |
| Get hint | FR-13 | — | DR-07 |
| Answer follow-up question | FR-12 | NFR-01, NFR-15, NFR-17 | DR-07 |
| Flag wrong content | FR-14 | — | DR-07 |
| Unlock next level | FR-08 | — | DR-06 |
| Rate occupation | FR-19 | NFR-06 | DR-08 |
| Author scenario | FR-22 | NFR-10, NFR-16 | DR-04 |
| Generate scenario content | FR-23 | NFR-11, NFR-12 | DR-05, DR-10 |
| Build reference set | FR-24 | — | DR-09 |
| Review scenario | FR-25 | NFR-15, NFR-16 | DR-13 |
| Apply review criteria | FR-25 | — | DR-19 |
| Revalidate scenario | FR-27 | NFR-16 | DR-13 |
| Review flagged content | FR-14 | — | DR-07 |
| Play-test draft game | FR-26 | — | DR-11 |
| Check grading reliability | FR-28 | NFR-14 | DR-07, DR-09 |
| Submit blind ratings | FR-29 | — | DR-09 |
| Create occupation knowledge | FR-21 | NFR-10 | DR-01, DR-02, DR-03, DR-15 |
| Update occupation knowledge | FR-21 | — | DR-02, DR-03, DR-15 |
| Manage occupation | FR-30 | NFR-10, NFR-16 | DR-13, DR-15 |
| Import reference data | FR-31 | — | DR-01 |
| Assign domain expert | FR-34 | — | DR-13, DR-16 |
| Reassign overdue review | FR-34 | — | DR-13 |
| Design scenario presentation | FR-35 | NFR-15 | DR-14 |
| Generate missing asset | FR-36 | — | DR-14 |
| Define review criteria | FR-32 | — | DR-19 |
| Open task scenario | FR-33 | — | DR-13 |
| Publish scenario | FR-37 | NFR-15, NFR-16 | DR-13 |
| Remove scenario | FR-38 | NFR-16 | DR-13 |
| Monitor occupation statistics | FR-39 | NFR-06 | DR-06, DR-08, DR-11 |
| Request revalidation | FR-27 | — | DR-13 |
| View coverage report | FR-39 | — | DR-04, DR-15 |
| Manage user accounts | FR-41 | NFR-17 | DR-16 |
| Assign occupation staff | FR-40 | — | DR-16 |
| Disable account | FR-41 | — | DR-16 |
| Delete account | FR-41 | NFR-05 | DR-16 |
| View activity log | FR-41 | — | DR-16 |
| Configure AI models | FR-42 | NFR-12 | DR-17 |
| Monitor operation cost | FR-43 | NFR-11, NFR-18 | DR-10 |
| Re-run failed job | FR-43 | NFR-04 | DR-10 |
| Review app feedback | FR-20 | — | DR-18 |
| Handle data requests | FR-44 | NFR-05 | DR-17 |

: Traceability from requirements to use cases.

## 5.2 Technology Solution

The technology stack of JobQuest is chosen from what the requirements ask of each part of the system. Three properties of the requirements drive most choices: a written answer waits several seconds on external models that can fail (NFR-01, NFR-02, NFR-04); scores unlock levels and occupations, so the server must score authoritatively by the same rules the browser uses for immediate feedback (BR-02, BR-11, FR-15); and personal data must be processed and stored in Vietnam (DC-03). Sections 5.2.1 and 5.2.2 state, for each component of the frontend and backend, what it must do, with the requirements behind it, and the decision taken: the technology and the features of it that meet those requirements. The selected stack is summarised at the end of Section 5.2.2, and Section 5.2.3 covers the AI design. Versions are those resolved in the workspace lockfile at the time of writing.

### 5.2.1 Frontend

The frontend serves two populations. Explorers, in twenty-one of the fifty-six use cases of Section 5.1.2, play on their own phones over weak connections (NFR-13), may use assistive technology (NFR-19), read the interface in Vietnamese (NFR-08; only Vietnamese is supported in this phase), and wait seconds while a model assesses a written answer (NFR-01, NFR-02). Staff, in the other thirty-five, work at desktops in forms, review queues, and tables (FR-21 to FR-44).

Application framework. The frontend must render a game interface with many interacting states — the occupation map, conversations with characters, the four response forms of FR-10, hints, follow-up questions, and results (FR-05, FR-07, FR-10 to FR-14). It must show provisional feedback on closed formats at once, by the same rules the server applies (FR-15, BR-11), stay responsive while a model works (NFR-01, NFR-02), and load quickly on a mid-range phone without installation (NFR-13, DC-05). Every route except the landing page requires sign-in (FR-01), so no screen needs search indexing.

**Decision: React 19 with Vite 8, as a client-rendered single-page application.** React's component model fits an interface of many independent, stateful parts, and it is the most used web framework, by 44.7% of developers [136], so libraries for drag-and-drop ordering, 3D rendering, and accessibility are mature. Running in the browser lets the shared rules package, *game-core*, compute provisional scores without a round trip. React 19's optimistic-update hook shows "saved, assessing" the moment an answer is sent [137]. Vite's production build splits code into chunks loaded on demand [138]: the prototype's entry was about 195 KB compressed in the build of 18 September 2026, and a budget of 200 KB for the first interactive screen, about one second under the Lighthouse mobile profile [139], is checked in continuous integration. Server-side rendering is not used: with every screen behind sign-in it brings no indexing benefit, and it would add a server that renders personal data, whereas static files hold none and can be cached on a content delivery network without affecting DC-03.

Occupation map. The map must convey the progression metaphor of Section 4.2.1 (FR-05, FR-07), remain operable with a keyboard and a screen reader (NFR-19), and not exclude low-end devices (NFR-13).

**Decision: three.js 0.186 through @react-three/fiber 9.7, with an SVG view drawn from the same data.** @react-three/fiber writes the 3D scene as React components that share state with the rest of the interface [140]. Because a canvas exposes nothing to a screen reader and a 3D scene costs GPU work every frame [141], an SVG view, in which each planet is a focusable, named element [142], is the accessible equivalent. It can be chosen at any time and is used automatically when WebGL is missing or lost, when reduced motion or data saving is requested, or on low-memory devices. The 3D libraries, about 310 KB compressed, load only when the 3D view opens.

Styling. Styles must add little to the download (NFR-13) and let each occupation carry its own theme without code changes (NFR-10).

**Decision: Tailwind CSS 4.3.** It generates CSS only for the classes used and has no runtime [143]; occupation themes are design tokens held as CSS variables and supplied by content data.

Client state. Client state must apply *game-core*'s reducer directly (FR-10, FR-15) and keep unsent turns through a lost connection (NFR-03).

**Decision: zustand 5.0.** A store wraps the reducer, so one dispatch updates both screen and rules state; its persistence middleware keeps unsent turns in browser storage, resent with an idempotency key on reconnection [144]. It needs no provider tree and adds little to the bundle.

Routing. Routing must keep the 3D map and all staff code out of the explorer's first download (NFR-13), separate explorer and staff areas by role (FR-41), and resume a run on any device (NFR-03).

**Decision: React Router 7.18.** Routes load on demand, nested layouts separate the areas by role, and route loaders fetch the state of an interrupted run from the server [145].

Result delivery. Assessment results must reach the explorer as soon as they are ready (NFR-02, FR-14) over connections that drop (NFR-13). Only the server needs to push; the client submits answers by ordinary requests.

**Decision: server-sent events.** The browser's built-in *EventSource* receives pushed events over plain HTTP, through any proxy, and reconnects by itself [146]; a bidirectional WebSocket channel is not needed.

Staff application. Staff work in review queues, lists, and statistics (FR-21 to FR-44), in dialogs, comboboxes, and grids, where hand-built interfaces most often fail accessibility (NFR-19).

**Decision: the same stack, plus TanStack Query and React Aria.** TanStack Query caches and refreshes server data [147]; React Aria supplies accessible interaction primitives [148]. The staff application is a separate bundle on the same origin and sign-in screen.

Localisation. Only Vietnamese is supported in this phase, while NFR-08 still names Vietnamese and English and is to be aligned. Interface strings must be complete in every supported language, and adding English later must not require changes to the screens.

**Decision: a typed message table with the standard *Intl* API.** An unknown key fails compilation and a test fails a missing translation; plurals, dates, and numbers are formatted by *Intl* [149]; content fields carry a locale, so a second language is added as data. Generated text is inserted as text, which React escapes, so model output cannot inject markup (NFR-17) [150].

### 5.2.2 Backend

The backend carries five kinds of work: short requests for navigation, records, and staff edits; durable recording of every turn as it happens (NFR-03); assessment and follow-up generation, which wait seconds on external models and occasionally fail (NFR-01, NFR-02, NFR-04); authoritative scoring (BR-02, BR-11); and a governed content lifecycle with logged transitions (NFR-16).

Application framework. Most backend time is spent waiting — on models, on the database, on open result streams — and at Stage 4 about five thousand explorers are connected at once (Section 5.3.1). The framework must also give the modular structure of Section 5.3.1 clear module boundaries, check occupation-scoped roles on every request (FR-40, FR-41), integrate a job queue and server-sent events, and score by the same rules as the browser (FR-15, BR-11).

**Decision: NestJS 11.1 on Node.js, in TypeScript.** Node.js serves I/O on an event loop, so a waiting request or open stream costs memory rather than a thread. NestJS modules and dependency injection give each bounded context its own module; guards enforce occupation-scoped roles; interceptors write the activity log; and first-party integrations provide BullMQ queues and server-sent events [151]. Dependency injection also binds the model port to the provider adapter named in configuration (DC-02, NFR-12) [152]. The server imports the same *game-core* package as the browser and recomputes every score from stored events. Models are called over HTTP and run nowhere in the process, so the request path needs no Python; the statistics for evaluating RP-1 and RP-2 run offline in Python scripts. Long computation, which would block an event loop, runs in worker processes.

Database. Much of the data is relational, with rules that span records: a reviewer is never the author (FR-25), one active scenario per task (FR-33), exactly one content administrator per occupation (FR-40), and the replay cap (BR-11). Publication and its log must be atomic, and published content immutable (NFR-16); scenario content is nested documents (NFR-10, NFR-15); statistics are shown only above a population threshold (NFR-06, FR-19, FR-39); and the store must be hostable in Vietnam (DC-03).

**Decision: PostgreSQL, accessed through Prisma ORM 7.10.** Foreign keys, check constraints, partial unique indexes, and transactions enforce the cross-record rules in the database itself — "one active scenario per task" is a single partial index [153]. A transition and its log entry share one transaction, and a trigger refuses updates to published releases. Content is stored in *jsonb* columns [154], validated by *game-core*'s schemas on write and read. Thresholded statistics are SQL grouping, window functions, and materialised views. PostgreSQL is open source, offered by every cloud provider, and the most used database, at 55.6% [136]. Prisma generates a typed client from the schema and, from version 7, runs over the standard *pg* driver [155]; partial indexes, checks, and triggers, which Prisma does not express, live in SQL migrations and are tested against the database.

Job queue and messaging. Model work must survive failures, be retried, and be listed for re-run when it fails (NFR-04, FR-43); it must respect each provider's rate limits and serve live play first — narration and follow-ups for an explorer in a scenario before background scoring, and both before authoring work (NFR-01, NFR-11); results must reach the API replica holding the explorer's stream (NFR-02); and each session's model cost must be counted atomically (NFR-11).

**Decision: Redis with BullMQ 6.3.** BullMQ provides persisted jobs, retries with exponential backoff, job priorities, per-queue rate limiting, and a set of failed jobs for re-run [156]; Redis's publish–subscribe carries results to every API replica, and its atomic counters meter the session budget. Redis holds nothing that cannot be rebuilt from PostgreSQL, and a scheduled reconciliation re-queues any stored answer without a result, so losing Redis loses no answer.

Authentication. The platform must register, sign in, recover, and delete accounts (FR-01, FR-02); hash passwords, protect sessions, and end idle ones (NFR-17); scope roles to occupations (FR-41); and keep identity data in Vietnam (DC-03).

**Decision: the platform's own module — argon2id, JWT access and refresh tokens in httpOnly cookies, and optional Google sign-in.** Passwords are hashed with argon2id [157]; a fifteen-minute access token and a rotating refresh token with reuse detection [158] live in httpOnly, SameSite cookies that scripts cannot read; Google ID tokens are verified with google-auth-library. Accounts stay in the platform's database in Vietnam, which an external identity service would hold abroad, and occupation-scoped authorisation must live in the application whichever service is used. The module is completed against ASVS 5.0 level 2 [159]: single-use, short-lived reset tokens; an inactivity limit; account status checked on every refresh and staff request; rate limiting of sign-in; and a second factor for staff.

Validation and code organisation. Every input and every model output must be checked against a schema (NFR-17, FR-11), and one copy of the rules and contracts must serve both applications, the API, and the worker (FR-15).

**Decision: Zod 4.6 schemas in an Nx 23.1 monorepo.** Zod schemas, shared by API, clients, and the rule checks, validate requests, content documents, and model output — scores within rubric anchors, quotations verbatim. Nx keeps *game-core* and the schemas in one repository, enforces module boundaries so staff code never enters the explorer's bundle (NFR-13), and builds and tests only what a change affects [160].

Packaging and hosting. Personal data must be stored in Vietnam (DC-03, NFR-05) — Decree 53/2022 further requires domestic online-service enterprises to store users' data in Vietnam, applicability to be confirmed (Section 4.1.4) [161][162] — and the platform must stay available (NFR-18) while growing from a university pilot to a national service.

**Decision: Docker containers, hosted in Vietnam.** One image runs as API or worker, with rolling deployment and health checks, and the platform depends only on portable services — PostgreSQL, Redis, and S3-compatible storage — so moving host is a change of configuration. The system of record runs on university infrastructure for the Stage 1 pilot and on a cloud provider in Vietnam from Stage 2 [163]; an international region such as Singapore would make every account a cross-border transfer [99]. Only de-identified text leaves the country, through the model gateway. International providers adding capacity in Vietnam, such as the AWS Hanoi Local Zone, whose control plane remains in Singapore [164], are reassessed with the legal office before Stage 2.

Summary. The table summarises the selected stack and the requirements each choice serves.

| Component | Technology | Requirements served |
|---|---|---|
| Frontend framework | React 19 + Vite 8, single-page application | Game interface (FR-05, FR-07, FR-10); rules in the browser (FR-15); light first load (NFR-13); no indexing needed (FR-01) |
| Occupation map | three.js + @react-three/fiber, with an SVG view | Galaxy Map (FR-05, FR-07); accessibility (NFR-19); low-end devices (NFR-13) |
| Styling, state, routing | Tailwind CSS 4, zustand 5, React Router 7 | No style runtime, unsent turns kept, routes on demand (NFR-13, NFR-03, FR-41) |
| Result delivery | Server-sent events | Results pushed when ready (NFR-02, FR-14); automatic reconnection (NFR-13) |
| Staff application | TanStack Query, React Aria | Queues and statistics (FR-21 to FR-44); accessibility (NFR-19) |
| Backend framework | NestJS 11 on Node.js | Waiting without blocking (NFR-01, NFR-02); modules and role guards (FR-41); queue and SSE integration |
| Database | PostgreSQL + Prisma 7 | Cross-record rules (FR-25, FR-33, FR-40); atomic, immutable publication (NFR-16); thresholded statistics (NFR-06) |
| Job queue, messaging | Redis + BullMQ | Durable, retried, prioritised, rate-limited model work (NFR-04, NFR-11, FR-43) |
| Authentication | argon2id, JWT in httpOnly cookies, Google sign-in | NFR-17, FR-01, FR-41; identity data in Vietnam (DC-03) |
| Validation, code organisation | Zod 4, Nx monorepo | One copy of rules and schemas (FR-15, NFR-17) |
| Packaging, hosting | Docker, host in Vietnam | DC-03, NFR-05; portable scaling and availability (NFR-18) |

: Selected technology stack.

### 5.2.3 AI algorithms, technologies, and models

This subsection records the AI design as presented to the advisor in week 41. It is a design and a literature review: no measurement has been run yet, and the first test is planned for the following week. Several parts of Chapter 4 predate this design and are to be aligned with it in the next revision.

The five places where AI works. AI is used at five steps, three while content is authored and two during play. AI drafts, connects, scores, and filters; domain experts decide occupational content, scoring keys, and publication.

| Step | What AI does | What a person decides |
|---|---|---|
| AI-1 | Interviews the domain expert to collect what a scenario seed needs | The expert confirms the record |
| AI-2 | Turns the expert's input into a structured game seed, with the content administrator | The expert sets every scoring key and rubric anchor, and approves the seed |
| AI-3 | Runs test playthroughs and picks the cases the expert must see | The expert rules on them and approves publication |
| AI-4 | Writes connecting narration and follow-up questions during play | Nobody at run time; the engine and rules constrain it |
| AI-5 | Scores the playthrough against the rubric | The expert reviews flagged cases |

: The five AI components and the human decision attached to each.

AI-1, interviewing the domain expert. A language model asks and probes to collect what a seed needs: incidents, what a good and a poor response look like, and the facts of the situation. Each expert is interviewed separately, and the merged content marks where experts agree and where they differ. The interview is constrained by a human-written topic guide based on the critical incident technique [26] and on development practice for situational judgment tests [27]; the model probes inside each topic only. A tracker lists the seed fields still missing, the expert is shown a summary and confirms it, and every turn is stored verbatim so that each seed field links to the turn it came from. That a language model can hold an interview to a guide is supported by 766 AI-led interviews in which 94.8% to 99.8% of questions were open-ended, 95.7% to 99.6% neutral, and 0.1% to 0.4% hallucinated [115].

AI-2, drafting the game seed. The model helps the content administrator turn the experts' answers into a structured seed: context, characters, situations, canon events, and the scoring frame. Drafts are written from the expert's own words, the domain expert sets every scoring key and every rubric anchor, and a seed passes automatic structure checks and then the expert's approval before any player sees it. Experts own keys and rubrics because, when GPT-4 drafted 210 examination questions, specialists required revision of 15% and judged 0.5% false [116]. The seed follows evidence-centered design: what is measured, which behaviour is evidence for it, and which situation elicits that behaviour [20][117]. This is the first of four checkpoints for generated content: structure is checked by machine and content is approved by the expert.

AI-3, helping the expert test before publishing. A volunteer expert with about seven hours cannot read every free-text answer. AI-3 runs AI-4 and AI-5 on test playthroughs, from experts, testers, and simulated answers, and ranks the cases that need the expert: cases where the three judges differ by more than one level, generated turns that broke a run-time rule, and a blind random sample of cases that were not flagged. The expert decides, and can refine a rubric anchor during review, so rubrics are versioned. The random sample is required because confidence signals from a language-model grader separate right from wrong grades only weakly, with an area under the curve of 0.57 to 0.64 [118], so flagged cases alone can hide errors; if n audited cases show no error, the error rate is at most about 3/n at 95% confidence [119]. Simulated players find relative problems only: persona-prompted models answered with near-perfect, uniform accuracy, unlike 2,359 real students [120], so real test plays are needed as well. The run-time checks of AI-4 are to be tested on scripted player turns in four classes (on-script, off-script, adversarial, and rubric-fishing), reporting the violation rate per class; this test set is not yet built. This is the second checkpoint, and the expert-scored test plays are also the validation data for the judge. In the present phase there are no experts or real players: the team stands in for both and the advisor checks a sample, so results show that the machinery works, not agreement with experts.

AI-4, narrating during play. The game engine, not the model, controls the order of canon events. Canon content is shown verbatim from the seed; a situation may have several approved canon variants chosen at random, and the log records which variant was served. The model writes only the connecting narration and the follow-up questions that fit the player's free-text answer. The whole seed is placed in the prompt, without retrieval or fine-tuning, and the rubric and scoring keys are not in the prompt. Run-time checks are rules, not another model call, so checking adds no waiting time: numbers and names must come from the seed or from the player's own text, and the engine counts follow-ups. A model from a different family reviews the logs afterwards. Holding authored structure outside free generation is the established approach in interactive narrative [121], and when the source fits in the prompt, long-context prompting outperformed retrieval on average [122]. These are the third checkpoint (rules at run time) and the fourth (log review afterwards).

AI-5, scoring the playthrough. The scoring model is separate from the narrating model (DC-01). There is no reference answer: answers are free text, and the judge scores each rubric criterion by how far the answer meets the behaviour described for each level. Each judge is called once per situation, with at most three criteria in a call; the call runs in the background when the situation ends, and results appear on the summary screen. For each criterion the judge returns a verbatim quote from the player, then the rationale, then the level, and the quote must be a substring of what the player typed. A panel of three judges from three model families scores each situation and the median is the score; cases where judges differ by more than one level go to the expert through AI-3, and if one judge is unavailable the system waits for all three. One call for all criteria was not chosen because batching several rubric checks into one call trades accuracy for cost, with a large loss when the evidence is spread over a long trajectory [123]. A panel was chosen because a five-judge vote matched the best single judge, with a Pearson correlation with humans of 0.627 against 0.623 [124], so a panel reaches the best judge's level without knowing in advance which judge that is. The design does not claim that a panel is more accurate than a single judge.

Strength of the judge relative to the generator. The judge does not need to be stronger than the generator, because it scores text written by a person, not the generator's output. It does need enough capacity: small models aligned poorly with human raters (intraclass correlation below 0.20) and larger models moderately (0.41 to 0.57), against 0.45 between the two human raters [125]. It need not be a reasoning model: two reasoning models had lower validity than a smaller standard model in essay scoring [126]. Each judge family is therefore to be tested at two tiers, and the cheapest tier that is not clearly worse is chosen.

Reliability of a language-model judge. Published evidence supports a conditional answer, not reliability by default. On a standard essay dataset, mean quadratic weighted kappa was 0.313 for ChatGPT and 0.297 for Llama against 0.817 for the best supervised system [127]. Agreement nears human level with a strong model, an explicit rubric, and scored examples (Section 2.5) [101][102][103][104][105]; the present phase has the first two, and examples come later from expert rulings. Automated scorers handle fully correct and fully incorrect answers well and are much worse on partially correct ones, while human agreement stays constant [128]. A judge is only as good as its knowledge of the work: without a reference answer, judges agreed with experts only on questions they could answer themselves [129], and judging ability tracks problem-solving ability [60]; since there is no reference answer here, the judge must know IT work and the rubric must carry domain knowledge. Judges favour their own generations [130], hence a judge family other than the generator's. This evidence comes from another setting, English essays and short answers scored by earlier generations of models; none concerns Vietnamese or role-play. Reliability must therefore be measured on the project's own task (RP-2) against the criteria of Williamson, Xi and Breyer [71]: quadratic weighted kappa of at least 0.70, a standardised mean difference of at most 0.15, and agreement at most 0.10 below that between experts.

Framework for the judge. The offline test harness is Inspect AI, an open-source framework maintained by the UK AI Security Institute [131]. It provides repeated runs, several grader models in one run, a median reducer, and an ordinal Krippendorff's alpha; the project's rubric needs a custom scorer. In the product, the judge is the project's own TypeScript module with schema-validated output, and prompts and rubrics are kept in data files shared by both. These tools have no peer-reviewed papers; the cited science is in the method, rubric-based scoring with reasoning before the score [58] and panels of judges [74].

AI-native character and provider failure. The definition adopted is that a system is AI-native when AI is constitutive of its core loop, so that removing the AI makes the central activity collapse or change fundamentally [132], and when AI is part of design, operation, and maintenance, not an added component [133]. In JobQuest, AI works at all five steps: without it the system cannot fit the narration to a free-text answer and cannot score that answer, and there is no substitute path, neither keyword scoring nor a scripted replacement. When the model provider fails, generation and scoring, the core, stop; the session pauses, answers and progress are saved (NFR-04), and play resumes when the AI returns; pages that do not use AI, such as sign-in, the occupation map, and the profile, stay available; switching to another provider is still AI, not a fallback (DC-02). Several providers are used so that an outage at one provider does not take every AI function down at once.

Model families and candidates. Four model families are needed: one for generation and three for the judge panel. Judges differ from the generator (DC-01) and from each other. The criteria are Vietnamese capability, knowledge of IT work, response time, price, schema-constrained output, and data terms. The table below lists the candidates to be tested, with Vietnamese scores from the SEA-HELM leaderboard of 18 September 2026 [134] and list prices read on 8 and 9 October 2026 [135]. Where a candidate is not on the leaderboard, the score shown is that of the closest listed model, under that model's name.

| Role | Candidates (USD per million tokens, input / output) | SEA-HELM Vietnamese |
|---|---|---|
| Judge, Anthropic | claude-sonnet-5-5 (2 / 10); claude-haiku-5-5 (0.10 / 0.50) | Sonnet 5: 77.0; Haiku 4.5: 67.7 (earlier models) |
| Judge, OpenAI | gpt-6.1-sol (2 / 10); gpt-6-luna (0.10 / 0.50) | GPT 5.6 Sol: 77.1; GPT 5.6 Luna: 71.9 (earlier models) |
| Judge, Google | gemini-3.8-flash (0.75 / 3.75); gemini-3.5-flash-lite (0.30 / 2.50) | gemini-3.8-flash: 78.4; Gemini 3.1 Flash Lite: 75.2 |
| Narrator | deepseek-flash (0.30 / 1.20); qwen3.8-flash (0.15 / 0.47) | DeepSeek V4 Flash: 72.1; Qwen 3.8 Flash Next: 74.9 |

: Candidate models to be tested, with list prices and Vietnamese benchmark scores.

Public data cannot answer three things: knowledge of IT work for the three pilot roles, for which no public benchmark exists; the newest small models, which are not on the Vietnamese leaderboard; and response time measured from Vietnam. With token counts assumed, one playthrough costs about USD 0.015 with small-tier judges and USD 0.086 with mid-tier judges, narrator included. The final choice is made after the first test, reported with agreement, response time, and cost.

Items awaiting game design. Several items cannot be settled before the game design is fixed: the scoring scale, where −1 / 0 / +1 / +2 is planned and not final and the current sample scenarios describe three levels only; the competency scoring table for a playthrough and the specific criteria given to the judge; the list of required facts in a seed, needed to measure fact preservation (NFR-15); and how evidence from the play process, such as hints, time, and follow-ups, counts and how scores combine into a competency. The current sample scenarios and scoring are placeholders. The measure itself does not depend on game design: agreement between judge and expert can be computed on any ordinal scale.

## 5.3 Design

### 5.3.1 System Architecture

The architecture is derived from the requirements, not from the prototype. The prototype shows that the technologies of Section 5.2 work for this system and contributes several mechanisms; where it falls short, the gap is listed at the end of this section. The section presents the drivers and the architectural decision they lead to; the actors and external systems; the components and their interfaces; how the system runs; how it is deployed and scaled; and evidence that it meets the use cases and non-functional requirements.

Architectural drivers. Eight properties of the requirements determine the structure.

| ID | Driver | Source | Architectural consequence |
|---|---|---|---|
| AD-1 | Model calls lie on the explorer's critical path, take seconds, and fail independently of the platform | NFR-01, NFR-02, NFR-04; Perform scenario, flows 4b and 4c | No model is called inside the request that submits an answer. The answer is stored first; model work runs as a queued job whose result is pushed to the client |
| AD-2 | Scores have consequences: credit unlocks levels and occupations | BR-02, BR-03, BR-11; FR-08, FR-15 | The server is the authority over every score; the client computes only provisional feedback, with the same rules |
| AD-3 | Every judgment must be reconstructable, for the explorer, the expert, and the research | FR-28, NFR-14, NFR-16; DR-05, DR-07 | A run is an append-only sequence of events; model outputs enter it as recorded events with provenance and are never recomputed |
| AD-4 | Content is governed data with a lifecycle | NFR-10, NFR-15, NFR-16; BR-05, BR-13 to BR-16; FR-21 to FR-38 | Content lives in versioned releases written by one lifecycle module; a published release is immutable; code interprets content but never contains it |
| AD-5 | Personal data has a legal boundary | NFR-05, NFR-17, DC-03 | The system of record is hosted in Vietnam; one path leads to model providers, through de-identification |
| AD-6 | Models are replaceable, separated by role, and cost-bounded | DC-01, DC-02, NFR-11, NFR-12 | Domain code depends on a model port; providers are adapters chosen by configuration; a ledger meters every call against a per-session ceiling |
| AD-7 | Two client populations differ in device, network, and privilege | NFR-08, NFR-13, NFR-19; FR-21 to FR-44 | Two frontend applications on one origin: a light explorer application and a staff application downloaded only by staff |
| AD-8 | Growth from pilot to national resource on grant funding | Section 4.1.5; NFR-11, NFR-18 | One deployable codebase at first; model-facing work scales separately; no stage requires re-architecture |

: Architectural drivers and their consequences.

Architectural style. The drivers call for a design in which nothing slow or fallible sits inside a request, the server owns every score, a run can be replayed, and the model-facing work can grow on its own.

**Decision: a modular monolith with asynchronous workers.** One codebase is deployed as API processes, which answer requests, and worker processes, which run queued jobs. Modules follow the use case groups of Section 5.1.2 and communicate only through public interfaces, so any could later be extracted; the one part that must scale independently, model-facing work, is already separated by the worker tier, following the practice of extracting services only once a boundary has proved itself [165]. Inside, model providers, the database, and email are reached through ports with replaceable adapters [152], which meets DC-02; and runs are event-sourced [166], their state being the fold of their events through *game-core*. Four alternatives were rejected, each for a specific requirement.

| Alternative | Requirement it fails | Why |
|---|---|---|
| Scoring in the browser, as in the prototype | BR-02, FR-11, NFR-05, DC-01 | A model cannot be called from the browser without exposing provider credentials, and the answer would bypass de-identification; a browser-computed score can be altered, voiding competence-gated unlocking |
| Calling the model inside the submitting request | NFR-03, NFR-04, NFR-13 | A provider failure mid-request loses an unstored answer, and a request held open for eight seconds is the first to break on a weak mobile connection |
| Microservices | NFR-03, NFR-16 | A turn with its consequences, or a release with its log, would span services and need distributed transactions; three people would operate several deployables for no requirement |
| Serverless functions on the request path | NFR-01 | Cold starts add latency to the step whose 95th percentile NFR-01 bounds |

: Architectural alternatives and the requirements they fail.

Actors and external environment. Four actors use the system, each through a browser (Section 4.2.1). Explorers — students and career changers — play scenarios on phones or laptops. Domain experts author, review, and revalidate the content of an occupation and rate responses blind. Content administrators manage an occupation in the catalogue, assign reviews, design presentation, and publish. System administrators manage accounts, model configuration, cost, failed jobs, and data requests. Four external services sit outside the system boundary: model providers abroad — a narrator of one family, judges of three other families, and an image model; Google, as an optional identity provider; an email delivery service; and the occupational data sources O\*NET and ESCO, imported periodically.

Component view. The figure below shows the components and the interfaces between them in UML notation: a ball is an interface a component provides, a socket one it requires. The API and Worker subsystems are the same codebase running different processes; they never call each other directly but communicate through the job queue and publish–subscribe channel in Redis.

![Component diagram of JobQuest. Each line joins the component that requires an interface (socket) to the component that provides it (ball).](latex/figures/jobquest_component_diagram.png)

Each module is described below with its responsibility and its state in the prototype.

Explorer application. The occupation map, levels, the scenario player for the four response forms of FR-10, hints, follow-ups, results, the personal record, ratings, and feedback (FR-03 to FR-20). It runs *game-core* for instant provisional feedback on closed formats, queues unsent turns locally, and receives narration, follow-ups, and assessment results through a server-sent event stream. Prototype: screens, the 3D map, and the four forms exist; the turn queue, event stream, and 2D map do not.

Staff application. The thirty-five staff use cases: the AI-1 interview through which a domain expert gives the knowledge a seed needs, review, test playthroughs, reliability, and blind rating for domain experts; seed drafting with AI-2, catalogue, presentation, publication, and statistics for content administrators; accounts, model configuration, monitoring, data requests, and feedback for system administrators. It shares the sign-in screen and origin with the explorer application (FR-41) but is a separate download. Prototype: absent.

Game core. A library with no framework, network, or storage dependency: the reducer folding run events into state, scoring of closed formats against expert keys, credit with the per-scenario cap, unlocking and adjacency offers, content schemas, and the rule checks on model output of Section 5.2.3 — numbers and names in narration found in the seed or the player's text, the follow-up count, each judge's quotation found verbatim in the answer, levels within the scale. It runs unchanged in browser and server. Prototype: present; its free-text grader is a synchronous keyword matcher inside the reducer, which must become an asynchronous assessment entering the run as an event.

Identity and access. Accounts, sign-in and recovery, sessions, occupation-scoped roles, disabling, deletion, and the activity log (FR-01, FR-02, FR-40, FR-41); every module asks it whether an actor may act on an occupation. Prototype: registration, email and Google sign-in, rotating sessions, and deletion exist; reset, idle expiry, scoped roles, disabling, and the log do not, and the three prototype roles must become the four actors of Section 4.2.1.

Exploration. Everything outside the assessment itself: orientation, catalogue and profiles, enrolment, runs and their events, credit, unlocking, adjacency offers, side quests, ratings, records, and feedback (FR-03 to FR-09, FR-15 to FR-20). It validates turn events with *game-core* and stores them; for each free-text answer it records a narration request, and when a situation ends a scoring request, each in the same transaction as the event that causes it. Prototype: present, but runs are submitted as one batch at the end.

Assessment. Turns answers into results, feedback, and guidance (FR-10 to FR-14). Closed formats are scored synchronously by *game-core*; free text is scored in the background when its situation ends (AI-5), and the result, together with feedback written from the judges' output, is written back as events and shown on the summary screen in the three separate parts of FR-14. It also routes explorers' flags of wrong content to the occupation's domain experts. Prototype: closed formats scored by replaying the run; free text matched by keyword.

Content lifecycle. Occupations, knowledge, scenarios and drafts, generation history, review criteria, assignments and decisions, presentation, assets, and publication (FR-21 to FR-38). It is the only writer of content, implements the state machine SM-01, writes each transition with its log entry in one transaction, and publishes immutable, versioned releases. It uses AI orchestration for generation, validation, presentation, and missing assets; the scheduler for deadlines and annual revalidation; and the importer for O\*NET and ESCO, whose interest codes also drive orientation matching (FR-03). A domain expert or content administrator can send a published scenario back for revalidation while it stays playable (FR-27). Prototype: versioned immutable documents, written only by a seed script.

AI orchestration. Runs every model use of the five AI components of Section 5.2.3 as a job: the expert interview (AI-1) and seed drafting (AI-2) at authoring time, with presentation design and missing assets (FR-35, FR-36); test playthroughs (AI-3); narration and follow-ups during play (AI-4, FR-12); and scoring by a panel of three judges (AI-5, FR-11), plus the portrait (FR-04). Per job it loads the pinned content version, removes identifying details from explorer text, checks the session budget, calls the model port, applies *game-core*'s rule checks, and records model, prompt version, cost, and latency. There is no scripted substitute for a model's output: a job that cannot complete is retried or waits, and a session pauses until it can. It rechecks at job time that no judge shares the narrator's family or another judge's. Prototype: absent; queue and model-client libraries are declared but unused.

Model gateway. One adapter per provider and a registry recording each model's role — text generation, assessment, image generation (FR-36) — with its provider and family; configuration is refused when the narrator and a judge, or two judges, share either (FR-42, DC-01). It applies per-provider concurrency limits, timeouts, retries, and a circuit breaker. Whether adapters use providers' own clients or a unifying library is decided in Section 5.2.3. Prototype: absent.

Analytics. Everything shown only in aggregate: ratings and statistics above the population threshold, play-tests excluded (FR-19, FR-39, NFR-06, DR-11); coverage; agreement by difficulty stratum and the disagreement list (FR-28, NFR-14); and blind ratings (FR-29). Occupation ratings are re-aggregated in the transaction that stores each rating (FR-19); heavier statistics refresh periodically, later from a replica. It never returns an individual's record. Prototype: personal summaries only.

Operations. Telemetry of usage, cost, latency, and errors (DR-10); failed jobs and re-runs (FR-43); versioned settings, including the cost ceiling (DR-17); data-subject requests (FR-44); and feedback review (FR-20). Prototype: absent.

Notification, scheduler, and import. Notification sends email and in-app notices: reset links, review assignments, reminders, play-test invitations. The scheduler runs recurring jobs: review reminders and overdue notices (FR-34), annual revalidation (BR-15), retention, refreshing statistics, and the reconciliation that re-queues any narration or scoring request left without a result. The importer loads O\*NET and ESCO and lists unresolved records (FR-31). Prototype: absent.

Data stores. The operational database is the system of record: relational tables for accounts, assignments, runs, events, evidence, reviews, ratings, and logs, and documents for content. The queue store holds jobs, rate limits, budget counters, and the publish–subscribe channel feeding event streams — nothing that cannot be rebuilt from the database. The object store holds assets and exports. Prototype: the database, with 19 tables.

System overview. The figure below shows the whole system as deployed: the two browser applications, the content delivery network, the reverse proxy, the API and worker processes with the modules inside them, the three data stores, and the external services. The dashed border is the boundary of DC-03; only de-identified text crosses it, through the model gateway. The numbered arrows follow one written answer from submission to what the explorer sees, the path detailed below.

![System overview of JobQuest: components, technologies, and hosting, with the numbered path of one written answer. Blue arrows are the request path; orange arrows the background AI path; the dashed border is the hosting boundary of DC-03.](latex/figures/jobquest_arch_overview.png)

Deployment. The deployment diagram below uses the same layout as the component diagram, so that each component can be found in the node that runs it. Both applications are static bundles, served to browsers by a content delivery network that holds no personal data. Inside one cloud region in Vietnam, a web application firewall and load balancer terminate TLS and spread requests over the API pods of two zones. API and worker pods run the same Docker image, started in two roles; both are stateless, so capacity grows by adding pods: API pods on CPU and open streams, worker pods on queue length. PostgreSQL runs as a primary with a synchronous standby in the other zone and a read replica for analytics; Redis runs as a primary with a replica. The model gateway reaches the providers abroad only through an egress proxy that admits allowlisted endpoints, and backups are copied to a second region in Vietnam. At Stage 1 the same nodes run on one university server under Docker Compose, with one API and one worker.

![Deployment diagram of JobQuest at Stages 3 and 4, in the layout of the component diagram: devices and nodes, the components each node runs, and the protocol of each communication path.](latex/figures/jobquest_deployment.png)

The assessed turn. A free-text answer in Perform scenario tests the architecture hardest, because it involves the explorer, the authority over scores, the models, and the failure of any of them. It has two phases: during the situation, the narrator answers the explorer (AI-4); when the situation ends, the judges score it in the background (AI-5). The figure below shows both as a sequence; the numbers in the steps refer to its messages.

![Sequence of one written answer: narration during the situation, background scoring when it ends, the time left to the models under NFR-01 and NFR-02, and the path taken when a provider fails.](latex/figures/jobquest_seq_assessed_turn.png)

1. Messages 1–4: the explorer application sends the answer with the run's next sequence number and an idempotency key, so a retry cannot record it twice (NFR-03, NFR-13). The API checks it with *game-core*, stores it with a narration request in one transaction, enqueues the job directly after commit — a transactional outbox [167] guarantees a job for every stored answer — and replies that the answer is saved. Progress shows at once, and a status line after two seconds (NFR-01).
2. Messages 5–10: a worker removes identifying details and sends the seed and the player's text to the narrator; the rubric and scoring keys are not in its prompt. The narration and any follow-up are shown only if they pass the rule checks — numbers and names from the seed or the player's text, follow-ups within the count the engine allows — and reach the explorer through Redis and the event stream (FR-12, NFR-15). A model of another family reviews the logs afterwards.
3. Messages 11–13: when the situation ends, the API stores the event and a scoring request together and the job is queued. A worker sends the answers, as delimited data the models are instructed never to obey, to three judges of three families in parallel, at most three criteria per call. Each judge returns, per criterion, a verbatim quotation, a rationale, and a level; a judgment is kept only if the quotation occurs in what the player typed (FR-11, NFR-17). The median is the score, and judges more than one level apart flag the case for the expert (AI-3).
4. Messages 14–17: the worker stores the results as events with their provenance; *game-core* applies credit within the cap of BR-11; Redis carries the result to the API replica holding the explorer's stream, and result, feedback, and guidance appear as separate parts on the summary screen (FR-14, NFR-02, DR-07). Each event carries its sequence number, so a reconnecting stream replays whatever it missed from the database.
5. Failure: the gateway retries, and may switch to another configured provider of an admissible family, which is still AI (DC-02). If a model stays unavailable, the session pauses with every answer and all progress saved, and the explorer is told within ten seconds (NFR-04); play resumes when the model returns, and pages that do not use AI, such as sign-in, the map, and the record, stay available. The scheduler re-queues any request left without a result, so not even loss of Redis loses an answer.

A closed-format answer takes messages 1–4 only: the client shows *game-core*'s score at once and the server recomputes it from the stored event. Resuming after an interruption (flow 7c) folds the stored events and returns the state at the last recorded position on any device.

Content path. The figure below shows the path a scenario takes from opening to play, and the two ways it returns to review.

![Content lifecycle of a scenario, by actor: the expert's knowledge collected by AI-1 and drafted into a seed with AI-2, review by another expert, presentation, test playthroughs ranked by AI-3, and publication as an immutable release; revalidation and explorers' flags return it to review while the published version stays playable.](latex/figures/jobquest_content_lifecycle.png)

Latency budget. Under the Lighthouse mobile profile [139], the platform's own share of either phase is about 0.4 s: a 150 ms round trip to submit, 20 ms for the transaction, 10 ms to enqueue, 50 ms of preparation and checks, 20 ms to store the result, and half a round trip to push it. That leaves about 4.6 s of NFR-01's five seconds for the narrator to write a follow-up, and about 7.6 s of NFR-02's eight seconds for the judging panel, the budgets against which the first test of Section 5.2.3 measures candidate models; because the panel waits for all three judges, its time is that of the slowest. NFR-02 still states its bound per answer, while scoring now runs per situation in the background; the requirement is to be aligned with Section 5.2.3. Generated text is not streamed token by token, because it must pass the rule checks before display.

Realisation of the use cases. The table traces each group of use cases in Section 5.1.2 to the components that realise it.

| Use cases | Components | Mechanism |
|---|---|---|
| Register account; Manage account | Explorer application; Identity and access; Notification | Own authentication module; single-use reset links by email |
| Complete orientation quiz; Build user portrait | Explorer application; Exploration; AI orchestration | RIASEC matching in *game-core* without AI; portrait generated, checked, and labelled as AI-produced (FR-04, NFR-07) |
| Explore occupations; View occupation profile; View level description; View career path; Enter adjacent occupation | Explorer application; Exploration; Analytics; Game core | Map model from the published release; 3D or accessible 2D rendering; adjacency offers computed by *game-core* from DR-02 and DR-03; ratings with suppression |
| Choose scenario; Complete side quest; Unlock next level | Exploration; Game core | Enrolment and credit in the database; thresholds and caps evaluated by *game-core* on the server; adjacency precomputed from imported data |
| Perform scenario; View scenario context; Get hint; Assess answer; Answer follow-up question; Flag wrong content | Explorer application; Exploration; Assessment; AI orchestration; Model gateway | The assessed turn above; flags routed to the occupation's domain experts |
| Rate occupation; View personal record; Send app feedback | Exploration; Analytics; Operations | Ratings only after completion, aggregated on write; records rebuilt from events; feedback stored with app version |
| Create occupation knowledge; Update occupation knowledge; Author scenario; Generate scenario content; Build reference set | Staff application; Content lifecycle; AI orchestration | Drafts with authorship; generation jobs with history and automatic validation; reference answers validated on entry |
| Review scenario; Apply review criteria; Revalidate scenario; Review flagged content; Play-test draft game | Staff application; Content lifecycle; Exploration; Notification; Scheduler | State machine with reviewer-is-not-author constraint; criteria versioned per review; play-test runs excluded from aggregates |
| Check grading reliability; Submit blind ratings | Staff application; Analytics; Assessment | Agreement by stratum from recorded judgments; blind ratings hidden from other experts and from AI scores |
| Manage occupation; Import reference data; Define review criteria; Open task scenario; Assign domain expert; Reassign overdue review | Staff application; Content lifecycle; Reference-data import; Identity and access; Scheduler | One active scenario per task enforced by the database; reminders and overdue notices by the scheduler |
| Design scenario presentation; Generate missing asset; Publish scenario; Remove scenario | Staff application; Content lifecycle; AI orchestration; Object store | Content text read-only during presentation; assets checked before entering the library; publication creates an immutable release |
| Monitor occupation statistics; View coverage report; Request revalidation | Staff application; Analytics; Content lifecycle | Aggregates above threshold; revalidation sends a published scenario back to review while it stays playable |
| Manage user accounts; Assign occupation staff; Disable account; Delete account; View activity log | Staff application; Identity and access | Occupation-scoped roles; status checked on refresh and on every staff request; deletion keeps staff-authored records |
| Configure AI models; Monitor operation cost; Re-run failed job; Review app feedback; Handle data requests | Staff application; Operations; Model gateway | Registry rejects a provider or family shared by the narrator and a judge or by two judges; cost ledger and alerts; failed-job re-run; data-request workflow with log |

: Realisation of use cases by architectural components.

Realisation of the non-functional requirements and design constraints. The table gives, for each, the mechanism, the components, and whether the prototype has it; it underlies the verifications listed in Section 4.3.3.

| ID | Mechanism | Components | In prototype |
|---|---|---|---|
| NFR-01 | Answer stored before any model call; narration and follow-up generated by a worker and pushed through the event stream; progress at once, status line after two seconds; interactive jobs before batch generation; bounded output length | Explorer application; Exploration; AI orchestration; Model gateway | No; follow-ups are pre-written |
| NFR-02 | Scoring job queued when the situation ends; judges in parallel, so latency is the slowest judge's, not the sum; per-call timeouts; workers scaled on queue depth | AI orchestration; Model gateway; workers | No |
| NFR-03 | Each turn stored as an event with an idempotent sequence number; local queue of unsent turns; resumption by folding stored events | Explorer application; Exploration; Game core | Partly; runs pinned to a content version, but actions sent only at the end |
| NFR-04 | Transactional outbox; retries with backoff, circuit breaker, failover within the role; notice within ten seconds; reconciliation | Exploration; AI orchestration; Model gateway; Scheduler | No |
| NFR-05 | Data inventory per data requirement; encryption in transit and at rest, including backups; de-identification before any model call; opaque job identifiers; providers set to no training and no retention; deletion by cascade and request workflow | Identity and access; AI orchestration; Operations; database | Partly; deletion by cascade |
| NFR-06 | Aggregates only from Analytics, above a population threshold; play-tests excluded; no endpoint returns another person's record | Analytics | No |
| NFR-07 | Every model output carries provenance — model, family, prompt version — from which the interface renders an AI label | AI orchestration; Explorer application | No |
| NFR-08 | Typed interface strings with a completeness test; content fields carry a locale, so a language is added as data; only Vietnamese is supported in this phase | Both applications; Content lifecycle | Partly; interface strings typed |
| NFR-09 | Validator refuses a scenario whose context lacks an explicit objective | Content lifecycle; Game core | No |
| NFR-10 | Content as data in releases, created through the staff application; *game-core* interprets generic formats; map positions computed from data | Content lifecycle; Game core; Explorer application | Partly; content in the database, written by script |
| NFR-11 | Per-session cost ledger: estimate before, actual after each call; ceiling from settings; threshold alerts; a session that reaches the ceiling makes no further model calls and pauses as on provider failure | AI orchestration; Operations; queue store | No |
| NFR-12 | Model port with provider adapters; provider-neutral prompts and output schemas; a provider change re-runs the Stage A benchmark as a regression suite | Model gateway; AI orchestration | No |
| NFR-13 | Explorer bundle under a performance budget; on-demand 3D chunk and 2D fallback; turn payloads of a few kilobytes; event stream with polling fallback; releases cached by version at the edge; on-device timing | Explorer application; content delivery network | Partly; 3D map loaded on demand |
| NFR-14 | Every judgment records its judges; a change of assessment configuration recomputes agreement by stratum against the reference set | Analytics; AI orchestration; Operations | No |
| NFR-15 | Publication copies the approved version into a hashed release, compared with what is served; canon content served verbatim; run-time narration shown only after the rule checks; a model of another family reviews the logs | Content lifecycle; AI orchestration; Game core | Partly; releases immutable |
| NFR-16 | Lifecycle module as sole writer; transition and log in one transaction; a trigger refuses updates to published releases | Content lifecycle; database | No |
| NFR-17 | Argon2id; HTTPS with strict transport security; httpOnly, SameSite cookies, rotation, idle expiry; answers passed to models as delimited data, outputs schema-validated; prompt-injection tests in the regression suite, against the leading OWASP risk for language-model applications [168] | Identity and access; AI orchestration; reverse proxy | Partly; hashing, cookies, rotation |
| NFR-18 | Stateless API replicas with health checks and rolling deployment; backups with point-in-time recovery; uptime monitoring; announced maintenance | All tiers | No |
| NFR-19 | Document-based interfaces; accessible 2D map; accessible primitives in the staff application; automated and manual audits | Both applications | No |
| DC-01 | Registry records each model's provider and family; configuration rejects either shared by the narrator and a judge, or by two judges; panel rechecked at job time | Model gateway; Operations; AI orchestration | No |
| DC-02 | Domain code depends only on the model port; providers are adapters selected per role | Model gateway | No |
| DC-03 | System of record in Vietnam; one egress path, through de-identification; transfer impact assessment per provider; data-request workflow | Hosting; AI orchestration; Identity and access; Operations | No |
| DC-05 | Browser applications, no installation; static delivery; tolerant of short disconnections | Both applications | Yes |

: Realisation of non-functional requirements and design constraints by architectural mechanisms.

Infrastructure and scalability. JobQuest's load is not where web systems usually feel it: the binding constraint is the model tier, not the web or database tier. The estimate below states its assumptions so pilots can revise them. A scenario lasts ten to fifteen minutes (Section 4.1.2) and is assumed to hold three situations, each scored by three judges, plus about four narration and follow-up calls: about thirteen model calls per scenario, or one per minute of play. An active explorer sends a request every five to ten seconds. For Stage 4 the reference is the 1.12 million grade-12 candidates of 2025 [169]: if a fifth of a cohort plays half an hour a week over a ten-week guidance season, concentrated in about twenty peak hours, peak concurrency is about five thousand.

| Stage | Assumed users | Peak concurrent explorers | API requests per second | Model calls per second | Topology |
|---|---|---|---|---|---|
| 0. University project | Team and synthetic data | Under 10 | Under 5 | Under 1 | One host; all containers; hosted development database acceptable |
| 1. Capstone and first pilot | 100 to 300 volunteers | About 50 | 5 to 10 | About 1 | University host in Vietnam; one API and one worker container; PostgreSQL with point-in-time recovery; Redis with append-only persistence; object store; uptime monitor; CDN for static files |
| 2. Multi-site pilot | About 10,000 in partner schools | About 500, in class-sized bursts | 50 to 100 | About 8 | Cloud in Vietnam; two or more API replicas behind a load balancer; workers scaled on queue length; managed PostgreSQL with standby and read replica; managed Redis; staging |
| 3 and 4. Public-sector partnership and national resource | Hundreds of thousands per year | About 5,000 | 500 to 1,000 | 80 to 90 | Two zones in Vietnam with autoscaling, PostgreSQL high availability, and a recovery region (deployment diagram) |

: Capacity estimate and topology by roadmap stage.

Each tier scales by its own mechanism, summarised below for Stage 4.

| Tier | Load at Stage 4 | How it scales | Why it can |
|---|---|---|---|
| Content delivery network | All static files and published releases | Cache by version with long lifetimes | Releases are immutable, so caches never need purging and content reads never reach the database |
| API | 500 to 1,000 requests per second; about 5,000 open result streams | Replicas behind the load balancer, scaled on CPU and open connections; at least two per zone | Stateless: sessions travel in cookies and results arrive through Redis publish–subscribe, so any replica can serve any explorer |
| Workers | 80 to 90 model calls per second; 250 to 700 in flight | Scaled on queue length; each worker runs many I/O-bound jobs concurrently; in-flight calls capped per provider | Jobs are independent and idempotent; the queue absorbs bursts [170] |
| Model providers | About 5,100 requests per minute; 7 to 8 million tokens per minute at about 1,500 tokens per call | Several providers per role within DC-01, so quotas add up; priorities: live narration first, background scoring next, authoring work last | The binding constraint is isolated in its own tier and limited without slowing the rest |
| PostgreSQL | Under 500 writes per second; about 0.3 TB of run data per season at about 60 KB per run | Vertical growth behind a connection pooler; read replica for analytics; run events partitioned by month | All transactions stay within one primary; heavy reads move to the replica; old partitions are compressed or archived |
| Redis | About 100 jobs per second, plus publish–subscribe messages | One primary and one replica | Holds nothing that cannot be rebuilt from PostgreSQL |

: Scaling mechanism of each tier at Stage 4.

The in-flight figure follows from Little's law: 85 calls per second, each lasting three to eight seconds. Two sizing assumptions remain to be measured by the load tests of Chapter 7: if one single-vCPU API replica serves about 300 light requests per second, Stage 4 needs four replicas, six with headroom across two zones; if one worker holds 50 calls in flight, it needs six to fourteen workers.

The architecture scales for seven reasons. Processing tiers are stateless, so capacity grows by adding replicas. Fast and slow work are separated: a request stores and acknowledges in about 0.2 s, and slow work waits in a queue, so a class of forty starting together lengthens the queue rather than overloading the API. The binding constraint, the model tier, is isolated and limited on its own. Published content is immutable and therefore almost entirely served from cache. Reads for statistics are separated from writes by a replica. Load is shed by priority rather than by failure: under pressure, live narration goes first, background scoring waits a little longer for the summary screen, and authoring work waits for quiet hours. And no transaction spans services, so growth never requires distributed coordination. Canon content is approved once and served verbatim from releases, so run-time model calls are limited to narration, follow-ups, and scoring; the cost per playthrough is estimated in Section 5.2.3.

Reliability and operations. Availability of 99.5% a month is proposed for Stages 1 and 2 and 99.9% once two zones run (NFR-18). The write-ahead log is archived continuously and backups taken nightly, both copied to a second region in Vietnam, for a proposed recovery point of five minutes and recovery time of one hour. Deployments roll replica by replica behind health checks, with backward-compatible migrations so old and new versions run side by side. Monitoring tracks queue length, 95th-percentile latency per provider, cost per session, and error rates, alerting at the thresholds of NFR-01, NFR-02, and NFR-11. A web application firewall and TLS guard the entry, secrets are held in a secret manager, and the egress proxy admits only allowlisted model endpoints.

From the prototype to the target. Four prototype mechanisms are kept: rules in a framework-free *game-core* shared by client and server; the server as score authority; content in versioned, immutable releases pinned to each run; and httpOnly cookie sessions with rotating refresh tokens. Six changes reach the target: free-text assessment becomes an asynchronous job whose result enters the run as an event; runs are submitted turn by turn (NFR-03); content is written through the lifecycle module instead of a seed script; three roles become four occupation-scoped actors; the staff application, AI orchestration, gateway, queue, workers, and scheduler are added; and the accessible 2D map is added. Each change extends a prototype component along a boundary it already has; none discards one.

---

## References

[1] I. Gati, M. Krausz, and S. H. Osipow, "A taxonomy of difficulties in career decision making," *Journal of Counseling Psychology*, vol. 43, no. 4, pp. 510-526, 1996.

[2] N. Levin, S. Udayar, Y. Lipshits-Braziler, I. Gati, and J. Rossier, "The structure of the Career Decision-Making Difficulties Questionnaire across 13 countries," *Journal of Career Assessment*, vol. 31, no. 1, pp. 129-148, 2023, doi: 10.1177/10690727221099226.

[3] T. M. Trinh, T. T. K. Le, K. M. A. Le, C. Nguyen, and T. N. Tran, "Shaping choices: Factors influencing Vietnamese high school students' transition to higher education," 2024. [Verify venue/pages before citation.]

[4] "Nearly 20% of university students lack career direction, survey shows," *VietnamNet*, May 23, 2026. [Grey literature; survey of ~9,200 students across 10 Vietnamese universities, reported at the "Building Happy Universities in Vietnam" seminar.]

[5] T. Q. Tran, N. B. T. Vu, D. Van Le, and L. H. Vu, "Vertical and horizontal job-education mismatches and wages: A quantitative analysis of university graduates in Vietnam," *International Journal of Educational Development*, vol. 117, art. 103323, 2025, doi: 10.1016/j.ijedudev.2025.103323.

[6] D. J. Pittenger, "Cautionary comments regarding the Myers-Briggs Type Indicator," *Consulting Psychology Journal: Practice and Research*, vol. 57, no. 3, pp. 210-221, 2005.

[7] The Myers & Briggs Foundation, "MBTI reliability and validity," myersbriggs.org, 2023. [Grey literature; publisher-affiliated source reporting MBTI Manual data.]

[8] J. M. Phillips, "Effects of realistic job previews on multiple organizational outcomes: A meta-analysis," *Academy of Management Journal*, vol. 41, no. 6, pp. 673-690, 1998, doi: 10.2307/256964.

[9] D. R. Earnest, D. G. Allen, and R. S. Landis, "Mechanisms linking realistic job previews with turnover: A meta-analytic path analysis," *Personnel Psychology*, vol. 64, no. 4, pp. 865-897, 2011, doi: 10.1111/j.1744-6570.2011.01230.x.

[10] R. W. Lent, S. D. Brown, and G. Hackett, "Toward a unifying social cognitive theory of career and academic interest, choice, and performance," *Journal of Vocational Behavior*, vol. 45, no. 1, pp. 79-122, 1994.

[11] A. Byars-Winston, J. Diestelmann, J. N. Savoy, and W. T. Hoyt, "Unique effects and moderators of effects of sources on self-efficacy: A model-based meta-analysis," *Journal of Counseling Psychology*, vol. 64, no. 6, pp. 645-658, 2017, doi: 10.1037/cou0000219.

[12] D. A. Kolb, *Experiential Learning: Experience as the Source of Learning and Development*, 2nd ed. Upper Saddle River, NJ, USA: Pearson Education, 2015 (orig. 1984).

[13] J. P. Wanous, *Organizational Entry: Recruitment, Selection, Orientation, and Socialization of Newcomers*, 2nd ed. Reading, MA, USA: Addison-Wesley, 1992.

[14] S. L. Premack and J. P. Wanous, "A meta-analysis of realistic job preview experiments," *Journal of Applied Psychology*, vol. 70, no. 4, pp. 706-719, 1985.

[15] G. M. McEvoy and W. F. Cascio, "Strategies for reducing employee turnover: A meta-analysis," *Journal of Applied Psychology*, vol. 70, no. 2, pp. 342-353, 1985.

[16] M. Graef, "Realistic job previews," Quality Improvement Center for Workforce Development, University of Nebraska–Lincoln, Feb. 2020. [Grey literature; umbrella review.]

[17] D. A. Cook et al., "Technology-enhanced simulation for health professions education: A systematic review and meta-analysis," *JAMA*, vol. 306, no. 9, pp. 978-988, 2011, doi: 10.1001/jama.2011.1234.

[18] W. C. McGaghie, S. B. Issenberg, E. R. Cohen, J. H. Barsuk, and D. B. Wayne, "Does simulation-based medical education with deliberate practice yield better results than traditional clinical education? A meta-analytic comparative review of the evidence," *Academic Medicine*, vol. 86, no. 6, pp. 706-711, 2011.

[19] O. Chernikova, N. Heitzmann, M. Stadler, D. Holzberger, T. Seidel, and F. Fischer, "Simulation-based learning in higher education: A meta-analysis," *Review of Educational Research*, vol. 90, no. 4, pp. 499-541, 2020, doi: 10.3102/0034654320933544.

[20] V. J. Shute, "Stealth assessment in computer-based games to support learning," in *Computer Games and Instruction*, S. Tobias and J. D. Fletcher, Eds. Charlotte, NC, USA: Information Age Publishing, 2011, pp. 503-524.

[21] V. J. Shute, L. Wang, S. Greiff, W. Zhao, and G. Moore, "Measuring problem solving skills via stealth assessment in an engaging video game," *Computers in Human Behavior*, vol. 63, pp. 106-117, 2016, doi: 10.1016/j.chb.2016.05.047.

[22] F. Delamare Le Deist and J. Winterton, "What is competence?" *Human Resource Development International*, vol. 8, no. 1, pp. 27-46, 2005, doi: 10.1080/1367886042000338227.

[23] S. J. Motowidlo, M. D. Dunnette, and G. W. Carter, "An alternative selection procedure: The low-fidelity simulation," *Journal of Applied Psychology*, vol. 75, no. 6, pp. 640-647, 1990.

[24] M. A. McDaniel, F. P. Morgeson, E. B. Finnegan, M. A. Campion, and E. P. Braverman, "Use of situational judgment tests to predict job performance: A clarification of the literature," *Journal of Applied Psychology*, vol. 86, no. 4, pp. 730-740, 2001, doi: 10.1037/0021-9010.86.4.730.

[25] M. S. Christian, B. D. Edwards, and J. C. Bradley, "Situational judgment tests: Constructs assessed and a meta-analysis of their criterion-related validities," *Personnel Psychology*, vol. 63, no. 1, pp. 83-117, 2010.

[26] J. C. Flanagan, "The critical incident technique," *Psychological Bulletin*, vol. 51, no. 4, pp. 327-358, 1954.

[27] D. L. Whetzel, T. S. Sullivan, and R. A. McCloy, "Situational judgment tests: An overview of development practices and psychometric characteristics," *Personnel Assessment and Decisions*, vol. 6, no. 1, 2020.

[28] M. A. McDaniel, N. S. Hartman, D. L. Whetzel, and W. L. Grubb, "Situational judgment tests, response instructions, and validity: A meta-analysis," *Personnel Psychology*, vol. 60, no. 1, pp. 63-91, 2007, doi: 10.1111/j.1744-6570.2007.00065.x.

[29] J. Hamari, J. Koivisto, and H. Sarsa, "Does gamification work? — A literature review of empirical studies on gamification," in *Proc. 47th Hawaii Int. Conf. System Sciences (HICSS)*, 2014, pp. 3025-3034, doi: 10.1109/HICSS.2014.377.

[30] M. Sailer and L. Homner, "The gamification of learning: A meta-analysis," *Educational Psychology Review*, vol. 32, no. 1, pp. 77-112, 2020, doi: 10.1007/s10648-019-09498-w.

[31] S. Bai, K. F. Hew, and B. Huang, "Does gamification improve student learning outcome? Evidence from a meta-analysis and synthesis of qualitative data in educational contexts," *Educational Research Review*, vol. 30, art. 100322, 2020, doi: 10.1016/j.edurev.2020.100322.

[32] D. B. Clark, E. E. Tanner-Smith, and S. S. Killingsworth, "Digital games, design, and learning: A systematic review and meta-analysis," *Review of Educational Research*, vol. 86, no. 1, pp. 79-122, 2016.

[33] L. Li, K. F. Hew, and J. Du, "Gamification enhances student intrinsic motivation, perceptions of autonomy and relatedness, but minimal impact on competency: A meta-analysis and systematic review," *Educational Technology Research and Development*, vol. 72, no. 2, pp. 765-796, 2024, doi: 10.1007/s11423-023-10337-7.

[34] Y. Zeng et al., "The effects of gamification on academic performance: A meta-analysis of 2008-2023," *British Journal of Educational Technology*, 2024.

[35] "Effectiveness of the role-play method: A meta-analysis," *International Journal of Instruction*, vol. 18, no. 1, 2025.

[36] T. Sitzmann, "A meta-analytic examination of the instructional effectiveness of computer-based simulation games," *Personnel Psychology*, vol. 64, no. 2, pp. 489-528, 2011, doi: 10.1111/j.1744-6570.2011.01190.x.

[37] P. Wouters, C. van Nimwegen, H. van Oostendorp, and E. D. van der Spek, "A meta-analysis of the cognitive and motivational effects of serious games," *Journal of Educational Psychology*, vol. 105, no. 2, pp. 249-265, 2013.

[38] R. Breien and F. Fossøy, "Narrative categorization in digital game-based learning: Engagement, motivation & learning," *British Journal of Educational Technology*, vol. 52, no. 1, pp. 91-111, 2021, doi: 10.1111/bjet.13004.

[39] "Randomized reward mechanisms (loot boxes) and their association with problem gambling and wellbeing: A pre-registered study," *Addictive Behaviors* / PMC10731324, 2023. [Verify authors/venue before citation.]

[40] R. M. Ryan, C. S. Rigby, and A. Przybylski, "The motivational pull of video games: A self-determination theory approach," *Motivation and Emotion*, vol. 30, no. 4, pp. 344-360, 2006, doi: 10.1007/s11031-006-9051-8.

[41] J. L. Holland, *Making Vocational Choices: A Theory of Vocational Personalities and Work Environments*, 3rd ed. Odessa, FL, USA: Psychological Assessment Resources, 1997.

[42] H.-B. Sheu et al., "Testing the choice model of social cognitive career theory across Holland themes: A meta-analytic path analysis," *Journal of Vocational Behavior*, vol. 76, no. 2, pp. 252-264, 2010.

[43] D. E. Super, "A life-span, life-space approach to career development," *Journal of Vocational Behavior*, vol. 16, no. 3, pp. 282-298, 1980.

[44] J. D. Krumboltz, "The happenstance learning theory," *Journal of Career Assessment*, vol. 17, no. 2, pp. 135-154, 2009.

[45] A. Bandura, *Self-Efficacy: The Exercise of Control*. New York, NY, USA: W. H. Freeman, 1997.

[46] R. W. Lent, G. W. Ireland, L. T. Penn, T. R. Morris, and R. Sappington, "Sources of self-efficacy and outcome expectations for career exploration and decision-making: A test of the social cognitive model of career self-management," *Journal of Vocational Behavior*, vol. 99, pp. 107-117, 2017, doi: 10.1016/j.jvb.2017.01.002.

[47] B. Chang, X. Zhong, and Z. He, "Sources of self-efficacy in career contexts: A longitudinal perspective," *Current Psychology*, vol. 44, pp. 7393-7403, 2025, doi: 10.1007/s12144-025-07699-x.

[48] G. Kurdi, J. Leo, B. Parsia, U. Sattler, and S. Al-Emari, "A systematic review of automatic question generation for educational purposes," *International Journal of Artificial Intelligence in Education*, vol. 30, no. 1, pp. 121-204, 2020, doi: 10.1007/s40593-019-00186-y.

[49] S. Sarsa, P. Denny, A. Hellas, and J. Leinonen, "Automatic generation of programming exercises and code explanations using large language models," in *Proc. 2022 ACM Conf. Int. Computing Education Research (ICER)*, vol. 1, 2022, pp. 27-43, doi: 10.1145/3501385.3543957.

[50] J. Doughty et al., "Automated educational question generation at different Bloom's skill levels using large language models," in *Artificial Intelligence in Education (AIED 2024)*, LNCS, Cham, Switzerland: Springer, 2024, doi: 10.1007/978-3-031-64299-9_12.

[51] "Evaluating the instrumental quality of LLM-generated assessment items," *Frontiers in Education*, 2026, doi: 10.3389/feduc.2026.1837523.

[52] L. Yan et al., "Practical and ethical challenges of large language models in education: A systematic scoping review," *British Journal of Educational Technology*, vol. 55, no. 1, pp. 90-112, 2024, doi: 10.1111/bjet.13370.

[53] J. S. Park, J. C. O'Brien, C. J. Cai, M. R. Morris, P. Liang, and M. S. Bernstein, "Generative agents: Interactive simulacra of human behavior," in *Proc. 36th Annu. ACM Symp. User Interface Software and Technology (UIST)*, 2023, Art. 2, pp. 1-22, doi: 10.1145/3586183.3606763.

[54] A. Zhu, L. Martin, A. Head, and C. Callison-Burch, "CALYPSO: LLMs as Dungeon Masters' assistants," in *Proc. AAAI Conf. Artificial Intelligence and Interactive Digital Entertainment (AIIDE)*, vol. 19, no. 1, 2023, pp. 380-390, doi: 10.1609/aiide.v19i1.27534.

[55] C. Callison-Burch et al., "Dungeons and Dragons as a dialog challenge for artificial intelligence," in *Proc. 2022 Conf. Empirical Methods in Natural Language Processing (EMNLP)*, 2022, pp. 9379-9393.

[56] "SNAP: A plan-driven framework for controllable interactive narrative generation," arXiv:2601.11529, 2026. [Preprint.]

[57] L. Zheng et al., "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena," in *Advances in Neural Information Processing Systems (NeurIPS) 36, Datasets and Benchmarks Track*, 2023, pp. 46595-46623.

[58] Y. Liu, D. Iter, Y. Xu, S. Wang, R. Xu, and C. Zhu, "G-Eval: NLG evaluation using GPT-4 with better human alignment," in *Proc. 2023 Conf. Empirical Methods in Natural Language Processing (EMNLP)*, 2023, pp. 2511-2522, doi: 10.18653/v1/2023.emnlp-main.153.

[59] "Reliability without validity: A systematic, large-scale evaluation of LLM-as-a-judge models across agreement, consistency, and bias," arXiv:2606.19544, 2026. [Preprint.]

[60] S. Tan, S. Zhuang, K. Montgomery et al., "JudgeBench: A benchmark for evaluating LLM-based judges," in *Proc. Int. Conf. Learning Representations (ICLR)*, 2025. arXiv:2410.12784.

[61] "CODE-GEN: A human-in-the-loop RAG-based agentic AI system for multiple-choice question generation," arXiv:2604.03926, 2026. [Preprint.]

[62] U.S. Department of Labor, "O\*NET Resource Center," onetcenter.org. [Government data resource; taxonomy figures per O\*NET 28.x, accessed 2026.]

[63] European Commission, "ESCO — European Skills, Competences, Qualifications and Occupations," esco.ec.europa.eu. [EU data resource; 3,039 occupations / 13,939 skills, ESCO v1.2, accessed 2026.]

[64] N. Lambert, V. Pyatkin, J. Morrison et al., "RewardBench: Evaluating reward models for language modeling," in *Findings of the Association for Computational Linguistics: NAACL 2025*, 2025, pp. 1755-1797. arXiv:2403.13787.

[65] "EQGBench: Evaluating LLMs' educational question generation," arXiv:2508.10005, 2025. [Preprint.]

[66] B. Xu, Y. Bai, Y. Sun et al., "EduBench: A comprehensive benchmarking dataset for evaluating LLMs in diverse educational scenarios," arXiv:2505.16160, 2025. [Preprint.]

[67] M.-A. Côté et al., "TextWorld: A learning environment for text-based games," in *Computer Games (CGW 2018)*, Springer, 2019, pp. 41-75, doi: 10.1007/978-3-030-24337-1_3.

[68] M. Hausknecht, P. Ammanabrolu, M.-A. Côté, and X. Yuan, "Interactive fiction games: A colossal adventure," in *Proc. AAAI Conf. Artificial Intelligence*, vol. 34, no. 5, 2020, pp. 7903-7910.

[69] M. R. Lynn, "Determination and quantification of content validity," *Nursing Research*, vol. 35, no. 6, pp. 382-385, 1986.

[70] D. F. Polit, C. T. Beck, and S. V. Owen, "Is the CVI an acceptable indicator of content validity? Appraisal and recommendations," *Research in Nursing & Health*, vol. 30, no. 4, pp. 459-467, 2007, doi: 10.1002/nur.20199.

[71] D. M. Williamson, X. Xi, and F. J. Breyer, "A framework for evaluation and use of automated scoring," *Educational Measurement: Issues and Practice*, vol. 31, no. 1, pp. 2-13, 2012.

[72] K. Krippendorff, *Content Analysis: An Introduction to Its Methodology*, 2nd ed. Thousand Oaks, CA, USA: SAGE, 2004.

[73] A. B. Sai, T. Dixit, D. Y. Sheth, S. Mohan, and M. M. Khapra, "Perturbation CheckLists for evaluating NLG evaluation metrics," in *Proc. 2021 Conf. Empirical Methods in Natural Language Processing (EMNLP)*, 2021, pp. 7219-7234.

[74] P. Verga et al., "Replacing judges with juries: Evaluating LLM generations with a panel of diverse models," arXiv:2404.18796, 2024. [Preprint.]

[75] "Agentic knowledge tracing: A multi-agent LLM architecture for stealth assessment of financial literacy in serious games," arXiv:2606.25358, 2026. [Preprint.]

[76] W. Du, Z. Zhu, X. Xu, H. Che, and S. Chen, "CareerSim: Gamification design leveraging LLMs for career development reflection," in *Extended Abstracts of the 2024 CHI Conf. Human Factors in Computing Systems (CHI EA '24)*, Art. 71, pp. 1-7, doi: 10.1145/3613905.3650928. [Extended abstract.]

[77] P. Pataranutaporn et al., "Future You: A conversation with an AI-generated future self reduces anxiety, negative emotions, and increases future self-continuity," in *Proc. IEEE Frontiers in Education (FIE)*, 2024. arXiv:2405.12514.

[78] H. Jeon et al., "Letters from Future Self: Augmenting the letter-exchange exercise with LLM-based agents to enhance young adults' career exploration," in *Proc. 2025 CHI Conf. Human Factors in Computing Systems (CHI '25)*, Art. 100, pp. 1-21, doi: 10.1145/3706598.3714206.

[79] Z. Wang, Z. Zeng, Y. Li, and Z. Ding, "CareerPooler: AI-powered metaphorical pool simulation improves experience and outcomes in career exploration," arXiv:2509.11461, 2025. [Preprint.]

[80] S. Lee and H. Jeong, "'I Can Be Anything!' Bridging today and the future through generative AI-driven self-represented career imagination for children," in *Proc. 2026 CHI Conf. Human Factors in Computing Systems (CHI '26)*, doi: 10.1145/3772318.3790985.

[81] K. Ozaki, X. Geng, and M. Yamada, "Promoting career self-regulation in high school students using a career simulation game," in *Learning and Collaboration Technologies (HCII 2026)*, LNCS vol. 16733, Cham, Switzerland: Springer, 2026, pp. 416-431, doi: 10.1007/978-3-032-30784-2_26.

[82] H. Han, B. Park, and K. Seo, "A self-determination theory-based career counseling chatbot," in *Extended Abstracts of the 2025 CHI Conf. Human Factors in Computing Systems (CHI EA '25)*, pp. 1-9, doi: 10.1145/3706599.3720286. [Extended abstract.]

[83] Forage, "Free virtual job simulations and career prep," theforage.com. [Grey literature; accessed 2026, verify before citation.]

[84] EntryLevel, "AI job simulations," entrylevel.net. [Grey literature.]

[85] Anthropos, "AI job simulations: Verify real skills in work scenarios," anthropos.work. [Grey literature.]

[86] careersim.ai, "AI interview practice and workplace conversation simulator," careersim.ai. [Grey literature.]

[87] Latitude, "AI Dungeon," aidungeon.com; see also "AI Dungeon," Wikipedia. [Grey literature.]

[88] Character Technologies, "Character.AI," character.ai. [Grey literature.]

[89] Hidden Door, "Social roleplaying in your favorite fictional worlds," hiddendoor.co; and C. Fink, "Hidden Door turns fan worlds into licensed, revenue-sharing story platforms," *Forbes*, Aug. 14, 2025. [Grey literature.]

[90] "Ứng dụng tư vấn hướng nghiệp 4.0 JobWay," Vietnamese science-and-technology press, vista.gov.vn. [Grey literature.]

[91] JobTest.vn, "Nền tảng hướng nghiệp và đánh giá năng lực," jobtest.vn. [Grey literature.]

[92] Hướng nghiệp Sông An, huongnghiepsongan.com. [Grey literature.]

[93] "Hướng Nghiệp LwL (Lead with LOF)," Google Play / fptshop.com.vn. [Grey literature.]

[94] "Chatbot dự đoán tỉ lệ đỗ đại học và trắc nghiệm hướng nghiệp bằng AI của startup Việt," *Tuổi Trẻ*, 2026. [Grey literature.]

[95] Prime Minister of Vietnam, Decision No. 522/QĐ-TTg of 14 May 2018 approving the scheme "Career guidance and orientation for student streaming in general education, 2018–2025," 2018.

[96] "Tiếp tục đẩy mạnh hướng nghiệp, phân luồng trong giáo dục theo hướng lấy học sinh làm trung tâm," *Tạp chí Giáo dục*, 2025. [Grey literature.]

[97] Ho Chi Minh City Department of Education and Training, Official Letter No. 5829/SGDĐT-GDTXNNĐH on career guidance and streaming after upper secondary school, school year 2025–2026, Dec. 2025. [Government document.]

[98] S. J. Hamstra, R. Brydges, R. Hatala, B. Zendejas, and D. A. Cook, "Reconsidering fidelity in simulation-based training," *Academic Medicine*, vol. 89, no. 3, pp. 387-392, 2014, doi: 10.1097/ACM.0000000000000130.

[99] National Assembly of Vietnam, Law No. 91/2025/QH15 on Personal Data Protection, 26 Jun. 2025, in force from 1 Jan. 2026. [Legislation.]

[100] Government of Vietnam, Decree No. 356/2025/NĐ-CP detailing a number of articles of, and measures for implementing, the Law on Personal Data Protection, 31 Dec. 2025, in force from 1 Jan. 2026. [Legislation.]

[101] H. Li et al., "Agreement between large language models and human raters in essay scoring: A research synthesis," arXiv:2512.14561, 2025. [Preprint.]

[102] O. Henkel, L. Hills, A. Boxer, B. Roberts, and Z. Levonian, "Can large language models make the grade? An empirical study evaluating LLMs' ability to mark short answer questions in K-12 education," in *Proc. 11th ACM Conf. Learning @ Scale (L@S)*, 2024, doi: 10.1145/3657604.3664693.

[103] K. P. Yancey, G. Laflair, A. Verardi, and J. Burstein, "Rating short L2 essays on the CEFR scale with GPT-4," in *Proc. 18th Workshop on Innovative Use of NLP for Building Educational Applications (BEA)*, 2023, pp. 576-584, doi: 10.18653/v1/2023.bea-1.49.

[104] M. Stahl, L. Biermann, A. Nehring, and H. Wachsmuth, "Exploring LLM prompting strategies for joint essay scoring and feedback generation," in *Proc. 19th Workshop on Innovative Use of NLP for Building Educational Applications (BEA)*, 2024. arXiv:2404.15845.

[105] V. Hackl, A. E. Müller, M. Granitzer, and M. Sailer, "Is GPT-4 a reliable rater? Evaluating consistency in GPT-4's text ratings," *Frontiers in Education*, vol. 8, 2023, doi: 10.3389/feduc.2023.1272229.

[106] N. Saka, I. Gati, and K. R. Kelly, "Emotional and personality-related aspects of career-decision-making difficulties," *Journal of Career Assessment*, vol. 16, no. 4, pp. 403-424, 2008, doi: 10.1177/1069072708318900.

[107] J. Hacker, A. Carr, M. Abrams, and S. D. Brown, "Development of the Career Indecision Profile: Factor structure, reliability, and validity," *Journal of Career Assessment*, vol. 21, no. 1, pp. 32-41, 2013, doi: 10.1177/1069072712453832.

[108] K. M. Taylor and N. E. Betz, "Applications of self-efficacy theory to the understanding and treatment of career indecision," *Journal of Vocational Behavior*, vol. 22, no. 1, pp. 63-81, 1983, doi: 10.1016/0001-8791(83)90006-4.

[109] J. P. Sampson Jr., G. W. Peterson, J. G. Lenz, R. C. Reardon, and D. E. Saunders, "The design and use of a measure of dysfunctional career thoughts among adults, college students, and high school students: The Career Thoughts Inventory," *Journal of Career Assessment*, vol. 6, no. 2, pp. 115-134, 1998, doi: 10.1177/106907279800600201.

[110] S. H. Osipow, C. G. Carney, J. L. Winer, B. Yanico, and M. Koschier, *The Career Decision Scale*, 3rd ed. Odessa, FL: Psychological Assessment Resources, 1987.

[111] W.-C. Mau, "Assessing career decision-making difficulties: A cross-cultural study," *Journal of Career Assessment*, vol. 9, no. 4, pp. 353-364, 2001, doi: 10.1177/106907270100900403.

[112] P. A. Creed and W. O. Yin, "Reliability and validity of a Chinese version of the Career Decision-Making Difficulties Questionnaire," *International Journal for Educational and Vocational Guidance*, vol. 6, no. 1, pp. 47-63, 2006, doi: 10.1007/s10775-006-0003-3.

[113] L. Sovet, J. Tak, and S. Jung, "Validation of the Career Decision-Making Difficulties Questionnaire among Korean college students," *Journal of Career Assessment*, vol. 23, no. 4, pp. 661-676, 2015, doi: 10.1177/1069072714553556.

[114] J. Cohen, "A coefficient of agreement for nominal scales," *Educational and Psychological Measurement*, vol. 20, no. 1, pp. 37-46, 1960, doi: 10.1177/001316446002000104.

[115] F. Chopra and I. Haaland, "Conducting qualitative interviews with AI," CESifo Working Paper No. 10666, 2023 (revised 2026). [Working paper.]

[116] E. Klang et al., "Advantages and pitfalls in utilizing artificial intelligence for crafting medical examinations: A medical education pilot study with GPT-4," *BMC Medical Education*, vol. 23, art. 772, 2023, doi: 10.1186/s12909-023-04752-w.

[117] R. J. Mislevy and G. D. Haertel, "Implications of evidence-centered design for educational testing," *Educational Measurement: Issues and Practice*, vol. 25, no. 4, pp. 6-20, 2006, doi: 10.1111/j.1745-3992.2006.00075.x.

[118] R. Ferrer, D. Turgut, Z. Chen, and S. Sonkar, "When can we trust LLM graders? Calibrating confidence for automated assessment," arXiv:2603.29559, 2026. [Preprint.]

[119] J. A. Hanley and A. Lippman-Hand, "If nothing goes wrong, is everything all right? Interpreting zero numerators," *JAMA*, vol. 249, no. 13, pp. 1743-1745, 1983, doi: 10.1001/jama.1983.03330370053031.

[120] K. Balog and A. M. Bakken, "'Act like a 5th grader' is not enough: Bounding knowledge in LLM-based user simulators," in *Findings of the Association for Computational Linguistics: EMNLP 2026*, 2026. arXiv:2608.30033.

[121] M. O. Riedl and V. Bulitko, "Interactive narrative: An intelligent systems approach," *AI Magazine*, vol. 34, no. 1, 2013, doi: 10.1609/aimag.v34i1.2449.

[122] Z. Li, C. Li, M. Zhang, Q. Mei, and M. Bendersky, "Retrieval augmented generation or long-context LLMs? A comprehensive study and hybrid approach," in *Proc. 2024 Conf. Empirical Methods in Natural Language Processing: Industry Track*, 2024. arXiv:2407.16833.

[123] Y. Peng et al., "Can LLM-as-a-judge reliably verify rubrics in agentic scenarios?" in *Proc. 2026 Conf. Empirical Methods in Natural Language Processing (EMNLP)*, 2026. arXiv:2606.29920.

[124] S. Kim et al., "The BiGGen Bench: A principled benchmark for fine-grained evaluation of language models with language models," in *Proc. 2025 Conf. North American Chapter of the Association for Computational Linguistics (NAACL)*, 2025. arXiv:2406.05761.

[125] J. Jung, M. Lu, S. C. Benker, and D. Darici, "How model size, temperature, and prompt style affect LLM-human assessment score alignment," presented at *NCME AIME 2025*. arXiv:2509.19329.

[126] L. Yoshida, "Are the reasoning models good at automated essay scoring?" in *Findings of the Association for Computational Linguistics: EMNLP 2025*, pp. 8388-8394, 2025, doi: 10.18653/v1/2025.findings-emnlp.445.

[127] W. Mansour, S. Albatarni, S. Eltanbouly, and T. Elsayed, "Can large language models automatically score proficiency of written essays?" in *Proc. LREC-COLING 2024*, 2024. arXiv:2403.06149.

[128] A. V. G. Schleifer, M. Ariely, B. Beigman Klebanov, A. Salman, and G. Alexandron, "Quality-conditioned agreement in automated short answer scoring: Mid-range degradation and the impact of task-specific adaptation," in *Proc. 21st Workshop on Innovative Use of NLP for Building Educational Applications (BEA)*, 2026. arXiv:2605.07647.

[129] M. Krumdick, C. Lovering, V. Reddy, S. Ebner, and C. Tanner, "No free labels: Limitations of LLM-as-a-judge without human grounding," arXiv:2503.05061, 2025. [Preprint.]

[130] A. Panickssery, S. R. Bowman, and S. Feng, "LLM evaluators recognize and favor their own generations," in *Advances in Neural Information Processing Systems (NeurIPS) 37*, 2024. arXiv:2404.13076.

[131] UK AI Security Institute, "Inspect AI: A framework for large language model evaluations," documentation. Available: https://inspect.aisi.org.uk/ (accessed 8 Oct. 2026).

[132] Z. Xu, F. Meng, K. Xu, C. Verbrugge, S. Lucas, and J. Zhao, "AI native games: A survey and roadmap," arXiv:2607.00527, 2026. [Preprint.]

[133] Ericsson, "Defining AI native," white paper. Available: https://www.ericsson.com/en/reports-and-papers/white-papers/ai-native (accessed 8 Oct. 2026).

[134] AI Singapore, "SEA-HELM leaderboard: Vietnamese," snapshot of 18 Sep. 2026. Available: https://leaderboard.sea-lion.ai/detailed/VI (accessed 8 Oct. 2026).

[135] Anthropic, OpenAI, Google, DeepSeek, and Alibaba Cloud, official API pricing pages (accessed 8-9 Oct. 2026).

[136] Stack Overflow, "2025 Developer Survey: Technology," 2025; usage among all respondents. Available: https://survey.stackoverflow.co/2025/technology (accessed 8 Oct. 2026).

[137] React Team, "React v19," 5 Dec. 2024. Available: https://react.dev/blog/2024/12/05/react-19 (accessed 8 Oct. 2026).

[138] Vite Team, "Vite 8.0 is out!," 12 Mar. 2026. Available: https://vite.dev/blog/announcing-vite8 (accessed 8 Oct. 2026).

[139] Google Chrome, "Lighthouse throttling," Lighthouse documentation; mobile profile of 150 ms round-trip time, 1.6 Mbit/s download, and four-fold CPU slowdown. Available: https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md (accessed 8 Oct. 2026).

[140] Poimandres, "React Three Fiber documentation." Available: https://r3f.docs.pmnd.rs (accessed 8 Oct. 2026).

[141] MDN Web Docs, "WebGL best practices." Available: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices (accessed 8 Oct. 2026).

[142] World Wide Web Consortium, "Web Content Accessibility Guidelines (WCAG) 2.1," W3C Recommendation, 2018, updated 2023. Available: https://www.w3.org/TR/WCAG21/. [Standard.]

[143] A. Wathan et al., "Tailwind CSS v4.0," 22 Jan. 2025. Available: https://tailwindcss.com/blog/tailwindcss-v4 (accessed 8 Oct. 2026).

[144] Poimandres, "Zustand: bear necessities for state management in React." Available: https://github.com/pmndrs/zustand (accessed 8 Oct. 2026).

[145] Remix Team, "React Router v7," 22 Nov. 2024. Available: https://remix.run/blog/react-router-v7 (accessed 8 Oct. 2026).

[146] MDN Web Docs, "Using server-sent events." Available: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events (accessed 8 Oct. 2026).

[147] TanStack, "TanStack Query documentation." Available: https://tanstack.com/query (accessed 8 Oct. 2026).

[148] Adobe, "React Aria." Available: https://react-spectrum.adobe.com/react-aria/ (accessed 8 Oct. 2026).

[149] Unicode Consortium, "CLDR: Plural rules," exposed in browsers by the Intl.PluralRules interface of ECMA-402. Available: https://cldr.unicode.org/index/cldr-spec/plural-rules (accessed 8 Oct. 2026).

[150] React Team, "Common components: dangerouslySetInnerHTML," React escapes text content unless raw HTML is injected explicitly. Available: https://react.dev/reference/react-dom/components/common (accessed 8 Oct. 2026).

[151] NestJS, "NestJS documentation: modules, guards, and queues." Available: https://docs.nestjs.com (accessed 8 Oct. 2026).

[152] A. Cockburn, "Hexagonal architecture," 2005. Available: https://alistair.cockburn.us/hexagonal-architecture/ (accessed 8 Oct. 2026).

[153] PostgreSQL Global Development Group, "PostgreSQL documentation: partial indexes." Available: https://www.postgresql.org/docs/current/indexes-partial.html (accessed 8 Oct. 2026).

[154] PostgreSQL Global Development Group, "PostgreSQL documentation: JSON types." Available: https://www.postgresql.org/docs/current/datatype-json.html (accessed 8 Oct. 2026).

[155] Prisma, "Prisma ORM v7.0.0: Rust-free Prisma Client becomes the default," 19 Nov. 2025. Available: https://www.prisma.io/changelog/2025-11-19 (accessed 8 Oct. 2026).

[156] Taskforce.sh, "BullMQ documentation." Available: https://docs.bullmq.io (accessed 8 Oct. 2026).

[157] OWASP Foundation, "Password Storage Cheat Sheet," recommends Argon2id. Available: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html (accessed 8 Oct. 2026).

[158] T. Lodderstedt, J. Bradley, A. Labunets, and D. Fett, "Best Current Practice for OAuth 2.0 Security," RFC 9700, IETF, Jan. 2025, doi: 10.17487/RFC9700.

[159] OWASP Foundation, "Application Security Verification Standard 5.0.0," May 2025. Available: https://owasp.org/www-project-application-security-verification-standard/ (accessed 8 Oct. 2026).

[160] Nrwl, "Nx documentation: affected tasks, caching, and module boundaries." Available: https://nx.dev/docs (accessed 8 Oct. 2026).

[161] Government of Vietnam, Decree No. 53/2022/NĐ-CP detailing a number of articles of the Law on Cybersecurity, 15 Aug. 2022, in force from 1 Oct. 2022, Art. 26. [Legislation.]

[162] Tilleke & Gibbins, "What do Vietnam's new data localization requirements mean for domestic enterprises?," 8 Sep. 2022. Available: https://www.tilleke.com (accessed 8 Oct. 2026). [Legal commentary.]

[163] "Service providers bet on the cloud," *Vietnam Investment Review*, 15 Aug. 2023. Available: https://vir.com.vn (accessed 8 Oct. 2026). [Grey literature.]

[164] "AWS launches Local Zone cloud location in Hanoi, Vietnam," *DatacenterDynamics*, Jun. 2026. Available: https://www.datacenterdynamics.com (accessed 8 Oct. 2026). [Grey literature.]

[165] M. Fowler, "MonolithFirst," 3 Jun. 2015. Available: https://martinfowler.com/bliki/MonolithFirst.html (accessed 8 Oct. 2026).

[166] Microsoft, "Event Sourcing pattern," Azure Architecture Center. Available: https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing (accessed 8 Oct. 2026).

[167] C. Richardson, "Pattern: Transactional outbox." Available: https://microservices.io/patterns/data/transactional-outbox.html (accessed 8 Oct. 2026).

[168] OWASP Foundation, "OWASP Top 10 for LLM Applications 2025," LLM01:2025 Prompt Injection. Available: https://genai.owasp.org/llm-top-10/ (accessed 8 Oct. 2026).

[169] "Trên 1,1 triệu thí sinh trên cả nước làm thủ tục dự thi tốt nghiệp THPT 2025," *Báo Lào Cai*, 25 Jun. 2025, citing Ministry of Education and Training statistics of 1,122,507 grade-12 registrants. [Grey literature.]

[170] Microsoft, "Queue-Based Load Leveling pattern," Azure Architecture Center. Available: https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling (accessed 8 Oct. 2026).
