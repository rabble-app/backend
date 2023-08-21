-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "team_members" ADD COLUMN     "role" "MembershipStatus" NOT NULL DEFAULT 'ADMIN';
