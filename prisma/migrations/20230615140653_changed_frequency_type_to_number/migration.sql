/*
  Warnings:

  - The `frequency` column on the `buying_teams` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "buying_teams" DROP COLUMN "frequency";
ALTER TABLE "buying_teams" ADD COLUMN     "frequency" INT4 NOT NULL DEFAULT 104500;
