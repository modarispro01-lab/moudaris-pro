import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  accessToken,
  isGateConfigured,
  isValidPassword,
  safeNextPath,
} from "@/lib/private-tools";

/* مسار ديناميكي: كيتعامل مع الفورم والكوكي */
export const dynamic = "force-dynamic";

/** تسجيل الخروج: GET /api/gate?logout=1 */
export async function GET(request: NextRequest) {
  const logout = request.nextUrl.searchParams.get("logout");
  const res = NextResponse.redirect(new URL("/", request.url));
  if (logout === "1") {
    res.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  }
  return res;
}

/** إدخال كلمة السر */
export async function POST(request: NextRequest) {
  /* الحماية غير مهيّأة: ما كاين حتى كلمة سر صالحة */
  if (!isGateConfigured()) {
    return NextResponse.redirect(new URL("/gate?error=1", request.url), 303);
  }

  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNextPath(String(form.get("next") ?? ""));

  /* كلمة سر خاطئة: رجوع لصفحة الدخول برسالة خطأ */
  if (!isValidPassword(password)) {
    const back = new URL("/gate", request.url);
    back.searchParams.set("error", "1");
    back.searchParams.set("next", next);
    return NextResponse.redirect(back, 303);
  }

  /* نجاح: كوكي httpOnly صالح 30 يوم، ثم تحويل للمسار المطلوب */
  const res = NextResponse.redirect(new URL(next, request.url), 303);
  res.cookies.set(ACCESS_COOKIE, accessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  return res;
}