/*
  Warnings:

  - A unique constraint covering the columns `[vat]` on the table `producers` will be added. If there are existing duplicate values, this will fail.
  - Made the column `team_id` on table `chats` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chats" ALTER COLUMN "team_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "payment_term" INT4 DEFAULT 30;
ALTER TABLE "producers" ADD COLUMN     "vat" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "producers_vat_key" ON "producers"("vat");
