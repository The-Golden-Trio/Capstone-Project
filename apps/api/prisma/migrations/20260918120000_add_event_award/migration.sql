-- CreateTable
CREATE TABLE "EventAward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "band" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventAward_userId_idx" ON "EventAward"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventAward_userId_eventId_band_key" ON "EventAward"("userId", "eventId", "band");

-- AddForeignKey
ALTER TABLE "EventAward" ADD CONSTRAINT "EventAward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
