import type { Metadata } from "next";
import { getLessonBySlug, getTrackForLesson } from "@/lib/lessons";

interface LessonLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const lesson = getLessonBySlug(params.slug);
  const track = getTrackForLesson(params.slug);

  if (!lesson) {
    return {
      title: "Lesson Workspace",
      description: "Interactive MySQL lesson workspace and live database terminal.",
    };
  }

  const title = `${lesson.title} – ${track ? track.title : "MySQL Tutorial"}`;
  const description = `${lesson.description} Practice live queries in the in-memory terminal with instant feedback, situational syntax drills, and real-world scenario blueprints.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";
  const canonicalUrl = `${siteUrl}/learn/${lesson.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function LessonSlugLayout({ children }: LessonLayoutProps) {
  return <>{children}</>;
}
