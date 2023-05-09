/*
  Warnings:

  - You are about to drop the column `Status` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "Status";
ALTER TABLE "payments" ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
