import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center text-center p-4 bg-gradient-to-b from-background to-black">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <main className="z-10 flex flex-col items-center">
        <Logo />
        <p className="mt-4 max-w-xl text-lg text-muted-foreground font-body">
          In the echoes of forgotten wars, a new sanctuary for the hardened and the lost has formed. Share your tales, forge alliances, and shape your legend within the shadows.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="font-headline text-lg transition-all duration-300 hover:shadow-[0_0_20px_theme(colors.primary.DEFAULT)] hover:scale-105">
            <Link href="/login">Enter the Conclave</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-headline text-lg transition-all duration-300 hover:shadow-[0_0_20px_theme(colors.accent.DEFAULT)] hover:scale-105">
            <Link href="/signup">Forge Your Legend</Link>
          </Button>
        </div>
      </main>
      <footer className="z-10 absolute bottom-4 text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Abyssal Conclave. All rights reserved.</p>
      </footer>
    </div>
  );
}
