-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_team_id_fkey";

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "buying_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
