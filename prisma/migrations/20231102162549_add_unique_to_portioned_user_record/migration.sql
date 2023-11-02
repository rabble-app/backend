/*
  Warnings:

  - A unique constraint covering the columns `[partioned_basket_id,user_id]` on the table `partitioned_product_users_record` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "partitioned_product_users_record_partioned_basket_id_user_i_key" ON "partitioned_product_users_record"("partioned_basket_id", "user_id");
