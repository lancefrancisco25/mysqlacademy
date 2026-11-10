import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090a0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MySQL Academy – Learn MySQL by Writing Real Queries in Browser",
    template: "%s | MySQL Academy",
  },
  description:
    "Interactive in-browser MySQL database curriculum. Practice relational algebra, schema normalization, CRUD operations, joins, subqueries, ACID transactions, and index optimization with real-time automated grading.",
  keywords: [
    "MySQL tutorial",
    "learn SQL online",
    "interactive SQL terminal",
    "SQL exercises with feedback",
    "relational database course",
    "database normalization 1NF 2NF 3NF",
    "SQL joins and subqueries",
    "SQL views tutorial",
    "ACID transactions practice",
    "MySQL index optimization",
  ],
  authors: [{ name: "MySQL Academy Team" }],
  creator: "MySQL Academy",
  publisher: "MySQL Academy",
  category: "Technology / Education",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "MySQL Academy",
    title: "MySQL Academy – Free Interactive MySQL Sandbox & Tutorials",
    description:
      "Master relational database engineering with instant query execution, automated syntax validation, and production-grade scenario blueprints. No setup required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MySQL Academy - Interactive SQL Sandbox & Curriculum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MySQL Academy – Learn MySQL by Writing Real Queries",
    description:
      "Interactive in-browser database curriculum with instant feedback, ACID sandbox, and comprehensive SQL tracks.",
    images: ["/og-image.png"],
    creator: "@mysqlacademy",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "MySQL Academy",
      url: siteUrl,
      logo: `${siteUrl}/favicon.ico`,
      description:
        "Free interactive educational platform for learning MySQL, relational database architecture, and SQL query optimization.",
      sameAs: ["https://github.com/mysql-academy"],
    },
    {
      "@type": "Course",
      "@id": `${siteUrl}/#course`,
      name: "Complete Relational Database & MySQL Engineering Curriculum",
      description:
        "From foundational DDL table definitions to ACID transactions, relational algebra, and index query optimization.",
      provider: {
        "@type": "Organization",
        name: "MySQL Academy",
        sameAs: siteUrl,
      },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT20H",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        category: "Free",
      },
      educationalCredentialAwarded: "MySQL Academy Certificate of Mastery",
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="h-full bg-background text-foreground antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
