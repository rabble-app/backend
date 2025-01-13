-- CreateEnum
CREATE TYPE "TopUpDeliveryStatus" AS ENUM ('PENDING', 'DELIVERED');

-- CreateTable
CREATE TABLE "top_up_baskets" (
    "id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" DECIMAL(9,2) NOT NULL DEFAULT 0,
    "delivery_status" "TopUpDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "top_up_baskets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "top_up_baskets_id_order_id_user_id_idx" ON "top_up_baskets"("id", "order_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "top_up_baskets_order_id_user_id_product_id_key" ON "top_up_baskets"("order_id", "user_id", "product_id");

-- AddForeignKey
ALTER TABLE "top_up_baskets" ADD CONSTRAINT "top_up_baskets_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_up_baskets" ADD CONSTRAINT "top_up_baskets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "top_up_baskets" ADD CONSTRAINT "top_up_baskets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
