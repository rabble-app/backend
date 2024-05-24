/*
  Warnings:

  - You are about to drop the column `confirmer_id` on the `order_confirmation` table. All the data in the column will be lost.
  - You are about to drop the column `confirm_delivery` on the `orders` table. All the data in the column will be lost.
  - Added the required column `confirmed_by` to the `order_confirmation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PARTIALLY_CONFIRMED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "order_confirmation" DROP CONSTRAINT "order_confirmation_confirmer_id_fkey";

-- AlterTable
ALTER TABLE "order_confirmation" DROP COLUMN "confirmer_id";
ALTER TABLE "order_confirmation" ADD COLUMN     "confirmed_by" STRING NOT NULL;

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "confirm_delivery";
ALTER TABLE "orders" ADD COLUMN     "confirmation_status" "OrderConfirmationStatus" NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "order_confirmation" ADD CONSTRAINT "order_confirmation_confirmed_by_fkey" FOREIGN KEY ("confirmed_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
