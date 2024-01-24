/*
  Warnings:

  - The `price` column on the `basket_c` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `price` column on the `baskets` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `amount` column on the `partitioned_product_users_record` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "basket_c" RENAME COLUMN "price" TO "price_drop";
ALTER TABLE "basket_c" DROP COLUMN "price_drop";
ALTER TABLE "basket_c" ADD COLUMN  "price" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "baskets" RENAME COLUMN "price" TO "price_drop";
ALTER TABLE "baskets" DROP COLUMN "price_drop";
ALTER TABLE "baskets" ADD COLUMN  "price" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "partitioned_product_users_record" RENAME COLUMN "amount" TO "amount_drop";
ALTER TABLE "partitioned_product_users_record" DROP COLUMN "amount_drop";
ALTER TABLE "partitioned_product_users_record" ADD COLUMN  "amount" DECIMAL(9,2) NOT NULL DEFAULT 0;
