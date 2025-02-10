import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "./auth-adapter";
import { prisma } from "@/app/lib/prisma";
import type { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    sub?: string;
    isSubscribed?: boolean;
    hasActiveTrial?: boolean;
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
      if (token?.sub && session.user) {
        session.user.id = token.sub;

        // Force fresh user data lookup
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            lemonSubscriptionId: true,
            hasActiveTrial: true,
            image: true,
            emailVerified: true,
          },
        });

        if (dbUser) {
          session.user.isSubscribed = !!dbUser?.lemonSubscriptionId;
          session.user.hasActiveTrial = dbUser.hasActiveTrial;
          session.user.image = dbUser.image ?? undefined;
          // Add email verification status
          session.user.emailVerified = dbUser.emailVerified;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        return {
          ...token,
          sub: user.id,
          isSubscribed: false,
          hasActiveTrial: false,
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
            image: true,
          },
        });

        return {
          ...token,
          isSubscribed: !!dbUser?.lemonSubscriptionId,
          hasActiveTrial: dbUser?.hasActiveTrial || false,
          picture: dbUser?.image || token.picture,
        };
      }

      return token;
    },
  },
};
