/* ============================================================
   جنس صاحب التوقيع: الأستاذ / المدير / المفتش
   "neutral" = الصيغة المحايدة «(ة)» — الافتراضي حفاظاً على المستندات القديمة.
   ============================================================ */

export type Gender = "neutral" | "male" | "female";

/** أجناس الأدوار الثلاثة — المفتاح "director" يقابل «المدير» في كل الأدوات */
export interface RoleGenders {
  teacher?: Gender;
  director?: Gender;
  inspector?: Gender;
}

/** يطبّع قيمة قادمة من التخزين أو من واجهة المستخدم */
export function normalizeGender(value: unknown): Gender {
  return value === "male" || value === "female" ? value : "neutral";
}

/**
 * يحوّل تسمية القالب إلى الصيغة المطلوبة:
 *   «الأستاذ(ة)» + female → «الأستاذة»
 *   «الأستاذ(ة)» + male   → «الأستاذ»
 *   «الأستاذ(ة)» + neutral/undefined → «الأستاذ(ة)» بلا تغيير
 * أي تسمية لا تحتوي «(ة)» تُعاد كما هي.
 */
export function genderLabel(label: string, gender?: Gender): string {
  const text = label ?? "";
  const g = normalizeGender(gender);
  if (g === "neutral" || !text.includes("(ة)")) return text;
  if (g === "female") return text.replace(/\(ة\)/g, "ة");
  return text.replace(/\(ة\)/g, "");
}
