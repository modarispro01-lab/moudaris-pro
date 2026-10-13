/* ============================================================
   Modaris Pro — Toolkit JS مشترك
   - ملف الأستاذ المشترك (localStorage): عبّئ مرّة، تظهر في كل وثيقة
   - أدوات مساعدة: طباعة، تنبيه، تنسيق، هروب HTML
   ============================================================ */
(function (global) {
  "use strict";

  var KEY = "mp_teacher_profile_v1";
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

  function safeParse(s) {
    try { return JSON.parse(s); } catch (e) { return {}; }
  }

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
    onProfileChange: null
  };
})(window);
