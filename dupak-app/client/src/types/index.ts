export type JabatanAkademik = 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Profesor';
export type Golongan = 'IIIa' | 'IIIb' | 'IIIc' | 'IIId' | 'IVa' | 'IVb' | 'IVc' | 'IVd' | 'IVe';
export type JenisKelamin = 'L' | 'P';
export type PosisiPenulis = 'tunggal' | 'pertama' | 'kedua' | 'ketiga_dst';

export interface ProfilDosen {
  nama: string;
  nip: string;
  nidn: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: JenisKelamin;
  jabatanAkademik: JabatanAkademik;
  jabatanTarget: JabatanAkademik;
  pangkat: string;
  golongan: Golongan;
  golonganTarget: Golongan;
  unitKerja: string;
  fakultas: string;
  programStudi: string;
  bidangIlmu: string;
  periodeStart: string;
  periodeEnd: string;
  akKumulatifLama: number;
}

// ─── Tab 1: Pendidikan Formal ───────────────────────────────────────────────

export type JenjangPendidikan = 'S1/D4' | 'S2' | 'S3';

export interface PendidikanFormal {
  id: string;
  jenjang: JenjangPendidikan;
  bidangIlmu: string;
  institusi: string;
  tahunLulus: number;
  ak: number;
}

// ─── Tab 2: Pelaksanaan Pendidikan ──────────────────────────────────────────

export type JenisPelaksanaanPendidikan =
  | 'mengajar'
  | 'membimbing_s1_utama'
  | 'membimbing_s1_pendamping'
  | 'menguji_s1'
  | 'membimbing_s2_utama'
  | 'membimbing_s2_pendamping'
  | 'menguji_s2'
  | 'membimbing_s3_utama'
  | 'membimbing_s3_pendamping'
  | 'menguji_s3'
  | 'membimbing_kkn'
  | 'pengembangan_kurikulum'
  | 'pengembangan_bahan_ajar'
  | 'pengembangan_media'
  | 'membina_kemahasiswaan';

export interface PelaksanaanPendidikan {
  id: string;
  jenis: JenisPelaksanaanPendidikan;
  mataKuliah?: string;
  sks?: number;
  semester?: string;
  tahunAkademik?: string;
  teamTeaching: boolean;
  jumlahTeam: number;
  jumlahMahasiswa?: number;
  keterangan?: string;
  akDasar: number;
  akPerUnit: number;
  jumlah: number;
  ak: number;
}

// ─── Tab 3: Penelitian ──────────────────────────────────────────────────────

export type JenisPenelitian =
  | 'jurnal_intl_q1q2'
  | 'jurnal_intl_q3q4'
  | 'jurnal_intl'
  | 'jurnal_nas_s1s2'
  | 'jurnal_nas_s3s6'
  | 'jurnal_nas'
  | 'prosiding_intl'
  | 'prosiding_nas'
  | 'buku_referensi'
  | 'buku_ajar'
  | 'monografi'
  | 'bab_buku'
  | 'laporan_penelitian'
  | 'paten'
  | 'hak_cipta'
  | 'reviewer_intl'
  | 'reviewer_nas'
  | 'penelitian_dana_besar'
  | 'penelitian_dana_kecil';

export interface KegiatanPenelitian {
  id: string;
  jenis: JenisPenelitian;
  judul: string;
  namaJurnal?: string;
  penerbit?: string;
  volume?: string;
  nomor?: string;
  tahun: number;
  isbn?: string;
  issn?: string;
  posisiPenulis: PosisiPenulis;
  jumlahPenulis: number;
  akDasar: number;
  persentaseAuthor: number;
  ak: number;
  needsReview?: boolean;
}

export interface SINTAPublication {
  title: string;
  journal: string;
  year: number;
  type: 'scopus' | 'garuda' | 'scholar';
}

// ─── Tab 4: Pengabdian ──────────────────────────────────────────────────────

export type JenisPengabdian =
  | 'ketua_besar'
  | 'anggota_besar'
  | 'ketua_kecil'
  | 'anggota_kecil'
  | 'mandiri'
  | 'penyuluhan'
  | 'narasumber'
  | 'kerjasama_luar_negeri'
  | 'pengembangan_daerah';

export interface KegiatanPengabdian {
  id: string;
  jenis: JenisPengabdian;
  judul: string;
  tempatKegiatan?: string;
  lembagaMitra?: string;
  tahun: number;
  bukti?: string;
  ak: number;
}

// ─── Tab 5: Penunjang ───────────────────────────────────────────────────────

export type JenisPenunjang =
  | 'jabatan_rektor'
  | 'jabatan_dekan'
  | 'jabatan_kaprodi'
  | 'jabatan_kepala_lab'
  | 'jabatan_sekprodi'
  | 'anggota_senat'
  | 'editor_jurnal_intl'
  | 'editor_jurnal_nas'
  | 'reviewer_eksternal'
  | 'panitia_nasional'
  | 'panitia_institusi'
  | 'anggota_profesi_intl'
  | 'anggota_profesi_nas'
  | 'delegasi_intl'
  | 'akreditasi_pt'
  | 'penghargaan_intl'
  | 'penghargaan_nas';

export interface KegiatanPenunjang {
  id: string;
  jenis: JenisPenunjang;
  nama: string;
  tingkat?: string;
  tahun: number;
  bukti?: string;
  ak: number;
}

// ─── Rekap & Eligibility ────────────────────────────────────────────────────

export interface RekapUnsur {
  pendidikanFormal: number;
  pelaksanaanPendidikan: number;
  penelitian: number;
  pengabdian: number;
  penunjang: number;
  pengabdianCapped: number;
  penunjangCapped: number;
  total: number;
  totalNew: number;
}

export interface DistribusiRequirement {
  label: string;
  min: number;
  actual: number;
  met: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  akNeeded: number;
  akTarget: number;
  akCurrentTotal: number;
  akNewTotal: number;
  akGap: number;
  distribusiPendidikan: DistribusiRequirement;
  distribusiPenelitian: DistribusiRequirement;
  capPengabdian: { max: number; actual: number; capped: number; exceeded: boolean };
  capPenunjang: { max: number; actual: number; capped: number; exceeded: boolean };
  issues: string[];
}

export interface DupakState {
  profil: ProfilDosen;
  pendidikanFormal: PendidikanFormal[];
  pelaksanaanPendidikan: PelaksanaanPendidikan[];
  penelitian: KegiatanPenelitian[];
  pengabdian: KegiatanPengabdian[];
  penunjang: KegiatanPenunjang[];
}

// AK requirement thresholds by jabatan + golongan
export interface JabatanRequirement {
  jabatan: JabatanAkademik;
  golongan: Golongan;
  akKumulatifTarget: number;
  minPendidikanPct: number;
  minPenelitianPct: number;
  maxPengabdianPct: number;
  maxPenunjangPct: number;
}
