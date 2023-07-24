-- CreateEnum
CREATE TYPE "SearchCategory" AS ENUM ('SUPPLIER', 'PRODUCT', 'TEAM');

-- CreateTable
CREATE TABLE "searches" (
    "id" STRING NOT NULL,
    "keyword" STRING NOT NULL,
    "user_id" STRING NOT NULL,
    "category" "SearchCategory" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_count" (
    "id" STRING NOT NULL,
    "keyword" STRING NOT NULL,
    "category" "SearchCategory" NOT NULL,
    "count" INT4 NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_count_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "searches" ADD CONSTRAINT "searches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
