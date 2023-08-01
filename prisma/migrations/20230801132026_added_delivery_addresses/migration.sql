-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('CUSTOM', 'WEEKLY');

-- CreateEnum
CREATE TYPE "DayOptions" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

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

-- AddForeignKey
ALTER TABLE "delivery_addresses" ADD CONSTRAINT "delivery_addresses_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_delivery_address" ADD CONSTRAINT "custom_delivery_address_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "delivery_addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
