import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskEngine — Pay-Per-Task AI Agents for Business Operations",
  description:
    "Launch AI task agents for lead research, SEO content, competitor analysis, and workflow automation. Flat ₹1,500 per task with inbox delivery and no subscriptions.",
  metadataBase: new URL("https://taskengine.software"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TaskEngine — Pay-Per-Task AI Operations",
    description: "Hire specialized AI task agents for business operations. Flat ₹1,500 per execution, delivered to your inbox.",
    url: "https://taskengine.software",
    siteName: "TaskEngine",
    images: ["/og-image.png"], // create a 1200x630 image and place in /public
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskEngine — Pay-Per-Task AI Operations",
    description: "Pay-per-task AI agents for business operators. No subscriptions.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}

        {/* JSON-LD structured data — helps Google & AI search engines understand the service */}
        <Script id="ld-json-service" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "TaskEngine",
            description:
              "On-demand AI agents for B2B lead generation, content writing, SEO competitor analysis, and workflow automation.",
            provider: {
              "@type": "Organization",
              name: "TaskEngine",
              email: "support@taskengine.software",
              url: "https://taskengine.software",
            },
            areaServed: "IN",
            offers: {
              "@type": "Offer",
              price: "1500",
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
            },
          })}
        </Script>

        {/* FAQPage structured data — pulls FAQs into Google rich results */}
        <Script id="ld-json-faq" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does it take to get my results?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most tasks are delivered to your inbox within 30-60 minutes of a successful payment.",
                },
              },
              {
                "@type": "Question",
                name: "Is TaskEngine a subscription?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. Every task is a single flat-fee payment of ₹1,500 with no recurring charges.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to give TaskEngine access to my accounts or data?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. You provide written instructions and an email address — no API keys, credentials, or database access required.",
                },
              },
            ],
          })}
        </Script>
      </body>
    </html>
  );
}