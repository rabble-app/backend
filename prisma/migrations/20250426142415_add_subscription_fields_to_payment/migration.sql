-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('YEARLY_SUBSCRIPTION', 'OTHERS');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "expiry_date" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN     "type" "PaymentType" NOT NULL DEFAULT 'OTHERS';
