import { prisma } from '@/lib/prisma';
import { FileText, Download, Eye, Users } from 'lucide-react';

export default async function AdminDashboard() {
  // جلب الإحصائيات من قاعدة البيانات
  const totalResources = await prisma.resource.count();
  const totalArticles = await prisma.article.count();
  
  const downloadsData = await prisma.resource.aggregate({
    _sum: { downloads: true },
  });
  const totalDownloads = downloadsData._sum.downloads || 0;

  const viewsData = await prisma.resource.aggregate({
    _sum: { views: true },
  });
  const totalViews = viewsData._sum.views || 0;

  const stats = [
    { title: 'إجمالي الموارد', value: totalResources, icon: FileText, color: 'bg-blue-500' },
    { title: 'إجمالي التحميلات', value: totalDownloads, icon: Download, color: 'bg-green-500' },
    { title: 'إجمالي المشاهدات', value: totalViews, icon: Eye, color: 'bg-purple-500' },
    { title: 'المستجدات والأخبار', value: totalArticles, icon: Users, color: 'bg-accent' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-text mb-8">نظرة عامة على المنصة</h1>
      
      {/* شبكة الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.color} text-white flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-bold">{stat.title}</p>
              <p className="text-2xl font-extrabold text-text">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* قسم سريع للإجراءات */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-extrabold text-text mb-4">إجراءات سريعة</h2>
        <div className="flex gap-4">
          <a href="/admin/resources" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
            + إضافة مورد جديد
          </a>
          <a href="/admin/articles" className="px-4 py-2 bg-surface border border-border text-text rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors">
            + نشر خبر جديد
          </a>
        </div>
      </div>
    </div>
  );
}