import { MetadataRoute } from "next";
import { LESSONS } from "@/lib/lessons";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/sql-sandbox`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
  ];

  const lessonRoutes: MetadataRoute.Sitemap = LESSONS.map((lesson) => ({
    url: `${baseUrl}/learn/${lesson.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...lessonRoutes];
}
