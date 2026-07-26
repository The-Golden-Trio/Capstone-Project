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
The idea of matching personality to a field rests on Holland's theory of person-environment fit: both individuals and educational or occupational environments are classified using the same six RIASEC types, and the degree of congruence between the two is hypothesised to predict satisfaction, persistence, and performance [2]. O*NET (US Department of Labor) operationalises this theory by assigning a Holland code to each occupation, making systematic matching feasible [8].

*   **Strengths:** a solid scientific basis, a ready-made catalogue of coded occupations, and a direct link from interests to occupational environments.
*   **Limitations (to be stated explicitly in the report):** the congruence-satisfaction effect is small, not large. The classic meta-analysis by Tsabari, Tziner and Meir (2005) - 26 studies, 53 samples, 6,557 respondents - reports an average correlation of only r ≈ 0.17 [4], and Nauta's fifty-year review of the theory reports the same figure, concluding that congruence has modest predictive power [3]. A larger and more recent meta-analysis (105 studies, N = 39,602, spanning 1949-2016) puts interest fit against job satisfaction at ρ ≈ 0.19 [31]. Notably, the relationship runs the opposite way from what is commonly assumed: congruence predicts *performance* (ρ ≈ 0.32) more strongly than it predicts satisfaction, and does so considerably better than raw interest scores alone (ρ ≈ 0.16) [32]. Interests also predict choice of, and persistence in, a field better than they predict satisfaction within an occupation [5]. Two design implications follow. First, the system should be positioned as a tool for narrowing and exploring options, not as a machine that predicts a student's one correct career - consistent with the team's framing of results as an exploratory snapshot. Second, where the platform does claim a benefit, the better-supported claim concerns fit with a field's actual demands, not eventual happiness within it; the interface copy should not promise satisfaction.

#### 2.2 Social Cognitive Career Theory (SCCT)
Holland's theory answers which environment a set of interests fits, but not why a student may still avoid a field that suits them. SCCT (Lent, Brown and Hackett, 1994) adds two moderating variables: self-efficacy (whether the student believes they can succeed) and outcome expectations (what the student believes the field will yield) [6]. This reinforces two of the team's design choices: (a) performance-based micro-tasks capture self-efficacy signals rather than self-reported interest alone; and (b) salary and labour-demand data anchor outcome expectations in evidence rather than rumour.

#### 2.3 Profile-to-major mapping mechanism
Three mapping layers are composed in sequence:
1.  Person profile to RIASEC code (a three-letter code such as “IRA”), produced by Module A.
2.  Major/occupation to RIASEC code, using pre-coded catalogues (O*NET for occupations [8]; many universities publish “majors by Holland type” [7]). For Vietnam, this mapping table must be built in-house from the Ministry of Education and Training's list of majors plus ILO occupational descriptions (the approach JobWay uses) - a content-heavy task and a genuine moat if done carefully.
3.  Congruence index between the person code and each major code, used for ranking. Several standardised formulas exist - Iachan (1984), the C-index (Brown and Gore, 1994), Zener-Schnuelle (1976), or Euclidean distance over the six RIASEC scores [23][24] - all short functions that can be implemented directly.

*   **Strengths:** transparent and explainable - directly addressing the platform's eighth pain point - and requiring no large training set, so it avoids the cold-start problem.
*   **Limitations:** reducing a person to a three-letter code is a simplification; different congruence indices sometimes disagree [23]; and the Vietnam-specific major-to-RIASEC table does not yet exist and must be built and validated in-house.

#### 2.4 Recommender techniques

**Table 2. Recommender families and their fit to this project.**

| Technique | How it works | Fit to the project |
| :--- | :--- | :--- |
| **Content-based** | Matches profile features against major features (RIASEC, skills, subject combination) | Very strong - the core of Section 2.3; needs no historical user data |
| **Knowledge-based** | Reasons over rules/ontology (subject-combination constraints, cutoff scores) | Very strong - handles hard admission constraints and avoids cold-start |
| **Collaborative filtering** | “Students like you also chose...” based on crowd behaviour | Limited early on - cold-start, and risk of amplifying bias (Section 6.5) |
| **Hybrid** | Combines the above | Ideal target - content/knowledge core, adding collaborative once data exists |

