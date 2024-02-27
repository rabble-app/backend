/*
  Warnings:

  - A unique constraint covering the columns `[week,year]` on the table `nwro` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[week,year]` on the table `unique_users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "nwro_week_year_key" ON "nwro"("week", "year");

-- CreateIndex
CREATE UNIQUE INDEX "unique_users_week_year_key" ON "unique_users"("week", "year");
