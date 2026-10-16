'use client';

import type { ReactNode } from 'react';

/** Bouton de soumission qui demande confirmation (suppression). */
export default function BoutonConfirmer({ message, children, className }: { message: string; children: ReactNode; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
