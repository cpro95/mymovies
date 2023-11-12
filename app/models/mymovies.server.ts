import { prisma } from "~/db.server";

export interface MyMoviesType {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: string;
  genres: string;
}

export async function getMymoviesById(movie_id: string, userId: string) {
  return prisma.mymovies.findFirst({
    where: {
      movie_id: movie_id,
      userId: userId,
    },
    select: { id: true },
  });
}

export async function deleteMymoviesById(id: string) {
  return prisma.mymovies.delete({
    where: {
      id: id,
    },
  });
}

export async function addMyMoviesById(
  movie_id: string,
  title: string,
  original_title: string,
  poster_path: string,
  release_date: string,
  genres: string,
  vote_average: string,
  userId: string,
) {
  // console.log("MovieId  ===> ", movie_id);
  // console.log("User Id ===> ", userId);

  return prisma.mymovies.create({
    data: {
      movie_id,
      title,
      original_title,
      poster_path,
      release_date,
      genres,
      vote_average,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export async function getMyMoviesCount(
  id: string,
  query?: string,
  genreId?: string,
) {
  // console.log(query);
  // console.log(genreId);
  if (query === undefined && (genreId === undefined || genreId === "0"))
    return prisma.mymovies.count({ where: { userId: id } });
  else if (query !== undefined && (genreId === undefined || genreId === "0"))
    return prisma.mymovies.count({
      where: {
        AND: [
          {
            userId: id,
          },
        ],
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            original_title: {
              contains: query,
            },
          },
        ],
      },
    });
  else if (query === undefined && (genreId !== undefined || genreId !== "0"))
    return prisma.mymovies.count({
      where: {
        AND: [
          {
            userId: id,
          },
          {
            genres: {
              contains: genreId,
            },
          },
        ],
      },
    });
  else
    return prisma.mymovies.count({
      where: {
        AND: [
          {
            userId: id,
          },
          {
            genres: {
              contains: genreId,
            },
          },
        ],
        OR: [
          {
            title: {
              contains: query,
            },
          },
          {
            original_title: {
              contains: query,
            },
          },
        ],
      },
    });
}
