import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@/app/lib/auth-adapter";
import type { Account, Profile } from "next-auth";

export const authOptions = {
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session({ session, token, user }: { session: any; token: any; user: any }) {
      if (session.user) {
        session.user.id = token.sub || user.id;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn({
      account,
      profile,
    }: {
      account: Account | null;
      profile: Profile | undefined;
    }) {
      if (account?.provider === "google") {
        return Boolean((profile as any)?.email_verified);
      }
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: true,
  logger: {
    error: (code: string, ...message: any[]) => {
      console.error(code, message);
    },
    warn: (code: string, ...message: any[]) => {
      console.warn(code, message);
    },
    debug: (code: string, ...message: any[]) => {
      console.debug(code, message);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