A PRISMA systematic review of 21 studies (2020-2025) on recommenders for academic and career guidance concludes that knowledge-based and hybrid approaches dominate, with an average reported accuracy of about 86.4%, and that the open challenges are the integration of real-time labour-market data, cold-start/data sparsity, and transparency [19] - precisely the risks the team has already identified.

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
*   **Ontology-based career recommendation (2024):** an ontology aligned to ESCO/O*NET with HermiT reasoning, designed specifically for students without work experience - closely matching this project's target users; inputs combine educational background and psychological characteristics [20].
*   **Hybrid ML career-pathway recommender (2025):** content-based plus collaborative features with SVM/Random-Forest/DNN models, reporting 90.06% accuracy in a competency-based education setting [21]. Two caveats. First, such high accuracy typically uses the “major already chosen” as ground truth - see the limitation in Section 6.1. Second, the paper reports zero false positives *and* zero false negatives across all classes, a perfect-separation result that more often indicates data leakage than a genuinely excellent model. It is cited here as an example of the hybrid approach, not as a performance target to match.
*   **Systematic review (PRISMA, 21 studies):** used as the standard survey reference for the report [19].

#### 4.2 Evidence on RIASEC and academic outcomes
*   **Hong Kong study (N = 1,104):** a Random-Forest analysis of the influence of the six RIASEC types on major choice and performance across four disciplines; the Artistic type was most influential, but no clear linear model linked type to GPA - illustrating the modest effect noted in Section 2.1 [22].
*   **A caution on the "congruence reinforces ability" claim.** It is tempting to argue that students congruent with their major at entry have their interests and abilities reinforced over time while incongruent students stagnate. The higher-education literature does not clearly support the second half of that claim: studies in the Holland-and-academic-disciplines tradition have found that incongruent students gain roughly as much in the abilities and interests relevant to their major as congruent students do, a pattern read as socialisation outweighing self-selection. The team should therefore not lean on "incongruent students fall behind" as a justification for early matching.

#### 4.3 Stealth / game-based assessment (basis for Module A2)
*   **Shute and Ventura (2013):** the theoretical basis of stealth assessment; validation of the persistence facet (Conscientiousness) against behavioural measures [13].
*   **Shute et al. (2016):** a competency model with a Bayesian network, validated against Raven's Progressive Matrices and MicroDYN [14].
*   **Meta-analysis of game-based assessment (2025):** confirms moderate correlations with standard scales, sufficient to accept construct validity, while warning of circular validation [15].
*   **HEXACO game version (2024):** average correlation of about 0.43 with the standard HEXACO-60 across the six dimensions, and more positive user reactions than the questionnaire; the study measured construct validity and applicant reactions, and did not test faking resistance [16].
*   **Barends et al. (2022):** an assessment game for Honesty-Humility. Study 1 (N = 116) established convergent validity with self-reported Honesty-Humility and divergent validity against the other HEXACO traits and cognitive ability; Study 2 (N = 287) replicated this and demonstrated incremental validity over self-report in predicting cheating for financial gain - evidence that a behavioural game can add predictive power rather than merely echo a questionnaire [17].
*   **VASSIP (2024, PLOS One):** a gamified instrument compared against the BFI-2-S, examining criterion validity and user reactions [18].

#### 4.4 Theoretical grounding cited in the framework
*   Parsons (1909, the three-step model of vocational choice) [1]; Holland (1997) [2]; SCCT (Lent, Brown and Hackett, 1994) [6]; and the congruence meta-analyses [3][4][5][31][32].

**Research-gap observation:** The international literature on personality/interest-to-major recommendation is substantial; however, domestic work specifically on matching personality to majors via recommender systems is thin - most Vietnamese recommender papers are technical surveys or target film/e-commerce rather than career guidance. This is both a research gap the team can claim to contribute to and a caveat that there is little domestic benchmark for comparison.

### 5. Evaluation Plan - Module A (Measurement)

For a psychological instrument, scientific evaluation means demonstrating two psychometric properties: reliability (whether repeated measurement is stable and internally consistent) and validity (whether the instrument measures what it claims to measure).

#### 5.1 Self-report battery (RIASEC + Big Five)

**Reliability**

**Table 3. Reliability indices and target thresholds [9].**

| Index | Meaning | Target |
| :--- | :--- | :--- |
| **Cronbach's Alpha** | Internal consistency among items | ≥ 0.70 (≥ 0.80 good) |
| **McDonald's Omega** | Similar to Alpha, fewer restrictive assumptions | ≥ 0.70 |
| **Test-retest** | Retake after 2-4 weeks; stability over time | High correlation between the two occasions |

