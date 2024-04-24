/*
  Warnings:

  - You are about to drop the column `code` on the `postalCodeRegions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `postalCodeAreas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "postalCodeRegions_code_key";

-- AlterTable
ALTER TABLE "postalCodeRegions" DROP COLUMN "code";

-- CreateIndex
CREATE UNIQUE INDEX "postalCodeAreas_id_key" ON "postalCodeAreas"("id");
