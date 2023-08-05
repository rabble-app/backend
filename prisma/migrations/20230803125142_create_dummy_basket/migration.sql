-- CreateTable
CREATE TABLE "basket_copy" (
    "id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "basket_copy_order_id_user_id_product_id_key" ON "basket_copy"("order_id", "user_id", "product_id");

-- AddForeignKey
ALTER TABLE "basket_copy" ADD CONSTRAINT "basket_copy_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_copy" ADD CONSTRAINT "basket_copy_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_copy" ADD CONSTRAINT "basket_copy_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