**Validity**
*   **Construct validity** - exploratory/confirmatory factor analysis (EFA/CFA) tests whether items load onto the six RIASEC types and five Big Five dimensions as theorised. Target fit: CFI ≥ 0.90; RMSEA ≤ 0.08; SRMR ≤ 0.08; AVE ≥ 0.50 (convergent); HTMT ≤ 0.85 (discriminant) [9].
*   **Convergent validity against established instruments** - administer the team's battery in parallel with internationally validated tools and correlate: RIASEC against the O*NET Interest Profiler [8]; Big Five against the BFI or NEO-FFI. High, statistically significant correlations indicate that the battery measures the intended constructs.

*Vietnam-context note.* Research on the structure of Vietnamese personality indicates that the Western Big Five does not map perfectly onto Vietnamese data (an eight-factor solution fits better) [11]. Therefore, if the team localises or authors its own items, it must re-run EFA/CFA on a Vietnamese student sample rather than assume the English-language structure holds. A standard localisation procedure (forward-back translation and re-validation) can follow published Vietnamese psychometric-adaptation work [12].

#### 5.2 Micro-tasks / stealth assessment

This is the newest component and the one requiring the most careful defence, since measuring traits through behaviour is less established than self-report.

*   **Methodological basis.** Measuring through how a user acts is stealth assessment (Shute and Ventura) [13], operating under Evidence-Centred Design (ECD): define a competency model, attach in-task indicators, and infer scores (rule-based at MVP, upgraded to a Bayesian network later).
*   **Validation approach:**
    *   **Convergent validity** - correlate trait scores inferred from micro-tasks with a validated questionnaire (as Shute did for the persistence facet [13][14]); a meta-analysis confirms moderate correlations between game-based assessment and traditional Big Five scores [15].
    *   **Criterion validity** - whether micro-tasks predict real outcomes (grades in related subjects, final major choice) [18].
    *   **User reactions** - the gamified HEXACO instrument (HEXACO-RUSH) correlates with the standard HEXACO-60 at an average of r ≈ 0.43 across the six dimensions (range 0.29 for Conscientiousness to 0.62 for Openness; N = 240), and drew more positive participant reactions than the questionnaire, though those reactions were moderated by prior video-gaming experience [16].
    *   **Faking resistance (to be tested, not assumed)** - behavioural formats are frequently argued to be harder to fake than self-report, but for this project that remains a hypothesis to test rather than a result to cite: [16] measured applicant *reactions* under a role-play framing, and did not establish faking resistance.
*   **Known limitations (stated explicitly to demonstrate critical thinking):**
    *   Divergent validity cannot be assumed - a game-measured trait may inadvertently correlate with traits it was not intended to measure. Results are instrument-specific: Barends et al. did establish acceptable divergent validity for their Honesty-Humility game [17], which shows the property is achievable but must be demonstrated afresh for any new instrument rather than inherited.
    *   Internal reliability of game-based assessment remains under-studied, and the field still lacks standardised validation frameworks [15].
    *   Circular-validation risk - validating a game only against self-report is circular; external behavioural or outcome criteria are also needed [15].
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
| Not gameable | Reaction and faking-resistance comparison | Stable across conditions |

### 6. Evaluation Plan - Module B (Matching)

No single number suffices. Five layers are required, each answering a different question.

#### 6.1 Offline evaluation (ranking quality)
Treating each student's set of suitable/chosen majors as ground truth, measured on a held-out set (split by time to avoid leakage) [25]:

**Table 5. Offline ranking metrics.**

| Metric | What it measures |
| :--- | :--- |
| **Precision@k** | Proportion of the top-k suggestions that are “hits” [26] |
| **Recall@k / Hit-rate** | Whether a suitable major is captured within the top-k [26] |
| **NDCG@k** | Ranking quality - whether correct majors appear near the top [25][26] |
| **MAP / MRR** | Mean average precision / position of the first correct suggestion [26] |

*Most important limitation of the whole module.* Career orientation has no objective ground truth for the “correct” major. If the majors a student actually chose or was admitted to are used as the standard, the system merely re-learns the market's existing biases (gender, region, prestige) and rewards itself for reproducing them [28][29]. Offline metrics therefore measure only “guessing the actual choice,” not “suggesting what is good for the student” - which is precisely why Sections 6.3 and 6.4 are mandatory.

