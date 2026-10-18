import Image from 'next/image';
import { LOGO_RATIO, LOGO_SRC } from '@/lib/site';

/** `size` = largeur en px ; la hauteur suit les proportions du logo. */
export default function Logo({ size = 56, className = '' }: { size?: number; className?: string }) {
  return <Image src={LOGO_SRC} alt="Logo AJSO Handball" width={size} height={Math.round(size / LOGO_RATIO)} className={className} style={{ height: 'auto' }} priority />;
}
