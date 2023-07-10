/*
  Warnings:

  - Added the required column `introduction` to the `team_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "team_requests" ADD COLUMN     "introduction" STRING NOT NULL;
