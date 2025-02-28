import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "./auth-adapter";
import { prisma } from "@/app/lib/prisma";
import type { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import NextAuth from "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sub?: string;
    isSubscribed?: boolean;
    hasActiveTrial?: boolean;
    trialEndDate?: Date | null;
    picture?: string;
  }
}

declare module "next-auth" {}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session, token }) {
      if (token?.sub && session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub,
            isSubscribed: token.isSubscribed || false,
            hasActiveTrial: token.hasActiveTrial || false,
            image: token.picture || session.user.image,
          },
        };
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        return {
          ...token,
          sub: user.id,
          isSubscribed: false,
          hasActiveTrial: false,
          trialEndDate: null,
          picture: user.image ?? undefined,
        };
      }

      // Subsequent requests - refresh user status
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            lemonSubscriptionId: true,
            hasActiveTrial: true,
            trialEndDate: true,
            image: true,
          },
        });

        return {
          ...token,
          isSubscribed: !!dbUser?.lemonSubscriptionId,
          hasActiveTrial: dbUser?.hasActiveTrial || false,
          trialEndDate: dbUser?.trialEndDate || null,
          picture: dbUser?.image || token.picture,
        };
      }

      return token;
    },
  },
};

export default NextAuth(authOptions);
