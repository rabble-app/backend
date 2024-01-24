/*
  Warnings:

  - The `price` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `retail_price` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `vat` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" RENAME COLUMN "price" TO "price_drop";
ALTER TABLE "products" DROP COLUMN "price_drop";
ALTER TABLE "products" ADD COLUMN     "price" DECIMAL(9,2) NOT NULL DEFAULT 0;

ALTER TABLE "products" RENAME COLUMN "retail_price" TO "retail_price_drop";
ALTER TABLE "products" DROP COLUMN "retail_price_drop";
ALTER TABLE "products" ADD COLUMN  "retail_price" DECIMAL(9,2) DEFAULT 0;

ALTER TABLE "products" RENAME COLUMN "vat" TO "vat_drop";
ALTER TABLE "products" DROP COLUMN "vat_drop";
ALTER TABLE "products" ADD COLUMN   "vat" DECIMAL(9,2) DEFAULT 0;
