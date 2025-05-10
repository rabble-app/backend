/*
  Warnings:

  - A unique constraint covering the columns `[user_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ReferralType" AS ENUM ('AFFILIATE', 'INTERNAL');

-- AlterEnum
ALTER TYPE "BonusType" ADD VALUE 'FREE_TRIAL';

-- AlterTable
ALTER TABLE "bonuses" ADD COLUMN     "category" STRING DEFAULT 'credit';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_payment_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN     "user_code" STRING;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiry_date" TIMESTAMP(3),

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "referrer_id" STRING,
    "type" "ReferralType" NOT NULL DEFAULT 'INTERNAL',
    "affiliate_id" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "subscriptions_id_user_id_idx" ON "subscriptions"("id", "user_id");

-- CreateIndex
CREATE INDEX "referrals_id_user_id_idx" ON "referrals"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_code_key" ON "users"("user_code");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
