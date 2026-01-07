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
        requests = await prisma.consultRequest.findMany({
          where: { senderId: session.user.id },
          include: {
            provider: true,
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Received: requests where family is the recipient (sent by providers)
        requests = await prisma.consultRequest.findMany({
          where: {
            familyProfileId: familyProfile.id,
            senderId: { not: session.user.id } // Exclude requests sent by this user
          },
          include: {
            provider: true,
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        });
      }
    } else {
      // Provider
      const provider = await prisma.provider.findUnique({
        where: { userId: session.user.id },
      });

      if (!provider) {
        return NextResponse.json([]);
      }

      if (type === "sent") {
        // Sent: requests where provider is the sender
        requests = await prisma.consultRequest.findMany({
          where: {
            providerId: provider.id,
            senderId: session.user.id
          },
          include: {
            familyProfile: { include: { user: true } },
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        });
      } else {
        // Received: requests where provider is the recipient (sent by families)
        requests = await prisma.consultRequest.findMany({
          where: {
            providerId: provider.id,
            senderId: { not: session.user.id }
          },
          include: {
            familyProfile: { include: { user: true } },
            sender: true,
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: { createdAt: "desc" },
        });
      }
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { providerId, familyProfileId, message } = body;

    const activeMode = session.user.activeMode || 'FAMILY';

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
        },
        include: { provider: true },
      });

      return NextResponse.json(request, { status: 201 });
    } else {
      // Provider sending request to family
      const request = await prisma.consultRequest.create({
        data: {
          senderId: session.user.id,
          familyProfileId,
          providerId,
          message,
          status: "PENDING",
        },
        include: { familyProfile: { include: { user: true } } },
      });

      return NextResponse.json(request, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
