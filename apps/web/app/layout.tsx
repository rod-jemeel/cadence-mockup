import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const fkGrotesk = localFont({
  src: [
    {
      path: "../public/Fonts/FKGroteskTrial-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Fonts/FKGroteskTrial-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/Fonts/FKGroteskTrial-Bold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/Fonts/FKGroteskTrial-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-fk-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Email Cadence Assessment",
  description: "Build and manage email cadence workflows with Temporal.io",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fkGrotesk.className} ${fkGrotesk.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
