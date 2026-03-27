import { mockUsers } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function GuildRoster() {
  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <CardTitle className="text-xl font-headline text-primary">Guild Roster</CardTitle>
        <Badge variant="secondary">{mockUsers.length} Online</Badge>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {mockUsers.map((user) => (
            <li key={user.id} className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border-2 border-accent">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{user.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
