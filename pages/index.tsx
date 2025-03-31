import { useEffect, useRef, useState } from 'react';

interface Message {
  sender: string;
  message: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sender, setSender] = useState('Emine');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const res = await fetch('/api/get-messages');
    const data = await res.json();
    setMessages(data);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (text.trim() === '') return;
    await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message: text })
    });
    setText('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Chat</h1>
      <div className="h-[400px] overflow-y-scroll border rounded p-3 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg.sender}:</strong> {msg.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
