import fs from 'fs-extra';
import path from 'path';

export default async function handler(req, res) {
  const filePath = path.join(process.cwd(), 'data', 'messages.json');
  const messages = await fs.readJson(filePath);

  res.status(200).json(messages);
}
