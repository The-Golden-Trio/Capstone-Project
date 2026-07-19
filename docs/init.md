# AI-Powered Career Orientation Platform for Vietnamese High School Students
### Full System Functionality Brainstorm — Scoped to the Vietnam Market (for later triage into semester scopes)

> **Scope note:** This platform is designed exclusively around Vietnam's education system (chương trình GDPT 2018, tổ hợp môn, kỳ thi tốt nghiệp THPT), Vietnamese universities and admission methods, the domestic Vietnamese labor market, and Vietnamese-language content. No multilingual or international-market features are included in this scope.

---

## Market Context (why this matters)
- Over 1 million high school graduates in Vietnam per year; 80%+ aspire to university, but only ~50% actually enroll.
- ~50% of students feel their initial major choice was unsuitable; 36% want to change majors; ~15% intend to switch majors in their first year.
- 70% of young workers lack the necessary skills upon entering the workforce.
- Existing solutions are weak: manual teacher-led surveys (Google Forms + Holland/MI/SWOT tests), Vinschool's in-house program (exclusive, not public), one-off career fairs, and VietCareer (targets professionals/job-seekers, not high schoolers).
- MOET is currently piloting an AI education framework that explicitly frames high school as the "career design and orientation" phase (pilot evaluation completing mid-2026) — a real institutional tailwind for school adoption.

---

## 1. Dynamic Survey & Academic Engine (Personalization)
- Adaptive onboarding survey — branching questions based on prior answers (personality, interests), not a fixed static form; content and language entirely in Vietnamese
- Academic profile import — subject grades/học bạ per the GDPT 2018 curriculum (manual entry, or import from school record formats used in Vietnam)
- Subject-combination (tổ hợp môn) tracking — mapped to Vietnam's standard combinations (A00, A01, B00, C00, D01, D07, etc.) and how each maps to eligible university majors
- Real-time "capability portrait" dashboard — radar/spider chart combining personality type (Holland RIASEC), multiple intelligences, and academic strengths
- Periodic re-assessment prompts — short retake surveys each semester to track how interests evolve over time
- Interest-shift tracking — flag when a student's profile changes significantly between assessments
- Peer/cohort benchmarking — anonymized comparison against classmates or grade-level averages
- Exportable profile report (PDF) — summary for parents/counselors
- Admin: question-bank & branching-logic editor for counselors/content team to update survey content without code changes

## 2. Micro-Task Exploration Loop
- Career-field catalog (start with a curated set, e.g. 15–25 fields for MVP, expandable later)
- Micro-task library per field — short simulated scenarios (e.g., "triage this mock patient," "price this tour package," "debug this snippet," "write a product pitch")
- Multiple task formats — scenario multiple-choice, short written response, drag-and-drop simulation, timed challenge
- Performance-based fit scoring — score derived from how the student actually performs, not just self-rating
- Smart task queue — suggests the next task to try, nudging toward unexplored fields ("you haven't tried Business yet")
- Bookmark/favorite career paths for deeper follow-up
- Badges/achievements for exploration breadth (gamification to encourage trying many fields, not settling early)
- "Students like you also excelled at…" pattern surfacing
- Admin: task-authoring tool, task versioning, and a task-analytics dashboard (which tasks are too easy/hard/frequently skipped)

