import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export function saveEmailToFile(emailContent: string, fileName: string): string {
  const storagePath = process.env.EMAIL_STORAGE_PATH || './data/emails';
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const fileId = uuidv4().substring(0, 8);
  const outputFileName = `email-${fileId}-${path.basename(fileName)}`;
  const filePath = path.join(storagePath, outputFileName);

  fs.writeFileSync(filePath, emailContent);

  return filePath;
}

export function splitContentIntoChunks(content: string, chunkSize: number): string[] {
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  return chunks;
}
