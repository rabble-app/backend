/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `buying_teams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `producer_categories_options` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[business_name]` on the table `producers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `product_category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "buying_teams_name_key" ON "buying_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "producer_categories_options_name_key" ON "producer_categories_options"("name");

-- CreateIndex
CREATE UNIQUE INDEX "producers_business_name_key" ON "producers"("business_name");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_name_key" ON "product_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");
