import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'Indx Search System / RestAPI Local demo',
  description: 'Advanced search with pattern recognition.',
  openGraph: {
    url: 'https://indx.co',
    type: 'website',
    title: 'indx - Next Generation Search System',
    description: 'Advanced search with pattern recognition.',
    images: 'https://indx.co/opengraph.png'
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
