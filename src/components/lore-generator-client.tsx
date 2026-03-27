'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getLoreSnippet } from '@/lib/actions';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { RuneIcon } from './icons';
import { Loader2, Wand2 } from 'lucide-react';

const themes = [
  'Despair',
  'Ancient Evil',
  'Corrupted Magic',
  'Forgotten Kingdom',
  'Cosmic Horror',
  'Gothic Dread',
];

const initialState = {
  type: '',
  message: '',
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Generate Lore
    </Button>
  );
}

export function LoreGeneratorClient() {
  const [state, formAction] = useFormState(getLoreSnippet, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.type === 'error' && state.message) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-primary">The Ritual</CardTitle>
          <CardDescription>Provide the components for your story.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                name="keywords"
                placeholder="e.g., shattered moon, blood tithe, obsidian throne"
              />
              {state.errors?.keywords && <p className="text-sm text-destructive">{state.errors.keywords[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select name="theme">
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme} value={theme}>
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {state.errors?.theme && <p className="text-sm text-destructive">{state.errors.theme[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      <Card className="min-h-[300px] flex items-center justify-center">
        {state.type === 'success' && state.data ? (
          <div className="p-6 w-full">
            <h3 className="text-2xl font-headline text-primary">{state.data.title}</h3>
            <p className="mt-4 text-muted-foreground whitespace-pre-line">{state.data.lore}</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <RuneIcon className="mx-auto h-16 w-16" />
            <p className="mt-4">The chronicle awaits your command.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
