/* ============================================================
   حلّ القالب البصري — تحويل الإعدادات إلى قيم فعلية
   ============================================================ */
import { FONT_BY_ID, TEMPLATE_BY_ID } from "./defaults";
import type { Design, Subject, Template } from "./types";

export interface Theme {
  template: Template;
  headerBg: string;
  headerText: string;
  heading: string;
  pageBg: string;
  cellBorder: string;
  cellText: string;
  zebraBg: string;
  fontFamily: string;
  radius: number;
}

export function resolveTheme(design: Design): Theme {
  const template = TEMPLATE_BY_ID[design.templateId] || TEMPLATE_BY_ID.classic;
  const font = FONT_BY_ID[design.fontId] || FONT_BY_ID[template.fontId] || FONT_BY_ID.tajawal;
  return {
    template,
    headerBg: design.primary || template.headerBg,
    headerText: template.headerText,
    heading: design.heading || template.headingColor,
    pageBg: template.pageBg,
    cellBorder: template.cellBorder,
    cellText: template.cellText,
    zebraBg: template.zebraBg,
    fontFamily: font.css,
    radius: design.headerShape === "pill" ? 999 : template.radius,
  };
}

export function subjectColor(subjects: Subject[], id: string | null | undefined): string {
  if (!id) return "#E2E8F0";
  return subjects.find((s) => s.id === id)?.color || "#94A3B8";
}

export function subjectName(subjects: Subject[], id: string | null | undefined): string {
  if (!id) return "";
  return subjects.find((s) => s.id === id)?.name || "";
}
