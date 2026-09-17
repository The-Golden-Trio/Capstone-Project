/*
  Warnings:

  - You are about to drop the column `fit` on the `GameProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GameProfile" DROP COLUMN "fit",
ADD COLUMN     "quizFit" JSONB NOT NULL DEFAULT '{}';
