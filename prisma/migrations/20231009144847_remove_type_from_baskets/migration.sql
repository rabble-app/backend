/*
  Warnings:

  - You are about to drop the column `type` on the `basket_c` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `baskets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "basket_c" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "baskets" DROP COLUMN "type";
