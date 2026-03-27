import { ChatLayout } from '@/components/chat-layout';
import { GuildRoster } from '@/components/guild-roster';
import { mockMessages, mockUsers } from '@/lib/mock-data';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-theme(spacing.16))] grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-3 h-full">
            <ChatLayout messages={mockMessages} />
        </div>
        <div className="hidden lg:block">
            <GuildRoster />
        </div>
    </div>
  );
}
