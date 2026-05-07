import type {
  DupakState,
  PosisiPenulis,
  PelaksanaanPendidikan,
  KegiatanPenelitian,
  RekapUnsur,
  EligibilityResult,
} from '../types';
import { getJabatanRequirement, JABATAN_REQUIREMENTS } from './akTable';

// ─── Authorship Credit-Sharing Formula ──────────────────────────────────────
// tunggal = 100%, pertama = 60%, kedua = 40%, ketiga_dst = 20%

export function getAuthorshipPercentage(posisi: PosisiPenulis): number {
  switch (posisi) {
    case 'tunggal': return 1.0;
    case 'pertama': return 0.6;
    case 'kedua': return 0.4;
    case 'ketiga_dst': return 0.2;
  }
}

export function computeAKPenelitian(akDasar: number, posisi: PosisiPenulis): number {
  return round2(akDasar * getAuthorshipPercentage(posisi));
}

// ─── Team-Teaching SKS Splitting ────────────────────────────────────────────
// effectiveSKS = totalSKS / jumlahAnggotaTeam  →  AK = effectiveSKS × 0.5

export function computeAKMengajar(sks: number, teamTeaching: boolean, jumlahTeam: number): number {
  const effectiveSKS = teamTeaching && jumlahTeam > 1 ? sks / jumlahTeam : sks;
  return round2(effectiveSKS * 0.5);
}

export function computeAKPelaksanaan(item: Omit<PelaksanaanPendidikan, 'ak' | 'id'>): number {
  if (item.jenis === 'mengajar') {
    const sks = item.sks ?? 0;
    return computeAKMengajar(sks, item.teamTeaching, item.jumlahTeam);
  }
  return round2(item.akPerUnit * item.jumlah);
}

export function computeAKFromPenelitian(item: Omit<KegiatanPenelitian, 'ak' | 'id'>): number {
  return computeAKPenelitian(item.akDasar, item.posisiPenulis);
}

// ─── Rekap Aggregation ───────────────────────────────────────────────────────

export function computeRekap(state: DupakState, akNeededForPromotion: number): RekapUnsur {
  const pendidikanFormal = state.pendidikanFormal.reduce((s, i) => s + i.ak, 0);
  const pelaksanaanPendidikan = state.pelaksanaanPendidikan.reduce((s, i) => s + i.ak, 0);
  const penelitian = state.penelitian.reduce((s, i) => s + i.ak, 0);
  const pengabdianRaw = state.pengabdian.reduce((s, i) => s + i.ak, 0);
  const penunjangRaw = state.penunjang.reduce((s, i) => s + i.ak, 0);

  // 10% caps applied against the AK needed for the current promotion increment
  const maxPengabdian = round2(akNeededForPromotion * 0.10);
  const maxPenunjang = round2(akNeededForPromotion * 0.10);

  const pengabdianCapped = Math.min(pengabdianRaw, maxPengabdian);
  const penunjangCapped = Math.min(penunjangRaw, maxPenunjang);

  const totalNew = round2(
    pelaksanaanPendidikan + penelitian + pengabdianCapped + penunjangCapped
  );
  const total = round2(state.profil.akKumulatifLama + pendidikanFormal + totalNew);

  return {
    pendidikanFormal,
    pelaksanaanPendidikan,
    penelitian,
    pengabdian: pengabdianRaw,
    penunjang: penunjangRaw,
    pengabdianCapped,
    penunjangCapped,
    total,
    totalNew,
  };
}

// ─── Eligibility Checker ─────────────────────────────────────────────────────

