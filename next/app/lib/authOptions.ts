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
      console.log("Redirect callback:", { url, baseUrl });

      // If the URL is relative (starts with /), prepend the base URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is already absolute (starts with http), return it as is
      else if (url.startsWith("http")) {
        return url;
      }
      // Default to the base URL
      return baseUrl;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isSubscribed = token.isSubscribed || false;
        session.user.hasActiveTrial = token.hasActiveTrial || false;
        session.user.trialEndDate = token.trialEndDate || null;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // Fetch subscription info from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscriptionStatus: true,
            hasActiveTrial: true,
            trialEndDate: true,
          },
        });

        token.isSubscribed = dbUser?.subscriptionStatus === "ACTIVE";
        token.hasActiveTrial = dbUser?.hasActiveTrial || false;
        token.trialEndDate = dbUser?.trialEndDate || null;
      }
      return token;
    },
  },
};
