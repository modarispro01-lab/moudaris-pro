import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  GATE_PATH,
  isGateConfigured,
  isPrivatePath,
  isValidAccessToken,
} from "@/lib/private-tools";

/**
 * ===== حماية الأدوات الخاصة =====
 * فـ Next 16 الملف ولّى proxy.ts بدل middleware.ts (نفس الوظيفة، Node.js runtime).
 * إلا ما كانش TOOLS_PASSWORD مضبوط: الحماية كتبقى مقفولة (fail-closed)
 * و /gate كتعرض رسالة واضحة باش يتصلّح الإعداد.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /* ماشي مسار خاص: كيمشي نيشان */
  if (!isPrivatePath(pathname)) return NextResponse.next();

  /* عندو كوكي صالح: كيمشي نيشان */
  if (isGateConfigured() && isValidAccessToken(request.cookies.get(ACCESS_COOKIE)?.value)) {
    return NextResponse.next();
  }

  /* ما عندوش: كيتوجّه لصفحة كلمة السر مع حفظ المسار المطلوب */
  const url = request.nextUrl.clone();
  url.pathname = GATE_PATH;
  url.search = "";
  url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/tools/daily-memo-explicit/:path*",
    "/tools/timetable-generator/:path*",
    "/tools/week-memo/:path*",
  ],
};