# HO CHI MINH CITY UNIVERSITY OF TECHNOLOGY
## Faculty of Computer Science and Engineering

**Supplementary Report**  
*Scientific Foundations, Related Work, and a System-Evaluation Plan for the Two Core Modules*  
**Project:** An AI-Powered Career Orientation Platform for Vietnamese High School Students  
**Prepared in response to review feedback — for advisor review**  
*Ho Chi Minh City, July 2026*

---

### 1. Introduction and Scope

This document supplements the main project report in response to the advisor's review. The review raised five points: 
(i) the team's prior involvement in career-orientation or admissions-counseling activities; 
(ii) whether the team has access to practitioners working in career orientation; 
(iii) related systems, both domestic and international; 
(iv) related scholarly work, both domestic and international; and 
(v) an evaluation plan for the system, on the assumption that the team proceeds to build it.

Points (iii)-(v) are the substance of this report. Points (i) and (ii) concern domain credibility; their methodological consequence - the involvement of career-orientation experts in content validation - is addressed in Section 7, while the team's specific personal experience and contacts are confirmed separately in the accompanying cover message.

The scope of this report is the two scientific core modules of the platform: a measurement module (personality, interests, and aptitude) and a matching module (mapping a student profile to suitable majors and careers). These are the components for which "evaluation" carries a precise, non-trivial meaning, and they are therefore treated in the greatest depth.

**Table 1. Mapping of review comments to sections of this report.**

| No. | Review comment | Addressed in |
| :--- | :--- | :--- |
| 1 | Team members' prior involvement in career orientation / admissions counseling | Section 7 (+ cover message) |
| 2 | Access to career-orientation practitioners | Section 7 |
| 3 | Related systems (domestic and international) | Section 3 |
| 4 | Related scholarly work (domestic and international) | Section 4 |
| 5 | System-evaluation plan (assuming development proceeds) | Sections 5-6 |

#### 1.1 The two core modules

*   **Module A - Measurement of personality, interests, and aptitude.** Two instruments: (A1) a self-report battery combining RIASEC interest types and the Big Five personality dimensions; and (A2) micro-tasks that measure through actual performance, following the stealth-assessment paradigm.
*   **Module B - Profile-to-major matching.** Takes the output of Module A (a RIASEC + Big Five vector plus micro-task performance signals) and turns it into a ranked, explainable list of suggested majors and careers.

The two modules require different evaluation philosophies, so the evaluation plan is split accordingly (Sections 5 and 6). The overarching message is that the platform has two scientific "hearts": a tool that measures and a tool that recommends. For the measurement tool, evaluation means demonstrating psychometric reliability and validity - not merely that the software runs. For the recommendation tool, because career orientation has no objective ground truth for the "correct" major, the plan adopts a multi-layer evaluation and positions the platform as an evidence-based, transparent tool for narrowing and broadening options, rather than a predictor of a single lifelong career.

### 2. Theoretical Foundations and Matching Methodology

#### 2.1 Person-environment fit (Holland congruence)
The idea of matching personality to a field rests on Holland's theory of person-environment fit: both individuals and educational or occupational environments are classified using the same six RIASEC types, and the degree of congruence between the two is hypothesised to predict satisfaction, persistence, and performance [1]. O*NET (US Department of Labor) operationalises this theory by assigning a Holland code to each occupation, making systematic matching feasible (see *Tools, instruments and data sources*).

*   **Strengths:** a solid scientific basis, a ready-made catalogue of coded occupations, and a direct link from interests to occupational environments.
*   **Limitations (to be stated explicitly in the report):** the congruence effect is small, not large. The largest meta-analysis to date - 105 studies, N = 39,602, spanning 1949-2016 - puts interest fit against job satisfaction at ρ ≈ 0.19 [3]. Notably, the relationship runs the opposite way from what is commonly assumed: congruence predicts *performance* (ρ ≈ 0.32) more strongly than it predicts satisfaction, and does so considerably better than raw interest scores alone (ρ ≈ 0.16) [4]. Two design implications follow. First, the system should be positioned as a tool for narrowing and exploring options, not as a machine that predicts a student's one correct career - consistent with the team's framing of results as an exploratory snapshot. Second, where the platform does claim a benefit, the better-supported claim concerns fit with a field's actual demands, not eventual happiness within it; the interface copy should not promise satisfaction.

