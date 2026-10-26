"use client";

/* ============================================================
   المكوّن الرئيسي — مولّد استعمال الزمن (التعليم الصريح)
   ============================================================ */
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Printer, Redo2, Sparkles, Undo2 } from "lucide-react";
import { TimetableProvider, useTimetable } from "./store";
import { ConfirmProvider } from "./ConfirmDialog";
import Stepper, { STEPS } from "./Stepper";
import TimetablePreview from "./TimetablePreview";
import InfoStep from "./steps/InfoStep";
import TimingStep from "./steps/TimingStep";
import ScheduleStep from "./steps/ScheduleStep";
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
  const { state, hydrated, undo, redo, canUndo, canRedo } = useTimetable();
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

  /* إخفاء عنوان الصفحة من رؤوس الطباعة التي يضيفها المتصفّح */
  useEffect(() => {
    let previous = document.title;
    const before = () => {
      previous = document.title;
      document.title = " ";
    };
    const after = () => {
      document.title = previous;
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      document.title = previous;
    };
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
    <div className="tt-editor">
      {/* ===== ترويسة الأداة ===== */}
      <header className="edt-hero">
        <h1>استعمال الزمن — التعليم الصريح</h1>
        <p className="edt-sub">
          اختر أيام عملك، وابرمج جدول كل يوم على حدة (توقيت + مواد)، ثم حمّل الوثيقة
          جاهزة للطباعة.
        </p>
        <span className="edt-badge-gold">
          <Sparkles className="me-1 inline h-3.5 w-3.5" />
          مجاني · يعمل دون تسجيل
        </span>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="edt-btn edt-btn-sm edt-btn-outline"
            style={{ borderColor: "#fff", color: "#fff", background: "transparent" }}
          >
            <Printer className="h-4 w-4" /> طباعة سريعة
          </button>
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="تراجع"
            className="edt-btn edt-btn-sm edt-btn-outline"
            style={{ borderColor: "rgba(255,255,255,.6)", color: "#fff" }}
          >
            <Undo2 className="h-4 w-4" /> تراجع
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="إعادة"
            className="edt-btn edt-btn-sm edt-btn-outline"
            style={{ borderColor: "rgba(255,255,255,.6)", color: "#fff" }}
          >
            <Redo2 className="h-4 w-4" /> إعادة
          </button>
        </div>
      </header>

      {/* ===== الخطوات (تبويبات لاصقة) ===== */}
      <Stepper current={step} onGo={go} />

      {/* ===== محتوى الخطوة ===== */}
      <div className="mx-auto mt-6 w-full max-w-6xl px-4 pb-10 sm:px-6">
        <div key={step} className={cx("edt-fade", !hydrated && "opacity-60")}>
          {step === 1 && <InfoStep />}
          {step === 2 && <TimingStep />}
          {step === 3 && <ScheduleStep />}
          {step === 4 && <DesignStep onEdit={() => go(3)} onNotify={notify} />}
        </div>

        {/* ===== التنقّل ===== */}
        {step < 4 && (
          <div className="edt-card flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 1}
              className="edt-btn edt-btn-outline"
            >
              <ArrowRight className="h-4 w-4" /> السابق
            </button>
            <span className="text-sm font-bold text-muted">
              الخطوة {step} من {STEPS.length}
            </span>
            <button
              type="button"
              onClick={() => go(step + 1)}
              disabled={!canNext}
              className="edt-btn edt-btn-primary"
            >
              التالي <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="edt-card flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-secondary">
              <Check className="h-4 w-4" /> كل شيء جاهز — عُد للتعديل متى شئت، فالمشروع
              يُحفظ تلقائيًا في متصفّحك.
            </span>
            <button
              type="button"
              onClick={() => go(3)}
              className="edt-btn edt-btn-sm edt-btn-outline"
            >
              تعديل التوزيع
            </button>
          </div>
        )}
      </div>

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
