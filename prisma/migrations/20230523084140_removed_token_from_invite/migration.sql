/*
  Warnings:

  - You are about to drop the column `token` on the `invites` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "invites" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "deadline" SET DEFAULT CURRENT_TIMESTAMP;
