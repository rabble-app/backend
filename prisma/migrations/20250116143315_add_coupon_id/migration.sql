/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "wallet_transactions" ADD COLUMN     "coupon_id" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");
