# Brief Report: AI-Powered Career Orientation Platform for Vietnamese High School Students
*Prepared for advisor review — topic finalization*

---

## Executive summary
Vietnamese high-school students consistently choose majors without real self-knowledge or labor-market grounding — evidenced by widely-cited estimates that a majority misjudge their fit and a documented gap between graduate skills and employer needs (Section 2). A review of eleven existing solution types, from personality quizzes to university AI chatbots (Section 3), shows none combines scientifically-grounded self-assessment, hands-on exploration, Vietnamese admission data, and neutral cross-school coverage at a scale accessible to the mass public-school population — the gap this project targets (Section 3.6). Section 4 distills this into eight specific, unaddressed pain points; Section 5 proposes a four-pillar platform (adaptive self-assessment, performance-based micro-tasks, market/pathway analytics, and a community forum) directly mapped to close them. Section 6 covers data feasibility — no source offers a public API, so a curated/semi-automated data pipeline is proposed — and defines success for the full project (all eight pain points addressed, a complete self-assessment-to-decision journey, an active community, and validated impact on student career clarity).

---

## 1. What is career orientation, and related fields

**Definition.** Career orientation is the process of helping someone understand who they are — their interests, personality, strengths, and values — and connect that self-understanding to suitable study paths and jobs (OECD, 2004; UNESCO-UNEVOC). This traces back to Frank Parsons (1909), who framed a good career choice as three steps: (1) understand yourself, (2) understand the world of work, (3) reason about how the two connect.

**General steps in career orientation.** In practice, this process is usually broken into four stages that a system (human counselor or digital platform) needs to support:
1. **Self-assessment** — understanding one's own interests, personality, strengths, and values (the psychology-grounded step, drawing on frameworks like RIASEC and SCCT).
2. **Exploration** — actively investigating career/study options that might fit, ideally through real exposure rather than reading about a job in the abstract.
3. **Decision-making** — matching the self-assessment and exploration results against real-world information (labor demand, admission requirements, salary) to narrow down options.
4. **Planning and review** — turning a decision into a concrete action plan (e.g., subject-combination choice, university target) and revisiting it periodically, since — per Super's theory — a person's self-concept and circumstances keep evolving.

**Related fields to review:**

**a. Educational / career psychology.** This is the field that explains *how* a person's inner traits — interests, personality, cognitive strengths, confidence, and values — connect to career fit. It's the theoretical basis for the platform's self-assessment engine, drawing mainly on Holland's RIASEC model (interest-environment matching), Social Cognitive Career Theory (self-efficacy and outcome expectations), and Vietnam's own "Career Tree" framework, with Super's Life-Span theory reminding us that a teenager's self-concept is still evolving, so results should be treated as an exploratory snapshot rather than a fixed label.

**b. Labor market information systems (LMIS).** The study of how salary, job-demand, and industry-growth data is collected, structured, and published (in Vietnam, coordinated by MOLISA and the General Statistics Office). It matters for the platform's market-analytics module, and it connects back to (a): SCCT's "outcome expectations" (what a student *believes* will happen if they pursue a career) are only accurate if real market data exists to check beliefs against — without LMIS, students form outcome expectations from rumor rather than fact.

**c. HCI / EdTech design for teenagers.** The study of how to design technology specifically for adolescent users, sometimes called Teen-Computer Interaction (TeenCI). Teenagers are described in this literature as "possibly the most diverse, dynamic and technologically-aware user group," needing design that fits their developmental stage rather than reused adult UX. This is psychology applied directly to interface design — how a 16-year-old processes a question, stays motivated, or trusts a recommendation differs from an adult, so even the wording and pacing of the assessment survey is a psychological design choice, not just a UI one.

**d. Recommender systems.** The computer-science field behind "suggest the next best option based on someone's data" — the same logic behind Netflix or Shopee recommendations, applied here to suggest careers or majors. The best-performing approaches for career guidance are knowledge-based/hybrid recommenders, but a persistent unsolved problem is combining personalization (interest/personality data from field (a)) with real-time labor-market data (field (b)) in one recommendation — precisely the gap this project's Visual Pathway & Market Analytics module targets.

