'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Masque son contenu sur les chemins donnés (ex. bandeau partenaires du pied de page sur /partenaires). */
export default function MasqueSur({ chemins, children }: { chemins: string[]; children: ReactNode }) {
  const pathname = usePathname();
  return chemins.includes(pathname) ? null : <>{children}</>;
}
