-- ERD-02 (phần cần cho soạn scenario), ERD-03, ERD-04 (duyệt, trình bày,
-- bản nháp) và ERD-07 `prompt_template`. Bảng mới, không chuyển dữ liệu.
-- Lệch ERD (07): `generation_run` chưa có `model_config_id`; `ai_job_id` là text.

-- CreateEnum
CREATE TYPE "competency_kind" AS ENUM ('EXPERTISE', 'SOFT_SKILL');

-- CreateEnum
CREATE TYPE "proficiency" AS ENUM ('FAMILIAR', 'PROFICIENT', 'EXPERT');

-- CreateEnum
CREATE TYPE "scenario_status" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'IN_PLAYTEST', 'READY', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "scenario_archetype" AS ENUM ('S_EXEC', 'S_AMBIG', 'S_INCIDENT', 'S_CONFLICT', 'S_REVIEW', 'S_DECISION');

-- CreateEnum
CREATE TYPE "company_type" AS ENUM ('OUTSOURCING', 'PRODUCT_LOCAL', 'ENTERPRISE_BANK', 'BIGTECH_FDI');

-- CreateEnum
CREATE TYPE "task_type" AS ENUM ('FREE_TEXT', 'CHOICE', 'ORDERING', 'PRIORITIZING');

-- CreateEnum
CREATE TYPE "pick_rule" AS ENUM ('MUST', 'SHOULD', 'MUST_NOT', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "ending_type" AS ENUM ('GOOD', 'PARTIAL', 'BAD', 'SECRET');

-- CreateEnum
CREATE TYPE "generation_kind" AS ENUM ('GENERATE', 'REVISE', 'SUGGEST_PRESENTATION', 'GENERATE_ASSET');

-- CreateEnum
CREATE TYPE "difficulty_stratum" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "assignment_status" AS ENUM ('ACTIVE', 'COMPLETED', 'REASSIGNED');

-- CreateEnum
CREATE TYPE "review_decision" AS ENUM ('APPROVE', 'REQUEST_CHANGES', 'REJECT');

-- CreateEnum
CREATE TYPE "criterion_verdict" AS ENUM ('MET', 'NOT_MET');

-- CreateEnum
CREATE TYPE "asset_kind" AS ENUM ('NPC', 'BACKGROUND', 'SCENE', 'ICON');

-- CreateEnum
CREATE TYPE "asset_source" AS ENUM ('LIBRARY', 'LICENSED', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "bias_check_status" AS ENUM ('PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "prompt_kind" AS ENUM ('GRADING', 'FOLLOW_UP', 'FEEDBACK_NOTE', 'GENERATION', 'REVISION', 'PRESENTATION_SUGGESTION', 'IMAGE');

-- AlterTable
ALTER TABLE "ai_job" ADD COLUMN     "prompt_template_id" UUID;

-- CreateTable
CREATE TABLE "occupation_level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "level_no" SMALLINT NOT NULL,
    "band" VARCHAR(3) NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "future_role" TEXT,
    "credit_threshold" INTEGER NOT NULL,
    "salary_min" DECIMAL(12,0),
    "salary_max" DECIMAL(12,0),
    "salary_currency" CHAR(3),
    "written_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupation_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downside" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" SMALLINT NOT NULL,
    "written_by" UUID NOT NULL,

    CONSTRAINT "downside_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_rule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "rule_text" TEXT NOT NULL,
    "written_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(60) NOT NULL,
    "kind" "competency_kind" NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "indicator" TEXT NOT NULL,
    "source_record_id" UUID,
    "created_by" UUID NOT NULL,

    CONSTRAINT "competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_competency" (
    "level_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "proficiency" "proficiency" NOT NULL,

    CONSTRAINT "level_competency_pkey" PRIMARY KEY ("level_id","competency_id")
);

-- CreateTable
CREATE TABLE "task" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "level_id" UUID NOT NULL,
    "source_record_id" UUID,
    "text" TEXT NOT NULL,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "status" "scenario_status" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID,
    "opened_by" UUID NOT NULL,
    "author_context" TEXT,
    "archetype" "scenario_archetype",
    "company_type" "company_type",
    "intro" TEXT,
    "situation" TEXT,
    "stakes" TEXT,
    "estimated_minutes" DECIMAL(3,1),
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_skill" (
    "scenario_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,

    CONSTRAINT "scenario_skill_pkey" PRIMARY KEY ("scenario_id","competency_id")
);

-- CreateTable
CREATE TABLE "cast_member" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "npc_key" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80),
    "role_in_scene" VARCHAR(120) NOT NULL,
    "pressure" TEXT,
    "voice" TEXT,

    CONSTRAINT "cast_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "activity_key" VARCHAR(20) NOT NULL,
    "summary" VARCHAR(160) NOT NULL,
    "setup" TEXT NOT NULL,
    "npc_line" TEXT,
    "input_prompt" TEXT NOT NULL,
    "job_scope" TEXT NOT NULL,
    "closing_line" TEXT NOT NULL,
    "is_origin" BOOLEAN NOT NULL,
    "forward_to_id" UUID,
    "pick_count" SMALLINT,
    "followup_limit" SMALLINT NOT NULL,
    "followup_goal" TEXT,
    "default_followup" TEXT,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_allowed_type" (
    "activity_id" UUID NOT NULL,
    "task_type" "task_type" NOT NULL,

    CONSTRAINT "activity_allowed_type_pkey" PRIMARY KEY ("activity_id","task_type")
);

