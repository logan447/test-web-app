import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyNewRequest } from "@/lib/notificationService";

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
        include: {
          user: {
            include: {
              subscription: true
            }
          }
        }
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

      // Providers need subscription to view/interact with requests
      const subscription = provider.user?.subscription;
      const hasActiveSubscription = subscription?.status === 'ACTIVE' && subscription?.tier !== 'FREE';

      if (!hasActiveSubscription) {
        console.log('[REQUESTS API] Provider viewing requests without subscription - return empty');
        // Return empty array instead of error to allow browsing but not interacting
        return NextResponse.json([]);
      }

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
    const { providerId, familyProfileId, message, requestType, contactReason, preferredContactMethod, preferredTourDate } = body;

    console.log('[REQUEST API] POST request received:', {
      userId: session.user.id,
      providerId,
      familyProfileId,
      requestType,
      messageLength: message?.length,
      contactReason,
      preferredContactMethod,
      preferredTourDate
    });

    // IMPORTANT: Read activeMode from database instead of session
    // Session might be stale after a recent mode switch (race condition)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeMode: true }
    });
    const activeMode = user?.activeMode || 'FAMILY';
    console.log('[REQUEST API] Active mode (from DB):', activeMode);

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
          contactReason: contactReason || null,
          preferredContactMethod: preferredContactMethod || null,
          preferredTourDate: preferredTourDate ? new Date(preferredTourDate) : null,
        },
        include: { provider: true },
      });

      // Send email notification to provider (non-blocking)
      notifyNewRequest({
        requestId: request.id,
        senderId: session.user.id,
        isOutreach: false,
      }).catch(console.error);

      return NextResponse.json(request, { status: 201 });
    } else {
      // Provider sending request (consultation OR hiring)
      console.log('[REQUEST API] Provider mode - checking subscription');

      // All providers need $25/month subscription to send any type of request
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true },
      });

      const subscription = user?.subscription;
      const hasActiveSubscription = subscription?.status === 'ACTIVE' && subscription?.tier !== 'FREE';

      if (!hasActiveSubscription) {
        console.log('[REQUEST API] Subscription required but not active');
        const requestTypeName = requestType === 'HIRING' ? 'hiring' : 'consultation';
        return NextResponse.json(
          {
            error: `Provider membership ($25/month) required to send ${requestTypeName} requests`,
            requiresUpgrade: true
          },
          { status: 403 }
        );
      }

      console.log('[REQUEST API] Subscription active, proceeding with request');

      // For HIRING requests (provider-to-provider), familyProfileId is optional
      // For CONSULTATION requests, we need a familyProfileId
      const isHiringRequest = requestType === 'HIRING';
      let resolvedFamilyProfileId = familyProfileId;

      if (!isHiringRequest && !resolvedFamilyProfileId) {
        // Non-hiring requests need a family profile
        const userFamilyProfile = await prisma.familyProfile.findUnique({
          where: { userId: session.user.id },
        });

        if (userFamilyProfile) {
          console.log('[REQUEST API] No familyProfileId in body, using user\'s family profile:', userFamilyProfile.id);
          resolvedFamilyProfileId = userFamilyProfile.id;
        } else {
          console.log('[REQUEST API] No familyProfileId and user has no family profile');
          return NextResponse.json(
            { error: "Please create a care profile first to contact providers" },
            { status: 400 }
          );
        }
      }

      // For hiring requests, get the sender's provider info
      let senderProviderId = null;
      if (isHiringRequest) {
        const senderProvider = await prisma.provider.findUnique({
          where: { userId: session.user.id },
        });
        if (senderProvider) {
          senderProviderId = senderProvider.id;
        }
      }

      console.log('[REQUEST API] Creating request with data:', {
        senderId: session.user.id,
        familyProfileId: resolvedFamilyProfileId,
        providerId,
        senderProviderId,
        status: "PENDING",
        requestType: requestType || "CONSULTATION"
      });

      const request = await prisma.consultRequest.create({
        data: {
          senderId: session.user.id,
          familyProfileId: resolvedFamilyProfileId || undefined,
          providerId,
          senderProviderId: senderProviderId || undefined,
          message,
          status: "PENDING",
          requestType: requestType || "CONSULTATION",
          contactReason: contactReason || null,
          preferredContactMethod: preferredContactMethod || null,
          preferredTourDate: preferredTourDate ? new Date(preferredTourDate) : null,
        },
        include: {
          familyProfile: { include: { user: true } },
          provider: true,
          senderProvider: true,
        },
      });

      console.log('[REQUEST API] Request created successfully:', request.id);

      // Send email notification (non-blocking)
      // For provider-initiated requests, it's "outreach" to families
      notifyNewRequest({
        requestId: request.id,
        senderId: session.user.id,
        isOutreach: true,
      }).catch(console.error);

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
