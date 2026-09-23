import Link from 'next/link';
import { LayoutDashboard, FileText, Newspaper, Settings, LogOut, Home } from 'lucide-react';

const menuItems = [
  { name: 'نظرة عامة', href: '/admin', icon: LayoutDashboard },
  { name: 'إدارة الموارد', href: '/admin/resources', icon: FileText },
  { name: 'المستجدات والأخبار', href: '/admin/articles', icon: Newspaper },
  { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex" dir="rtl">
      {/* القائمة الجانبية */}
      <aside className="w-64 bg-primary text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span className="text-accent">Moudaris</span>Pro
            <span className="text-xs bg-accent text-primary px-2 py-0.5 rounded-full">Admin</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white/80 hover:bg-white/10 transition-all">
            <Home className="w-5 h-5" />
            العودة للموقع
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-300 hover:bg-red-500/20 transition-all mt-2">
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}