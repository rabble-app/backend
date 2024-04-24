/*
  Warnings:

  - You are about to drop the `custom_delivery_address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `delivery_addresses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "custom_delivery_address" DROP CONSTRAINT "custom_delivery_address_deliveryAddressId_fkey";

-- DropForeignKey
ALTER TABLE "delivery_addresses" DROP CONSTRAINT "delivery_addresses_producerId_fkey";

-- DropTable
DROP TABLE "custom_delivery_address";

-- DropTable
DROP TABLE "delivery_addresses";

-- CreateTable
CREATE TABLE "producer_delivery_days" (
    "id" STRING NOT NULL,
    "day" "DayOptions" NOT NULL,
    "cut_off_day" "DayOptions" NOT NULL,
    "cut_off_time" STRING NOT NULL,
    "producer_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_delivery_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_delivery_regions" (
    "id" STRING NOT NULL,
    "delivery_day_id" STRING NOT NULL,
    "region_id" STRING NOT NULL,
    "minimum_order" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_delivery_regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "producer_delivery_areas" (
    "id" STRING NOT NULL,
    "delivery_region_id" STRING NOT NULL,
    "region_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producer_delivery_areas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "producer_delivery_days_id_producer_id_day_idx" ON "producer_delivery_days"("id", "producer_id", "day");

-- CreateIndex
CREATE UNIQUE INDEX "producer_delivery_days_producer_id_day_key" ON "producer_delivery_days"("producer_id", "day");

-- CreateIndex
CREATE INDEX "producer_delivery_regions_id_delivery_day_id_region_id_idx" ON "producer_delivery_regions"("id", "delivery_day_id", "region_id");

-- CreateIndex
CREATE UNIQUE INDEX "producer_delivery_regions_delivery_day_id_region_id_key" ON "producer_delivery_regions"("delivery_day_id", "region_id");

-- CreateIndex
CREATE INDEX "producer_delivery_areas_id_delivery_region_id_region_id_idx" ON "producer_delivery_areas"("id", "delivery_region_id", "region_id");

-- AddForeignKey
ALTER TABLE "producer_delivery_days" ADD CONSTRAINT "producer_delivery_days_producer_id_fkey" FOREIGN KEY ("producer_id") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_delivery_regions" ADD CONSTRAINT "producer_delivery_regions_delivery_day_id_fkey" FOREIGN KEY ("delivery_day_id") REFERENCES "producer_delivery_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_delivery_regions" ADD CONSTRAINT "producer_delivery_regions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "postalCodeRegions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_delivery_areas" ADD CONSTRAINT "producer_delivery_areas_delivery_region_id_fkey" FOREIGN KEY ("delivery_region_id") REFERENCES "producer_delivery_regions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producer_delivery_areas" ADD CONSTRAINT "producer_delivery_areas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "postalCodeAreas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
