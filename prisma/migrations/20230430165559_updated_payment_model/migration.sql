/*
  Warnings:

  - Added the required column `paymentIntentId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'INTENT_CREATED', 'CAPTURED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "Status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "payments" ADD COLUMN     "paymentIntentId" STRING NOT NULL;
