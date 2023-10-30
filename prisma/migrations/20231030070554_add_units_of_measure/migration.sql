/*
  Warnings:

  - You are about to drop the column `price_per_measure` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "price_per_measure";
ALTER TABLE "products" ADD COLUMN     "units_of_measure" STRING NOT NULL DEFAULT 'Carton';
