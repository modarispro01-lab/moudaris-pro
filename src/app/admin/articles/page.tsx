import { prisma } from '@/lib/prisma';
import { createArticle, deleteArticle } from './actions';
import { Plus, Trash2, Newspaper } from 'lucide-react';

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          <Newspaper className="w-7 h-7 text-primary" />
          إدارة المستجدات والأخبار
        </h1>
      </div>

      {/* ===== نموذج إضافة مقال جديد ===== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          نشر خبر جديد
        </h2>
        
        <form action={createArticle} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">عنوان الخبر *</label>
            <input name="title" required placeholder="مثال: مذكرة وزارية بخصوص الدخول المدرسي" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">الرابط (Slug) * <span className="text-xs font-normal text-slate-400">(بالإنجليزية وبدون مسافات)</span></label>
            <input name="slug" required placeholder="mudhakkara-dakhoul-madrasi-2024" className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">التصنيف *</label>
            <select name="category" required className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">اختر التصنيف...</option>
              <option value="مذكرة">مذكرة وزارية</option>
              <option value="بلاغ">بلاغ</option>
              <option value="إعلان">إعلان</option>
              <option value="نتائج">نتائج</option>
              <option value="مباراة">مباراة</option>
              <option value="ترقية">ترقية</option>
              <option value="حركة انتقالية">حركة انتقالية</option>
              <option value="توظيف">توظيف</option>
              <option value="مدارس الريادة">مدارس الريادة</option>
              <option value="مستجدات الوزارة">مستجدات الوزارة</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">محتوى الخبر *</label>
            <textarea name="content" required rows={6} placeholder="اكتب محتوى الخبر هنا..." className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"></textarea>
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              نشر الخبر
            </button>
          </div>
        </form>
      </div>

      {/* ===== جدول الأخبار الحالية ===== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-text">الأخبار المنشورة ({articles.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-3">العنوان</th>
                <th className="px-6 py-3">التصنيف</th>
                <th className="px-6 py-3">تاريخ النشر</th>
                <th className="px-6 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{article.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                      {article.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(article.publishedAt).toLocaleDateString('ar-MA')}
                  </td>
                  <td className="px-6 py-4">
                    <form action={deleteArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    لا توجد أخبار حالياً. انشر أول خبر من النموذج أعلاه!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}