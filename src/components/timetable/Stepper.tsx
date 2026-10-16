"use client";

/* ============================================================
   مؤشّر الخطوات
   ============================================================ */
import React from "react";
import { Check } from "lucide-react";
import { cx } from "./utils";

export interface StepDef {
  id: number;
  title: string;
}

export const STEPS: StepDef[] = [
  { id: 1, title: "المعلومات" },
  { id: 2, title: "الأيام والتوقيت" },
  { id: 3, title: "توزيع المواد" },
  { id: 4, title: "التصميم والتصدير" },
];

export default function Stepper({
  current,
  onGo,
}: {
  current: number;
  onGo: (n: number) => void;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => onGo(s.id)}
              className="flex items-center gap-2 text-right"
            >
              <span
                className={cx(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors",
                  done && "bg-secondary text-white",
                  active && "bg-primary text-white ring-4 ring-primary/15",
                  !done && !active && "bg-background text-muted ring-1 ring-border"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span
                className={cx(
                  "hidden text-sm font-bold sm:block",
                  active ? "text-text" : "text-muted"
                )}
              >
                {s.title}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <span
                className={cx(
                  "mx-1 hidden h-px flex-1 sm:block",
                  done ? "bg-secondary" : "bg-border"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