#### 2.2 Social Cognitive Career Theory (SCCT)
Holland's theory answers which environment a set of interests fits, but not why a student may still avoid a field that suits them. SCCT (Lent, Brown and Hackett, 1994) adds two moderating variables: self-efficacy (whether the student believes they can succeed) and outcome expectations (what the student believes the field will yield) [2]. This reinforces two of the team's design choices: (a) performance-based micro-tasks capture self-efficacy signals rather than self-reported interest alone; and (b) salary and labour-demand data anchor outcome expectations in evidence rather than rumour.

#### 2.3 Profile-to-major mapping mechanism
Three mapping layers are composed in sequence:
1.  Person profile to RIASEC code (a three-letter code such as “IRA”), produced by Module A.
2.  Major/occupation to RIASEC code, using pre-coded catalogues (O*NET for occupations; several universities publish “majors by Holland type” lists - see *Tools, instruments and data sources*). For Vietnam, this mapping table must be built in-house from the Ministry of Education and Training's list of majors plus ILO occupational descriptions (the approach JobWay uses) - a content-heavy task and a genuine moat if done carefully.
3.  Congruence index between the person code and each major code, used for ranking. Several standardised formulas exist - Iachan (1984), the C-index (Brown and Gore, 1994), Zener-Schnuelle (1976), or Euclidean distance over the six RIASEC scores - all short functions that can be implemented directly [5].

*   **Strengths:** transparent and explainable - directly addressing the platform's eighth pain point - and requiring no large training set, so it avoids the cold-start problem.
*   **Limitations:** reducing a person to a three-letter code is a simplification; different congruence indices sometimes disagree [5]; and the Vietnam-specific major-to-RIASEC table does not yet exist and must be built and validated in-house.

#### 2.4 Recommender techniques

**Table 2. Recommender families and their fit to this project.**

| Technique | How it works | Fit to the project |
| :--- | :--- | :--- |
| **Content-based** | Matches profile features against major features (RIASEC, skills, subject combination) | Very strong - the core of Section 2.3; needs no historical user data |
| **Knowledge-based** | Reasons over rules/ontology (subject-combination constraints, cutoff scores) | Very strong - handles hard admission constraints and avoids cold-start |
| **Collaborative filtering** | “Students like you also chose...” based on crowd behaviour | Limited early on - cold-start, and risk of amplifying bias (Section 6.5) |
| **Hybrid** | Combines the above | Ideal target - content/knowledge core, adding collaborative once data exists |

A PRISMA systematic review of 21 studies (2020-2025) on recommenders for academic and career guidance concludes that knowledge-based and hybrid approaches dominate, with an average reported accuracy of about 86.4%, and that the open challenges are the integration of real-time labour-market data, cold-start/data sparsity, and transparency [6] - precisely the risks the team has already identified.

**Recommended architecture for Semester 1:** a content-based plus knowledge-based core (RIASEC congruence plus subject-combination/cutoff rules) with explanations, reserving collaborative filtering and machine learning for after a real user base exists.

### 3. Related Systems (Domestic and International)

This section cross-references the competitor review in the main report and highlights the systems most relevant to the two core modules.

#### 3.1 International
*   **O*NET Interest Profiler / My Next Move** - free, RIASEC-based, linked to 900+ occupations, under an open licence [8].
*   **YouScience** - combines aptitude (via brain-game tasks) with interest.
*   **Naviance / Unifrog** - end-to-end platforms spanning self-discovery, major, and institution.
*   *Common limitation:* strong matching and outcome data, but no Vietnamese admission data.

