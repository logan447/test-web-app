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
        console.log('🔐 Authorize called with email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            providerIdentity: true,  // Include provider identity to check if exists
          },
        });

        console.log('👤 User found:', user ? 'YES' : 'NO');

        if (!user || !user.passwordHash) {
          console.log('❌ User not found or no password hash');
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.passwordHash
        );

        console.log('🔑 Password valid:', isPasswordValid);

        if (!isPasswordValid) {
          console.log('❌ Invalid password');
          throw new Error("Invalid credentials");
        }

        console.log('✅ Auth successful, returning user data');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          activeMode: user.activeMode,
          hasProviderIdentity: !!user.providerIdentity,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateSession }) {
      if (user) {
        console.log('🔐 JWT callback - new login:', {
          email: user.email,
          activeMode: user.activeMode,
          hasProviderIdentity: user.hasProviderIdentity
        });
        return {
          ...token,
          id: user.id,
          role: user.role,
          activeMode: user.activeMode || 'FAMILY',
          hasProviderIdentity: user.hasProviderIdentity || false,
        };
      }

      // Handle session updates (e.g., when switching modes)
      if (trigger === "update" && updateSession?.activeMode) {
        console.log('🔄 JWT callback - mode update:', updateSession.activeMode);
        token.activeMode = updateSession.activeMode;
      }

      return token;
    },
    async session({ session, token }) {
      const enhancedSession = {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role,
          activeMode: token.activeMode,
          hasProviderIdentity: token.hasProviderIdentity,
        },
      };
      console.log('📋 Session callback:', {
        email: session.user?.email,
        activeMode: token.activeMode,
        hasProviderIdentity: token.hasProviderIdentity
      });
      return enhancedSession;
    },
  },
};