-- CreateTable
CREATE TABLE "activity_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "item_key" VARCHAR(20) NOT NULL,
    "text" TEXT NOT NULL,
    "score" SMALLINT,
    "why" TEXT,
    "correct_position" SMALLINT,
    "pick_rule" "pick_rule",
    "note" TEXT,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "activity_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criterion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "competency_id" UUID NOT NULL,
    "anchor_2" TEXT NOT NULL,
    "anchor_1" TEXT NOT NULL,
    "anchor_0" TEXT NOT NULL,
    "counterproductive_signs" TEXT,

    CONSTRAINT "rubric_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "hint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_event" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "chance" DECIMAL(3,2) NOT NULL,
    "text" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "target_competency_id" UUID NOT NULL,
    "anchor_2" TEXT NOT NULL,
    "anchor_1" TEXT NOT NULL,
    "anchor_0" TEXT NOT NULL,
    "counterproductive_signs" TEXT,

    CONSTRAINT "random_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ending" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "type" "ending_type" NOT NULL,
    "priority" SMALLINT NOT NULL,
    "min_total_score" SMALLINT,
    "extra_behaviour" TEXT,
    "text" TEXT NOT NULL,
    "reveals" TEXT,

    CONSTRAINT "ending_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "side_quest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "prompt" TEXT NOT NULL,
    "task_type" "task_type" NOT NULL,
    "points" SMALLINT NOT NULL,
    "answer_key" JSONB,

    CONSTRAINT "side_quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation_run" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "kind" "generation_kind" NOT NULL,
    "requested_by" UUID NOT NULL,
    "ai_job_id" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "check_passed" BOOLEAN,
    "check_report" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_answer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "answer_text" TEXT NOT NULL,
    "stratum" "difficulty_stratum" NOT NULL,
    "validation_passed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reference_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reference_answer_score" (
    "reference_answer_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "score" SMALLINT,
    "counterproductive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "reference_answer_score_pkey" PRIMARY KEY ("reference_answer_id","criterion_id")
);

