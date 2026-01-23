-- AlterTable
ALTER TABLE "timer" ADD COLUMN     "category" TEXT DEFAULT 'custom',
ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT;

-- CreateIndex
CREATE INDEX "timer_category_idx" ON "timer"("category");
