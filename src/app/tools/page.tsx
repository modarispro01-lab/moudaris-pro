import Link from 'next/link';
import { FileText, Calendar, Users, Printer, Sparkles, ArrowRight } from 'lucide-react';
import type { Metadata } from "next";

// ===== Meta Tags للـ SEO =====
export const metadata: Metadata = {
  title: "أدوات الأستاذ الرقمية",
  description:
    "أدوات ذكية ومجانية للأستاذ المغربي: مولد المذكرة اليومية، مولد استعمال الزمن، مولد شواهد التقدير، والمزيد.",
  keywords: [
    "أدوات الأستاذ",
    "مولد المذكرة اليومية",
    "استعمال الزمن",
    "شواهد التقدير",
    "أدوات تعليمية",
    "المغرب",
  ],
};

// ===== قائمة الأدوات =====
const tools = [
  {
    id: 'daily-lesson-plan',
    title: 'مولد المذكرة اليومية',
    description: 'أنشئ مذكرة درس احترافية وجاهزة للطباعة في دقائق معدودة.',
    icon: FileText,
    color: 'bg-primary',
    status: 'متاح الآن',
  },
  {
    id: 'schedule',
    title: 'مولد استعمال الزمن',
    description: 'نظم حصصك الأسبوعية بسهولة مع قوالب جاهزة.',
    icon: Calendar,
    color: 'bg-secondary',
    status: 'قريباً',
  },
  {
    id: 'certificates',
    title: 'مولد شواهد التقدير',
    description: 'صمم شواهد تفوق وتقدير للتلاميذ بشكل أنيق.',
    icon: Users,
    color: 'bg-accent',
    status: 'قريباً',
  },
  {
    id: 'ai-generator',
    title: 'مولد الجذاذات بالذكاء الاصطناعي',
    description: 'دع الذكاء الاصطناعي يقترح عليك أنشطة وأهدافاً للدرس.',
    icon: Sparkles,
    color: 'bg-purple-600',
    status: 'قريباً',
  },
];

// ===== المكون الرئيسي للصفحة =====
export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ===== الهيدر ===== */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            أدوات الأستاذ الرقمية
          </h1>
          <p className="text-white/80 text-base">
            أدوات ذكية ومجانية لتوفير وقتك وتنظيم عملك اليومي
          </p>
        </div>
      </section>

      {/* ===== شبكة الأدوات ===== */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`relative rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${
                tool.status === 'قريباً' ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer group'
              }`}
            >
              {tool.status === 'متاح الآن' ? (
                <Link href={`/tools/${tool.id}`} className="absolute inset-0 z-10" />
              ) : null}
              
              <div className={`w-12 h-12 rounded-xl ${tool.color} text-white flex items-center justify-center mb-4`}>
                <tool.icon className="w-6 h-6" />
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-extrabold text-text">{tool.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  tool.status === 'متاح الآن' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {tool.status}
                </span>
              </div>
              
              <p className="text-sm text-muted mb-4">{tool.description}</p>
              
              {tool.status === 'متاح الآن' && (
                <div className="flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
                  استخدم الأداة <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}