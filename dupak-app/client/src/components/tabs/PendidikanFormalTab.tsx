import React, { useState } from 'react';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useDupak } from '../../context/DupakContext';
import { AK_PENDIDIKAN_FORMAL } from '../../utils/akTable';
import type { PendidikanFormal, JenjangPendidikan } from '../../types';

const JENJANG_OPTIONS: JenjangPendidikan[] = ['S1/D4', 'S2', 'S3'];

const empty = (): Omit<PendidikanFormal, 'id'> => ({
  jenjang: 'S3',
  bidangIlmu: '',
  institusi: '',
  tahunLulus: new Date().getFullYear(),
  ak: AK_PENDIDIKAN_FORMAL['S3'],
});

export default function PendidikanFormalTab() {
  const { state, addPendidikanFormal, deletePendidikanFormal } = useDupak();
  const [form, setForm] = useState(empty());
  const [showForm, setShowForm] = useState(false);

  function handleJenjang(j: JenjangPendidikan) {
    setForm(prev => ({ ...prev, jenjang: j, ak: AK_PENDIDIKAN_FORMAL[j] }));
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    addPendidikanFormal({ ...form, id: uuid() });
    setForm(empty());
    setShowForm(false);
  }

  const total = state.pendidikanFormal.reduce((s, i) => s + i.ak, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Catat jenjang pendidikan formal yang telah diselesaikan.</p>
          <p className="text-xs text-gray-400 mt-0.5">S1/D4 = 100 AK · S2 = 150 AK · S3 = 200 AK</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setShowForm(s => !s)}>
          <Plus size={15} /> Tambah
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="label">Jenjang <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jenjang} onChange={e => handleJenjang(e.target.value as JenjangPendidikan)} required>
                {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j} — {AK_PENDIDIKAN_FORMAL[j]} AK</option>)}
              </select>
            </div>
            <div>
              <label className="label">Bidang Ilmu <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.bidangIlmu} onChange={e => setForm(p => ({ ...p, bidangIlmu: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Perguruan Tinggi <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.institusi} onChange={e => setForm(p => ({ ...p, institusi: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Tahun Lulus <span className="text-red-500">*</span></label>
              <input type="number" className="input-field" value={form.tahunLulus} min={1970} max={2099}
                onChange={e => setForm(p => ({ ...p, tahunLulus: parseInt(e.target.value) || 0 }))} required />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-blue-700">AK: {form.ak}</span>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Batal</button>
              <button type="submit" className="btn-primary text-sm">Simpan</button>
            </div>
          </div>
        </form>
      )}

      {state.pendidikanFormal.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <GraduationCap size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada data pendidikan formal</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">Jenjang</th>
                <th className="th">Bidang Ilmu</th>
                <th className="th">Perguruan Tinggi</th>
                <th className="th">Tahun</th>
                <th className="th text-right">AK</th>
                <th className="th w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.pendidikanFormal.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="td font-medium">{item.jenjang}</td>
                  <td className="td">{item.bidangIlmu}</td>
                  <td className="td">{item.institusi}</td>
                  <td className="td">{item.tahunLulus}</td>
                  <td className="td text-right font-semibold text-blue-700">{item.ak}</td>
                  <td className="td">
                    <button onClick={() => deletePendidikanFormal(item.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
            <span className="text-xs text-gray-500">Total Pendidikan Formal</span>
            <span className="font-bold text-blue-700">{total} AK</span>
          </div>
        </div>
      )}
    </div>
  );
}