export function checkEligibility(state: DupakState): EligibilityResult {
  const { profil } = state;
  const req = getJabatanRequirement(profil.jabatanTarget, profil.golonganTarget);

  if (!req) {
    return {
      eligible: false,
      akNeeded: 0,
      akTarget: 0,
      akCurrentTotal: profil.akKumulatifLama,
      akNewTotal: 0,
      akGap: 0,
      distribusiPendidikan: { label: '', min: 0, actual: 0, met: false },
      distribusiPenelitian: { label: '', min: 0, actual: 0, met: false },
      capPengabdian: { max: 0, actual: 0, capped: 0, exceeded: false },
      capPenunjang: { max: 0, actual: 0, capped: 0, exceeded: false },
      issues: ['Target jabatan/golongan tidak valid'],
    };
  }

  const akNeeded = req.akKumulatifTarget - profil.akKumulatifLama;
  const akNeededPositive = Math.max(akNeeded, 0);

  const rekap = computeRekap(state, akNeededPositive);

  const akCurrentTotal = profil.akKumulatifLama + rekap.pendidikanFormal;
  const akNewTotal = rekap.totalNew;
  const grandTotal = akCurrentTotal + akNewTotal;

  // Distribution is calculated over the NEW AK gained this period (excluding formal education)
  const newAKBase = rekap.pelaksanaanPendidikan + rekap.penelitian + rekap.pengabdianCapped + rekap.penunjangCapped;

  const pctPendidikan = newAKBase > 0 ? (rekap.pelaksanaanPendidikan / newAKBase) * 100 : 0;
  const pctPenelitian = newAKBase > 0 ? (rekap.penelitian / newAKBase) * 100 : 0;

  const capPengabdian = {
    max: round2(akNeededPositive * 0.10),
    actual: rekap.pengabdian,
    capped: rekap.pengabdianCapped,
    exceeded: rekap.pengabdian > round2(akNeededPositive * 0.10),
  };

  const capPenunjang = {
    max: round2(akNeededPositive * 0.10),
    actual: rekap.penunjang,
    capped: rekap.penunjangCapped,
    exceeded: rekap.penunjang > round2(akNeededPositive * 0.10),
  };

  const distribusiPendidikan: import('../types').DistribusiRequirement = {
    label: 'Pelaksanaan Pendidikan',
    min: req.minPendidikanPct,
    actual: round2(pctPendidikan),
    met: pctPendidikan >= req.minPendidikanPct,
  };

  const distribusiPenelitian: import('../types').DistribusiRequirement = {
    label: 'Penelitian',
    min: req.minPenelitianPct,
    actual: round2(pctPenelitian),
    met: pctPenelitian >= req.minPenelitianPct,
  };

  const issues: string[] = [];

  if (grandTotal < req.akKumulatifTarget) {
    issues.push(`Total AK kumulatif (${grandTotal}) belum mencapai target (${req.akKumulatifTarget})`);
  }
  if (!distribusiPendidikan.met) {
    issues.push(`Distribusi Pendidikan ${pctPendidikan.toFixed(1)}% < minimum ${req.minPendidikanPct}%`);
  }
  if (!distribusiPenelitian.met) {
    issues.push(`Distribusi Penelitian ${pctPenelitian.toFixed(1)}% < minimum ${req.minPenelitianPct}%`);
  }
  if (capPengabdian.exceeded) {
    issues.push(`AK Pengabdian (${rekap.pengabdian}) melebihi batas 10% (${capPengabdian.max}); hanya ${capPengabdian.capped} yang dihitung`);
  }
  if (capPenunjang.exceeded) {
    issues.push(`AK Penunjang (${rekap.penunjang}) melebihi batas 10% (${capPenunjang.max}); hanya ${capPenunjang.capped} yang dihitung`);
  }

  const eligible =
    grandTotal >= req.akKumulatifTarget &&
    distribusiPendidikan.met &&
    distribusiPenelitian.met;

  return {
    eligible,
    akNeeded: akNeededPositive,
    akTarget: req.akKumulatifTarget,
    akCurrentTotal,
    akNewTotal,
    akGap: Math.max(0, req.akKumulatifTarget - grandTotal),
    distribusiPendidikan,
    distribusiPenelitian,
    capPengabdian,
    capPenunjang,
    issues,
  };
}

export function getNextJabatanOptions(jabatan: string) {
  return JABATAN_REQUIREMENTS.filter(r => {
    if (jabatan === 'Asisten Ahli') return r.jabatan === 'Lektor';
    if (jabatan === 'Lektor') return r.jabatan === 'Lektor Kepala';
    if (jabatan === 'Lektor Kepala') return r.jabatan === 'Profesor';
    return false;
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
