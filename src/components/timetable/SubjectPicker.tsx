"use client";

/* ============================================================
   اختيار المادة لخلية معيّنة
   ============================================================ */
import React from "react";
import FloatingCard, { type Anchor } from "./FloatingCard";
import type { Subject } from "./types";
import { cx } from "./utils";

interface Props {
  anchor: Anchor;
  subjects: Subject[];
  value: string | null;
  onPick: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function SubjectPicker({
  anchor,
  subjects,
  value,
  onPick,
  onClear,
  onClose,
}: Props) {
  return (
    <FloatingCard anchor={anchor} onClose={onClose} width={260}>
      <div className="p-2">
        <div className="px-2 pb-2 text-xs font-bold text-muted">اختر المادة</div>
        <div className="grid grid-cols-2 gap-1.5">
          {subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onPick(s.id);
                onClose();
              }}
              className={cx(
                "flex items-center gap-2 rounded-lg border px-2 py-2 text-right text-[13px] font-semibold transition-colors hover:bg-background",
                value === s.id ? "border-primary bg-background" : "border-border"
              )}
            >
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            onClose();
          }}
          className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          تفريغ الخانة
        </button>
      </div>
    </FloatingCard>
  );
}
