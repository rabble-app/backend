/*
  Warnings:

  - You are about to drop the column `thresholdQuantity` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `units_of_measure` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `units_per_order` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "thresholdQuantity";
ALTER TABLE "products" DROP COLUMN "units_of_measure";
ALTER TABLE "products" DROP COLUMN "units_per_order";
ALTER TABLE "products" ADD COLUMN     "measures_per_subunit" INT4 NOT NULL DEFAULT 1;
ALTER TABLE "products" ADD COLUMN     "quantity_of_subunit_per_order" INT4 NOT NULL DEFAULT 1;
ALTER TABLE "products" ADD COLUMN     "units_of_measure_per_subunit" STRING NOT NULL DEFAULT 'Carton';
