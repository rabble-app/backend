-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('CUSTOM', 'WEEKLY');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'PRODUCER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('OUT_OF_STOCK', 'IN_STOCK', 'RUNNING_LOW');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'FAILED', 'INTENT_CREATED', 'CAPTURED');

-- CreateEnum
CREATE TYPE "SearchCategory" AS ENUM ('SUPPLIER', 'PRODUCT', 'TEAM');

-- CreateEnum
CREATE TYPE "DayOptions" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "phone" STRING NOT NULL,
    "email" STRING,
    "password" STRING,
    "first_name" STRING,
    "last_name" STRING,
    "postal_code" STRING,
    "stripe_customer_id" STRING,
    "stripe_default_payment_method_id" STRING,
    "card_last_four_digits" STRING,
    "image_url" STRING DEFAULT 'https://rabble-dev1.s3.us-east-2.amazonaws.com/profile/img.png',
    "image_key" STRING,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producers" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "is_verified" BOOL NOT NULL DEFAULT false,
    "image_url" STRING DEFAULT 'https://rabble-dev1.s3.us-east-2.amazonaws.com/suppliers/Frame+9.png',
    "image_key" STRING,
    "business_name" STRING NOT NULL,
    "business_address" STRING,
    "acounts_email" STRING,
    "sales_email" STRING,
    "minimum_treshold" INT4 NOT NULL DEFAULT 5000,
    "website" STRING,
    "description" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_categories_options" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_categories_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_categories" (
    "id" STRING NOT NULL,
    "producer_id" STRING NOT NULL,
    "producer_category_option_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shippings" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "building_no" STRING,
    "address" STRING NOT NULL,
    "city" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shippings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "image_url" STRING,
    "image_key" STRING,
    "description" STRING,
    "producer_id" STRING NOT NULL,
    "category_id" STRING,
    "price" INT4 NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'IN_STOCK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_category" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buying_teams" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "postal_code" STRING NOT NULL,
    "producer_id" STRING NOT NULL,
    "host_id" STRING NOT NULL,
    "frequency" INT4 NOT NULL DEFAULT 104500,
    "description" STRING,
    "is_public" BOOL NOT NULL DEFAULT true,
    "image_url" STRING DEFAULT 'https://rabble-dev1.s3.us-east-2.amazonaws.com/teams/renaissance16.png',
    "image_key" STRING,
    "next_delivery_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buying_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" STRING NOT NULL,
    "text" STRING NOT NULL,
    "reviewer_id" STRING NOT NULL,
    "producer_id" STRING,
    "product_id" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "status" "TeamStatus" NOT NULL,
    "skipNextDelivery" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_requests" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "introduction" STRING NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "follower_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING,
    "producer_id" STRING,
    "team_id" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invites" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "phone" STRING NOT NULL,
    "token" STRING,
    "user_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "minimum_treshold" INT4 NOT NULL,
    "accumulated_amount" INT4 NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket" (
    "id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" STRING NOT NULL,
    "order_id" STRING,
    "user_id" STRING,
    "amount" INT4 NOT NULL,
    "paymentIntentId" STRING NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" STRING NOT NULL,
    "order_id" STRING,
    "user_id" STRING,
    "team_id" STRING,
    "producer_id" STRING,
    "title" STRING,
    "text" STRING NOT NULL,
    "is_read" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "team_id" STRING,
    "producer_id" STRING,
    "product_id" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recently_viewed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "searches" (
    "id" STRING NOT NULL,
    "keyword" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "category" "SearchCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_count" (
    "id" STRING NOT NULL,
    "keyword" STRING NOT NULL,
    "category" "SearchCategory" NOT NULL,
    "count" INT4 NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_addresses" (
    "id" STRING NOT NULL,
    "location" STRING NOT NULL,
    "type" "DeliveryType" NOT NULL DEFAULT 'WEEKLY',
    "cut_off_time" STRING,
    "producerId" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_delivery_address" (
    "id" STRING NOT NULL,
    "deliveryAddressId" STRING NOT NULL,
    "day" "DayOptions" NOT NULL,
    "cut_off_time" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_delivery_address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_c" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "quantity" INT4 NOT NULL,
    "price" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_c_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "producers_userId_key" ON "producers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "producers_business_name_key" ON "producers"("business_name");

-- CreateIndex
CREATE UNIQUE INDEX "producer_categories_options_name_key" ON "producer_categories_options"("name");

-- CreateIndex
CREATE UNIQUE INDEX "producer_categories_producer_id_producer_category_option_id_key" ON "producer_categories"("producer_id", "producer_category_option_id");

-- CreateIndex
CREATE UNIQUE INDEX "shippings_userId_key" ON "shippings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_producer_id_key" ON "products"("name", "producer_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_category_name_key" ON "product_category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "buying_teams_name_key" ON "buying_teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "team_members"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_requests_team_id_user_id_key" ON "team_requests"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "followers_user_id_follower_id_key" ON "followers"("user_id", "follower_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_product_id_key" ON "likes"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_producer_id_key" ON "likes"("user_id", "producer_id");

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_team_id_key" ON "likes"("user_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "invites_team_id_user_id_key" ON "invites"("team_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "basket_order_id_user_id_product_id_key" ON "basket"("order_id", "user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paymentIntentId_key" ON "payments"("paymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "basket_c_team_id_user_id_product_id_key" ON "basket_c"("team_id", "user_id", "product_id");

-- AddForeignKey
ALTER TABLE "producers" ADD CONSTRAINT "producers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_categories" ADD CONSTRAINT "producer_categories_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_categories" ADD CONSTRAINT "producer_categories_producer_category_option_id_fkey" FOREIGN KEY ("producer_category_option_id") REFERENCES "producer_categories_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shippings" ADD CONSTRAINT "shippings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buying_teams" ADD CONSTRAINT "buying_teams_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buying_teams" ADD CONSTRAINT "buying_teams_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_requests" ADD CONSTRAINT "team_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "searches" ADD CONSTRAINT "searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_delivery_address" ADD CONSTRAINT "custom_delivery_address_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "delivery_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_c" ADD CONSTRAINT "basket_c_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_c" ADD CONSTRAINT "basket_c_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basket_c" ADD CONSTRAINT "basket_c_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
