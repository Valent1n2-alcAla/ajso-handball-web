import type { Reseau } from '@/lib/site';

const COULEURS: Record<Reseau['nom'], string> = {
  Facebook: 'bg-[#3b5998]',
  Instagram: 'bg-[#d62976]',
  YouTube: 'bg-[#e52d27]',
  TikTok: 'bg-black',
  X: 'bg-black',
  LinkedIn: 'bg-[#0a66c2]',
};

function Icone({ nom }: { nom: Reseau['nom'] }) {
  const c = 'w-4 h-4';
  switch (nom) {
    case 'Facebook':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z" /></svg>;
    case 'Instagram':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" /></svg>;
    case 'YouTube':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 00-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>;
    case 'TikTok':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v3a7 7 0 01-3.9-1.2v6.1A5.8 5.8 0 1110.8 9v3.1a2.7 2.7 0 102 2.6V3h3.8z" /></svg>;
    case 'X':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>;
    case 'LinkedIn':
      return <svg aria-hidden viewBox="0 0 24 24" className={c} fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9.5h4V21H3V9.5zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5z" /></svg>;
  }
}

/** Boutons carrés des réseaux sociaux du club (couleurs des réseaux). */
export default function BoutonsReseaux({ reseaux, taille = 'md' }: { reseaux: Reseau[]; taille?: 'sm' | 'md' }) {
  if (!reseaux.length) return null;
  const t = taille === 'sm' ? 'w-9 h-9' : 'w-11 h-11';
  return (
    <ul className="flex">
      {reseaux.map((r) => (
        <li key={r.nom}>
          <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`${r.nom} (nouvel onglet)`} title={r.nom}
            className={`${t} ${COULEURS[r.nom]} text-white flex items-center justify-center hover:brightness-110`}>
            <Icone nom={r.nom} />
          </a>
        </li>
      ))}
    </ul>
  );
}
