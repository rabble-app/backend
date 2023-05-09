/*
  Warnings:

  - Changed the type of `minimum_treshold` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "minimum_treshold";
ALTER TABLE "orders" ADD COLUMN     "minimum_treshold" INT4 NOT NULL;

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "minimum_treshold" INT4 NOT NULL DEFAULT 5000;
