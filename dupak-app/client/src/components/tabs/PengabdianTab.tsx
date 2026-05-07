import React, { useState } from 'react';
import { Plus, Trash2, Heart, Pencil } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useDupak } from '../../context/DupakContext';
import { AK_PENGABDIAN } from '../../utils/akTable';
import type { KegiatanPengabdian, JenisPengabdian } from '../../types';

const JENIS_OPTIONS = Object.entries(AK_PENGABDIAN) as [JenisPengabdian, typeof AK_PENGABDIAN[JenisPengabdian]][];

function emptyForm(): Omit<KegiatanPengabdian, 'id'> {
  return {
    jenis: 'ketua_besar',
    judul: '',
    tempatKegiatan: '',
    lembagaMitra: '',
    tahun: new Date().getFullYear(),
    bukti: '',
    ak: AK_PENGABDIAN['ketua_besar'].ak,
  };
}

export default function PengabdianTab() {
  const { state, addPengabdian, updatePengabdian, deletePengabdian } = useDupak();
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleJenis(jenis: JenisPengabdian) {
    setForm(prev => ({ ...prev, jenis, ak: AK_PENGABDIAN[jenis].ak }));
  }

  function handleEdit(item: KegiatanPengabdian) {
    setForm({ jenis: item.jenis, judul: item.judul, tempatKegiatan: item.tempatKegiatan, lembagaMitra: item.lembagaMitra, tahun: item.tahun, bukti: item.bukti, ak: item.ak });
    setEditingId(item.id);
    setShowForm(true);
  }

  function handleCancel() {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      updatePengabdian({ ...form, id: editingId });
    } else {
      addPengabdian({ ...form, id: uuid() });
    }
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  }

  const total = state.pengabdian.reduce((s, i) => s + i.ak, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Kegiatan pengabdian kepada masyarakat (PKM).</p>
          <p className="text-xs text-orange-500 mt-0.5 font-medium">Maks. 10% dari total AK yang dibutuhkan untuk kenaikan jabatan</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setEditingId(null); setForm(emptyForm()); setShowForm(s => !s); }}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          {editingId && (
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Mode Edit</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="label">Jenis Kegiatan <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jenis} onChange={e => handleJenis(e.target.value as JenisPengabdian)} required>
                {JENIS_OPTIONS.map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — {v.ak} AK</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Judul Kegiatan <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Tempat Kegiatan</label>
              <input className="input-field" value={form.tempatKegiatan ?? ''} onChange={e => setForm(p => ({ ...p, tempatKegiatan: e.target.value }))} />
            </div>
            <div>
              <label className="label">Lembaga Mitra</label>
              <input className="input-field" value={form.lembagaMitra ?? ''} onChange={e => setForm(p => ({ ...p, lembagaMitra: e.target.value }))} />
            </div>
            <div>
              <label className="label">Tahun <span className="text-red-500">*</span></label>
              <input type="number" min={1990} max={2099} className="input-field" value={form.tahun}
                onChange={e => setForm(p => ({ ...p, tahun: parseInt(e.target.value) || 0 }))} required />
            </div>
            <div>
              <label className="label">No. SK / Bukti</label>
              <input className="input-field" value={form.bukti ?? ''} onChange={e => setForm(p => ({ ...p, bukti: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 bg-blue-100 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="text-sm">
              <span className="text-gray-600">AK: </span>
              <span className="font-bold text-blue-700 text-base">{form.ak}</span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={handleCancel}>Batal</button>
              <button type="submit" className="btn-primary text-sm">{editingId ? 'Perbarui' : 'Simpan'}</button>
            </div>
          </div>
        </form>
      )}

      {state.pengabdian.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Heart size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada data pengabdian kepada masyarakat</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">Kegiatan</th>
                <th className="th">Tempat / Mitra</th>
                <th className="th">Tahun</th>
                <th className="th text-right">AK</th>
                <th className="th w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.pengabdian.map(item => (
                <tr key={item.id} className={`hover:bg-gray-50 ${editingId === item.id ? 'bg-blue-50' : ''}`}>
                  <td className="td">
                    <div className="font-medium text-xs leading-snug max-w-xs">{item.judul}</div>
                    <div className="text-xs text-gray-400">{AK_PENGABDIAN[item.jenis].label}</div>
                  </td>
                  <td className="td text-gray-500 text-xs">{item.tempatKegiatan || item.lembagaMitra || '—'}</td>
                  <td className="td">{item.tahun}</td>
                  <td className="td text-right font-semibold text-blue-700">{item.ak}</td>
                  <td className="td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-600 p-1" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deletePengabdian(item.id)} className="text-red-400 hover:text-red-600 p-1" title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
            <span className="text-xs text-gray-500">Total Pengabdian (belum cap)</span>
            <span className="font-bold text-blue-700">{total} AK</span>
          </div>
        </div>
      )}
    </div>
  );
}
