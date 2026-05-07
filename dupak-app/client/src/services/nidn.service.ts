import type { JabatanAkademik } from '../types';

// All PDDIKTI and SINTA calls go through the /api serverless proxy — never directly
// from the browser, as those endpoints have no CORS headers.
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export interface PDDIKTIDosenProfile {
  id: string;
  nama: string;
  nidn: string;
  nama_pt: string;
  singkatan_pt?: string;
  nama_prodi: string;
  jabatan_fungsional?: string;
  pendidikan_tertinggi?: string;
  jenis_kelamin?: string;
  status_ikatan_kerja?: string;
}

export interface SINTAProfile {
  name: string;
  sintaId: string;
  affiliation: string;
  studyProgram: string;
  nidn: string;
  sintaScore: string;
}

export interface SINTAPublication {
  title: string;
  journal: string;
  year: number;
  type: 'scopus' | 'garuda' | 'scholar';
}

export interface SINTAResult {
  success?: boolean;
  profile: SINTAProfile;
  publications: {
    scopus: SINTAPublication[];
    garuda: SINTAPublication[];
    total: number;
  };
  warnings?: string[];
}

export const nidnService = {
  async searchByNIDN(nidn: string): Promise<PDDIKTIDosenProfile[]> {
    const res = await fetch(`${API_BASE}/api/pddikti?nidn=${encodeURIComponent(nidn)}`);
    if (!res.ok) throw new Error('Gagal mengambil data PDDIKTI');
    const data = await res.json();
    return (data.dosen ?? []) as PDDIKTIDosenProfile[];
  },

  async getDosenDetail(id: string): Promise<PDDIKTIDosenProfile> {
    const res = await fetch(`${API_BASE}/api/pddikti?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Gagal mengambil detail dosen PDDIKTI');
    return res.json() as Promise<PDDIKTIDosenProfile>;
  },

  async fetchSINTA(sintaId: string): Promise<SINTAResult> {
    const res = await fetch(`${API_BASE}/api/sinta?sinta_id=${encodeURIComponent(sintaId)}`);
    if (!res.ok) throw new Error('Gagal mengambil data SINTA');
    return res.json() as Promise<SINTAResult>;
  },

  mapJabatan(jabatanString?: string): JabatanAkademik | null {
    if (!jabatanString) return null;
    const j = jabatanString.toLowerCase();
    if (j.includes('profesor') || j.includes('guru besar')) return 'Profesor';
    if (j.includes('lektor kepala')) return 'Lektor Kepala';
    if (j.includes('lektor')) return 'Lektor';
    if (j.includes('asisten ahli')) return 'Asisten Ahli';
    return null;
  },
};
