-- CreateEnum
CREATE TYPE "BonusType" AS ENUM ('REFERRAL', 'SIGNUP');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('CLAIM', 'SPEND');

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "stripe_customer_id" STRING NOT NULL,
    "payment_method_id" STRING NOT NULL,
    "is_default" BOOL NOT NULL DEFAULT true,
    "card_last_four_digits" STRING NOT NULL,
    "fingerprint" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "active" BOOL NOT NULL DEFAULT true,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "claimed" DECIMAL(65,30) NOT NULL,
    "all_time" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" STRING NOT NULL,
    "wallet_id" STRING NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "WalletTransactionType" NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bonuses" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" "BonusType" NOT NULL,
    "referral_id" STRING,
    "order_id" STRING,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bonuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_user_id_key" ON "payment_methods"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_stripe_customer_id_key" ON "payment_methods"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_fingerprint_key" ON "payment_methods"("fingerprint");

-- CreateIndex
CREATE INDEX "payment_methods_id_user_id_idx" ON "payment_methods"("id", "user_id");

-- CreateIndex
CREATE INDEX "wallets_id_user_id_idx" ON "wallets"("id", "user_id");

-- CreateIndex
CREATE INDEX "wallet_transactions_id_wallet_id_idx" ON "wallet_transactions"("id", "wallet_id");

-- CreateIndex
CREATE INDEX "bonuses_id_user_id_idx" ON "bonuses"("id", "user_id");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bonuses" ADD CONSTRAINT "bonuses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
