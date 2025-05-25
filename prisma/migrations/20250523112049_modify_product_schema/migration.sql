/*
  Warnings:

  - You are about to drop the column `pouches` on the `basket_c` table. All the data in the column will be lost.
  - You are about to drop the column `pouches` on the `baskets` table. All the data in the column will be lost.
  - You are about to drop the column `pouches` on the `top_up_baskets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "basket_c" DROP COLUMN "pouches";

-- AlterTable
ALTER TABLE "baskets" DROP COLUMN "pouches";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "grams_per_count" DECIMAL(65,30) DEFAULT 0;
ALTER TABLE "products" ADD COLUMN     "pouche_size" DECIMAL(65,30) DEFAULT 0;

-- AlterTable
ALTER TABLE "top_up_baskets" DROP COLUMN "pouches";
