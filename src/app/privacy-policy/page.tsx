import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description:
    'كيف يجمع موقع Modaris Pro بياناتك ويحميها: ملفات تعريف الارتباط، Google Analytics، وإعلانات Google AdSense (الأطراف الثالثة)، وحقوقك وفق القانون المغربي 09-08.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyPage() {
  return (
    <main dir="rtl" className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-extrabold text-text">سياسة الخصوصية</h1>
      <p className="text-sm text-slate-500">آخر تحديث: 13 أكتوبر 2026</p>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">1. مقدمة</h2>
        <p className="leading-7 text-slate-600">
          مرحباً بك في منصة <b>Modaris Pro</b> (modarispro.com). نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.
          تشرح هذه السياسة نوع البيانات التي نجمعها، وكيف نستخدمها، ومع مَن قد نشاركها، وحقوقك تجاهها، وذلك وفق
          القانون المغربي <b>09-08</b> المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">2. المسؤول عن المعالجة</h2>
        <p className="leading-7 text-slate-600">
          المسؤول عن معالجة البيانات هو فريق <b>Modaris Pro</b>. لأي سؤال أو طلب متعلق ببياناتك، راسلنا على:{' '}
          <b>contact@modarispro.com</b>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">3. البيانات التي نجمعها</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>
            <b>بيانات تُخزَّن على جهازك فقط:</b> كل ما تدخله في الأدوات (الإعدادات، الأسماء، الملاحظات، التعديلات،
            التوقيتات) يُحفظ محلياً في متصفحك عبر التخزين المحلي (localStorage)، ولا يُرسَل إلى خوادمنا إطلاقاً.
          </li>
          <li>
            <b>بيانات القياس والتحليل:</b> نستخدم Google Analytics لجمع بيانات مجهولة الهوية عن الاستخدام (الصفحات
            المُزارة، مدة الزيارة، نوع المتصفح والجهاز، الدولة) بهدف تحسين الخدمة.
          </li>
          <li>
            <b>بيانات الإعلانات:</b> نستخدم Google AdSense لعرض الإعلانات، وقد تستعمل Google وشركاؤها ملفات تعريف
            الارتباط (Cookies) لعرض إعلانات ملائمة (تفاصيلها في البندين 4 و5).
          </li>
          <li>
            <b>بيانات تتواصل بها معنا طوعاً:</b> إذا راسلتنا عبر البريد أو نموذج التواصل، نحتفظ برسالتك وعنوان بريدك
            للرد عليك فقط.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">4. ملفات تعريف الارتباط (Cookies)</h2>
        <p className="leading-7 text-slate-600">
          ملف ملف تعريف الارتباط هو ملف صغير يُخزَّن في متصفحك. نستخدم الأنواع التالية:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
            <thead className="bg-background text-text">
              <tr>
                <th className="text-right p-3 font-bold border-b border-border">النوع</th>
                <th className="text-right p-3 font-bold border-b border-border">الغرض</th>
                <th className="text-right p-3 font-bold border-b border-border">من يضعها</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              <tr>
                <td className="p-3 border-b border-border">ضرورية</td>
                <td className="p-3 border-b border-border">تشغيل الموقع وحفظ تفضيلاتك محلياً.</td>
                <td className="p-3 border-b border-border">Modaris Pro</td>
              </tr>
              <tr>
                <td className="p-3 border-b border-border">تحليلية</td>
                <td className="p-3 border-b border-border">قياس عدد الزوار وسلوك التصفح لتحسين المحتوى.</td>
                <td className="p-3 border-b border-border">Google Analytics</td>
              </tr>
              <tr>
                <td className="p-3">إعلانية</td>
                <td className="p-3">عرض إعلانات ملائمة وقياس أدائها.</td>
                <td className="p-3">Google AdSense وشركاؤها</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="leading-7 text-slate-600">
          يمكنك في أي وقت حذف ملفات تعريف الارتباط أو تعطيلها من إعدادات متصفحك، مع العلم أن ذلك قد يؤثر على بعض
          وظائف الموقع.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">5. الإعلانات والأطراف الثالثة (Google AdSense)</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>
            نعرض الإعلانات عبر خدمة <b>Google AdSense</b>. وتستعمل Google، بصفتها مورّداً خارجياً، ملفات تعريف
            الارتباط لعرض إعلانات بناءً على زياراتك السابقة لموقعنا أو لمواقع أخرى.
          </li>
          <li>
            يتيح استعمال Google لكوكيز الإعلانات (ومنها <b>DART cookie</b>) عرض إعلانات ملائمة لمستخدمي موقعنا
            والمواقع الأخرى، بناءً على زياراتهم.
          </li>
          <li>
            قد تضع <b>مورّدون خارجيون آخرون</b> (شبكات إعلانية معتمدة من Google) وشبكات المحتوى الإعلاني ملفات تعريف
            ارتباط خاصة بهم لقياس أداء الحملات، ولا نتحكم نحن في محتوى هذه الملفات.
          </li>
          <li>
            <b>للتحكم في الإعلانات المخصصة أو تعطيلها:</b>
            <ul className="list-disc pr-6 mt-2 space-y-1">
              <li>
                إعدادات إعلانات Google:{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  adssettings.google.com
                </a>
              </li>
              <li>
                إلغاء الاشتراك لدى مبادرة الإعلانات الرقمية:{' '}
                <a href="https://www.aboutads.info/choices" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  www.aboutads.info/choices
                </a>
              </li>
              <li>
                للمستخدمين في أوروبا:{' '}
                <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  www.youronlinechoices.com
                </a>
              </li>
              <li>
                تعطيل قياس Google Analytics:{' '}
                <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                  إضافة المتصفح الرسمية
                </a>
              </li>
            </ul>
          </li>
          <li>
            مزيد من التفاصيل حول كيفية استعمال Google للبيانات في المواقع الشريكة:{' '}
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              policies.google.com/technologies/partner-sites
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">6. كيف نستخدم البيانات</h2>
        <ul className="list-disc pr-6 space-y-2 leading-7 text-slate-600">
          <li>تحسين أداء المنصة وتطوير أدواتها التعليمية.</li>
          <li>فهم احتياجات الأساتذة وتقديم محتوى أكثر ملاءمة.</li>
          <li>قياس مدى استخدام الأدوات والميزات المختلفة.</li>
          <li>عرض الإعلانات التي تمول استمرار الخدمة المجانية.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">7. مشاركة البيانات</h2>
        <p className="leading-7 text-slate-600">
          لا نبيع ولا نؤجر بياناتك الشخصية. قد تُشارك بيانات مجهولة الهوية فقط مع مزوّدي الخدمات (مثل Google
          Analytics وGoogle AdSense) لتشغيل الموقع، أو عند وجود التزام قانوني يفرض ذلك.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">8. مدة الاحتفاظ بالبيانات</h2>
        <p className="leading-7 text-slate-600">
          بيانات الأدوات تبقى على جهازك وحدك إلى أن تحذفها. أما بيانات التواصل (الرسائل) فتُحفظ للمدة اللازمة للرد
          ومعالجة الطلب، ثم تُحذف.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">9. حقوقك</h2>
        <p className="leading-7 text-slate-600">
          وفق القانون 09-08، لك الحق في الوصول إلى بياناتك وتصحيحها وحذفها والاعتراض على معالجتها. لممارسة هذه
          الحقوق راسلنا على <b>contact@modarispro.com</b>. كما يمكنك تقديم شكاية إلى اللجنة الوطنية لمراقبة حماية
          المعطيات ذات الطابع الشخصي (CNDP) عبر موقعها:{' '}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            www.cndp.ma
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">10. حماية بيانات الأطفال</h2>
        <p className="leading-7 text-slate-600">
          خدماتنا موجهة للأساتذة والمهنيين في قطاع التعليم، وليست موجهة للأطفال دون 18 سنة. لا نجمع عن علم أي بيانات
          تخص الأطفال.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">11. أمن البيانات</h2>
        <p className="leading-7 text-slate-600">
          نعتمد بروتوكول HTTPS لتشفير الاتصال بين متصفحك وخوادمنا، ونراجع ممارساتنا الأمنية باستمرار لحماية بياناتك
          من الوصول غير المصرح به.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">12. التعديلات على هذه السياسة</h2>
        <p className="leading-7 text-slate-600">
          قد نُحدِّث هذه السياسة من حين لآخر. سيُنشر أي تعديل في هذه الصفحة مع تحديث تاريخ «آخر تحديث». استمرارك في
          استخدام الموقع يعني قبولك بالنسخة المحدَّثة.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-extrabold text-text">13. اتصل بنا</h2>
        <p className="leading-7 text-slate-600">
          لأي سؤال حول هذه السياسة أو ممارسة حقوقك، راسلنا على: <b>contact@modarispro.com</b>
        </p>
      </section>
    </main>
  );
}
