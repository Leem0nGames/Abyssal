'use client';

import { useState, useRef, useEffect } from 'react';
import type { Message } from '@/lib/types';
import { currentUser } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  messages: Message[];
}

export function ChatLayout({ messages: initialMessages }: ChatLayoutProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        author: currentUser,
        content: input.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
    }
  }, [messages]);
  

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary">Grand Hall</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {messages.map((msg) => {
              const isCurrentUser = msg.author.id === currentUser.id;
              return (
                <div key={msg.id} className={cn('flex items-start gap-4', isCurrentUser && 'justify-end')}>
                  {!isCurrentUser && (
                    <Avatar className="h-10 w-10 border-2 border-secondary">
                      <AvatarImage src={msg.author.avatarUrl} alt={msg.author.name} />
                      <AvatarFallback>{msg.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('max-w-md w-fit rounded-lg px-4 py-3', isCurrentUser ? 'bg-primary/80 text-primary-foreground' : 'bg-secondary')}>
                    {!isCurrentUser && <p className="font-bold text-accent">{msg.author.name}</p>}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn('text-xs mt-1', isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{msg.timestamp}</p>
                  </div>
                  {isCurrentUser && (
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={msg.author.avatarUrl} alt={msg.author.name} />
                      <AvatarFallback>{msg.author.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-6">
        <div className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Speak your mind, warrior..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 resize-none"
          />
          <Button onClick={handleSend} size="icon">
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
