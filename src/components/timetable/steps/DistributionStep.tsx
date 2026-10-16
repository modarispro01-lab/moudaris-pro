"use client";

/* ============================================================
   الخطوة 3 — توزيع المواد على الأيام
   ============================================================ */
import React, { useState } from "react";
import { Palette, Pencil } from "lucide-react";
import { useTimetable } from "../store";
import TimetableGrid from "../TimetableGrid";

export default function DistributionStep() {
  const { state, dispatch } = useTimetable();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-text">
              شبكة توزيع المواد
            </h2>
            <p className="mt-1 text-xs text-muted">
              انقر على أي خانة لاختيار المادة. استعمل زر ⋯ لنسخ الحصة أو تعديل توقيتها
              بشكل خاص.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-text hover:bg-background"
          >
            <Palette className="h-3.5 w-3.5" /> المواد وألوانها
          </button>
        </div>

        {open && (
          <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {state.subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-background p-2"
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
                  className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-border bg-surface p-0.5"
                  title="لون المادة"
                />
                <Pencil className="h-3.5 w-3.5 shrink-0 text-border" />
                <input
                  value={s.name}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SUBJECT",
                      id: s.id,
                      patch: { name: e.target.value },
                    })
                  }
                  className="w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold outline-none hover:border-border focus:border-primary focus:bg-surface"
                />
              </div>
            ))}
          </div>
        )}

        <TimetableGrid />
      </section>
    </div>
  );
}
