import { prisma } from '@/lib/prisma';
import { createResource, deleteResource } from './actions';
import { Plus, Trash2, FileText } from 'lucide-react';

export default async function AdminResourcesPage() {
  // 1. جلب كل الموارد (وليس مورد واحد)
  const resources = await prisma.resource.findMany({
    include: { level: true, subject: true },
    orderBy: { createdAt: 'desc' },
  });

  // 2. جلب المستويات والمواد للقوائم المنسدلة
  const levels = await prisma.level.findMany();
  const subjects = await prisma.subject.findMany();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-text flex items-center gap-2">
          <FileText className="w-7 h-7 text-primary" />
          إدارة الموارد التعليمية
        </h1>
      </div>

      {/* ===== قسم إضافة مورد جديد ===== */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-accent" />
          إضافة مورد جديد
        </h2>
        
        {/* ملاحظة: encType="multipart/form-data" ضروري جداً لرفع الملفات */}
        <form action={createResource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">عنوان المورد *</label>
            <input name="title" required placeholder="مثال: جذاذة الرياضيات - الأعداد" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">الرابط (Slug) * <span className="text-xs font-normal text-slate-400">(بالإنجليزية وبدون مسافات)</span></label>
            <input name="slug" required placeholder="math-grade-4-numbers" className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">المستوى *</label>
            <select name="levelId" required className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">اختر المستوى...</option>
              {levels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">المادة *</label>
            <select name="subjectId" required className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="">اختر المادة...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">صيغة الملف</label>
            <select name="fileType" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none">
              <option value="PDF">PDF</option>
              <option value="Word">Word</option>
              <option value="Excel">Excel</option>
              <option value="PowerPoint">PowerPoint</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">الوصف</label>
            <textarea name="description" rows={2} placeholder="وصف مختصر للمورد..." className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"></textarea>
          </div>

          {/* حقل رفع الملف الحقيقي */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-600 mb-1">ملف المورد * <span className="text-xs font-normal text-slate-400">(PDF, Word, Excel, PowerPoint)</span></label>
            <input 
              type="file" 
              name="file" 
              required 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90" 
            />
          </div>

          <div className="md:col-span-2">
            <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              إضافة المورد
            </button>
          </div>
        </form>
      </div>

      {/* ===== جدول الموارد الحالية ===== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-text">الموارد الموجودة ({resources.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-600 font-bold">
              <tr>
                <th className="px-6 py-3">العنوان</th>
                <th className="px-6 py-3">المستوى</th>
                <th className="px-6 py-3">المادة</th>
                <th className="px-6 py-3">الصيغة</th>
                <th className="px-6 py-3">التحميلات</th>
                <th className="px-6 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {resources.map((resource) => (
                <tr key={resource.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-text">{resource.title}</td>
                  <td className="px-6 py-4 text-slate-600">{resource.level.name}</td>
                  <td className="px-6 py-4 text-slate-600">{resource.subject.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono">
                      {resource.fileType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{resource.downloads}</td>
                  <td className="px-6 py-4">
                    <form action={deleteResource}>
                      <input type="hidden" name="id" value={resource.id} />
                      <button type="submit" className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    لا توجد موارد حالياً. أضف أول مورد من النموذج أعلاه!
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