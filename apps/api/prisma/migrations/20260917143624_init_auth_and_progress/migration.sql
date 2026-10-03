-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'CONTRIBUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ConsentMethod" AS ENUM ('GUARDIAN_EMAIL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "dateOfBirth" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OAuthAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParentalConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "method" "ConsentMethod" NOT NULL DEFAULT 'GUARDIAN_EMAIL',
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentalConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameProfile" (
    "userId" TEXT NOT NULL,
    "fit" JSONB NOT NULL DEFAULT '{}',
    "quizDone" BOOLEAN NOT NULL DEFAULT false,
    "eventsPlayed" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioKey" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "seed" BIGINT NOT NULL,
    "actions" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "endingId" TEXT,
    "endingType" TEXT,
    "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,

    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RunEvidence" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "anchor" TEXT NOT NULL,
    "capped" BOOLEAN NOT NULL DEFAULT false,
    "why" TEXT NOT NULL,
    "quote" TEXT,
    "timeout" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RunEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBandSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserBandSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventAnswer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "choiceIndex" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "OAuthAccount_userId_idx" ON "OAuthAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OAuthAccount_provider_providerAccountId_key" ON "OAuthAccount"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentalConsent_userId_key" ON "ParentalConsent"("userId");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_completedAt_idx" ON "ScenarioRun"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_scenarioKey_idx" ON "ScenarioRun"("userId", "scenarioKey");

-- CreateIndex
CREATE INDEX "RunEvidence_runId_idx" ON "RunEvidence"("runId");

-- CreateIndex
CREATE INDEX "UserBandSkill_userId_idx" ON "UserBandSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBandSkill_userId_roleCode_band_key" ON "UserBandSkill"("userId", "roleCode", "band");

-- CreateIndex
CREATE INDEX "EventAnswer_userId_idx" ON "EventAnswer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnswer_userId_eventId_key" ON "EventAnswer"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "OAuthAccount" ADD CONSTRAINT "OAuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalConsent" ADD CONSTRAINT "ParentalConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameProfile" ADD CONSTRAINT "GameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioRun" ADD CONSTRAINT "ScenarioRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RunEvidence" ADD CONSTRAINT "RunEvidence_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ScenarioRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBandSkill" ADD CONSTRAINT "UserBandSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAnswer" ADD CONSTRAINT "EventAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
