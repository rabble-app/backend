-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SINGLE', 'PORTIONED_SINGLE_PRODUCT', 'PORTIONED_DYNAMIC_PRODUCT');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "thresholdQuantity" INT4;
ALTER TABLE "products" ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SINGLE';

-- CreateTable
CREATE TABLE "partitioned_products_basket" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "threshold" INT4 NOT NULL,
    "accumulator" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partitioned_products_basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partitioned_product_users_record" (
    "id" STRING NOT NULL,
    "partioned_basket_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "amount" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partitioned_product_users_record_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "partitioned_products_basket" ADD CONSTRAINT "partitioned_products_basket_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partitioned_products_basket" ADD CONSTRAINT "partitioned_products_basket_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partitioned_products_basket" ADD CONSTRAINT "partitioned_products_basket_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partitioned_product_users_record" ADD CONSTRAINT "partitioned_product_users_record_partioned_basket_id_fkey" FOREIGN KEY ("partioned_basket_id") REFERENCES "partitioned_products_basket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partitioned_product_users_record" ADD CONSTRAINT "partitioned_product_users_record_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
