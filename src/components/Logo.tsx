import Image from 'next/image';
import { LOGO_RATIO, LOGO_SRC } from '@/lib/site';

/** `size` = largeur en px ; la hauteur suit les proportions du logo. `prioritaire` : préchargé (en-tête du site). */
export default function Logo({ size = 56, className = '', prioritaire = false }: { size?: number; className?: string; prioritaire?: boolean }) {
  return <Image src={LOGO_SRC} alt="Logo AJSO Handball" width={size} height={Math.round(size / LOGO_RATIO)} className={className} style={{ height: 'auto' }} preload={prioritaire} />;
}
