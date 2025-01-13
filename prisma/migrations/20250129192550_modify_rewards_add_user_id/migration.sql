/*
  Warnings:

  - You are about to drop the column `coupon_id` on the `payments` table. All the data in the column will be lost.
  - Added the required column `coupon_value` to the `claims` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `claims` table without a default value. This is not possible if the table is not empty.
  - Made the column `coupon_id` on table `claims` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "claims_id_idx";

-- AlterTable
ALTER TABLE "claims" ADD COLUMN     "coupon_value" DECIMAL(65,30) NOT NULL;
ALTER TABLE "claims" ADD COLUMN     "user_id" STRING NOT NULL;
ALTER TABLE "claims" ALTER COLUMN "coupon_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "coupon_id";
ALTER TABLE "payments" ADD COLUMN     "coupons" STRING;

-- CreateIndex
CREATE INDEX "claims_id_user_id_idx" ON "claims"("id", "user_id");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
