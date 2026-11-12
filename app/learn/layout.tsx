import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";

export const metadata: Metadata = {
  title: "Curriculum Dashboard – All 6 Specialized MySQL Tracks",
  description:
    "Explore the complete MySQL Academy curriculum across 6 specialized tracks: Foundations, CRUD Data Manipulation, Aggregations, Relational Joins, Schema Evolution, and ACID Transactions.",
  alternates: {
    canonical: `${siteUrl}/learn`,
  },
  openGraph: {
    title: "MySQL Curriculum Dashboard | MySQL Academy",
    description:
      "Structured learning paths with real-time browser sandbox terminal, scenario blueprints, and syntax speed drills.",
    url: `${siteUrl}/learn`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MySQL Academy - Complete Curriculum Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MySQL Curriculum Dashboard | MySQL Academy",
    description:
      "Structured learning paths with real-time browser sandbox terminal, scenario blueprints, and syntax speed drills.",
    images: ["/opengraph-image"],
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
