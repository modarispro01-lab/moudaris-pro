"use client";

/* ============================================================
   الخطوة 1 — معلومات الأستاذ والمؤسسة (كلها اختيارية)
   ============================================================ */
import React from "react";
import {
  Building2,
  User,
  Info as InfoIcon,
  Layers,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useTimetable } from "../store";
import {
  GROUP_SUGGESTIONS,
  LEVEL_SUGGESTIONS,
  uid,
} from "../defaults";
import type { Info, LevelEntry } from "../types";
import { cx } from "../utils";

export default function InfoStep() {
  const { state, dispatch } = useTimetable();
  const set = (patch: Partial<Info>) => dispatch({ type: "SET_INFO", patch });

  const levels = state.info.levels || [];

  const setLevels = (next: LevelEntry[]) => set({ levels: next });

  const addLevel = (name = "") =>
    setLevels([...levels, { id: uid(), name, groups: [] }]);

  const renameLevel = (id: string, name: string) =>
    setLevels(levels.map((l) => (l.id === id ? { ...l, name } : l)));

  const removeLevel = (id: string) =>
    setLevels(levels.filter((l) => l.id !== id));

  const addGroup = (levelId: string, value = "") =>
    setLevels(
      levels.map((l) =>
        l.id === levelId ? { ...l, groups: [...l.groups, value] } : l
      )
    );

  const setGroup = (levelId: string, idx: number, value: string) =>
    setLevels(
      levels.map((l) =>
        l.id === levelId
          ? { ...l, groups: l.groups.map((g, i) => (i === idx ? value : g)) }
          : l
      )
    );

  const removeGroup = (levelId: string, idx: number) =>
    setLevels(
      levels.map((l) =>
        l.id === levelId
          ? { ...l, groups: l.groups.filter((_, i) => i !== idx) }
          : l
      )
    );

  const availableLevels = LEVEL_SUGGESTIONS.filter(
    (s) => !levels.some((l) => l.name.trim() === s)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm text-text">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
        <span>
          جميع الحقول اختيارية. يمكنك إنشاء استعمال الزمن مباشرة وترك أي حقل فارغًا — لن
          تظهر الحقول الفارغة في الوثيقة المطبوعة.
        </span>
      </div>

      {/* ===== معلومات الأستاذ ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title">
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

      {/* ===== المستويات الدراسية والأفواج ===== */}
      <section className="edt-card">
        <div className="edt-card-title" style={{ justifyContent: "space-between" }}>
          <h2 className="flex items-center gap-2.5">
            <Layers className="h-4 w-4" /> المستويات الدراسية والأفواج
          </h2>
          {levels.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
              {levels.length} مستوى ·{" "}
              {levels.reduce((n, l) => n + l.groups.length, 0)} فوج
            </span>
          )}
        </div>
        <p className="mb-4 text-xs text-muted">
          يمكنك اختيار <b>أكثر من مستوى</b>، ولكل مستوى <b>أكثر من فوج</b>. يظهر ذلك
          في ترويسة الوثيقة المطبوعة. اتركه فارغًا إن لم يُطلب منك.
        </p>

        {/* إضافة سريعة */}
        {availableLevels.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-[11px] font-bold text-muted">إضافة سريعة:</p>
            <div className="flex flex-wrap gap-1.5">
              {availableLevels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => addLevel(l)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-text transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <Plus className="h-3 w-3" /> {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* قائمة المستويات */}
        {levels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-background px-4 py-8 text-center">
            <Layers className="mx-auto mb-2 h-6 w-6 text-border" />
            <p className="text-sm font-bold text-muted">لم تُضف أي مستوى بعد</p>
            <p className="mt-1 text-xs text-muted">
              اضغط «إضافة مستوى» أو استخدم الأزرار السريعة أعلاه
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {levels.map((lv, i) => (
              <div
                key={lv.id}
                className="rounded-xl border border-border bg-background p-3.5"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-extrabold text-primary">
                    {i + 1}
                  </span>
                  <input
                    className={cx(inputCls, "flex-1")}
                    value={lv.name}
                    onChange={(e) => renameLevel(lv.id, e.target.value)}
                    placeholder="اسم المستوى — مثال: المستوى الرابع"
                    list="tt-level-names"
                  />
                  <button
                    type="button"
                    onClick={() => removeLevel(lv.id)}
                    title="حذف المستوى"
                    className="shrink-0 rounded-lg border border-border p-2 text-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* الأفواج */}
                {lv.groups.length > 0 && (
                  <div className="mt-3 space-y-2 ps-8">
                    {lv.groups.map((g, gi) => (
                      <div key={gi} className="flex items-center gap-2">
                        <input
                          className={cx(inputCls, "flex-1 py-2 text-xs")}
                          value={g}
                          onChange={(e) => setGroup(lv.id, gi, e.target.value)}
                          placeholder="اسم الفوج — مثال: فوج أ"
                        />
                        <button
                          type="button"
                          onClick={() => removeGroup(lv.id, gi)}
                          title="حذف الفوج"
                          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* أزرار الأفواج */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 ps-8">
                  <button
                    type="button"
                    onClick={() => addGroup(lv.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-secondary/40 bg-secondary/5 px-2.5 py-1.5 text-[11px] font-bold text-secondary transition-colors hover:bg-secondary/10"
                  >
                    <Plus className="h-3 w-3" /> فوج
                  </button>
                  {GROUP_SUGGESTIONS.filter(
                    (g) => !lv.groups.includes(g)
                  ).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => addGroup(lv.id, g)}
                      title={`إضافة فوج ${g}`}
                      className="rounded-lg border border-border px-2 py-1.5 text-[11px] font-bold text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => addLevel("")}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm font-bold text-text transition-colors hover:border-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" /> إضافة مستوى
        </button>

        <datalist id="tt-level-names">
          {LEVEL_SUGGESTIONS.map((l) => (
            <option key={l} value={l} />
          ))}
        </datalist>
      </section>

      {/* ===== المؤسسة والموسم ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title">
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

      {/* ===== عنوان الوثيقة ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title">عنوان الوثيقة</h2>
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

const inputCls = "edt-input";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="edt-label">{label}</span>
      {children}
    </label>
  );
}