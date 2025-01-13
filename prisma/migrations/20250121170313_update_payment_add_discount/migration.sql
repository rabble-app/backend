-- DropIndex
DROP INDEX "top_up_baskets_order_id_user_id_product_id_key";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "coupon_id" STRING;
ALTER TABLE "payments" ADD COLUMN     "discount" DECIMAL(9,2) NOT NULL DEFAULT 0;
