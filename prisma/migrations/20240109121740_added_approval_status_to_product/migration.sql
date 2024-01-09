/*
  Warnings:

  - You are about to drop the column `approved` on the `products` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REMOVED');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "approved";
ALTER TABLE "products" ADD COLUMN     "approval_status" "ProductApprovalStatus" NOT NULL DEFAULT 'PENDING';