#### 3.2 Domestic (Vietnam)
*   **JobWay** - Holland/MBTI assessment mapped to about 300 ILO-referenced occupations.
*   **aihuongnghiep.com** - AI-based major suggestions; the closest competitor to this project's concept.
*   **hotrotuyensinh.com / tuyensinh247 / tuyensinhso.vn** - cutoff-score lookup and admit-probability estimation.
*   **University admissions chatbots (UEH, HUIT, etc.)** - fast but single-school and therefore non-neutral.
*   *Common limitation:* each covers only one segment; none neutrally connects personality to major to institution end-to-end.

### 4. Related Scholarly Work (Domestic and International)

#### 4.1 Academic recommenders for majors and careers
The standard survey reference for this project is a PRISMA systematic review of 21 studies published between 2020 and 2025 on recommender systems for academic and career guidance [6]. Its conclusions shape the architecture proposed in Section 2.4: knowledge-based and hybrid approaches dominate the field, reported accuracies average about 86.4%, and the unresolved problems are the integration of real-time labour-market data, cold-start and data sparsity, and the transparency of recommendations.

Two cautions apply when reading accuracy figures in this literature. First, reported accuracy usually treats the major a student *actually chose* as ground truth, which measures imitation of existing choices rather than quality of advice - the limitation developed in Section 6.1. Second, several individual papers in this space report near-perfect separation, a result that more often indicates data leakage than a genuinely excellent model. Published accuracy numbers are therefore not a target this project should aim to match.

#### 4.2 A caution on the "congruence reinforces ability" claim
It is tempting to argue that students congruent with their major at entry have their interests and abilities reinforced over time while incongruent students stagnate. The higher-education literature does not clearly support the second half of that claim: studies in the Holland-and-academic-disciplines tradition have found that incongruent students gain roughly as much in the abilities and interests relevant to their major as congruent students do, a pattern read as socialisation outweighing self-selection. The team should therefore not lean on "incongruent students fall behind" as a justification for early matching.

#### 4.3 Stealth / game-based assessment (basis for Module A2)
*   **Shute and Ventura (2013):** the theoretical basis of stealth assessment and of Evidence-Centred Design; includes validation of the persistence facet (Conscientiousness) against behavioural measures [8].
*   **Meta-analysis of game-based assessment (2025):** across the published literature, game-based assessments converge with self-report measures at r ≈ 0.52 - moderate and significant, sufficient to accept construct validity in principle - while the authors warn explicitly about circular validation and the absence of standardised validation frameworks [9].

#### 4.4 Theoretical grounding cited in the framework
*   Holland (1997) [1]; SCCT (Lent, Brown and Hackett, 1994) [2]; and the congruence meta-analyses [3][4].

**Research-gap observation:** The international literature on personality/interest-to-major recommendation is substantial; however, domestic work specifically on matching personality to majors via recommender systems is thin - most Vietnamese recommender papers are technical surveys or target film/e-commerce rather than career guidance. This is both a research gap the team can claim to contribute to and a caveat that there is little domestic benchmark for comparison.

### 5. Evaluation Plan - Module A (Measurement)

For a psychological instrument, scientific evaluation means demonstrating two psychometric properties: reliability (whether repeated measurement is stable and internally consistent) and validity (whether the instrument measures what it claims to measure).

#### 5.1 Self-report battery (RIASEC + Big Five)

**Reliability**

**Table 3. Reliability indices and target thresholds.** *(Conventional reporting thresholds in psychometric practice.)*

| Index | Meaning | Target |
| :--- | :--- | :--- |
| **Cronbach's Alpha** | Internal consistency among items | ≥ 0.70 (≥ 0.80 good) |
| **McDonald's Omega** | Similar to Alpha, fewer restrictive assumptions | ≥ 0.70 |
| **Test-retest** | Retake after 2-4 weeks; stability over time | High correlation between the two occasions |

