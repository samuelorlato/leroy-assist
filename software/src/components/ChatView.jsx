import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatView({ messages, onChip, inert }) {
  const scrollRef = useRef(null);

  // Mantém a última mensagem visível.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length <= 1) {
      el.scrollTop = 0;
      return;
    }
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <main className="chat" ref={scrollRef} inert={inert}>
      <div className="messages" aria-live="polite" aria-label="Conversa com o assistente">
        {messages.map((message, i) => (
          <ChatMessage
            key={message.id}
            message={message}
            cont={message.role === 'bot' && messages[i - 1]?.role === 'bot'}
            onChip={onChip}
          />
        ))}
      </div>
    </main>
  );
}
