'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user: initialUser }: ProfileCardProps) {
  const [user, setUser] = useState(initialUser);
  const [isDialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);

  const handleSaveChanges = () => {
    setUser({ ...user, name, bio });
    setDialogOpen(false);
  };

  return (
    <Card className="w-full max-w-2xl relative">
      <CardHeader className="text-center items-center pt-12">
        <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-4xl">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl font-headline mt-4">{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-center px-8 pb-8">
        <CardDescription className="text-base text-muted-foreground italic">
          "{user.bio}"
        </CardDescription>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-muted-foreground hover:text-accent">
            <Edit className="w-5 h-5" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline text-primary">Edit Your Aethel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
