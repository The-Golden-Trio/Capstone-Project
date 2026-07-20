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
1. **Dynamic Survey & Academic Engine** — adaptive personality/interest assessment (RIASEC-based) + tổ hợp môn academic profile tracking, producing a continuously updated capability portrait.
2. **Micro-Task Exploration Loop** — short, realistic task simulations per career field, scored by actual performance, guiding students toward unexplored fields.
3. **Visual Pathway & Market Analytics** — Subject Combination → Major → Career pathway map with salary (VND), labor-demand trends, admission cutoff-score lookup, community ratings/comments per career, and a relevant job-news feed.
4. **Community Forum** — topic-based discussion boards (by field, e.g. Computer Science, DevOps, MLOps), threaded posts/replies, upvoting, and in-app messaging.

*(Full detailed feature list available separately if needed.)*

## 6. Data sources and expected results
**Data sources:** salary/demand data (ITviec, TopDev, TopCV, VietnamWorks reports) and admission cutoff scores are publicly readable but **fragmented, with no public API** — realistic approach is manual aggregation of a curated snapshot, not real-time integration. Labor-market trend reports (World Bank, ILO, GSO) are freely available for static content.

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