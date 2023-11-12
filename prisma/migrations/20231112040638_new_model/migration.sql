-- AlterTable
ALTER TABLE "User" ADD COLUMN     "TMDB_LANG" TEXT NOT NULL DEFAULT 'ko-KR';

-- CreateTable
CREATE TABLE "Mymovies" (
    "id" TEXT NOT NULL,
    "movie_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "original_title" TEXT NOT NULL,
    "poster_path" TEXT NOT NULL,
    "release_date" TEXT NOT NULL,
    "genres" TEXT NOT NULL,
    "vote_average" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Mymovies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mymovies" ADD CONSTRAINT "Mymovies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
