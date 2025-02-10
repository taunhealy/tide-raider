import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { prisma } from "./prisma";
import { SkillLevel } from "@prisma/client";

// Add type conversion function
function convertToAdapterUser(user: any): AdapterUser {
  return {
    ...user,
    skillLevel: user.skillLevel as SkillLevel | null,
    emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
  };
}

export function PrismaAdapter(): Adapter {
  return {
    async createUser(data: Omit<AdapterUser, "id">) {
      return prisma.user.create({
        data: {
          ...data,
          name: data.name || "",
        },
      });
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? convertToAdapterUser(user) : null;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? convertToAdapterUser(user) : null;
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
      return account?.user ? convertToAdapterUser(account.user) : null;
    },

    async updateUser(user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...user,
          name: user.name || "",
        },
      });
      return convertToAdapterUser(updated);
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
      return {
        user: convertToAdapterUser(user),
        session,
      };
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
