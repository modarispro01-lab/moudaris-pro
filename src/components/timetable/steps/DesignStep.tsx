"use client";

/* ============================================================
   الخطوة 4 — التصميم والمعاينة والتصدير
   ============================================================ */
import React from "react";
import {
  AlignJustify,
  Check,
  Clock,
  Eye,
  Image as ImageIcon,
  LayoutTemplate,
  Palette,
  Pencil,
  RotateCcw,
  Ruler,
  Smartphone,
  Trash2,
  Type as TypeIcon,
  Upload,
} from "lucide-react";
import { FONTS, TEMPLATES } from "../defaults";
import { useTimetable } from "../store";
import { resolveTheme } from "../theme";
import PreviewStage from "../PreviewStage";
import ProjectActions from "../ProjectActions";
import InstitutionLogo from "../InstitutionLogo";
import type { Design } from "../types";
import { cx } from "../utils";

/** تصغير الصورة المرفوعة قبل حفظها في المتصفح */
function uploadLogo(
  file: File,
  set: (patch: Partial<Design>) => void,
  onNotify?: (msg: string, kind?: "ok" | "err") => void
) {
  if (!file.type.startsWith("image/")) {
    onNotify?.("الرجاء اختيار ملف صورة.", "err");
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const MAX = 512;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        set({ logoDataUrl: canvas.toDataURL("image/png") });
        onNotify?.("تم تحميل الشعار.");
      } catch {
        onNotify?.("تعذّر معالجة الصورة.", "err");
      }
    };
    img.onerror = () => onNotify?.("تعذّر قراءة الصورة.", "err");
    img.src = String(reader.result || "");
  };
  reader.readAsDataURL(file);
}

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
      <section className="edt-card">
        <h2 className="edt-card-title mb-2">
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
                className={cx("edt-tpl", active && "is-on")}
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
      <section className="edt-card">
        <h2 className="edt-card-title">تخصيص القالب</h2>
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
            active={state.design.showDuration !== false}
            onClick={() => set({ showDuration: state.design.showDuration === false })}
            icon={<Clock className="h-3.5 w-3.5" />}
            label="مدّة الحصة"
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

      {/* ===== ألوان المواد ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title mb-2">
          <Palette className="h-4 w-4 text-primary" /> ألوان المواد
        </h2>
        <p className="mb-4 text-xs text-muted">
          لكل مادة لون خاص بها يظهر في الجدول والملخّص. اضغط على اللون لتغييره،
          أو اكتب رمز اللون مباشرة (مثال: <span dir="ltr">#047857</span>).
        </p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {state.subjects.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2"
            >
              <input
                type="color"
                value={s.color}
                onChange={(e) =>
                  dispatch({
                    type: "SET_SUBJECT",
                    id: s.id,
                    patch: { color: e.target.value },
                  })
                }
                className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-border bg-surface p-1"
                aria-label={`لون مادة ${s.name}`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-text">{s.name}</div>
                <input
                  value={s.color}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SUBJECT",
                      id: s.id,
                      patch: { color: e.target.value },
                    })
                  }
                  dir="ltr"
                  className={inputCls + " mt-1 py-1 text-[11px] font-mono uppercase"}
                  aria-label={`رمز لون مادة ${s.name}`}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "RESET_SUBJECT_COLORS" })}
          className="edt-btn edt-btn-sm edt-btn-outline mt-4"
        >
          <RotateCcw className="h-3.5 w-3.5" /> استعادة الألوان الافتراضية
        </button>
      </section>

      {/* ===== الشعار والتوقيعات ===== */}
      <section className="edt-card">
        <h2 className="edt-card-title mb-2">
          <ImageIcon className="h-4 w-4 text-primary" /> الشعار والتوقيعات
        </h2>
        <p className="mb-4 text-xs text-muted">
          يظهر الشعار أعلى وسط الورقة، والتوقيعات أسفلها (الأستاذ، المفتش، المدير).
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* الشعار */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted">شعار المؤسسة</span>
              <Toggle
                active={state.design.showLogo !== false}
                onClick={() => set({ showLogo: state.design.showLogo === false })}
                label="إظهار الشعار"
              />
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                <InstitutionLogo
                  size={64}
                  src={state.design.logoDataUrl}
                  color="#123B5D"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90">
                  <Upload className="h-3.5 w-3.5" /> ارفع صورة الشعار
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadLogo(f, set, onNotify);
                      e.target.value = "";
                    }}
                  />
                </label>
                {state.design.logoDataUrl && (
                  <button
                    type="button"
                    onClick={() => set({ logoDataUrl: undefined })}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> إزالة الصورة
                  </button>
                )}
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              إن لم ترفع صورة، يُطبع شعار زخرفي أصلي. يمكنك رفع شعار مؤسستك أو أي
              شعار تملك حق استعماله.
            </p>
          </div>

          {/* صيغة التوقيعات */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted">صيغة التوقيعات</span>
              <Toggle
                active={state.design.feminine !== false}
                onClick={() => set({ feminine: state.design.feminine === false })}
                label={state.design.feminine !== false ? "مؤنّث «(ة)»" : "مذكر «بدون (ة)»"}
              />
            </div>

            <div className="space-y-2">
              {(
                [
                  ["teacher", "توقيع الأستاذ"],
                  ["inspector", "توقيع المفتش"],
                  ["manager", "طابع وتوقيع المدير"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-[11px] font-bold text-muted">
                    {label}
                  </span>
                  <input
                    className={inputCls + " py-2 text-xs"}
                    value={state.design.signLabels?.[k] ?? ""}
                    placeholder={
                      state.design.feminine !== false
                        ? `${label}(ة)`
                        : `${label}`
                    }
                    onChange={(e) =>
                      set({
                        signLabels: {
                          ...(state.design.signLabels ?? {}),
                          [k]: e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              اترك الحقل فارغًا لاستعمال الصيغة الافتراضية حسب الجنس، أو اكتب عبارة
              خاصة (مثل «المفتش التربوي»).
            </p>
          </div>
        </div>
      </section>

      {/* ===== الاتجاه + المعاينة ===== */}
      <section className="edt-card">
        <div className="edt-card-title" style={{ justifyContent: "space-between" }}>
          <h2 className="flex items-center gap-2.5">
            <Eye className="h-4 w-4" /> المعاينة المباشرة
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted">اتجاه الورقة</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ORIENTATION", orientation: "landscape" })}
                className={cx(
                  "edt-chip !py-2 !text-xs",
                  state.orientation === "landscape" && "is-on"
                )}
              >
                أفقي (A4)
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ORIENTATION", orientation: "portrait" })}
                className={cx(
                  "edt-chip !py-2 !text-xs",
                  state.orientation === "portrait" && "is-on"
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

const selectCls = "edt-select";
const inputCls = "edt-input";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="edt-label">{label}</span>
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
      <span className="edt-label">{label}</span>
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
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("edt-chip !py-2 !text-xs", active && "is-on")}
    >
      {icon}
      {label}
    </button>
  );
}