**e. Vietnam's education policy framework.** The GDPT 2018 curriculum, the tổ hợp môn (subject-combination) system, and the national THPT admission process — the concrete institutional structure the platform must design around, since a student's psychological profile from field (a) only becomes actionable once mapped onto real subject-combination and admission choices.

**The common thread:** psychology isn't a separate topic sitting apart from the other related fields — it's woven through all of them. LMIS exists to ground psychological outcome-expectations in reality; TeenCI design is psychology applied to interface choices; recommender systems are trying (and currently struggling) to combine psychological data with market data; and Vietnam's policy framework is what turns a psychological profile into an actual, actionable decision.

## 2. Problems in career orientation

This section maps the problem space career orientation must contend with today: hard evidence of student mismatch and skills gaps in the Vietnamese market, alongside structural limitations — assessment validity, labor-market unpredictability, resourcing, adolescent development, family pressure, equity, and algorithmic risk — that constrain career guidance as a practice everywhere it's applied.

### 2.1 Market-level problems in Vietnam
- ~1.07–1.17 million students take the THPT exam each year; only ~65–68% pursue university, leaving a large segment underserved by university-focused guidance.
- Widely cited (press-reported) FALMI estimates: ~60% of students choose the wrong major; ~75% don't understand their chosen field. *(Note: traced to a 2013/2019 official statement, not a formal published study — flagged as a caveat.)*
- A more recent, methodologically described 2026 survey (Đại Nam University/Soha, n≈9,200 across 10 universities) found ~20% of students had no clear career direction entering university, and ~33–41% would consider or definitely choose a different major.
- MOET's official dropout ceiling (Circular 01/2024) allows up to 15% first-year attrition — an implicit acknowledgment of high first-year mismatch.
- Employer-reported skills gaps are well documented (World Bank, ILO/MOLISA); only ~29% of the workforce holds a recognized qualification (GSO, 2025).
- Students consistently report choosing "theo cảm tính" (on feeling) — by peer influence or perceived income — rather than informed self-knowledge or labor-market data.

### 2.2 Problems inherent to career orientation as a practice (independent of Vietnam)
Beyond Vietnam-specific statistics, career orientation faces structural limitations that exist wherever it is practiced, by any provider — human or AI:

- **Assessment tools have real limits.** Even the best-validated framework, Holland's RIASEC, is criticized for oversimplifying people into a 3-letter code, showing only modest (not large) correlations between "fit" and actual satisfaction, and having weaker cross-cultural validity outside the Western samples it was built on. Self-report tools in general are vulnerable to social-desirability bias — students may answer how they *think* they should, not how they truly feel.
- **Careers are chosen under genuine uncertainty.** Labor markets shift faster than school curricula or guidance systems can track — AI and automation are reshaping which skills matter, and by some estimates tens of millions of jobs will disappear and be created within a decade. No guidance system can predict with certainty which fields will still be in demand when today's 16-year-olds graduate university.
- **Career guidance is chronically under-resourced globally, not just in Vietnam.** OECD's PISA-based research finds students across OECD countries show high career confusion and uncertainty, and that job expectations bear little relation to actual labor-market demand — a structural gap, not a Vietnam-specific failure. Counselor shortages are a worldwide pattern (e.g., India alone is estimated to need over a million additional career counselors to meet standard ratios).
- **Teenagers face a specific developmental constraint: limited real-world exposure.** Students can only report interest in fields they've actually encountered — meaning assessments risk missing careers a student has simply never been exposed to, not fields they'd genuinely dislike.
- **Family and cultural pressure can override a student's own psychological profile.** This is well-documented in Confucian-influenced East Asian contexts specifically: parental expectations tied to filial piety are strongly linked to career decisions, sometimes independent of the student's actual interests or aptitudes — meaning even an accurate psychological assessment may not translate into the student's real-world choice.
- **Equity and access gaps affect who benefits from guidance at all.** Rural and lower-income students consistently show lower access to quality career/educational guidance and lower follow-through into higher education than urban/higher-income peers — a pattern found broadly across countries, not unique to Vietnam.
- **AI-based recommendation adds its own risks.** Documented cases show algorithmic career/job recommenders reproducing gender stereotypes from historical training data (e.g., steering STEM suggestions toward male users), and such systems are often "black boxes" — even their own developers may not fully explain why a specific recommendation was given, which undermines student trust and makes bias hard to catch or correct.

## 3. Comparison of existing solutions

