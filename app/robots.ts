import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mysqlacademy.org";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/auth/callback"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
