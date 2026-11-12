/* ============================================================
   خريطة الحصة — فروع ثابتة ومفتاح تخزين مستقل عن معرّف الحصة
   منطق نقي: بلا React، بلا تخزين، بلا شبكة.
   ============================================================ */

import type { LessonDoc, MindMapBranch } from "@/components/workspace/types";

/** أسماء الفروع الخمسة — ثابتة لتوحيد العرض والطباعة */
export const BRANCH_LABELS = ["الأهداف", "المراحل", "الوسائل", "التقويم", "الدعم"] as const;

/** معرّفات الفروع — لا تتغير أبداً (المفاتيح المحفوظة تعتمد عليها) */
export const BRANCH_IDS = ["objectives", "stages", "materials", "assessment", "support"] as const;

/**
 * مفتاح الخريطة: التاريخ + الحصة + الفوج.
 * مستقل عن معرّف الحصة كي تبقى الخريطة بعد «أعد التوليد».
 */
export function mindMapKey(date: string, lesson: LessonDoc): string {
  return [date, lesson.periodId, lesson.groupLabel || "-"].join("|");
}

/** الفروع الأولية مشتقة من حقول الحصة — تُملأ تلقائياً بلا كتابة */
export function defaultBranches(lesson: LessonDoc): MindMapBranch[] {
  const seed = [
    lesson.objectives || "",
    lesson.stages || "",
    lesson.materials || "",
    "",
    "",
  ];
  return BRANCH_IDS.map((id, i) => ({ id, label: BRANCH_LABELS[i], text: seed[i] }));
}
