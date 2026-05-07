import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ChevronRight, Save } from 'lucide-react';
import { useDupak } from '../context/DupakContext';
import type { ProfilDosen as ProfilDosenType, JabatanAkademik, Golongan } from '../types';
import { GOLONGAN_BY_JABATAN } from '../utils/akTable';

const JABATAN_OPTIONS: JabatanAkademik[] = ['Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Profesor'];

export default function ProfilDosen() {
  const { state, setProfil } = useDupak();
  const navigate = useNavigate();
  const [form, setForm] = useState<ProfilDosenType>(state.profil);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof ProfilDosenType>(key: K, value: ProfilDosenType[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      // auto-reset golongan if jabatan changes
      if (key === 'jabatanAkademik') {
        const options = GOLONGAN_BY_JABATAN[value as JabatanAkademik];
        next.golongan = options[0];
      }
      if (key === 'jabatanTarget') {
        const options = GOLONGAN_BY_JABATAN[value as JabatanAkademik];
        next.golonganTarget = options[0];
      }
      return next;
    });
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setProfil(form);
    setSaved(true);
  }

  function handleNext() {
    setProfil(form);
    navigate('/input-kegiatan');
  }

  const currentGolongans = GOLONGAN_BY_JABATAN[form.jabatanAkademik] ?? [];
  const targetGolongans = GOLONGAN_BY_JABATAN[form.jabatanTarget] ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <User size={20} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Dosen</h1>
          <p className="text-sm text-gray-500">Data identitas dan jabatan akademik dosen</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            Identitas Dosen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
              <input
                className="input-field"
                value={form.nama}
                onChange={e => set('nama', e.target.value)}
                placeholder="Dr. Nama Lengkap, M.T."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
              <input className="input-field" value={form.nip} onChange={e => set('nip', e.target.value)} placeholder="19XXXXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIDN</label>
              <input className="input-field" value={form.nidn} onChange={e => set('nidn', e.target.value)} placeholder="0XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
              <input className="input-field" value={form.tempatLahir} onChange={e => set('tempatLahir', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
              <input type="date" className="input-field" value={form.tanggalLahir} onChange={e => set('tanggalLahir', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select className="input-field" value={form.jenisKelamin} onChange={e => set('jenisKelamin', e.target.value as 'L' | 'P')}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
        </section>

        {/* Jabatan & Pangkat */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            Jabatan & Pangkat Saat Ini
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Akademik <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jabatanAkademik} onChange={e => set('jabatanAkademik', e.target.value as JabatanAkademik)} required>
                {JABATAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Golongan</label>
              <select className="input-field" value={form.golongan} onChange={e => set('golongan', e.target.value as Golongan)}>
                {currentGolongans.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pangkat</label>
              <input className="input-field" value={form.pangkat} onChange={e => set('pangkat', e.target.value)} placeholder="cth: Penata Tingkat I" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AK Kumulatif Lama <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={0}
                step={0.5}
                className="input-field"
                value={form.akKumulatifLama}
                onChange={e => set('akKumulatifLama', parseFloat(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Total AK yang sudah dimiliki sebelum periode ini</p>
            </div>
          </div>
        </section>

        {/* Target */}
        <section className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm ring-1 ring-blue-100">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            Target Kenaikan Jabatan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan Target <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jabatanTarget} onChange={e => set('jabatanTarget', e.target.value as JabatanAkademik)} required>
                {JABATAN_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Golongan Target <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.golonganTarget} onChange={e => set('golonganTarget', e.target.value as Golongan)} required>
                {targetGolongans.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Unit Kerja */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
            Unit Kerja & Periode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Perguruan Tinggi / Unit Kerja</label>
              <input className="input-field" value={form.unitKerja} onChange={e => set('unitKerja', e.target.value)} placeholder="Universitas ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
              <input className="input-field" value={form.fakultas} onChange={e => set('fakultas', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
              <input className="input-field" value={form.programStudi} onChange={e => set('programStudi', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Ilmu</label>
              <input className="input-field" value={form.bidangIlmu} onChange={e => set('bidangIlmu', e.target.value)} />
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
              <input type="date" className="input-field" value={form.periodeStart} onChange={e => set('periodeStart', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode Selesai</label>
              <input type="date" className="input-field" value={form.periodeEnd} onChange={e => set('periodeEnd', e.target.value)} />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-between pt-2">
          <button type="submit" className="btn-secondary flex items-center gap-2">
            <Save size={16} />
            {saved ? 'Tersimpan!' : 'Simpan'}
          </button>
          <button type="button" onClick={handleNext} className="btn-primary flex items-center gap-2">
            Lanjut: Input Kegiatan
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
