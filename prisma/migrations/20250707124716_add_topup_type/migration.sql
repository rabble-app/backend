-- CreateEnum
CREATE TYPE "TopUpType" AS ENUM ('ALIGNMENT', 'TOPUP');

-- AlterTable
ALTER TABLE "top_up_baskets" ADD COLUMN     "type" "TopUpType" NOT NULL DEFAULT 'ALIGNMENT';
