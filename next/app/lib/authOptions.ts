import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@/app/lib/auth-adapter";
import { prisma } from "@/app/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name || "",
            accounts: {
              create: {
                type: account?.type!,
                provider: account?.provider!,
                providerAccountId: account?.providerAccountId!,
                access_token: account?.access_token,
                token_type: account?.token_type,
                scope: account?.scope,
              },
            },
          },
          update: {},
        });
        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        const user = await prisma.user.findUnique({
          where: { email: session.user.email! },
          include: { membership: true },
        });
        session.user.isSubscribed = !!user?.membership?.lemonSqueezyId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};
