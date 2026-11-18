import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * ===== الأدوات الخاصة =====
 * مصدر واحد للحقيقة: أي مسار كيتزاد هنا كيتحمى أوتوماتيكياً عبر proxy.ts.
 */
export const PRIVATE_TOOL_PATHS = [
  "/tools/daily-memo-explicit",
  "/tools/timetable-generator",
  "/tools/week-memo",
] as const;

/** اسم الكوكي اللي كيحمل الإذن */
export const ACCESS_COOKIE = "mp_access";

/** صفحة إدخال كلمة السر */
export const GATE_PATH = "/gate";

/** مدة الصلاحية: 30 يوم بالثواني */
export const ACCESS_MAX_AGE = 60 * 60 * 24 * 30;

/** نص ثابت داخل حساب التوكن — تبديله كيبطّل كل الكوكيز القديمة */
const TOKEN_MESSAGE = "modaris-access-v1";

/** كلمة السر من متغيّرات البيئة (Vercel) */
export function accessPassword(): string {
  return (process.env.TOOLS_PASSWORD ?? "").trim();
}

/** واش الحماية مهيّأة؟ */
export function isGateConfigured(): boolean {
  return accessPassword().length > 0;
}

/** واش المسار خاص؟ (مطابقة دقيقة + المسارات الفرعية) */
export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_TOOL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/** توليد قيمة الكوكي انطلاقاً من كلمة السر */
export function accessToken(): string {
  const password = accessPassword();
  if (!password) return "";
  return createHmac("sha256", password).update(TOKEN_MESSAGE).digest("hex");
}

/** التحقق من الكوكي بمقارنة آمنة ضد هجمات التوقيت */
export function isValidAccessToken(token: string | undefined): boolean {
  const expected = accessToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** التحقق من كلمة السر المُدخلة */
export function isValidPassword(password: string): boolean {
  const expected = accessToken();
  if (!expected || !password) return false;
  const given = createHmac("sha256", password).update(TOKEN_MESSAGE).digest("hex");
  const a = Buffer.from(given, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** تنقية مسار الرجوع: خاصو يكون داخلي (منع Open Redirect) */
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/tools";
  if (!next.startsWith("/")) return "/tools";
  if (next.startsWith("//")) return "/tools";
  if (next.startsWith("/\\")) return "/tools";
  if (next.startsWith(GATE_PATH)) return "/tools";
  return next;
}