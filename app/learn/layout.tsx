import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curriculum Dashboard – All 6 Specialized MySQL Tracks",
  description:
    "Explore the complete MySQL Academy curriculum across 6 specialized tracks: Foundations, CRUD Data Manipulation, Aggregations, Relational Joins, Schema Evolution, and ACID Transactions.",
  openGraph: {
    title: "MySQL Curriculum Dashboard | MySQL Academy",
    description:
      "Structured learning paths with real-time browser sandbox terminal, scenario blueprints, and syntax speed drills.",
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