#### 6.2 Beyond-accuracy evaluation
A career recommender optimised for accuracy alone funnels everyone toward a few popular majors. Additional metrics are needed [26][27]:
*   **Diversity / Coverage** - whether suggestions span many fields and cover the catalogue (countering popularity bias).
*   **Novelty / Serendipity** - whether the system surfaces suitable majors a student had never considered, directly addressing the report's point that students can only report interest in fields they have already encountered.

#### 6.3 Congruence-based evaluation (career-orientation-specific)
Using the congruence formulas from Section 2.3, measure the average fit between a student's profile and the majors the system suggests (Iachan / C-index) against a control (e.g. random suggestions, or the student's unaided choice) [23][24]. This is a theory-grounded measure of match quality, independent of what the student ultimately chooses.

#### 6.4 User study (essential for credibility)
This is the layer the review is most concerned with. Three approaches of increasing strength:
1.  **Expert rating:** career-orientation teachers or counsellors judge whether the top-k suggestions for sample profiles are reasonable (this also answers the question of practitioner involvement - see Section 7).
2.  **Pre-post with control:** measure Career Decision Self-Efficacy (CDSE-SF) - a validated scale with five domains: self-appraisal, occupational information, goal selection, planning, and problem-solving [10] - before and after platform use, compared with a group that takes a one-off questionnaire. A significant increase in CDSE and in orientation confidence is the real measure of impact (the target being career maturity, not merely information access).
3.  **In-app satisfaction/usefulness signals:** the proportion who find suggestions useful, the number of majors shortlisted, and the return rate during the admissions season.

#### 6.5 Fairness / bias audit
Because AI career recommenders have a documented history of reproducing gender stereotypes - a debiasing study of career and college-major recommendation found substantial gender bias in standard collaborative filtering [29], and an audit of four job boards found that postings recommended to female profiles contained 0.58 standard deviations more stereotypically female language than those shown to otherwise-identical male profiles [30] - the system should audit the gender distribution of top-k suggestions by field against a fair distribution; where skew appears, bias-mitigation techniques (re-ranking, fair representation) should be considered [28][29][30]. This is direct evidence for the eighth pain point and an ethical strength when presented to the advisor.

#### Summary - Module B

**Table 6. Evaluation summary for the matching module.**

| Question | Layer | Instrument |
| :--- | :--- | :--- |
| Is the ranking good? | Offline | Precision@k, NDCG, MAP [26] |
| Is it diverse and eye-opening? | Beyond-accuracy | Diversity, Coverage, Serendipity [27] |
| Does it fit theory? | Congruence | Iachan / C-index [23][24] |
| Do experts find it reasonable? | Expert rating | Counsellor judgement |
| Does it help real students? | User study | CDSE-SF pre-post [10] |
| Is it fair? | Fairness audit | Gender distribution of suggestions [30] |

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
Every entry below carries a resolvable link. Entries marked **[CORE]** are the papers the project actually depends on - the ones worth reading in full and citing in the final report. The remainder are supporting or illustrative, and several are explicitly flagged as weak.

**Table 7. Core reading, grouped by the claim each source supports.**

| Purpose | Sources | Why it is core |
| :--- | :--- | :--- |
| Theoretical basis of matching | [2], [6] | Holland's person-environment fit and SCCT are the two theories the whole platform rests on |
| Honest effect sizes (the "do not overpromise" argument) | [4], [31], [32] | The three meta-analyses that set realistic expectations; [32] is the one that shows congruence predicts performance better than satisfaction |
| Major/occupation coding and congruence formulas | [8], [23] | O*NET supplies the coded catalogue; [23] is open-access and gives the actual index formulas to implement |
| Recommender design and prior art | [19], [20] | The PRISMA survey positions the approach; the ontology paper is the closest published analogue to this project |
| Vietnam localisation | [11], [12] | [11] proves the Western Big Five cannot be assumed; [12] is a usable template for Vietnamese adaptation and re-validation |
| Stealth assessment (Module A2) | [13], [15], [17] | Founding text (open access), the meta-analysis that sets realistic validity expectations, and the strongest single validation study |
| Evaluation and fairness | [26], [29], [30] | Metric definitions, plus the two studies that make the bias audit defensible |
| Measuring real impact | [10] | CDSE-SF is the validated pre/post instrument for the user study |

