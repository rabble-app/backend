/*
  Warnings:

  - The `wholesale_price` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" RENAME COLUMN "wholesale_price" TO "wholesale_price_drop";
ALTER TABLE "products" DROP COLUMN "wholesale_price_drop";
ALTER TABLE "products" ADD COLUMN     "wholesale_price" DECIMAL(9,2) DEFAULT 0;
-- ALTER TABLE "products" DROP COLUMN "wholesale_price";
-- ALTER TABLE "products" ADD COLUMN     "wholesale_price" DECIMAL(9,2) DEFAULT 0;
