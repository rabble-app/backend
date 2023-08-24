-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "image_url" DROP DEFAULT;
