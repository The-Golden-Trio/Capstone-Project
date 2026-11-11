-- Ca làm (seed v2, Game Design W45): luồng chơi từng lượt theo chuỗi sự kiện.
-- Sinh bằng prisma migrate diff; thêm tay đoạn backfill ở cuối.

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('IN_PROGRESS', 'FINISHED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "RunEventType" AS ENUM ('PLAYER_INPUT', 'AI_NARRATION', 'AI_CHECKS', 'RUN_PAUSED');

-- CreateEnum
CREATE TYPE "TurnStatus" AS ENUM ('PENDING', 'DONE', 'PAUSED');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'HANDLED');

-- AlterTable
ALTER TABLE "ScenarioRun" ADD COLUMN     "currentNodeId" TEXT,
ADD COLUMN     "enrolmentId" TEXT,
ADD COLUMN     "isPlaytest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "schemaVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "seedId" TEXT,
ADD COLUMN     "status" "RunStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- CreateTable
CREATE TABLE "run_event" (
    "id" BIGSERIAL NOT NULL,
    "runId" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "type" "RunEventType" NOT NULL,
    "turnId" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "run_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "text" TEXT,
    "payload" JSONB NOT NULL,
    "status" "TurnStatus" NOT NULL DEFAULT 'PENDING',
    "jobId" TEXT,
    "lineFrom" INTEGER NOT NULL,
    "lineTo" INTEGER,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_feedback" (
    "runId" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_feedback_pkey" PRIMARY KEY ("runId")
);

-- CreateTable
CREATE TABLE "content_flag" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "activityKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_note" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftSeedDoc" (
    "version" INTEGER NOT NULL,
    "seedId" TEXT NOT NULL,
    "levelRef" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "ShiftSeedDoc_pkey" PRIMARY KEY ("version","seedId")
);

-- CreateTable
CREATE TABLE "LevelPackDoc" (
    "version" INTEGER NOT NULL,
    "packId" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "LevelPackDoc_pkey" PRIMARY KEY ("version","packId")
);

-- CreateIndex
CREATE UNIQUE INDEX "run_event_runId_seq_key" ON "run_event"("runId", "seq");

-- CreateIndex
CREATE INDEX "answer_runId_status_idx" ON "answer"("runId", "status");

-- CreateIndex
CREATE INDEX "content_flag_status_idx" ON "content_flag"("status");

-- CreateIndex
CREATE INDEX "player_note_runId_idx" ON "player_note"("runId");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_seedId_status_idx" ON "ScenarioRun"("userId", "seedId", "status");

-- AddForeignKey
ALTER TABLE "ScenarioRun" ADD CONSTRAINT "ScenarioRun_enrolmentId_fkey" FOREIGN KEY ("enrolmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "run_event" ADD CONSTRAINT "run_event_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer" ADD CONSTRAINT "answer_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_feedback" ADD CONSTRAINT "scenario_feedback_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_flag" ADD CONSTRAINT "content_flag_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_note" ADD CONSTRAINT "player_note_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Backfill: lượt prototype cũ. Có completedAt là đã xong; chưa xong thì coi như
-- bỏ dở, để không bị nhận nhầm là lượt ca làm đang chơi.
UPDATE "ScenarioRun" SET "status" = 'FINISHED' WHERE "completedAt" IS NOT NULL;
UPDATE "ScenarioRun" SET "status" = 'ABANDONED' WHERE "completedAt" IS NULL;
