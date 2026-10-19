import type { Metadata } from 'next';
import { Open_Sans, Oswald } from 'next/font/google';
import './globals.css';

const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-open-sans' });

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
    <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning className={`${oswald.variable} ${openSans.variable} h-full antialiased`}>
      {/* suppressHydrationWarning : attributs ajoutés par certaines extensions du navigateur (Grammarly, ColorZilla…) */}
      <body className="min-h-full flex flex-col font-body" suppressHydrationWarning>{children}</body>
    </html>
  );
}
