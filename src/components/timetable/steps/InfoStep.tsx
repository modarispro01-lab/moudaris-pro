"use client";

/* ============================================================
   الخطوة 1 — معلومات الأستاذ والمؤسسة (كلها اختيارية)
   ============================================================ */
import React from "react";
import { Building2, User, Info as InfoIcon } from "lucide-react";
import { useTimetable } from "../store";
import type { Info } from "../types";

const LEVELS = [
  "المستوى الأول",
  "المستوى الثاني",
  "المستوى الثالث",
  "المستوى الرابع",
  "المستوى الخامس",
  "المستوى السادس",
  "قسم مشترك",
];

export default function InfoStep() {
  const { state, dispatch } = useTimetable();
  const set = (patch: Partial<Info>) => dispatch({ type: "SET_INFO", patch });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-text">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
        <span>
          جميع الحقول اختيارية. يمكنك إنشاء استعمال الزمن مباشرة وترك أي حقل فارغًا — لن
          تظهر الحقول الفارغة في الوثيقة المطبوعة.
        </span>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-text">
          <User className="h-4 w-4 text-primary" /> معلومات الأستاذ(ة)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الأستاذ(ة)">
            <input
              className={inputCls}
              value={state.info.teacher}
              onChange={(e) => set({ teacher: e.target.value })}
              placeholder="مثال: محمد العلوي"
            />
          </Field>
          <Field label="المستوى الدراسي">
            <input
              className={inputCls}
              list="tt-levels"
              value={state.info.level}
              onChange={(e) => set({ level: e.target.value })}
              placeholder="مثال: المستوى الرابع"
            />
            <datalist id="tt-levels">
              {LEVELS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
          <Field label="القسم">
            <input
              className={inputCls}
              value={state.info.section}
              onChange={(e) => set({ section: e.target.value })}
              placeholder="مثال: القسم (أ)"
            />
          </Field>
          <Field label="رقم التأجير (اختياري)">
            <input
              className={inputCls}
              value={state.info.employeeId}
              onChange={(e) => set({ employeeId: e.target.value })}
              placeholder="مثال: 1234567"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-extrabold text-text">
          <Building2 className="h-4 w-4 text-primary" /> المؤسسة والموسم
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الأكاديمية الجهوية للتربية والتكوين">
            <input
              className={inputCls}
              value={state.info.academy}
              onChange={(e) => set({ academy: e.target.value })}
              placeholder="مثال: جهة مراكش آسفي"
            />
          </Field>
          <Field label="المديرية الإقليمية">
            <input
              className={inputCls}
              value={state.info.direction}
              onChange={(e) => set({ direction: e.target.value })}
              placeholder="مثال: المديرية الإقليمية بقلعة السراغنة"
            />
          </Field>
          <Field label="اسم المؤسسة التعليمية">
            <input
              className={inputCls}
              value={state.info.school}
              onChange={(e) => set({ school: e.target.value })}
              placeholder="مثال: مجموعة مدارس النخيل"
            />
          </Field>
          <Field label="الموسم الدراسي">
            <input
              className={inputCls}
              value={state.info.year}
              onChange={(e) => set({ year: e.target.value })}
              placeholder="2026/2027"
            />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-extrabold text-text">عنوان الوثيقة</h2>
        <Field label="يظهر كعنوان رئيسي في الوثيقة المطبوعة">
          <input
            className={inputCls}
            value={state.info.docTitle}
            onChange={(e) => set({ docTitle: e.target.value })}
            placeholder="استعمال الزمن الأسبوعي – فترة التعليم الصريح"
          />
        </Field>
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-surface";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}
