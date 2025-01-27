import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { prisma } from "./prisma";

export function PrismaAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      return prisma.user.create({ data });
    },

    async getUser(id) {
      return prisma.user.findUnique({ where: { id } });
    },

    async getUserByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: { user: true },
      });
      return account?.user ?? null;
    },

    async updateUser(user) {
      return prisma.user.update({
        where: { id: user.id },
        data: user,
      });
    },

    async linkAccount(data: AdapterAccount) {
      await prisma.account.create({ data });
    },

    async createSession(data) {
      return prisma.session.create({ data });
    },

    async getSessionAndUser(sessionToken) {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },

    async updateSession(data) {
      return prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },

    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: userId } });
    },
  };
}
