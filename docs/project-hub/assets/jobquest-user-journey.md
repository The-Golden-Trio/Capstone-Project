# JobQuest — User journeys (converted from the screen flow)

Converted from `vao-nghe-flow-full.excalidraw` (player screens 1–10 and 6b–9b, admin screens A–G), one journey per actor. Each task is one screen or one action on a screen; the screen code from the flow is given in square brackets.

**About the scores:** Mermaid user journeys require a satisfaction score from 1 (frustrating) to 5 (satisfying) for every task. The scores below are **design hypotheses** — where the team expects friction (waiting, fixing errors, filling forms) versus reward (results, unlocks) — not measured data. They should be replaced with real values after usability testing.

## Journey 1 — Explorer

```mermaid
journey
  title Explorer
  section Get started
    Create account: 3: Explorer
    Guardian consent: 2: Explorer
    Sign in: 4: Explorer
  section Get to know me
    Orientation quiz: 4: Explorer
    Result: 5: Explorer
  section Occupation
    Occupation map: 5: Explorer
    Occupation profile: 3: Explorer
    Occupation's level: 4: Explorer
    Level map: 4: Explorer
  section Perform a task
    Read task context: 4: Explorer
    Respond to activity: 4: Explorer
    Handle event: 3: Explorer
    Preview hint: 4: Explorer
  section Wrap up
    View ending: 5: Explorer
    View points, feedback, guidance : 5: Explorer
  section Complete the occupation
    Self rating: 3: Explorer
    See others ratings: 4: Explorer
```

## Journey 2 — Content administrator and Domain expert (scenario authoring)

```mermaid
journey
  title Content administrator and Domain expert
  section Enter
    Sign in: 3: Content admin, Domain expert
    Open dashboard: 4: Content admin, Domain expert
  section Maintain occupation
    Review competencies: 3: Domain expert
    Review adjacency: 3: Domain expert
  section Preparing occupation
    Edit occupation: 3: Content admin
    Define generation rules: 3: Content admin, Domain expert
  section Scenario management
    Scenario List: 4: Content admin
    Generate Scenario: 3: Content admin, Domain expert
  section Review
    Pick a scenario: 3: Domain expert
    Review: 3: Domain expert
    Requested changes: 2: Content admin
  section Publish and maintain
    Publish: 5: Content admin
    Retire: 3: Content admin
    Trace history: 3: Content admin
  section Build the reference set
    Write grading criteria: 4: Domain expert
    AI validates: 3: Domain expert
    AI stores the judgment: 5: Domain expert
```

## Journey 3 — System administrator

```mermaid
---
config:
  journey:
    width: 170
    height: 80
---
journey
  title System administrator
  section Enter
    Sign in: 4: System admin
  section Set up catalogue and people
    Import reference data: 2: System admin
    Create an occupation: 4: System admin
    Manage accounts and roles: 3: System admin
  section Configure AI
    Configure models: 4: System admin
  section Operate
    Observation and Monitoring: 4: System admin
    Review catalogue coverage: 3: System admin
```
