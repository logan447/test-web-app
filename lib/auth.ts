import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        // Login: Restore activeMode directly from database (Manual Ch 1.2)
        // The database is the single source of truth for mode.
        // Mode was set during signup based on intent, or by user switching modes.
        // We do NOT recalculate mode on login - we simply restore what's stored.
        console.log('LOGIN DEBUG: User logged in:', user.email, 'activeMode from DB:', user.activeMode);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          activeMode: user.activeMode, // Restore from DB, don't calculate
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          activeMode: user.activeMode || 'FAMILY',
        };
      }

      // Handle session updates (e.g., when switching modes)
      if (trigger === "update" && updateSession?.activeMode) {
        token.activeMode = updateSession.activeMode;
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role,
          activeMode: token.activeMode,
        },
      };
    },
  },
};
