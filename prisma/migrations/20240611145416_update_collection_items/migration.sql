/*
  Warnings:

  - You are about to drop the column `amount` on the `collection_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "collection_items" DROP COLUMN "amount";
ALTER TABLE "collection_items" ADD COLUMN     "quantity" DECIMAL(9,2) NOT NULL DEFAULT 0;
