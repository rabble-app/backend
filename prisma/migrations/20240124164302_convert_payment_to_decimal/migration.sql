/*
  Warnings:

  - The `minimum_treshold` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `accumulated_amount` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `minimum_treshold` column on the `producers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "orders" RENAME COLUMN "minimum_treshold" TO "minimum_treshold_drop";
ALTER TABLE "orders" DROP COLUMN "minimum_treshold_drop";
ALTER TABLE "orders" ADD COLUMN     "minimum_treshold" DECIMAL(9,2) NOT NULL DEFAULT 0;

ALTER TABLE "orders" RENAME COLUMN "accumulated_amount" TO "accumulated_amount_drop";
ALTER TABLE "orders" DROP COLUMN "accumulated_amount_drop";
ALTER TABLE "orders" ADD COLUMN     "accumulated_amount" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" RENAME COLUMN "amount" TO "amount_drop";
ALTER TABLE "payments" DROP COLUMN "amount_drop";
ALTER TABLE "payments" ADD COLUMN  "amount" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "producers" RENAME COLUMN "minimum_treshold" TO "minimum_treshold_drop";
ALTER TABLE "producers" DROP COLUMN "minimum_treshold_drop";
ALTER TABLE "producers" ADD COLUMN     "minimum_treshold" DECIMAL(9,2) NOT NULL DEFAULT 5000.00;
