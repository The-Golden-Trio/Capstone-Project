-- ERD-01: chuyển danh tính từ bảng prototype "User" (id cuid, 3 vai) sang
-- user_account (id uuid) + user_role (4 vai) + google_identity, và trỏ lại
-- khoá ngoại của các bảng explorer. Giữ dữ liệu: mỗi "User" thành một
-- user_account với uuid mới; bảng con được đổi khoá qua cột tạm legacy_id.
-- Lệch ERD đã duyệt (07 A22): user_account giữ thêm username, date_of_birth.
-- Không chép "RefreshToken": đổi sang bearer thì mọi phiên cũ phải đăng nhập lại.
-- Vai cũ (07 A23): USER -> EXPLORER; ADMIN -> EXPLORER + SYSTEM_ADMIN;
-- CONTRIBUTOR -> EXPLORER.

BEGIN;

-- CreateEnum
CREATE TYPE "user_role_kind" AS ENUM ('EXPLORER', 'DOMAIN_EXPERT', 'CONTENT_ADMIN', 'SYSTEM_ADMIN');

-- CreateEnum
CREATE TYPE "account_status" AS ENUM ('ACTIVE', 'DISABLED', 'DELETED');

-- CreateEnum
CREATE TYPE "staff_role_kind" AS ENUM ('CONTENT_ADMIN', 'DOMAIN_EXPERT');

-- CreateEnum
CREATE TYPE "occupation_status" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');

-- CreateEnum
CREATE TYPE "notification_channel" AS ENUM ('IN_APP', 'EMAIL');

-- user_account, kèm cột tạm legacy_id để ánh xạ id cũ
CREATE TABLE "user_account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(254),
    "username" VARCHAR(32),
    "password_hash" TEXT,
    "display_name" VARCHAR(80),
    "date_of_birth" DATE,
    "status" "account_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_sign_in_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "legacy_id" TEXT NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_account_legacy_id_key" UNIQUE ("legacy_id")
);

INSERT INTO "user_account" ("email", "username", "password_hash", "display_name", "date_of_birth", "created_at", "legacy_id")
SELECT "email", left("username", 32), "passwordHash", left("displayName", 80), "dateOfBirth", "createdAt", "id"
FROM "User";

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" UUID NOT NULL,
    "role" "user_role_kind" NOT NULL,
    "granted_by" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role")
);

-- CreateTable
CREATE TABLE "google_identity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "google_sub" VARCHAR(255) NOT NULL,
    "linked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_assignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "occupation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "staff_role_kind" NOT NULL,
    "assigned_by" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "staff_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "refresh_token_hash" CHAR(64) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_token" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" BIGSERIAL NOT NULL,
    "actor_id" UUID,
    "action" VARCHAR(64) NOT NULL,
    "target_type" VARCHAR(40),
    "target_id" UUID,
    "detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "summary" TEXT,
    "riasec_code" VARCHAR(3),
    "status" "occupation_status" NOT NULL DEFAULT 'DRAFT',
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "retired_at" TIMESTAMP(3),

    CONSTRAINT "occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_id" UUID NOT NULL,
    "channel" "notification_channel" NOT NULL,
    "template" VARCHAR(60) NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

INSERT INTO "user_role" ("user_id", "role", "granted_at")
SELECT ua."id", 'EXPLORER'::"user_role_kind", ua."created_at" FROM "user_account" ua;

INSERT INTO "user_role" ("user_id", "role", "granted_at")
SELECT ua."id", 'SYSTEM_ADMIN'::"user_role_kind", ua."created_at"
FROM "user_account" ua JOIN "User" u ON u."id" = ua."legacy_id"
WHERE u."role" = 'ADMIN';

INSERT INTO "google_identity" ("user_id", "google_sub", "linked_at")
SELECT ua."id", left(o."providerAccountId", 255), o."createdAt"
FROM "OAuthAccount" o JOIN "user_account" ua ON ua."legacy_id" = o."userId"
WHERE o."provider" = 'google';

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventAnswer" DROP CONSTRAINT "EventAnswer_userId_fkey";

-- DropForeignKey
ALTER TABLE "EventAward" DROP CONSTRAINT "EventAward_userId_fkey";

-- DropForeignKey
ALTER TABLE "GameProfile" DROP CONSTRAINT "GameProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "OAuthAccount" DROP CONSTRAINT "OAuthAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "ParentalConsent" DROP CONSTRAINT "ParentalConsent_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScenarioRun" DROP CONSTRAINT "ScenarioRun_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserBandSkill" DROP CONSTRAINT "UserBandSkill_userId_fkey";


-- GameProfile: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "GameProfile" ADD COLUMN "user_uuid" UUID;
UPDATE "GameProfile" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "GameProfile" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "GameProfile" DROP COLUMN "userId";
ALTER TABLE "GameProfile" RENAME COLUMN "user_uuid" TO "userId";

-- ScenarioRun: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "ScenarioRun" ADD COLUMN "user_uuid" UUID;
UPDATE "ScenarioRun" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "ScenarioRun" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "ScenarioRun" DROP COLUMN "userId";
ALTER TABLE "ScenarioRun" RENAME COLUMN "user_uuid" TO "userId";

-- UserBandSkill: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "UserBandSkill" ADD COLUMN "user_uuid" UUID;
UPDATE "UserBandSkill" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "UserBandSkill" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "UserBandSkill" DROP COLUMN "userId";
ALTER TABLE "UserBandSkill" RENAME COLUMN "user_uuid" TO "userId";

