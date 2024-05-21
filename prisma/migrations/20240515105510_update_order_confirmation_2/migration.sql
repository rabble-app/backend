/*
  Warnings:

  - The values [PARTIALLY_CONFIRMED] on the enum `OrderConfirmationStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `order_confirmation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum

SET enable_drop_enum_value = true;
ALTER TYPE "OrderConfirmationStatus" ADD VALUE 'PARTIAL';
ALTER TYPE "OrderConfirmationStatus"DROP VALUE 'PARTIALLY_CONFIRMED';

-- CreateIndex
CREATE UNIQUE INDEX "order_confirmation_order_id_key" ON "order_confirmation"("order_id");

-- CreateIndex
CREATE INDEX "order_confirmation_id_order_id_idx" ON "order_confirmation"("id", "order_id");
