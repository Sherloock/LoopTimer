-- CreateTable
CREATE TABLE "timer_template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "cloneCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timer_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_timer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_timer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timer_template_userId_idx" ON "timer_template"("userId");

-- CreateIndex
CREATE INDEX "timer_template_category_isPublic_idx" ON "timer_template"("category", "isPublic");

-- CreateIndex
CREATE INDEX "timer_template_isPublic_createdAt_idx" ON "timer_template"("isPublic", "createdAt");

-- CreateIndex
CREATE INDEX "shared_timer_id_idx" ON "shared_timer"("id");

-- CreateIndex
CREATE INDEX "shared_timer_userId_idx" ON "shared_timer"("userId");

-- CreateIndex
CREATE INDEX "shared_timer_expiresAt_idx" ON "shared_timer"("expiresAt");
