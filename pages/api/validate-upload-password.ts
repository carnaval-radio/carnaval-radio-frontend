import type { NextApiRequest, NextApiResponse } from 'next';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Alleen POST toegestaan.' });
    return;
  }
  const { password } = req.body || {};
  if (!UPLOAD_PASSWORD) {
    res.status(500).json({ message: 'UPLOAD_PASSWORD is not set in environment.' });
    return;
  }
  if (!password) {
    res.status(400).json({ message: 'Wachtwoord is verplicht.' });
    return;
  }
  if (password === UPLOAD_PASSWORD) {
    res.status(200).json({ valid: true });
  } else {
    res.status(401).json({ valid: false, message: 'Wachtwoord is onjuist.' });
  }
}
