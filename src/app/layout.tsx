import "@fontsource-variable/manrope";
import "./globals.css";
import "./brand-theme.css";

import type { Metadata } from "next";
import { LocaleProvider } from "@/components/locale-provider";

export const metadata: Metadata = {
  title: "ORTA Studio — Industrial Packaging & Graphic Design",
  description:
    "Industrial food packaging, labels and print-ready artwork built for real manufacturing.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
