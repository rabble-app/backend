-- CreateTable
CREATE TABLE "collection_items" (
    "id" STRING NOT NULL,
    "collection_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_items_id_collection_id_idx" ON "collection_items"("id", "collection_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_product_id_key" ON "collection_items"("collection_id", "product_id");

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
