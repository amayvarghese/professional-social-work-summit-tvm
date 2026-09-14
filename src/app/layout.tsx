import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

// Condensed display face echoing the poster's headline lockup.
const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "1st Kerala Professional Social Work Summit",
  description:
    "Create your summit frame photo — 23 September 2026, Trivandrum",
  openGraph: {
    title: "1st Kerala Professional Social Work Summit",
    description: "Create your framed photo and share your pride.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#001449",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${bebas.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
