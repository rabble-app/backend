-- CreateEnum
CREATE TYPE "SupplementTeamStatus" AS ENUM ('ACTIVE', 'PREORDER');

-- AlterTable
ALTER TABLE "supplement_team_products" ADD COLUMN     "order_treashold" INT4 NOT NULL DEFAULT 10;
ALTER TABLE "supplement_team_products" ADD COLUMN     "status" "SupplementTeamStatus" NOT NULL DEFAULT 'PREORDER';
