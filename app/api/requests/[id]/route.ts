import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    // Paywall check: Providers need a subscription to accept requests
    if (status === "ACCEPTED") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true },
      });

      const activeMode = user?.activeMode || 'FAMILY';

      if (activeMode === "PROVIDER") {
        const subscription = user?.subscription;
        const hasActiveSubscription = subscription?.status === 'ACTIVE' && subscription?.tier !== 'FREE';

        if (!hasActiveSubscription) {
          return NextResponse.json(
            {
              error: "Subscription required to accept consultation requests",
              requiresUpgrade: true
            },
            { status: 403 }
          );
        }
      }
    }

    const request = await prisma.consultRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const request = await prisma.consultRequest.findUnique({
      where: { id },
      include: {
        provider: true,
        familyProfile: { include: { user: true } },
        sender: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Update the request status to DECLINED instead of deleting
    // This preserves the record and notifies the other party
    const request = await prisma.consultRequest.update({
      where: { id },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({
      success: true,
      message: "Request declined",
      request
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
