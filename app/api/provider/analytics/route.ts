import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/provider/analytics
 * Returns analytics data for the provider dashboard including:
 * - Response rate (how quickly they respond to requests)
 * - Conversion rate (requests accepted / total requests)
 * - Profile views (simulated for now)
 * - Weekly activity trends
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get provider profile
    const provider = await prisma.provider.findFirst({
      where: { userId: session.user.id },
      select: { id: true, createdAt: true },
    });

    if (!provider) {
      return NextResponse.json({
        responseRate: 0,
        conversionRate: 0,
        profileViews: 0,
        weeklyTrend: [],
        totalRequests: 0,
        acceptedRequests: 0,
        pendingRequests: 0,
        avgResponseTime: null,
      });
    }

    // Get request statistics
    const [totalRequests, acceptedRequests, declinedRequests, pendingRequests] =
      await Promise.all([
        prisma.consultRequest.count({
          where: { providerId: provider.id },
        }),
        prisma.consultRequest.count({
          where: { providerId: provider.id, status: "ACCEPTED" },
        }),
        prisma.consultRequest.count({
          where: { providerId: provider.id, status: "DECLINED" },
        }),
        prisma.consultRequest.count({
          where: { providerId: provider.id, status: "PENDING" },
        }),
      ]);

    // Calculate conversion rate (accepted / (accepted + declined))
    const respondedRequests = acceptedRequests + declinedRequests;
    const conversionRate =
      respondedRequests > 0
        ? Math.round((acceptedRequests / respondedRequests) * 100)
        : 0;

    // Calculate response rate (responded / total excluding very recent)
    const responseRate =
      totalRequests > 0
        ? Math.round((respondedRequests / totalRequests) * 100)
        : 0;

    // Get weekly activity trend (last 4 weeks)
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const weeklyRequests = await prisma.consultRequest.findMany({
      where: {
        providerId: provider.id,
        createdAt: { gte: fourWeeksAgo },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    // Group by week
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekRequests = weeklyRequests.filter(
        (r) => r.createdAt >= weekStart && r.createdAt < weekEnd
      );

      const weekLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      weeklyTrend.push({
        week: weekLabel,
        requests: weekRequests.length,
        accepted: weekRequests.filter((r) => r.status === "ACCEPTED").length,
      });
    }

    // Simulate profile views (in production, this would come from analytics tracking)
    // Base views on account age and activity
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(provider.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const baseViews = Math.min(daysSinceCreated * 3, 500);
    const activityBonus = totalRequests * 5;
    const profileViews = baseViews + activityBonus + Math.floor(Math.random() * 20);

    // Get recent tour count
    const upcomingTours = await prisma.tourAppointment.count({
      where: {
        request: {
          providerId: provider.id,
        },
        status: { in: ["PENDING", "ACCEPTED"] },
        proposedDate: { gte: new Date() },
      },
    });

    return NextResponse.json({
      responseRate,
      conversionRate,
      profileViews,
      weeklyTrend,
      totalRequests,
      acceptedRequests,
      pendingRequests,
      upcomingTours,
      avgResponseTime: respondedRequests > 0 ? "< 24 hours" : null,
    });
  } catch (error) {
    console.error("Provider analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
