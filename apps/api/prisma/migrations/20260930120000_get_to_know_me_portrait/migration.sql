-- Get to Know Me: trục Người–Vật, câu tự luận, đoạn mô tả người chơi (FR-13).
-- AlterTable
ALTER TABLE "GameProfile" ADD COLUMN     "quizOrientationSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quizOrientationN" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stage" TEXT,
ADD COLUMN     "quizTexts" JSONB,
ADD COLUMN     "quizTextFit" JSONB,
ADD COLUMN     "quizTextEvidence" JSONB,
ADD COLUMN     "quizTextReadAt" TIMESTAMP(3),
ADD COLUMN     "portraitText" TEXT,
ADD COLUMN     "portraitSource" TEXT,
ADD COLUMN     "portraitModel" TEXT,
ADD COLUMN     "portraitBasis" TEXT,
ADD COLUMN     "portraitAt" TIMESTAMP(3);
