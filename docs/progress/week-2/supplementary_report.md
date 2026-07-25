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

Points (iii)-(v) are the substance of this report. Points (i) and (ii) concern domain credibility; their methodological consequence - the involvement of career-orientation experts in content validation - is addressed in Section 8, while the team's specific personal experience and contacts are confirmed separately in the accompanying cover message.

The scope of this report is the two scientific core modules of the platform: a measurement module (personality, interests, and aptitude) and a matching module (mapping a student profile to suitable majors and careers). These are the components for which "evaluation" carries a precise, non-trivial meaning, and they are therefore treated in the greatest depth.

**Table 1. Mapping of review comments to sections of this report.**

| No. | Review comment | Addressed in |
| :--- | :--- | :--- |
| 1 | Team members' prior involvement in career orientation / admissions counseling | Section 8 (+ cover message) |
| 2 | Access to career-orientation practitioners | Section 8 |
| 3 | Related systems (domestic and international) | Section 4 |
| 4 | Related scholarly work (domestic and international) | Section 5 |
| 5 | System-evaluation plan (assuming development proceeds) | Sections 6-7 |

#### 1.1 The two core modules

*   **Module A - Measurement of personality, interests, and aptitude.** Two instruments: (A1) a self-report battery combining RIASEC interest types and the Big Five personality dimensions; and (A2) micro-tasks that measure through actual performance, following the stealth-assessment paradigm.
*   **Module B - Profile-to-major matching.** Takes the output of Module A (a RIASEC + Big Five vector plus micro-task performance signals) and turns it into a ranked, explainable list of suggested majors and careers.

The two modules require different evaluation philosophies, so the evaluation plan is split accordingly (Sections 6 and 7). The overarching message is that the platform has two scientific "hearts": a tool that measures and a tool that recommends. For the measurement tool, evaluation means demonstrating psychometric reliability and validity - not merely that the software runs. For the recommendation tool, because career orientation has no objective ground truth for the "correct" major, the plan adopts a multi-layer evaluation and positions the platform as an evidence-based, transparent tool for narrowing and broadening options, rather than a predictor of a single lifelong career.

### 2. Theoretical Foundations and Matching Methodology

#### 2.1 Person-environment fit (Holland congruence)
The idea of matching personality to a field rests on Holland's theory of person-environment fit: both individuals and educational or occupational environments are classified using the same six RIASEC types, and the degree of congruence between the two is hypothesised to predict satisfaction, persistence, and performance [2]. O*NET (US Department of Labor) operationalises this theory by assigning a Holland code to each occupation, making systematic matching feasible [8].

*   **Strengths:** a solid scientific basis, a ready-made catalogue of coded occupations, and a direct link from interests to occupational environments.
*   **Limitations (to be stated explicitly in the report):** the congruence-satisfaction effect is small to moderate, not large. The classic meta-analysis by Tsabari, Tziner and Meir (2005), across 53 studies, reports an average correlation of only r ≈ 0.17 [4]; a more recent review reports r ≈ 0.28 for satisfaction and r ≈ 0.15 for performance [3]. Importantly, interests predict choice and persistence in a field considerably better than they predict satisfaction within an occupation (Nye et al., 2012: interest-performance r ≈ 0.23) [5]. The design implication is that the system should be positioned as a tool for narrowing and exploring options, not as a machine that predicts a student's one correct career - consistent with the team's framing of results as an exploratory snapshot.

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
| **Collaborative filtering** | “Students like you also chose...” based on crowd behaviour | Limited early on - cold-start, and risk of amplifying bias (Section 7.5) |
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
*   **Hybrid ML career-pathway recommender (2025):** content-based plus collaborative features with SVM/Random-Forest/DNN models, reporting about 90% accuracy on secondary-school data [21]. Note that such high accuracy typically uses the “major already chosen” as ground truth - see the limitation in Section 7.1.
*   **Systematic review (PRISMA, 21 studies):** used as the standard survey reference for the report [19].

#### 4.2 Evidence on RIASEC and academic outcomes
*   **Hong Kong study (N = 1,104):** a Random-Forest analysis of the influence of the six RIASEC types on major choice and performance across four disciplines; the Artistic type was most influential, but no clear linear model linked type to GPA - illustrating the modest effect noted in Section 2.1 [22].
*   **Smart, Feldman and Ethington:** students congruent with their major at entry showed reinforced interests and abilities over time, whereas incongruent students tended to stagnate - supporting the value of early matching [7].

