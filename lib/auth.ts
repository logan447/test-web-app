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
          include: {
            provider: true,
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

        // On login: default to FAMILY mode, but switch to PROVIDER if 15%+ profile completion
        // This ensures users always start in FAMILY mode unless they qualify for PROVIDER mode
        let activeMode: 'FAMILY' | 'PROVIDER' = 'FAMILY';

        if (user.provider && user.role === 'PROVIDER') {
          const provider = user.provider;

          // Calculate provider profile completion based on actual schema fields
          let completedSections = 0;
          const totalSections = 6;

          // 1. Basic Info (name, description, address are required, so should always be 1)
          if (provider.name && provider.description && provider.address) {
            completedSections++;
          }

          // 2. Services (careTypesOffered is the actual field name)
          if (provider.careTypesOffered && provider.careTypesOffered.length > 0) {
            completedSections++;
          }

          // 3. Photos
          if (provider.photos && provider.photos.length > 0) {
            completedSections++;
          }

          // 4. Licensing
          if (provider.licenseNumber) {
            completedSections++;
          }

          // 5. Pricing (check if any pricing fields are set)
          if (provider.priceMin || provider.priceMax || provider.privateRoomMin || provider.semiPrivateRoomMin) {
            completedSections++;
          }

          // 6. Staff (check if any staff information is provided)
          if ((provider.staffCredentials && provider.staffCredentials.length > 0) ||
              provider.staffToResidentRatio ||
              provider.daytimeStaffRatio) {
            completedSections++;
          }

          const completionPercentage = Math.round((completedSections / totalSections) * 100);

          // If profile is 15%+ complete, use PROVIDER mode
          if (completionPercentage >= 15) {
            activeMode = 'PROVIDER';
          }

          // Update database to match the calculated default mode
          if (user.activeMode !== activeMode) {
            await prisma.user.update({
              where: { id: user.id },
              data: { activeMode: activeMode },
            });
          }
        } else {
          // Non-provider users: ensure they're set to FAMILY mode in database
          if (user.activeMode !== 'FAMILY') {
            await prisma.user.update({
              where: { id: user.id },
              data: { activeMode: 'FAMILY' },
            });
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          activeMode: activeMode,
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
    async redirect({ url, baseUrl }) {
      // If redirecting to /auth/redirect, read the JWT token to determine mode
      if (url.startsWith(baseUrl + '/auth/redirect')) {
        // This will be handled by the /auth/redirect page
        return url;
      }

      // Default behavior for other redirects
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
};
