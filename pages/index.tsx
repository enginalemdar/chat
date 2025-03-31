import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

interface Message {
  sender: string;
  message: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sender, setSender] = useState('Kullanıcı');
  const [assistantId, setAssistantId] = useState('');
  const [threadId, setThreadId] = useState('');
  const [company, setCompany] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchContextInfo = async (companyId: string) => {
    const encodedConstraint = encodeURIComponent(
      JSON.stringify([{ key: "company", constraint_type: "equals", value: companyId }])
    );

    const res = await fetch(
      `https://app.unitplan.co/version-test/api/1.1/obj/PitchBot?constraints=${encodedConstraint}`
    );

    const data = await res.json();
    const first = data.response.results[0];
    if (first) {
      setAssistantId(first.assistant);
      setThreadId(first.thread);
      setCompany(first.company);
    }
  };

  const sendMessage = async () => {
    if (text.trim() === '' || !assistantId || !threadId || !company) return;

    const payload = {
      assistant: assistantId,
      thread_id: threadId,
      company: company,
      message: text
    };

    setMessages(prev => [...prev, {
      sender: sender,
      message: text,
      timestamp: Date.now()
    }]);
    setText('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    await fetch('https://unitplan.app.n8n.cloud/webhook-test/afda107d-d0e9-45ae-8c00-cacde0d20a50', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  };

  useEffect(() => {
    const companyId = router.query.company_id as string;
    if (companyId) {
      fetchContextInfo(companyId);
    }
  }, [router.query.company_id]);

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