**Validity**
*   **Construct validity** - exploratory/confirmatory factor analysis (EFA/CFA) tests whether items load onto the six RIASEC types and five Big Five dimensions as theorised. Conventional target fit: CFI ≥ 0.90; RMSEA ≤ 0.08; SRMR ≤ 0.08; AVE ≥ 0.50 (convergent); HTMT ≤ 0.85 (discriminant).
*   **Convergent validity against established instruments** - administer the team's battery in parallel with internationally validated tools and correlate: RIASEC against the O*NET Interest Profiler (see *Tools*); Big Five against the BFI or NEO-FFI. High, statistically significant correlations indicate that the battery measures the intended constructs.

*Vietnam-context note.* Research on the structure of Vietnamese personality indicates that the Western Big Five does not map onto Vietnamese data: in a psycho-lexical study of 668 trait terms rated by 850 participants, an eight-factor solution was most interpretable and the Big Five, Big Six and ML7 models were all poorly replicated [7]. Therefore, if the team localises or authors its own items, it must re-run EFA/CFA on a Vietnamese student sample rather than assume the English-language structure holds, following a standard forward-back translation and re-validation procedure.

#### 5.2 Micro-tasks / stealth assessment

This is the newest component and the one requiring the most careful defence, since measuring traits through behaviour is less established than self-report.

*   **Methodological basis.** Measuring through how a user acts is stealth assessment (Shute and Ventura) [8], operating under Evidence-Centred Design (ECD): define a competency model, attach in-task indicators, and infer scores (rule-based at MVP, upgraded to a Bayesian network later).
*   **Validation approach:**
    *   **Convergent validity** - correlate trait scores inferred from micro-tasks with a validated questionnaire, as Shute did for the persistence facet [8]; the published meta-analytic estimate for game-based assessment against self-report is r ≈ 0.52, which sets a realistic expectation for what this project should achieve [9].
    *   **Criterion validity** - whether micro-tasks predict real outcomes (grades in related subjects, final major choice). This is the more valuable of the two and the harder to obtain, since it requires follow-up data.
    *   **Faking resistance (to be tested, not assumed)** - behavioural formats are frequently argued to be harder to fake than self-report. For this project that remains a hypothesis to test, not an established property to claim; it would require an explicit instructed-faking condition compared against honest responding.
*   **Known limitations (stated explicitly to demonstrate critical thinking):**
    *   Divergent validity cannot be assumed - a game-measured trait may inadvertently correlate with traits it was not intended to measure, and this must be demonstrated afresh for any new instrument rather than inherited from the literature.
    *   Internal reliability of game-based assessment remains under-studied, and the field still lacks standardised validation frameworks [9].
    *   Circular-validation risk - validating a game only against self-report is circular; external behavioural or outcome criteria are also needed [9].
*   **Design conclusion:** micro-tasks complement rather than replace the questionnaire - consistent with the hybrid architecture (a validated survey plus behavioural confirmation) the team has adopted.

#### Summary - Module A

**Table 4. Evaluation summary for the measurement module.**

| What to demonstrate | Method | Criterion |
| :--- | :--- | :--- |
| Questionnaire is stable | Cronbach's Alpha, Omega, test-retest | Alpha, Omega ≥ 0.70 |
| Correct factor structure | EFA / CFA | CFI ≥ 0.90; RMSEA, SRMR ≤ 0.08 |
| Measures the intended constructs | Comparison with O*NET / BFI | High, significant correlation |
| Micro-tasks measure the right trait | Convergent validity | Significant correlation |
| Micro-tasks are practically useful | Criterion validity | Correlation with real outcomes |
| Not gameable | Instructed-faking vs honest-responding comparison | Scores stable across conditions |

### 6. Evaluation Plan - Module B (Matching)

No single number suffices. Five layers are required, each answering a different question.

#### 6.1 Offline evaluation (ranking quality)
Treating each student's set of suitable/chosen majors as ground truth, measured on a held-out set split by time to avoid leakage. The metrics below are the standard ranking measures used throughout the recommender-systems literature:

