-- Ca làm (Game Design W45): bảng nội dung cho seed ca làm và gói cấp.

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
