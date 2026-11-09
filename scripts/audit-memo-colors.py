# -*- coding: utf-8 -*-
"""
audit-memo-colors.py — أداة جرد وترحيل ألوان memo.css إلى متغيرات الثيم.

الاستعمال:
  python scripts/audit-memo-colors.py report   → جدول (سطر، خاصية، قديم، متغير، سبب) + غير المخطوط
  python scripts/audit-memo-colors.py apply    → ينفّذ الاستبدال في memo.css
  python scripts/audit-memo-colors.py leftovers→ ما تبقى من hex/rgb بعد التطبيق

القواعد:
  - قيم بالخريطة أدناه → متغير --memo-* (الفاتح يحفظ القيمة الأصلية حرفيًا).
  - #fff/#ffffff: خلفية → --memo-card، نص → --memo-on-brand (يبقى أبيض ثابتًا)،
    حد → --memo-line.
  - استثناءات موثقة تبقى حرفية: تظليلات rgba على أسطح كحلية/ذهبية/تركوازية
    تبقى كما هي بالوضعين، ووقفات تدرج الترويسة، وشفافيات النص فوق الكحلي.
  - أسطر تعريف المتغيرات (--x: …) تُتخطى.
"""
import io
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
PATH = "src/components/daily-memo/memo.css"

