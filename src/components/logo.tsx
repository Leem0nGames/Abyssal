import { SkullIcon } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-4">
      <SkullIcon className="h-12 w-12 text-primary" />
      <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary-foreground tracking-wider">
        Abyssal Conclave
      </h1>
      <SkullIcon className="h-12 w-12 text-primary scale-x-[-1]" />
    </div>
  );
}
