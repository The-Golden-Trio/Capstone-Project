-- CreateTable
CREATE TABLE "ContentRelease" (
    "version" INTEGER NOT NULL,
    "seededAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContentRelease_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "RoleDoc" (
    "version" INTEGER NOT NULL,
    "roleCode" TEXT NOT NULL,
    "nameVn" TEXT NOT NULL,
    "roleGroup" TEXT NOT NULL,
    "bandStart" TEXT NOT NULL,
    "bandEnd" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "RoleDoc_pkey" PRIMARY KEY ("version","roleCode")
);

-- CreateTable
CREATE TABLE "ScenarioDoc" (
    "version" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortname" TEXT,
    "body" JSONB NOT NULL,

    CONSTRAINT "ScenarioDoc_pkey" PRIMARY KEY ("version","key")
);

-- CreateTable
CREATE TABLE "SharedEventDoc" (
    "version" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "SharedEventDoc_pkey" PRIMARY KEY ("version","eventId")
);

-- CreateTable
CREATE TABLE "QuizQuestionDoc" (
    "version" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "QuizQuestionDoc_pkey" PRIMARY KEY ("version","questionId")
);

-- CreateTable
CREATE TABLE "FollowupDoc" (
    "version" INTEGER NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "FollowupDoc_pkey" PRIMARY KEY ("version","scenarioKey","activityId")
);

-- CreateTable
CREATE TABLE "GalaxyDoc" (
    "version" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "GalaxyDoc_pkey" PRIMARY KEY ("version","kind","key")
);

-- CreateTable
CREATE TABLE "MetaDoc" (
    "version" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "body" JSONB NOT NULL,

    CONSTRAINT "MetaDoc_pkey" PRIMARY KEY ("version","key")
);

-- CreateIndex
CREATE INDEX "ContentRelease_active_idx" ON "ContentRelease"("active");

-- CreateIndex
CREATE INDEX "ScenarioDoc_version_roleCode_band_idx" ON "ScenarioDoc"("version", "roleCode", "band");

-- AlterTable
ALTER TABLE "ScenarioRun" ADD COLUMN     "contentVersion" INTEGER NOT NULL DEFAULT 0;
