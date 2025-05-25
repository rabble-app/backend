-- AlterTable
ALTER TABLE "products" ADD COLUMN     "alignment_pouche_size" DECIMAL(65,30) DEFAULT 30;
ALTER TABLE "products" ALTER COLUMN "grams_per_count" SET DEFAULT 5;
ALTER TABLE "products" ALTER COLUMN "pouche_size" SET DEFAULT 90;
