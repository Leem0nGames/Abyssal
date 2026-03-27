import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loginAction, signupAction } from '@/lib/actions';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === 'login';

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg shadow-primary/10">
      <form action={isLogin ? loginAction : signupAction}>
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">
            {isLogin ? 'Welcome Back' : 'Create Your Legend'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your credentials to return to the shadows.'
              : 'Join the ranks of the Conclave.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="username">Character Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Kaelen Shadowhand"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Scroll of Identity (Email)</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@domain.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Secret Word (Password)</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full font-bold">
            {isLogin ? 'Enter' : 'Join'}
          </Button>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already a member? '}
            <Button variant="link" asChild className="p-0 text-accent">
              <Link href={isLogin ? '/signup' : '/login'}>
                {isLogin ? 'Forge a new legend.' : 'Enter the Conclave.'}
              </Link>
            </Button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
