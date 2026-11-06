import type { Metadata, Viewport } from 'next';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap'
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-bricolage',
  display: 'swap'
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'Klaket AI Video Stüdyosu – SOP Uyumlu Otomatik Video Üretim Platformu',
  description: 'Brief\'ten senaryoya, sesten montaja ve kalite kontrolüne (QC) kadar standart operasyon prosedürlerine (SOP) uyumlu yapay zeka video üretim stüdyosu.',
  keywords: ['AI Video', 'Content Creator', 'Video Üretimi', 'SOP', 'Reels', 'TikTok', 'Shorts', 'Gayrimenkul Tanıtımı'],
  authors: [{ name: 'Klaket AI Ekibi' }],
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <body>{children}</body>
    </html>
  );
}
