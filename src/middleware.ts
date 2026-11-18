import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";
import { canAccessPath } from "@/lib/rules";
import { DEV_AUTH_BYPASS } from "@/lib/dev-auth";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  if (DEV_AUTH_BYPASS) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const role = request.auth?.user?.role;
  const protectedPrefix = ["/student", "/teacher", "/admin", "/owner"].some((prefix) => pathname.startsWith(prefix));

  if (protectedPrefix && !role) {
    const url = new URL("/login", request.nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (role && protectedPrefix && !canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL("/forbidden", request.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*", "/owner/:path*"],
};
