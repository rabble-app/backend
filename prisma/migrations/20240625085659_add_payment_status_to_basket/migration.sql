-- CreateEnum
CREATE TYPE "ProductPaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED');

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "payment_status" "ProductPaymentStatus" NOT NULL DEFAULT 'PENDING';
