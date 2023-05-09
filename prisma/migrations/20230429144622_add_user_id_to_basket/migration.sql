/*
  Warnings:

  - Added the required column `user_id` to the `basket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "basket" ADD COLUMN     "user_id" STRING NOT NULL;

-- AddForeignKey
ALTER TABLE "basket" ADD CONSTRAINT "basket_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
