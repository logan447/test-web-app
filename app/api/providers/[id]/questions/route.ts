import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/providers/[id]/questions — fetch questions for a provider
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const questions = await prisma.question.findMany({
      where: { providerId: params.id },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

// POST /api/providers/[id]/questions — post a new question
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to ask a question" }, { status: 401 });
  }

  try {
    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length < 5) {
      return NextResponse.json({ error: "Question must be at least 5 characters" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        providerId: params.id,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({ question }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to post question" }, { status: 500 });
  }
}
