-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('RABBLE', 'SUPPLEMENT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "type" "OrderType" NOT NULL DEFAULT 'RABBLE';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "lead_time" INT4 DEFAULT 0;
