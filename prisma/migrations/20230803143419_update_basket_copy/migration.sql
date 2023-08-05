-- DropForeignKey
ALTER TABLE "basket_copy" DROP CONSTRAINT "basket_copy_order_id_fkey";

-- AddForeignKey
ALTER TABLE "basket_copy" ADD CONSTRAINT "basket_copy_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "buying_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
