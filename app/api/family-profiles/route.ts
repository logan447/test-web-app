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
    const city = searchParams.get("city");
    const state = searchParams.get("state");

    const where: any = {
      isPublic: true, // Only show public profiles in Browse Care Requests
    };

    if (city) {
      where.city = {
        contains: city,
        mode: "insensitive",
      };
    }

    if (state) {
      where.state = {
        contains: state,
        mode: "insensitive",
      };
    }

    const profiles = await prisma.familyProfile.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching family profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch family profiles" },
      { status: 500 }
    );
  }
}