*Verification status.* References [3], [4], [11], [12], [13], [14], [15], [16], [17], [18], [19], [20], [21], [23], [24], [26], [28], [29], [30], [31] and [32] have been checked against the primary sources; the figures quoted in the body text match. **Reference [22] remains unverified** - the DOI resolves but the publisher blocked full-text access, so the N = 1,104 sample, the Random-Forest method and the "Artistic type most influential" finding must be confirmed manually before submission. References [1], [2], [5], [6], [9] and [10] were not re-checked in this pass; they are canonical books, classics or instrument pages, so the risk is low.

**Theory**

[1] Parsons, F. (1909). *Choosing a Vocation*. Houghton Mifflin. Three-step model of vocational choice. Public domain; full text at the Internet Archive: https://archive.org/details/choosingvocation00parsuoft

[2] **[CORE]** Holland, J. L. (1997). *Making Vocational Choices: A Theory of Vocational Personalities and Work Environments* (3rd ed.). Psychological Assessment Resources. Print monograph, no open link; the canonical statement of RIASEC and person-environment fit.

[3] Nauta, M. M. (2010). The Development, Evolution, and Status of Holland's Theory of Vocational Personalities: Reflections and Future Directions for Counseling Psychology. *Journal of Counseling Psychology*, 57(1), 11-22. https://doi.org/10.1037/a0018213 — Reports a congruence-satisfaction correlation of ≈ 0.17 (citing [4]) and concludes congruence has modest predictive power. Open PDF: https://openbooks.library.baylor.edu/app/uploads/sites/23/2020/09/Nauta-2010.pdf

[4] **[CORE]** Tsabari, O., Tziner, A., & Meir, E. I. (2005). Updated Meta-Analysis on the Relationship Between Congruence and Satisfaction. *Journal of Career Assessment*, 13(2), 216-232. https://doi.org/10.1177/1069072704273165 — 26 studies published 1988-2003, comprising 53 samples and 6,557 respondents; congruence-satisfaction r ≈ 0.16-0.17.

[5] Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational Interests and Performance: A Quantitative Summary of Over 60 Years of Research. *Perspectives on Psychological Science*, 7(4), 384-403. https://doi.org/10.1177/1745691612449021 — Superseded on the congruence question by [32]; cite for the interests-predict-choice-and-persistence claim.

[6] **[CORE]** Lent, R. W., Brown, S. D., & Hackett, G. (1994). Toward a Unifying Social Cognitive Theory of Career and Academic Interest, Choice, and Performance. *Journal of Vocational Behavior*, 45(1), 79-122. https://doi.org/10.1006/jvbe.1994.1027 — Source of the self-efficacy and outcome-expectations constructs used in Section 2.2.

[31] **[CORE]** Hoff, K. A., Song, Q. C., Wee, C. J. M., Phan, W. M. J., & Rounds, J. (2020). Interest fit and job satisfaction: A systematic review and meta-analysis. *Journal of Vocational Behavior*, 123, 103503. https://doi.org/10.1016/j.jvb.2020.103503 — 105 studies, N = 39,602, 1949-2016; interest fit to job satisfaction ρ ≈ 0.19.

[32] **[CORE]** Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2017). Interest congruence and performance: Revisiting recent meta-analytic findings. *Journal of Vocational Behavior*, 98, 138-151. https://doi.org/10.1016/j.jvb.2016.11.002 — 92 studies, 1,858 correlations; congruence to performance ρ ≈ 0.32 versus ρ ≈ 0.16 for interest scores alone.

**Occupational coding and congruence measurement**

[7] "Majors by Holland Type," Florida Atlantic University. https://www.fau.edu/career/students/majors-by-holland-type/ — Example of a university publishing a major-to-RIASEC mapping. Web resource, not a paper.

[8] **[CORE]** O*NET OnLine / My Next Move, US Department of Labor. https://www.onetonline.org — RIASEC interest profiler (https://onetinterestprofiler.org/) and Holland codes for ~900 occupations. Public-domain data; the catalogue the matching module depends on.

[23] **[CORE]** Hartmann, F. G., Heine, J.-H., & Ertl, B. (2021). Concepts and Coefficients Based on John L. Holland's Theory of Vocational Choice - Examining the R Package holland. *Psych*, 3(4), 728-750. https://doi.org/10.3390/psych3040047 — **Open access.** Definitions and formulas for the Zener-Schnuelle, Iachan, Brown & Gore C-index and Euclidean congruence indices, and evidence that they disagree. This is the implementable reference for Section 2.3.