Career-orientation solutions have evolved through roughly four generations, from paper-and-pencil quizzes to AI assistants. This section defines each type, weighs its advantages and disadvantages across both the Vietnamese and international landscape, and consolidates everything into a rating matrix. The four generations aren't mutually exclusive — in practice, a Vietnamese student today moves through all of them at once, cobbling together a journey that no single tool completes.

### 3.1 Generation 1 — Traditional self-assessment ("quizzing")

**(a) Free-standing personality / interest tests.** The most common entry point worldwide: a student answers a fixed questionnaire and receives a type or code. The dominant instruments differ sharply in scientific quality:
- *MBTI / 16Personalities* — a 16-type model, by far the most popular format among Vietnamese teenagers, offered free by portals like HOCMAI Hướng nghiệp, CareerViet, and university career hubs. **Advantage:** engaging, memorable, lowers the barrier to self-reflection. **Disadvantage:** weak reliability — an estimated 39–76% of people are classified into a *different four-letter type* on retest after just five weeks (Pittenger, 2005); note this specifically measures whole-type reclassification (needing all four letters to match), not scale-level consistency, which is somewhat higher — but the practical result is the same: MBTI type does not map cleanly onto stable job fit.
- *Holland Code (RIASEC)* — six interest types, the best-suited model for career matching since it links interests directly to occupational environments; embedded in the free O*NET Interest Profiler (US Department of Labor) and used piecemeal in Vietnam (HOCMAI, JobWay). **Advantage:** scientifically defensible and job-relevant. **Disadvantage:** delivered as one-off quizzes with no bridge to a concrete Vietnamese major or school.
- *Big Five (OCEAN)* — the academic "gold standard" for personality measurement, with strong reported test-retest reliability. **Advantage:** strongest validity. **Disadvantage:** its spectrum-style output is harder for teenagers to act on and lacks a catchy label, so it's rarely used in Vietnamese school practice.

Across this category the pattern is consistent: free (or near-free), instant, and scalable, but one-off and self-report only, with no follow-up, and — in isolation — producing only a label with no path to a specific major or university.

**(b) Pseudo-scientific paid assessments (a Vietnam-specific distortion).** Where the international market fills the self-discovery step with free public tools, a notable slice of the Vietnamese market is captured by paid services with no scientific basis: fingerprint biometrics (DMIT / sinh trắc vân tay), priced from roughly 1.3–3.5 million VND per report, marketed with self-declared "90–95% accuracy" claims that lack independent scientific backing; and numerology/fortune-telling (Nhân số học, tử vi), widely consumed especially by parents, functioning essentially as cold reading. **Advantage:** strong marketing, a polished printed "report," and cultural familiarity. **Disadvantage:** costly, misleading, and capable of actively steering a student toward the wrong choice — the opposite of what career orientation is for. *(Note: specific pricing figures above are drawn from market reporting and should be spot-checked against current vendor listings before citing precise numbers in the final thesis.)*

### 3.2 Generation 2 — Traditional human consulting

**(a) School counselors / guidance teachers.** The backbone of career guidance internationally, and a significant structural gap in Vietnam. The American School Counselor Association recommends a 250:1 student-to-counselor ratio; the actual US national average was 376:1 for the 2023–24 school year (ASCA/US Department of Education data) — confirming that even a well-resourced system falls well short of its own target. In Vietnam, dedicated career-counseling staff are uncommon at the school level, with most guidance handled informally by subject teachers; exact national coverage figures are not consistently published and should be sourced directly from MOET before being cited precisely. **Advantage:** human, contextual, trusted, adaptable to the individual. **Disadvantage:** does not scale, and quality varies widely.

