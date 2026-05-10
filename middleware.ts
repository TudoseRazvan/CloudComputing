import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_PREFIXES = ["/compose", "/history"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("authRequired", "1");
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
