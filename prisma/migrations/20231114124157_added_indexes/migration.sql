/*
  Warnings:

  - You are about to drop the `producer_chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_chat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "producer_chat" DROP CONSTRAINT "producer_chat_host_id_fkey";

-- DropForeignKey
ALTER TABLE "producer_chat" DROP CONSTRAINT "producer_chat_producer_id_fkey";

-- DropForeignKey
ALTER TABLE "team_chat" DROP CONSTRAINT "team_chat_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_chat" DROP CONSTRAINT "team_chat_user_id_fkey";

-- DropTable
DROP TABLE "producer_chat";

-- DropTable
DROP TABLE "team_chat";

-- CreateTable
CREATE TABLE "chats" (
    "id" STRING NOT NULL,
    "team_id" STRING,
    "user_id" STRING NOT NULL,
    "producer_id" STRING,
    "text" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chats_user_id_team_id_producer_id_idx" ON "chats"("user_id", "team_id", "producer_id");

-- CreateIndex
CREATE INDEX "basket_c_id_user_id_team_id_idx" ON "basket_c"("id", "user_id", "team_id");

-- CreateIndex
CREATE INDEX "baskets_id_order_id_user_id_idx" ON "baskets"("id", "order_id", "user_id");

-- CreateIndex
CREATE INDEX "buying_teams_id_host_id_producer_id_idx" ON "buying_teams"("id", "host_id", "producer_id");

-- CreateIndex
CREATE INDEX "custom_delivery_address_id_idx" ON "custom_delivery_address"("id");

-- CreateIndex
CREATE INDEX "delivery_addresses_id_producerId_idx" ON "delivery_addresses"("id", "producerId");

-- CreateIndex
CREATE INDEX "followers_id_user_id_idx" ON "followers"("id", "user_id");

-- CreateIndex
CREATE INDEX "invites_id_team_id_status_idx" ON "invites"("id", "team_id", "status");

-- CreateIndex
CREATE INDEX "likes_user_id_product_id_producer_id_team_id_idx" ON "likes"("user_id", "product_id", "producer_id", "team_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "orders_id_team_id_status_idx" ON "orders"("id", "team_id", "status");

-- CreateIndex
CREATE INDEX "partitioned_product_users_record_id_user_id_partioned_baske_idx" ON "partitioned_product_users_record"("id", "user_id", "partioned_basket_id");

-- CreateIndex
CREATE INDEX "partitioned_products_basket_id_team_id_order_id_product_id_idx" ON "partitioned_products_basket"("id", "team_id", "order_id", "product_id");

-- CreateIndex
CREATE INDEX "payments_order_id_user_id_status_idx" ON "payments"("order_id", "user_id", "status");

-- CreateIndex
CREATE INDEX "producer_categories_id_producer_id_producer_category_option_idx" ON "producer_categories"("id", "producer_id", "producer_category_option_id");

-- CreateIndex
CREATE INDEX "producer_categories_options_id_idx" ON "producer_categories_options"("id");

-- CreateIndex
CREATE INDEX "producers_id_userId_idx" ON "producers"("id", "userId");

-- CreateIndex
CREATE INDEX "product_category_id_idx" ON "product_category"("id");

-- CreateIndex
CREATE INDEX "products_id_producer_id_category_id_idx" ON "products"("id", "producer_id", "category_id");

-- CreateIndex
CREATE INDEX "reviews_id_reviewer_id_producer_id_product_id_idx" ON "reviews"("id", "reviewer_id", "producer_id", "product_id");

-- CreateIndex
CREATE INDEX "search_count_keyword_category_idx" ON "search_count"("keyword", "category");

-- CreateIndex
CREATE INDEX "searches_user_id_idx" ON "searches"("user_id");

-- CreateIndex
CREATE INDEX "shippings_id_userId_idx" ON "shippings"("id", "userId");

-- CreateIndex
CREATE INDEX "team_members_id_team_id_user_id_status_idx" ON "team_members"("id", "team_id", "user_id", "status");

-- CreateIndex
CREATE INDEX "team_requests_id_team_id_user_id_status_idx" ON "team_requests"("id", "team_id", "user_id", "status");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
