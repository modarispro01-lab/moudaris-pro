"use client";

/* ============================================================
   منصّة المعاينة — عرض الوثيقة بمقاسها الحقيقي مع تصغير بصري
   ============================================================ */
import React, { useEffect, useRef, useState } from "react";
import TimetablePreview from "./TimetablePreview";
import type { TimetableState } from "./types";

const MM_TO_PX = 96 / 25.4;

export default function PreviewStage({ state }: { state: TimetableState }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [boxH, setBoxH] = useState(0);

  const mm = state.orientation === "landscape" ? 277 : 190;
  const docW = mm * MM_TO_PX;

  useEffect(() => {
    const recompute = () => {
      const w = wrapRef.current?.clientWidth || docW;
      const s = Math.min(1, w / docW);
      setScale(s);
      const dh = docRef.current?.offsetHeight || 0;
      setBoxH(dh * s);
    };
    const raf = requestAnimationFrame(recompute);
    const ro = new ResizeObserver(recompute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (docRef.current) ro.observe(docRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [docW, state]);

  return (
    <div ref={wrapRef} className="w-full">
      <div className="relative w-full" style={{ height: boxH || undefined }}>
        <div
          ref={docRef}
          className="absolute start-0 top-0 overflow-hidden rounded-md shadow-lg ring-1 ring-border"
          style={{
            width: `${mm}mm`,
            transform: `scale(${scale})`,
            transformOrigin: "top right",
          }}
        >
          <TimetablePreview state={state} />
        </div>
      </div>
    </div>
  );
}
