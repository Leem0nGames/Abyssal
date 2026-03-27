import { LoreGeneratorClient } from '@/components/lore-generator-client';

export default function LoreGeneratorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <header className="mb-8">
        <h1 className="text-3xl font-headline tracking-wide">Shadowed Chronicle AI</h1>
        <p className="text-muted-foreground mt-2">Consult the ancient spirits to weave new tales. Provide keywords and a theme, and let the chronicle unfold.</p>
      </header>
      <LoreGeneratorClient />
    </div>
  );
}
