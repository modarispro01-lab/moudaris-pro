"use client";

/* ============================================================
   أزرار التصدير والحفظ والاستيراد
   ============================================================ */
import React, { useRef } from "react";
import {
  Printer,
  Save,
  Upload,
  Trash2,
  Pencil,
  FileDown,
} from "lucide-react";
import { parseImported, serializeState, useTimetable } from "./store";
import { useConfirm } from "./ConfirmDialog";

export default function ProjectActions({
  onEdit,
  onNotify,
}: {
  onEdit?: () => void;
  onNotify?: (msg: string, kind?: "ok" | "err") => void;
}) {
  const { state, dispatch, resetAll, clearStorage } = useTimetable();
  const confirm = useConfirm();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([serializeState(state)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (state.info.level || "مشروع").replace(/[\\/:*?"<>|]/g, "-");
    a.href = url;
    a.download = `استعمال-الزمن-${name}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    onNotify?.("تم حفظ نسخة من المشروع في ملف.");
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseImported(String(reader.result || ""));
      if (!parsed) {
        onNotify?.("الملف غير صالح أو غير متوافق.", "err");
        return;
      }
      dispatch({ type: "LOAD", state: parsed });
      onNotify?.("تم استيراد النسخة بنجاح.");
    };
    reader.readAsText(file, "utf-8");
  };

  const clearAllData = async () => {
    const ok = await confirm(
      "سيتم حذف المشروع المحفوظ في هذا المتصفح وإرجاع الأداة إلى حالتها الأولى.",
      { title: "حذف البيانات المحفوظة", confirmLabel: "حذف", danger: true }
    );
    if (ok) {
      clearStorage();
      resetAll();
      onNotify?.("تم حذف البيانات المحفوظة.");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <FileDown className="h-4 w-4" /> تحميل PDF
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-background"
      >
        <Printer className="h-4 w-4" /> طباعة
      </button>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-background"
        >
          <Pencil className="h-4 w-4" /> الرجوع إلى التعديل
        </button>
      )}
      <button
        type="button"
        onClick={exportJson}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-background"
      >
        <Save className="h-4 w-4" /> حفظ نسخة من المشروع
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition-colors hover:bg-background"
      >
        <Upload className="h-4 w-4" /> استيراد نسخة
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importJson(f);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={clearAllData}
        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
      >
        <Trash2 className="h-4 w-4" /> حذف البيانات
      </button>
    </div>
  );
}