-- CreateTable
CREATE TABLE "review_criteria_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "version_no" INTEGER NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_criteria_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_criterion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "criteria_version_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "review_criterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_assignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "deadline_at" TIMESTAMP(3) NOT NULL,
    "status" "assignment_status" NOT NULL DEFAULT 'ACTIVE',
    "replaces_id" UUID,
    "reminded_at" TIMESTAMP(3),
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "criteria_version_id" UUID NOT NULL,
    "decision" "review_decision" NOT NULL,
    "comment" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_answer" (
    "review_id" UUID NOT NULL,
    "criterion_id" UUID NOT NULL,
    "verdict" "criterion_verdict" NOT NULL,
    "comment" TEXT,

    CONSTRAINT "review_answer_pkey" PRIMARY KEY ("review_id","criterion_id")
);

-- CreateTable
CREATE TABLE "lifecycle_log" (
    "id" BIGSERIAL NOT NULL,
    "scenario_id" UUID NOT NULL,
    "from_status" "scenario_status",
    "to_status" "scenario_status" NOT NULL,
    "action" VARCHAR(40) NOT NULL,
    "actor_id" UUID NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lifecycle_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kind" "asset_kind" NOT NULL,
    "storage_key" VARCHAR(255) NOT NULL,
    "source" "asset_source" NOT NULL,
    "source_note" TEXT,
    "generation_run_id" UUID,
    "bias_check" "bias_check_status" NOT NULL DEFAULT 'PENDING',
    "checked_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "designed_by" UUID NOT NULL,
    "background_asset_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "presentation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presentation_activity" (
    "activity_id" UUID NOT NULL,
    "presentation_id" UUID NOT NULL,
    "task_type" "task_type" NOT NULL,
    "scene_asset_id" UUID,

    CONSTRAINT "presentation_activity_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "presentation_npc" (
    "cast_member_id" UUID NOT NULL,
    "presentation_id" UUID NOT NULL,
    "avatar_asset_id" UUID NOT NULL,

    CONSTRAINT "presentation_npc_pkey" PRIMARY KEY ("cast_member_id")
);

-- CreateTable
CREATE TABLE "scenario_build" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "content" JSONB NOT NULL,
    "content_hash" CHAR(64) NOT NULL,
    "built_by" UUID NOT NULL,
    "built_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "kind" "prompt_kind" NOT NULL,
    "version_no" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "change_note" VARCHAR(300) NOT NULL,
    "restored_from_id" UUID,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "occupation_level_occupation_id_level_no_key" ON "occupation_level"("occupation_id", "level_no");

-- CreateIndex
CREATE INDEX "downside_occupation_id_idx" ON "downside"("occupation_id");

-- CreateIndex
CREATE INDEX "generation_rule_occupation_id_idx" ON "generation_rule"("occupation_id");

-- CreateIndex
CREATE UNIQUE INDEX "competency_code_key" ON "competency"("code");

-- CreateIndex
CREATE INDEX "task_level_id_idx" ON "task"("level_id");

-- CreateIndex
CREATE INDEX "scenario_task_id_idx" ON "scenario"("task_id");

-- CreateIndex
CREATE INDEX "scenario_author_id_idx" ON "scenario"("author_id");

-- CreateIndex
CREATE UNIQUE INDEX "cast_member_scenario_id_npc_key_key" ON "cast_member"("scenario_id", "npc_key");

-- CreateIndex
CREATE UNIQUE INDEX "activity_scenario_id_activity_key_key" ON "activity"("scenario_id", "activity_key");

-- CreateIndex
CREATE UNIQUE INDEX "activity_item_activity_id_item_key_key" ON "activity_item"("activity_id", "item_key");

-- CreateIndex
CREATE UNIQUE INDEX "rubric_criterion_activity_id_competency_id_key" ON "rubric_criterion"("activity_id", "competency_id");

-- CreateIndex
CREATE UNIQUE INDEX "generation_run_ai_job_id_key" ON "generation_run"("ai_job_id");

-- CreateIndex
CREATE INDEX "generation_run_scenario_id_created_at_idx" ON "generation_run"("scenario_id", "created_at");

