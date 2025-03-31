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
  const [sender] = useState('Kullanıcı');
  const [assistantId, setAssistantId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [shownAssistantMessageIds, setShownAssistantMessageIds] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // PitchBot tablosundan assistant bilgilerini çek
  const fetchContextInfo = async (companyId: string) => {
    const encodedConstraints = encodeURIComponent(
      JSON.stringify([{ key: 'company_id', constraint_type: 'equals', value: companyId }])
    );

    const res = await fetch(`https://app.unitplan.co/version-test/api/1.1/obj/PitchBot?constraints=${encodedConstraints}`);
    const data = await res.json();
    const record = data.response.results[0];

    if (record) {
      setAssistantId(record.assistant_id);
      setCompanyId(record.company_id);
    }
  };

  // Kullanıcı mesajını gönder
  const sendMessage = async () => {
    if (!text.trim() || !assistantId || !companyId) return;

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
      body: JSON.stringify({
        company: companyId,
        message: text,
        assistant: assistantId
      })
    });
  };

  // pitchbot_message tablosundan asistan cevabını çek
  const fetchLatestAssistantMessage = async () => {
    if (!companyId) return;

    const encoded = encodeURIComponent(
      JSON.stringify([
        { key: 'company', constraint_type: 'equals', value: companyId },
        { key: 'sender', constraint_type: 'equals', value: 'PitchBot' }
      ])
    );

    const res = await fetch(`https://app.unitplan.co/version-test/api/1.1/obj/PitchBot_Message?constraints=${encoded}&sort_field=Created Date&descending=yes&limit=3`);
    const data = await res.json();
    const results = data.response.results;

    for (const msg of results) {
      const messageId = msg._id || msg.id;
      if (!shownAssistantMessageIds.includes(messageId) && msg.message) {
        setMessages(prev => [...prev, {
          sender: "Asistan",
          message: msg.message,
          timestamp: Date.now()
        }]);
        setShownAssistantMessageIds(prev => [...prev, messageId]);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Sayfa yüklendiğinde company_id ile asistan bilgisi çek
  useEffect(() => {
    if (!router.isReady) return;
    const companyId = router.query.company_id as string;
    if (companyId) fetchContextInfo(companyId);
  }, [router.isReady]);

  // 4 saniyede bir asistan cevabı kontrolü
  useEffect(() => {
    if (!companyId) return;
    const interval = setInterval(() => {
      fetchLatestAssistantMessage();
    }, 4000);
    return () => clearInterval(interval);
  }, [companyId, shownAssistantMessageIds]);

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
