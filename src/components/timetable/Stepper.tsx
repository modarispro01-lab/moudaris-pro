"use client";

/* ============================================================
   مؤشّر الخطوات — شكل تبويبات تنقّل (nav-tabs)
   ============================================================ */
import React from "react";
import { Check, ClipboardList, LayoutTemplate, PenLine, Users } from "lucide-react";
import { cx } from "./utils";

export interface StepDef {
  id: number;
  title: string;
  icon: React.ReactNode;
}

export const STEPS: StepDef[] = [
  { id: 1, title: "المعلومات", icon: <Users className="h-4 w-4" /> },
  { id: 2, title: "أيام العمل", icon: <ClipboardList className="h-4 w-4" /> },
  { id: 3, title: "برمجة الأيام", icon: <PenLine className="h-4 w-4" /> },
  { id: 4, title: "التصميم والتصدير", icon: <LayoutTemplate className="h-4 w-4" /> },
];

export default function Stepper({
  current,
  onGo,
}: {
  current: number;
  onGo: (n: number) => void;
}) {
  return (
    <nav className="edt-nav">
      {STEPS.map((s) => {
        const active = current === s.id;
        const done = current > s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onGo(s.id)}
            className={cx(
              "edt-tab",
              active && "is-active",
              !active && done && "is-done"
            )}
          >
            {done && !active ? (
              <Check className="h-4 w-4" />
            ) : (
              <span className="tab-icon">{s.icon}</span>
            )}
            {s.title}
          </button>
        );
      })}
    </nav>
  );
}
