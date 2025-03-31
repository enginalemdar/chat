import { useEffect, useRef, useState } from 'react';

interface Message {
  sender: string;
  message: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sender, setSender] = useState('Kullanıcı');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    // Eğer Bubble'dan asistan yanıtı çekilecekse burada API çağrısı yapılabilir.
    // Şimdilik sadece scroll işlemi için referans.
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (text.trim() === '') return;

    const payload = {
      assistant_id: 'asst_abc123',
      thread_id: 'thread_xyz789',
      company: 'Tesla',
      message_text: text
    };

    // Önce kullanıcı mesajını göster
    setMessages(prev => [...prev, {
      sender: sender,
      message: text,
      timestamp: Date.now()
    }]);
    setText('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    // n8n webhook'una mesaj gönder
    await fetch('https://unitplan.app.n8n.cloud/webhook-test/afda107d-d0e9-45ae-8c00-cacde0d20a50', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
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
