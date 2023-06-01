/*
  Warnings:

  - The `price` column on the `basket` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `price` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "basket" DROP COLUMN "price";
ALTER TABLE "basket" ADD COLUMN     "price" INT4 NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "accumulated_amount" INT4 NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "price";
ALTER TABLE "products" ADD COLUMN     "price" INT4 NOT NULL DEFAULT 0;
