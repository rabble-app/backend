-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_verified" BOOL NOT NULL DEFAULT false;
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;