**(b) Comprehensive in-house school programs (Vinschool).** A small number of well-resourced private schools run a genuinely continuous, end-to-end program: multi-year self-assessment, industry exposure and job-shadowing placements, and dedicated academic advisors guiding students from subject-combination choice through university application. **Advantage:** the closest existing model to true end-to-end, hands-on career orientation. **Disadvantage:** exclusive to fee-paying private-school students, entirely dependent on in-person staff, and structurally unable to scale to the mass public-school population. *(Note: program specifics should be verified against the school's own published materials before citing details precisely in the final thesis.)*

**(c) Career fairs and one-off events.** Mass events (e.g., the Tuổi Trẻ/Thanh Niên "ngày hội tư vấn tuyển sinh") where students meet universities directly. **Advantage:** motivational, free to attend, direct contact with real schools. **Disadvantage:** episodic and usually aimed at grade 12 — too late for the grade-10 subject-combination decision — and information-dense rather than personalized.

**(d) Private coaching / consulting centers.** Fee-based one-on-one guidance, ranging from reputable outfits (e.g., Hướng nghiệp Sông An) to the pseudo-scientific centers above; internationally this parallels private "independent educational consultants." **Advantage:** in-depth and personalized. **Disadvantage:** expensive, inaccessible to most families, and uneven in credibility.

### 3.3 Generation 3 — Modern digital platforms (self-service, largely rule-based)

**(a) Domestic career-test + job-info apps.** Vietnamese products that bundle a test with occupational descriptions — notably **JobWay**, Vietnam's first digitized career app (founded by psychologist Dr. Đào Lê Hòa An), combining Holland/MBTI-style assessment with roughly 300 ILO-referenced occupation profiles, entirely free. **Advantage:** free, expert-backed, links interest to occupation. **Disadvantage:** occupation data is qualitative, thin on real Vietnamese salaries, with no live admission-score data.

**(b) Domestic admissions/score-lookup portals.** A different set of players (e.g., tuyensinhso.vn, diemthi.tuyensinh247.com) offering multi-year điểm chuẩn lookups and admit-probability estimates. **Advantage:** genuinely useful, Vietnam-specific admissions data — the local moat. **Disadvantage:** no self-discovery layer at all; they assume the student already knows the major.

**(c) International integrated CCR (College & Career Readiness) platforms.** The mature reference points, mostly US/UK, mostly sold to schools per seat — O*NET OnLine/My Next Move (free, RIASEC-linked to 900+ occupations), YouScience (aptitude + interest matching), Naviance (the US default, widely deployed across US high schools), Xello/SchooLinks (K-12 pathway platforms), and Unifrog (the UK default, comparing universities and apprenticeships with entry requirements). **Advantage:** genuinely end-to-end (self → major → school), with rich localized labor-market and outcome data. **Disadvantage — the key opening for this project:** none carries Vietnamese admission data (điểm chuẩn, tổ hợp môn, THPT methods), pricing is school-district-scale, and content/language isn't built for the Vietnamese system. *(Note: specific enrollment/pricing figures for these platforms are drawn from public marketing materials and should be re-verified against current vendor sources before final citation.)*

### 3.4 Generation 4 — AI-integrated systems

**(a) AI career advisors.** Systems using ML/LLMs to personalize recommendations rather than return a fixed lookup. Domestically, **aihuongnghiep.com** markets itself as an AI career platform combining personality assessment with AI-suggested majors — the closest competitor to this project's concept and worth watching closely. Internationally, incumbents like Naviance and SchooLinks are adding AI-assistant layers on top of their existing platforms. **Advantage:** adaptive, conversational, personalized at scale. **Disadvantage:** "black-box" recommendations that can reproduce bias (e.g., gender-skewed STEM suggestions) and are hard to audit — a live risk this project must design against.

**(b) University AI admissions chatbots (single-school, non-neutral).** A 2025–26 trend in Vietnam: several universities (e.g., UEH, HUIT) have launched LLM-based admissions chatbots answering questions instantly, often via Zalo/Messenger. **Advantage:** fast, always-on, accurate for their own school's data. **Disadvantage — structural:** each serves only its own university, so it's inherently non-neutral; a student comparing ten schools would need ten chatbots. There is no neutral, cross-school AI advisor.

### 3.5 Summary rating matrix

Solutions are rated on seven criteria most relevant to a student's full journey and to this project's positioning. Scale: ●●● strong · ●● moderate · ● weak · ○ none/not applicable. The proposed platform's row reflects *design intent*, not proven performance — scored conservatively where the claim is still unvalidated.

| Solution (type) | Scientific validity | Self-understanding depth | Career/major exploration | VN admission data | End-to-end journey | Neutrality (cross-school) | Free & scalable |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Free personality quizzes (MBTI/Holland/Big Five) | ●●* | ●● | ● | ○ | ● | ●●● | ●●● |
| DMIT / numerology (VN) | ○ | ● | ● | ○ | ● | ●●● | ● |
| School counselors | ●● | ●● | ●● | ●● | ●● | ●●● | ● (VN: limited) |
| Vinschool-style in-house programs | ●● | ●●● | ●●● | ●● | ●●● | ●● | ○ (exclusive) |
| Career fairs & events | ● | ● | ●● | ●● | ● | ●● | ●● |
| Private coaching centers | ●● | ●●● | ●● | ●● | ●● | ●● | ● |
| Domestic career-test apps (JobWay) | ●● | ●● | ●● | ○ | ●● | ●●● | ●●● |
| Domestic admissions portals | ○ | ○ | ● | ●●● | ● | ●●● | ●●● |
| International CCR platforms | ●●● | ●●● | ●●● | ○ | ●●● | ●●● | ●● (mostly paid) |
| AI career advisors (domestic & int'l) | ●● | ●● | ●●● | ● | ●●● | ●● | ●● |
| University AI admissions chatbots | ○ | ○ | ●● | ●●● | ● | ○ | ●●● |
| **Proposed platform (this project)** | **●●** | **●●** | **●●●** | **●●●** | **●●●** | **●●●** | **●●** |

\* RIASEC and Big Five score ●●● on validity individually; MBTI pulls the blended row down to ●●.

### 3.6 Conclusion — the identified gap

Reading the matrix by column, no existing solution is strong across all seven criteria at once — and the two columns most solutions fail *together* are **"VN admission data"** and **"end-to-end journey integration."** International platforms excel at scientific self-discovery and full-journey integration but carry zero Vietnamese admission data; Vietnamese admissions portals own that data but have no self-discovery layer; domestic test apps and AI advisors bridge self-discovery to occupations but stop short of live admission data; AI admissions chatbots are fast but locked to a single school; and Vinschool-style programs achieve genuine end-to-end quality but only for the small, fee-paying slice of students who can access them.

In short: **no solution — domestic or international — combines scientifically-grounded, continuous self-assessment with hands-on exploration, Vietnamese admission data, and neutral cross-school coverage in one place, at a scale accessible to the mass public-school population.** That intersection is the gap this project targets. Two data points remain unverified against a primary source and should be checked before final submission: Vietnam's exact rate of school-level dedicated career-counseling staff, and the specific pricing/enrollment figures cited for pseudo-scientific assessments and international CCR platforms.


## 4. Pain points — gaps left uncovered by existing solutions

Sections 2 and 3 together showed that today's career-orientation problems are only partly addressed by what already exists. This section narrows in on what remains unresolved — the specific shortcomings no current solution, domestic or international, manages to close.

1. **No solution offers performance-based fit testing.** Every option reviewed — quizzes, counselors, coaching centers, domestic apps, AI advisors — relies on self-report. None tests whether a student can actually perform well in a field; they only ask whether the student *thinks* they'd be interested.
2. **No solution combines self-discovery with Vietnamese admission data in one place.** International CCR platforms (O*NET, YouScience, Naviance, Unifrog) have strong self-assessment but zero điểm-chuẩn/tổ-hợp-môn data; Vietnamese admissions portals have that data but no self-discovery layer at all.
3. **No solution is both genuinely end-to-end and accessible to the mass public-school student.** The one program that is comprehensive and continuous (Vinschool) is exclusive to fee-paying private students; the free, scalable options (quizzes, JobWay) stop at self-discovery or a generic occupation label.
4. **No solution offers real hands-on career exploration at scale.** Vinschool's job-shadowing provides this but only to its own students; every digital option reviewed (quizzes, domestic apps, AI advisors) is text/quiz-based, with nothing equivalent to actually trying a field before choosing it.
5. **No solution offers a neutral, cross-school AI advisor.** University AI admissions chatbots (UEH, HUIT) are fast and accurate but locked to a single institution — a student comparing multiple schools has no single neutral AI resource to use.
6. **No solution provides a peer/field-specific community channel.** None of the eleven solution types reviewed in Section 3 — quizzes, DMIT/numerology, counselors, Vinschool-style programs, fairs, coaching, domestic apps, admissions portals, international platforms, AI advisors, or admissions chatbots — give students a space to hear directly from current students or working professionals in a specific field.
7. **No free, scalable option is trusted/credible enough to compete with pseudo-scientific alternatives.** DMIT and numerology capture real market share through confident, polished paid reports; the scientifically credible free tools that exist (RIASEC, JobWay) lack the same trust signals and marketing reach.
8. **Existing AI-based advisors offer no transparency into their recommendations.** Tools like aihuongnghiep.com generate suggestions without explaining the reasoning behind them — the general "black-box" problem documented for AI career-recommendation systems, unresolved by any current Vietnamese solution.

## 5. Proposed system features

The proposed platform is organized around six functional areas.

### 5.1 Dynamic Survey & Academic Engine (Personalization)
- Adaptive onboarding survey with branching questions based on prior answers, rather than a fixed static form
- Academic profile import — subject grades/transcript per the GDPT 2018 curriculum, entered manually or imported from Vietnamese school record formats
- Subject-combination (tổ hợp môn) tracking — mapped to Vietnam's standard combinations (A00, A01, B00, C00, D01, D07, etc.) and their eligible university majors
- Real-time "capability portrait" dashboard — a radar chart combining Holland RIASEC personality typing, multiple intelligences, and academic strengths
- Periodic re-assessment each semester, with interest-shift tracking to flag significant profile changes over time
- Exportable PDF profile report for parents/counselors

### 5.2 Micro-Task Exploration Loop
- Curated career-field catalog (an initial set of roughly 15–25 fields for the MVP, expandable later)
- Micro-task library per field — short simulated scenarios (e.g., triaging a mock patient, pricing a tour package, debugging a snippet, writing a product pitch)
- Multiple task formats — scenario multiple-choice, short written response, drag-and-drop simulation, timed challenge
- Performance-based fit scoring, derived from how a student actually performs rather than self-rating alone
- Smart task queue that nudges students toward unexplored fields
- Bookmarking of career paths, badges/achievements for exploration breadth, and pattern surfacing (e.g., "students like you also excelled at…")

### 5.3 Visual Pathway & Market Analytics
- Interactive pathway map — Subject Combination → Major → Career, as a node-graph or Sankey-style visualization
- Search/filtering by interest, current subject combination, or region within Vietnam
- Labor-demand and growth-trend charts by sector, based on Vietnamese labor-market reports
- University admission cutoff-score (điểm chuẩn) lookup and comparison across universities and years, covering both the THPT exam-score and transcript-based (xét học bạ) admission routes
- "What-if" simulator showing which majors/careers open or close as a student changes subject combination
- Side-by-side career comparison (salary in VND, demand, years of study, personality fit)
- **Community ratings and comments per career/job** — students and Contributors (alumni/counselors) can rate and leave firsthand advice on a career page, giving students a trust signal that pseudo-scientific competitors don't offer
- Personal roadmap builder for saving a multi-year plan, and a job/industry news feed for bookmarked or explored careers

### 5.4 Community Forum
- Topic-based forum structure organized by field/specialization (e.g., Computer Science, DevOps, MLOps, Business, Medicine, Design)
- Post-and-reply threads, topic follow/subscribe, and upvoting/helpful-marking of replies
- Contributor profiles with role badges (alumni or counselor) and field tags, distinguishing verified Contributor posts from regular User posts
- In-app direct messaging between users, separate from the public forum and subject to reporting/moderation given that the user base includes minors
- "A day in my life as X" story library of alumni-submitted posts, and search across all forum topics and posts

### 5.5 Cross-Cutting Platform Features
- Three account roles: **User** (student or parent), **Contributor** (alumni or counselor), and **Admin**
- Notifications for survey/task reminders, new forum activity in followed topics, and new pathway recommendations
- Privacy and data controls, including school-code-verified signup, a parental-consent flow, and parental visibility into activity — compliant with Vietnam's Personal Data Protection Decree (Nghị định 13/2023/NĐ-CP) given the user base includes minors
- Home dashboard showing profile completeness, recommended next actions, and recent activity
- Unified export/report combining survey results and top pathway recommendations, shareable with parents
- Global search/filtering across careers, majors, and universities, plus platform-wide moderation and reporting tools

### 5.6 AI Layer
- Adaptive next-question selection in the survey, starting rule-based with a later upgrade path to machine learning
- Fit-score ranking model combining survey and micro-task performance
- **Explainable recommendations** — every suggested career/major displays the specific inputs behind it (e.g., "suggested because of your Investigative interest score and strong performance on the Data Analysis micro-task"), directly addressing the black-box trust problem documented in existing AI advisors (Section 4, pain point 8)
- Freeform-text topic/thread recommendation, surfacing relevant forum discussions based on a student's profile or recent activity
- Career Q&A chat assistant grounded in the platform's own market data (retrieval-augmented generation over the salary/demand dataset)
- Disengagement/dropout-risk flagging for counselors

*This layer is treated as a bonus scope, to be built last and refined after the other five areas are in place.*

## 6. Data sources and expected results

**Data sources.** The platform draws on four categories of data:

1. **Academic and admission data** — the GDPT 2018 curriculum structure, the standard Vietnamese university-admission subject combinations (A00, A01, B00, C00, D01, D07, etc.) and their mapping to eligible majors, and university admission cutoff scores (điểm chuẩn), covering both the national THPT exam and transcript-based (xét học bạ) admission routes — matching the two routes referenced in Section 5.3. Sourced from MOET and individual university websites; these are publicly readable but fragmented, with no public API, consistent with the feasibility conclusion already reached in this section and in Section 3's competitor review (domestic admissions portals hold this data but don't expose it as a service). Realistic approach: manual aggregation and per-university scraping (subject to each site's Terms of Service) into a curated, periodically refreshed snapshot — not a real-time feed.
2. **Labor-market data** — sector-level labor demand and growth-trend reports from MOLISA and the General Statistics Office (GSO), plus salary and hiring-demand data from job platforms such as VietnamWorks, ITviec, TopDev, and TopCV, feeding Section 5.3's demand charts and career comparison view. As with admission data, none of these sources offers a public API — collection is realistically a **semi-automated pipeline**: scraping where a source's structure and Terms of Service allow it, manual entry/verification where they don't, refreshed on a periodic (e.g., semesterly) cadence rather than continuously. A fully autonomous, always-current scraping agent is a reasonable stretch goal for a later iteration, but shouldn't be assumed as the semester-1 baseline given the fragmentation already documented above.
3. **Personal student data** — grades, transcripts, and subject-combination choices entered directly by students while using the platform (feeding Section 5.1's academic profile). This is **not** integrated with school transcript management systems (e.g., VNEdu, SMAS), since no unified data format currently exists across schools and departments — students self-enter this data.
4. **Platform-generated data** — micro-task simulation content authored by the platform's content team (Section 5.2), "a day in the life of X" articles and forum discussions contributed by Contributors (alumni/counselors) (Section 5.4), and community ratings/comments on career pages (Section 5.3). This data is generated internally by users and staff, with no external source, and depends on the same cold-start seeding challenge already noted for the community forum.

*Note:* the specific organizations and platforms named above are believed accurate as of this research, but deep links to individual reports or data pages change over time and should be re-verified at implementation time rather than hard-coded.

**Expected results — full project scope.** Measured against the complete proposal in Section 5, success means:
- **All eight pain points from Section 4 demonstrably addressed** by the corresponding features in Section 5 — not just described, but functioning and testable.
- **A complete self-assessment-to-decision journey**: a student can go from the Dynamic Survey (5.1) through Micro-Task exploration (5.2) to a Visual Pathway recommendation grounded in real Vietnamese admission and market data (5.3), with the reasoning behind each recommendation visible to them (5.6's explainability).
- **An active, self-sustaining Community Forum** (5.4) with genuine participation from both Users (students) and Contributors (alumni/counselors) — not just a built feature, but one with real usage and content past the cold-start stage.
- **Data pipelines for admission, labor-market, and academic data (Section 6, categories 1–3)** running on an established refresh cadence, verified for accuracy against original sources.
- **Validated impact**, not just usability: ideally a before/after or comparison study showing the platform improves students' self-reported career clarity and confidence relative to a one-off assessment baseline (per Section 2.2's observation that career maturity, not just information access, is the real target).
- **A neutral, cross-school position maintained** — the platform should still carry data and recommendations spanning multiple universities, not drift toward favoring any single partner institution, preserving the differentiator identified in Section 3.6.

Evaluated overall on: data accuracy of the market and admission data against original sources, usability with real high-school students (completion rate, qualitative feedback), and basic performance benchmarks (load/response time).