#### 4.3 Stealth / game-based assessment (basis for Module A2)
*   **Shute and Ventura (2013):** the theoretical basis of stealth assessment; validation of the persistence facet (Conscientiousness) against behavioural measures [13].
*   **Shute et al. (2016):** a competency model with a Bayesian network, validated against Raven's Progressive Matrices and MicroDYN [14].
*   **Meta-analysis of game-based assessment (2025):** confirms moderate correlations with standard scales, sufficient to accept construct validity, while warning of circular validation [15].
*   **HEXACO game version (2024):** average correlation of about 0.43 with standard scales, more positive user reactions, and better resistance to faking [16].
*   **Barends et al. (2022):** an assessment game for Honesty-Humility; documents the limitation of low divergent validity [17].
*   **VASSIP (2024, PLOS One):** a gamified instrument compared against the BFI-2-S, examining criterion validity and user reactions [18].

#### 4.4 Theoretical grounding cited in the framework
*   Parsons (1909, the three-step model of vocational choice); Holland (1997) [2]; SCCT (Lent, Brown and Hackett, 1994) [6]; and the congruence meta-analyses [3][4][5].

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
    *   **Faking resistance** - behavioural formats are harder to game than self-report; the HEXACO game version reports a correlation of about 0.43 and more positive user reactions [16].
*   **Known limitations (stated explicitly to demonstrate critical thinking):**
    *   Divergent validity is often low - a game-measured trait may inadvertently correlate with traits it was not intended to measure [17].
    *   Internal reliability of game-based assessment is under-studied [17].
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
1.  **Expert rating:** career-orientation teachers or counsellors judge whether the top-k suggestions for sample profiles are reasonable (this also answers the question of practitioner involvement - see Section 8).
2.  **Pre-post with control:** measure Career Decision Self-Efficacy (CDSE-SF) - a validated scale with five domains: self-appraisal, occupational information, goal selection, planning, and problem-solving [10] - before and after platform use, compared with a group that takes a one-off questionnaire. A significant increase in CDSE and in orientation confidence is the real measure of impact (the target being career maturity, not merely information access).
3.  **In-app satisfaction/usefulness signals:** the proportion who find suggestions useful, the number of majors shortlisted, and the return rate during the admissions season.

#### 6.5 Fairness / bias audit
Because AI career recommenders have a documented history of reproducing gender stereotypes (e.g. steering women away from STEM, assigning "homemaker" to women) [29][30], the system should audit the gender distribution of top-k suggestions by field against a fair distribution; where skew appears, bias-mitigation techniques (re-ranking, fair representation) should be considered [28][29][30]. This is direct evidence for the eighth pain point and an ethical strength when presented to the advisor.

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
*Note: some entries were compiled from web searches; the team should verify full author lists, years, DOIs, and page numbers against the primary sources before final citation, particularly for meta-analytic figures and conference papers.*

