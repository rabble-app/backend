/*
  Warnings:

  - You are about to drop the `basket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "basket" DROP CONSTRAINT "basket_order_id_fkey";

-- DropForeignKey
ALTER TABLE "basket" DROP CONSTRAINT "basket_product_id_fkey";

-- DropForeignKey
ALTER TABLE "basket" DROP CONSTRAINT "basket_user_id_fkey";

-- DropForeignKey
ALTER TABLE "basket_c" DROP CONSTRAINT "basket_c_product_id_fkey";

-- DropForeignKey
ALTER TABLE "basket_c" DROP CONSTRAINT "basket_c_team_id_fkey";

-- DropForeignKey
ALTER TABLE "buying_teams" DROP CONSTRAINT "buying_teams_host_id_fkey";

-- DropForeignKey
ALTER TABLE "buying_teams" DROP CONSTRAINT "buying_teams_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "custom_delivery_address" DROP CONSTRAINT "custom_delivery_address_deliveryAddressId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_addresses" DROP CONSTRAINT "delivery_addresses_producerId_fkey";

-- DropForeignKey
ALTER TABLE "followers" DROP CONSTRAINT "followers_follower_id_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_product_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_order_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_order_id_fkey";

-- DropForeignKey
ALTER TABLE "producer_categories" DROP CONSTRAINT "producer_categories_producer_category_option_id_fkey";

-- DropForeignKey
ALTER TABLE "producer_categories" DROP CONSTRAINT "producer_categories_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "recently_viewed" DROP CONSTRAINT "recently_viewed_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "recently_viewed" DROP CONSTRAINT "recently_viewed_product_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_product_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_reviewer_id_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "paymentIntentId" DROP NOT NULL;

-- DropTable
DROP TABLE "basket";

-- CreateTable
CREATE TABLE "baskets" (
    "id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baskets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "baskets_order_id_user_id_product_id_key" ON "baskets"("order_id", "user_id", "product_id");

-- AddForeignKey
ALTER TABLE "producer_categories" ADD CONSTRAINT "producer_categories_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_categories" ADD CONSTRAINT "producer_categories_producer_category_option_id_fkey" FOREIGN KEY ("producer_category_option_id") REFERENCES "producer_categories_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buying_teams" ADD CONSTRAINT "buying_teams_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buying_teams" ADD CONSTRAINT "buying_teams_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_delivery_address" ADD CONSTRAINT "custom_delivery_address_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "delivery_addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_c" ADD CONSTRAINT "basket_c_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_c" ADD CONSTRAINT "basket_c_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
