# Brief Report: AI-Powered Career Orientation Platform for Vietnamese High School Students
*Prepared for advisor review — topic finalization*

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

Career-orientation solutions have evolved through roughly four generations, from paper-and-pencil quizzes to AI assistants. This section defines each type, weighs its advantages and disadvantages across both the Vietnamese and the international landscape, and then consolidates everything into a rating matrix. The four generations are not mutually exclusive — in practice, a Vietnamese student today moves through all of them at once, cobbling together a journey that no single tool completes.

### 3.1 Generation 1 — Traditional self-assessment ("quizzing")

**(a) Free-standing personality / interest tests.** The most common entry point worldwide: a student answers a fixed questionnaire and receives a type or code. The dominant instruments differ sharply in scientific quality:
- *MBTI / 16Personalities* — a 16-type model. In Vietnam it is by far the most popular format among teenagers and is offered free by portals such as HOCMAI Hướng nghiệp, CareerViet, ELLE, and university career hubs, with 16personalities.com the go-to site. **Advantage:** engaging, memorable, motivates self-reflection, and its friendly language lowers the barrier to entry. **Disadvantage:** low scientific reliability — an estimated 39–76% of people receive a different type on retaking after only five weeks (Pittenger, 2005) — and the MBTI letters do not map cleanly onto specific jobs.
- *Holland Code (RIASEC)* — six interest types (R-I-A-S-E-C). The best-suited model for career matching because it links interests directly to occupational environments; used by schools worldwide and embedded in the free O*NET Interest Profiler (US Department of Labor). In Vietnam it appears piecemeal (HOCMAI, JobWay). **Advantage:** scientifically defensible and directly job-relevant. **Disadvantage:** delivered as one-off quizzes with no bridge to a concrete Vietnamese major or school.
- *Big Five (OCEAN)* — the academic "gold standard" (test–retest reliability ~0.80–0.90; McCrae & Costa, 2003). **Advantage:** strongest validity. **Disadvantage:** its spectrum-style output is harder for teenagers to act on and lacks a catchy label, so it is rarely used in Vietnamese school practice.

Across this whole category the pattern is consistent: free (or near-free), instant, and scalable, but one-off and self-report only (so vulnerable to how a student *thinks* they should answer), with no follow-up, and — in isolation — producing only a label with no path to a specific major or university.

**(b) Pseudo-scientific paid assessments (a Vietnam-specific distortion).** Where the international market fills the self-discovery step with free public tools, a large slice of the Vietnamese market is captured by paid services with no scientific basis:
- *Fingerprint biometrics (DMIT / sinh trắc vân tay)* — a report priced at ~1.3–3.5 million VND (Umit ~3.3M; Ichiko from 1.3M; some centers up to 5.6M — Dân trí investigation). Vendors advertise "90–95% accuracy," but this is self-declared marketing. The Indian Psychiatric Society states DMIT has no scientific evidence base, and the multiple-intelligences theory underpinning it is described as a "neuromyth" (Waterhouse, *Frontiers in Psychology*, 2023).
- *Numerology ("Nhân số học") and fortune-telling (tử vi)* — widely consumed, especially by parents; free lookups plus paid courses, with no empirical basis (essentially cold reading).

**Advantage:** strong marketing, a polished printed "report," and cultural familiarity. **Disadvantage:** costly, misleading, and capable of actively steering a student toward a wrong choice — the opposite of what career orientation is for.

### 3.2 Generation 2 — Traditional human consulting

**(a) School counselors / guidance teachers.** The backbone of career guidance internationally, and the single biggest structural gap in Vietnam. The American School Counselor Association recommends a 250:1 student-to-counselor ratio; the actual US figure had already climbed to 376:1 in 2023–24 (PowerSchool / BusinessWire, 2025). In Vietnam, only ~5% of schools have a dedicated counselor, the rest relying on subject teachers moonlighting as advisors (MOET, cited via VOV2 — see caveats). **Advantage:** human, contextual, trusted, adaptable to the individual. **Disadvantage:** does not scale, quality varies widely, and in Vietnam it is effectively absent for the large majority of students.

