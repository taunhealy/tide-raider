import { beachData } from "@/app/types/beaches";

export async function getBeaches() {
  return beachData;
}

import { prisma } from "@/app/lib/prisma";
export async function getBoards() {
  try {
    return await prisma.board.findMany({
      where: { isForRent: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching boards:", error);
    return [];
  }
}
