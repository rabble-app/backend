/*
  Warnings:

  - A unique constraint covering the columns `[order_id,user_id,product_id]` on the table `basket` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,follower_id]` on the table `followers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,user_id]` on the table `invites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,product_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,producer_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,team_id]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[producer_id,producer_category_option_id]` on the table `producer_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,user_id]` on the table `team_members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[team_id,user_id]` on the table `team_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "basket_order_id_user_id_product_id_key" ON "basket"("order_id", "user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "followers_user_id_follower_id_key" ON "followers"("user_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_team_id_user_id_key" ON "invites"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_product_id_key" ON "likes"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_producer_id_key" ON "likes"("user_id", "producer_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_team_id_key" ON "likes"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "producer_categories_producer_id_producer_category_option_id_key" ON "producer_categories"("producer_id", "producer_category_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_requests_team_id_user_id_key" ON "team_requests"("team_id", "user_id");
