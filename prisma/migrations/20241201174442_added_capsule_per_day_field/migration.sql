-- AlterTable
ALTER TABLE "basket_c" ADD COLUMN     "capsule_per_day" DECIMAL(9,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "capsule_per_day" DECIMAL(9,2) NOT NULL DEFAULT 0;