**(b) Career fairs and one-off events.** Mass events (e.g., the Tuổi Trẻ / Thanh Niên "ngày hội tư vấn tuyển sinh") where students meet universities directly. **Advantage:** motivational, free to attend, and offers direct contact with real schools. **Disadvantage:** episodic and usually aimed at grade 12 — too late for the grade-10 subject-combination decision — and information-dense rather than personalized.

**(c) Private coaching / consulting centers.** Fee-based one-on-one guidance. In Vietnam this ranges from reputable outfits (e.g., Hướng nghiệp Sông An, which trains counselors and uses the Indigo assessment) to the DMIT centers above; internationally it parallels private "independent educational consultants." **Advantage:** in-depth and personalized. **Disadvantage:** expensive, inaccessible to most families, and uneven in credibility.

### 3.3 Generation 3 — Modern digital platforms (self-service, largely rule-based)

**(a) Domestic career-test + job-info apps.** Vietnamese products that bundle a test with occupational descriptions:
- *JobWay* — "Vietnam's first digitized career app" (co-founded by psychologist Dr. Đào Lê Hòa An). Combines Holland + MBTI with ~300 ILO-based occupation profiles and expert advice, all free. **Advantage:** free, expert-backed, and links interest to occupation. **Disadvantage:** occupation data is qualitative (ILO), thin on real Vietnamese salaries, with no live admission-score data and school suggestions limited to partner institutions.
- *Career Passport (hochieunghenghiep.vn)* — multi-model (five assessments + SWOT + IKIGAI), freemium, positioned as "Vietnam-specific." **Advantage:** breadth of frameworks. **Disadvantage:** still stops at self-discovery and generic advice.

**(b) Domestic admissions / score-lookup portals.** The other half of the journey, run by entirely different players: *tuyensinhso.vn*, *diemthi.tuyensinh247.com*, *hotrotuyensinh.com*, *huongnghiep360.com*. These are strong exactly where the international platforms are blind: multi-year điểm chuẩn lookups, combined-method score calculators, and admit-probability banding ("safe / possible / hard"). **Advantage:** genuinely useful, Vietnam-specific admissions data — the local moat. **Disadvantage:** no self-discovery layer at all; they assume the student already knows the major.

**(c) International integrated CCR (College & Career Readiness) platforms.** The mature reference points, mostly US/UK, mostly sold to schools per seat:
- *O*NET OnLine / My Next Move* (US DoL, free) — RIASEC results linked to 900+ occupations with skills, salary, and outlook.
- *YouScience* (~$25–45/student) — measures aptitude via "brain games" *and* interest ("Personal Match"), then links to O*NET occupations, addressing the interest–aptitude gap.
- *Naviance* (PowerSchool) — the US default, ~8 million students, ~35% of US high schools; full journey from assessment to college application; ~$5–12/student.
- *Xello* and *SchooLinks* — student-friendly K-12 pathway platforms; SchooLinks is explicitly AI-powered.
- *Unifrog* (the UK default) — one place to compare every destination (universities, apprenticeships) with entry requirements and graduate-outcome data; district pricing (£30K+/year).
- *BigFuture (College Board), Common App, UCAS* — free college search and centralized application.

**Advantage:** genuinely end-to-end (self → major → school), with rich localized labor-market and outcome data plus counselor dashboards. **Disadvantage — and this is the key opening for the project:** none carries Vietnamese admission data (điểm chuẩn, tổ hợp môn, THPT methods), the pricing model is school-district and expensive, and the content and language are not built for the Vietnamese system.

### 3.4 Generation 4 — AI-integrated systems

**(a) AI career advisors.** Systems that use ML / LLMs to personalize recommendations rather than return a fixed lookup:
- *Domestic:* **aihuongnghiep.com (Career Advisor)** is the closest competitor to this project's concept — it markets itself as an "AI career platform," runs MBTI + Big Five, and uses AI to suggest occupations and majors in three steps. It is the competitor to watch most closely.
- *International:* **Naviance PowerBuddy** (billed as the first AI assistant of its kind, enhanced for 2025–26 to match students to scholarships, events, and work-based learning) and **SchooLinks'** AI layer show where the incumbents are heading. **Advantage:** adaptive, conversational, personalized at scale. **Disadvantage:** "black-box" recommendations that can reproduce bias (e.g., gender-skewed STEM suggestions) and are hard to audit — a live risk this project must design against.

