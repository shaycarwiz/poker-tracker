import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { Stats } from '@/components/Stats';
import { Footer } from '@/components/Footer';
import { SignInButton } from '@/components/auth/SignInButton';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Stats />
      <Footer />
    </main>
  );
}
