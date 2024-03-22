-- CreateEnum
CREATE TYPE "PartnerOpenHour" AS ENUM ('ALL_THE_TIME', 'MON_TO_FRI', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OrderCollectionStatus" AS ENUM ('PENDING', 'COLLECTED');

-- AlterEnum
ALTER TYPE "Role"ADD VALUE 'PARTNER';
ALTER TYPE "Role"ADD VALUE 'EMPLOYEE';

-- AlterTable
ALTER TABLE "buying_teams" ADD COLUMN     "delivery_day" "DayOptions";
ALTER TABLE "buying_teams" ADD COLUMN     "partnerId" STRING;
ALTER TABLE "buying_teams" ADD COLUMN     "product_limit" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "partnerId" STRING;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "confirm_delivery" BOOL NOT NULL DEFAULT false;
ALTER TABLE "orders" ADD COLUMN     "confirmation_image_key" STRING;
ALTER TABLE "orders" ADD COLUMN     "confirmation_image_url" STRING;
ALTER TABLE "orders" ADD COLUMN     "confirmer_id" STRING;

-- CreateTable
CREATE TABLE "partners" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "postal_code" STRING NOT NULL,
    "stripe_connect_id" STRING,
    "city" STRING NOT NULL,
    "street_number" STRING NOT NULL,
    "direction" STRING NOT NULL,
    "store_type" STRING NOT NULL,
    "shelf_type" STRING NOT NULL,
    "dry_storage_space" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "partner_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_hours" (
    "id" STRING NOT NULL,
    "partner_id" STRING NOT NULL,
    "type" "PartnerOpenHour" NOT NULL DEFAULT 'ALL_THE_TIME',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "open_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom-open_hours" (
    "id" STRING NOT NULL,
    "open_hour_id" STRING NOT NULL,
    "day" "DayOptions" NOT NULL,
    "start_time" STRING NOT NULL,
    "end_time" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom-open_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "date_of_collection" TIMESTAMP(3) NOT NULL,
    "status" "OrderCollectionStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_user_id_key" ON "partners"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "partners_name_key" ON "partners"("name");

-- CreateIndex
CREATE UNIQUE INDEX "partners_stripe_connect_id_key" ON "partners"("stripe_connect_id");

-- CreateIndex
CREATE INDEX "partners_id_user_id_idx" ON "partners"("id", "user_id");

-- CreateIndex
CREATE INDEX "employees_id_user_id_partner_id_idx" ON "employees"("id", "user_id", "partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_partner_id_key" ON "employees"("user_id", "partner_id");

-- CreateIndex
CREATE UNIQUE INDEX "open_hours_partner_id_key" ON "open_hours"("partner_id");

-- CreateIndex
CREATE INDEX "open_hours_id_partner_id_idx" ON "open_hours"("id", "partner_id");

-- CreateIndex
CREATE INDEX "custom-open_hours_id_open_hour_id_idx" ON "custom-open_hours"("id", "open_hour_id");

-- CreateIndex
CREATE INDEX "collections_id_order_id_user_id_idx" ON "collections"("id", "order_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "collections_order_id_user_id_key" ON "collections"("order_id", "user_id");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_hours" ADD CONSTRAINT "open_hours_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom-open_hours" ADD CONSTRAINT "custom-open_hours_open_hour_id_fkey" FOREIGN KEY ("open_hour_id") REFERENCES "open_hours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buying_teams" ADD CONSTRAINT "buying_teams_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_confirmer_id_fkey" FOREIGN KEY ("confirmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
