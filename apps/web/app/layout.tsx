import "./globals.css";
import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: "PuckTree",
  description: "Follow every branch of a hockey trade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
