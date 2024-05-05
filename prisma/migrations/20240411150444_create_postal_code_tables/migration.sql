-- CreateTable
CREATE TABLE "postalCodeRegions" (
    "id" STRING NOT NULL,
    "code" STRING NOT NULL,
    "name" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postalCodeRegions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postalCodeAreas" (
    "id" STRING NOT NULL,
    "code" STRING NOT NULL,
    "name" STRING NOT NULL,
    "region_id" STRING NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postalCodeAreas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeRegions_code_key" ON "postalCodeRegions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeRegions_name_key" ON "postalCodeRegions"("name");

-- CreateIndex
CREATE INDEX "postalCodeRegions_name_idx" ON "postalCodeRegions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeAreas_code_key" ON "postalCodeAreas"("code");

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeAreas_name_key" ON "postalCodeAreas"("name");

-- CreateIndex
CREATE INDEX "postalCodeAreas_name_idx" ON "postalCodeAreas"("name");

-- AddForeignKey
ALTER TABLE "postalCodeAreas" ADD CONSTRAINT "postalCodeAreas_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "postalCodeRegions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
