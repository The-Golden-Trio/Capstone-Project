# JobQuest — Updated Requirements (English, report-ready)

Tables below follow the format used in Chapter 4 of the report (Tables 4.1–4.4 and the User Stories in §4.3.1), updated to reflect the current design. No internal field or table names are used.

Each requirement carries two verification methods:
- **Business verification** — how a stakeholder (explorer, domain expert, content administrator, system administrator) confirms the requirement meets its purpose, through acceptance testing, walkthroughs, or expert review.
- **Technical verification** — how the development team confirms the implementation behaves correctly, through automated, integration, boundary, load, or fault-injection tests.

## Table A — Business rules governing the proposed system

| ID | Rule | Origin | Business verification | Technical verification |
|---|---|---|---|---|
| BR-01 | The entry level of every occupation is accessible without prerequisite. | Exploration is the purpose; gating discovery defeats it | Acceptance test: a newly registered explorer opens the entry level of any published occupation | Access-control test: entry-level access is granted to an account with zero credit |
| BR-02 | Access to a higher level requires the competence credit specified for that level. | Competency-based progression | Walkthrough: an explorer below the threshold sees the level locked, with the outstanding competencies stated | Boundary tests at, just below, and just above the soft and domain credit thresholds |
| BR-03 | Entry to an adjacent occupation requires demonstrated competencies overlapping that occupation's entry requirements, determined from the occupational taxonomy. | Occupational taxonomy and competency transfer | Domain experts judge the adjacent occupations offered to seeded profiles as plausible | Overlap computation matches the taxonomy-derived expected set for seeded profiles |
| BR-04 | An occupation may be rated only by a user who has completed it in full. | Rating validity depends on exposure | Acceptance test: the rating form is unavailable until every level of the occupation is completed | Negative test: rating submissions for an incompletely completed occupation are rejected |
| BR-05 | No scenario context or grading criteria are published without domain-expert validation. | Accuracy of occupational representation | Lifecycle walkthrough with a content administrator and a domain expert: publication is unavailable before approval | State-transition test: publication fails without an approving review; a reviewer cannot approve content they initiated |
| BR-06 | Assessment results are formative. They are not transmitted to employers and do not determine access to any external opportunity. | Proportionality to assessment reliability | Policy review of all user-facing wording and every outbound interface | Data-flow audit: no interface exports individual assessment results to third parties |
| BR-07 | Occupational representation must include the unfavourable aspects of the work. | Realistic job preview evidence | Domain-expert review confirms the unfavourable aspects are present and candid | Validation test: an occupation cannot be published with an empty unfavourable-aspects section |
| BR-08 | Statistics derived from user performance are published only in aggregate form. | Privacy of individual performance data | Privacy review of every screen that displays performance or rating statistics | Interface tests: no endpoint returns another user's individual rating or score |
| BR-09 | Each occupation is managed by exactly one content administrator. | Clear accountability for catalogue content | Walkthrough: assigning a second content administrator is blocked; each administrator sees only their own occupation | Uniqueness-constraint test; authorisation tests on every administrator screen |
| BR-10 | Each occupation may be supported by one or more domain experts. Unlike the content-administrator relationship, this is many-to-many: one occupation can draw on several experts, and one expert may support several occupations. | Complex occupations may require more than one domain expert's judgment | Walkthrough: two experts assigned to one occupation can both author and review its content | Integration test of many-to-many assignment and the resulting access rights |
| BR-11 | Within a single scenario, the credit a user can accumulate toward a given competency is capped; replaying the same scenario cannot exceed that cap. | Prevents unlimited progress gain through repetition of one scenario | Acceptance test: an explorer replays one scenario and sees progress stop increasing at the cap | Unit test of capped accumulation across repeated sessions (e.g. cap 10: 8 on the first attempt, at most 2 more afterwards) |
| BR-12 | Practice attempts made by a content administrator or domain expert while testing a scenario before it is submitted for review are excluded from every metric that reflects genuine explorer performance. | Keeps authoring-time testing from contaminating real usage data | Walkthrough: staff play-test a scenario, then confirm dashboards and ratings are unchanged | Integration test: practice sessions are absent from every explorer-facing aggregate |

## Table B — Functional requirements

