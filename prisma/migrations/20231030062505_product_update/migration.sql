-- AlterTable
ALTER TABLE "products" ADD COLUMN     "order_unit" STRING NOT NULL DEFAULT 'Box';
ALTER TABLE "products" ADD COLUMN     "price_per_measure" INT4 NOT NULL DEFAULT 0;
ALTER TABLE "products" ADD COLUMN     "sub_unit" STRING NOT NULL DEFAULT 'Carton';
ALTER TABLE "products" ADD COLUMN     "units_of_measure" STRING NOT NULL DEFAULT 'Carton';
ALTER TABLE "products" ADD COLUMN     "units_per_order" INT4 NOT NULL DEFAULT 10;