**Table 5. Offline ranking metrics.**

| Metric | What it measures |
| :--- | :--- |
| **Precision@k** | Proportion of the top-k suggestions that are “hits” |
| **Recall@k / Hit-rate** | Whether a suitable major is captured within the top-k |
| **NDCG@k** | Ranking quality - whether correct majors appear near the top |
| **MAP / MRR** | Mean average precision / position of the first correct suggestion |

*Most important limitation of the whole module.* Career orientation has no objective ground truth for the “correct” major. If the majors a student actually chose or was admitted to are used as the standard, the system merely re-learns the market's existing biases (gender, region, prestige) and rewards itself for reproducing them [10]. Offline metrics therefore measure only “guessing the actual choice,” not “suggesting what is good for the student” - which is precisely why Sections 6.3 and 6.4 are mandatory.

#### 6.2 Beyond-accuracy evaluation
A career recommender optimised for accuracy alone funnels everyone toward a few popular majors. Two further families of metric, both standard in the recommender literature, are needed:
*   **Diversity / Coverage** - whether suggestions span many fields and cover the catalogue (countering popularity bias).
*   **Novelty / Serendipity** - whether the system surfaces suitable majors a student had never considered, directly addressing the report's point that students can only report interest in fields they have already encountered.

#### 6.3 Congruence-based evaluation (career-orientation-specific)
Using the congruence formulas from Section 2.3, measure the average fit between a student's profile and the majors the system suggests (Iachan / C-index) against a control (e.g. random suggestions, or the student's unaided choice) [5]. The `holland` R package (see *Tools*) provides reference implementations to validate the team's own code against. This is a theory-grounded measure of match quality, independent of what the student ultimately chooses.

#### 6.4 User study (essential for credibility)
This is the layer the review is most concerned with. Three approaches of increasing strength:
1.  **Expert rating:** career-orientation teachers or counsellors judge whether the top-k suggestions for sample profiles are reasonable (this also answers the question of practitioner involvement - see Section 7).
2.  **Pre-post with control:** measure Career Decision Self-Efficacy (CDSE-SF) - a validated scale with five domains: self-appraisal, occupational information, goal selection, planning, and problem-solving (see *Tools*; note it is licensed, so budget for permission) - before and after platform use, compared with a group that takes a one-off questionnaire. A significant increase in CDSE and in orientation confidence is the real measure of impact (the target being career maturity, not merely information access).
3.  **In-app satisfaction/usefulness signals:** the proportion who find suggestions useful, the number of majors shortlisted, and the return rate during the admissions season.

#### 6.5 Fairness / bias audit
Because AI career recommenders have a documented history of reproducing gender stereotypes - a debiasing study of career and college-major recommendation found substantial gender bias in standard collaborative filtering, and showed it can be mitigated without sacrificing recommendation quality [10] - the system should audit the gender distribution of top-k suggestions by field against a fair distribution; where skew appears, bias-mitigation techniques (re-ranking, fair representation) should be considered [10]. This is direct evidence for the eighth pain point and an ethical strength when presented to the advisor.

#### Summary - Module B

**Table 6. Evaluation summary for the matching module.**

| Question | Layer | Instrument |
| :--- | :--- | :--- |
| Is the ranking good? | Offline | Precision@k, NDCG, MAP |
| Is it diverse and eye-opening? | Beyond-accuracy | Diversity, Coverage, Serendipity |
| Does it fit theory? | Congruence | Iachan / C-index [5] |
| Do experts find it reasonable? | Expert rating | Counsellor judgement |
| Does it help real students? | User study | CDSE-SF pre-post |
| Is it fair? | Fairness audit | Gender distribution of suggestions [10] |

### 7. Expert Involvement and Content Validation
The review's questions about the team's prior involvement in career orientation and its access to practitioners concern domain credibility: a platform that measures psychological traits and recommends careers needs input from people who understand career orientation, or its content validity - whether the questionnaire items and micro-task scenarios are professionally sound - will be weak.

