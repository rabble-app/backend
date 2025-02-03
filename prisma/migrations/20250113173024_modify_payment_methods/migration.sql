-- DropIndex
DROP INDEX "payment_methods_id_user_id_idx";

-- DropIndex
DROP INDEX "payment_methods_user_id_key";

-- CreateIndex
CREATE INDEX "payment_methods_id_user_id_fingerprint_idx" ON "payment_methods"("id", "user_id", "fingerprint");
