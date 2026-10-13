import ShareButtons from "@/components/ShareButtons";

/**
 * إطار موحّد لكل صفحات الأدوات:
 * يحجز المساحة المتبقية من الشاشة بعد الهيدر (100dvh - 4rem) ويملأها بالتطبيق،
 * فيعمل بشكل سليم على الهاتف والحاسوب دون تمرير مزدوج أو ارتفاع مقطوع.
 */
export default function ToolFrame({
  src,
  title,
  allow,
}: {
  src: string;
  title: string;
  allow?: string;
}) {
  return (
    <div
      className="flex w-full flex-col"
      style={{ height: "calc(100dvh - 4rem)", minHeight: "70vh" }}
    >
      <div className="shrink-0 border-b border-border bg-white shadow-sm">
        <ShareButtons />
      </div>
      <iframe
        src={src}
        title={title}
        allow={allow}
        className="block w-full flex-1 border-0 bg-white"
      />
    </div>
  );
}
