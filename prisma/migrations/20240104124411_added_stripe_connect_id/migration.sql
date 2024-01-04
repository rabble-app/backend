/*
  Warnings:

  - A unique constraint covering the columns `[stripe_connect_id]` on the table `producers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "stripe_connect_id" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "producers_stripe_connect_id_key" ON "producers"("stripe_connect_id");
