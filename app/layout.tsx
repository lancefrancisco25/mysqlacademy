import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "MySQL Academy – Interactive In-Browser Relational Labs",
  description:
    "Hands-on, terminal-driven interactive educational platform for learning MySQL, powered by in-memory WebAssembly SQL and autonomous pedagogical AI agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
