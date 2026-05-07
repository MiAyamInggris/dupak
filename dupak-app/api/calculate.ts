import type { VercelRequest, VercelResponse } from '@vercel/node';

function getAuthorshipPct(posisi: string): number {
  switch (posisi) {
    case 'tunggal': return 1.0;
    case 'pertama': return 0.6;
    case 'kedua': return 0.4;
    case 'ketiga_dst': return 0.2;
    default: return 0.6;
  }
}

const JABATAN_REQ: Record<string, { akTarget: number; minPendidikan: number; minPenelitian: number }> = {
  'Asisten Ahli_IIIb': { akTarget: 150, minPendidikan: 55, minPenelitian: 25 },
  'Lektor_IIIc':        { akTarget: 200, minPendidikan: 45, minPenelitian: 35 },
  'Lektor_IIId':        { akTarget: 300, minPendidikan: 45, minPenelitian: 35 },
  'Lektor Kepala_IVa':  { akTarget: 400, minPendidikan: 40, minPenelitian: 40 },
  'Lektor Kepala_IVb':  { akTarget: 550, minPendidikan: 40, minPenelitian: 40 },
  'Lektor Kepala_IVc':  { akTarget: 700, minPendidikan: 40, minPenelitian: 40 },
  'Profesor_IVd':       { akTarget: 850, minPendidikan: 35, minPenelitian: 45 },
  'Profesor_IVe':       { akTarget: 1050, minPendidikan: 35, minPenelitian: 45 },
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const action = (req.query.action as string) ?? '';

  // /api/calculate?action=ak-penelitian
  if (action === 'ak-penelitian') {
    const { akDasar, posisiPenulis } = req.body ?? {};
    if (typeof akDasar !== 'number') return res.status(400).json({ error: 'akDasar must be a number' });
    const pct = getAuthorshipPct(posisiPenulis ?? 'pertama');
    return res.status(200).json({ ak: Math.round(akDasar * pct * 100) / 100, akDasar, posisiPenulis, persentase: pct * 100 });
  }

  // /api/calculate?action=ak-mengajar
  if (action === 'ak-mengajar') {
    const { sks, teamTeaching, jumlahTeam } = req.body ?? {};
    if (typeof sks !== 'number') return res.status(400).json({ error: 'sks must be a number' });
    const effectiveSKS = teamTeaching && jumlahTeam > 1 ? sks / jumlahTeam : sks;
    return res.status(200).json({ ak: Math.round(effectiveSKS * 0.5 * 100) / 100, sks, effectiveSKS, teamTeaching: !!teamTeaching, jumlahTeam: jumlahTeam || 1 });
  }

  // /api/calculate?action=eligibility (default)
  const { profil, pelaksanaanPendidikan, penelitian, pengabdian, penunjang, pendidikanFormal } = req.body ?? {};
  if (!profil) return res.status(400).json({ error: 'profil is required' });

  const key = `${profil.jabatanTarget}_${profil.golonganTarget}`;
  const reqData = JABATAN_REQ[key];
  if (!reqData) return res.status(400).json({ error: `Unknown jabatan/golongan: ${key}` });

  const akNeeded = Math.max(reqData.akTarget - (profil.akKumulatifLama || 0), 0);
  const maxCap = akNeeded * 0.10;

  const totalPendidikanFormal = (pendidikanFormal || []).reduce((s: number, i: { ak: number }) => s + i.ak, 0);
  const totalPelaksanaan = (pelaksanaanPendidikan || []).reduce((s: number, i: { ak: number }) => s + i.ak, 0);
  const totalPenelitian = (penelitian || []).reduce((s: number, i: { akDasar: number; posisiPenulis: string }) =>
    s + Math.round(i.akDasar * getAuthorshipPct(i.posisiPenulis) * 100) / 100, 0);
  const totalPengabdianRaw = (pengabdian || []).reduce((s: number, i: { ak: number }) => s + i.ak, 0);
  const totalPenunjangRaw = (penunjang || []).reduce((s: number, i: { ak: number }) => s + i.ak, 0);

  const pengabdianCapped = Math.min(totalPengabdianRaw, maxCap);
  const penunjangCapped = Math.min(totalPenunjangRaw, maxCap);
  const totalNew = Math.round((totalPelaksanaan + totalPenelitian + pengabdianCapped + penunjangCapped) * 100) / 100;
  const grandTotal = Math.round(((profil.akKumulatifLama || 0) + totalPendidikanFormal + totalNew) * 100) / 100;

  const pctPendidikan = totalNew > 0 ? (totalPelaksanaan / totalNew) * 100 : 0;
  const pctPenelitian = totalNew > 0 ? (totalPenelitian / totalNew) * 100 : 0;
  const distribusiPendidikanMet = pctPendidikan >= reqData.minPendidikan;
  const distribusiPenelitianMet = pctPenelitian >= reqData.minPenelitian;
  const eligible = grandTotal >= reqData.akTarget && distribusiPendidikanMet && distribusiPenelitianMet;

  const issues: string[] = [];
  if (grandTotal < reqData.akTarget) issues.push(`AK kurang ${(reqData.akTarget - grandTotal).toFixed(2)}`);
  if (!distribusiPendidikanMet) issues.push(`Distribusi Pendidikan ${pctPendidikan.toFixed(1)}% < min ${reqData.minPendidikan}%`);
  if (!distribusiPenelitianMet) issues.push(`Distribusi Penelitian ${pctPenelitian.toFixed(1)}% < min ${reqData.minPenelitian}%`);

  return res.status(200).json({
    eligible, grandTotal, akTarget: reqData.akTarget,
    akGap: Math.max(0, reqData.akTarget - grandTotal),
    rekap: { pendidikanFormal: totalPendidikanFormal, pelaksanaanPendidikan: totalPelaksanaan, penelitian: totalPenelitian, pengabdian: totalPengabdianRaw, pengabdianCapped, penunjang: totalPenunjangRaw, penunjangCapped, totalNew, maxCap },
    distribusi: {
      pendidikan: { actual: Math.round(pctPendidikan * 10) / 10, min: reqData.minPendidikan, met: distribusiPendidikanMet },
      penelitian: { actual: Math.round(pctPenelitian * 10) / 10, min: reqData.minPenelitian, met: distribusiPenelitianMet },
    },
    issues,
  });
}
