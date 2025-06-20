-- AlterTable
ALTER TABLE "basket_c" ADD COLUMN     "discount" DECIMAL(9,2) NOT NULL DEFAULT 0;
ALTER TABLE "basket_c" ADD COLUMN     "price_per_count" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "discount" DECIMAL(9,2) NOT NULL DEFAULT 0;
ALTER TABLE "baskets" ADD COLUMN     "price_per_count" DECIMAL(9,2) NOT NULL DEFAULT 0;
