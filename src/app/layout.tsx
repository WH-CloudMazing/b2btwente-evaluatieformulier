import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Evaluatieformulier Gasten | B2B Twente",
  description:
    "Evaluatieformulier voor gasten van B2B Twente - resultaatgericht netwerken",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${roboto.variable} antialiased`}>{children}</body>
    </html>
  );
}
