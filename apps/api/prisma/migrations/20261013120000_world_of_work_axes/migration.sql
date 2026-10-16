-- Chỉ số mô tả người chơi chuyển sang World-of-Work Map (Prediger 1982):
-- trục Người–Vật cũ đổi tên thành People–Things, thêm trục Data–Ideas.
-- AlterTable
ALTER TABLE "GameProfile" RENAME COLUMN "quizOrientationSum" TO "quizPeopleThingsSum";
ALTER TABLE "GameProfile" RENAME COLUMN "quizOrientationN" TO "quizPeopleThingsN";
ALTER TABLE "GameProfile" ADD COLUMN     "quizDataIdeasSum" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "quizDataIdeasN" INTEGER NOT NULL DEFAULT 0;
