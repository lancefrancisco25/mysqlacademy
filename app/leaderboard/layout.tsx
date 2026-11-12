import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";

export const metadata: Metadata = {
  title: "Student Cohort Standings & Leaderboard",
  description:
    "Compare learning milestones, lab completions, and query mastery points across enrolled students at MySQL Academy.",
  alternates: {
    canonical: `${siteUrl}/leaderboard`,
  },
  openGraph: {
    title: "Student Cohort Standings & Leaderboard | MySQL Academy",
    description:
      "Public cohort rankings, weekly streaks, and SQL mastery points for MySQL Academy students.",
    url: `${siteUrl}/leaderboard`,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MySQL Academy - Student Leaderboard & Standings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Cohort Standings & Leaderboard | MySQL Academy",
    description:
      "Public cohort rankings, weekly streaks, and SQL mastery points for MySQL Academy students.",
    images: ["/opengraph-image"],
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
