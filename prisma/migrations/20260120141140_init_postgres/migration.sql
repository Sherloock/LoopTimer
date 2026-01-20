-- CreateTable
CREATE TABLE "timer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timer_userId_idx" ON "timer"("userId");
