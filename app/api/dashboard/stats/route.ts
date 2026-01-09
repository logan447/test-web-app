import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const isFamily = session.user.role === "FAMILY";

    // Get stats based on user role
    let stats;
    let recentRequests;

    if (isFamily) {
      // Family user stats
      const [pending, active, saved, requests] = await Promise.all([
        // Pending requests (sent by family, waiting for provider response)
        prisma.consultRequest.count({
          where: {
            senderId: userId,
            status: "PENDING",
          },
        }),
        // Active conversations (accepted requests)
        prisma.consultRequest.count({
          where: {
            senderId: userId,
            status: "ACCEPTED",
          },
        }),
        // Saved providers
        prisma.savedProvider.count({
          where: {
            familyProfile: {
              userId: userId,
            },
          },
        }),
        // Recent requests with provider names
        prisma.consultRequest.findMany({
          where: {
            senderId: userId,
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            provider: {
              select: {
                name: true,
              },
            },
            messages: {
              where: {
                senderId: {
                  not: userId,
                },
                status: {
                  not: "READ",
                },
              },
              select: {
                id: true,
              },
            },
          },
        }),
      ]);

      stats = {
        pendingRequests: pending,
        activeConversations: active,
        savedProviders: saved,
        totalRequests: pending + active,
      };

      recentRequests = requests.map((req) => ({
        id: req.id,
        providerName: req.provider.name,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        unreadCount: req.messages.length,
      }));
    } else {
      // Provider user stats
      const familyProfile = await prisma.familyProfile.findFirst({
        where: { userId },
        select: { id: true },
      });

      const [pending, active, total, requests] = await Promise.all([
        // New requests (received, waiting for provider response)
        prisma.consultRequest.count({
          where: {
            providerId: {
              in: await prisma.provider
                .findMany({
                  where: { userId },
                  select: { id: true },
                })
                .then((providers) => providers.map((p) => p.id)),
            },
            status: "PENDING",
          },
        }),
        // Active conversations (accepted requests)
        prisma.consultRequest.count({
          where: {
            providerId: {
              in: await prisma.provider
                .findMany({
                  where: { userId },
                  select: { id: true },
                })
                .then((providers) => providers.map((p) => p.id)),
            },
            status: "ACCEPTED",
          },
        }),
        // Total requests
        prisma.consultRequest.count({
          where: {
            providerId: {
              in: await prisma.provider
                .findMany({
                  where: { userId },
                  select: { id: true },
                })
                .then((providers) => providers.map((p) => p.id)),
            },
          },
        }),
        // Recent requests with family names
        prisma.consultRequest.findMany({
          where: {
            providerId: {
              in: await prisma.provider
                .findMany({
                  where: { userId },
                  select: { id: true },
                })
                .then((providers) => providers.map((p) => p.id)),
            },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                name: true,
              },
            },
            messages: {
              where: {
                senderId: {
                  not: userId,
                },
                status: {
                  not: "READ",
                },
              },
              select: {
                id: true,
              },
            },
          },
        }),
      ]);

      stats = {
        pendingRequests: pending,
        activeConversations: active,
        savedProviders: 0, // Not applicable for providers
        totalRequests: total,
      };

      recentRequests = requests.map((req) => ({
        id: req.id,
        familyName: req.sender.name,
        status: req.status,
        createdAt: req.createdAt.toISOString(),
        unreadCount: req.messages.length,
      }));
    }

    return NextResponse.json({
      stats,
      recentRequests,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