[24] R package `holland` - Statistics for Holland's Theory of Vocational Choice (`con_iachan_holland`, `con_brown_c_holland`, `con_zs_holland`, `con_levenshtein_holland`). CRAN. https://cran.r-project.org/web/packages/holland/index.html — Reference implementation to validate your own congruence code against.

**Measurement and psychometrics**

[9] Adaptation and Validation of Psychological Assessment Questionnaires Using Confirmatory Factor Analysis: A Tutorial for Planning and Reporting Analysis (2025). *Eureka* (Asunción). https://www.researchgate.net/publication/389102551 — Threshold summary: Alpha ≥ 0.70; Omega ≥ 0.70; AVE ≥ 0.50; HTMT ≤ 0.85; CFI ≥ 0.90; RMSEA/SRMR ≤ 0.08. *Weak venue: the thresholds are standard but should be anchored to Hu & Bentler (1999) or Hair et al. in the final report.*

[10] **[CORE]** Betz, N. E., & Taylor, K. M. Career Decision Self-Efficacy Scale - Short Form (CDSE-SF). Mind Garden. https://www.mindgarden.com/79-career-decision-self-efficacy-scale — Five domains: self-appraisal, occupational information, goal selection, planning, problem-solving. Short form developed by Betz, Klein & Taylor (1996). **Licensed instrument - budget for permission.**

[11] **[CORE]** Mai, N. T. Q., & Church, A. T. (2023). Exploring the indigenous structure of Vietnamese personality traits: A psycho-lexical approach. *International Journal of Personality Psychology*, 9, 1-26. https://ijpp.rug.nl/article/view/41003 — **Open access.** N = 850, 668 trait terms; an eight-factor solution was most interpretable, and the Big Five, Big Six and ML7 models were all poorly replicated. The evidential basis for not assuming Western structure holds in Vietnam.

[12] **[CORE]** Nguyen, H. T. M., Nguyen, H. V., & Bui, T. T. H. (2022). The psychometric properties of the Vietnamese Version of the Five Facet Mindfulness Questionnaire. *BMC Psychology*, 10, 300. https://doi.org/10.1186/s40359-022-01003-3 — **Open access.** Usable template for a Vietnamese translation-and-revalidation procedure.

**Stealth / game-based assessment (Module A2)**

[13] **[CORE]** Shute, V. J., & Ventura, M. (2013). *Stealth Assessment: Measuring and Supporting Learning in Video Games*. MIT Press. https://direct.mit.edu/books/oa-monograph/3700/ — **Open access monograph.** Founding text for Evidence-Centred Design in games.

[14] Shute, V. J., Wang, L., Greiff, S., Zhao, W., & Moore, G. (2016). Measuring problem solving skills via stealth assessment in an engaging video game. *Computers in Human Behavior*, 63, 106-117. https://doi.org/10.1016/j.chb.2016.05.047 — Bayesian-network competency model validated against Raven's and MicroDYN.

[15] **[CORE]** Fadillah, et al. (2025). Convergent Validity of Game-Based Assessment: A Meta-Analysis. *International Journal of Serious Games*, 12(4), 5-29. https://journal.seriousgamessociety.org/index.php/IJSG/article/view/1028 — **Open access.** Convergent validity r = 0.516 against self-report; explicitly warns about circular validation and the absence of standardised frameworks.

[16] Construct validity and applicant reactions of a gamified personality assessment (2024). *Computers in Human Behavior*. https://www.sciencedirect.com/science/article/abs/pii/S0747563224003352 — HEXACO-RUSH: average r ≈ 0.43 with the HEXACO-60 (0.29 Conscientiousness to 0.62 Openness; Study 1 N = 240); more positive reactions than the questionnaire (Study 2 N = 160), moderated by gaming experience. Does not test faking resistance.

[17] **[CORE]** Barends, A. J., de Vries, R. E., & van Vugt, M. (2022). Construct and Predictive Validity of an Assessment Game to Measure Honesty-Humility. *Assessment*, 29(4), 630-650. https://doi.org/10.1177/1073191120985612 — Study 1 (N = 116) established convergent and divergent validity; Study 2 (N = 287) replicated it and showed incremental validity over self-report in predicting cheating for financial gain. Free full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC9047109/

