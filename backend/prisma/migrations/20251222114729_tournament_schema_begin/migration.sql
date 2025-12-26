-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('KNOCKOUT', 'ROUND_ROBIN', 'GROUP_STAGE');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('REGISTRATION', 'ONGOING', 'COMPLETED');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "stage" TEXT,
ADD COLUMN     "tournamentId" TEXT;

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" "TournamentFormat" NOT NULL DEFAULT 'KNOCKOUT',
    "status" "TournamentStatus" NOT NULL DEFAULT 'REGISTRATION',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTable" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "won" INTEGER NOT NULL DEFAULT 0,
    "lost" INTEGER NOT NULL DEFAULT 0,
    "draw" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "nrr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "PointTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_tournamentId_teamId_key" ON "TournamentTeam"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "PointTable_tournamentId_teamId_key" ON "PointTable"("tournamentId", "teamId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTable" ADD CONSTRAINT "PointTable_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTable" ADD CONSTRAINT "PointTable_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
