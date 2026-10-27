"use client";

import { useEffect, useRef, useState } from "react";
import MemoSheet from "./MemoSheet";
import type { MemoState, TemplateConfig } from "./types";

const MM_TO_PX = 96 / 25.4;
const SHEET_WIDTH = 210 * MM_TO_PX;

export default function SheetPreview({
  memo,
  template,
}: {
  memo: MemoState;
  template: TemplateConfig;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.62);
  const [boxHeight, setBoxHeight] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const sheet = sheetRef.current;
    if (!stage || !sheet) return;

    const recompute = () => {
      const width = stage.clientWidth;
      const nextScale = Math.min(1, Math.max(0.2, width / SHEET_WIDTH));
      setScale(nextScale);
      setBoxHeight(sheet.offsetHeight * nextScale);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(stage);
    observer.observe(sheet);
    window.addEventListener("resize", recompute);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [memo]);

  return (
    <div className="memo-preview-stage" ref={stageRef} style={{ height: boxHeight || undefined }}>
      <div
        className="memo-preview-sheet"
        ref={sheetRef}
        style={{ transform: `scale(${scale})` }}
      >
        <MemoSheet memo={memo} template={template} />
      </div>
    </div>
  );
}
