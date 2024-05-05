/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `postalCodeRegions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "postalCodeAreas_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeRegions_id_key" ON "postalCodeRegions"("id");
