import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      name?: string;
      email?: string;
      subscription?: {
        status: string;
        active: boolean;
      };
    };
  }
}

export {};