# قيمة → (متغير، فئة السبب)
MAP = {
    # تركوازي (الأساسي)
    "#0f766e": ("--memo-teal", "أساسي: خلفيات/حدود"),
    "#0f5a54": ("--memo-teal-text", "نص تركوازي"),
    "#3f6f67": ("--memo-teal-text", "نص تركوازي"),
    "#b9ded9": ("--memo-teal-border", "حد تركوازي فاتح"),
    "#bfe3dd": ("--memo-teal-border", "حد تركوازي فاتح"),
    "#9fc9c1": ("--memo-teal-border", "حد تركوازي فاتح"),
    "#cfe8e3": ("--memo-teal-border", "حد تركوازي فاتح"),
    "#c8e2dd": ("--memo-teal-border", "حد تركوازي فاتح"),
    "#f5fbfa": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#f0fbf8": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#eaf8f4": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#f2fbf9": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#f8fdfc": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#f0faf8": ("--memo-teal-soft", "سطح تركوازي فاتح"),
    "#ecfdf5": ("--memo-teal-soft", "سطح نجاح"),
    "#f0fdf9": ("--memo-teal-soft", "سطح نجاح"),
    # كحلي
    "#123b5d": ("--memo-navy", "كحلي العلامة"),
    "#1b567c": ("--memo-navy-light", "كحلي فاتح"),
    "#0a2942": ("--memo-navy-dark", "كحلي غامق"),
    # ذهبي
    "#d9a441": ("--memo-gold", "ذهبي أساسي"),
    "#c99736": ("--memo-gold", "ذهبي أساسي"),
    "#f4d38b": ("--memo-gold-light", "ذهبي فاتح"),
    "#f0c56b": ("--memo-gold-light", "ذهبي فاتح"),
    "#d8b46b": ("--memo-gold", "ذهبي أساسي"),
    "#e3c98f": ("--memo-gold", "ذهبي أساسي"),
    "#d9b66e": ("--memo-gold", "ذهبي أساسي"),
    "#c89a3f": ("--memo-gold", "ذهبي أساسي"),
    "#b8892d": ("--memo-gold", "ذهبي أساسي"),
    "#7b5a1c": ("--memo-gold-text", "نص ذهبي"),
    "#8a6a29": ("--memo-gold-text", "نص ذهبي"),
    "#7b5714": ("--memo-gold-text", "نص ذهبي"),
    "#6d4d0f": ("--memo-gold-text", "نص ذهبي"),
    "#725010": ("--memo-gold-text", "نص ذهبي"),
    "#80652c": ("--memo-gold-text", "نص ذهبي"),
    "#5b420f": ("--memo-gold-text", "نص ذهبي"),
    "#7a622f": ("--memo-gold-text", "نص ذهبي"),
    "#8b6417": ("--memo-gold-text", "نص ذهبي"),
    "#9a6b13": ("--memo-gold-text", "نص ذهبي"),
    "#a6781e": ("--memo-gold-text", "نص ذهبي"),
    "#7b5c18": ("--memo-gold-text", "نص ذهبي"),
    "#92400e": ("--memo-gold-text", "نص ذهبي (تنبيه)"),
    "#fbf3e3": ("--memo-gold-soft", "سطح ذهبي"),
    "#fdf8ee": ("--memo-gold-soft", "سطح ذهبي"),
    "#fbf1dd": ("--memo-gold-soft", "سطح ذهبي"),
    "#fdf6e7": ("--memo-gold-soft", "سطح ذهبي"),
    "#f8ead1": ("--memo-gold-soft", "سطح ذهبي"),
    "#fbf6eb": ("--memo-gold-soft", "سطح ذهبي"),
    "#fdfaf3": ("--memo-gold-soft", "سطح ذهبي"),
    "#fffbeb": ("--memo-gold-soft", "سطح تنبيه"),
    "#fffdf8": ("--memo-gold-softer", "سطح ذهبي أفتح"),
    "#efdcb6": ("--memo-gold-border", "حد ذهبي"),
    "#e6cf9f": ("--memo-gold-border", "حد ذهبي"),
    "#e3cfa5": ("--memo-gold-border", "حد ذهبي"),
    "#efdfbf": ("--memo-gold-border", "حد ذهبي"),
    "#e8d7b4": ("--memo-gold-border", "حد ذهبي"),
    "#f0dfbc": ("--memo-gold-border", "حد ذهبي"),
    "#e7cf9e": ("--memo-gold-border", "حد ذهبي"),
    # نصوص وحبر
    "#142b3f": ("--memo-ink", "حبر أساسي"),
    "#173044": ("--memo-ink", "حبر أساسي"),
    "#172033": ("--memo-ink", "حبر أساسي"),
    "#24303b": ("--memo-on-gold", "نص داكن فوق ذهبي (ثابت)"),
    "#23384a": ("--memo-on-gold", "نص داكن فوق ذهبي (ثابت)"),
    "#475569": ("--memo-text-2", "نص ثانوي"),
    "#334155": ("--memo-text-2", "نص ثانوي"),
    "#3d5a70": ("--memo-text-2", "نص ثانوي"),
    "#40566a": ("--memo-text-2", "نص ثانوي"),
    "#3c5367": ("--memo-text-2", "نص ثانوي"),
    "#3f5c72": ("--memo-text-2", "نص ثانوي"),
    "#4d6375": ("--memo-text-2", "نص ثانوي"),
    "#526678": ("--memo-text-2", "نص ثانوي"),
    "#586e80": ("--memo-text-2", "نص ثانوي"),
    "#5b7183": ("--memo-text-2", "نص ثانوي"),
    "#607585": ("--memo-text-2", "نص ثانوي"),
    "#6d8293": ("--memo-text-2", "نص ثانوي"),
    "#6d8191": ("--memo-text-2", "نص ثانوي"),
    "#6b8091": ("--memo-text-2", "نص ثانوي"),
    "#6e8292": ("--memo-text-2", "نص ثانوي"),
    "#5e7282": ("--memo-text-2", "نص ثانوي"),
    "#3f5669": ("--memo-text-2", "نص ثانوي"),
    "#40576a": ("--memo-text-2", "نص ثانوي"),
    "#5c7182": ("--memo-text-2", "نص ثانوي"),
    "#9aabb9": ("--memo-muted-text", "نص خافت (قائم مسبقًا)"),
    "#a3b2bf": ("--memo-muted-text", "نص خافت"),
    "#8a9aa8": ("--memo-muted-text", "نص خافت"),
    "#8a99a6": ("--memo-muted-text", "نص خافت"),
    "#8a9aaa": ("--memo-muted-text", "نص خافت"),
    "#8b9baa": ("--memo-muted-text", "نص خافت"),
    "#8fa2b2": ("--memo-muted-text", "نص خافت"),
    "#94a5b4": ("--memo-muted-text", "نص خافت"),
    "#a3b1bd": ("--memo-muted-text", "نص خافت"),
    "#a7b5c2": ("--memo-muted-text", "نص خافت"),
    "#a7b5c1": ("--memo-muted-text", "نص خافت"),
    "#a0afbb": ("--memo-muted-text", "نص خافت"),
    "#8194a4": ("--memo-muted-text", "نص خافت"),
    "#8a9baa": ("--memo-muted-text", "نص خافت"),
    "#7f93a3": ("--memo-muted-text", "نص خافت"),
    "#7f93a4": ("--memo-muted-text", "نص خافت"),
    "#788b9b": ("--memo-muted-text", "نص خافت"),
    "#748797": ("--memo-muted-text", "نص خافت"),
    "#94a3b8": ("--memo-muted-text", "نص خافت"),
    "#64748b": ("--memo-muted", "نص ثانوي خافت"),
    # أسطح وحدود رمادية مزرقة
    "#f7fbfd": ("--memo-soft", "سطح ناعم"),
    "#f2f7fa": ("--memo-soft", "سطح ناعم"),
    "#f8fafc": ("--memo-soft", "سطح ناعم"),
    "#f4f8fb": ("--memo-soft", "سطح ناعم"),
    "#eef5fa": ("--memo-soft", "سطح ناعم"),
    "#eef6fb": ("--memo-soft", "سطح ناعم"),
    "#f6fafd": ("--memo-soft", "سطح ناعم"),
    "#f2f8fc": ("--memo-soft", "سطح ناعم"),
    "#edf4f9": ("--memo-soft", "سطح ناعم"),
    "#f2f7fb": ("--memo-soft", "سطح ناعم"),
    "#f3f7fa": ("--memo-soft", "سطح ناعم"),
    "#f4f6f8": ("--memo-soft", "سطح ناعم"),
    "#f2f6f9": ("--memo-soft", "سطح ناعم"),
    "#f4f7f9": ("--memo-soft", "سطح ناعم"),
    "#f5f9fc": ("--memo-soft", "سطح ناعم"),
    "#f1f8fc": ("--memo-soft", "سطح ناعم"),
    "#eef3f7": ("--memo-soft", "سطح ناعم"),
    "#f5faff": ("--memo-soft", "سطح ناعم"),
    "#fbfdfe": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#f8fbfd": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#fbfdff": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#f9fbfc": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#fafcfe": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#eaf1f6": ("--memo-thead", "رأس جدول"),
    "#eaf0f5": ("--memo-thead", "رأس جدول"),
    "#e8eff5": ("--memo-thead", "رأس جدول"),
    "#eef4f8": ("--memo-thead", "رأس جدول"),
    "#bfd3e2": ("--memo-line-strong", "حد بارز"),
    "#b9d2e4": ("--memo-line-strong", "حد بارز"),
    "#c3d4e1": ("--memo-line-strong", "حد بارز"),
    "#c6d5e2": ("--memo-line-strong", "حد بارز"),
    "#c8d8e5": ("--memo-line-strong", "حد بارز"),
    "#c9d7e2": ("--memo-line-strong", "حد بارز"),
    "#c9d7e3": ("--memo-line-strong", "حد بارز/تمرير"),
    "#d6e3ee": ("--memo-line", "حد عادي"),
    "#dbe6ef": ("--memo-line", "حد عادي"),
    "#dce5ee": ("--memo-line", "حد عادي"),
    "#dce6ef": ("--memo-line", "حد عادي"),
    "#dde7ef": ("--memo-line", "حد عادي"),
    "#d9e8f1": ("--memo-line", "حد عادي"),
    "#d7e4ee": ("--memo-line", "حد عادي"),
    "#cfdde8": ("--memo-line", "حد عادي"),
    "#d9e4ed": ("--memo-line", "حد عادي"),
    "#c6d8e6": ("--memo-line", "حد عادي"),
    "#c4d8e6": ("--memo-line", "حد عادي"),
    "#c7dbe9": ("--memo-line", "حد عادي"),
    "#cfdce7": ("--memo-line", "حد عادي"),
    "#d7e2eb": ("--memo-line", "حد عادي"),
    "#dbe7f0": ("--memo-line", "حد عادي"),
    "#dce8f1": ("--memo-line", "حد عادي"),
    "#e0eaf2": ("--memo-line", "حد عادي"),
    "#e3ebf2": ("--memo-line", "حد عادي"),
    "#e6eef5": ("--memo-line", "حد عادي"),
    "#e7eff5": ("--memo-line", "حد عادي"),
    "#e2e8f0": ("--memo-line", "حد عادي"),
    "#cbd5e1": ("--memo-line", "حد عادي"),
    "#e1eaf2": ("--memo-line", "حد عادي"),
    "#f7fafc": ("--memo-soft", "سطح ناعم"),
    "#eef7fc": ("--memo-soft", "سطح ناعم"),
    "#eef4f9": ("--memo-soft", "سطح ناعم"),
    "#f0f5f9": ("--memo-soft", "سطح ناعم"),
    "#e3edf5": ("--memo-line", "حد عادي"),
    "#f0e2c6": ("--memo-gold-border", "حد ذهبي"),
    "#e8f2f9": ("--memo-soft", "سطح ناعم"),
    "#f9fcfe": ("--memo-card-2", "بطاقة فاتحة جدا"),
    "#cbd7e2": ("--memo-line", "حد عادي"),
    "#c3d8e7": ("--memo-line", "حد عادي"),
    "#e2eaf1": ("--memo-line", "حد عادي"),
    "#d6e1ea": ("--memo-line", "حد عادي"),
    "#fcd34d": ("--memo-gold-light", "ذهبي فاتح (حد تنبيه)"),
    # حالة (خطر/نجاح)
    "#b91c1c": ("@danger", "أحمر: خلفية أو نص حسب الخاصية"),
    "#dc2626": ("--memo-danger-text", "نص خطر"),
    "#7f1d1d": ("--memo-danger-strong", "أحمر داكن (شارة)"),
    "#fecaca": ("--memo-danger-border", "حد أحمر"),
    "#fca5a5": ("--memo-danger-border", "حد أحمر"),
    "#e8bcbc": ("--memo-danger-border", "حد أحمر"),
    "#f0d5d5": ("--memo-danger-border", "حد أحمر"),
    "#a14747": ("--memo-danger-text", "نص خطر"),
    "#fef2f2": ("--memo-danger-soft", "سطح خطر"),
    "#fdf2f2": ("--memo-danger-soft", "سطح خطر"),
}

