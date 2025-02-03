import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    lemonCustomerId?: string;
    lemonSubscriptionId?: string;
    hasActiveTrial?: boolean;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      isSubscribed?: boolean;
      hasActiveTrial?: boolean;
      subscription?: {
        status: string;
        active: boolean;
      };
    } & DefaultSession["user"];
  }
}
