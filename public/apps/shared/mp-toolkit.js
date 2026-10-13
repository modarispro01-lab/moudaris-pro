/* ============================================================
   Modaris Pro — Toolkit JS مشترك (v2)
   - ملف الأستاذ المشترك (localStorage): عبّئ مرّة، تظهر في كل وثيقة
   - نظام التصميم: لوحات ألوان + أنماط ورق + خطوط + لغة (عربية/فرنسية/الاثنتان)
   - ترجمة تلقائية لواجهة الأداة والوثيقة المطبوعة
   ============================================================ */
(function (global) {
  "use strict";

  var KEY = "mp_teacher_profile_v1";
  var DKEY = "mp_design_v1";
  var YEAR = "2026/2027";

  var MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو",
    "يوليوز", "غشت", "شتنبر", "أكتوبر", "نونبر", "دجنبر"];

  var DEFAULTS = {
    fullName: "",
    establishment: "",
    academy: "",
    direction: "",
    level: "",
    subject: "",
    city: "",
    schoolYear: YEAR
  };

  /* JSON.parse(null) تُرجع null وليس خطأً — لذا نتحقق من نوع الناتج */
  function safeParse(s) {
    if (s === null || s === undefined || s === "") return {};
    try {
      var v = JSON.parse(s);
      return (v && typeof v === "object") ? v : {};
    } catch (e) { return {}; }
  }

  /* ======================= ملف الأستاذ ======================= */
  function getProfile() {
    var stored = {};
    try { stored = safeParse(localStorage.getItem(KEY)); } catch (e) { stored = {}; }
    var out = {};
    for (var k in DEFAULTS) { out[k] = (stored[k] !== undefined && stored[k] !== null) ? stored[k] : DEFAULTS[k]; }
    return out;
  }

  function setProfile(patch) {
    var merged = getProfile();
    for (var k in patch) { if (patch[k] !== undefined) merged[k] = patch[k]; }
    try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch (e) { console.warn("تعذر الحفظ في localStorage", e); }
    return merged;
  }

  /* ربط حقول الملف المشترك: أي عنصر يحمل data-profile="fullName" */
  function bindProfile(root) {
    root = root || document;
    var fields = root.querySelectorAll("[data-profile]");
    var profile = getProfile();
    Array.prototype.forEach.call(fields, function (el) {
      var key = el.getAttribute("data-profile");
      if (profile[key] !== undefined) { el.value = profile[key]; }
      var handler = function () {
        var patch = {}; patch[key] = el.value; setProfile(patch);
        if (typeof global.MP.onProfileChange === "function") global.MP.onProfileChange(key, el.value);
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });
    return profile;
  }

  /* حالة خاصة بالأداة (تُحفظ منفصلة) */
  function getState(name, def) {
    try {
      var raw = localStorage.getItem("mp_" + name);
      if (!raw) return def;
      var val = safeParse(raw);
      return (val === undefined || val === null || (typeof val === "object" && Object.keys(val).length === 0)) ? def : val;
    } catch (e) { return def; }
  }
  function setState(name, val) {
    try { localStorage.setItem("mp_" + name, JSON.stringify(val)); } catch (e) {}
  }

  function escapeHtml(v) {
    if (v === undefined || v === null) return "";
    return String(v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function nl2br(v) { return escapeHtml(v).replace(/\n/g, "<br>"); }

  function print() { setTimeout(function () { global.print(); }, 60); }

  function toast(msg) {
    var el = document.querySelector(".mp-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "mp-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
  }

  /* تنسيق تاريخ ميلادي بصيغة عربية مغربية */
  function formatDate(iso, withDay) {
    if (!iso) return "";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var s = d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear();
    if (withDay) {
      var days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      s = days[d.getDay()] + " " + s;
    }
    return s;
  }

  function today(withDay) { return formatDate(new Date().toISOString().slice(0, 10), withDay); }

  /* تعبئة عنصر ترويسة وثيقة ببيانات الأستاذ */
  function fillHeader(el, opts) {
    opts = opts || {};
    if (!el) return;
    var p = getProfile();
    el.innerHTML =
      '<div class="doc-hline"><span>' + escapeHtml(opts.right || p.establishment || "") + "</span>" +
      "<span>" + escapeHtml(opts.left || p.direction || "") + "</span></div>";
  }

  /* ============================================================
     نظام التصميم
     ============================================================ */
  var PALETTES = [
    { id: "blue",        group: "official", t: "#123B5D", soft: "#e8eff5", ar: "أزرق رسمي",       fr: "Bleu officiel" },
    { id: "teal",        group: "official", t: "#0F766E", soft: "#e3f4f2", ar: "أخضر مزرق",       fr: "Turquoise" },
    { id: "green",       group: "official", t: "#15803D", soft: "#e7f6ec", ar: "أخضر",            fr: "Vert" },
    { id: "burgundy",    group: "official", t: "#9F1239", soft: "#fbe9ee", ar: "عنابي",           fr: "Bordeaux" },
    { id: "purple",      group: "official", t: "#6D28D9", soft: "#f0e9fd", ar: "بنفسجي",          fr: "Violet" },
    { id: "gold",        group: "official", t: "#B45309", soft: "#fdf1e2", ar: "ذهبي فخم",        fr: "Doré" },
    { id: "slate",       group: "official", t: "#334155", soft: "#eef2f6", ar: "رمادي",           fr: "Gris" },

    { id: "rose",        group: "soft", t: "#BE185D", soft: "#fdeef5", ar: "وردي هادئ",       fr: "Rose doux" },
    { id: "lavender",    group: "soft", t: "#7C4DBE", soft: "#f4eefc", ar: "لافندر هادئ",     fr: "Lavande" },
    { id: "mint",        group: "soft", t: "#0D9488", soft: "#e6f7f5", ar: "نعناعي هادئ",     fr: "Menthe douce" },
    { id: "sky",         group: "soft", t: "#0284C7", soft: "#e6f3fc", ar: "أزرق سماوي",      fr: "Bleu ciel" },
    { id: "peach",       group: "soft", t: "#C2410C", soft: "#fdefe6", ar: "خوخي دافئ",       fr: "Pêche chaude" },
    { id: "sage",        group: "soft", t: "#4D7C5A", soft: "#eaf3ec", ar: "أخضر زيتي",       fr: "Vert sauge" },
    { id: "plum",        group: "soft", t: "#86198F", soft: "#fbeefc", ar: "فوشي راقٍ",       fr: "Prune élégant" },

    { id: "dark-navy",     group: "dark", t: "#0B1220", soft: "#e8edf5", ar: "داكن كحلي",   fr: "Bleu nuit foncé" },
    { id: "dark-graphite", group: "dark", t: "#1F2937", soft: "#eef1f5", ar: "داكن فحمي",   fr: "Graphite foncé" },
    { id: "dark-emerald",  group: "dark", t: "#064E3B", soft: "#e6f5f0", ar: "داكن زمردي",  fr: "Émeraude foncé" },
    { id: "dark-wine",     group: "dark", t: "#4C0519", soft: "#f7e9ee", ar: "داكن عنابي",  fr: "Bordeaux foncé" },

    { id: "mono",        group: "mono", t: "#111111", soft: "#f2f2f2", ar: "أبيض وأسود",      fr: "Noir et blanc" }
  ];

  var PAPERS = [
    { id: "plain",    ar: "سادة",         fr: "Uni" },
    { id: "lined",    ar: "مسطّرة",       fr: "Ligné" },
    { id: "grid",     ar: "مربّعات",      fr: "Quadrillé" },
    { id: "dots",     ar: "منقّطة",       fr: "Pointillé" },
    { id: "frame",    ar: "إطار مزدوج",   fr: "Double cadre" },
    { id: "ornament", ar: "زخرفة زوايا",  fr: "Ornements" },
    { id: "gradient", ar: "تدرّج لوني",   fr: "Dégradé" },
    { id: "kraft",    ar: "ورق بيج",      fr: "Papier beige" }
  ];

  var FONTS = [
    { id: "tajawal",      google: "Tajawal:wght@400;500;700;800",           stack: "'Tajawal', system-ui, 'Segoe UI', Arial, sans-serif",              ar: "تجوال — عصري (افتراضي)",     fr: "Tajawal — moderne (défaut)" },
    { id: "cairo",        google: "Cairo:wght@400;600;700;800",             stack: "'Cairo', 'Tajawal', Arial, sans-serif",                            ar: "القاهرة — عصري واسع",        fr: "Cairo — moderne large" },
    { id: "almarai",      google: "Almarai:wght@400;700;800",               stack: "'Almarai', 'Tajawal', Arial, sans-serif",                          ar: "المراعي — بسيط نظيف",        fr: "Almarai — sobre" },
    { id: "rubik",        google: "Rubik:wght@400;600;700",                 stack: "'Rubik', 'Tajawal', Arial, sans-serif",                            ar: "روبيك — متوازن عصري",        fr: "Rubik — moderne équilibré" },
    { id: "notokufi",     google: "Noto+Kufi+Arabic:wght@400;600;700;800",  stack: "'Noto Kufi Arabic', 'Tajawal', Arial, sans-serif",                 ar: "نوتو كوفي — كوفي حديث",      fr: "Noto Kufi — koufi moderne" },
    { id: "reemkufi",     google: "Reem+Kufi:wght@400;500;700",             stack: "'Reem Kufi', 'Tajawal', Arial, sans-serif",                        ar: "ريم كوفي — كوفي زخرفي",      fr: "Reem Kufi — koufi décoratif" },
    { id: "elmessiri",    google: "El+Messiri:wght@400;600;700",            stack: "'El Messiri', 'Tajawal', serif",                                   ar: "المصيري — أنيق هادئ",        fr: "El Messiri — élégant" },
    { id: "lemonada",     google: "Lemonada:wght@300;400;600;700",          stack: "'Lemonada', 'Tajawal', cursive",                                   ar: "ليمونادة — دائري مرح",       fr: "Lemonada — arrondi, doux" },
    { id: "marhey",       google: "Marhey:wght@400;600;700",                stack: "'Marhey', 'Tajawal', cursive",                                     ar: "مرحّي — مرح للأطفال",        fr: "Marhey — ludique enfants" },
    { id: "amiri",        google: "Amiri:wght@400;700",                     stack: "'Amiri', 'Scheherazade New', 'Times New Roman', serif",            ar: "أميري — نسخي تقليدي",        fr: "Amiri — naskh traditionnel" },
    { id: "scheherazade", google: "Scheherazade+New:wght@400;700",          stack: "'Scheherazade New', 'Amiri', serif",                               ar: "شهرزاد — نسخي واضح",         fr: "Scheherazade — naskh clair" },
    { id: "lateef",       google: "Lateef:wght@400;700",                    stack: "'Lateef', 'Amiri', serif",                                         ar: "لطيف — نسخي رفيع",           fr: "Lateef — naskh fin" },
    { id: "arefruqaa",    google: "Aref+Ruqaa:wght@400;700",                stack: "'Aref Ruqaa', 'Amiri', serif",                                     ar: "عارف رقعة — خط فني",         fr: "Aref Ruqaa — calligraphique" }
  ];

  var DEFAULT_DESIGN = { palette: "blue", paper: "plain", font: "tajawal", lang: "ar" };
  var LEGACY_THEMES = ["theme-blue", "theme-green", "theme-gold", "theme-purple", "theme-slate", "theme-mono"];

  var FONT_MAP = {};
  FONTS.forEach(function (f) { FONT_MAP[f.id] = f; });
  var PALETTE_MAP = {};
  PALETTES.forEach(function (p) { PALETTE_MAP[p.id] = p; });
  var PAPER_MAP = {};
  PAPERS.forEach(function (p) { PAPER_MAP[p.id] = p; });

  var design = { palette: "blue", paper: "plain", font: "tajawal", lang: "ar" };

  function getDesign() {
    return { palette: design.palette, paper: design.paper, font: design.font, lang: design.lang };
  }

  function setDesign(patch) {
    if (patch.palette !== undefined && PALETTE_MAP[patch.palette]) design.palette = patch.palette;
    if (patch.paper !== undefined && PAPER_MAP[patch.paper]) design.paper = patch.paper;
    if (patch.font !== undefined && FONT_MAP[patch.font]) design.font = patch.font;
    if (patch.lang !== undefined) design.lang = patch.lang;
    try { localStorage.setItem(DKEY, JSON.stringify(design)); } catch (e) {}
    refresh();
    if (typeof global.MP.onDesignChange === "function") global.MP.onDesignChange(getDesign());
  }

  var _loadedFonts = {};
  function loadFont(f) {
    if (!f || !f.google || _loadedFonts[f.id]) return;
    _loadedFonts[f.id] = true;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=" + f.google + "&display=swap";
    document.head.appendChild(l);
  }

  function applyDesign() {
    var root = document.documentElement;
    root.setAttribute("data-palette", design.palette);
    root.setAttribute("data-paper", design.paper);
    root.setAttribute("data-font", design.font);
    root.setAttribute("data-lang", design.lang);

    var f = FONT_MAP[design.font] || FONTS[0];
    root.style.setProperty("--font-doc", f.stack);
    loadFont(f);

    /* إزالة قوالب الألوان القديمة من الوثائق (صار التصميم موحّداً) */
    var docs = document.querySelectorAll(".a4");
    Array.prototype.forEach.call(docs, function (el) {
      for (var i = 0; i < LEGACY_THEMES.length; i++) el.classList.remove(LEGACY_THEMES[i]);
    });

    /* إخفاء حقل «القالب اللوني» القديم لصالح لوحة التصميم الجديدة */
    var th = document.getElementById("theme");
    if (th && th.closest && th.closest(".mp-field")) th.closest(".mp-field").style.display = "none";
  }

  /* ============================================================
     قاموس الترجمة (عربي → فرنسي)
     ============================================================ */
  var STR = {
    /* ===== ترويسات مشتركة ===== */
    "الأكاديمية الجهوية للتربية والتكوين": "Académie régionale d'éducation et de formation",
    "وزارة التربية الوطنية والتعليم الأولي والرياضة": "Ministère de l'Éducation nationale, du Préscolaire et des Sports",
    "المملكة المغربية": "Royaume du Maroc",
    "الأكاديمية": "Académie",
    "المديرية": "Direction",
    "المديرية الإقليمية": "Direction provinciale",
    "المؤسسة": "Établissement",
    "المستوى": "Niveau",
    "المستوى / القسم": "Niveau / classe",
    "المادة": "Matière",
    "السنة الدراسية": "Année scolaire",
    "الأستاذ(ة)": "L'enseignant(e)",
    "الأستاذ(ة) فقط": "L'enseignant(e) uniquement",
    "المدير(ة)": "Le directeur(trice)",
    "المدير(ة) فقط": "Le directeur(trice) uniquement",
    "المدير(ة) + الأستاذ(ة)": "Le directeur(trice) + l'enseignant(e)",
    "التوقيع": "Signature",
    "توقيع الأستاذ(ة)": "Signature de l'enseignant(e)",
    "طابع وتوقيع المدير(ة)": "Cachet et signature du directeur(trice)",
    "توقيع المعني بالأمر": "Signature de l'intéressé(e)",
    "الاسم الكامل": "Nom et prénom",
    "الاسم والنسب": "Nom et prénom",
    "الصورة": "Photo",
    "اللغة": "Langue",
    "الفترة": "Période",
    "الفترة / الأسدوس": "Période / semestre",
    "الفترة / المناسبة": "Période / occasion",
    "السلّم": "Barème",
    "المعدل": "Moyenne",
    "المعدّل": "Moyenne",
    "المجموع": "Total",
    "الملاحظة": "Remarque",
    "الرتبة": "Rang",
    "المرتبة": "Rang",
    "ر": "N°",
    "الاسم : المعدّل": "Nom : moyenne",

    /* ===== المستويات ===== */
    "الأول ابتدائي": "1re année primaire",
    "الثاني ابتدائي": "2e année primaire",
    "الثالث ابتدائي": "3e année primaire",
    "الرابع ابتدائي": "4e année primaire",
    "الخامس ابتدائي": "5e année primaire",
    "السادس ابتدائي": "6e année primaire",
    "جميع المستويات": "Tous les niveaux",
    "جميع المواد": "Toutes les matières",

    /* ===== المواد ===== */
    "اللغة العربية": "Langue arabe",
    "اللغة الفرنسية": "Langue française",
    "الرياضيات": "Mathématiques",
    "التربية الإسلامية": "Éducation islamique",
    "النشاط العلمي": "Activités scientifiques",
    "الاجتماعيات": "Sciences sociales",

    /* ===== أنواع الوثائق ===== */
    "المذكرة اليومية": "Fiche journalière",
    "الملف التربوي": "Dossier pédagogique",
    "التوزيع السنوي": "Répartition annuelle",
    "الجذاذات": "Fiches pédagogiques",
    "الفروض": "Devoirs",
    "الملف التراكمي": "Dossier cumulatif",
    "مذكرة الدعم المكثف": "Fiche de soutien intensif",
    "دفتر النصوص": "Cahier de textes",
    "سجل التنقيط": "Registre de notation",
    "وثائق إدارية": "Documents administratifs",
    "شبكة التنقيط": "Grille de notation",
    "شبكة التفريغ والتنقيط": "Grille de report et de notation",
    "البطاقة الشخصية للأستاذ": "Fiche personnelle de l'enseignant",
    "البطاقة الشخصية للأستاذ(ة)": "Fiche personnelle de l'enseignant(e)",
    "ميثاق القسم": "Charte de la classe",

    /* ===== الواجهة: الأقسام ===== */
    "👤 بيانات الأستاذ (تُحفظ وتظهر في كل الأدوات)": "👤 Données de l'enseignant (enregistrées et partagées)",
    "👤 بيانات الأستاذ": "👤 Données de l'enseignant",
    "🎨 التصميم واللغة": "🎨 Design et langue",
    "🖼️ إعداد الواجهة": "🖼️ Réglages de la couverture",
    "📊 أعمدة النقط": "📊 Colonnes de notes",
    "📋 معطيات الشبكة": "📋 Données de la grille",
    "📋 القواعد": "📋 Règles",
    "📑 الفواصل": "📑 Intercalaires",
    "📌 العنوان": "📌 Titre",
    "📝 نص الشهادة": "📝 Texte du certificat",
    "⚙️ التخطيط": "⚙️ Mise en page",
    "⚙️ خيارات": "⚙️ Options",
    "✍️ نبرة الملاحظة": "✍️ Ton de la remarque",
    "✒️ التوقيع": "✒️ Signature",
    "🌐 اللغة": "🌐 Langue",
    "🏅 نوع الشهادة": "🏅 Type de certificat",
    "🏛️ القسم الإداري": "🏛️ Section administrative",
    "🎓 القسم المهني": "🎓 Section professionnelle",
    "🧍 القسم الشخصي": "🧍 Section personnelle",
    "🧑‍🎓 التلاميذ والمعدّلات": "🧑‍🎓 Élèves et moyennes",
    "🧑‍🎓 لائحة التلاميذ": "🧑‍🎓 Liste des élèves",

    /* ===== الواجهة: تسميات ===== */
    "المعلومات الإدارية": "Informations administratives",
    "المعلومات الشخصية": "Informations personnelles",
    "المعلومات المهنية والشهادات": "Informations professionnelles et diplômes",
    "رقم التأجير (P.P.R)": "Numéro de solde (P.P.R)",
    "رقم البطاقة الوطنية": "Numéro de la C.I.N.",
    "الدرجة": "Échelon",
    "الإطار": "Corps",
    "تاريخ التعيين": "Date de nomination",
    "آخر ترقية": "Dernière promotion",
    "الحالة العائلية": "Situation familiale",
    "تاريخ الميلاد": "Date de naissance",
    "مكان الميلاد": "Lieu de naissance",
    "العنوان": "Adresse",
    "الهاتف": "Téléphone",
    "البريد الإلكتروني": "E-mail",
    "الشهادات المحصّل عليها": "Diplômes obtenus",
    "أستاذ التعليم الابتدائي": "Enseignant du primaire",
    "نوع الوثيقة": "Type de document",
    "العنوان الرئيسي": "Titre principal",
    "العنوان الفرعي": "Sous-titre",
    "العنوان الفرعي (اختياري)": "Sous-titre (facultatif)",
    "القالب اللوني": "Thème de couleur",
    "الخط": "Police",
    "نمط الورقة": "Motif du papier",
    "لغة الواجهة والوثيقة": "Langue de l'interface et du document",
    "الاثنتان": "Les deux",
    "ألوان رسمية": "Couleurs officielles",
    "هادئة وأنثوية": "Douces et féminines",
    "داكنة": "Foncées",
    "اقتصادية": "Économiques",
    "إعادة الضبط الافتراضي": "Réinitialiser",
    "إظهار المستوى والمادة": "Afficher le niveau et la matière",
    "إظهار الإطار المزدوج": "Afficher le double cadre",
    "إظهار السنة الدراسية": "Afficher l'année scolaire",
    "إظهار الأكاديمية والمديرية": "Afficher l'académie et la direction",
    "إظهار الأكاديمية والمؤسسة": "Afficher l'académie et l'établissement",
    "إظهار الفهرس": "Afficher l'index",
    "إظهار صفحة الغلاف": "Afficher la page de couverture",
    "إظهار ملاحظة الفاصل": "Afficher la note de l'intercalaire",
    "إظهار خانات التوقيع": "Afficher les cases de signature",
    "إظهار خانة التوقيع": "Afficher la case de signature",
    "إظهار خانة الصورة": "Afficher la case photo",
    "إظهار خانة الملاحظة": "Afficher la case remarque",
    "إظهار عمود المعدّل": "Afficher la colonne de la moyenne",
    "إظهار الرتبة": "Afficher le rang",
    "إظهار المستوى داخل البطاقة": "Afficher le niveau sur la carte",
    "إظهار اسم المؤسسة داخل البطاقة": "Afficher l'établissement sur la carte",
    "إظهار الخاتم الذهبي": "Afficher le sceau doré",
    "عدد الأعمدة": "Nombre de colonnes",
    "عمود واحد": "Une colonne",
    "عمودان": "Deux colonnes",
    "عمودان أم عمود واحد": "Deux colonnes ou une seule",
    "عدد البطاقات في الورقة": "Nombre d'étiquettes par feuille",
    "2 بطاقات (كبيرة جداً)": "2 étiquettes (très grandes)",
    "4 بطاقات": "4 étiquettes",
    "6 بطاقات": "6 étiquettes",
    "9 بطاقات": "9 étiquettes",
    "12 بطاقة (اقتصادية)": "12 étiquettes (économique)",
    "Affichettes للطاولات": "Affichettes pour les tables",
    "الشكل": "Format",
    "الاتجاه": "Orientation",
    "أفقي (A4 — لوحة حائط)": "Paysage (A4 — affiche murale)",
    "عمودي (A4 — ملصق باب القسم)": "Portrait (A4 — affiche de porte)",
    "نمط الترقيم": "Style de numérotation",
    "أرقام (1، 2، 3...)": "Chiffres (1, 2, 3...)",
    "علامات (✓)": "Coches (✓)",
    "زخرفة (نجمة)": "Décoration (étoile)",
    "عنوان الشبكة": "Titre de la grille",
    "رأس العمود": "En-tête de colonne",
    "على 10": "sur 10",
    "على 20": "sur 20",
    "الفرض": "Devoir",
    "مسح النقط": "Effacer les notes",
    "🧹 مسح النقط": "🧹 Effacer les notes",
    "إضافة": "Ajouter",
    "إضافة فاصل خاص": "Ajouter un intercalaire personnalisé",
    "إضافة قاعدة": "Ajouter une règle",
    "حذف": "Supprimer",
    "الصيغة:": "Formule :",
    "لائحة نصية للنسخ في البطاقة": "Liste texte à copier dans la carte",
    "جدول (اسم · معدل · ملاحظة)": "Tableau (nom · moyenne · remarque)",
    "نقاط، مجموع، معدل، ورتبة": "Notes, total, moyenne et rang",
    "شهادة لكل تلميذ في ورقة": "Un certificat par élève par feuille",
    "التلاميذ (اسم في كل سطر → شهادة لكل واحد)": "Élèves (un nom par ligne → un certificat chacun)",
    "ملاحظات جاهزة حسب المعدل": "Remarques prêtes selon la moyenne",
    "نبرة الملاحظة": "Ton de la remarque",
    "متوازنة (موضوعية)": "Équilibrée (objective)",
    "تشجيعية (لطيفة ومحفّزة)": "Encouragement (douce et motivante)",
    "واضحة (تحفيز على العمل)": "Claire (incitation au travail)",
    "نص التقدير (يُملأ تلقائياً حسب النوع)": "Texte d'appréciation (rempli selon le type)",
    "المرتبة (اختياري)": "Rang (facultatif)",
    "المعدّل (اختياري)": "Moyenne (facultatif)",
    "عربية · فرنسية · الاثنتان": "Arabe · Français · Les deux",
    "الاثنتان معاً": "Les deux",
    "العربية": "Arabe",
    "الفرنسية": "Français",
    "— بدون —": "— Aucun —",
    "أزرق (أساسي)": "Bleu (principal)",
    "أخضر": "Vert",
    "بنفسجي": "Violet",
    "ذهبي": "Doré",
    "ذهبي (فخم)": "Doré (prestige)",
    "رمادي": "Gris",
    "أبيض وأسود": "Noir et blanc",
    "أبيض وأسود (اقتصاد الحبر)": "Noir et blanc (économie d'encre)",
    "ملصق جاهز للطباعة": "Affiche prête à imprimer",

    /* ===== نصوص الحقول (placeholder) ===== */
    "اتركه فارغاً لاستعمال نوع الوثيقة": "Laissez vide pour utiliser le type de document",
    "اسم المؤسسة": "Nom de l'établissement",
    "الجهة": "Région",
    "الأولى": "1re",
    "الأسدوس الأول": "Semestre 1",
    "الأسدوس الأول 2026/2027": "Semestre 1 — 2026/2027",
    "شهادة واحدة في كل سطر": "Un certificat par ligne",
    "عنوان الفاصل الجديد": "Titre du nouvel intercalaire",
    "نصّ القاعدة الجديدة": "Texte de la nouvelle règle",
    "مثلاً: الرابع ابتدائي": "Ex. : 4e année primaire",
    "مثلاً: ملف الفرض الأول": "Ex. : dossier du devoir 1",
    "محمد العلوي\nسارة بناني": "Mohamed Alaoui\nSara Bennani",
    "اسم واحد في كل سطر\nمحمد العلوي\nسارة بناني": "Un nom par ligne\nMohamed Alaoui\nSara Bennani",
    "اسم واحد في كل سطر\nمثال:\nمحمد العلوي\nسارة بناني": "Un nom par ligne\nExemple :\nMohamed Alaoui\nSara Bennani",
    "اسم واحد في كل سطر، مع المعدّل بعد النقطتين:\nمحمد العلوي : 15.5\nسارة بناني : 18\nأمين الإدريسي : 9.5": "Un nom par ligne, avec la moyenne après « : »\nMohamed Alaoui : 15.5\nSara Bennani : 18\nAmine Idrissi : 9.5",
    "شهادة تقدير": "Certificat de mérite",
    "شهادة تفوّق دراسي": "Certificat d'excellence scolaire",
    "شهادة تشجيعية": "Certificat d'encouragement",
    "شهادة مشاركة": "Certificat de participation",
    "شهادة مواظبة وانتظام": "Certificat d'assiduité",
    "فواصل ومكوّنات جاهزة للطباعة": "Intercalaires et composants prêts à imprimer",
    "واجهات وأغلفة الملفات": "Couvertures et pages de garde",
    "شواهد التقدير والتشجيع": "Attestations de mérite et d'encouragement",
    "بطاقات أسماء التلاميذ": "Étiquettes des noms d'élèves",
    "مولّد الملاحظات التقديرية": "Générateur de remarques",
    "شبكات التنقيط والتفريغ": "Grilles de notation et de report",
    "ميثاق وقوانين القسم": "Charte et règles de classe",
    "صمّم واجهة ملفّك واطبعها": "Concevez la couverture de votre dossier et imprimez-la",
    "عدّله كما تشاء.": "Modifiez-le à volonté.",

    /* ===== تنبيهات وأزرار ===== */
    "🖨️ طباعة / حفظ PDF": "🖨️ Imprimer / Enregistrer en PDF",
    "🔁 توليد صيغ أخرى": "🔁 Générer d'autres formulations",
    "لم يتم العثور على وثيقة للطباعة": "Aucun document à imprimer",
    "تم توليد صيغ أخرى": "D'autres formulations ont été générées",
    "تم مسح النقط": "Notes effacées",
    "أضف لائحة التلاميذ من اللوحة على اليمين.": "Ajoutez la liste des élèves depuis le panneau à droite.",
    "أضف لائحة التلاميذ والمعدّلات من اللوحة على اليمين.": "Ajoutez la liste des élèves et les moyennes depuis le panneau à droite.",
    "أضف لائحة التلاميذ من اللوحة على اليمين لتوليد البطاقات.": "Ajoutez la liste des élèves depuis le panneau à droite pour générer les étiquettes.",
    "اختر فاصلاً واحداً على الأقل من اللوحة.": "Choisissez au moins un intercalaire dans le panneau.",
    "الصق لائحة القسم (سطر لكل تلميذ).": "Collez la liste de la classe (un élève par ligne).",
    "تُولَّد بطاقة لكل اسم، بالترتيب.": "Une carte est générée pour chaque nom, dans l'ordre.",
    "(على 20). إذا كتبت الاسم فقط، تُولَّد ملاحظة محايدة.": "(sur 20). Si vous n'entrez que le nom, une remarque neutre sera générée.",

    /* ===== ملاحظات اللوحة ===== */
    "💡 الواجهة تُطبع بلا علامة مائية. اختر «حفظ كـ PDF» في نافذة الطباعة.": "💡 La couverture s'imprime sans filigrane. Choisissez « Enregistrer au format PDF ».",
    "💡 اطبع الفواصل وضع كل فاصل أمام قسمه داخل الملف التراكمي.": "💡 Imprimez les intercalaires et placez chacun devant sa section.",
    "💡 اطبع على ورق مقوّى، ثم اقْصَّ على الخطوط المتقطّعة وثبّت البطاقة على الطاولة.": "💡 Imprimez sur papier épais, découpez suivant les pointillés et fixez l'étiquette sur la table.",
    "💡 افتح كل قاعدة للنقاش مع تلاميذك، ثم علّق الميثاق داخل القسم.": "💡 Discutez chaque règle avec vos élèves, puis affichez la charte en classe.",
    "💡 كل تلميذ في ورقة A4 مستقلة، مناسبة للطبع على ورق مقوّى.": "💡 Chaque élève sur une feuille A4, idéale sur papier épais.",
    "💡 يمكنك تعديل أي ملاحظة مباشرة على الورقة بالنقر عليها قبل الطباعة.": "💡 Cliquez sur une remarque pour la modifier directement avant l'impression.",

    /* ===== مخرجات الوثائق ===== */
    "ملف": "Dossier",
    "وثيقة": "Document",
    "فاصل": "Intercalaire",
    "القسم": "Section",
    "الفهرس": "Index",
    "عدد التلاميذ": "Nombre d'élèves",
    "مقبول": "Passable",
    "حسن": "Assez bien",
    "جيد": "Bien",
    "جيد جداً": "Très bien",
    "ممتاز": "Excellent",
    "يحتاج دعماً": "Besoin de soutien",
    "تقدير وتشجيع": "Mérite et encouragement",
    "تُمنح هذه الشهادة إلى التلميذ(ة):": "Ce certificat est décerné à l'élève :",
    "بمعدّل": "Avec une moyenne de",
    "وذلك تقديراً لتفوّقه الدراسي واجتهاده المتواصل خلال هذه الفترة. نسأل الله له دوام التوفيق والنجاح.": "En reconnaissance de son excellence scolaire et de ses efforts continus durant cette période. Nous lui souhaitons plein succès.",
    "وذلك تقديراً لمجهوداته القيّمة وسلوكه المتميّز داخل القسم واحترامه لزملائه وأساتذته.": "En reconnaissance de ses précieux efforts, de son comportement exemplaire et de son respect envers ses camarades et ses enseignants.",
    "وذلك تقديراً لمشاركته الفعّالة وإسهامه البنّاء في الأنشطة الصفّية والتربوية.": "En reconnaissance de sa participation active et de sa contribution constructive aux activités de classe.",
    "وذلك تقديراً لمواظبته وانتظامه وحضوره الدائم، والتزامه بمواعيد الدراسة.": "En reconnaissance de son assiduité, de sa régularité et de son respect des horaires d'étude.",
    "تشجيعاً له على مواصلة الاجتهاد والمثابرة، وثقةً في قدرته على تحقيق الأفضل.": "L'encourageant à poursuivre ses efforts et sa persévérance, et confiant en sa capacité de faire mieux.",
    "الملاحظات التقديرية": "Remarques d'évaluation",
    "اقْصَّ على الخطوط المتقطّعة — Modaris Pro": "Découpez suivant les pointillés — Modaris Pro",

    /* ===== فواصل الملف التراكمي ===== */
    "يُرتَّب محتوى هذا القسم خلف هذا الفاصل، مع الحرص على تحديثه دورياً خلال الموسم الدراسي.": "Le contenu de cette section est classé derrière cet intercalaire ; pensez à le mettre à jour régulièrement.",
    "المذكرات والجذاذات": "Fiches journalières et pédagogiques",
    "التوزيعات والوثائق التربوية": "Répartitions et documents pédagogiques",
    "شبكات التقويم والنتائج": "Grilles d'évaluation et résultats",
    "الوثائق الشخصية والإدارية": "Documents personnels et administratifs",
    "الشهادات والدبلومات": "Certificats et diplômes",
    "التقارير والمراسلات الإدارية": "Rapports et correspondances administratives",
    "أنشطة الدعم والتثبيت": "Activités de soutien et de consolidation",
    "صور الأنشطة الصفية": "Photos des activités de classe",
    "دلائل ومراجع تربوية": "Guides et références pédagogiques",

    /* ===== قواعد القسم ===== */
    "أتعامل مع زملائي وأستاذي باحترام — قواعدنا التي نلتزم بها جميعاً": "Je traite mes camarades et mon enseignant avec respect — nos règles communes",
    "أحافظ على نظافة قسمي وأعتني بأثاث المؤسسة وتجهيزاتها.": "Je garde ma classe propre et je prends soin du mobilier et du matériel.",
    "أحترم زملائي في القول والفعل، ولا أسخر من أحد.": "Je respecte mes camarades en paroles et en actes, sans me moquer de personne.",
    "أدخل القسم بهدوء، وأحضر جميع أدواتي قبل بداية الحصة.": "J'entre en classe calmement et je prépare mon matériel avant la séance.",
    "أرفع يدي قبل الكلام، وأحترم دور زملائي في المشاركة.": "Je lève la main avant de parler et je respecte le tour de mes camarades.",
    "أطلب المساعدة عند الحاجة بلباقة، وأتعاون مع زملائي.": "Je demande de l'aide avec politesse et je coopère avec mes camarades.",
    "أعتزّ بمدرستي، وأفتخر بانتمائي إليها.": "Je suis fier de mon école et de mon appartenance.",
    "أنجز واجباتي في الوقت المحدد، وأشارك في الأنشطة الصفية.": "Je fais mes devoirs à temps et je participe aux activités de classe.",
    "أُنصت إلى الأستاذ(ة) وأتّبع التوجيهات بانتظام.": "J'écoute l'enseignant(e) et je suis les consignes.",

    /* ===== الملاحظات التقديرية (المولّد) ===== */
    "أداء رائع يستحق الإشادة. حافظ على هذا المستوى العالي.": "Performance remarquable, digne d'éloges. Gardez ce haut niveau.",
    "بإمكانك أن تتألّق أكثر، ابدأ من اليوم خطوة بخطوة.": "Vous pouvez briller davantage : commencez dès aujourd'hui, pas à pas.",
    "بداية موفّقة، وتستطيع تحقيق الأفضل.": "Bon début, vous pouvez faire encore mieux.",
    "تعثّر واضح: مرافقة فردية ومراجعة يومية ضروريان.": "Difficultés nettes : un accompagnement individuel et une révision quotidienne sont nécessaires.",
    "تلميذ(ة) في حاجة إلى مزيد من المشاركة داخل القسم.": "Élève qui doit davantage participer en classe.",
    "تلميذ(ة) يتابع دروسه بانتظام.": "Élève qui suit ses cours régulièrement.",
    "ثقتنا فيك كبيرة، لنبدأ العلاج خطوة بخطوة.": "Nous croyons en vous : commençons le rattrapage pas à pas.",
    "جيد جداً، لكن الانتظام في المراجعة يرفع نتيجتك.": "Très bien, mais une révision régulière améliorera votre résultat.",
    "خطوة إضافية من الاجتهاد وستتغيّر نتيجتك.": "Un effort supplémentaire et votre résultat changera.",
    "لا بدّ من عمل منظّم فوري مع المواكبة.": "Un travail organisé et immédiat, avec accompagnement, s'impose.",
    "لا تقلق، بالمثابرة سترتفع نتيجتك بإذن الله.": "Ne vous inquiétez pas : avec de la persévérance, votre résultat progressera.",
    "لا تيأس! أنت بحاجة إلى دعم ومرافقة، وسنتجاوز ذلك معاً.": "Ne baissez pas les bras ! Vous avez besoin de soutien et d'accompagnement ; nous y arriverons ensemble.",
    "مجهود محمود، أنت قريب جداً من القمّة.": "Effort louable, vous êtes tout près du sommet.",
    "مستوى جيد جداً. انتبه إلى التفاصيل لتصل إلى الامتياز.": "Très bon niveau. Attention aux détails pour atteindre l'excellence.",
    "مستوى جيد جداً. مزيداً من الاجتهاد.": "Très bon niveau. Continuez vos efforts.",
    "مستوى جيد. يمكنك تحقيق الأفضل بمزيد من المثابرة.": "Bon niveau. Vous pouvez mieux faire avec plus de persévérance.",
    "مستوى جيد، لكن المطلوب بذل مجهود أكبر.": "Bon niveau, mais un effort plus important est attendu.",
    "مستوى على الحدّ الأدنى، يحتاج إلى تثبيت.": "Niveau minimal, à consolider.",
    "مستوى متوسط. يحتاج إلى مراجعة منتظمة.": "Niveau moyen. Une révision régulière est nécessaire.",
    "مستوى متوسط: يجب مضاعفة العمل والمراجعة اليومية.": "Niveau moyen : doublez le travail et révisez chaque jour.",
    "مستوى ممتاز. واصل بنفس الجدّية والانتظام.": "Niveau excellent. Continuez avec le même sérieux et la même régularité.",
    "مستوى ممتاز؛ المطلوب الآن الاستمرارية.": "Niveau excellent ; il faut désormais de la constance.",
    "مستوى هشّ يستوجب مواكبة جدّية من الأسرة والمدرسة.": "Niveau fragile nécessitant un suivi sérieux de la famille et de l'école.",
    "نتائج جيدة تحتاج إلى تثبيت المكاسب.": "Bons résultats, à consolider.",
    "نتائج جيدة جداً مع إمكانية الأفضل.": "Très bons résultats, avec possibilité de mieux.",
    "نتائج جيدة جداً، أحسنت! خطوة واحدة تفصلك عن الامتياز.": "Très bons résultats, bravo ! Une seule étape vous sépare de l'excellence.",
    "نتائج جيدة: راجع دروسك بانتظام لترتقي.": "Bons résultats : révisez régulièrement pour progresser.",
    "نتائج جيدة، أظهرتَ مجهوداً محموداً. واصل!": "Bons résultats, effort louable. Continuez !",
    "نتائج عالية جداً. حافظ على المستوى ولا تتراخَ.": "Résultats très élevés. Gardez ce niveau sans relâchement.",
    "نتائج متوسطة تستوجب عناية أكبر بالدروس.": "Résultats moyens : plus d'attention aux leçons.",
    "نتائج متوسطة لا ترقى إلى قدراتك؛ جدّد العزم.": "Résultats moyens en deçà de vos capacités ; reprenez courage.",
    "نتائج مقبولة وأنت قادر على الأفضل. ثق في نفسك.": "Résultats acceptables ; vous pouvez mieux faire. Croyez en vous.",
    "نتائج ممتازة تعكس مجهوداً كبيراً.": "Résultats excellents reflétant un grand effort.",
    "نتائج ممتازة ومتميّزة. تحية تقدير لك، واصل هذا التألّق.": "Résultats excellents et remarquables. Bravo, continuez ainsi.",
    "نتيجة ضعيفة نسبياً: مراجعة يومية ومتابعة إلزامية.": "Résultat relativement faible : révision quotidienne et suivi obligatoires.",
    "نتيجة متعثّرة تستلزم مرافقة فردية.": "Résultat difficile nécessitant un accompagnement individuel.",
    "نتيجة هشّة. تلزمك مراجعة منتظمة ودعم.": "Résultat fragile. Une révision régulière et un soutien s'imposent.",
    "يحتاج إلى دعم مكثّف ومراجعة الأساسيات.": "Besoin d'un soutien intensif et d'une révision des bases."
  };

  /* ==================== محرّك الترجمة ==================== */
  function packTr(ar, mode) {
    var fr = STR[ar];
    if (fr === undefined) return ar;
    return mode === "both" ? ar + " / " + fr : fr;
  }

  function tr(s, mode) {
    if (!s) return s;
    mode = mode || design.lang;
    if (mode === "ar") return s;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    if (!m) return s;
    var lead = m[1], core = m[2], tail = m[3];
    if (!core) return s;
    if (Object.prototype.hasOwnProperty.call(STR, core)) return lead + packTr(core, mode) + tail;
    var parts = core.split(/([:：—])/);
    if (parts.length > 1) {
      var any = false;
      for (var i = 0; i < parts.length; i++) {
        var seg = parts[i];
        var soft = seg.trim();
        if (soft && Object.prototype.hasOwnProperty.call(STR, soft)) {
          parts[i] = seg.replace(soft, function () { return packTr(soft, mode); });
          any = true;
        }
      }
      if (any) return lead + parts.join("") + tail;
    }
    /* نمط «تسمية + رقم» مثل: الفرض 1 */
    var num = /^([\s\S]+?)(\s+\d+)$/.exec(core);
    if (num) {
      var lab = num[1].trim();
      if (Object.prototype.hasOwnProperty.call(STR, lab)) return lead + packTr(lab, mode) + num[2] + tail;
    }
    return s;
  }

  var SKIP_TEXT = "script,style,title,textarea,.mp-logo,.mp-toast,.mp-design,[data-mp-notranslate]";
  var SKIP_ATTR = "script,style,.mp-design,[data-mp-notranslate]";

  function nodeMode(el) {
    if (design.lang === "both" && el && el.closest && el.closest(".mp-panel")) return "ar";
    return design.lang;
  }

  function translateDom(root) {
    root = root || document.body;
    if (!root) return;

    if (design.lang !== "ar") {
      /* حماية قيمة <option> التي لا تحمل value (تغيير النص يغيّر القيمة) */
      var opts = root.querySelectorAll("option");
      Array.prototype.forEach.call(opts, function (el) {
        if (el.closest && el.closest(SKIP_ATTR)) return;
        if (el.__mpVal === undefined) el.__mpVal = el.textContent;
        if (!el.hasAttribute("value")) el.setAttribute("value", el.__mpVal);
      });

      /* العُقد النصية */
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var list = [], n;
      while ((n = walker.nextNode())) list.push(n);
      for (var i = 0; i < list.length; i++) {
        var node = list[i];
        var par = node.parentNode;
        if (!par || (par.closest && par.closest(SKIP_TEXT))) continue;
        if (node.__mpSrc === undefined) node.__mpSrc = node.nodeValue;
        var out = tr(node.__mpSrc, nodeMode(par));
        if (out !== node.nodeValue) node.nodeValue = out;
      }

      /* الخصائص placeholder / title */
      var attrs = root.querySelectorAll("[placeholder],[title]");
      Array.prototype.forEach.call(attrs, function (el) {
        if (el.closest && el.closest(SKIP_ATTR)) return;
        var store = el.__mpAttr || (el.__mpAttr = {});
        ["placeholder", "title"].forEach(function (a) {
          if (!el.hasAttribute(a)) return;
          if (store[a] === undefined) store[a] = el.getAttribute(a);
          var o = tr(store[a], nodeMode(el));
          if (o !== el.getAttribute(a)) el.setAttribute(a, o);
        });
      });
    } else {
      /* الرجوع للعربية: نعيد بناء النصوص من المصدر الأصلي */
      var w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      var l2 = [], m2;
      while ((m2 = w2.nextNode())) l2.push(m2);
      for (var j = 0; j < l2.length; j++) {
        if (l2[j].__mpSrc !== undefined && l2[j].nodeValue !== l2[j].__mpSrc) l2[j].nodeValue = l2[j].__mpSrc;
      }
      var a2 = root.querySelectorAll("[placeholder],[title]");
      Array.prototype.forEach.call(a2, function (el) {
        if (!el.__mpAttr) return;
        ["placeholder", "title"].forEach(function (a) {
          if (el.__mpAttr[a] !== undefined && el.getAttribute(a) !== el.__mpAttr[a]) el.setAttribute(a, el.__mpAttr[a]);
        });
      });
    }
  }

  /* ============================================================
     لوحة التصميم
     ============================================================ */
  function L(ar, fr) { return design.lang === "fr" ? fr : ar; }

  function designBarHtml() {
    var h = '<summary>🎨 ' + L("التصميم واللغة", "Design et langue") + "</summary>";
    h += '<div class="mp-design-body">';

    /* اللغة */
    h += '<div class="mp-dgroup">🌐 ' + L("لغة الواجهة والوثيقة", "Langue de l'interface et du document") + "</div>";
    h += '<div class="mp-langbtns">';
    [["ar", "العربية"], ["fr", "Français"], ["both", L("الاثنتان", "Les deux")]].forEach(function (p) {
      h += '<button type="button" class="mp-langbtn' + (design.lang === p[0] ? " active" : "") +
        '" data-dlang="' + p[0] + '">' + escapeHtml(p[1]) + "</button>";
    });
    h += "</div>";

    /* الألوان */
    var groups = [
      { id: "official", ar: "ألوان رسمية", fr: "Couleurs officielles" },
      { id: "soft", ar: "هادئة وأنثوية", fr: "Douces et féminines" },
      { id: "dark", ar: "داكنة", fr: "Foncées" },
      { id: "mono", ar: "اقتصادية", fr: "Économiques" }
    ];
    groups.forEach(function (g, gi) {
      var items = PALETTES.filter(function (p) { return p.group === g.id; });
      if (!items.length) return;
      h += '<div class="mp-dgroup">' + (gi === 0 ? "🎨 " : "") + escapeHtml(L(g.ar, g.fr)) + "</div>";
      h += '<div class="mp-swatches">';
      items.forEach(function (p) {
        h += '<button type="button" class="mp-sw' + (design.palette === p.id ? " active" : "") +
          '" data-dpal="' + p.id + '" title="' + escapeHtml(L(p.ar, p.fr)) + '">' +
          '<i style="background:' + p.t + '"></i><b style="background:' + p.soft + '"></b></button>';
      });
      h += "</div>";
    });

    /* الورق */
    h += '<div class="mp-dgroup">📄 ' + L("نمط الورقة", "Motif du papier") + "</div>";
    h += '<div class="mp-papers">';
    PAPERS.forEach(function (p) {
      h += '<button type="button" class="mp-chip' + (design.paper === p.id ? " active" : "") +
        '" data-dpaper="' + p.id + '">' + escapeHtml(L(p.ar, p.fr)) + "</button>";
    });
    h += "</div>";

    /* الخط */
    h += '<div class="mp-dgroup">✒️ ' + L("الخط", "Police") + "</div>";
    h += '<div class="mp-field" style="margin:0"><select data-dfont>';
    FONTS.forEach(function (f) {
      h += '<option value="' + f.id + '"' + (design.font === f.id ? " selected" : "") + ">" + escapeHtml(L(f.ar, f.fr)) + "</option>";
    });
    h += "</select></div>";

    h += '<button type="button" class="mp-dreset" data-dreset>↺ ' + L("إعادة الضبط الافتراضي", "Réinitialiser") + "</button>";
    h += "</div>";
    return h;
  }

  function renderDesignBar() {
    var box = document.querySelector(".mp-design");
    if (box) box.innerHTML = designBarHtml();
  }

  function injectDesignBar() {
    var panel = document.querySelector(".mp-panel");
    if (!panel || panel.querySelector(".mp-design")) return;
    var el = document.createElement("details");
    el.className = "mp-design";
    el.setAttribute("open", "");
    el.setAttribute("data-mp-notranslate", "");
    el.innerHTML = designBarHtml();
    var head = panel.querySelector(".mp-head");
    if (head && head.nextSibling) panel.insertBefore(el, head.nextSibling);
    else if (head) panel.appendChild(el);
    else panel.insertBefore(el, panel.firstChild);
    bindDesignBar(el);
  }

  function bindDesignBar(box) {
    box.addEventListener("click", function (e) {
      var t = e.target.closest("[data-dpal],[data-dpaper],[data-dlang],[data-dreset]");
      if (!t) return;
      if (t.hasAttribute("data-dpal")) setDesign({ palette: t.getAttribute("data-dpal") });
      else if (t.hasAttribute("data-dpaper")) setDesign({ paper: t.getAttribute("data-dpaper") });
      else if (t.hasAttribute("data-dlang")) setDesign({ lang: t.getAttribute("data-dlang") });
      else if (t.hasAttribute("data-dreset")) setDesign({ palette: "blue", paper: "plain", font: "tajawal" });
    });
    box.addEventListener("change", function (e) {
      if (e.target.matches && e.target.matches("[data-dfont]")) setDesign({ font: e.target.value });
    });
  }

  /* ============================================================
     الإقلاع والمراقبة
     ============================================================ */
  function refresh() {
    applyDesign();
    renderDesignBar();
    translateDom(document.body);
  }

  var _busy = false;
  function onMutations() {
    if (_busy) return;
    _busy = true;
    try { applyDesign(); translateDom(document.body); }
    finally { _busy = false; }
  }

  function observe() {
    if (!global.MutationObserver) return;
    var mo = new MutationObserver(function () { onMutations(); });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    var saved = {};
    try { saved = safeParse(localStorage.getItem(DKEY)); } catch (e) { saved = {}; }
    if (saved.palette && PALETTE_MAP[saved.palette]) design.palette = saved.palette;
    if (saved.paper && PAPER_MAP[saved.paper]) design.paper = saved.paper;
    if (saved.font && FONT_MAP[saved.font]) design.font = saved.font;
    if (saved.lang) design.lang = saved.lang;
    injectDesignBar();
    applyDesign();
    translateDom(document.body);
    observe();
  }

  global.MP = {
    KEY: KEY,
    YEAR: YEAR,
    MONTHS: MONTHS,
    getProfile: getProfile,
    setProfile: setProfile,
    bindProfile: bindProfile,
    getState: getState,
    setState: setState,
    escapeHtml: escapeHtml,
    nl2br: nl2br,
    print: print,
    toast: toast,
    formatDate: formatDate,
    today: today,
    fillHeader: fillHeader,
    /* نظام التصميم */
    getDesign: getDesign,
    setDesign: setDesign,
    applyDesign: applyDesign,
    refresh: refresh,
    translateDom: translateDom,
    tr: tr,
    PALETTES: PALETTES,
    PAPERS: PAPERS,
    FONTS: FONTS,
    onDesignChange: null,
    onProfileChange: null
  };
  Object.defineProperty(global.MP, "lang", { get: function () { return design.lang; } });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})(window);
