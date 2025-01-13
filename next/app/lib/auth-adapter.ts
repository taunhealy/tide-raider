import type { Adapter } from "next-auth/adapters";
import { prisma } from './prisma';

export function PrismaAdapter(): Adapter {
  return {
    async createUser(data) {
      return await prisma.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified,
          name: data.name,
          image: data.image,
        },
      });
    },

    async getUser(id) {
      return await prisma.user.findUnique({ where: { id } });
    },

    async getUserByEmail(email) {
      return await prisma.user.findUnique({ where: { email } });
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
        include: { user: true },
      });
      return account?.user ?? null;
    },

    async updateUser(data) {
      const { id, ...userData } = data;
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    },

    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: userId } });
    },

    async linkAccount(data) {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        },
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
      });
    },

    async createSession(data) {
      return await prisma.session.create({
        data: {
          userId: data.userId,
          sessionToken: data.sessionToken,
          expires: data.expires,
        },
      });
    },

    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            include: {
              membership: true,
            },
          },
        },
      });

      if (!session) return null;

      const { user, ...sessionData } = session;
      return {
        session: sessionData,
        user,
      };
    },

    async updateSession(data) {
      return await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
    },
  };
}