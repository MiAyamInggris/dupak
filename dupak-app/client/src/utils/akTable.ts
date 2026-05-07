import type {
  JenjangPendidikan,
  JenisPelaksanaanPendidikan,
  JenisPenelitian,
  JenisPengabdian,
  JenisPenunjang,
  JabatanAkademik,
  Golongan,
  JabatanRequirement,
} from '../types';

// ─── Pendidikan Formal AK Values ────────────────────────────────────────────

export const AK_PENDIDIKAN_FORMAL: Record<JenjangPendidikan, number> = {
  'S1/D4': 100,
  S2: 150,
  S3: 200,
};

// ─── Pelaksanaan Pendidikan AK Values (per unit) ────────────────────────────

export interface PelaksanaanMeta {
  label: string;
  akPerUnit: number;
  satuan: string;
  hasSKS: boolean;
  hasTeamTeaching: boolean;
  hasMahasiswa: boolean;
}

export const AK_PELAKSANAAN: Record<JenisPelaksanaanPendidikan, PelaksanaanMeta> = {
  mengajar: {
    label: 'Mengajar / Tutorial',
    akPerUnit: 0.5,
    satuan: 'per SKS/semester',
    hasSKS: true,
    hasTeamTeaching: true,
    hasMahasiswa: false,
  },
  membimbing_s1_utama: {
    label: 'Membimbing Skripsi/TA S1 (Utama)',
    akPerUnit: 1,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_s1_pendamping: {
    label: 'Membimbing Skripsi/TA S1 (Pendamping)',
    akPerUnit: 0.5,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  menguji_s1: {
    label: 'Menguji Skripsi/TA S1',
    akPerUnit: 0.5,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_s2_utama: {
    label: 'Membimbing Tesis S2 (Utama)',
    akPerUnit: 2,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_s2_pendamping: {
    label: 'Membimbing Tesis S2 (Pendamping)',
    akPerUnit: 1,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  menguji_s2: {
    label: 'Menguji Tesis S2',
    akPerUnit: 1,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_s3_utama: {
    label: 'Membimbing Disertasi S3 (Utama)',
    akPerUnit: 5,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_s3_pendamping: {
    label: 'Membimbing Disertasi S3 (Pendamping)',
    akPerUnit: 2.5,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  menguji_s3: {
    label: 'Menguji Disertasi S3',
    akPerUnit: 2.5,
    satuan: 'per mahasiswa',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: true,
  },
  membimbing_kkn: {
    label: 'Membimbing KKN / PKL',
    akPerUnit: 1,
    satuan: 'per kegiatan',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: false,
  },
  pengembangan_kurikulum: {
    label: 'Pengembangan Kurikulum',
    akPerUnit: 2,
    satuan: 'per kurikulum',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: false,
  },
  pengembangan_bahan_ajar: {
    label: 'Pengembangan Bahan Ajar (Buku/Modul)',
    akPerUnit: 5,
    satuan: 'per buku/modul',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: false,
  },
  pengembangan_media: {
    label: 'Pengembangan Media Pembelajaran',
    akPerUnit: 2,
    satuan: 'per media',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: false,
  },
  membina_kemahasiswaan: {
    label: 'Membina Kegiatan Kemahasiswaan',
    akPerUnit: 1,
    satuan: 'per semester',
    hasSKS: false,
    hasTeamTeaching: false,
    hasMahasiswa: false,
  },
};

// ─── Penelitian AK Values (base, before authorship formula) ─────────────────

export interface PenelitianMeta {
  label: string;
  akDasar: number;
  hasAuthorship: boolean;
  keterangan?: string;
}

export const AK_PENELITIAN: Record<JenisPenelitian, PenelitianMeta> = {
  jurnal_intl_q1q2: {
    label: 'Jurnal Internasional Bereputasi (Scopus Q1/Q2)',
    akDasar: 40,
    hasAuthorship: true,
  },
  jurnal_intl_q3q4: {
    label: 'Jurnal Internasional Bereputasi (Scopus Q3/Q4)',
    akDasar: 30,
    hasAuthorship: true,
  },
  jurnal_intl: {
    label: 'Jurnal Internasional (tidak terindeks Scopus)',
    akDasar: 25,
    hasAuthorship: true,
  },
  jurnal_nas_s1s2: {
    label: 'Jurnal Nasional Terakreditasi (SINTA 1/2)',
    akDasar: 25,
    hasAuthorship: true,
  },
  jurnal_nas_s3s6: {
    label: 'Jurnal Nasional Terakreditasi (SINTA 3–6)',
    akDasar: 15,
    hasAuthorship: true,
  },
  jurnal_nas: {
    label: 'Jurnal Nasional (tidak terakreditasi)',
    akDasar: 10,
    hasAuthorship: true,
  },
  prosiding_intl: {
    label: 'Prosiding Konferensi Internasional',
    akDasar: 15,
    hasAuthorship: true,
  },
  prosiding_nas: {
    label: 'Prosiding Konferensi Nasional',
    akDasar: 10,
    hasAuthorship: true,
  },
  buku_referensi: {
    label: 'Buku Referensi (ber-ISBN)',
    akDasar: 40,
    hasAuthorship: true,
  },
  buku_ajar: {
    label: 'Buku Ajar (ber-ISBN)',
    akDasar: 25,
    hasAuthorship: true,
  },
  monografi: {
    label: 'Monografi',
    akDasar: 20,
    hasAuthorship: true,
  },
  bab_buku: {
    label: 'Bab dalam Buku',
    akDasar: 10,
    hasAuthorship: true,
  },
  laporan_penelitian: {
    label: 'Laporan Penelitian (tidak dipublikasikan)',
    akDasar: 2,
    hasAuthorship: true,
  },
  paten: {
    label: 'Hak Paten / Paten Sederhana',
    akDasar: 40,
    hasAuthorship: true,
  },
  hak_cipta: {
    label: 'Hak Cipta / Hak Kekayaan Intelektual',
    akDasar: 10,
    hasAuthorship: true,
  },
  reviewer_intl: {
    label: 'Reviewer Jurnal Internasional',
    akDasar: 3,
    hasAuthorship: false,
    keterangan: 'Per artikel yang direview',
  },
  reviewer_nas: {
    label: 'Reviewer Jurnal Nasional',
    akDasar: 2,
    hasAuthorship: false,
    keterangan: 'Per artikel yang direview',
  },
  penelitian_dana_besar: {
    label: 'Penelitian (Ketua, Dana ≥ 50 juta)',
    akDasar: 5,
    hasAuthorship: false,
    keterangan: 'Per penelitian',
  },
  penelitian_dana_kecil: {
    label: 'Penelitian (Ketua, Dana < 50 juta)',
    akDasar: 3,
    hasAuthorship: false,
    keterangan: 'Per penelitian',
  },
};

// ─── Pengabdian AK Values ────────────────────────────────────────────────────

export const AK_PENGABDIAN: Record<JenisPengabdian, { label: string; ak: number }> = {
  ketua_besar: { label: 'Ketua Tim (Dana ≥ 5 juta)', ak: 3 },
  anggota_besar: { label: 'Anggota Tim (Dana ≥ 5 juta)', ak: 1 },
  ketua_kecil: { label: 'Ketua Tim (Dana < 5 juta)', ak: 2 },
  anggota_kecil: { label: 'Anggota Tim (Dana < 5 juta)', ak: 0.5 },
  mandiri: { label: 'Pengabdian Mandiri / Perseorangan', ak: 3 },
  penyuluhan: { label: 'Penyuluhan / Pelatihan Masyarakat', ak: 3 },
  narasumber: { label: 'Narasumber / Instruktur', ak: 1 },
  kerjasama_luar_negeri: { label: 'Kerjasama dengan Lembaga Luar Negeri', ak: 4 },
  pengembangan_daerah: { label: 'Pengembangan Wilayah / Daerah', ak: 2 },
};

// ─── Penunjang AK Values ─────────────────────────────────────────────────────

export const AK_PENUNJANG: Record<JenisPenunjang, { label: string; ak: number }> = {
  jabatan_rektor: { label: 'Jabatan Struktural – Rektor/Direktur', ak: 6 },
  jabatan_dekan: { label: 'Jabatan Struktural – Dekan/Wakil Rektor', ak: 5 },
  jabatan_kaprodi: { label: 'Jabatan Struktural – Ketua Prodi/Jurusan', ak: 4 },
  jabatan_kepala_lab: { label: 'Jabatan Struktural – Kepala Lab/Pusat Studi', ak: 3 },
  jabatan_sekprodi: { label: 'Jabatan Struktural – Sekretaris Prodi', ak: 2 },
  anggota_senat: { label: 'Anggota Senat Akademik', ak: 1 },
  editor_jurnal_intl: { label: 'Editor / Dewan Redaksi Jurnal Internasional', ak: 2 },
  editor_jurnal_nas: { label: 'Editor / Dewan Redaksi Jurnal Nasional', ak: 1 },
  reviewer_eksternal: { label: 'Reviewer Eksternal Akreditasi / Hibah', ak: 1 },
  panitia_nasional: { label: 'Panitia Kegiatan Tingkat Nasional', ak: 1 },
  panitia_institusi: { label: 'Panitia Kegiatan Tingkat Institusi', ak: 0.5 },
  anggota_profesi_intl: { label: 'Anggota Organisasi Profesi Internasional', ak: 1 },
  anggota_profesi_nas: { label: 'Anggota Organisasi Profesi Nasional', ak: 0.5 },
  delegasi_intl: { label: 'Delegasi / Undangan Internasional', ak: 1 },
  akreditasi_pt: { label: 'Asesor Akreditasi Perguruan Tinggi/Prodi', ak: 2 },
  penghargaan_intl: { label: 'Penghargaan / Award Internasional', ak: 3 },
  penghargaan_nas: { label: 'Penghargaan / Award Nasional', ak: 2 },
};

// ─── Jabatan Requirements ────────────────────────────────────────────────────

export const JABATAN_REQUIREMENTS: JabatanRequirement[] = [
  { jabatan: 'Asisten Ahli', golongan: 'IIIb', akKumulatifTarget: 150, minPendidikanPct: 55, minPenelitianPct: 25, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Lektor', golongan: 'IIIc', akKumulatifTarget: 200, minPendidikanPct: 45, minPenelitianPct: 35, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Lektor', golongan: 'IIId', akKumulatifTarget: 300, minPendidikanPct: 45, minPenelitianPct: 35, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Lektor Kepala', golongan: 'IVa', akKumulatifTarget: 400, minPendidikanPct: 40, minPenelitianPct: 40, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Lektor Kepala', golongan: 'IVb', akKumulatifTarget: 550, minPendidikanPct: 40, minPenelitianPct: 40, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Lektor Kepala', golongan: 'IVc', akKumulatifTarget: 700, minPendidikanPct: 40, minPenelitianPct: 40, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Profesor', golongan: 'IVd', akKumulatifTarget: 850, minPendidikanPct: 35, minPenelitianPct: 45, maxPengabdianPct: 10, maxPenunjangPct: 10 },
  { jabatan: 'Profesor', golongan: 'IVe', akKumulatifTarget: 1050, minPendidikanPct: 35, minPenelitianPct: 45, maxPengabdianPct: 10, maxPenunjangPct: 10 },
];

export function getJabatanRequirement(jabatan: JabatanAkademik, golongan: Golongan): JabatanRequirement | undefined {
  return JABATAN_REQUIREMENTS.find(r => r.jabatan === jabatan && r.golongan === golongan);
}

export const GOLONGAN_BY_JABATAN: Record<JabatanAkademik, Golongan[]> = {
  'Asisten Ahli': ['IIIb'],
  'Lektor': ['IIIc', 'IIId'],
  'Lektor Kepala': ['IVa', 'IVb', 'IVc'],
  'Profesor': ['IVd', 'IVe'],
};