[1] Parsons, F. (1909). Choosing a Vocation. Three-step model of vocational choice.
[2] Holland, J. L. (1997). Making Vocational Choices: A Theory of Vocational Personalities and Work Environments (3rd ed.). Psychological Assessment Resources.
[3] Nauta, M. M. (2010). The Development, Evolution, and Status of Holland's Theory of Vocational Personalities. Journal of Counseling Psychology, 57(1), 11-22.
[4] Tsabari, O., Tziner, A., & Meir, E. I. (2005). Updated Meta-Analysis on the Relationship Between Congruence and Satisfaction. Journal of Career Assessment, 13(2), 216-232. DOI: 10.1177/1069072704273165.
[5] Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational Interests and Performance: A Quantitative Summary of Over 60 Years of Research. Perspectives on Psychological Science, 7(4), 384-403. DOI: 10.1177/1745691612449021.
[6] Lent, R. W., Brown, S. D., & Hackett, G. (1994). Toward a Unifying Social Cognitive Theory of Career and Academic Interest, Choice, and Performance. Journal of Vocational Behavior, 45(1), 79-122. DOI: 10.1006/jvbe.1994.1027.
[7] Smart, J. C., Feldman, K. A., & Ethington, C. A. Congruence and the reinforcement of abilities within Holland environments in higher education. See also “Majors by Holland Type,” Florida Atlantic University. https://www.fau.edu/career/students/majors-by-holland-type/
[8] O*NET / My Next Move - Interest Profiler based on RIASEC, Holland codes for 900+ occupations (US Department of Labor). https://www.onetonline.org
[9] Adaptation and Validation of Psychological Assessment Questionnaires Using Confirmatory Factor Analysis: A Tutorial for Planning and Reporting Analysis (2026). Threshold summary: Cronbach's Alpha ≥ 0.70; McDonald's Omega ≥ 0.70; AVE ≥ 0.50; HTMT ≤ 0.85; CFI ≥ 0.90; RMSEA/SRMR ≤ 0.08. ResearchGate publication 389102551.
[10] Betz, N. E., & Taylor, K. M. Career Decision Self-Efficacy Scale - Short Form (CDSE-SF). Five domains: self-appraisal, occupational information, goal selection, planning, problem-solving. Distributed via Mind Garden.
[11] Mai, N. T. Q. (2023). Vietnamese personality structure. International Journal of Personality Psychology, 9, 1-26. Eight-factor solution; Western Big Five does not fully fit.
[12] Nguyen, H. T. M., Nguyen, H. V., & Bui, T. T. H. (2022). The psychometric properties of the Vietnamese Version of the Five Facet Mindfulness Questionnaire. BMC Psychology. DOI: 10.1186/s40359-022-01003-3.
[13] Shute, V. J., & Ventura, M. (2013). Stealth Assessment: Measuring and Supporting Learning in Video Games. MIT Press.
[14] Shute, V. J., Wang, L., Greiff, S., Zhao, W., & Moore, G. (2016). Measuring problem solving skills via stealth assessment in an engaging video game. Computers in Human Behavior, 63, 106-117.
[15] Fadillah, et al. (2025). Convergent Validity of Game-Based Assessment: A Meta-Analysis. International Journal of Serious Games, 12(4).
[16] Game-related personality assessment (2024). Computers in Human Behavior (article S0747563224003352). DOI: 10.1016/j.chb.2024. HEXACO game version: correlation ≈ 0.43, positive user reactions, better faking resistance.
[17] Barends, A. J., de Vries, R. E., & van Vugt, M. (2022). Construct and Predictive Validity of an Assessment Game to Measure Honesty-Humility. Assessment (SAGE). DOI: 10.1177/1073191120985612.
[18] Are serious games an alternative to traditional personality questionnaires? Initial analysis of a gamified assessment (VASSIP) (2024). PLOS One. DOI: 10.1371/journal.pone.0302429.
[19] A Systematic Review of Recommender Systems for Student Academic and Career Guidance (PRISMA; 21 studies, 2020-2025). Springer. Knowledge-based/hybrid dominance, average accuracy ≈ 86.4%.
[20] An Ontology-Based Recommendation Module for Optimal Career Choices (2024). Springer. DOI: 10.1007/978-3-031-54053-0_23. ESCO/O*NET ontology, HermiT reasoning, for students without work experience.
[21] A Hybrid Recommender Model for Career Pathway (2025). International Journal of Computer Applications, 187(2). Content + collaborative + ML (SVM/RF/DNN), accuracy ≈ 90%.
[22] Examining the influence of the RIASEC theory within the Holland code on students' academic performance (2024). Cogent Education, 11(1). DOI: 10.1080/2331186X.2024.2391274. N = 1,104, Random Forest.
[23] Overview of congruence indices (Zener-Schnuelle 1976; Iachan 1984; Brown & Gore C-index 1994; Euclidean distance) and their sometimes-inconsistent results. See reviews of person-environment congruence within Holland's theory.
[24] R package holland - Statistics for Holland's Theory of Vocational Choice (con_iachan_holland, con_brown_c_holland, con_zs_holland, con_levenshtein_holland). CRAN.
[25] Shaped.ai - Recommender Model Evaluation: Offline vs. Online; Evaluation Metrics for Search and Recommendation Systems (time-based hold-out; MAP, NDCG). https://www.shaped.ai/blog
[26] A Comprehensive Survey of Evaluation Techniques for Recommendation Systems (2024). arXiv:2312.16015. Precision@k, Recall@k, NDCG@k, MAP, MRR, F1@k; and beyond-accuracy metrics (coverage, novelty, serendipity).
[27] 10 metrics to evaluate recommender and ranking systems - Evidently AI. https://www.evidentlyai.com/ranking-metrics/evaluating-recommender-systems
[28] A survey on fairness-aware recommender systems (2023). Information Processing & Management (ScienceDirect).
[29] Debiasing Career Recommendations with Neural Fair Collaborative Filtering (NFCF) (2021). WWW '21, ACM. DOI: 10.1145/3442381.3449904. Gender examples for occupations/majors.
[30] Zhang et al. Measuring/Understanding Algorithmic Bias in Job Recommender Systems: An Audit Study.
[31] Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1-26.
[32] Assessing the Big Five with bifactor computerized adaptive testing (PubMed 30160497); Seybert et al. (2019), ETS Research Report Series - forced-choice personality CAT to reduce faking.

---
*Closing note: the two core modules (measurement and matching) are the hardest to evaluate precisely because career orientation lacks an objective ground truth. The safe strategy is multi-layer evaluation, and positioning the platform as an evidence-based, transparent tool that narrows options and broadens exploration - not as a predictor of a single lifelong career.*
