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

        // Auto-set default mode to PROVIDER if they have a provider profile with 15%+ completion
        let activeMode = user.activeMode;
        if (user.provider && user.role === 'PROVIDER') {
          const provider = user.provider;

          // Calculate provider profile completion
          let completedSections = 0;
          const totalSections = 6;

          // 1. Basic Info
          if (provider.name && provider.description && provider.email && provider.phone) {
            completedSections++;
          }

          // 2. Services & Amenities
          if (provider.roomFeatures && Array.isArray(provider.roomFeatures) && provider.roomFeatures.length > 0) {
            completedSections++;
          }

          // 3. Photos
          if (provider.photos && Array.isArray(provider.photos) && provider.photos.length >= 5) {
            completedSections++;
          }

          // 4. Licensing
          if (provider.licensed && provider.licenseNumber) {
            completedSections++;
          }

          // 5. Pricing
          if (provider.priceMin && provider.priceMax) {
            completedSections++;
          }

          // 6. Staff Info
          if (provider.staffToResidentRatio) {
            completedSections++;
          }

          const completionPercentage = Math.round((completedSections / totalSections) * 100);

          // If profile is 15%+ complete and current mode is FAMILY, switch to PROVIDER
          if (completionPercentage >= 15 && activeMode === 'FAMILY') {
            activeMode = 'PROVIDER';
            // Update in database for future logins
            await prisma.user.update({
              where: { id: user.id },
              data: { activeMode: 'PROVIDER' },
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
  },
};
