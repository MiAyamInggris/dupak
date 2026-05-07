import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'DUPAK API aktif',
      version: '1.0.0',
    });
  }

  if (req.method === 'POST') {
    const dupakData = req.body;
    return res.status(200).json({
      success: true,
      data: dupakData,
      savedAt: new Date().toISOString(),
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
