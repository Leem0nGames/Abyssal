import { ProfileCard } from '@/components/profile-card';
import { currentUser } from '@/lib/mock-data';

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-headline tracking-wide">Your Aethel</h1>
        <p className="text-muted-foreground mt-2">This is how others in the Conclave see you. Make your legend known.</p>
      </header>
      <div className="flex justify-center">
        <ProfileCard user={currentUser} />
      </div>
    </div>
  );
}
