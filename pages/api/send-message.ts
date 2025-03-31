import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { sender, message } = req.body;

    const filePath = path.join(process.cwd(), 'data', 'messages.json');
    const messages = await fs.readJson(filePath);

    const newMessage = {
      sender,
      message,
      timestamp: Date.now()
    };

    messages.push(newMessage);
    await fs.writeJson(filePath, messages, { spaces: 2 });

    res.status(200).json({ success: true, message: 'Mesaj kaydedildi.' });
  } else {
    res.status(405).json({ error: 'Sadece POST destekleniyor.' });
  }
}
