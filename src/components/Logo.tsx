import Image from 'next/image';
import { LOGO_RATIO, LOGO_SRC } from '@/lib/site';

/**
 * `size` = largeur en px ; la hauteur suit les proportions du logo. `prioritaire` : préchargé (en-tête du site).
 * `decoratif` : alternative vide quand le nom du club est déjà écrit à côté.
 */
export default function Logo({ size = 56, className = '', prioritaire = false, decoratif = false }: { size?: number; className?: string; prioritaire?: boolean; decoratif?: boolean }) {
  return <Image src={LOGO_SRC} alt={decoratif ? '' : 'Logo AJSO Handball'} width={size} height={Math.round(size / LOGO_RATIO)} className={className} style={{ height: 'auto' }} preload={prioritaire} />;
}
