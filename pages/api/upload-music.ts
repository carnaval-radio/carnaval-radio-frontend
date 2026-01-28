import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import { Client } from 'basic-ftp';
import fs from 'fs';

// Simple in-memory rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max uploads per window per IP
const rateLimitMap = new Map<string, { count: number; last: number }>();

const FTP_HOST = process.env.FTP_HOST || 'localhost';
const FTP_PORT = process.env.FTP_PORT ? parseInt(process.env.FTP_PORT, 10) : 21;
const FTP_USER = process.env.FTP_USER || 'user';
const FTP_PASS = process.env.FTP_PASS || 'pass';
const FTP_DIR = process.env.FTP_DIR || '/uploads';
const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function parseForm(req: NextApiRequest): Promise<{ file: formidable.File, password: string }> {
  return new Promise((resolve, reject) => {
    const form = formidable();
    form.parse(req, (err: any, fields: Fields, files: Files) => {
      if (err || !files.file || !fields.password) {
        reject('Bestand en wachtwoord zijn verplicht.');
        return;
      }
      // formidable can return arrays for files and fields
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      const password = Array.isArray(fields.password) ? fields.password[0] : fields.password;
      resolve({ file: file as formidable.File, password: password as string });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get IP address (works for most setups, but not all proxies)
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const rl = rateLimitMap.get(ip);
  if (rl && now - rl.last < RATE_LIMIT_WINDOW_MS) {
    if (rl.count >= RATE_LIMIT_MAX) {
      res.status(429).json({ message: `Te veel uploads, probeer het over een minuut opnieuw.` });
      return;
    }
    rateLimitMap.set(ip, { count: rl.count + 1, last: rl.last });
  } else {
    rateLimitMap.set(ip, { count: 1, last: now });
  }
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Alleen POST toegestaan.' });
    return;
  }
  try {
    if (!UPLOAD_PASSWORD) {
      res.status(500).json({ message: 'UPLOAD_PASSWORD is not set in environment.' });
      return;
    }
    const { file, password } = await parseForm(req);
    if (password !== UPLOAD_PASSWORD) {
      res.status(401).json({ message: 'Wachtwoord is onjuist.' });
      return;
    }
    const client = new Client();
    await client.access({
      host: FTP_HOST,
      port: FTP_PORT,
      user: FTP_USER,
      password: FTP_PASS,
    });
    // Create subfolder per day (YYYY-MM-DD)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dayFolder = `${yyyy}-${mm}-${dd}`;
    const targetDir = `${FTP_DIR}/${dayFolder}`;
    await client.ensureDir(targetDir);
    await client.uploadFrom(file.filepath, `${targetDir}/${file.originalFilename}`);
    client.close();
    fs.unlinkSync(file.filepath);
    res.status(200).json({ message: 'Upload geslaagd!' });
  } catch (err: any) {
    res.status(500).json({ message: 'Upload mislukt: ' + err });
  }
}