EXCEPTION_PREFIXES = [
    "rgba(255,",   # شفافيات بيضاء فوق أسطح كحلية تبقى كحلية بالوضعين
    "rgba(0,0,0", "rgba(0, 0, 0",  # ظلال وقناع
    "rgba(18,59,93", "rgba(18, 59, 93",  # ظلال كحلية العلامة
    "rgba(217,164,65", "rgba(217, 164, 65",  # توهج ذهبي
    "rgba(201,151,54", "rgba(201, 151, 54",  # توهج ذهبي
    "rgba(15,118,110", "rgba(15, 118, 110",  # توهج تركوازي
    "rgba(15,23,42", "rgba(15, 23, 42",      # طبقة تعتيم نوافذ
    "rgba(2,6,23", "rgba(2, 6, 23",          # ظل نوافذ
    "rgba(15,40,60", "rgba(15, 40, 60",      # ظل
    "rgba(220,229,238", "rgba(220, 229, 238",  # حد شريط لاصق (شفاف)
]
EXCEPTION_VALUES = {"#071f33": "وقفة تدرج الترويسة الكحلية", "#16496a": "وقفة تدرج الترويسة الكحلية",
                    "#0f3f3a": "شريط تركوازي داكن بقصد (نص أبيض)"}

COLOR_RE = re.compile(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)")
DEF_RE = re.compile(r"^\s*--[a-z0-9-]+\s*:")


