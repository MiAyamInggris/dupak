import type { VercelRequest, VercelResponse } from '@vercel/node';

const PDDIKTI_BASE = 'https://api-frontend.kemdikbud.go.id';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { nidn, id } = req.query;

  try {
    if (id) {
      const response = await fetch(`${PDDIKTI_BASE}/detail_dosen/${id}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!response.ok) {
        return res.status(502).json({ error: `PDDIKTI returned ${response.status}` });
      }
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (nidn) {
      const response = await fetch(`${PDDIKTI_BASE}/hit_dosen_all/${nidn}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      if (!response.ok) {
        return res.status(502).json({ error: `PDDIKTI returned ${response.status}` });
      }
      const data = await response.json();
      const dosenList = data?.dosen ?? [];
      return res.status(200).json({ dosen: dosenList });
    }

    return res.status(400).json({ error: 'Parameter nidn atau id diperlukan' });

  } catch (error) {
    console.error('PDDIKTI fetch error:', error);
    return res.status(502).json({
      error: 'Gagal mengambil data dari PDDIKTI',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
