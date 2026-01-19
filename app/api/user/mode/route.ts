import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserMode } from "@prisma/client";

/**
 * PATCH /api/user/mode - Update user's active mode
 *
 * Request body: { mode: "FAMILY" | "PROVIDER" }
 *
 * This is the canonical endpoint for switching modes (Manual Ch 2).
 * The database is the single source of truth for mode.
 *
 * @see docs/master-platform-manual.md Chapter 2
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { mode } = body;

    // Validate mode
    if (!mode || !['FAMILY', 'PROVIDER'].includes(mode)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_MODE",
            message: "Invalid mode. Must be FAMILY or PROVIDER",
            details: { received: mode, valid: ['FAMILY', 'PROVIDER'] }
          }
        },
        { status: 400 }
      );
    }

    // Update user's active mode in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { activeMode: mode as UserMode },
      select: { activeMode: true },
    });

    console.log('MODE SWITCH DEBUG: User', session.user.email, 'switched to', mode);

    return NextResponse.json({
      success: true,
      data: {
        mode: updatedUser.activeMode,
        landingPage: mode === 'PROVIDER' ? '/provider/requests' : '/',
      }
    });

  } catch (error) {
    console.error("Error switching mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to switch mode" }
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/mode - Get user's current active mode
 *
 * Returns the current mode from the session (which mirrors the DB).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        mode: session.user.activeMode,
      }
    });

  } catch (error) {
    console.error("Error fetching mode:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch mode" }
      },
      { status: 500 }
    );
  }
}
