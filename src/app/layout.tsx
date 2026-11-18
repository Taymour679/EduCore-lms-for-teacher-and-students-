
import type { Metadata } from "next";

import { OfflineBanner } from "@/components/shell/offline-banner";
import { ToastProvider } from "@/components/ui/feedback";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduCore",
  description: "Learning that shows you what to revise next.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
  <body className="font-sans" suppressHydrationWarning>
        <ToastProvider>
          <OfflineBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
