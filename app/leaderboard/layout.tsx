import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Leaderboard | MySQL Academy",
  description:
    "View student rankings, weekly learning streaks, completed lab tasks, and SQL mastery scores across the MySQL Academy cohort.",
  openGraph: {
    title: "Student Leaderboard | MySQL Academy",
    description:
      "Public cohort rankings and mastery scores for MySQL Academy students.",
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
