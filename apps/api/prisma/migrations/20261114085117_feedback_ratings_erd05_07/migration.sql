-- CreateEnum
CREATE TYPE "feedback_status" AS ENUM ('NEW', 'HANDLED');

-- CreateTable
CREATE TABLE "app_feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "text" TEXT NOT NULL,
    "app_version" VARCHAR(20) NOT NULL,
    "status" "feedback_status" NOT NULL DEFAULT 'NEW',
    "handled_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "app_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation_rating" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "explorer_id" UUID NOT NULL,
    "occupation_id" UUID NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "occupation_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating_attribute" (
    "code" VARCHAR(30) NOT NULL,
    "sort_order" SMALLINT NOT NULL,

    CONSTRAINT "rating_attribute_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "rating_score" (
    "rating_id" UUID NOT NULL,
    "attribute_code" VARCHAR(30) NOT NULL,
    "score" SMALLINT NOT NULL,

    CONSTRAINT "rating_score_pkey" PRIMARY KEY ("rating_id","attribute_code")
);

-- CreateIndex
CREATE INDEX "app_feedback_status_created_at_idx" ON "app_feedback"("status", "created_at");

-- CreateIndex
CREATE INDEX "occupation_rating_occupation_id_idx" ON "occupation_rating"("occupation_id");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_rating_explorer_id_occupation_id_key" ON "occupation_rating"("explorer_id", "occupation_id");

-- AddForeignKey
ALTER TABLE "app_feedback" ADD CONSTRAINT "app_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_feedback" ADD CONSTRAINT "app_feedback_handled_by_fkey" FOREIGN KEY ("handled_by") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_rating" ADD CONSTRAINT "occupation_rating_explorer_id_fkey" FOREIGN KEY ("explorer_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occupation_rating" ADD CONSTRAINT "occupation_rating_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_score" ADD CONSTRAINT "rating_score_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "occupation_rating"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating_score" ADD CONSTRAINT "rating_score_attribute_code_fkey" FOREIGN KEY ("attribute_code") REFERENCES "rating_attribute"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- openapi `RatingInput`: mỗi tiêu chí 1–5.
ALTER TABLE "rating_score" ADD CONSTRAINT "rating_score_score_check" CHECK ("score" BETWEEN 1 AND 5);

-- Năm tiêu chí đánh giá nghề (D-27, DR-08): lương, áp lực, độ khó,
-- cân bằng công việc – cuộc sống, mức yêu thích.
INSERT INTO "rating_attribute" ("code", "sort_order") VALUES
    ('SALARY', 1),
    ('PRESSURE', 2),
    ('DIFFICULTY', 3),
    ('WORK_LIFE_BALANCE', 4),
    ('ENJOYMENT', 5);
