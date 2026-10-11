import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocale, type Locale } from "@/lib/i18n";

function preferredLocale(request: NextRequest): Locale {
  return request.headers.get("accept-language")?.toLowerCase().startsWith("zh")
    ? "zh-CN"
    : "en";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  if (isLocale(firstSegment)) {
    return NextResponse.next();
  }

  const locale = preferredLocale(request);
  const destination = request.nextUrl.clone();
  destination.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
