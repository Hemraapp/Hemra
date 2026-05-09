import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hemra",
    template: "%s | Hemra"
  },
  description: "Hemra hjelper førstegangskjøpere å forstå kjøpekraft, hovedbrems og realistiske steg mot boligkjøp.",
  applicationName: "Hemra",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/hemra-icon.svg",
    shortcut: "/hemra-icon.svg",
    apple: "/hemra-icon.svg"
  },
  openGraph: {
    title: "Hemra",
    description: "Forstå hvor nær du er, hva som stopper deg og hva som hjelper mest.",
    siteName: "Hemra",
    locale: "nb_NO",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

