import { GuildRoster } from '@/components/guild-roster';
import { currentUser } from '@/lib/mock-data';

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-headline tracking-wide">Welcome back, <span className="text-primary">{currentUser.name}</span>.</h1>
        <p className="text-muted-foreground mt-2">The shadows have missed your presence. What tales do you bring today?</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-headline text-primary">Conclave Announcements</h2>
            <p className="mt-4 text-muted-foreground">The veil thins near the Crimson Wastes. A call for able-bodied adventurers has been issued by the Elder Council. Gather your allies. More details to follow at sundown.</p>
          </div>
        </main>
        <aside>
          <GuildRoster />
        </aside>
      </div>
    </div>
  );
}
