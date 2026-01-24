import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { UserMode } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, intent } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Determine initial activeMode based on intent (Manual Ch 1.1)
    // - intent=provider → PROVIDER mode (from /for-providers CTA, "Claim this page", etc.)
    // - no intent or any other value → FAMILY mode (default)
    const initialMode: UserMode = intent === 'provider' ? 'PROVIDER' : 'FAMILY';

    console.log('SIGNUP DEBUG: Creating user:', email, 'intent:', intent, 'initialMode:', initialMode);

    // Create user with minimal required fields (name/phone collected in onboarding)
    // Use email prefix as placeholder name - real name collected during onboarding
    const placeholderName = email.split('@')[0] || 'User';
    const user = await prisma.user.create({
      data: {
        name: placeholderName,
        email,
        passwordHash: hashedPassword,
        role,
        activeMode: initialMode, // Set based on intent param
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: user.id,
        activeMode: initialMode, // Return the mode so client can redirect appropriately
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
