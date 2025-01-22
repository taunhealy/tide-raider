import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/app/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name || "",
            image: user.image || "",
          },
          update: {
            name: user.name || "",
            image: user.image || "",
          },
        });
        return true;
      } catch (error) {
        console.error("Database error:", error);
        return false;
      }
    },
    async session({ session, user }) {
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: true,
};
