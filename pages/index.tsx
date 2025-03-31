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
  const [companyId, setCompanyId] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Bubble API'den PitchBot thing'ini company_id'ye göre çek
  const fetchContextInfo = async (companyId: string) => {
    const encodedConstraints = encodeURIComponent(
      JSON.stringify([{ key: 'company', constraint_type: 'equals', value: companyId }])
    );

    const res = await fetch(`https://app.unitplan.co/version-test/api/1.1/obj/PitchBot?constraints=${encodedConstraints}`);
    const data = await res.json();
    const record = data.response.results[0];

    if (record) {
      setAssistantId(record.assistant_id);
      setCompanyId(record.company);
    }
  };

  // Mesaj gönderme
  const sendMessage = async () => {
  console.log("🔹 sendMessage çalıştı"); // TEST 1

  if (!text.trim()) {
    console.log("⚠️ Boş mesaj"); // TEST 2
    return;
  }
  if (!assistantId) {
    console.log("⚠️ assistantId boş"); // TEST 3
    return;
  }
  if (!companyId) {
    console.log("⚠️ companyId boş"); // TEST 4
    return;
  }

  console.log("✅ Tüm veriler tamam, gönderiliyor..."); // TEST 5

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

  console.log("✅ fetch tamamlandı"); // TEST 6
};
  // Sayfa yüklendiğinde URL'deki ?company_id=... parametresini al
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