-- CreateIndex
CREATE INDEX "reference_answer_activity_id_idx" ON "reference_answer"("activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_criteria_version_occupation_id_version_no_key" ON "review_criteria_version"("occupation_id", "version_no");

-- CreateIndex
CREATE UNIQUE INDEX "review_assignment_replaces_id_key" ON "review_assignment"("replaces_id");

-- CreateIndex
CREATE INDEX "review_assignment_reviewer_id_status_idx" ON "review_assignment"("reviewer_id", "status");

-- CreateIndex
CREATE INDEX "review_assignment_scenario_id_idx" ON "review_assignment"("scenario_id");

-- CreateIndex
CREATE INDEX "lifecycle_log_scenario_id_created_at_idx" ON "lifecycle_log"("scenario_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "asset_storage_key_key" ON "asset"("storage_key");

-- CreateIndex
CREATE INDEX "asset_kind_bias_check_idx" ON "asset"("kind", "bias_check");

-- CreateIndex
CREATE UNIQUE INDEX "presentation_scenario_id_key" ON "presentation"("scenario_id");

-- CreateIndex
CREATE INDEX "scenario_build_scenario_id_built_at_idx" ON "scenario_build"("scenario_id", "built_at");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_template_occupation_id_kind_version_no_key" ON "prompt_template"("occupation_id", "kind", "version_no");

-- AddForeignKey
ALTER TABLE "occupation_level" ADD CONSTRAINT "occupation_level_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_level" ADD CONSTRAINT "occupation_level_written_by_fkey" FOREIGN KEY ("written_by") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downside" ADD CONSTRAINT "downside_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downside" ADD CONSTRAINT "downside_written_by_fkey" FOREIGN KEY ("written_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_rule" ADD CONSTRAINT "generation_rule_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_rule" ADD CONSTRAINT "generation_rule_written_by_fkey" FOREIGN KEY ("written_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency" ADD CONSTRAINT "competency_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_competency" ADD CONSTRAINT "level_competency_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "occupation_level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_competency" ADD CONSTRAINT "level_competency_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "occupation_level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_skill" ADD CONSTRAINT "scenario_skill_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_skill" ADD CONSTRAINT "scenario_skill_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cast_member" ADD CONSTRAINT "cast_member_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity" ADD CONSTRAINT "activity_forward_to_id_fkey" FOREIGN KEY ("forward_to_id") REFERENCES "activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_allowed_type" ADD CONSTRAINT "activity_allowed_type_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_item" ADD CONSTRAINT "activity_item_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criterion" ADD CONSTRAINT "rubric_criterion_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criterion" ADD CONSTRAINT "rubric_criterion_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint" ADD CONSTRAINT "hint_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_event" ADD CONSTRAINT "random_event_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_event" ADD CONSTRAINT "random_event_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_event" ADD CONSTRAINT "random_event_target_competency_id_fkey" FOREIGN KEY ("target_competency_id") REFERENCES "competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ending" ADD CONSTRAINT "ending_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "side_quest" ADD CONSTRAINT "side_quest_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_run" ADD CONSTRAINT "generation_run_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_run" ADD CONSTRAINT "generation_run_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generation_run" ADD CONSTRAINT "generation_run_ai_job_id_fkey" FOREIGN KEY ("ai_job_id") REFERENCES "ai_job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_answer" ADD CONSTRAINT "reference_answer_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_answer" ADD CONSTRAINT "reference_answer_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_answer_score" ADD CONSTRAINT "reference_answer_score_reference_answer_id_fkey" FOREIGN KEY ("reference_answer_id") REFERENCES "reference_answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reference_answer_score" ADD CONSTRAINT "reference_answer_score_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "rubric_criterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_criteria_version" ADD CONSTRAINT "review_criteria_version_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_criteria_version" ADD CONSTRAINT "review_criteria_version_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_criterion" ADD CONSTRAINT "review_criterion_criteria_version_id_fkey" FOREIGN KEY ("criteria_version_id") REFERENCES "review_criteria_version"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_assignment" ADD CONSTRAINT "review_assignment_replaces_id_fkey" FOREIGN KEY ("replaces_id") REFERENCES "review_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "review_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_criteria_version_id_fkey" FOREIGN KEY ("criteria_version_id") REFERENCES "review_criteria_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answer" ADD CONSTRAINT "review_answer_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answer" ADD CONSTRAINT "review_answer_criterion_id_fkey" FOREIGN KEY ("criterion_id") REFERENCES "review_criterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_log" ADD CONSTRAINT "lifecycle_log_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lifecycle_log" ADD CONSTRAINT "lifecycle_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_designed_by_fkey" FOREIGN KEY ("designed_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation" ADD CONSTRAINT "presentation_background_asset_id_fkey" FOREIGN KEY ("background_asset_id") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_activity" ADD CONSTRAINT "presentation_activity_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_activity" ADD CONSTRAINT "presentation_activity_activity_id_task_type_fkey" FOREIGN KEY ("activity_id", "task_type") REFERENCES "activity_allowed_type"("activity_id", "task_type") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_activity" ADD CONSTRAINT "presentation_activity_presentation_id_fkey" FOREIGN KEY ("presentation_id") REFERENCES "presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_activity" ADD CONSTRAINT "presentation_activity_scene_asset_id_fkey" FOREIGN KEY ("scene_asset_id") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_npc" ADD CONSTRAINT "presentation_npc_cast_member_id_fkey" FOREIGN KEY ("cast_member_id") REFERENCES "cast_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_npc" ADD CONSTRAINT "presentation_npc_presentation_id_fkey" FOREIGN KEY ("presentation_id") REFERENCES "presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presentation_npc" ADD CONSTRAINT "presentation_npc_avatar_asset_id_fkey" FOREIGN KEY ("avatar_asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_build" ADD CONSTRAINT "scenario_build_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_build" ADD CONSTRAINT "scenario_build_built_by_fkey" FOREIGN KEY ("built_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_template" ADD CONSTRAINT "prompt_template_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_template" ADD CONSTRAINT "prompt_template_restored_from_id_fkey" FOREIGN KEY ("restored_from_id") REFERENCES "prompt_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_template" ADD CONSTRAINT "prompt_template_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_job" ADD CONSTRAINT "ai_job_prompt_template_id_fkey" FOREIGN KEY ("prompt_template_id") REFERENCES "prompt_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- FR-33: mỗi task tối đa một scenario còn hiệu lực (chưa RETIRED).
CREATE UNIQUE INDEX "scenario_one_active_per_task" ON "scenario"("task_id") WHERE "status" <> 'RETIRED';

-- FR-34: mỗi scenario tối đa một lượt duyệt đang hiệu lực.
CREATE UNIQUE INDEX "review_assignment_one_active" ON "review_assignment"("scenario_id") WHERE "status" = 'ACTIVE';

-- Điểm thang 0/1/2 (D-116).
ALTER TABLE "activity_item" ADD CONSTRAINT "activity_item_score_range" CHECK ("score" IS NULL OR "score" BETWEEN 0 AND 2);
ALTER TABLE "reference_answer_score" ADD CONSTRAINT "reference_answer_score_range" CHECK ("score" IS NULL OR "score" BETWEEN 0 AND 2);
ALTER TABLE "random_event" ADD CONSTRAINT "random_event_chance_range" CHECK ("chance" BETWEEN 0.1 AND 0.4);

-- NFR-16: bản dựng là ảnh chụp bất biến.
CREATE FUNCTION "scenario_build_immutable"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'scenario_build is immutable';
END;
$$;
CREATE TRIGGER "scenario_build_no_update" BEFORE UPDATE ON "scenario_build"
  FOR EACH ROW EXECUTE FUNCTION "scenario_build_immutable"();
