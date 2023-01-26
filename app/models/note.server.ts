import type { User, Note } from "@prisma/client";

import { prisma } from "~/utils/db.server";

export type { Note } from "@prisma/client";

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateNote({
  noteId,
  body,
  title,
}: { noteId: Note["id"], body: Note["body"], title: Note["title"] }
) {
  return prisma.note.update({
    where: { id: noteId },
    data: {
      title,
      body,
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}

export async function getNotes({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true, updatedAt: true, userId: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getNoteWithoutUserId({
  id,
}: Pick<Note, "id">
) {
  return prisma.note.findFirst({
    where: { id },
  })
}

export async function getAllNotes(query: string, page: number, itemsPerPage: number) {
  let x = {}
  let select = { select: { id: true, title: true, createdAt: true, updatedAt: true, user: { select: { email: true } } } }

  let pageAndItemsPerPage = {
    skip: page === 1 ? 0 : (page - 1) * itemsPerPage,
    take: itemsPerPage
  };

  let whereQuery = {
    where: {
      OR: [
        {
          title: {
            contains: query,

          },
        },
        {
          body: {
            contains: query,
          },
        },
      ],
    }
  };

  let orderBy = { orderBy: { createdAt: "desc" } };

  if (query === "")
    Object.assign(x, pageAndItemsPerPage, select, orderBy);
  else Object.assign(x, select, whereQuery, orderBy);

  return prisma.note.findMany(x);
}

export async function getNoteCount() {
  return prisma.note.count();
}

export async function getNoteCountById(id: string) {
  return prisma.note.count({ where: { userId: id } })
}