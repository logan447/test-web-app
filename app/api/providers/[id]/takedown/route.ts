import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Takedown reasons that match the enum in schema
const VALID_REASONS = [
  "NOT_MY_BUSINESS",
  "INCORRECT_INFO",
  "BUSINESS_CLOSED",
  "PRIVACY_CONCERN",
  "DUPLICATE_LISTING",
  "OTHER",
] as const;

type TakedownReason = (typeof VALID_REASONS)[number];

interface TakedownRequestBody {
  reason: TakedownReason;
  details?: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone?: string | null;
  proofUrl?: string | null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: TakedownRequestBody = await req.json();

    // Validate required fields
    if (!body.reason || !VALID_REASONS.includes(body.reason)) {
      return NextResponse.json(
        { error: "Invalid or missing reason" },
        { status: 400 }
      );
    }

    if (!body.contactName?.trim()) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }

    if (!body.contactEmail?.trim()) {
      return NextResponse.json(
        { error: "Contact email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail.trim())) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // For "OTHER" reason, details are required
    if (body.reason === "OTHER" && !body.details?.trim()) {
      return NextResponse.json(
        { error: "Please provide details for your request" },
        { status: 400 }
      );
    }

    // Verify the provider exists
    const provider = await prisma.provider.findUnique({
      where: { id },
      select: { id: true, name: true, providerType: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Only allow takedown requests for organizations (not individual caregivers)
    if (provider.providerType === "INDEPENDENT_CAREGIVER") {
      return NextResponse.json(
        { error: "Takedown requests are only available for organization listings" },
        { status: 400 }
      );
    }

    // Check for existing pending request from same email
    const existingRequest = await prisma.takedownRequest.findFirst({
      where: {
        providerId: id,
        contactEmail: body.contactEmail.trim().toLowerCase(),
        status: "PENDING",
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending request for this listing. Please wait for it to be reviewed." },
        { status: 400 }
      );
    }

    // Create the takedown request
    const takedownRequest = await prisma.takedownRequest.create({
      data: {
        providerId: id,
        reason: body.reason,
        details: body.details?.trim() || null,
        contactName: body.contactName.trim(),
        contactEmail: body.contactEmail.trim().toLowerCase(),
        contactPhone: body.contactPhone?.trim() || null,
        proofUrl: body.proofUrl?.trim() || null,
        status: "PENDING",
      },
    });

    // TODO: Send email notification to admin team
    // TODO: Send confirmation email to requester

    return NextResponse.json({
      success: true,
      requestId: takedownRequest.id,
      message: "Your takedown request has been submitted and will be reviewed within 5-7 business days.",
    });
  } catch (error) {
    console.error("Error submitting takedown request:", error);
    return NextResponse.json(
      { error: "Failed to submit takedown request. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to check status of existing requests (optional, for future use)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    const requests = await prisma.takedownRequest.findMany({
      where: {
        providerId: id,
        contactEmail: email.toLowerCase(),
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        reviewNotes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching takedown requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch takedown requests" },
      { status: 500 }
    );
  }
}
