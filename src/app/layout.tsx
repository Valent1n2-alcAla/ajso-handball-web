import type { Metadata } from 'next';
import { Anton, Barlow, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const anton = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-anton' });
const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-barlow' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'AJSO Handball — AJS Ouistreham Handball',
    template: '%s · AJSO Handball',
  },
  description:
    "Site officiel de l'AJS Ouistreham Handball : équipes, calendrier, résultats, actualités, entraînements et inscriptions à Ouistreham Riva-Bella (Calvados).",
  openGraph: { siteName: 'AJSO Handball', locale: 'fr_FR', type: 'website', images: ['/logo-ajso.png'] },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${anton.variable} ${barlow.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-body">{children}</body>
    </html>
  );
}
