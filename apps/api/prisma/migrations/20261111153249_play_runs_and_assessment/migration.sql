-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('QUEUED', 'GRADED', 'PENDING', 'FAILED');

-- AlterTable
ALTER TABLE "ScenarioRun" ADD COLUMN     "currentActivityKey" TEXT,
ADD COLUMN     "flow" TEXT NOT NULL DEFAULT 'replay',
ADD COLUMN     "status" "RunStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateTable
CREATE TABLE "run_event" (
    "id" BIGSERIAL NOT NULL,
    "run_id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "activity_key" TEXT,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "activity_key" TEXT NOT NULL,
    "followup_no" INTEGER NOT NULL,
    "followup_question" TEXT,
    "task_type" TEXT NOT NULL,
    "text" TEXT,
    "selection" JSONB,
    "system_score" INTEGER,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "ai_job_id" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'QUEUED',
    "panel_size" INTEGER,
    "method" TEXT,
    "score" INTEGER,
    "counterproductive" BOOLEAN NOT NULL DEFAULT false,
    "graded_at" TIMESTAMP(3),
    "latency_ms" INTEGER,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_result" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "judge_slot" INTEGER NOT NULL,
    "family" TEXT NOT NULL,
    "model_id" TEXT,
    "status" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "judge_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "judge_score" (
    "judge_result_id" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "score" INTEGER,
    "counterproductive" BOOLEAN NOT NULL,
    "quote" TEXT,
    "quote_verified" BOOLEAN NOT NULL,
    "rationale" TEXT NOT NULL,

    CONSTRAINT "judge_score_pkey" PRIMARY KEY ("judge_result_id","criterion_key")
);

-- CreateTable
CREATE TABLE "criterion_grade" (
    "assessment_id" TEXT NOT NULL,
    "criterion_key" TEXT NOT NULL,
    "score" INTEGER,
    "counterproductive" BOOLEAN NOT NULL,
    "method" TEXT NOT NULL,
    "high_disagreement" BOOLEAN NOT NULL,

    CONSTRAINT "criterion_grade_pkey" PRIMARY KEY ("assessment_id","criterion_key")
);

-- CreateTable
CREATE TABLE "ai_job" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "run_id" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "queued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "ai_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_cost" (
    "id" BIGSERIAL NOT NULL,
    "ai_job_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "model_id" TEXT NOT NULL,
    "tokens_in" INTEGER NOT NULL,
    "tokens_out" INTEGER NOT NULL,
    "cost_usd" DECIMAL(12,8) NOT NULL,
    "latency_ms" INTEGER,
    "succeeded" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_cost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_event_run_id_seq_key" ON "run_event"("run_id", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "answer_run_id_activity_key_followup_no_key" ON "answer"("run_id", "activity_key", "followup_no");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_answer_id_key" ON "assessment"("answer_id");

-- CreateIndex
CREATE UNIQUE INDEX "judge_result_assessment_id_judge_slot_key" ON "judge_result"("assessment_id", "judge_slot");

-- CreateIndex
CREATE INDEX "usage_cost_ai_job_id_idx" ON "usage_cost"("ai_job_id");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_flow_status_idx" ON "ScenarioRun"("userId", "flow", "status");

-- AddForeignKey
ALTER TABLE "run_event" ADD CONSTRAINT "run_event_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_ai_job_id_fkey" FOREIGN KEY ("ai_job_id") REFERENCES "ai_job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_result" ADD CONSTRAINT "judge_result_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "judge_score" ADD CONSTRAINT "judge_score_judge_result_id_fkey" FOREIGN KEY ("judge_result_id") REFERENCES "judge_result"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterion_grade" ADD CONSTRAINT "criterion_grade_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_job" ADD CONSTRAINT "ai_job_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "ScenarioRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_cost" ADD CONSTRAINT "usage_cost_ai_job_id_fkey" FOREIGN KEY ("ai_job_id") REFERENCES "ai_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Lượt chơi của luồng prototype đã chấm xong thì coi là FINISHED; lượt dở của
-- luồng prototype giữ IN_PROGRESS nhưng `flow = 'replay'`, nên luồng mới không đụng tới.
UPDATE "ScenarioRun" SET "status" = 'FINISHED' WHERE "completedAt" IS NOT NULL;
