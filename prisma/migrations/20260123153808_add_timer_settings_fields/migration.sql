-- AlterTable
ALTER TABLE "timer" ADD COLUMN     "colors" JSONB,
ADD COLUMN     "defaultAlarm" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isSpeakNames" BOOLEAN;

-- AlterTable
ALTER TABLE "timer_template" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT;

-- Migrate existing data from timer.data JSON to new columns
-- Extract colors, defaultAlarm, and speakNames from timer.data JSON
UPDATE "timer"
SET 
  "colors" = CASE 
    WHEN (data->>'colors') IS NOT NULL THEN (data->>'colors')::jsonb
    ELSE NULL
  END,
  "defaultAlarm" = CASE 
    WHEN (data->>'defaultAlarm') IS NOT NULL THEN data->>'defaultAlarm'
    ELSE 'beep-1x'
  END,
  "isSpeakNames" = CASE 
    WHEN (data->>'speakNames') IS NOT NULL THEN (data->>'speakNames')::boolean
    ELSE true
  END
WHERE data IS NOT NULL;

-- Set defaults for NULL values
UPDATE "timer"
SET 
  "defaultAlarm" = 'beep-1x'
WHERE "defaultAlarm" IS NULL;

UPDATE "timer"
SET 
  "isSpeakNames" = true
WHERE "isSpeakNames" IS NULL;

-- Make columns NOT NULL after data migration
ALTER TABLE "timer" ALTER COLUMN "defaultAlarm" SET NOT NULL;
ALTER TABLE "timer" ALTER COLUMN "defaultAlarm" SET DEFAULT 'beep-1x';
ALTER TABLE "timer" ALTER COLUMN "isSpeakNames" SET NOT NULL;
ALTER TABLE "timer" ALTER COLUMN "isSpeakNames" SET DEFAULT true;
