-- AlterTable
ALTER TABLE "products" ADD COLUMN     "formulation_summary" STRING[] DEFAULT ARRAY[]::STRING[];
ALTER TABLE "products" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::STRING[];
