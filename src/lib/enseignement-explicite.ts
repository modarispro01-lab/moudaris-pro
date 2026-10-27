import fs from "node:fs";
import path from "node:path";
import type {
  AppConfig,
  Catalog,
  LevelData,
  SubjectGroup,
  TemplateConfig,
} from "@/components/daily-memo/types";

function readJson<T>(file: string): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch (error) {
    throw new Error(`تعذّر قراءة ملف البيانات: ${file}\n${String(error)}`);
  }
}

function listJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.toLowerCase().endsWith(".json"))
    .sort((a, b) => a.localeCompare(b, "ar"));
}

/**
 * يقرأ القالب وملفات المستويات تلقائيًا من مجلدات المواد.
 * إضافة ملف niveau-3.json داخل math/ تكفي لعرض المستوى الثالث.
 */
export function loadCatalog(): Catalog {
  const root = process.cwd();
  const configPath = path.join(root, "data", "enseignement-explicite", "config.json");
  const config = readJson<AppConfig>(configPath);
  const dataRoot = path.join(root, config.dataRoot || "data/enseignement-explicite");
  const templatePath = path.join(
    root,
    config.templatePath || "data/enseignement-explicite/template/math-template.json"
  );

  const template = readJson<TemplateConfig>(templatePath);
  const subjects: SubjectGroup[] = [];

  for (const entry of fs.readdirSync(dataRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "template") continue;
    const subjectDir = path.join(dataRoot, entry.name);
    const levels: LevelData[] = [];

    for (const file of listJsonFiles(subjectDir)) {
      const data = readJson<LevelData>(path.join(subjectDir, file));
      if (!data || !Array.isArray(data.stages) || !data.stages.length) {
        throw new Error(`ملف مستوى غير صالح (لا يحتوي على مراحل): ${file}`);
      }
      levels.push({ ...data, source: data.source || file });
    }

    if (levels.length) {
      levels.sort((a, b) => a.level - b.level);
      subjects.push({
        code: entry.name,
        name_ar: levels[0].subject_ar || levels[0].subject || template.subject_ar,
        levels,
      });
    }
  }

  subjects.sort((a, b) => {
    if (a.code === config.defaultSubjectCode) return -1;
    if (b.code === config.defaultSubjectCode) return 1;
    return a.code.localeCompare(b.code);
  });

  return { template, config, subjects };
}
