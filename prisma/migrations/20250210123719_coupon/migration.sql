/*
  Warnings:

  - You are about to drop the column `coupon_id` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `coupon_value` on the `claims` table. All the data in the column will be lost.
  - You are about to drop the column `used` on the `claims` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'COUPON_USED';

-- AlterTable
ALTER TABLE "claims" DROP COLUMN "coupon_id";
ALTER TABLE "claims" DROP COLUMN "coupon_value";
ALTER TABLE "claims" DROP COLUMN "used";
ALTER TABLE "claims" ADD COLUMN     "reward_id" STRING NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "available_credits" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "coupons" (
    "id" STRING NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "coupon_id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coupons_id_user_id_idx" ON "coupons"("id", "user_id");

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
