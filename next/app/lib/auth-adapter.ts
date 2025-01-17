import type { Adapter } from "next-auth/adapters";
import { prisma } from "./prisma";

export function PrismaAdapter(): Adapter {
  return {
    async createUser(data: {
      email: string;
      emailVerified: Date | null;
      name?: string | null;
      image?: string | null;
    }) {
      return await prisma.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified,
          name: data.name,
          image: data.image,
        },
      });
    },

    async getUser(id: string) {
      return await prisma.user.findUnique({ where: { id } });
    },

    async getUserByEmail(email: string) {
      return await prisma.user.findUnique({ where: { email } });
    },

    async getUserByAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
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

    async updateUser(data: any) {
      const { id, ...userData } = data;
      return await prisma.user.update({
        where: { id },
        data: userData,
      });
    },

    async deleteUser(userId: string) {
      await prisma.user.delete({ where: { id: userId } });
    },

    async linkAccount(data: {
      userId: string;
      type: string;
      provider: string;
      providerAccountId: string;
      refresh_token?: string | null;
      access_token?: string | null;
      expires_at?: number | null;
      token_type?: string | null;
      scope?: string | null;
      id_token?: string | null;
      session_state?: string | null;
    }) {
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

    async unlinkAccount({
      providerAccountId,
      provider,
    }: {
      providerAccountId: string;
      provider: string;
    }) {
      await prisma.account.delete({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
      });
    },

    async createSession(data: {
      userId: string;
      sessionToken: string;
      expires: Date;
    }) {
      return await prisma.session.create({
        data: {
          userId: data.userId,
          sessionToken: data.sessionToken,
          expires: data.expires,
        },
      });
    },

    async getSessionAndUser(sessionToken: string) {
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

    async updateSession(data: { sessionToken: string; expires?: Date }) {
      return await prisma.session.update({
        where: { sessionToken: data.sessionToken },
        data,
      });
    },

    async deleteSession(sessionToken: string) {
      await prisma.session.delete({ where: { sessionToken } });
    },
  };
}
