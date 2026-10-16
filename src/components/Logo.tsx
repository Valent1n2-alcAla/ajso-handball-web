import Image from 'next/image';
import { LOGO_SRC } from '@/lib/site';

export default function Logo({ size = 56, className = '' }: { size?: number; className?: string }) {
  return <Image src={LOGO_SRC} alt="Logo AJSO Handball" width={size} height={size} className={className} priority />;
}
