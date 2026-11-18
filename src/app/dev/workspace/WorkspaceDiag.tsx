"use client";

/* ============================================================
   صفحة تشخيص مساحة عمل الأستاذ (النسخة ١) — منطق العميل
   - للفحص اليدوي فقط: بلا أي رابط تنقّل إليها.
   - القياسات المتعلقة بـlocalStorage تُحسب بعد التركيب فقط
     (تجنّبًا لاختلاف التميؤ بين الخادم والعميل).
   ============================================================ */

import { useEffect, useState } from "react";
import { clearWorkspaceKey, useWorkspace } from "@/components/workspace/useWorkspace";
import { WORKSPACE_KEY } from "@/components/workspace/types";

export default function WorkspaceDiag() {
  const { workspace, update, reload, migration } = useWorkspace();

  /* قراءة حالة المفتاح المكتوب بعد التركيب فقط (SSR لا يملك localStorage) */
  const [storageInfo, setStorageInfo] = useState<{ written: boolean; bytes: number }>({
    written: false,
    bytes: 0,
  });
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WORKSPACE_KEY);
      setStorageInfo({ written: raw !== null, bytes: raw ? raw.length : 0 });
    } catch {
      setStorageInfo({ written: false, bytes: 0 });
    }
  }, [workspace]);

  const clearAndRemigrate = () => {
    /* يمسح مفتاح مساحة العمل فقط — لا يلمس أي مفتاح آخر (قراءة/ترحيل من جديد) */
    clearWorkspaceKey();
    reload();
  };

  return (
    <main style={{ direction: "rtl", padding: "24px", fontFamily: "inherit" }}>
      <h1>تشخيص مساحة عمل الأستاذ — النسخة ١</h1>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>حالة الترحيل</h2>
        <p>
          الحالة: <strong style={{ color: migration.ok ? "green" : "red" }}>
            {migration.ok ? "نجح" : "فشل"}
          </strong>
        </p>
        {migration.error ? (
          <p style={{ color: "red" }}>رسالة الخطأ: {migration.error}</p>
        ) : null}
        <p>المفاتيح القديمة المكتشفة: {migration.legacyKeysFound.length > 0
          ? migration.legacyKeysFound.join(" · ")
          : "لا شيء"}</p>
      </section>

      <section style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16, marginBlock: 12 }}>
        <h2>أعداد مُرحَّلة</h2>
        <ul>
          <li>أيام العمل في استعمال الزمن: {workspace.timetable.days.length}</li>
          <li>عدد المستويات: {workspace.timetable.info.levels.length}</li>
          <li>عدد المواد: {workspace.timetable.subjects.length}</li>
          <li>الأسابيع المحفوظة في مساحة العمل: {workspace.weeks.length}</li>
          <li>السنة الدراسية في الرزمة: {workspace.calendar.schoolYear || "—"}</li>
          <li>مفتاح مساحة العمل مكتوب: {storageInfo.written ? "نعم" : "لا"}</li>
          <li>حجمه بالبايت: {JSON.stringify(workspace).length}</li>
        </ul>
      </section>

      <button
        type="button"
        onClick={clearAndRemigrate}
        style={{ padding: "10px 18px", cursor: "pointer" }}
      >
        امسح مساحة العمل وأعد الترحيل
      </button>
    </main>
  );
}
