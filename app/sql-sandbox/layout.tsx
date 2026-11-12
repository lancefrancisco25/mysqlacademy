import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";

export const metadata: Metadata = {
  title: "In-Browser MySQL Sandbox | MySQL Academy",
  description:
    "Interactive client-side MySQL sandbox running on WebAssembly. Test queries, create tables, and experiment with zero backend network requests. All changes persist in your browser.",
  alternates: {
    canonical: `${siteUrl}/sql-sandbox`,
  },
  openGraph: {
    title: "In-Browser MySQL Sandbox | MySQL Academy",
    description:
      "Client-side MySQL sandbox with live schema introspection and local persistence.",
    url: `${siteUrl}/sql-sandbox`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MySQL Academy - In-Browser SQL Terminal Sandbox",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "In-Browser MySQL Sandbox | MySQL Academy",
    description:
      "Client-side MySQL sandbox with live schema introspection and local persistence.",
    images: ["/opengraph-image"],
  },
};

export default function SqlSandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
