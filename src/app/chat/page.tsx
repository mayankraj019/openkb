import { ChatInterface } from '@/components/chat/chat-interface';
import { Sidebar } from '@/components/layout/sidebar';

// Force this page to never scroll — chat uses its own internal scroll
export default function ChatPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <ChatInterface />
      </div>
    </div>
  );
}
