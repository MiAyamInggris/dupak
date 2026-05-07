import React, { useState } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useDupak } from '../../context/DupakContext';
import { AK_PELAKSANAAN } from '../../utils/akTable';
import { computeAKPelaksanaan } from '../../utils/calculations';
import type { PelaksanaanPendidikan, JenisPelaksanaanPendidikan } from '../../types';

const JENIS_OPTIONS = Object.entries(AK_PELAKSANAAN) as [JenisPelaksanaanPendidikan, typeof AK_PELAKSANAAN[JenisPelaksanaanPendidikan]][];

function emptyForm(): Omit<PelaksanaanPendidikan, 'id' | 'ak'> {
  return {
    jenis: 'mengajar',
    mataKuliah: '',
    sks: 3,
    semester: 'Ganjil',
    tahunAkademik: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    teamTeaching: false,
    jumlahTeam: 1,
    jumlahMahasiswa: 1,
    keterangan: '',
    akDasar: AK_PELAKSANAAN['mengajar'].akPerUnit,
    akPerUnit: AK_PELAKSANAAN['mengajar'].akPerUnit,
    jumlah: 1,
  };
}

export default function PelaksanaanPendidikanTab() {
  const { state, addPelaksanaan, deletePelaksanaan } = useDupak();
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);

  const meta = AK_PELAKSANAAN[form.jenis];

  function handleJenis(jenis: JenisPelaksanaanPendidikan) {
    const m = AK_PELAKSANAAN[jenis];
    setForm(prev => ({
      ...prev,
      jenis,
      akDasar: m.akPerUnit,
      akPerUnit: m.akPerUnit,
      teamTeaching: false,
      jumlahTeam: 1,
      sks: m.hasSKS ? prev.sks : undefined,
    }));
  }

  const previewAK = computeAKPelaksanaan({ ...form, akDasar: meta.akPerUnit });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const ak = computeAKPelaksanaan({ ...form });
    addPelaksanaan({ ...form, id: uuid(), ak });
    setForm(emptyForm());
    setShowForm(false);
  }

  const total = state.pelaksanaanPendidikan.reduce((s, i) => s + i.ak, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Input kegiatan mengajar, membimbing, menguji, dan pengembangan pembelajaran.</p>
          <p className="text-xs text-gray-400 mt-0.5">Team teaching: SKS dibagi jumlah anggota tim × 0,5 AK/SKS/semester</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="label">Jenis Kegiatan <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jenis} onChange={e => handleJenis(e.target.value as JenisPelaksanaanPendidikan)} required>
                {JENIS_OPTIONS.map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — {v.satuan}</option>
                ))}
              </select>
            </div>

            {meta.hasSKS && (
              <>
                <div>
                  <label className="label">Mata Kuliah <span className="text-red-500">*</span></label>
                  <input className="input-field" value={form.mataKuliah ?? ''} onChange={e => setForm(p => ({ ...p, mataKuliah: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">SKS <span className="text-red-500">*</span></label>
                  <input type="number" min={1} max={6} step={0.5} className="input-field" value={form.sks ?? 3}
                    onChange={e => setForm(p => ({ ...p, sks: parseFloat(e.target.value) || 3 }))} required />
                </div>
                <div>
                  <label className="label">Semester</label>
                  <select className="input-field" value={form.semester ?? 'Ganjil'} onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
                    <option>Ganjil</option>
                    <option>Genap</option>
                    <option>Pendek</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tahun Akademik</label>
                  <input className="input-field" value={form.tahunAkademik ?? ''} onChange={e => setForm(p => ({ ...p, tahunAkademik: e.target.value }))}
                    placeholder="2024/2025" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.teamTeaching}
                      onChange={e => setForm(p => ({ ...p, teamTeaching: e.target.checked, jumlahTeam: e.target.checked ? 2 : 1 }))}
                      className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Team Teaching</span>
                  </label>
                </div>
                {form.teamTeaching && (
                  <div>
                    <label className="label">Jumlah Anggota Tim <span className="text-red-500">*</span></label>
                    <input type="number" min={2} max={10} className="input-field" value={form.jumlahTeam}
                      onChange={e => setForm(p => ({ ...p, jumlahTeam: parseInt(e.target.value) || 2 }))} />
                    <p className="text-xs text-gray-400 mt-1">
                      Efektif SKS: {((form.sks ?? 3) / form.jumlahTeam).toFixed(2)} × 0,5 = {(((form.sks ?? 3) / form.jumlahTeam) * 0.5).toFixed(2)} AK
                    </p>
                  </div>
                )}
              </>
            )}

            {meta.hasMahasiswa && (
              <div>
                <label className="label">Jumlah Mahasiswa <span className="text-red-500">*</span></label>
                <input type="number" min={1} className="input-field" value={form.jumlahMahasiswa ?? 1}
                  onChange={e => setForm(p => ({ ...p, jumlahMahasiswa: parseInt(e.target.value) || 1, jumlah: parseInt(e.target.value) || 1 }))} required />
              </div>
            )}

            {!meta.hasSKS && !meta.hasMahasiswa && (
              <div>
                <label className="label">Jumlah Kegiatan</label>
                <input type="number" min={1} className="input-field" value={form.jumlah}
                  onChange={e => setForm(p => ({ ...p, jumlah: parseInt(e.target.value) || 1 }))} />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="label">Keterangan</label>
              <input className="input-field" value={form.keterangan ?? ''} onChange={e => setForm(p => ({ ...p, keterangan: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 bg-blue-100 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="text-sm">
              <span className="text-gray-600">Preview AK: </span>
              <span className="font-bold text-blue-700 text-base">{previewAK}</span>
              <span className="text-gray-500 ml-1">AK</span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn-primary text-sm">Simpan</button>
            </div>
          </div>
        </form>
      )}

      {state.pelaksanaanPendidikan.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada data pelaksanaan pendidikan</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">Kegiatan</th>
                <th className="th">Detail</th>
                <th className="th text-right">AK</th>
                <th className="th w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.pelaksanaanPendidikan.map(item => {
                const m = AK_PELAKSANAAN[item.jenis];
                let detail = '';
                if (item.jenis === 'mengajar') {
                  detail = `${item.sks} SKS${item.teamTeaching ? ` (tim ${item.jumlahTeam})` : ''}, ${item.semester} ${item.tahunAkademik}`;
                } else if (m.hasMahasiswa) {
                  detail = `${item.jumlahMahasiswa ?? item.jumlah} mhs`;
                } else {
                  detail = `${item.jumlah}×`;
                }
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="td">
                      <div className="font-medium">{m.label}</div>
                      {item.mataKuliah && <div className="text-xs text-gray-400">{item.mataKuliah}</div>}
                      {item.keterangan && <div className="text-xs text-gray-400">{item.keterangan}</div>}
                    </td>
                    <td className="td text-gray-500">{detail}</td>
                    <td className="td text-right font-semibold text-blue-700">{item.ak}</td>
                    <td className="td">
                      <button onClick={() => deletePelaksanaan(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
            <span className="text-xs text-gray-500">Total Pelaksanaan Pendidikan</span>
            <span className="font-bold text-blue-700">{total} AK</span>
          </div>
        </div>
      )}
    </div>
  );
}