## 3. Visual Pathway & Market Analytics
- Interactive pathway map — Tổ hợp môn → Ngành học (Vietnamese university major) → Career (node-graph or Sankey-style visualization)
- Search/filter by interest, current subject combination, or region within Vietnam (e.g. Hà Nội, TP.HCM, Đà Nẵng, and other provinces)
- Salary-range charts in VND by industry/role, sourced from Vietnamese labor-market data (e.g. VietnamWorks, TopCV, GSO reports)
- Labor-demand/growth trend charts by sector, based on Vietnamese labor-market reports (e.g. Bộ LĐTB&XH / GSO)
- University admission cutoff-score (điểm chuẩn) lookup and comparison across Vietnamese universities and years, covering both xét điểm thi THPT and xét học bạ methods
- "What-if" simulator — change subject combination, see which Vietnamese university majors/careers open or close off
- Side-by-side career comparison (salary in VND, demand, years of study, personality fit) — limited to careers/majors available within Vietnam
- Personal roadmap builder — student saves a multi-year plan (this semester's subjects → target Vietnamese university major → target job)
- Community advice, ratings & comments per career/job — students, alumni, and professionals can rate and leave qualitative advice on a given job/career page (e.g. day-to-day reality, pros/cons, honest tips), visible alongside the salary/demand charts
- Job/industry news feed — surfaces recent news relevant to careers a student has bookmarked or explored, so pathway pages stay current rather than static
- Admin: dataset import/refresh tool for salary, demand, and admission-cutoff data sourced from Vietnamese public/official sources (real hidden-scope item — needs a data-sourcing strategy specific to Vietnam, since no unified public API exists for this data today)
- Admin: moderation queue for community ratings/comments on job/career pages

## 4. Mentor & Alumni Insights Space (Community Forum)
- Topic-based forum structure — organized by field/specialization (e.g. Computer Science, DevOps, MLOps, Business, Medicine, Design...), not 1:1 matching
- Post & reply threads within each topic — students, alumni, and professionals can post questions, answers, and discussions
- Topic follow/subscribe — students can follow topics they're interested in and get updates on new posts
- Upvote/helpful-mark on replies — surfaces the most useful answers to the top of a thread
- Contributor profiles — badge/flair showing role (current student, alumni, working professional) and field, so readers know the source's background
- In-app direct messaging — 1:1 messaging between users (student-to-alumni, student-to-student), separate from the public forum; includes reporting/moderation given the user base includes minors
- "A day in my life as X" story library — alumni-submitted blog-style posts (lower-effort content than live mentoring, good for cold-start), can live as pinned posts within relevant topics
- Search across all forum topics/posts
- Admin: content-moderation queue, topic-creation/management tools, contributor role verification (student/alumni/professional)

## Cross-Cutting Platform Features (needed by every subsystem)
- Multi-role accounts: Student, Parent (view-only dashboard), Counselor/Teacher (manage a class cohort, view aggregate trends), Mentor/Alumni, Admin
- Auth & consent: student sign-up (school-code verification tied to Vietnamese schools), parental-consent flow — important given the user base is minors
- Notifications: survey/task reminders, new mentor session, new pathway recommendation
- Privacy & data controls: clear consent screens, parental visibility into activity, no public exposure of raw personal survey data, compliant with Vietnam's Personal Data Protection Decree (Nghị định 13/2023/NĐ-CP) requirements around processing minors' data
- Home dashboard: profile completeness, recommended next action, recent activity feed
- Counselor console: class-wide trend view (e.g., "60% of Grade 11 leaning STEM"), ability to assign tasks to a whole class
- Unified export/report: PDF combining survey results + top pathway recommendations + suggested mentors, shareable with parents
- Global search/filter across careers, majors, universities
- Moderation & reporting tools, platform-wide

## AI Layer (bonus — scope separately, build last)
- Adaptive next-question selection in the survey (start rule-based, upgrade to ML later)
- Fit-score ranking model combining survey + micro-task performance
- Freeform-text topic/thread recommendation (surface relevant forum discussions based on a student's profile or recent activity)
- Career Q&A chat assistant grounded in the platform's own market-data (RAG over salary/demand dataset)
- Disengagement/dropout-risk flagging for counselors

---

## Open Questions for Next Step (Triage)
- Which pillar(s) get a **working prototype** in Semester 1 vs. **design/proposal only**?
- What's the data-sourcing strategy for Vietnamese salary/demand/admission-cutoff data (Pillar 3)? No single unified public API exists — likely needs scraping/aggregating from GSO, university admission portals, and job sites like VietnamWorks/TopCV.
- How to solve the forum's cold-start problem (Pillar 4) within one semester — e.g. seeding initial topics/threads yourself or recruiting an initial contributor base from your own university's community first?
- How deep should the "AI Layer" go in Semester 1 — rule-based stand-ins vs. real ML, and should any AI component (e.g. a career Q&A assistant) be trained/prompted specifically in Vietnamese?
- How will parental-consent and minor-data-handling flows be implemented to align with Vietnam's Nghị định 13/2023/NĐ-CP?