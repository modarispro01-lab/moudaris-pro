import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 grid gap-8 md:grid-cols-4 text-center md:text-right">
        {/* العمود 1: الشعار والوصف */}
        <div>
          <h3 className="text-xl font-extrabold mb-3">
            Modaris<span className="text-accent"> Pro</span>
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
            كل أدوات الأستاذ المغربي في مكان واحد — موارد، مذكرات، وأدوات الدعم المكثف.
          </p>
        </div>

        {/* العمود 2: روابط سريعة */}
        <div>
          <h4 className="font-bold mb-3 text-accent">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/tools/daily-lesson-plan" className="hover:text-white transition-colors">
                📘 المذكرة اليومية
              </Link>
            </li>
            <li>
              <Link href="/resources" className="hover:text-white transition-colors">
                📚 الموارد
              </Link>
            </li>
            <li>
              <Link href="/tools" className="hover:text-white transition-colors">
                🛠️ الأدوات
              </Link>
            </li>
            <li>
              <Link href="/actualites" className="hover:text-white transition-colors">
                📰 المستجدات
              </Link>
            </li>
          </ul>
        </div>

        {/* العمود 3: روابط قانونية (شرط أدسنس) */}
        <div>
          <h4 className="font-bold mb-3 text-accent">معلومات قانونية</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                اتصل بنا
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                شروط الاستخدام
              </Link>
            </li>
          </ul>
        </div>

        {/* العمود 4: تواصل */}
        <div>
          <h4 className="font-bold mb-3 text-accent">تواصل معنا</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li dir="ltr" className="text-right">
              <a href="mailto:contact@modarispro.com" className="hover:text-white transition-colors">
                ✉️ contact@modarispro.com
              </a>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                💬 نموذج التواصل
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* شريط حقوق النشر */}
      <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/50">
        <p>© {currentYear} <span className="font-bold text-white/80">Modaris Pro</span> — جميع الحقوق محفوظة.</p>
        <p className="mt-1 text-white/40">
          منصة تعليمية مغربية لخدمة أساتذة التعليم الابتدائي 🇲🇦
        </p>
      </div>
    </footer>
  );
}