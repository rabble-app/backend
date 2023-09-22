/*
  Warnings:

  - A unique constraint covering the columns `[team_id,user_id,status]` on the table `team_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "team_requests_team_id_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "team_requests_team_id_user_id_status_key" ON "team_requests"("team_id", "user_id", "status");
