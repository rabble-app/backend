/*
  Warnings:

  - You are about to drop the column `street_number` on the `partners` table. All the data in the column will be lost.
  - Added the required column `street_address` to the `partners` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "partners" DROP COLUMN "street_number";
ALTER TABLE "partners" ADD COLUMN     "street_address" STRING NOT NULL;
