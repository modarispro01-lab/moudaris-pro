"use client";

/* ============================================================
   الخطوة 4 — التصميم والمعاينة والتصدير
   ============================================================ */
import React from "react";
import {
  AlignJustify,
  Check,
  Eye,
  LayoutTemplate,
  Pencil,
  Ruler,
  Smartphone,
  Type as TypeIcon,
} from "lucide-react";
import { FONTS, TEMPLATES } from "../defaults";
import { useTimetable } from "../store";
import { resolveTheme } from "../theme";
import PreviewStage from "../PreviewStage";
import ProjectActions from "../ProjectActions";
import type { Design } from "../types";
import { cx } from "../utils";

export default function DesignStep({
  onEdit,
  onNotify,
}: {
  onEdit: () => void;
  onNotify: (msg: string, kind?: "ok" | "err") => void;
}) {
  const { state, dispatch } = useTimetable();
  const theme = resolveTheme(state.design);
  const set = (patch: Partial<Design>) => dispatch({ type: "SET_DESIGN", patch });

  return (
    <div className="space-y-6">
      {/* ===== القوالب ===== */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-1 flex items-center gap-2 text-sm font-extrabold text-text">
          <LayoutTemplate className="h-4 w-4 text-primary" /> القوالب البصرية
        </h2>
        <p className="mb-4 text-xs text-muted">
          اختر قالبًا جاهزًا ثم خصّصه كما تشاء. المعاينة تتحدّث فورًا.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => {
            const active = state.design.templateId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() =>
                  set({
                    templateId: t.id,
                    fontId: t.fontId,
                    headerShape: t.headerShape,
                    cellFill: t.cellFill,
                    primary: undefined,
                    heading: undefined,
                  })
                }
                className={cx(
                  "rounded-2xl border p-3 text-right transition-all",
                  active
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-text">{t.name}</span>
                  {active && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="mb-2 flex gap-1.5">
                  {t.swatch.map((c) => (
                    <span
                      key={c}
                      className="h-6 flex-1 rounded-md"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-muted">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===== التخصيص ===== */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-extrabold text-text">تخصيص القالب</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ColorField
            label="اللون الرئيسي (رؤوس الجدول)"
            value={theme.headerBg}
            onChange={(v) => set({ primary: v })}
          />
          <ColorField
            label="لون العناوين"
            value={theme.heading}
            onChange={(v) => set({ heading: v })}
          />
          <Field label="الخط">
            <select
              value={state.design.fontId}
              onChange={(e) => set({ fontId: e.target.value })}
              className={selectCls}
            >
              {FONTS.map((f) => (
                <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>
                  {f.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="شكل رؤوس الجدول">
            <select
              value={state.design.headerShape}
              onChange={(e) =>
                set({ headerShape: e.target.value as Design["headerShape"] })
              }
              className={selectCls}
            >
              <option value="flat">مسطّح</option>
              <option value="rounded">حواف دائرية</option>
              <option value="pill">كبسولة</option>
            </select>
          </Field>
          <Field label="طريقة عرض الفترات">
            <select
              value={state.design.periodDisplay}
              onChange={(e) =>
                set({ periodDisplay: e.target.value as Design["periodDisplay"] })
              }
              className={selectCls}
            >
              <option value="range">البداية والنهاية</option>
              <option value="start">البداية فقط</option>
              <option value="range-duration">البداية والنهاية + المدّة</option>
              <option value="duration">المدّة فقط</option>
            </select>
          </Field>
          <Field label="طريقة تلوين الخانات">
            <select
              value={state.design.cellFill || theme.template.cellFill}
              onChange={(e) =>
                set({ cellFill: e.target.value as Design["cellFill"] })
              }
              className={selectCls}
            >
              <option value="subject">لون المادة الكامل</option>
              <option value="soft">تظليل ناعم</option>
              <option value="none">أبيض مع شريط ملوّن</option>
            </select>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Toggle
            active={state.design.showSubjectNames}
            onClick={() => set({ showSubjectNames: !state.design.showSubjectNames })}
            icon={<TypeIcon className="h-3.5 w-3.5" />}
            label="أسماء المواد"
          />
          <Toggle
            active={state.design.showBreaks}
            onClick={() => set({ showBreaks: !state.design.showBreaks })}
            icon={<AlignJustify className="h-3.5 w-3.5" />}
            label="إظهار الاستراحات"
          />
          <Toggle
            active={state.design.showTotals}
            onClick={() => set({ showTotals: !state.design.showTotals })}
            icon={<Ruler className="h-3.5 w-3.5" />}
            label="ملخّص المدّة"
          />
          <Toggle
            active={state.design.showSign}
            onClick={() => set({ showSign: !state.design.showSign })}
            icon={<Pencil className="h-3.5 w-3.5" />}
            label="خانة التوقيع"
          />
          <Toggle
            active={state.design.showFooter}
            onClick={() => set({ showFooter: !state.design.showFooter })}
            icon={<AlignJustify className="h-3.5 w-3.5" />}
            label="تذييل"
          />
        </div>
      </section>

      {/* ===== الاتجاه + المعاينة ===== */}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-text">
            <Eye className="h-4 w-4 text-primary" /> المعاينة المباشرة
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">اتجاه الورقة</span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ORIENTATION", orientation: "landscape" })}
                className={cx(
                  "px-3 py-1.5 text-xs font-bold",
                  state.orientation === "landscape"
                    ? "bg-primary text-white"
                    : "bg-surface text-text hover:bg-background"
                )}
              >
                أفقي (A4)
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ORIENTATION", orientation: "portrait" })}
                className={cx(
                  "px-3 py-1.5 text-xs font-bold",
                  state.orientation === "portrait"
                    ? "bg-primary text-white"
                    : "bg-surface text-text hover:bg-background"
                )}
              >
                عمودي (A4)
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl border border-border bg-background px-4 py-3 text-xs text-muted">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
          <span>
            عند الضغط على «تحميل PDF» اختر من نافذة الطباعة الوجهة «حفظ بصيغة PDF»، ثم
            تُنتَج وثيقة متجهة (نصّ حقيقي لا صورة) بالحجم A4 وبالعربية الصحيحة.
          </span>
        </div>

        <ProjectActions onEdit={onEdit} onNotify={onNotify} />

        <div className="mt-5 rounded-2xl bg-background p-3 sm:p-5">
          <PreviewStage state={state} />
        </div>
      </section>
    </div>
  );
}

const selectCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:bg-surface";
const inputCls = selectCls;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </label>
  );
}

function Toggle({
  active,
  onClick,
  label,
  icon,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
        active
          ? "border-secondary bg-secondary/10 text-secondary"
          : "border-border bg-surface text-muted hover:bg-background"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
