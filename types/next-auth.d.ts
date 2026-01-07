import { UserRole, UserMode } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      activeMode: UserMode;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    activeMode?: UserMode;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    activeMode: UserMode;
  }
}