The evaluation plan already builds in an expert role, so this concern maps to a concrete commitment rather than a gap:
*   Recruit one or two domain advisors (a career-orientation teacher, a counselling professional, or a psychology/education lecturer) to (a) review the RIASEC + Big Five item bank and micro-task scenarios for content validity, and (b) provide the expert ratings of top-k major suggestions described in Section 6.4.
*   Where existing contacts are limited, candidate channels include school psychological-counselling offices, university psychology/education faculties, and the advisor's own professional network.
*   Present this as an evaluation plan under the “assuming the team proceeds to build the system” framing, with expert involvement as one link in the validation process.

*Note:* the specific prior experience of individual team members, and named practitioner contacts, are confirmed in the accompanying cover message, as they are not part of the formal report content.

### 8. Implementation Notes
*   The statistical tests (particularly CFA) require a real student sample, typically at least 100-200 participants. This should be presented as an evaluation plan, matching the “assuming development proceeds” framing.
*   If the capstone scope cannot reach a large sample, a reduced pilot/feasibility version is appropriate: reliability (Alpha) plus convergent validity on a small sample (30-50 students), with full CFA noted as future work.
*   Include interviews with two or three career-orientation experts to establish content validity of the item bank and micro-tasks (Section 7).
*   Maintain a consistent message: multi-layer evaluation, and no promise to “predict a lifelong career” - the platform is positioned as an evidence-based, transparent tool that narrows options and broadens exploration.

### References

This list is deliberately limited to the **ten papers the project actually depends on**. Each one carries a claim the report could not make without it; nothing is cited for breadth. **Four of the ten are fully open access**, marked **OA** below, and a fifth ([10]) has a free author copy, so half the list can be verified directly from the links given without institutional access. Sources that are tools, instruments or datasets rather than scholarship are listed separately afterwards and are not counted among the ten.

**Theory and effect sizes**

[1] Holland, J. L. (1997). *Making Vocational Choices: A Theory of Vocational Personalities and Work Environments* (3rd ed.). Psychological Assessment Resources. — The canonical statement of RIASEC and person-environment fit; the premise the entire matching module rests on. Print monograph, no open link.

[2] Lent, R. W., Brown, S. D., & Hackett, G. (1994). Toward a Unifying Social Cognitive Theory of Career and Academic Interest, Choice, and Performance. *Journal of Vocational Behavior*, 45(1), 79-122. https://doi.org/10.1006/jvbe.1994.1027 — Source of the self-efficacy and outcome-expectation constructs that justify the micro-task module and the salary/labour-demand data (Section 2.2).

[3] Hoff, K. A., Song, Q. C., Wee, C. J. M., Phan, W. M. J., & Rounds, J. (2020). Interest fit and job satisfaction: A systematic review and meta-analysis. *Journal of Vocational Behavior*, 123, 103503. https://doi.org/10.1016/j.jvb.2020.103503 — 105 studies, N = 39,602, 1949-2016; interest fit to job satisfaction ρ ≈ 0.19. The evidence that the platform must not promise satisfaction.

[4] Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2017). Interest congruence and performance: Revisiting recent meta-analytic findings. *Journal of Vocational Behavior*, 98, 138-151. https://doi.org/10.1016/j.jvb.2016.11.002 — 92 studies, 1,858 correlations; congruence to performance ρ ≈ 0.32 versus ρ ≈ 0.16 for interest scores alone. Establishes that congruence predicts performance better than satisfaction.

**Matching mechanism**

[5] **OA** Hartmann, F. G., Heine, J.-H., & Ertl, B. (2021). Concepts and Coefficients Based on John L. Holland's Theory of Vocational Choice - Examining the R Package holland. *Psych*, 3(4), 728-750. https://doi.org/10.3390/psych3040047 — Definitions and formulas for the Zener-Schnuelle, Iachan, Brown & Gore C-index and Euclidean congruence indices, plus evidence that they disagree with one another. The implementable reference for Sections 2.3 and 6.3.

