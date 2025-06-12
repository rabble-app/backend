-- CreateTable
CREATE TABLE "billing_addresses" (
    "id" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "post_code" STRING NOT NULL,
    "address_line1" STRING NOT NULL,
    "address_line2" STRING,
    "city" STRING NOT NULL,
    "country" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_addresses_user_id_key" ON "billing_addresses"("user_id");

-- CreateIndex
CREATE INDEX "billing_addresses_id_user_id_idx" ON "billing_addresses"("id", "user_id");

-- AddForeignKey
ALTER TABLE "billing_addresses" ADD CONSTRAINT "billing_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
