import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-10 mt-auto">
      <div className="mx-auto max-w-7xl px-4 grid gap-8 md:grid-cols-3 text-center md:text-right">
        <div>
          <h3 className="text-xl font-extrabold mb-3">
            Moudaris<span className="text-accent">Pro</span>
          </h3>
          <p className="text-sm leading-relaxed text-white/70">
            كل أدوات الأستاذ في مكان واحد: موارد تعليمية، أدوات رقمية، وثائق جاهزة ومستجدات تربوية.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-accent">روابط سريعة</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link href="/resources" className="hover:text-white transition-colors">الموارد التعليمية</Link></li>
            <li><Link href="/tools" className="hover:text-white transition-colors">أدوات الأستاذ</Link></li>
            <li><Link href="/actualites" className="hover:text-white transition-colors">المستجدات التربوية</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-accent">تواصل معنا</h4>
          <p className="text-sm text-white/70">support@moudarispro.ma</p>
        </div>
      </div>
      <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} MoudarisPro — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}