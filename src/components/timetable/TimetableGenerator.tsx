"use client";

/* ============================================================
   المكوّن الرئيسي — مولّد استعمال الزمن (التعليم الصريح)
   ============================================================ */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Printer, Sparkles } from "lucide-react";
import { TimetableProvider, useTimetable } from "./store";
import { ConfirmProvider } from "./ConfirmDialog";
import Stepper, { STEPS } from "./Stepper";
import TimetablePreview from "./TimetablePreview";
import InfoStep from "./steps/InfoStep";
import TimingStep from "./steps/TimingStep";
import DistributionStep from "./steps/DistributionStep";
import DesignStep from "./steps/DesignStep";
import { cx } from "./utils";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Almarai:wght@400;700;800&family=El+Messiri:wght@400;500;600;700&family=Amiri:wght@400;700&family=Reem+Kufi:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap";

export default function TimetableGenerator() {
  return (
    <TimetableProvider>
      <ConfirmProvider>
        <Shell />
      </ConfirmProvider>
    </TimetableProvider>
  );
}

function Shell() {
  const { state, hydrated } = useTimetable();
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(
    null
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setMounted(true);
    const id = "tt-gfonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);

  const notify = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 3200);
  };

  const go = (n: number) => {
    const next = Math.min(STEPS.length, Math.max(1, n));
    setStep(next);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const canNext = step < STEPS.length && !(step === 2 && state.days.length === 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* ===== ترويسة الأداة ===== */}
      <header className="mb-6 rounded-3xl border border-border bg-gradient-to-l from-primary to-secondary p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
              <Sparkles className="h-3.5 w-3.5" /> مجاني · يعمل دون تسجيل
            </div>
            <h1 className="text-xl font-extrabold sm:text-2xl">
              مولّد استعمال الزمن الخاص بالتعليم الصريح
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-white/85">
              أنشئ استعمال الزمن الخاص بك بسهولة: اختر أيام العمل، واضبط توقيت الحصص،
              ووزّع المواد، ثم حمّل الوثيقة جاهزة للطباعة.
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-primary transition-opacity hover:opacity-90"
          >
            <Printer className="h-4 w-4" /> طباعة سريعة
          </button>
        </div>
      </header>

      {/* ===== الخطوات ===== */}
      <div className="mb-6 rounded-2xl border border-border bg-surface p-4">
        <Stepper current={step} onGo={go} />
      </div>

      {/* ===== محتوى الخطوة ===== */}
      <div className={cx("transition-opacity", !hydrated && "opacity-60")}>
        {step === 1 && <InfoStep />}
        {step === 2 && <TimingStep />}
        {step === 3 && <DistributionStep />}
        {step === 4 && <DesignStep onEdit={() => go(3)} onNotify={notify} />}
      </div>

      {/* ===== التنقّل ===== */}
      {step < 4 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3">
          <button
            type="button"
            onClick={() => go(step - 1)}
            disabled={step === 1}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-background disabled:opacity-40"
          >
            <ArrowRight className="h-4 w-4" /> السابق
          </button>
          <span className="text-xs font-bold text-muted">
            الخطوة {step} من {STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => go(step + 1)}
            disabled={!canNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            التالي <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-secondary/30 bg-secondary/5 p-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-secondary">
            <Check className="h-4 w-4" /> كل شيء جاهز — عُد للتعديل متى شئت، فالمشروع
            يُحفظ تلقائيًا في متصفّحك.
          </span>
          <button
            type="button"
            onClick={() => go(3)}
            className="shrink-0 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-bold text-text hover:bg-background"
          >
            تعديل التوزيع
          </button>
        </div>
      )}

      {/* ===== إشعار ===== */}
      {toast && (
        <div
          className={cx(
            "fixed bottom-5 start-1/2 z-[110] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-xl",
            toast.kind === "err" ? "bg-red-600" : "bg-secondary"
          )}
          dir="rtl"
        >
          {toast.msg}
        </div>
      )}

      {/* ===== نسخة الطباعة ===== */}
      {mounted &&
        createPortal(
          <div className="tt-print-portal">
            <style>{`@page { size: A4 ${state.orientation}; margin: 10mm; }`}</style>
            <TimetablePreview state={state} />
          </div>,
          document.body
        )}
    </div>
  );
}
