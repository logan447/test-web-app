import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'sent' or 'received'
    const requestType = searchParams.get("requestType"); // 'CONSULTATION' or 'HIRING'

    let requests;

    const activeMode = session.user.activeMode || 'FAMILY';

    if (activeMode === "FAMILY") {
      const familyProfile = await prisma.familyProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!familyProfile) {
        return NextResponse.json([]);
      }

      if (type === "sent") {
        // Sent: requests sent BY this family (must match both sender and family profile)
        const where: any = {
          senderId: session.user.id,
          familyProfileId: familyProfile.id, // Ensure it was sent FROM this family profile
          status: { not: "DECLINED" } // Exclude declined/deleted requests
        };
        if (requestType) {
          where.requestType = requestType;
        }
        requests = await prisma.consultRequest.findMany({
          where,
          include: {
            provider: true,
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: {
              select: {
                messages: {
                  where: {
                    senderId: { not: session.user.id },
                    read: false
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Received: requests where family is the recipient (sent by providers)
        const where: any = {
          familyProfileId: familyProfile.id,
          senderId: { not: session.user.id }, // Exclude requests sent by this user
          status: { not: "DECLINED" } // Exclude declined/deleted requests
        };
        if (requestType) {
          where.requestType = requestType;
        }
        requests = await prisma.consultRequest.findMany({
          where,
          include: {
            provider: true,
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: {
              select: {
                messages: {
                  where: {
                    senderId: { not: session.user.id },
                    read: false
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      // Provider
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
      });

      if (!provider) {
        console.log('[REQUESTS API] No provider found for user:', session.user.id);
        return NextResponse.json([]);
      }

      console.log('[REQUESTS API] Provider mode query:', {
        userId: session.user.id,
        userEmail: provider.user?.email,
        providerId: provider.id,
        providerName: provider.name,
        providerType: provider.providerType,
        type,
        requestType
      });

      if (type === "sent") {
        // Sent: requests sent BY this provider user
        // For both consultation and hiring, sender is this user
        const where: any = {
          senderId: session.user.id,
          status: { not: "DECLINED" } // Exclude declined/deleted requests
        };
        if (requestType) {
          where.requestType = requestType;
        }
        requests = await prisma.consultRequest.findMany({
          where,
          include: {
            provider: true,
            familyProfile: { include: { user: true } },
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: {
              select: {
                messages: {
                  where: {
                    senderId: { not: session.user.id },
                    read: false
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Received: requests where this provider is the recipient
        // The providerId must match this provider AND sender must not be this user
        const where: any = {
          providerId: provider.id,
          senderId: { not: session.user.id },
          status: { not: "DECLINED" } // Exclude declined/deleted requests
        };
        if (requestType) {
          where.requestType = requestType;
        }
        requests = await prisma.consultRequest.findMany({
          where,
          include: {
            provider: true,
            familyProfile: { include: { user: true } },
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
            _count: {
              select: {
                messages: {
                  where: {
                    senderId: { not: session.user.id },
                    read: false
                  }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
      }
    }

    console.log('[REQUESTS API] Returning', requests.length, 'requests');
    if (requests.length > 0 && requestType === 'HIRING') {
      console.log('[REQUESTS API] Sample hiring request:', {
        id: requests[0].id,
        senderId: requests[0].senderId,
        senderName: requests[0].sender?.name,
        providerId: requests[0].providerId,
        providerName: requests[0].provider?.name,
        providerType: requests[0].provider?.providerType,
        requestType: requests[0].requestType
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('[REQUEST API] Unauthorized - no session');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, familyProfileId, message, requestType } = body;

    console.log('[REQUEST API] POST request received:', {
      userId: session.user.id,
      providerId,
      familyProfileId,
      requestType,
      messageLength: message?.length
    });

    const activeMode = session.user.activeMode || 'FAMILY';
    console.log('[REQUEST API] Active mode:', activeMode);

    // Validate that user has a family profile if they're a family member
    if (activeMode === "FAMILY") {
      const profile = await prisma.familyProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return NextResponse.json(
          { error: "Please create a care profile first" },
          { status: 400 }
        );
      }

      // Use the user's family profile
      const request = await prisma.consultRequest.create({
        data: {
          senderId: session.user.id,
          familyProfileId: profile.id,
          providerId,
          message,
          status: "PENDING",
          requestType: requestType || "CONSULTATION",
        },
        include: { provider: true },
      });

      return NextResponse.json(request, { status: 201 });
    } else {
      // Provider sending request to family
      console.log('[REQUEST API] Provider mode - checking subscription');

      // Only require subscription for consultation requests, not hiring requests
      if (requestType !== 'HIRING') {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          include: { subscription: true },
        });

        const subscription = user?.subscription;
        const hasActiveSubscription = subscription?.status === 'ACTIVE' && subscription?.tier !== 'FREE';

        if (!hasActiveSubscription) {
          console.log('[REQUEST API] Subscription required but not active');
          return NextResponse.json(
            {
              error: "Subscription required to send consultation requests",
              requiresUpgrade: true
            },
            { status: 403 }
          );
        }
      } else {
        console.log('[REQUEST API] Hiring request - skipping subscription check');
      }

      console.log('[REQUEST API] Creating request with data:', {
        senderId: session.user.id,
        familyProfileId,
        providerId,
        status: "PENDING",
        requestType: requestType || "CONSULTATION"
      });

      const request = await prisma.consultRequest.create({
        data: {
          senderId: session.user.id,
          familyProfileId,
          providerId,
          message,
          status: "PENDING",
          requestType: requestType || "CONSULTATION",
        },
        include: { familyProfile: { include: { user: true } } },
      });

      console.log('[REQUEST API] Request created successfully:', request.id);
      return NextResponse.json(request, { status: 201 });
    }
  } catch (error) {
    console.error("[REQUEST API] Error creating request:", error);
    console.error("[REQUEST API] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      {
        error: "Failed to create request",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
