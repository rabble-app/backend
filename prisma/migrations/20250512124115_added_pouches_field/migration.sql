-- AlterTable
ALTER TABLE "basket_c" ADD COLUMN     "pouches" INT4 NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "pouches" INT4 NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "top_up_baskets" ADD COLUMN     "pouches" INT4 NOT NULL DEFAULT 1;
