import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getClub } from '@/lib/api';

export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const club = await getClub();
  return (
    <>
      <Header />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <Footer club={club} />
    </>
  );
}
