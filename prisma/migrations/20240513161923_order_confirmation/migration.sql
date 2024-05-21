/*
  Warnings:

  - You are about to drop the column `confirmation_image_key` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `confirmation_image_url` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `confirmer_id` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_confirmer_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "confirmation_image_key";
ALTER TABLE "orders" DROP COLUMN "confirmation_image_url";
ALTER TABLE "orders" DROP COLUMN "confirmer_id";

-- CreateTable
CREATE TABLE "order_confirmation" (
    "id" STRING NOT NULL,
    "confirmer_id" STRING NOT NULL,
    "order_id" STRING NOT NULL,
    "confirmation_image_url" STRING NOT NULL,
    "confirmation_image_key" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "note" STRING,
    "products" JSONB NOT NULL,

    CONSTRAINT "order_confirmation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_confirmation" ADD CONSTRAINT "order_confirmation_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_confirmation" ADD CONSTRAINT "order_confirmation_confirmer_id_fkey" FOREIGN KEY ("confirmer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
