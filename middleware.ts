import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/post/new", "/settings"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;

  const isProtected = PROTECTED_PATHS.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
