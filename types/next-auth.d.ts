import { UserRole, UserMode } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;  // Keep for backwards compatibility
      activeMode: UserMode;  // New: current active mode
      hasProviderIdentity: boolean;  // New: gate for provider features
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    activeMode?: UserMode;
    hasProviderIdentity?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    activeMode: UserMode;
    hasProviderIdentity: boolean;
  }
}
