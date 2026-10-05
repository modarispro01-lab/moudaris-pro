export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://modarispro.com/#org",
        name: "Modaris Pro",
        url: "https://modarispro.com",
        email: "contact@modarispro.com",
      },
      {
        "@type": "WebSite",
        "@id": "https://modarispro.com/#website",
        url: "https://modarispro.com",
        name: "Modaris Pro",
        inLanguage: "ar",
        publisher: { "@id": "https://modarispro.com/#org" },
      },
      {
        "@type": "WebApplication",
        "@id": "https://modarispro.com/tools/daily-lesson-plan#app",
        name: "المذكرة اليومية للدعم المكثف",
        url: "https://modarispro.com/tools/daily-lesson-plan",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        inLanguage: "ar",
        isPartOf: { "@id": "https://modarispro.com/#website" },
        offers: { "@type": "Offer", price: "0", priceCurrency: "MAD" },
        audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}