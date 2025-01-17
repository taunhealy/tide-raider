import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "./auth-adapter";
import type { Account, Profile, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";

export const authOptions: AuthOptions = {
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
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User | AdapterUser;
    }) {
      if (session.user) {
        session.user.id = token.sub || user.id;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: User | AdapterUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async signIn(params: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile;
    }) {
      if (params.account?.provider === "google") {
        return Boolean((params.profile as any)?.email_verified ?? false);
      }
      return true;
    },
  },
  secret: process.env.AUTH_SECRET,
  debug: true,
  logger: {
    error(code: string, ...message: any[]) {
      console.error(code, message);
    },
    warn(code: string, ...message: any[]) {
      console.warn(code, message);
    },
    debug(code: string, ...message: any[]) {
      console.debug(code, message);
    },
  },
};
