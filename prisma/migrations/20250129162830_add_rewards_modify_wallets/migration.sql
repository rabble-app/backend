/*
  Warnings:

  - You are about to drop the `rates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "rates";

-- CreateTable
CREATE TABLE "rewards" (
    "id" STRING NOT NULL,
    "amount" INT4 NOT NULL,
    "rate" INT4 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rewards_id_idx" ON "rewards"("id");
