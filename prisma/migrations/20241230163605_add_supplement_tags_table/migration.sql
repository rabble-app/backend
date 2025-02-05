-- CreateEnum
CREATE TYPE "SupplementTagTypes" AS ENUM ('GOALS', 'CATEGORY', 'FUNCTION', 'AUDIENCE', 'SORT');

-- CreateTable
CREATE TABLE "supplement_tags" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "type" "SupplementTagTypes" NOT NULL DEFAULT 'CATEGORY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplement_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supplement_tags_name_key" ON "supplement_tags"("name");
