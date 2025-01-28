import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export const dynamic = "force-dynamic";

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    signIn: async ({ account, profile }) => {
      if (account?.provider === "google") {
        return (
          (profile as { email_verified?: boolean })?.email_verified ?? true
        );
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
