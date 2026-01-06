import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    console.log("=== MIDDLEWARE RUNNING ===");
    console.log("Path:", req.nextUrl.pathname);
    console.log("Token:", req.nextauth.token);
    console.log("User role:", req.nextauth.token?.role);

    // If user is accessing /dashboard and is a FAMILY user, redirect to home
    if (
      req.nextUrl.pathname.startsWith("/dashboard") &&
      req.nextauth.token?.role === "FAMILY"
    ) {
      console.log("REDIRECTING FAMILY USER TO /");
      return NextResponse.redirect(new URL("/", req.url));
    }

    console.log("NOT REDIRECTING - continuing to dashboard");
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
