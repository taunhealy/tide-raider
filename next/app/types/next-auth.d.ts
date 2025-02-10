import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    lemonCustomerId?: string;
    lemonSubscriptionId?: string;
    hasActiveTrial?: boolean;
    bio?: string | null;
    skillLevel?: SkillLevel | null;
  }

  interface AdapterUser extends User {
    emailVerified: Date | null;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      isSubscribed: boolean;
      hasActiveTrial: boolean;
      subscription?: {
        status: string;
        active: boolean;
      };
    } & User;
  }
}
