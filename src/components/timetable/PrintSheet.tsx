"use client";

/* ============================================================
   ورقة الطباعة — تُلائم الوثيقة داخل صفحة A4 واحدة
   ------------------------------------------------------------
   • مقاس الصفحة مقفول (A4 أفقي/عمودي) مع هامش أمان صغير حتى لا
     تتولّد صفحة ثانية بسبب التقريب.
   • تُقاس الوثيقة بارتفاعها الطبيعي (دون تصغير)، ثم تُصغَّر بنسبة
     كافية لتظهر الترويسة والجدول والتواقيع معًا في صفحة واحدة.
   • نفس النسبة مستعملة عند الطباعة فقط؛ معاينة الشاشة تبقى كما هي.
   ============================================================ */
import React, { useLayoutEffect, useRef, useState } from "react";
import TimetablePreview from "./TimetablePreview";
import type { TimetableState } from "./types";

const MM_TO_PX = 96 / 25.4;
/** هامش أمان لصفحة A4 نفسها (يمنع صفحة فارغة إضافية) */
const PAGE_SAFETY_MM = 1;
/** هامش أمان إضافي أسفل/أعلى المحتوى */
const CONTENT_SAFETY_MM = 2;

export default function PrintSheet({ state }: { state: TimetableState }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  const landscape = state.orientation !== "portrait";
  const pageW = landscape ? 297 : 210;
  const pageH = (landscape ? 210 : 297) - PAGE_SAFETY_MM;
  const docW = landscape ? 277 : 190;

  useLayoutEffect(() => {
    const el = docRef.current;
    if (!el) return;

    let frame = 0;

    const measure = () => {
      /* الارتفاع الطبيعي للوثيقة دون تأثير التصغير */
      const naturalMm = el.offsetHeight / MM_TO_PX;
      if (!Number.isFinite(naturalMm) || naturalMm <= 0) return;

      const target = pageH - CONTENT_SAFETY_MM;
      const next =
        Math.floor(Math.min(1, target / naturalMm) * 1000) / 1000;
      const nextOffset = Math.max(
        0,
        ((pageH - naturalMm * next) / 2) * MM_TO_PX
      );

      setScale((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
      setOffsetY((prev) =>
        Math.abs(prev - nextOffset) > 0.5 ? nextOffset : prev
      );
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(schedule).catch(() => undefined);
    }
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [pageH, state]);

  return (
    <div
      className="tt-page"
      dir="rtl"
      style={{
        width: `${pageW}mm`,
        height: `${pageH}mm`,
        overflow: "hidden",
        position: "relative",
        margin: "0 auto",
        background: "#FFFFFF",
      }}
    >
      <div
        ref={docRef}
        className="tt-sheet"
        style={{
          width: `${docW}mm`,
          marginTop: `${offsetY}px`,
          marginInline: "auto",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <TimetablePreview state={state} />
      </div>
    </div>
  );
}