[18] Ramos-Villagrasa, P. J., Fernández-del-Río, E., Hermoso, R., & Cebrián, J. (2024). Are serious games an alternative to traditional personality questionnaires? Initial analysis of a gamified assessment (VASSIP). *PLOS ONE*, 19(5), e0302429. https://doi.org/10.1371/journal.pone.0302429 — **Open access.** N = 98 university students.

**Recommender systems**

[19] **[CORE]** A Systematic Review of Recommender Systems for Student Academic and Career Guidance (2025). In *Technological Innovations for Sustainable Development* (DATA 2025), Springer. https://doi.org/10.1007/978-3-032-06725-8_14 — PRISMA 2020; 21 studies, 2020-2025; knowledge-based/hybrid dominance, average accuracy ≈ 86.4%; open challenges are real-time labour-market data, cold-start and transparency.

[20] **[CORE]** An Ontology-Based Recommendation Module for Optimal Career Choices (2024). FICC 2024, Springer. https://doi.org/10.1007/978-3-031-54053-0_23 — Ontology aligned to ESCO / O*NET / COR with HermiT reasoning, designed for students with no work experience. The closest published analogue to this project.

[21] Kainyu (2025). A Hybrid Recommender Model for Career Pathway Selection in Competency-based Education. *International Journal of Computer Applications*, 187(2). https://www.ijcaonline.org/archives/volume187/number2/kainyu-2025-ijca-924808.pdf — Reported accuracy 90.06%, precision 92.07%. *Treat with caution: zero false positives and zero false negatives across all classes suggests leakage, and IJCA is a low-tier venue. Cite as an example of the hybrid approach, not as a benchmark.*

[22] Examining the influence of the RIASEC theory within the Holland code on students' academic performance (2024). *Cogent Education*, 11(1). https://doi.org/10.1080/2331186X.2024.2391274 — N = 1,104, Random Forest. **Findings unverified - full text was inaccessible; confirm before citing.**

**Evaluation metrics**

[25] Shaped.ai - Recommender Model Evaluation: Offline vs. Online. https://www.shaped.ai/blog — *Industry blog, not peer-reviewed.* Use [26] for anything citable; retain only as an implementation-practice pointer for time-based hold-out.

[26] **[CORE]** Jadon, A., & Patil, A. (2024). A Comprehensive Survey of Evaluation Techniques for Recommendation Systems. arXiv:2312.16015. https://arxiv.org/abs/2312.16015 — **Open access.** Precision@k, Recall@k, NDCG@k, MAP, MRR, F1@k, plus beyond-accuracy metrics (coverage, novelty, serendipity).

[27] 10 metrics to evaluate recommender and ranking systems - Evidently AI. https://www.evidentlyai.com/ranking-metrics/evaluating-recommender-systems — *Vendor documentation, not peer-reviewed.* Useful for metric intuition and formulas; do not cite as scholarship.

**Fairness and bias**

[28] Jin, D., Wang, L., Zhang, H., Zheng, Y., Ding, W., Xia, F., & Pan, S. (2023). A survey on fairness-aware recommender systems. *Information Fusion*, 100, 101906. https://doi.org/10.1016/j.inffus.2023.101906 — *Note: the journal is Information Fusion, not Information Processing & Management as previously recorded.*

[29] **[CORE]** Islam, R., Keya, K. N., Zeng, Z., Pan, S., & Foulds, J. (2021). Debiasing Career Recommendations with Neural Fair Collaborative Filtering. *WWW '21*, ACM. https://doi.org/10.1145/3442381.3449904 — Gender-debiased career and college-major recommendation. Free full text: https://mdsoar.org/handle/11603/21218

[30] **[CORE]** Zhang, S., & Kuhn, P. (2024). Measuring Bias in Job Recommender Systems: Auditing the Algorithms. NBER Working Paper 32889. https://www.nber.org/papers/w32889 — Audit of four Chinese job boards using paired fictitious profiles differing only in gender; postings recommended to female profiles contained 0.58 SD more stereotypically female language, driven chiefly by content-based matching that takes declared gender as a direct input.

---
*Closing note: the two core modules (measurement and matching) are the hardest to evaluate precisely because career orientation lacks an objective ground truth. The safe strategy is multi-layer evaluation, and positioning the platform as an evidence-based, transparent tool that narrows options and broadens exploration - not as a predictor of a single lifelong career.*