def classify(value, prop):
    v = value.lower().replace(" ", "")
    if DEF_RE.match("x: "):
        pass
    if v in EXCEPTION_VALUES:
        return None, EXCEPTION_VALUES[v]
    for p in EXCEPTION_PREFIXES:
        if v.startswith(p.replace(" ", "")):
            return None, "تظليل/شفافية زخرفية على سطح ملون ثابت"
    if v in ("#fff", "#ffffff"):
        if prop in ("color",):
            return "--memo-on-brand", "نص أبيض فوق أساسي (ثابت)"
        if prop.startswith("border"):
            return "--memo-line", "حد"
        return "--memo-card", "خلفية سطح"
    if v == "#b91c1c":
        if prop in ("color",):
            return "--memo-danger-text", "نص خطر"
        return "--memo-danger", "خلفية خطر"
    if v in MAP:
        var, why = MAP[v]
        return var, why
    return None, "غير مخطوط"


def scan():
    rows = []
    with open(PATH, encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            if DEF_RE.match(line):
                continue
            before = line
            for m in COLOR_RE.finditer(line):
                raw = m.group(0)
                before_prop = re.findall(r"([a-z-]+)\s*:", line[: m.start()])
                prop = before_prop[-1] if before_prop else "?"
                var, why = classify(raw, prop)
                rows.append((i, prop, raw, var, why))
    return rows


def scan_with_context():
    """مثل scan لكن يرفق أقرب محدد CSS لكل ورود."""
    rows = []
    selector = "(root)"
    with open(PATH, encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            stripped = line.strip()
            if "{" in stripped and not stripped.startswith("/*") and not DEF_RE.match(line):
                sel = stripped.split("{")[0].strip()
                if sel:
                    selector = sel
            if DEF_RE.match(line):
                continue
            for m in COLOR_RE.finditer(line):
                raw = m.group(0)
                before_prop = re.findall(r"([a-z-]+)\s*:", line[: m.start()])
                prop = before_prop[-1] if before_prop else "?"
                var, why = classify(raw, prop)
                rows.append((i, prop, raw, var, why, selector[:70]))
    return rows


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "report"
    if mode == "context":
        rows = scan_with_context()
        exc = [r for r in rows if not r[3]]
        with io.open("scripts/audit-memo-exceptions.md", "w", encoding="utf-8") as out:
            out.write("# الاستثناءات الـ61 — مراجعة بالسياق\n\n| السطر | المحدد | الخاصية | القيمة | الحكم |\n|---|---|---|---|---|\n")
            for i, prop, raw, var, why, sel in exc:
                out.write(f"| {i} | `{sel}` | {prop} | `{raw}` | {why} |\n")
        print(f"استثناءات: {len(exc)} — الجدول في scripts/audit-memo-exceptions.md")
        return
    rows = scan()
    mapped = [r for r in rows if r[3]]
    unmapped = [r for r in rows if not r[3]]
    if mode == "unmapped":
        from collections import Counter
        un = Counter((r[2].lower().replace(" ", ""), r[1], r[4]) for r in rows if not r[3])
        for (v, p, w), n in un.most_common():
            print(f"{n:2}× prop={p:12} {v:22} {w}")
        return
    if mode == "report":
        with io.open("scripts/audit-memo-colors.md", "w", encoding="utf-8") as out:
            out.write("# جرد ألوان memo.css — قبل/بعد\n\n| السطر | الخاصية | القيمة | المتغير | السبب |\n|---|---|---|---|---|\n")
            for i, prop, raw, var, why in rows:
                out.write(f"| {i} | {prop} | `{raw}` | {var or '— يبقى حرفيًا'} | {why} |\n")
        print(f"إجمالي الألوان: {len(rows)} | سترحّل إلى متغيرات: {len(mapped)} | تبقى حرفية (مبررة): {len(unmapped)}")
        from collections import Counter
        c = Counter(w for *_, w in unmapped)
        print("الاستثناءات حسب السبب:")
        for w, n in c.most_common():
            print(f"  {n:3}× {w}")
        return
    if mode == "leftovers":
        print(f"المتبقي حرفيًا: {len(rows)} (منها المبررة أعلاه)")
        for i, prop, raw, var, why in unmapped:
            print(f"  {i}: {prop} {raw} — {why}")
        return
    if mode == "apply":
        with open(PATH, encoding="utf-8") as f:
            lines = f.readlines()
        changed = 0
        out = []
        for i, line in enumerate(lines, 1):
            if DEF_RE.match(line):
                out.append(line)
                continue
            def repl(m):
                nonlocal changed
                raw = m.group(0)
                before_prop = re.findall(r"([a-z-]+)\s*:", line[: m.start()])
                prop = before_prop[-1] if before_prop else "?"
                var, _ = classify(raw, prop)
                if var and var != "@danger":
                    changed += 1
                    return f"var({var})"
                if var == "@danger":
                    var2, _ = classify(raw, "color" if prop == "color" else "background")
                    changed += 1
                    return f"var({var2})"
                return raw
            new = COLOR_RE.sub(repl, line)
            out.append(new)
        with open(PATH, "w", encoding="utf-8", newline="") as f:
            f.writelines(out)
        print(f"استُبدل {changed} لونًا بمراجع متغيرات")


if __name__ == "__main__":
    main()
