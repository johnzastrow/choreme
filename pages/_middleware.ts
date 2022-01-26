import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * @param {NextRequest} req
 *  */
export async function middleware(req: NextRequest) {
  if (
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname.startsWith("/images") ||
    req.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }
  const session = await getToken({
    // @ts-ignore
    req,
    secret: process.env.JWT_SECRET ?? "",
    secureCookie:
      process.env.NEXTAUTH_URL?.startsWith("https://") ??
      !!process.env.VERCEL_URL,
  });
  if (!session) {
    return NextResponse.redirect("/auth?callbackUrl=" + req.nextUrl.pathname);
  } else if (req.nextUrl.pathname.startsWith("/children")) {
    // You could also check for any property on the session object,
    // like role === "admin" or name === "John Doe", etc.
    if (session.role !== "children") {
      return NextResponse.redirect('/api/auth/error?error="Permission denied"');
    }
    // If user is authenticated, continue.
  } else if (req.nextUrl.pathname.startsWith("/parent")) {
    if (session.role !== "parent") {
      return NextResponse.redirect('/api/auth/error?error="Permission denied"');
    }
  } else if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect("/" + session.role);
  }
}
