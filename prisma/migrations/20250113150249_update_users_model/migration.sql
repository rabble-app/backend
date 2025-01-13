/*
  Warnings:

  - A unique constraint covering the columns `[ref_code]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ref_code" STRING;
ALTER TABLE "users" ADD COLUMN     "referrer_id" STRING;

-- CreateIndex
CREATE UNIQUE INDEX "users_ref_code_key" ON "users"("ref_code");