[6] A Systematic Review of Recommender Systems for Student Academic and Career Guidance (2025). In *Technological Innovations for Sustainable Development* (DATA 2025), Springer. https://doi.org/10.1007/978-3-032-06725-8_14 — PRISMA 2020; 21 studies, 2020-2025. Knowledge-based and hybrid approaches dominate; average reported accuracy ≈ 86.4%; open challenges are real-time labour-market data, cold-start and transparency. The survey that positions this project's architecture.

**Measurement**

[7] **OA** Mai, N. T. Q., & Church, A. T. (2023). Exploring the indigenous structure of Vietnamese personality traits: A psycho-lexical approach. *International Journal of Personality Psychology*, 9, 1-26. https://ijpp.rug.nl/article/view/41003 — N = 850, 668 trait terms; an eight-factor solution was most interpretable, and the Big Five, Big Six and ML7 models were all poorly replicated. The evidential basis for not assuming Western personality structure holds in Vietnam.

[8] **OA** Shute, V. J., & Ventura, M. (2013). *Stealth Assessment: Measuring and Supporting Learning in Video Games*. MIT Press. https://direct.mit.edu/books/oa-monograph/3700/ — Founding text for stealth assessment and Evidence-Centred Design; the methodological basis of Module A2.

[9] **OA** Fadillah, et al. (2025). Convergent Validity of Game-Based Assessment: A Meta-Analysis. *International Journal of Serious Games*, 12(4), 5-29. https://journal.seriousgamessociety.org/index.php/IJSG/article/view/1028 — Game-based assessments converge with self-report at r ≈ 0.516; explicitly warns about circular validation and the absence of standardised validation frameworks. Sets realistic expectations for the micro-task module.

**Fairness**

[10] Islam, R., Keya, K. N., Zeng, Z., Pan, S., & Foulds, J. (2021). Debiasing Career Recommendations with Neural Fair Collaborative Filtering. *WWW '21*, ACM. https://doi.org/10.1145/3442381.3449904 — Documents gender bias in collaborative-filtering recommendation of careers and college majors, and demonstrates mitigation without loss of recommendation quality. Basis of the fairness audit in Section 6.5. Free full text: https://mdsoar.org/handle/11603/21218

---

#### Tools, instruments and data sources

Not scholarly references, but resources the system uses or is evaluated with.

*   **O*NET OnLine / My Next Move**, US Department of Labor. https://www.onetonline.org — RIASEC Interest Profiler (https://onetinterestprofiler.org/) and Holland codes for ~900 occupations. Public-domain data; the occupation catalogue the matching module depends on.
*   **Career Decision Self-Efficacy Scale - Short Form (CDSE-SF)**, Betz & Taylor, via Mind Garden. https://www.mindgarden.com/79-career-decision-self-efficacy-scale — Five domains: self-appraisal, occupational information, goal selection, planning, problem-solving. **Licensed instrument - budget for permission.**
*   **R package `holland`** - Statistics for Holland's Theory of Vocational Choice. CRAN. https://cran.r-project.org/web/packages/holland/index.html — Reference implementations of the congruence indices in [5], useful for validating the team's own code.
*   **"Majors by Holland Type"**, Florida Atlantic University. https://www.fau.edu/career/students/majors-by-holland-type/ — Example of a published major-to-RIASEC mapping, as a model for the Vietnamese table that must be built in-house.

*Verification note.* All ten references have been checked against the primary sources, and every figure quoted in the body text matches what the source reports. All links were confirmed to resolve; where a publisher returns an error to automated requests (MIT Press, ACM, MDPI), the link opens normally in a browser.

---
*Closing note: the two core modules (measurement and matching) are the hardest to evaluate precisely because career orientation lacks an objective ground truth. The safe strategy is multi-layer evaluation, and positioning the platform as an evidence-based, transparent tool that narrows options and broadens exploration - not as a predictor of a single lifelong career.*
