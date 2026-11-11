/**
 * Kiểu sinh từ hợp đồng API `reports/master/api/openapi.yaml`. Không sửa tay.
 *
 * Sinh lại sau khi hợp đồng đổi (chạy ở gốc repo, rồi chép lại khối chú thích này):
 *   npx openapi-typescript@7 reports/master/api/openapi.yaml --default-non-nullable false -o apps/web/src/play/api/openapi.d.ts
 */

export interface paths {
  '/auth/register': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Register an explorer account */
    post: operations['register'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/sign-in': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Sign in with e-mail and password
     * @description Shared sign-in screen for explorers and staff. Disabled accounts are refused.
     */
    post: operations['signIn'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/google': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Sign in with Google
     * @description Exchanges the authorization code, verifies the ID token, then finds or creates the linked account.
     */
    post: operations['signInWithGoogle'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/refresh': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Get a new access token */
    post: operations['refreshSession'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/sign-out': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Sign out and revoke the session */
    post: operations['signOut'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/password-reset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send a single-use password reset link
     * @description Always returns 202 so the response does not reveal whether the e-mail exists.
     */
    post: operations['requestPasswordReset'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/auth/password-reset/confirm': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Set a new password with a reset token */
    post: operations['confirmPasswordReset'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/me': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the signed-in account, top-bar points and quiz status */
    get: operations['getMe'];
    put?: never;
    post?: never;
    /** Delete the explorer account and personal data */
    delete: operations['deleteMe'];
    options?: never;
    head?: never;
    /** Edit account details or password */
    patch: operations['updateMe'];
    trace?: never;
  };
  '/me/record': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the private record of attempts, points and awards */
    get: operations['getMyRecord'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/me/feedback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List end-of-scenario feedback of past attempts */
    get: operations['listMyPastFeedback'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/quiz/questions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the RIASEC questions */
    get: operations['getQuizQuestions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/quiz/attempts': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submit quiz answers and get the portrait and five suggestions
     * @description No AI is used. The profile is calculated from the answers, five occupations are matched by O*NET interest code, and the fixed portrait for the highest-scoring type is returned. A retake replaces the current result.
     */
    post: operations['submitQuiz'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/quiz/attempts/current': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the current quiz result */
    get: operations['getCurrentQuizResult'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/occupations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the Galaxy Map */
    get: operations['listOccupations'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/occupations/{occupationId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /** Get an occupation profile with downsides, career path and ratings */
    get: operations['getOccupationProfile'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/occupations/{occupationId}/levels/{levelNo}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
        levelNo: components['parameters']['LevelNo'];
      };
      cookie?: never;
    };
    /**
     * Get a level description and the caller's access
     * @description The entry level is always open (FR-06). A higher level is open when unlocked or offered through adjacency (FR-07).
     */
    get: operations['getLevel'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/enrolments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Enrol in a level */
    post: operations['enrol'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/enrolments/{enrolmentId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        enrolmentId: string;
      };
      cookie?: never;
    };
    /** Get the Island Map of an enrolment */
    get: operations['getIslandMap'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Start or resume a main quest
     * @description Resumes the run in progress for the same task if one exists (NFR-03). An unavailable scenario returns 409 SCENARIO_UNAVAILABLE and the app returns to the Island Map.
     */
    post: operations['startRun'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    /** Get a run with its intro, release version and saved position */
    get: operations['getRun'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/activity': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    /**
     * Open the current activity
     * @description Returns the activity, its NPC and, when the system rolls one, a random event shown as the activity opens.
     */
    get: operations['getCurrentActivity'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/answers': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submit an answer to an activity, follow-up or random event
     * @description The client creates `answerId`; posting the same id again returns the stored result (NFR-04).
     *     - Closed answers are scored at once from the expert option scores (0 / 1 / 2, never penalised) → `200`.
     *     - Free-text answers are stored and queued for the three-judge panel → `202`. The level, any counterproductive flag, any follow-up and the closing line arrive on `/stream`.
     *     - An answer that breaks the activity rules → `422 ANSWER_INVALID` with reasons.
     */
    post: operations['submitAnswer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/hints': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * View the hint of the current activity
     * @description Records that the hint was viewed. A viewed hint never lowers the activity score (FR-13).
     */
    post: operations['viewHint'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/flags': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Flag wrong content in an activity */
    post: operations['flagContent'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/finish': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Finish the scenario and get the summary
     * @description Picks the ending from the total activity score, combines the hidden feedback notes, caps competency points and checks the level threshold. If notes are still being drafted, returns 202 and pushes `summary.ready` on the stream.
     */
    post: operations['finishRun'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/runs/{runId}/summary': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    /** Get the result, feedback and guidance of a finished run */
    get: operations['getRunSummary'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/side-quests/{sideQuestId}/attempts': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        sideQuestId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Answer a side quest for bonus points */
    post: operations['answerSideQuest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/occupations/{occupationId}/ratings': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Rate an occupation after completing every level */
    post: operations['rateOccupation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/occupations/{occupationId}/ratings/form': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /**
     * Get the rating form, or why it is locked
     * @description Returns `eligible: false` with a reason while some level is not completed or the explorer has already rated (AD-01e).
     */
    get: operations['getRatingForm'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/app-feedback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send feedback about the app */
    post: operations['sendAppFeedback'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/stream': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Open the event stream (Server-Sent Events)
     * @description One stream per open screen that waits for results. Event types:
     *     `answer.graded`, `followup.asked`, `activity.closed`, `provider.delay`, `summary.ready` (explorers);
     *     `generation.ready`, `revision.ready`, `suggestions.ready`, `asset.ready`, `draft.ready`, `review.outcome`, `findings.reported`, `import.finished` (staff); `job.finished` (re-run of a failed job, AI regrade of blind samples).
     *     The `id` field lets the browser resume with `Last-Event-ID`.
     *     Because the browser `EventSource` cannot send an `Authorization` header, clients open the stream with `fetch` and read the body as a stream.
     *
     *     Opened only by the screens that wait for AI or job results (E11, E12, C03, C06, C07, D03, D05, D07, A05) and closed when the screen is left; other screens use `GET /staff/notifications`.
     */
    get: operations['openEventStream'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/domains': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List domains */
    get: operations['listDomains'];
    put?: never;
    /** Create a domain */
    post: operations['createDomain'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/domains/{domainId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        domainId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete an empty domain */
    delete: operations['deleteDomain'];
    options?: never;
    head?: never;
    /** Rename a domain */
    patch: operations['updateDomain'];
    trace?: never;
  };
  '/staff/occupations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List occupations the caller is assigned to */
    get: operations['listMyOccupations'];
    put?: never;
    /** Create an occupation (draft) */
    post: operations['createOccupation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Edit occupation name, summary, domain or interest code */
    patch: operations['updateOccupation'];
    trace?: never;
  };
  '/staff/occupations/{occupationId}/publish': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Publish an occupation on the Galaxy Map
     * @description Refused unless every level has a description and at least one published scenario exists.
     */
    post: operations['publishOccupation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/retire': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Retire an occupation */
    post: operations['retireOccupation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/imports': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Upload O*NET or ESCO files and start an import */
    post: operations['startImport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/imports/{importId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
      };
      cookie?: never;
    };
    /** Get an import with every record, unresolved ones first */
    get: operations['getImport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/imports/{importId}/records/{recordId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
        recordId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Fix, skip or adapt an imported record */
    patch: operations['fixImportRecord'];
    trace?: never;
  };
  '/staff/imports/{importId}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Save the adapted data into the catalogue and notify the domain experts
     * @description Allowed once the import job has succeeded and no record is left unresolved and unskipped; returns the import summary (AD-02c, SD-09).
     */
    post: operations['completeImport'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/review-criteria': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /** Get the current review criteria */
    get: operations['getReviewCriteria'];
    put?: never;
    /** Save a new version of the review criteria */
    post: operations['createReviewCriteriaVersion'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/statistics': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /**
     * Get play statistics, ratings, coverage and grading agreement
     * @description Play-test runs are excluded (DR-11); ratings below the threshold are withheld (NFR-06).
     */
    get: operations['getOccupationStatistics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/profile': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /** Get the editable occupation profile */
    get: operations['getOccupationProfileForEdit'];
    /**
     * Save levels, descriptions, downsides, salary, generation rules and competencies
     * @description Only domain experts assigned to the occupation may save. Related occupations are recalculated after saving; links with too few shared skills are hidden.
     */
    put: operations['saveOccupationProfile'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List scenarios of the caller's occupations */
    get: operations['listScenarios'];
    put?: never;
    /**
     * Open an empty scenario for a task
     * @description Refused with 409 ACTIVE_SCENARIO_EXISTS if the task already has a scenario that is not retired.
     */
    post: operations['openScenario'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** Get a scenario with its content, assignment and status */
    get: operations['getScenario'];
    put?: never;
    post?: never;
    /**
     * Delete a scenario by retiring it
     * @description Retires the scenario, keeps its play history and frees the task slot. Published content is never edited.
     */
    delete: operations['deleteScenario'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/assignment': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    /**
     * Assign the author, the reviewer and the review deadline
     * @description The reviewer must be a different domain expert of the same occupation (422 REVIEWER_IS_AUTHOR). The author is notified.
     */
    put: operations['assignScenarioStaff'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/situation-options': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** Get situation options built from the level data */
    get: operations['getSituationOptions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/generations': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** Get the generation history with context, model, cost and check result */
    get: operations['listGenerations'];
    put?: never;
    /** Generate scenario content from the author's context */
    post: operations['requestGeneration'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/revisions': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Ask the AI to revise one part of the content */
    post: operations['requestRevision'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/content': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    /**
     * Save allowed task types, option scores, rubric, hints, random events, side quests and endings
     * @description Allowed only in DRAFT and only for the assigned author; scenario content is written by the Domain Expert alone. Uses `If-Match` with the scenario version to prevent lost updates.
     */
    put: operations['saveScenarioContent'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/reference-answers': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** List the author's sample answers */
    get: operations['listReferenceAnswers'];
    put?: never;
    /** Add a sample answer with expert scores */
    post: operations['addReferenceAnswer'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/checks': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Run the automatic content checks */
    post: operations['runContentChecks'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/submit': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Submit the scenario for review
     * @description DRAFT → SUBMITTED when the checks pass; otherwise 422 with the check report. The reviewer is notified.
     */
    post: operations['submitScenario'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/history': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** Get the lifecycle log, assignments and review decisions */
    get: operations['getScenarioHistory'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/reviews': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the caller's review queue (reviews and revalidations) */
    get: operations['listMyReviewQueue'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/review': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /**
     * Open an assigned scenario for review
     * @description SUBMITTED → IN_REVIEW on first open. Refused if the caller is the author or not the assigned reviewer.
     */
    get: operations['openScenarioForReview'];
    put?: never;
    /**
     * Approve, request changes or reject
     * @description Every criterion must be answered (422 CRITERIA_MISSING). Approve → APPROVED; request changes → DRAFT; reject → RETIRED.
     */
    post: operations['decideReview'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/review-assignments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List review assignments, e.g. overdue ones */
    get: operations['listReviewAssignments'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/review-assignments/{assignmentId}/reassign': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        assignmentId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Reassign an overdue review with a new deadline */
    post: operations['reassignReview'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/revalidations': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Send a published scenario back to the review queue
     * @description The scenario stays published and playable meanwhile.
     */
    post: operations['requestRevalidation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/replacement-requests': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Ask the Content Admin to replace a scenario whose rubric needs changing
     * @description Stored as a revalidation with reason RELIABILITY_CHECK and outcome OUTDATED; the Content Admin is notified. The scenario stays playable (AD-03c).
     */
    post: operations['requestReplacement'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/revalidations/{revalidationId}/result': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        revalidationId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Record the revalidation result
     * @description OUTDATED notifies the content admin to replace the scenario.
     */
    post: operations['recordRevalidation'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/presentation-suggestions': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Ask the AI to suggest task types, NPCs and backgrounds */
    post: operations['requestPresentationSuggestions'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/presentation': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    /** Get the current presentation choices */
    get: operations['getPresentation'];
    /**
     * Save task types, NPC images and scenes
     * @description A task type outside the domain expert's allowed set is refused (422 TASK_TYPE_NOT_ALLOWED). Content text is read-only here.
     */
    put: operations['savePresentation'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/assets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Browse the asset library (bias check passed) */
    get: operations['listAssets'];
    put?: never;
    /** Upload a licensed asset for bias check */
    post: operations['uploadAsset'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/assets/generations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Ask the AI to generate a missing asset
     * @description The image enters the library only after its bias check passes.
     */
    post: operations['generateAsset'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/builds': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Build the draft game and invite the author to play-test
     * @description APPROVED → IN_PLAYTEST. Freezes the approved content and presentation into a build.
     */
    post: operations['buildDraftGame'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/builds/{buildId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    /** Get the frozen game content of a build (run by game-core in the Staff app) */
    get: operations['getBuild'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/builds/{buildId}/playtest-runs': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Start a play-test run
     * @description The run is flagged as play-test and excluded from explorer aggregates. It then uses the `/runs/{runId}/*` endpoints.
     */
    post: operations['startPlaytestRun'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/builds/{buildId}/findings': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Report play-test findings
     * @description DISPLAY findings return the scenario to APPROVED for the content admin; CONTENT findings return it to DRAFT for the author and a new review.
     */
    post: operations['reportPlaytestFindings'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/builds/{buildId}/pass': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Confirm the content is final after play-test
     * @description IN_PLAYTEST → READY. The content admin is notified.
     */
    post: operations['passPlaytest'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/scenarios/{scenarioId}/release': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Publish the play-tested build
     * @description Allowed only in READY. The build is compared with the approved content (NFR-15), stored by version in object storage and served by the CDN. A later effective date keeps the scenario READY until the scheduler publishes it.
     */
    post: operations['publishScenario'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/flags': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List content flagged by explorers */
    get: operations['listContentFlags'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/flags/{flagId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        flagId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Resolve or dismiss a flag */
    patch: operations['handleContentFlag'];
    trace?: never;
  };
  '/staff/occupations/{occupationId}/blind-samples': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /**
     * Get reference samples to rate blind
     * @description AI scores and other experts' ratings are never included.
     */
    get: operations['getBlindSamples'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/blind-ratings': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Submit blind ratings; the AI then regrades the samples */
    post: operations['submitBlindRatings'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/agreement-report': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /** Get AI–expert agreement and the disagreement list */
    get: operations['getAgreementReport'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/system-prompts': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /**
     * List the system prompts in force for each AI task of the occupation
     * @description One entry per kind; `versionNo: 0` means the built-in default is in force.
     */
    get: operations['listSystemPrompts'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/occupations/{occupationId}/system-prompts/{kind}/versions': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
        kind: components['schemas']['PromptKind'];
      };
      cookie?: never;
    };
    /** List every saved version of one system prompt, newest first */
    get: operations['listSystemPromptVersions'];
    put?: never;
    /**
     * Save a new version of a system prompt (or restore an older one)
     * @description The new version is in force for AI jobs queued after the save; jobs record the version they used. Returns 409 when `baseVersionNo` is not the latest version.
     */
    post: operations['saveSystemPrompt'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/staff/notifications': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List in-app notifications */
    get: operations['listNotifications'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List accounts (explorers and staff) */
    get: operations['listUsers'];
    put?: never;
    /** Create a staff account and send an invitation */
    post: operations['createStaffAccount'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/users/{userId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: components['parameters']['UserId'];
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /**
     * Delete an account
     * @description Explorer data is removed (NFR-05); staff accounts are anonymised so authored records stay.
     */
    delete: operations['deleteUser'];
    options?: never;
    head?: never;
    /** Disable or enable an account, or change its roles */
    patch: operations['updateUser'];
    trace?: never;
  };
  '/admin/users/{userId}/activity': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: components['parameters']['UserId'];
      };
      cookie?: never;
    };
    /** View an account's activity log */
    get: operations['getUserActivity'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/occupations': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List every occupation with its content admin and domain expert count */
    get: operations['listOccupationsForStaffing'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/occupations/{occupationId}/staff': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    /** Get the content admin and domain experts of an occupation */
    get: operations['getOccupationStaff'];
    /**
     * Assign or reassign the content admin and domain experts
     * @description Exactly one content admin and at least one domain expert. Changing the content admin moves its pending work to the new one.
     */
    put: operations['setOccupationStaff'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/metrics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get usage, cost per session and error metrics */
    get: operations['getMetrics'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/ai-jobs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List AI jobs, e.g. failed ones with their cause */
    get: operations['listAiJobs'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/ai-jobs/{jobId}/rerun': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Re-run a failed AI job */
    post: operations['rerunAiJob'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/app-feedback': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List app feedback */
    get: operations['listAppFeedback'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/admin/app-feedback/{feedbackId}': {
    parameters: {
      query?: never;
      header?: never;
      path: {
        feedbackId: string;
      };
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Mark feedback as handled */
    patch: operations['markAppFeedback'];
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description RFC 9457 Problem Details */
    Problem: {
      /** Format: uri-reference */
      type: string;
      title: string;
      status: number;
      detail?: string;
      /** @example SCENARIO_UNAVAILABLE */
      code: string;
      errors?: {
        field?: string;
        reason?: string;
      }[];
    };
    Page: {
      items: unknown[];
      nextCursor?: string | null;
    };
    JobAccepted: {
      /** Format: uuid */
      jobId: string;
      /** Format: uuid */
      answerId?: string;
      /** @description Event type that will carry the result */
      streamEvent?: string;
    };
    /** @enum {string} */
    Role: 'EXPLORER' | 'DOMAIN_EXPERT' | 'CONTENT_ADMIN' | 'SYSTEM_ADMIN';
    /** @enum {string} */
    ScenarioStatus:
      | 'DRAFT'
      | 'SUBMITTED'
      | 'IN_REVIEW'
      | 'APPROVED'
      | 'IN_PLAYTEST'
      | 'READY'
      | 'PUBLISHED'
      | 'RETIRED';
    /** @enum {string} */
    TaskType: 'FREE_TEXT' | 'CHOICE' | 'ORDERING' | 'PRIORITIZING';
    /** @enum {string} */
    RiasecType: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
    /** @enum {string} */
    ReferenceSource: 'ONET' | 'ESCO';
    /**
     * @description Rubric level (D-116) — 0 not yet, 1 meets, 2 done well
     * @enum {integer}
     */
    Score: 0 | 1 | 2;
    /** @description Rubric level, or null when the criterion does not apply; null levels are left out of averages (D-116) */
    ScoreOrNotApplicable: components['schemas']['Score'] | null;
    RegisterInput: {
      /** Format: email */
      email: string;
      password: string;
      displayName: string;
    };
    SignInInput: {
      /** Format: email */
      email: string;
      password: string;
    };
    Session: {
      accessToken: string;
      refreshToken: string;
      /** @description Seconds */
      expiresIn: number;
      user: components['schemas']['Me'];
    };
    Me: {
      /** Format: uuid */
      id?: string;
      /** Format: email */
      email?: string;
      displayName?: string;
      roles?: components['schemas']['Role'][];
      hasGoogle?: boolean;
      quizDone?: boolean;
      points?: {
        expertise?: number;
        softSkill?: number;
        sideQuest?: number;
      };
    };
    UpdateMeInput: {
      displayName?: string;
      currentPassword?: string;
      newPassword?: string;
    };
    PrivateRecord: {
      attempts?: {
        /** Format: uuid */
        runId?: string;
        occupation?: string;
        levelNo?: number;
        scenarioTitle?: string;
        /** Format: date-time */
        finishedAt?: string;
        /** @enum {string} */
        endingType?: 'GOOD' | 'PARTIAL' | 'BAD' | 'SECRET';
      }[];
      competencies?: {
        competency?: string;
        /** @enum {string} */
        kind?: 'EXPERTISE' | 'SOFT_SKILL';
        points?: number;
      }[];
      awards?: {
        code?: string;
        /** Format: date-time */
        awardedAt?: string;
      }[];
    };
    QuizQuestion: {
      /** Format: uuid */
      id?: string;
      text?: string;
      scale?: {
        min?: number;
        max?: number;
      };
    };
    QuizResult: {
      /**
       * @example {
       *       "R": 12,
       *       "I": 18,
       *       "A": 9,
       *       "S": 15,
       *       "E": 11,
       *       "C": 7
       *     }
       */
      scores?: {
        [key: string]: number;
      };
      topType?: components['schemas']['RiasecType'];
      socialIndex?: number;
      portrait?: {
        text?: string;
        /** @constant */
        selfReported?: true;
      };
      suggestions?: {
        /** Format: uuid */
        occupationId?: string;
        name?: string;
        riasecCode?: string;
      }[];
    };
    DomainOnMap: {
      /** Format: uuid */
      id?: string;
      name?: string;
      occupations?: {
        /** Format: uuid */
        id?: string;
        name?: string;
        summary?: string;
        /** @description Highest level completed */
        myProgress?: number;
      }[];
    };
    OccupationProfile: {
      /** Format: uuid */
      id?: string;
      name?: string;
      summary?: string;
      downsides?: string[];
      careerPath?: {
        levelNo?: number;
        title?: string;
        description?: string;
        futureRole?: string;
        salary?: {
          min?: number;
          max?: number;
          currency?: string;
        };
        /** @enum {string} */
        access?: 'OPEN' | 'LOCKED' | 'ENROLLED' | 'COMPLETED';
      }[];
      ratings?: components['schemas']['RatingSummary'];
      /** @description Shown where content or grading is AI-produced (NFR-07) */
      aiDisclosure?: string;
    };
    LevelView: {
      /** Format: uuid */
      id?: string;
      levelNo?: number;
      title?: string;
      description?: string;
      /** @enum {string} */
      access?: 'OPEN' | 'LOCKED' | 'ENROLLED' | 'COMPLETED';
      /** @enum {string} */
      accessReason?: 'ENTRY' | 'UNLOCKED' | 'ADJACENT' | 'NONE';
      /** Format: uuid */
      enrolmentId?: string | null;
    };
    IslandMap: {
      /** Format: uuid */
      enrolmentId?: string;
      level?: components['schemas']['LevelView'];
      credit?: number;
      creditThreshold?: number;
      mainQuests?: {
        /** Format: uuid */
        taskId?: string;
        title?: string;
        available?: boolean;
        bestEnding?: string | null;
        /** Format: uuid */
        inProgressRunId?: string | null;
      }[];
      sideQuests?: {
        /** Format: uuid */
        sideQuestId?: string;
        prompt?: string;
        taskType?: components['schemas']['TaskType'];
        points?: number;
        done?: boolean;
      }[];
      /** @description Tasks for missing competencies when below the threshold */
      suggestedTasks?: string[];
    };
    Run: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      status?: 'IN_PROGRESS' | 'FINISHED' | 'ABANDONED';
      isPlaytest?: boolean;
      /** @description Version key of the release file on the CDN */
      releaseVersion?: string;
      intro?: string;
      /** @description Role, team and goal; opened on request (FR-09) */
      context?: {
        role?: string;
        team?: string;
        situation?: string;
        stakes?: string;
      };
      currentActivityKey?: string | null;
      /** Format: date-time */
      startedAt?: string;
    };
    ActivityView: {
      activityKey?: string;
      taskType?: components['schemas']['TaskType'];
      setup?: string;
      npc?: {
        npcKey?: string;
        name?: string;
        /** Format: uri */
        avatarUrl?: string;
        line?: string;
      };
      inputPrompt?: string;
      /** @description Options for CHOICE, steps for ORDERING, items for PRIORITIZING (without scores) */
      items?: {
        key?: string;
        text?: string;
        note?: string;
      }[];
      pickCount?: number;
      hintAvailable?: boolean;
      randomEvent?: {
        /** Format: uuid */
        randomEventId?: string;
        text?: string;
        prompt?: string;
      } | null;
    };
    AnswerInput: {
      /**
       * Format: uuid
       * @description Created by the client; makes retries safe
       */
      answerId: string;
      activityKey: string;
      /** @default 0 */
      followupNo?: number;
      /**
       * Format: uuid
       * @description Set when answering a random event
       */
      randomEventId?: string;
      /** @description FREE_TEXT answer */
      text?: string;
      /** @description CHOICE → one key; ORDERING → keys in order; PRIORITIZING → picked keys */
      selection?: string | string[];
    };
    /** @description Result of a closed answer, scored from the expert option scores; closed answers are never penalised */
    AnswerResult: {
      /** Format: uuid */
      answerId?: string;
      score?: components['schemas']['Score'];
      /** @description The hint was viewed; recorded only, it does not lower the score (FR-13) */
      hintUsed?: boolean;
      npcResponse?: string;
      closingLine?: string;
      nextActivityKey?: string | null;
    };
    /** @description Result, feedback and guidance kept separate (FR-14) */
    ScenarioSummary: {
      /** Format: uuid */
      runId?: string;
      scenarioTitle?: string;
      ending?: {
        /** @enum {string} */
        type?: 'GOOD' | 'PARTIAL' | 'BAD' | 'SECRET';
        text?: string;
        reveals?: string | null;
      };
      result?: string;
      feedback?: string;
      guidance?: string;
      pointsEarned?: {
        expertise?: number;
        softSkill?: number;
      };
      hintsUsed?: number;
      levelUnlocked?: boolean;
      suggestedTasks?: string[];
      /** Format: date-time */
      finishedAt?: string;
    };
    /** @description Data part of one SSE message */
    StreamEvent: {
      /** @enum {string} */
      type:
        | 'answer.graded'
        | 'followup.asked'
        | 'activity.closed'
        | 'provider.delay'
        | 'summary.ready'
        | 'generation.ready'
        | 'revision.ready'
        | 'suggestions.ready'
        | 'asset.ready'
        | 'draft.ready'
        | 'review.outcome'
        | 'findings.reported'
        | 'import.finished'
        | 'job.finished';
      /** Format: uuid */
      jobId?: string;
      /** Format: uuid */
      runId?: string;
      /** Format: uuid */
      scenarioId?: string;
      /**
       * @example {
       *       "followupNo": 1,
       *       "question": "Bạn sẽ báo cáo cho ai trước?"
       *     }
       */
      payload?: Record<string, never>;
    };
    RatingInput: {
      /** @description Five attributes (project-defined), each 1–5 */
      scores: {
        [key: string]: number;
      };
      comment?: string;
    };
    RatingSummary: {
      responseCount?: number;
      /** @description True below the minimum population (NFR-06) */
      withheld?: boolean;
      averages?: {
        [key: string]: number;
      };
    };
    Domain: {
      /** Format: uuid */
      id?: string;
      code?: string;
      name?: string;
      occupationCount?: number;
    };
    DomainInput: {
      code: string;
      name: string;
    };
    StaffOccupation: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      domainId?: string;
      code?: string;
      name?: string;
      /** @enum {string} */
      status?: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
      /** @enum {string} */
      myRole?: 'CONTENT_ADMIN' | 'DOMAIN_EXPERT';
    };
    OccupationInput: {
      /** Format: uuid */
      domainId: string;
      code: string;
      riasecCode?: string;
      name: string;
      summary?: string;
    };
    ImportJob: {
      /** Format: uuid */
      id?: string;
      source?: components['schemas']['ReferenceSource'];
      /** @enum {string} */
      status?: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
      unresolvedCount?: number;
      /** @description Every imported record; unresolved ones first */
      records?: components['schemas']['ImportRecord'][];
      /** Format: date-time */
      completedAt?: string | null;
    };
    ReviewCriteria: {
      versionNo?: number;
      criteria?: {
        /** Format: uuid */
        criterionId?: string;
        text?: string;
      }[];
    };
    OccupationStatistics: {
      plays?: number;
      completionRate?: number;
      averageScoreByScenario?: {
        /** Format: uuid */
        scenarioId?: string;
        title?: string;
        average?: number;
        flags?: number;
      }[];
      ratings?: components['schemas']['RatingSummary'];
      coverage?: {
        tasksWithPublishedScenario?: number;
        tasksTotal?: number;
        referenceSamples?: number;
      };
      /** @description Latest Cohen's kappa (NFR-14) */
      gradingAgreement?: number | null;
    };
    ProfileEdit: {
      levels?: {
        levelNo: number;
        band: string;
        creditThreshold: number;
        salaryMin?: number;
        salaryMax?: number;
        title: string;
        description: string;
        futureRole?: string;
        competencies?: {
          /** Format: uuid */
          competencyId?: string;
          /** @enum {string} */
          proficiency?: 'FAMILIAR' | 'PROFICIENT' | 'EXPERT';
        }[];
        tasks?: {
          /** Format: uuid */
          taskId?: string;
          text?: string;
        }[];
      }[];
      downsides?: string[];
      generationRules?: string[];
      readonly adjacency?: {
        /** Format: uuid */
        occupationId?: string;
        overlap?: number;
        maxStartLevelNo?: number;
        isVisible?: boolean;
      }[];
    };
    ScenarioListItem: {
      /** Format: uuid */
      id?: string;
      taskTitle?: string;
      /** Format: uuid */
      occupationId?: string;
      levelNo?: number;
      status?: components['schemas']['ScenarioStatus'];
      authorName?: string | null;
      reviewerName?: string | null;
      /** Format: date-time */
      reviewDeadline?: string | null;
      /** Format: date-time */
      updatedAt?: string;
    };
    ScenarioDetail: components['schemas']['ScenarioListItem'] & {
      /** @description ETag for If-Match */
      version?: string;
      /** @description SM-01 actions the caller may take now */
      allowedActions?: string[];
      authorContext?: string;
      content?: components['schemas']['ScenarioContent'];
      assignment?: components['schemas']['Assignment'];
      eligibleExperts?: {
        /** Format: uuid */
        userId?: string;
        displayName?: string;
      }[];
    };
    AssignmentInput: {
      /** Format: uuid */
      authorId: string;
      /** Format: uuid */
      reviewerId: string;
      /** Format: date-time */
      deadlineAt: string;
    };
    Assignment: {
      /** Format: uuid */
      assignmentId?: string;
      /** Format: uuid */
      scenarioId?: string;
      /** Format: uuid */
      authorId?: string;
      /** Format: uuid */
      reviewerId?: string;
      /** Format: date-time */
      deadlineAt?: string;
      /** @enum {string} */
      status?: 'ACTIVE' | 'COMPLETED' | 'REASSIGNED';
      overdue?: boolean;
    };
    SituationOptions: {
      band?: string;
      archetypes?: (
        | 'S_EXEC'
        | 'S_AMBIG'
        | 'S_INCIDENT'
        | 'S_CONFLICT'
        | 'S_REVIEW'
        | 'S_DECISION'
      )[];
      companyTypes?: (
        'OUTSOURCING' | 'PRODUCT_LOCAL' | 'ENTERPRISE_BANK' | 'BIGTECH_FDI'
      )[];
      skills?: {
        /** Format: uuid */
        competencyId?: string;
        name?: string;
        /** @enum {string} */
        kind?: 'EXPERTISE' | 'SOFT_SKILL';
      }[];
    };
    GenerationInput: {
      context: string;
      archetype: string;
      companyType: string;
      competencyIds: string[];
    };
    GenerationRun: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      kind?: 'GENERATE' | 'REVISE' | 'SUGGEST_PRESENTATION' | 'GENERATE_ASSET';
      model?: string;
      costUsd?: number;
      checkPassed?: boolean | null;
      /** Format: date-time */
      createdAt?: string;
      requestedBy?: string;
    };
    /** @description Scenario content, written only by the assigned author Domain Expert */
    ScenarioContent: {
      intro?: string;
      situation?: string;
      stakes?: string;
      estimatedMinutes?: number;
      cast?: {
        npcKey?: string;
        /** @description Name shown above the NPC line; roleInScene is shown when empty */
        name?: string;
        roleInScene?: string;
        pressure?: string;
        voice?: string;
      }[];
      activities?: {
        key: string;
        isOrigin?: boolean;
        forwardTo?: string | null;
        setup?: string;
        npcLine?: string;
        inputPrompt: string;
        jobScope: string;
        closingLine: string;
        allowedTypes: components['schemas']['TaskType'][];
        /** @description Closed options with expert scores; closed answers are never penalised */
        items?: {
          key?: string;
          text?: string;
          score?: components['schemas']['Score'];
          why?: string;
          correctPosition?: number;
          /** @enum {string} */
          pickRule?: 'MUST' | 'SHOULD' | 'MUST_NOT' | 'NEUTRAL';
          note?: string;
        }[];
        followupLimit?: number;
        followupGoal?: string;
        defaultFollowup?: string;
        /** @description NPC lines; viewing one never lowers the score (FR-13) */
        hints?: string[];
        /** @description What the judges observe in free-text answers (D-116) */
        rubric: {
          /** Format: uuid */
          competencyId: string;
          /** @description Observable behaviour for level 2 (done well) */
          anchor2: string;
          /** @description Observable behaviour for level 1 (meets) */
          anchor1: string;
          /** @description Observable behaviour for level 0 (not yet) */
          anchor0: string;
          /** @description Behaviour that raises the counterproductive flag, e.g. blaming or insulting; the flag is kept apart from the level and costs the band penalty */
          counterproductiveSigns?: string;
        }[];
      }[];
      randomEvents?: {
        activityKey: string;
        chance: number;
        text: string;
        prompt: string;
        /** Format: uuid */
        targetCompetencyId: string;
        /** @description Observable behaviour for level 2; the judges grade the event answer against it */
        anchor2: string;
        anchor1: string;
        anchor0: string;
        counterproductiveSigns?: string;
      }[];
      endings?: {
        /** @enum {string} */
        type?: 'GOOD' | 'PARTIAL' | 'BAD' | 'SECRET';
        priority?: number;
        minTotalScore?: number | null;
        extraBehaviour?: string | null;
        text?: string;
        reveals?: string | null;
      }[];
      sideQuests?: {
        prompt?: string;
        taskType?: components['schemas']['TaskType'];
        points?: number;
        answerKey?: unknown;
      }[];
    };
    ReferenceAnswer: {
      /** Format: uuid */
      readonly id?: string;
      activityKey: string;
      answerText: string;
      /** @enum {string} */
      stratum: 'EASY' | 'MEDIUM' | 'HARD';
      scores: {
        /** Format: uuid */
        criterionId: string;
        score: components['schemas']['ScoreOrNotApplicable'];
        /**
         * @description The expert raises the counterproductive flag on this sample
         * @default false
         */
        counterproductive?: boolean;
      }[];
    };
    CheckReport: {
      passed?: boolean;
      failedRules?: {
        /** @example ONE_ORIGIN_ACTIVITY */
        rule?: string;
        path?: string;
        message?: string;
      }[];
    };
    LifecycleEntry: {
      /** Format: date-time */
      at?: string;
      actor?: string;
      action?: string;
      fromStatus?: string | null;
      toStatus?: components['schemas']['ScenarioStatus'];
      note?: string | null;
    };
    ReviewQueueItem: {
      /** @enum {string} */
      kind?: 'REVIEW' | 'REVALIDATION';
      /** Format: uuid */
      scenarioId?: string;
      title?: string;
      /** Format: date-time */
      deadlineAt?: string | null;
      /** Format: uuid */
      revalidationId?: string | null;
    };
    ReviewView: {
      scenario?: components['schemas']['ScenarioDetail'];
      criteria?: components['schemas']['ReviewCriteria'];
      previousReviews?: {
        decision?: string;
        comment?: string;
        /** Format: date-time */
        decidedAt?: string;
      }[];
    };
    ReviewDecisionInput: {
      /** @enum {string} */
      decision: 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
      comment?: string;
      answers: {
        /** Format: uuid */
        criterionId: string;
        /** @enum {string} */
        verdict: 'MET' | 'NOT_MET';
        comment?: string;
      }[];
    };
    Revalidation: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      scenarioId?: string;
      /** @enum {string} */
      reason?: 'REQUESTED' | 'FLAGGED_CONTENT' | 'RELIABILITY_CHECK';
      /** @enum {string|null} */
      outcome?: 'STILL_ACCURATE' | 'OUTDATED' | null;
      comment?: string | null;
      /** Format: date-time */
      createdAt?: string;
    };
    Presentation: {
      /** Format: uuid */
      backgroundAssetId?: string | null;
      activities?: {
        activityKey: string;
        taskType: components['schemas']['TaskType'];
        /** Format: uuid */
        sceneAssetId?: string | null;
      }[];
      npcs?: {
        npcKey: string;
        /** Format: uuid */
        avatarAssetId: string;
      }[];
    };
    Asset: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      kind?: 'NPC' | 'BACKGROUND' | 'SCENE' | 'ICON';
      /** Format: uri */
      url?: string;
      /** @enum {string} */
      source?: 'LIBRARY' | 'LICENSED' | 'AI_GENERATED';
      sourceNote?: string;
      /** @enum {string} */
      biasCheck?: 'PENDING' | 'PASSED' | 'FAILED';
    };
    Build: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      scenarioId?: string;
      contentHash?: string;
      /** Format: date-time */
      builtAt?: string;
      /** @description Frozen game content read by game-core */
      content?: Record<string, never>;
    };
    Release: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      scenarioId?: string;
      /** Format: uuid */
      buildId?: string;
      version?: string;
      /** Format: date-time */
      effectiveFrom?: string;
      releaseNote?: string;
      /** @enum {string} */
      status?: 'READY' | 'PUBLISHED';
    };
    ContentFlag: {
      /** Format: uuid */
      id?: string;
      /** Format: uuid */
      scenarioId?: string;
      activityKey?: string;
      reason?: string;
      /** @enum {string} */
      status?: 'OPEN' | 'IN_REVALIDATION' | 'RESOLVED' | 'DISMISSED';
      /** Format: date-time */
      createdAt?: string;
    };
    BlindSample: {
      /** Format: uuid */
      referenceAnswerId?: string;
      activityPrompt?: string;
      answerText?: string;
      criteria?: {
        /** Format: uuid */
        criterionId?: string;
        anchor2?: string;
        anchor1?: string;
        anchor0?: string;
        counterproductiveSigns?: string | null;
      }[];
    };
    BlindRatingInput: {
      /** Format: uuid */
      referenceAnswerId: string;
      /** Format: uuid */
      criterionId: string;
      score: components['schemas']['Score'];
      /** @default false */
      counterproductive?: boolean;
    };
    AgreementReport: {
      modelConfigVersion?: number;
      byStratum?: {
        /** @enum {string} */
        stratum?: 'EASY' | 'MEDIUM' | 'HARD';
        samples?: number;
        aiExpertKappa?: number;
        interExpertKappa?: number;
      }[];
      disagreements?: {
        /** Format: uuid */
        scenarioId?: string;
        activityKey?: string;
        /** Format: uuid */
        referenceAnswerId?: string;
        /** Format: uuid */
        criterionId?: string;
        expertScore?: components['schemas']['ScoreOrNotApplicable'];
        aiScore?: components['schemas']['ScoreOrNotApplicable'];
        expertCounterproductive?: boolean;
        aiCounterproductive?: boolean;
      }[];
    };
    Notification: {
      /** Format: uuid */
      id?: string;
      /** @example REVIEW_ASSIGNED */
      template?: string;
      payload?: Record<string, never>;
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      readAt?: string | null;
    };
    UserAdminView: {
      /** Format: uuid */
      id?: string;
      email?: string | null;
      displayName?: string;
      roles?: components['schemas']['Role'][];
      /** @enum {string} */
      status?: 'ACTIVE' | 'DISABLED' | 'DELETED';
      /** Format: date-time */
      createdAt?: string;
      /** Format: date-time */
      lastSignInAt?: string | null;
    };
    ActivityLogEntry: {
      /** Format: date-time */
      at?: string;
      action?: string;
      targetType?: string | null;
      /** Format: uuid */
      targetId?: string | null;
    };
    OccupationStaff: {
      /** Format: uuid */
      contentAdminId: string;
      domainExpertIds: string[];
    };
    Metrics: {
      sessions?: number;
      answersGraded?: number;
      costUsd?: number;
      costPerSessionP95Usd?: number;
      costCeilingUsd?: number;
      costAlert?: boolean;
      /** @description Compare with NFR-02 */
      gradingLatencyP95Ms?: number;
      /** @description Compare with NFR-01 */
      followupLatencyP95Ms?: number;
      failedJobs?: number;
      twoJudgeGrades?: number;
    };
    AiJob: {
      /** Format: uuid */
      id?: string;
      /** @enum {string} */
      kind?:
        | 'GRADE'
        | 'FOLLOWUP'
        | 'FEEDBACK_NOTE'
        | 'GENERATE'
        | 'REVISE'
        | 'SUGGEST_PRESENTATION'
        | 'GENERATE_ASSET'
        | 'REGRADE_REFERENCE';
      /** @enum {string} */
      status?: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
      attempts?: number;
      lastError?: string | null;
      /** Format: date-time */
      queuedAt?: string;
      /** Format: date-time */
      finishedAt?: string | null;
      /** @description System prompt version used; null = built-in default */
      promptVersionNo?: number | null;
    };
    AppFeedback: {
      /** Format: uuid */
      id?: string;
      text?: string;
      appVersion?: string;
      /** @enum {string} */
      status?: 'NEW' | 'HANDLED';
      /** Format: date-time */
      createdAt?: string;
    };
    SignInWithGoogleInput: {
      code: string;
      /** Format: uri */
      redirectUri: string;
    };
    RefreshSessionInput: {
      refreshToken: string;
    };
    RequestPasswordResetInput: {
      /** Format: email */
      email: string;
    };
    ConfirmPasswordResetInput: {
      token: string;
      newPassword: string;
    };
    SubmitQuizInput: {
      answers: {
        /** Format: uuid */
        questionId: string;
        value: number;
      }[];
    };
    EnrolInput: {
      /** Format: uuid */
      levelId: string;
    };
    StartRunInput: {
      /** Format: uuid */
      enrolmentId: string;
      /** Format: uuid */
      taskId: string;
    };
    ViewHintInput: {
      activityKey: string;
    };
    ViewHintResult: {
      npcKey?: string;
      text?: string;
      /** @constant */
      hintUsed?: true;
    };
    FlagContentInput: {
      activityKey: string;
      reason: string;
    };
    AnswerSideQuestInput: {
      /** @description Free text or closed selection, depending on the side quest */
      answer: string | Record<string, never>;
    };
    AnswerSideQuestResult: {
      pointsAwarded?: number;
    };
    SendAppFeedbackInput: {
      text: string;
      appVersion: string;
    };
    StartImportInput: {
      source: components['schemas']['ReferenceSource'];
      /** Format: uuid */
      occupationId?: string;
      file: string;
    };
    FixImportRecordInput: {
      /** @enum {string} */
      action?: 'FIX' | 'SKIP' | 'ADAPT';
      payload?: Record<string, never>;
    };
    CreateReviewCriteriaVersionInput: {
      criteria: {
        text: string;
      }[];
    };
    OpenScenarioInput: {
      /** Format: uuid */
      taskId: string;
    };
    RequestRevisionInput: {
      /** @description Path of the part to revise, e.g. `activities.a2.inputPrompt` */
      part: string;
      request: string;
    };
    ReassignReviewInput: {
      /** Format: uuid */
      reviewerId: string;
      /** Format: date-time */
      deadlineAt: string;
    };
    RequestRevalidationInput: {
      /** @enum {string} */
      reason: 'REQUESTED' | 'FLAGGED_CONTENT';
      /** Format: uuid */
      flagId?: string;
    };
    RecordRevalidationInput: {
      /** @enum {string} */
      outcome: 'STILL_ACCURATE' | 'OUTDATED';
      comment?: string;
    };
    UploadAssetInput: {
      /** @enum {string} */
      kind: 'NPC' | 'BACKGROUND' | 'SCENE' | 'ICON';
      sourceNote: string;
      file: string;
    };
    GenerateAssetInput: {
      /** Format: uuid */
      scenarioId: string;
      /** @enum {string} */
      kind: 'NPC' | 'BACKGROUND' | 'SCENE' | 'ICON';
      prompt: string;
    };
    ReportPlaytestFindingsInput: {
      /** Format: uuid */
      runId?: string;
      findings: {
        /** @enum {string} */
        kind: 'DISPLAY' | 'CONTENT';
        text: string;
      }[];
    };
    PublishScenarioInput: {
      /** Format: date-time */
      effectiveFrom: string;
      releaseNote?: string;
    };
    HandleContentFlagInput: {
      /** @enum {string} */
      status: 'RESOLVED' | 'DISMISSED';
    };
    SubmitBlindRatingsInput: {
      ratings: components['schemas']['BlindRatingInput'][];
    };
    CreateStaffAccountInput: {
      /** Format: email */
      email: string;
      displayName: string;
      roles: components['schemas']['Role'][];
    };
    UpdateUserInput: {
      /** @enum {string} */
      status?: 'ACTIVE' | 'DISABLED';
      roles?: components['schemas']['Role'][];
    };
    MarkAppFeedbackInput: {
      /** @enum {string} */
      status: 'NEW' | 'HANDLED';
    };
    OccupationStaffingRow: {
      /** Format: uuid */
      occupationId?: string;
      name?: string;
      /** @enum {string} */
      status?: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
      contentAdmin?: string | null;
      domainExpertCount?: number;
    };
    RatingForm: {
      /** Format: uuid */
      occupationId: string;
      /** @description True when every level of the occupation is completed (FR-19) */
      eligible: boolean;
      /**
       * @description Why the form is locked; null when eligible
       * @enum {string|null}
       */
      lockedReason?: 'LEVELS_NOT_COMPLETED' | 'ALREADY_RATED' | null;
      /** @description The five rating attributes in display order (DR-08) */
      attributes: {
        code?: string;
        label?: string;
        sortOrder?: number;
      }[];
    };
    ImportRecord: {
      /** Format: uuid */
      recordId?: string;
      /** @enum {string} */
      kind?: 'OCCUPATION' | 'TASK' | 'SKILL';
      sourceCode?: string;
      /** @description Record as imported, or as adapted by the Content Admin */
      payload?: Record<string, never>;
      isResolved?: boolean;
      isSkipped?: boolean;
      /** Format: date-time */
      adjustedAt?: string | null;
    };
    ImportSummary: {
      /** Format: uuid */
      importId?: string;
      occupationsUpdated?: number;
      tasksAdded?: number;
      competenciesAdded?: number;
      skippedRecords?: number;
      expertsNotified?: number;
      /** Format: date-time */
      completedAt?: string;
    };
    RequestReplacementInput: {
      /** @description What in the rubric needs changing */
      comment: string;
      /** @description Disagreements from the agreement report that show the problem */
      referenceAnswerIds?: string[];
    };
    /** @enum {string} */
    PromptKind:
      | 'GRADING'
      | 'FOLLOW_UP'
      | 'FEEDBACK_NOTE'
      | 'GENERATION'
      | 'REVISION'
      | 'PRESENTATION_SUGGESTION'
      | 'IMAGE';
    SystemPromptVersion: {
      kind?: components['schemas']['PromptKind'];
      /** @description 0 = built-in default (no version saved yet) */
      versionNo?: number;
      text?: string;
      changeNote?: string | null;
      restoredFromVersionNo?: number | null;
      changedBy?: {
        /** Format: uuid */
        userId?: string;
        displayName?: string;
        /** @enum {string} */
        role?: 'CONTENT_ADMIN' | 'DOMAIN_EXPERT';
      } | null;
      /** Format: date-time */
      changedAt?: string | null;
    };
    SaveSystemPromptInput: {
      /** @description Version the editor started from; 409 if the other role saved a newer one meanwhile */
      baseVersionNo: number;
      /** @description New text in Vietnamese; omit when restoring */
      text?: string;
      /** @description Save the text of this older version as the new version */
      restoreFromVersionNo?: number;
      changeNote: string;
    };
  };
  responses: {
    /** @description Missing, expired or wrong credentials */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Role or occupation assignment does not allow this (codes ACCOUNT_DISABLED, NOT_ASSIGNED, LEVEL_LOCKED, REVIEWER_IS_AUTHOR) */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Resource not found */
    NotFound: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description State conflict (codes INVALID_TRANSITION, ACTIVE_SCENARIO_EXISTS, SCENARIO_UNAVAILABLE, DOMAIN_NOT_EMPTY, ALREADY_RATED, EMAIL_TAKEN) */
    Conflict: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Token expired or already used */
    Gone: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description The resource changed since it was read (If-Match mismatch) */
    PreconditionFailed: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
    /** @description Request breaks a rule (codes ANSWER_INVALID, CHECKS_FAILED, CRITERIA_MISSING, TASK_TYPE_NOT_ALLOWED, MODEL_FAMILIES_OVERLAP, REVIEWER_IS_AUTHOR) */
    ValidationFailed: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/problem+json': components['schemas']['Problem'];
      };
    };
  };
  parameters: {
    OccupationId: string;
    LevelNo: number;
    RunId: string;
    ScenarioId: string;
    BuildId: string;
    UserId: string;
    Cursor: string;
    Limit: number;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  register: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RegisterInput'];
      };
    };
    responses: {
      /** @description Account created and signed in */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Session'];
        };
      };
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  signIn: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SignInInput'];
      };
    };
    responses: {
      /** @description Signed in */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Session'];
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  signInWithGoogle: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SignInWithGoogleInput'];
      };
    };
    responses: {
      /** @description Signed in */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Session'];
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  refreshSession: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RefreshSessionInput'];
      };
    };
    responses: {
      /** @description New tokens */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Session'];
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  signOut: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Signed out */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  requestPasswordReset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RequestPasswordResetInput'];
      };
    };
    responses: {
      /** @description Request accepted */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  confirmPasswordReset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ConfirmPasswordResetInput'];
      };
    };
    responses: {
      /** @description Password changed */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      410: components['responses']['Gone'];
    };
  };
  getMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Account */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Me'];
        };
      };
    };
  };
  deleteMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Account deleted */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateMe: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateMeInput'];
      };
    };
    responses: {
      /** @description Updated account */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Me'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  getMyRecord: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Private record */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PrivateRecord'];
        };
      };
    };
  };
  listMyPastFeedback: {
    parameters: {
      query?: {
        cursor?: components['parameters']['Cursor'];
        limit?: components['parameters']['Limit'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Past feedback, newest first */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Page'] & {
            items?: components['schemas']['ScenarioSummary'][];
          };
        };
      };
    };
  };
  getQuizQuestions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Questions */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['QuizQuestion'][];
        };
      };
    };
  };
  submitQuiz: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SubmitQuizInput'];
      };
    };
    responses: {
      /** @description Quiz result */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['QuizResult'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  getCurrentQuizResult: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Quiz result */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['QuizResult'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  listOccupations: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Published occupations grouped by domain */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['DomainOnMap'][];
        };
      };
    };
  };
  getOccupationProfile: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Occupation profile */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OccupationProfile'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  getLevel: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
        levelNo: components['parameters']['LevelNo'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Level and access */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LevelView'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  enrol: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['EnrolInput'];
      };
    };
    responses: {
      /** @description Enrolled; returns the Island Map */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IslandMap'];
        };
      };
      403: components['responses']['Forbidden'];
      409: components['responses']['Conflict'];
    };
  };
  getIslandMap: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        enrolmentId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Level progress, main quests, side quests and suggested tasks */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['IslandMap'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  startRun: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['StartRunInput'];
      };
    };
    responses: {
      /** @description Existing run resumed */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Run'];
        };
      };
      /** @description Run started */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Run'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getRun: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Run */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Run'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  getCurrentActivity: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Current activity */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ActivityView'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  submitAnswer: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AnswerInput'];
      };
    };
    responses: {
      /** @description Closed answer scored, or a repeated post of an answer already stored */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AnswerResult'];
        };
      };
      /** @description Free-text answer saved and queued for grading */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  viewHint: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ViewHintInput'];
      };
    };
    responses: {
      /** @description Hint spoken by the NPC */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ViewHintResult'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  flagContent: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FlagContentInput'];
      };
    };
    responses: {
      /** @description Flag received; a domain expert of the occupation is notified */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  finishRun: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario summary */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioSummary'];
        };
      };
      /** @description Summary pending */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getRunSummary: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        runId: components['parameters']['RunId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario summary */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioSummary'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  answerSideQuest: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        sideQuestId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AnswerSideQuestInput'];
      };
    };
    responses: {
      /** @description Points awarded */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AnswerSideQuestResult'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  rateOccupation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RatingInput'];
      };
    };
    responses: {
      /** @description Rating stored; returns the aggregate (withheld below the threshold) */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RatingSummary'];
        };
      };
      403: components['responses']['Forbidden'];
      409: components['responses']['Conflict'];
    };
  };
  getRatingForm: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Rating form */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['RatingForm'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  sendAppFeedback: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SendAppFeedbackInput'];
      };
    };
    responses: {
      /** @description Feedback stored with time and app version */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  openEventStream: {
    parameters: {
      query?: never;
      header?: {
        'Last-Event-ID'?: string;
      };
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Event stream */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'text/event-stream': components['schemas']['StreamEvent'];
        };
      };
    };
  };
  listDomains: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Domains */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Domain'][];
        };
      };
    };
  };
  createDomain: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DomainInput'];
      };
    };
    responses: {
      /** @description Domain created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Domain'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  deleteDomain: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        domainId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Domain deleted */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      409: components['responses']['Conflict'];
    };
  };
  updateDomain: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        domainId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['DomainInput'];
      };
    };
    responses: {
      /** @description Domain updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Domain'];
        };
      };
    };
  };
  listMyOccupations: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Occupations with status and the caller's role */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StaffOccupation'][];
        };
      };
    };
  };
  createOccupation: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OccupationInput'];
      };
    };
    responses: {
      /** @description Occupation created as DRAFT */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StaffOccupation'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  updateOccupation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OccupationInput'];
      };
    };
    responses: {
      /** @description Occupation updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StaffOccupation'];
        };
      };
      403: components['responses']['Forbidden'];
    };
  };
  publishOccupation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Occupation published */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StaffOccupation'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  retireOccupation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Occupation retired */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['StaffOccupation'];
        };
      };
    };
  };
  startImport: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['StartImportInput'];
      };
    };
    responses: {
      /** @description Import queued; `import.finished` arrives on the stream */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
    };
  };
  getImport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Import */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ImportJob'];
        };
      };
    };
  };
  fixImportRecord: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
        recordId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['FixImportRecordInput'];
      };
    };
    responses: {
      /** @description Record updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ImportRecord'];
        };
      };
    };
  };
  completeImport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        importId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Import summary */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ImportSummary'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getReviewCriteria: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Current criteria version */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReviewCriteria'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  createReviewCriteriaVersion: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateReviewCriteriaVersionInput'];
      };
    };
    responses: {
      /** @description New criteria version */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReviewCriteria'];
        };
      };
    };
  };
  getOccupationStatistics: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Statistics */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OccupationStatistics'];
        };
      };
    };
  };
  getOccupationProfileForEdit: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Profile */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProfileEdit'];
        };
      };
    };
  };
  saveOccupationProfile: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ProfileEdit'];
      };
    };
    responses: {
      /** @description Saved profile with recalculated adjacency */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ProfileEdit'];
        };
      };
      403: components['responses']['Forbidden'];
      422: components['responses']['ValidationFailed'];
    };
  };
  listScenarios: {
    parameters: {
      query?: {
        occupationId?: string;
        status?: components['schemas']['ScenarioStatus'];
        /** @description Only scenarios the caller authors or reviews */
        mine?: boolean;
        cursor?: components['parameters']['Cursor'];
        limit?: components['parameters']['Limit'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenarios */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Page'] & {
            items?: components['schemas']['ScenarioListItem'][];
          };
        };
      };
    };
  };
  openScenario: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OpenScenarioInput'];
      };
    };
    responses: {
      /** @description Scenario opened as DRAFT, with the domain expert list */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getScenario: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      404: components['responses']['NotFound'];
    };
  };
  deleteScenario: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario retired */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  assignScenarioStaff: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['AssignmentInput'];
      };
    };
    responses: {
      /** @description Assignment saved */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Assignment'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  getSituationOptions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Archetypes, company types and skills available for this level */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SituationOptions'];
        };
      };
    };
  };
  listGenerations: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Generation runs, newest first */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['GenerationRun'][];
        };
      };
    };
  };
  requestGeneration: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['GenerationInput'];
      };
    };
    responses: {
      /** @description Generation queued; `generation.ready` arrives on the stream */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  requestRevision: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RequestRevisionInput'];
      };
    };
    responses: {
      /** @description Revision queued; `revision.ready` arrives on the stream */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
    };
  };
  saveScenarioContent: {
    parameters: {
      query?: never;
      header: {
        'If-Match': string;
      };
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ScenarioContent'];
      };
    };
    responses: {
      /** @description Content saved */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      409: components['responses']['Conflict'];
      412: components['responses']['PreconditionFailed'];
    };
  };
  listReferenceAnswers: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sample answers with expert scores */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReferenceAnswer'][];
        };
      };
    };
  };
  addReferenceAnswer: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReferenceAnswer'];
      };
    };
    responses: {
      /** @description Sample answer stored */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReferenceAnswer'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  runContentChecks: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Check report */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['CheckReport'];
        };
      };
    };
  };
  submitScenario: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario submitted */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  getScenarioHistory: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description History, oldest first */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['LifecycleEntry'][];
        };
      };
    };
  };
  listMyReviewQueue: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Queue items with deadlines */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReviewQueueItem'][];
        };
      };
    };
  };
  openScenarioForReview: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Content and the review criteria to answer */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ReviewView'];
        };
      };
      403: components['responses']['Forbidden'];
    };
  };
  decideReview: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReviewDecisionInput'];
      };
    };
    responses: {
      /** @description Decision saved */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      403: components['responses']['Forbidden'];
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  listReviewAssignments: {
    parameters: {
      query?: {
        overdue?: boolean;
        occupationId?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Assignments */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Assignment'][];
        };
      };
    };
  };
  reassignReview: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        assignmentId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReassignReviewInput'];
      };
    };
    responses: {
      /** @description New assignment; the old one is marked REASSIGNED */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Assignment'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  requestRevalidation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RequestRevalidationInput'];
      };
    };
    responses: {
      /** @description Revalidation queued */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Revalidation'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  requestReplacement: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RequestReplacementInput'];
      };
    };
    responses: {
      /** @description Request recorded; returns its status */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Revalidation'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  recordRevalidation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        revalidationId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['RecordRevalidationInput'];
      };
    };
    responses: {
      /** @description Result recorded */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Revalidation'];
        };
      };
    };
  };
  requestPresentationSuggestions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Suggestions queued; `suggestions.ready` arrives on the stream */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getPresentation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Presentation */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Presentation'];
        };
      };
    };
  };
  savePresentation: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['Presentation'];
      };
    };
    responses: {
      /** @description Presentation saved */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Presentation'];
        };
      };
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  listAssets: {
    parameters: {
      query?: {
        kind?: 'NPC' | 'BACKGROUND' | 'SCENE' | 'ICON';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Assets */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Asset'][];
        };
      };
    };
  };
  uploadAsset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'multipart/form-data': components['schemas']['UploadAssetInput'];
      };
    };
    responses: {
      /** @description Asset stored with bias check PENDING */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Asset'];
        };
      };
    };
  };
  generateAsset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['GenerateAssetInput'];
      };
    };
    responses: {
      /** @description Asset job queued; `asset.ready` arrives on the stream */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
    };
  };
  buildDraftGame: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Build created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Build'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  getBuild: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Build */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Build'];
        };
      };
    };
  };
  startPlaytestRun: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Play-test run */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Run'];
        };
      };
      403: components['responses']['Forbidden'];
    };
  };
  reportPlaytestFindings: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['ReportPlaytestFindingsInput'];
      };
    };
    responses: {
      /** @description Findings stored; returns the new scenario state */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
    };
  };
  passPlaytest: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        buildId: components['parameters']['BuildId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Scenario ready to publish */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ScenarioDetail'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  publishScenario: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        scenarioId: components['parameters']['ScenarioId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['PublishScenarioInput'];
      };
    };
    responses: {
      /** @description Release created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Release'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  listContentFlags: {
    parameters: {
      query?: {
        status?: 'OPEN' | 'IN_REVALIDATION' | 'RESOLVED' | 'DISMISSED';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Flags of the caller's occupations */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ContentFlag'][];
        };
      };
    };
  };
  handleContentFlag: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        flagId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['HandleContentFlagInput'];
      };
    };
    responses: {
      /** @description Flag updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['ContentFlag'];
        };
      };
    };
  };
  getBlindSamples: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Samples without scores */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['BlindSample'][];
        };
      };
    };
  };
  submitBlindRatings: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SubmitBlindRatingsInput'];
      };
    };
    responses: {
      /** @description Ratings stored; regrading queued */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
    };
  };
  getAgreementReport: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Agreement per difficulty stratum and disagreements */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AgreementReport'];
        };
      };
    };
  };
  listSystemPrompts: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Prompts in force */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SystemPromptVersion'][];
        };
      };
    };
  };
  listSystemPromptVersions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
        kind: components['schemas']['PromptKind'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Versions with author and change note */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SystemPromptVersion'][];
        };
      };
    };
  };
  saveSystemPrompt: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
        kind: components['schemas']['PromptKind'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['SaveSystemPromptInput'];
      };
    };
    responses: {
      /** @description Version saved and in force */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['SystemPromptVersion'];
        };
      };
      409: components['responses']['Conflict'];
      422: components['responses']['ValidationFailed'];
    };
  };
  listNotifications: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Notifications, newest first */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Notification'][];
        };
      };
    };
  };
  listUsers: {
    parameters: {
      query?: {
        role?: components['schemas']['Role'];
        status?: 'ACTIVE' | 'DISABLED' | 'DELETED';
        /** @description Search by e-mail or display name */
        q?: string;
        cursor?: components['parameters']['Cursor'];
        limit?: components['parameters']['Limit'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Accounts */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Page'] & {
            items?: components['schemas']['UserAdminView'][];
          };
        };
      };
    };
  };
  createStaffAccount: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateStaffAccountInput'];
      };
    };
    responses: {
      /** @description Account created */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserAdminView'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  deleteUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: components['parameters']['UserId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Account deleted */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  updateUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        userId: components['parameters']['UserId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['UpdateUserInput'];
      };
    };
    responses: {
      /** @description Account updated; disabling revokes its sessions */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['UserAdminView'];
        };
      };
    };
  };
  getUserActivity: {
    parameters: {
      query?: {
        cursor?: components['parameters']['Cursor'];
        limit?: components['parameters']['Limit'];
      };
      header?: never;
      path: {
        userId: components['parameters']['UserId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Activity log */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Page'] & {
            items?: components['schemas']['ActivityLogEntry'][];
          };
        };
      };
    };
  };
  listOccupationsForStaffing: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Occupations */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OccupationStaffingRow'][];
        };
      };
    };
  };
  getOccupationStaff: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Staffing */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OccupationStaff'];
        };
      };
    };
  };
  setOccupationStaff: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        occupationId: components['parameters']['OccupationId'];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OccupationStaff'];
      };
    };
    responses: {
      /** @description Staffing saved */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OccupationStaff'];
        };
      };
      422: components['responses']['ValidationFailed'];
    };
  };
  getMetrics: {
    parameters: {
      query: {
        from: string;
        to: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Metrics */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Metrics'];
        };
      };
    };
  };
  listAiJobs: {
    parameters: {
      query?: {
        status?: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
        cursor?: components['parameters']['Cursor'];
        limit?: components['parameters']['Limit'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Jobs */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Page'] & {
            items?: components['schemas']['AiJob'][];
          };
        };
      };
    };
  };
  rerunAiJob: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        jobId: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description New job queued */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['JobAccepted'];
        };
      };
      409: components['responses']['Conflict'];
    };
  };
  listAppFeedback: {
    parameters: {
      query?: {
        status?: 'NEW' | 'HANDLED';
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Feedback, newest first */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AppFeedback'][];
        };
      };
    };
  };
  markAppFeedback: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        feedbackId: string;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MarkAppFeedbackInput'];
      };
    };
    responses: {
      /** @description Feedback updated */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['AppFeedback'];
        };
      };
    };
  };
}
