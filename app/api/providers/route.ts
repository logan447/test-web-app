import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProviderType, CareType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const providerType = searchParams.get("providerType");
    const careType = searchParams.get("careType");

    const where: any = {
      active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (providerType) {
      where.providerType = providerType as ProviderType;
    }

    if (careType) {
      where.careTypesOffered = {
        has: careType as CareType,
      };
    }

    const providers = await prisma.provider.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const provider = await prisma.provider.create({
      data: {
        name: body.name,
        providerType: body.providerType,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        description: body.description,
        website: body.website,
        careTypesOffered: body.careTypesOffered || [],
        serviceRadius: body.serviceRadius,
        licensed: body.licensed || false,
        licenseNumber: body.licenseNumber,
        yearsInBusiness: body.yearsInBusiness,
        capacity: body.capacity,
        userId: body.userId,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 }
    );
  }
}
