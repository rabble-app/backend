/*
  Warnings:

  - A unique constraint covering the columns `[name,producer_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "products_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_name_producer_id_key" ON "products"("name", "producer_id");