| ID | Functional requirement | Group | Business verification | Technical verification |
|---|---|---|---|---|
| FR-01 | Register and authenticate a user account | Explorer | Acceptance test: a user registers, signs in, and reaches their own progress; a minor completes guardian consent | Authentication tests; unauthenticated requests for progress are refused |
| FR-02 | Present the entry level of any published occupation without prerequisite | Explorer | Acceptance test: a new explorer opens the entry level of any published occupation | Entry level reachable for a new account with zero credit |
| FR-03 | Present the role, team, and working context specific to a task scenario before that scenario begins | Explorer | Explorer walkthrough: the context is shown and understood before each scenario | End-to-end test: the context screen precedes every scenario, not only the first one in a level |
| FR-04 | Generate a task scenario from an occupation's authored context and generation rules, preserving the task's required facts | Explorer | Domain-expert review of sampled generations against the required facts and the occupation's rules | Automated validator passes on every stored generation (structure, skill coverage, occupation rules) |
| FR-05 | Score free-text responses using discrete anchor points (positive / neutral / negative), each supported by a quotation drawn from the response | Explorer | Domain experts judge a sample of scored responses as fair and well-evidenced | Agreement with expert judgment on the reference set (Cohen's kappa, stratified by difficulty); every quotation is found verbatim in the response |
| FR-06 | Return result, response-specific feedback, and forward guidance as distinct elements | Explorer | Usability test: explorers identify the result, the feedback, and the guidance separately | All three present and distinguishable for every assessed scenario; feedback does not reveal grading criteria |
| FR-07 | Record competencies evidenced by each assessed response, with accumulation capped per skill within a single scenario | Explorer | Domain experts spot-check sampled sessions: recorded competencies match the observed behaviour | Records correspond to rubric criteria; replay test confirms accumulation never exceeds the cap |
| FR-08 | Award competence credit on level completion and unlock levels accordingly | Explorer | Acceptance test: an explorer progresses through levels as expected | Threshold boundary tests unlock at and only at the specified credit |
| FR-09 | Offer entry to adjacent occupations when overlap conditions are met | Explorer | Domain experts judge the offered occupations as plausible for seeded profiles | Offered set matches the taxonomy-derived expectation for seeded profiles |
| FR-10 | Conduct an optional orientation quiz producing a ranked set of candidate occupations | Explorer | Pilot users complete the quiz and find the suggested occupations meaningful | Quiz completes and yields a ranked list of exactly five candidate occupations |
| FR-11 | Collect rating forms (five attributes) once an occupation is fully completed, and display the aggregated result across all respondents | Explorer | Acceptance test: the rating form appears only after full completion; aggregated results are shown or withheld as expected | Rating form accepted only once every level is completed; aggregated result updates after each new submission; suppressed below the response-count threshold |
| FR-12 | Present a private record of attempted occupations, competencies, and awards | Explorer | Explorers confirm their record is accurate and complete | Record reconstructs from session history for a seeded account; not accessible to other users |
| FR-13 | Present an AI-generated description of the user and a social-orientation index, updated as the user plays | Explorer | Pilot users judge the description relevant and not misleading | Description generated after the quiz; index initialised from the quiz and updated after new sessions |
| FR-14 | Introduce probabilistic career and life events affecting subsequent exploration | Explorer | Playtesters judge events plausible and not arbitrarily punitive | Events occur within configured probability bounds across repeated runs; event limit per scenario enforced |
| FR-15 | Co-author, together with the responsible content administrator, the context and generation rules from which an occupation's scenarios are produced | Domain expert | Walkthrough: a content administrator and a domain expert co-edit the same context for one occupation | Edits by both roles persist and remain retrievable; access limited to staff assigned to that occupation |
| FR-16 | Review, approve, reject, or correct generated scenarios | Domain expert | Walkthrough: an expert approves, rejects, and requests changes on sample scenarios | Unapproved scenarios are never served to explorers |
| FR-17 | Report disagreements between automated and expert judgment | Domain expert | Experts confirm the disagreement list helps them refine grading criteria | Disagreement list matches recomputation over the reference set |
| FR-18 | Play-test a generated scenario before submitting it for formal review, without affecting explorer-facing metrics | Domain expert + Content administrator | Walkthrough: staff play-test a generated scenario before submission | Practice sessions are excluded from every aggregate that measures explorer performance |
| FR-19 | Author grading criteria for a reference item with AI assistance, automatically validated before storage | Domain expert | Experts confirm the stored criteria reflect what they intended | Item is stored only when validation passes; failing items return the reasons |
| FR-20 | Manage the lifecycle of the occupation one is responsible for: create, track status, publish, retire | Content administrator | Walkthrough: a content administrator takes their occupation from draft to published to retired | State transitions follow the defined lifecycle; publication requires completed review; actions on other occupations are refused |
| FR-21 | Create a new occupation and assign it exactly one content administrator and one or more domain experts | System administrator | Walkthrough: a system administrator creates an occupation and assigns its staff | Every occupation carries exactly one content administrator and at least one domain expert once assigned |
| FR-22 | Report coverage and last-validated dates across the entire catalogue | System administrator | A system administrator identifies stale occupations from the report | Report matches stored metadata across all occupations |
| FR-23 | Configure generation and assessment model providers, enforcing separation between the two roles | System administrator | A system administrator changes a provider through the configuration screen | Configuration rejects an identical provider for both roles |
| FR-24 | Monitor usage, cost, and error rates | System administrator | A system administrator uses the monitoring screen to spot cost or error spikes | Metrics present and consistent with generated load |

## Table C — Non-functional requirements

| ID | Non-functional requirement | Category | Business verification | Technical verification |
|---|---|---|---|---|
| NFR-01 | Scenario generation completes within 5 s at the 95th percentile; a progress indicator is shown beyond 2 s | Performance | Usability session: explorers find the wait acceptable and see progress feedback | Latency distribution measured over at least 200 sampled generations |
| NFR-02 | Assessment of a free-text response completes within 8 s at the 95th percentile | Performance | Usability session: explorers find the wait for feedback acceptable | Latency distribution measured over at least 200 sampled assessments |
| NFR-03 | Session progress survives interruption and resumes without loss | Reliability | Acceptance test: an explorer closes the browser mid-scenario, returns, and continues | Forced-interruption tests resume at the recorded position |
| NFR-04 | On model-provider failure, no committed progress is lost and the user is notified within 10 s | Reliability | Explorers receive a clear message and find their progress intact | Fault injection against the provider interface; zero progress-record loss across injected failures |
| NFR-05 | Personal data is collected only as required, stored encrypted, and deletable on request | Security and privacy | Data-protection review against applicable regulation; walkthrough of a deletion request | Data inventory review; encryption check; deletion request removes records |
| NFR-06 | Aggregate statistics apply a minimum-population suppression threshold | Security and privacy | Privacy review confirms small-population figures are withheld and the reason is stated | Aggregates below threshold are withheld |
| NFR-07 | Machine generation and machine assessment are disclosed to the user | Transparency | Pilot users can state that scenarios and assessments are machine-produced | Disclosure present at the point of use in every relevant screen |
| NFR-08 | Interface language and occupational content support Vietnamese and English | Usability | Native speakers review both locales for completeness and accuracy | Both locales render complete content with no missing text |
| NFR-09 | At least 80% of representative readers correctly state a task's objective after reading its scenario | Usability | Comprehension check with a minimum of 20 representative readers | Validator confirms every scenario states an explicit objective in its context |
| NFR-10 | Adding an occupation requires no code modification | Maintainability | A content administrator publishes a new occupation through the authoring interface alone | No code change or redeployment is recorded for the new occupation |
| NFR-11 | Mean model cost per completed session remains within the configured ceiling, with per-session cost recorded | Cost | System administrator reviews cost against the agreed budget | Cost telemetry aggregated per session and compared against the configured ceiling |
| NFR-12 | The model provider is replaceable without changes to authored scenario content | Portability | Domain experts confirm scenario quality is unchanged after a provider switch | Provider substitution test with unchanged content; regression suite passes |

## Table D — Data requirements

| ID | Data requirement | Source | Business verification | Technical verification |
|---|---|---|---|---|
| DR-01 | Occupational reference data: occupations, constituent tasks, work activities, and skills | O*NET and ESCO, adapted for Vietnamese practice by domain experts | Domain experts review the adaptation for Vietnamese practice | Imported records resolve against source identifiers |
| DR-02 | Competency taxonomy with definitions and observable indicators, distinguishing soft and technical competencies | Derived from DR-01 under expert adaptation | Domain experts review definitions and indicators | Every rubric criterion resolves to a taxonomy entry |
| DR-03 | Occupational adjacency relations with overlap measures | Computed from DR-01/DR-02 | Domain experts review computed adjacency for plausibility | Overlap values are reproducible from DR-01/DR-02 |
| DR-04 | Scenario context: required facts, target competencies, narrative skeleton, and occupation-specific generation rules | Content administrator and domain expert(s) responsible for the occupation, co-authoring | Sign-off recorded from both roles before generation | Context schema validation |
| DR-05 | Generated scenario instances with provenance linking to the authored context and the model version used | System | A content administrator traces any served scenario back to its context and model | Every served scenario carries resolvable provenance |
| DR-06 | User profile and progress: competence credit, unlocked levels, occupation history | System | Explorers confirm their progress is shown correctly | Progress reconstructs from stored records |
| DR-07 | Assessment records: response, discrete anchor score, competencies evidenced, feedback, guidance | System | Domain experts audit a sample of assessment records | Records complete for every assessed response |
| DR-08 | Occupation ratings on five attributes, recorded only once the whole occupation is completed | Explorers | Acceptance test of the rating flow after full completion | Ratings exist only for fully completed occupations |
| DR-09 | Expert reference set: scenarios with gold-standard judgments, authored with AI assistance and validated before storage, stratified by difficulty | Domain experts | Inter-expert agreement recorded for the reference set | Set covers the defined difficulty strata; every item passed validation |
| DR-10 | Operational telemetry: latency, cost, error rates, model versions | System | A system administrator answers cost and error questions from the telemetry | Telemetry present and queryable |
| DR-11 | Scenario-level credit cap per user and competency, preventing unlimited gain through replay | System | Acceptance test: replaying a scenario stops adding credit at the cap | Repeated-play test confirms accumulated credit never exceeds the cap |
| DR-12 | Flag distinguishing authoring-time practice attempts from genuine explorer sessions | System | Staff confirm dashboards are unchanged after play-testing | Practice sessions are absent from explorer-facing aggregates |
| DR-13 | AI-generated user description and social-orientation index | System | Pilot users judge the description relevant and not misleading | Description and index update after new sessions and are retrievable |

Personal data within DR-06, DR-07, DR-08, DR-11, DR-12, and DR-13 is subject to the data-protection policies in Section 4.1.4. DR-09 contains no personal data and is retained as a research asset.

**Open item — the five rating attributes (FR-11 / DR-08 / BR-04):** neither the report nor the current design names the five attributes yet; every mention ("five-attribute rating") is generic. This needs to be defined before implementation. A reasonable starting set, drawn from the realistic-job-preview themes already discussed in Chapter 2 (candour about unattractive aspects, work–life balance, task authenticity): *compensation, work intensity/pressure, work–life balance, growth opportunity, and team/culture fit* — but this is a proposal, not something already decided.

## Table E — User stories

**Explorer**
- As an explorer, I want to try the entry level of any occupation without prerequisite, so that I can survey possibilities before committing attention to one.
- As an explorer, I want to be told my role, team, and working context before a task begins, so that my decisions are situated rather than abstract.
- As an explorer, I want to perform tasks that practitioners would recognise, so that what I learn reflects the occupation.
- As an explorer, I want to see the unfavourable aspects of an occupation, so that my impression is not a recruitment pitch.
- As an explorer, I want my response assessed with a result, an explanation, and guidance, so that I understand both the judgment and how to improve.
- As an explorer, I want competencies I have demonstrated to be recorded, so that my progress reflects what I can do rather than time spent.
- As an explorer, I want replaying the same scenario to be capped per skill, so that my progress reflects genuine improvement rather than repetition.
- As an explorer, I want to move to an adjacent occupation when my competencies qualify me, so that I need not restart when exploring related work.
- As an explorer, I want to rate an occupation once I have completed it in full and see how others rated it, so that I can compare my impression with a broader one.
- As an explorer, I want a private record of what I have attempted and demonstrated, including an AI-generated description of myself and a social-orientation index, so that my exploration accumulates into something I can reflect on.

**Domain expert**
- As a domain expert, I want to co-author, together with the occupation's content administrator, the context and generation rules a scenario is produced from, so that generated scenarios remain accurate without either of us working from an incomplete picture.
- As a domain expert, I want to play-test a scenario before it goes to formal review, so that I can catch problems without affecting real users' data.
- As a domain expert, I want to review generated scenarios before publication and reject or correct them, so that inaccurate material does not reach users.
- As a domain expert, I want to see where the automated assessor disagrees with my judgment, so that I can refine the grading criteria.
- As a domain expert, I want to author grading criteria for a reference item with AI assistance, so that building the reference set does not require me to master a rigid format.

**Content administrator**
- As a content administrator, I want to track the occupation I am responsible for through authoring, review, and publication, so that its progress toward the catalogue is managed.
- As a content administrator, I want to co-author the generation context and rules for my occupation together with its domain expert(s), and play-test scenarios before submitting them for review, so that content reaching review has already been checked by the people closest to it.

**System administrator**
- As a system administrator, I want to configure which models perform generation and assessment, so that the required separation between the two roles is enforced and providers can be changed.
- As a system administrator, I want to monitor usage, cost, and failures, so that the service remains operable within budget.
- As a system administrator, I want to create a new occupation and assign it exactly one content administrator and one or more domain experts, so that responsibility for every occupation is always clear.
- As a system administrator, I want to see coverage and last-validated dates across the whole catalogue, so that I can identify stale content wherever it is.
