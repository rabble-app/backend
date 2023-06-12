-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "skipNextDelivery" BOOL NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_default_payment_method_id" STRING;
