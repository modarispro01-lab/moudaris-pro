/* ============================================================
   دوال مساعدة — الوقت، الألوان، التحقق
   ============================================================ */

/** دمج أصناف CSS */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** "HH:MM" -> دقائق من منتصف الليل، أو null إن كان غير صحيح */
export function timeToMin(t: string | undefined | null): number | null {
  if (!t) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mn = Number(m[2]);
  if (h < 0 || h > 23 || mn < 0 || mn > 59) return null;
  return h * 60 + mn;
}

/** دقائق -> "HH:MM" */
export function minToTime(total: number): string {
  const t = ((total % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

/** مدة بالدقائق بين وقتين، أو null */
export function durationMin(start?: string, end?: string): number | null {
  const a = timeToMin(start);
  const b = timeToMin(end);
  if (a === null || b === null) return null;
  return b - a;
}

/** صياغة مدة بالعربية: 90 -> "1 س 30 د" */
export function formatDuration(mins: number | null): string {
  if (mins === null || mins <= 0) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} س ${m} د`;
  if (h) return `${h} س`;
  return `${m} د`;
}

export interface TimeIssue {
  level: "error" | "warn";
  msg: string;
}

/** التحقق من صحة فترة واحدة */
export function validatePeriod(start: string, end: string): TimeIssue | null {
  const a = timeToMin(start);
  const b = timeToMin(end);
  if (a === null || b === null) {
    return { level: "error", msg: "أدخل وقتًا صحيحًا بصيغة 24 ساعة (مثال: 08:15)" };
  }
  if (b <= a) {
    return { level: "error", msg: "وقت النهاية يجب أن يكون بعد وقت البداية" };
  }
  return null;
}

/**
 * كشف التداخل الزمني بين الفترات.
 * يُرجع خريطة: periodId -> رسالة التداخل (إن وُجد تداخل مع فترة أخرى)
 */
export function detectOverlaps(
  periods: Array<{ id: string; start: string; end: string }>
): Record<string, string> {
  const out: Record<string, string> = {};
  const valid = periods
    .map((p) => ({ id: p.id, a: timeToMin(p.start), b: timeToMin(p.end) }))
    .filter((p) => p.a !== null && p.b !== null && p.b > p.a) as Array<{
    id: string;
    a: number;
    b: number;
  }>;
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      const x = valid[i];
      const y = valid[j];
      if (x.a < y.b && y.a < x.b) {
        out[x.id] = "تداخل زمني مع فترة أخرى";
        out[y.id] = "تداخل زمني مع فترة أخرى";
      }
    }
  }
  return out;
}

/* ============================ المستوى والفوج ============================ */

/** اسم الفوج جاهزًا للعرض: "أ" -> "الفوج أ"، و"فوج أ" تبقى كما هي */
export function groupLabel(name?: string): string {
  const t = (name || "").trim();
  if (!t) return "";
  return /^(ال)?فوج/.test(t) ? t : `الفوج ${t}`;
}

/** سطر المستوى والفوج تحت اسم المادة، مثال: "المستوى الأول · الفوج أ" */
export function audienceLabel(levelName?: string, group?: string): string {
  return [(levelName || "").trim(), groupLabel(group)].filter(Boolean).join(" · ");
}

/* ============================ الألوان ============================ */

/** #RRGGBB -> rgba(r,g,b,a) */
export function hexToRgba(hex: string, alpha: number): string {
  let h = (hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** لون نصّ مناسب (أبيض/أسود) حسب سطوع الخلفية */
export function readableTextOn(hex: string): string {
  let h = (hex || "#000000").replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16) || 0;
  const g = parseInt(h.slice(2, 4), 16) || 0;
  const b = parseInt(h.slice(4, 6), 16) || 0;
  // luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.62 ? "#1F2937" : "#FFFFFF";
}

/** هل اللون فاتح؟ */
export function isLight(hex: string): boolean {
  return readableTextOn(hex) !== "#FFFFFF";
}
