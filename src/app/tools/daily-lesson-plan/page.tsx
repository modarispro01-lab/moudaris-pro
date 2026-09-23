'use client'; // هذا المكون تفاعلي (Client Component) لأنه يستخدم state و window.print

import { useState, useRef } from 'react';
import { Printer, Save, FileText, Calendar, Clock, BookOpen, Target, ListChecks, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function DailyLessonPlanGenerator() {
  const [formData, setFormData] = useState({
    school: 'مدرسة الرائدة',
    teacher: 'الأستاذ(ة)',
    level: 'الرابع ابتدائي',
    subject: 'اللغة العربية',
    title: 'أقرأ وأكتشف',
    date: new Date().toISOString().split('T')[0],
    duration: 'ساعة واحدة',
    objectives: '- أن يتعرف التلميذ على...\n- أن يتمكن من...',
    steps: '1. التمهيد: ...\n2. العرض: ...\n3. التطبيق: ...\n4. التقويم: ...',
  });

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* شريط التنقل */}
      <div className="bg-surface border-b border-border print:hidden">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-2 text-sm text-muted">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <Link href="/tools" className="hover:text-primary transition-colors">الأدوات</Link>
          <ArrowRight className="w-3 h-3 rotate-180" />
          <span className="text-text font-bold">مولد المذكرة اليومية</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 print:p-0">
        <div className="grid lg:grid-cols-2 gap-8 print:block">
          
          {/* ===== النموذج (يختفي عند الطباعة) ===== */}
          <div className="bg-surface p-6 rounded-2xl border border-border print:hidden">
            <h2 className="text-xl font-extrabold text-primary mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-accent" />
              بيانات المذكرة
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">المؤسسة</label>
                  <input type="text" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">الأستاذ(ة)</label>
                  <input type="text" value={formData.teacher} onChange={(e) => setFormData({...formData, teacher: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">المستوى</label>
                  <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option>الأول ابتدائي</option>
                    <option>الثاني ابتدائي</option>
                    <option>الثالث ابتدائي</option>
                    <option>الرابع ابتدائي</option>
                    <option>الخامس ابتدائي</option>
                    <option>السادس ابتدائي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">المادة</label>
                  <select value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option>اللغة العربية</option>
                    <option>اللغة الفرنسية</option>
                    <option>الرياضيات</option>
                    <option>النشاط العلمي</option>
                    <option>التربية الإسلامية</option>
                    <option>الاجتماعيات</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">عنوان الدرس</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">التاريخ</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">المدة الزمنية</label>
                  <input type="text" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">الأهداف التعلمية</label>
                <textarea rows={3} value={formData.objectives} onChange={(e) => setFormData({...formData, objectives: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="- أن يتعرف التلميذ على..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">مراحل الدرس (التمهيد، العرض، التطبيق، التقويم)</label>
                <textarea rows={5} value={formData.steps} onChange={(e) => setFormData({...formData, steps: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="1. التمهيد: ..."></textarea>
              </div>

              <button onClick={handlePrint} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-all hover:bg-primary/90 hover:shadow-lg">
                <Printer className="w-5 h-5" />
                طباعة / حفظ كـ PDF
              </button>
            </div>
          </div>

          {/* ===== المعاينة (تظهر عند الطباعة) ===== */}
          <div className="print:w-full print:max-w-none">
            <div className="sticky top-24 print:static">
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h2 className="text-xl font-extrabold text-text">معاينة المذكرة</h2>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm hover:bg-background print:hidden">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
              </div>

              <div ref={printRef} className="bg-white p-8 md:p-12 rounded-2xl border border-border shadow-sm print:shadow-none print:border-none print:p-0">
                {/* رأس المذكرة الرسمي */}
                <div className="text-center border-b-2 border-primary pb-6 mb-8">
                  <h1 className="text-2xl font-extrabold text-primary mb-2">المذكرة اليومية</h1>
                  <p className="text-muted text-sm">المملكة المغربية - وزارة التربية الوطنية</p>
                </div>

                {/* جدول المعلومات الأساسية */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> المؤسسة:</span>
                    <span className="font-bold text-text">{formData.school}</span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> التاريخ:</span>
                    <span className="font-bold text-text">{formData.date}</span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> المستوى:</span>
                    <span className="font-bold text-text">{formData.level}</span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> المدة:</span>
                    <span className="font-bold text-text">{formData.duration}</span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> المادة:</span>
                    <span className="font-bold text-text">{formData.subject}</span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border">
                    <span className="text-muted block text-xs mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> الأستاذ(ة):</span>
                    <span className="font-bold text-text">{formData.teacher}</span>
                  </div>
                </div>

                {/* عنوان الدرس */}
                <div className="mb-8">
                  <h2 className="text-lg font-extrabold text-primary mb-2 flex items-center gap-2">
                    <span className="w-2 h-6 bg-accent rounded-full"></span>
                    عنوان الدرس: {formData.title}
                  </h2>
                </div>

                {/* الأهداف */}
                <div className="mb-8 p-4 border border-border rounded-lg bg-background/50">
                  <h3 className="font-bold text-text mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-accent" /> الأهداف التعلمية:
                  </h3>
                  <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{formData.objectives}</p>
                </div>

                {/* المراحل */}
                <div className="mb-8">
                  <h3 className="font-bold text-text mb-3 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-accent" /> مراحل سير الدرس:
                  </h3>
                  <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">{formData.steps}</p>
                </div>

                {/* تذييل المذكرة */}
                <div className="mt-12 pt-6 border-t border-border flex justify-between text-sm text-muted">
                  <div>
                    <p className="font-bold text-text mb-1">توقيع الأستاذ(ة):</p>
                    <p className="text-xs">....................</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-text mb-1">ملاحظات المفتش/المدير:</p>
                    <p className="text-xs">....................</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}