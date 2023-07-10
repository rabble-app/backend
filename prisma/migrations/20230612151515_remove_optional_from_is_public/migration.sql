/*
  Warnings:

  - Made the column `is_public` on table `buying_teams` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "buying_teams" ALTER COLUMN "is_public" SET NOT NULL;