**(b) University AI admissions chatbots (single-school, non-neutral).** The 2025 boom in Vietnam: **UEH AI Chatbot** (launched April 2025, LLM-based, at aichat.ueh.edu.vn) and **HUIT Chatbot** (LLM + RAG, >95% first-layer accuracy, running 24/7 on Zalo / Messenger with 5,000+ Q&A entries) answer admissions questions instantly. **Advantage:** fast, always-on, and accurate for their own school's data. **Disadvantage — structural:** each serves only its own university, so it is inherently non-neutral; a student comparing ten schools would need ten chatbots. There is no neutral, cross-school AI advisor.

### 3.5 Summary rating matrix

Solutions are rated on seven criteria most relevant to a student's full journey and to this project's positioning. Scale: ●●● strong · ●● moderate · ● weak · ○ none / not applicable.

| Solution (type) | Scientific validity | Self-understanding depth | Career/major exploration | VN admission data (điểm chuẩn, tổ hợp) | End-to-end (self→major→school) | Neutrality (cross-school) | Free & scalable |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Free personality quizzes — MBTI / Holland / Big Five (VN & global web) | ●●\* | ●● | ● | ○ | ● | ●●● | ●●● |
| DMIT / numerology / tử vi (VN) | ○ | ● | ● | ○ | ● | ●●● | ● |
| School counselors / guidance teachers | ●● | ●● | ●● | ●● | ●● | ●●● | ● (VN: ○) |
| Career fairs & events | ● | ● | ●● | ●● | ● | ●● | ●● |
| Private career coaching centers (VN & global) | ●● | ●●● | ●● | ●● | ●● | ●● | ● |
| Domestic career-test apps — JobWay, Career Passport | ●● | ●● | ●● | ● | ●● | ●●● | ●●● |
| Domestic admissions portals — tuyensinh247, tuyensinhso, hotrotuyensinh | ○ | ○ | ● | ●●● | ● | ●●● | ●●● |
| International CCR platforms — O*NET, YouScience, Naviance, Xello, Unifrog | ●●● | ●●● | ●●● | ○ | ●●● | ●●● | ●● (mostly paid) |
| AI career advisors — aihuongnghiep.com; PowerBuddy, SchooLinks | ●● | ●● | ●●● | ● | ●●● | ●● | ●● |
| University AI admissions chatbots — UEH, HUIT | ○ | ○ | ●● | ●●● | ● | ○ | ●●● |
| **Proposed platform (this project)** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** | **●●●** |

\* RIASEC and Big Five score ●●● on validity on their own; MBTI / 16Personalities pull the blended row down to ●●.

### 3.6 Conclusion — the identified gap

Reading the matrix by column, no existing solution is strong across all seven criteria at once — and, tellingly, the two columns most solutions fail *together* are **"VN admission data"** and **"end-to-end integration."** International platforms (O*NET, YouScience, Naviance, Unifrog) excel at scientific self-discovery and full-journey integration but carry zero Vietnamese admission data. Vietnamese admissions portals own that data but have no self-discovery layer. Domestic test apps (JobWay) and AI advisors (aihuongnghiep.com) bridge self-discovery to occupations but stop short of live school / điểm-chuẩn data, and the AI admissions chatbots (UEH, HUIT) are fast but locked to a single school.

In short: **no solution — domestic or international — combines scientifically-grounded, continuous self-assessment with hands-on exploration, Vietnamese admission data, and neutral cross-school coverage in one place.** That intersection is the gap this project targets.

## 4. Pain points and remedies
| Pain point | Remedy (maps to Part 5 features) |
|---|---|
| Choice made "on feeling," no real self-knowledge | Adaptive RIASEC-based self-assessment + academic profile tracking |
| Self-report ≠ actual fit | Micro-task exploration loop — fit tested by real performance |
| Decision data (salary, demand, điểm chuẩn) is scattered | Visual Pathway & Market Analytics module, unified in one view |
| Quality guidance (like Vinschool) is inaccessible to most students | Free/scalable digital platform, continuous rather than one-off |
| No authentic peer/field-specific insight | Topic-based community forum (CS, DevOps, MLOps, etc.) |

