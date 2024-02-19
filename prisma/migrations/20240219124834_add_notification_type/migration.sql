-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CHAT', 'TEAM', 'PAYMENT');

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "type" "NotificationType" NOT NULL DEFAULT 'TEAM';
