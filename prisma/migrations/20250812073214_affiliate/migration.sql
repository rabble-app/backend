/*
  Warnings:

  - Made the column `team_id` on table `chats` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."AffiliateRewardType" AS ENUM ('CREDIT', 'FREE_MONTH');

-- AlterTable
ALTER TABLE "public"."chats" ALTER COLUMN "team_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "public"."affiliates" (
    "id" STRING NOT NULL,
    "code" STRING NOT NULL,
    "description" STRING,
    "rewardType" "public"."AffiliateRewardType" NOT NULL DEFAULT 'CREDIT',
    "rewardAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliates_code_key" ON "public"."affiliates"("code");

-- CreateIndex
CREATE INDEX "affiliates_id_idx" ON "public"."affiliates"("id");
