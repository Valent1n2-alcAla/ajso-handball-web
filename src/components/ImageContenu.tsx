import Image, { type ImageProps } from 'next/image';
import { optimisable } from '@/lib/images';

type Props = Omit<ImageProps, 'src' | 'unoptimized'> & { src: string };

/**
 * Image de contenu (saisie dans l'admin) : optimisée par next/image quand elle vient de l'API,
 * affichée telle quelle sinon (URL externe quelconque), sans jamais lever « hostname not configured ».
 */
export default function ImageContenu({ src, alt, ...props }: Props) {
  return <Image src={src} alt={alt} unoptimized={!optimisable(src)} {...props} />;
}