## 5. Proposed system features (summary)

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
- Personal roadmap builder for saving a multi-year plan, and a job/industry news feed for bookmarked or explored careers

### 5.4 Mentor & Alumni Insights Space (Community Forum)
- Topic-based forum structure organized by field/specialization (e.g., Computer Science, DevOps, MLOps, Business, Medicine, Design)
- Post-and-reply threads, topic follow/subscribe, and upvoting/helpful-marking of replies
- Contributor profiles with role badges (current student, alumni, working professional) and field tags
- In-app direct messaging between users, separate from the public forum and subject to reporting/moderation given that the user base includes minors
- "A day in my life as X" story library of alumni-submitted posts, and search across all forum topics and posts

### 5.5 Cross-Cutting Platform Features
- Multi-role accounts (student or parent, consultant/mentor/alumnus/counselor, administrator)
- Notifications for survey/task reminders, new mentor activity, and new pathway recommendations
- Privacy and data controls, including consent screens and parental visibility into activity
- Home dashboard showing profile completeness, recommended next actions, and recent activity
- Counselor console with class-wide trend views (e.g., "60% of Grade 11 leaning STEM") and the ability to assign tasks to a whole class
- Unified export/report combining survey results, top pathway recommendations, and suggested mentors, shareable with parents
- Global search/filtering across careers, majors, and universities, plus platform-wide moderation and reporting tools

### 5.6 AI Layer
- Adaptive next-question selection in the survey, starting rule-based with a later upgrade path to machine learning
- Fit-score ranking model combining survey and micro-task performance
- Freeform-text topic/thread recommendation, surfacing relevant forum discussions based on a student's profile or recent activity
- Career Q&A chat assistant grounded in the platform's own market data (retrieval-augmented generation over the salary/demand dataset)
- Disengagement/dropout-risk flagging for counselors

*This layer is treated as a bonus scope, to be built last and refined after the other five areas are in place.*

## 6. Data sources and expected results
**Data sources.** The platform draws on four categories of data:

1. **Academic and admission data** — the GDPT 2018 curriculum structure, the standard Vietnamese university-admission subject combinations (A00, A01, B00, C00, D01, D07, etc.) and their mapping to eligible majors, and university admission cutoff scores (điểm chuẩn), covering both the national THPT exam and transcript-based admission routes. Sourced from MOET and individual university websites; these are publicly readable but fragmented, with no public API, so manual aggregation or per-university scraping is required.
2. **Labor-market data** — sector-level labor demand and growth trend reports from MOLISA and the General Statistics Office (GSO), plus salary and hiring-demand data from job platforms such as VietnamWorks and TopCV. The intended collection method is automated, periodic scraping and aggregation by an AI/agent process rather than manual entry, so that salary, demand, and cutoff-score data stay continuously up to date with the real market.
3. **Personal student data** — grades, transcripts, and subject-combination choices entered directly by students while using the platform. This is not integrated with school transcript management systems (e.g., VNEdu, SMAS), since no unified data format currently exists across schools and departments.
4. **Platform-generated data** — micro-task simulation content authored by the platform's content team, "a day in the life of X" articles contributed by alumni and working professionals, forum posts and discussions, and community ratings/comments on career pages. This data is generated internally by users and staff, with no external source.

*Note:* the reference links associated with these sources point to the official homepage/domain of each source, which are believed to be accurate; deep links to specific reports or data pages may change over time and should be re-verified at implementation time rather than hard-coded.

**Expected results / evaluation criteria for this semester:**
- A working prototype demonstrating one full pillar end-to-end (proposed: Micro-Task Exploration Loop + Market Analytics, as the most novel and differentiated features).
- Data accuracy of curated market data, cross-checked against sources.
- A small usability test with real high-school students (survey/task completion rate, qualitative feedback).
- Basic performance benchmarks (load/response time).

---

## Open items to confirm with advisor
- Which pillar(s) to build as a working prototype this semester vs. propose only.
- Feasibility/access plan for salary and điểm chuẩn data given no public API exists.
- Usability-test method (sample size, target school/grade).