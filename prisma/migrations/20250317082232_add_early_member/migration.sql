-- AlterEnum
ALTER TYPE "MembershipStatus" ADD VALUE 'EARLY_MEMBER';

-- AlterTable
ALTER TABLE "supplement_team_products" ADD COLUMN     "early_members_discount" DECIMAL(9,2) NOT NULL DEFAULT 5;
