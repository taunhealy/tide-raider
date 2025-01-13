import type { Session } from "@auth/core/types";

declare module "@auth/core/types" {
  interface Session {
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