-- EventAnswer: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "EventAnswer" ADD COLUMN "user_uuid" UUID;
UPDATE "EventAnswer" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "EventAnswer" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "EventAnswer" DROP COLUMN "userId";
ALTER TABLE "EventAnswer" RENAME COLUMN "user_uuid" TO "userId";

-- EventAward: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "EventAward" ADD COLUMN "user_uuid" UUID;
UPDATE "EventAward" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "EventAward" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "EventAward" DROP COLUMN "userId";
ALTER TABLE "EventAward" RENAME COLUMN "user_uuid" TO "userId";

-- Enrollment: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "Enrollment" ADD COLUMN "user_uuid" UUID;
UPDATE "Enrollment" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "Enrollment" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "Enrollment" DROP COLUMN "userId";
ALTER TABLE "Enrollment" RENAME COLUMN "user_uuid" TO "userId";

-- ParentalConsent: "userId" text (cuid) -> uuid của user_account
ALTER TABLE "ParentalConsent" ADD COLUMN "user_uuid" UUID;
UPDATE "ParentalConsent" t SET "user_uuid" = ua."id" FROM "user_account" ua WHERE ua."legacy_id" = t."userId";
ALTER TABLE "ParentalConsent" ALTER COLUMN "user_uuid" SET NOT NULL;
ALTER TABLE "ParentalConsent" DROP COLUMN "userId";
ALTER TABLE "ParentalConsent" RENAME COLUMN "user_uuid" TO "userId";

ALTER TABLE "GameProfile" ADD CONSTRAINT "GameProfile_pkey" PRIMARY KEY ("userId");

DROP TABLE "OAuthAccount";
DROP TABLE "RefreshToken";
DROP TABLE "User";
DROP TYPE "Role";

ALTER TABLE "user_account" DROP CONSTRAINT "user_account_legacy_id_key";
ALTER TABLE "user_account" DROP COLUMN "legacy_id";

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_username_key" ON "user_account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "google_identity_user_id_key" ON "google_identity"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_identity_google_sub_key" ON "google_identity"("google_sub");

-- CreateIndex
CREATE INDEX "staff_assignment_user_id_idx" ON "staff_assignment"("user_id");

-- CreateIndex
CREATE INDEX "staff_assignment_occupation_id_idx" ON "staff_assignment"("occupation_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_refresh_token_hash_key" ON "auth_session"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "auth_session_user_id_idx" ON "auth_session"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_token_token_hash_key" ON "password_reset_token"("token_hash");

-- CreateIndex
CREATE INDEX "password_reset_token_user_id_idx" ON "password_reset_token"("user_id");

-- CreateIndex
CREATE INDEX "activity_log_actor_id_created_at_idx" ON "activity_log"("actor_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "domain_code_key" ON "domain"("code");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_code_key" ON "occupation"("code");

-- CreateIndex
CREATE INDEX "occupation_domain_id_idx" ON "occupation"("domain_id");

-- CreateIndex
CREATE INDEX "notification_recipient_id_channel_created_at_idx" ON "notification"("recipient_id", "channel", "created_at");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_userId_roleCode_band_key" ON "Enrollment"("userId", "roleCode", "band");

-- CreateIndex
CREATE INDEX "EventAnswer_userId_idx" ON "EventAnswer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAnswer_userId_eventId_key" ON "EventAnswer"("userId", "eventId");

-- CreateIndex
CREATE INDEX "EventAward_userId_idx" ON "EventAward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAward_userId_eventId_band_key" ON "EventAward"("userId", "eventId", "band");

-- CreateIndex
CREATE UNIQUE INDEX "ParentalConsent_userId_key" ON "ParentalConsent"("userId");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_completedAt_idx" ON "ScenarioRun"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_scenarioKey_idx" ON "ScenarioRun"("userId", "scenarioKey");

-- CreateIndex
CREATE INDEX "ScenarioRun_userId_flow_status_idx" ON "ScenarioRun"("userId", "flow", "status");

-- CreateIndex
CREATE INDEX "UserBandSkill_userId_idx" ON "UserBandSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBandSkill_userId_roleCode_band_key" ON "UserBandSkill"("userId", "roleCode", "band");

-- FR-40: mỗi nghề đúng một Content Admin còn hiệu lực (Prisma không khai được partial index).
CREATE UNIQUE INDEX "staff_assignment_one_active_ca" ON "staff_assignment"("occupation_id") WHERE "role" = 'CONTENT_ADMIN' AND "ended_at" IS NULL;

-- Một người không giữ cùng vai hai lần ở cùng nghề khi còn hiệu lực.
CREATE UNIQUE INDEX "staff_assignment_active_member" ON "staff_assignment"("occupation_id", "user_id", "role") WHERE "ended_at" IS NULL;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "google_identity" ADD CONSTRAINT "google_identity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_assignment" ADD CONSTRAINT "staff_assignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentalConsent" ADD CONSTRAINT "ParentalConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain" ADD CONSTRAINT "domain_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation" ADD CONSTRAINT "occupation_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation" ADD CONSTRAINT "occupation_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameProfile" ADD CONSTRAINT "GameProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioRun" ADD CONSTRAINT "ScenarioRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBandSkill" ADD CONSTRAINT "UserBandSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAnswer" ADD CONSTRAINT "EventAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAward" ADD CONSTRAINT "EventAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
