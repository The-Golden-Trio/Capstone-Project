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
| Solution | Strength | Key limitation |
|---|---|---|
| Holland/RIASEC tests (widely used in VN schools) | Free, scientifically grounded | One-off, self-report only, no follow-up |
| VietCareer (.org / app) | Uses RIASEC/IKIGAI; some AI | Assessment-only, or targets professionals not high schoolers |
| Vinschool career program | Comprehensive, human-advisor-led, strong outcomes | Exclusive to fee-paying private students, not scalable |
| Career fairs | Direct, motivational | Episodic, usually grade-12 only (too late for subject selection) |
| MOET AI-education pilot (2025–26, draft) | Validates policy direction toward "career design & orientation" | Still a pilot, not a product |

**Conclusion:** no existing solution combines continuous self-assessment, hands-on task-based exploration, integrated market data, and community input for the mass public high-school audience — this is the identified gap.

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