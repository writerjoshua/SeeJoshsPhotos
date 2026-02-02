import type { Metadata, Viewport } from 'next';
import { Georgia } from 'next/font/google';
import './globals.css';

const georgia = Georgia({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-georgia',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'SeeJoshsPhotos — A legally blind photographer seeing deeply',
  description: 'Intimate photography of roses, gardens, and travels. An exploration of sensuality, presence, and defiance.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SeeJoshsPhotos',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${georgia.variable} font-serif bg-black-base text-offwhite antialiased`}>
        {children}
      </body>
    </html>
  );
}
