/*
  Warnings:

  - You are about to drop the column `all_time` on the `wallets` table. All the data in the column will be lost.
  - You are about to drop the `wallet_transactions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_wallet_id_fkey";

-- AlterTable
ALTER TABLE "wallets" DROP COLUMN "all_time";

-- DropTable
DROP TABLE "wallet_transactions";

-- DropEnum
DROP TYPE "WalletTransactionType";

-- CreateTable
CREATE TABLE "claims" (
    "id" STRING NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "coupon_id" STRING,
    "used" BOOL NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rates" (
    "id" STRING NOT NULL,
    "amount" INT4 NOT NULL,
    "rate" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "claims_id_idx" ON "claims"("id");

-- CreateIndex
CREATE INDEX "rates_id_idx" ON "rates"("id");
