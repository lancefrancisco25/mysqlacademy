import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "In-Browser MySQL Sandbox | MySQL Academy",
  description:
    "Interactive client-side MySQL sandbox running on WebAssembly. Test queries, create tables, and experiment with zero backend network requests. All changes persist in your browser.",
  openGraph: {
    title: "In-Browser MySQL Sandbox | MySQL Academy",
    description:
      "Client-side MySQL sandbox with live schema introspection and local persistence.",
  },
};

export default function SqlSandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
