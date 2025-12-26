/*
  Warnings:

  - You are about to drop the column `stage` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `tournamentId` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the `PointTable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tournament` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TournamentTeam` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "PointTable" DROP CONSTRAINT "PointTable_teamId_fkey";

-- DropForeignKey
ALTER TABLE "PointTable" DROP CONSTRAINT "PointTable_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "Tournament" DROP CONSTRAINT "Tournament_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentTeam" DROP CONSTRAINT "TournamentTeam_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentTeam" DROP CONSTRAINT "TournamentTeam_tournamentId_fkey";

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "stage",
DROP COLUMN "tournamentId";

-- DropTable
DROP TABLE "PointTable";

-- DropTable
DROP TABLE "Tournament";

-- DropTable
DROP TABLE "TournamentTeam";

-- DropEnum
DROP TYPE "TournamentFormat";

-- DropEnum
DROP TYPE "TournamentStatus";
