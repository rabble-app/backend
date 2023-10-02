-- AlterTable
ALTER TABLE "basket_c" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SINGLE';

-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SINGLE';
