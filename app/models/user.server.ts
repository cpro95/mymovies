import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function toggleUserRole(id: User["id"], role: User["role"]) {
  const user = await getUserById(id);
  if (user) {
    return prisma.user.update({
      data: {
        role,
      },
      where: { id },
    });
  } else return {};
}

export async function toggleUserLang(id: User["id"], lang: User["TMDB_LANG"]) {
  return prisma.user.update({
    data: {
      TMDB_LANG: lang,
    },
    where: { id },
  });
}

export async function verifyPassword(
  userId: Password["userId"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return false;
  } else return true;
}

export async function updatePasswordById(id: User["id"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.password.update({
    data: {
      hash: hashedPassword,
    },
    where: { userId: id },
  });
}

export async function getUserRoleById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id }, select: { role: true } });
}

export async function getAllUsersByAdmin(id: User["id"]) {
  const verifiedUser = await prisma.user.findUnique({ where: { id } });
  if (verifiedUser?.role === "admin") {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        TMDB_LANG: true,
        _count: {
          select: {
            notes: true,
            Mymovies: true,
          },
        },
      },
    });
  } else return {};
}
