-- CreateTable
CREATE TABLE "supplement_team_products" (
    "id" STRING NOT NULL,
    "team_id" STRING NOT NULL,
    "product_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplement_team_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplement_team_products_team_id_key" ON "supplement_team_products"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "supplement_team_products_product_id_key" ON "supplement_team_products"("product_id");

-- CreateIndex
CREATE INDEX "supplement_team_products_id_team_id_product_id_idx" ON "supplement_team_products"("id", "team_id", "product_id");

-- AddForeignKey
ALTER TABLE "supplement_team_products" ADD CONSTRAINT "supplement_team_products_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplement_team_products" ADD CONSTRAINT "supplement_team_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
