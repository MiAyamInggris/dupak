import React, { useState } from 'react';
import { Plus, Trash2, FlaskConical, Pencil } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useDupak } from '../../context/DupakContext';
import { AK_PENELITIAN } from '../../utils/akTable';
import { computeAKFromPenelitian, getAuthorshipPercentage } from '../../utils/calculations';
import type { KegiatanPenelitian, JenisPenelitian, PosisiPenulis } from '../../types';

const JENIS_OPTIONS = Object.entries(AK_PENELITIAN) as [JenisPenelitian, typeof AK_PENELITIAN[JenisPenelitian]][];
const POSISI_OPTIONS: { value: PosisiPenulis; label: string; pct: string }[] = [
  { value: 'tunggal', label: 'Penulis Tunggal', pct: '100%' },
  { value: 'pertama', label: 'Penulis Pertama / Corresponding', pct: '60%' },
  { value: 'kedua', label: 'Penulis Kedua (Co-Author)', pct: '40%' },
  { value: 'ketiga_dst', label: 'Penulis Ketiga dst.', pct: '20%' },
];

function emptyForm(): Omit<KegiatanPenelitian, 'id' | 'ak'> {
  return {
    jenis: 'jurnal_intl_q1q2',
    judul: '',
    namaJurnal: '',
    penerbit: '',
    volume: '',
    nomor: '',
    tahun: new Date().getFullYear(),
    isbn: '',
    issn: '',
    posisiPenulis: 'pertama',
    jumlahPenulis: 2,
    akDasar: AK_PENELITIAN['jurnal_intl_q1q2'].akDasar,
    persentaseAuthor: 60,
  };
}

export default function PenelitianTab() {
  const { state, addPenelitian, updatePenelitian, deletePenelitian } = useDupak();
  const [form, setForm] = useState(emptyForm());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const meta = AK_PENELITIAN[form.jenis];
  const previewAK = computeAKFromPenelitian({ ...form });
  const authorPct = getAuthorshipPercentage(form.posisiPenulis) * 100;

  function handleJenis(jenis: JenisPenelitian) {
    const m = AK_PENELITIAN[jenis];
    setForm(prev => ({ ...prev, jenis, akDasar: m.akDasar }));
  }

  function handlePosisi(posisi: PosisiPenulis) {
    setForm(prev => ({ ...prev, posisiPenulis: posisi, persentaseAuthor: getAuthorshipPercentage(posisi) * 100 }));
  }

  function handleEdit(item: KegiatanPenelitian) {
    setForm({
      jenis: item.jenis,
      judul: item.judul,
      namaJurnal: item.namaJurnal,
      penerbit: item.penerbit,
      volume: item.volume,
      nomor: item.nomor,
      tahun: item.tahun,
      isbn: item.isbn,
      issn: item.issn,
      posisiPenulis: item.posisiPenulis,
      jumlahPenulis: item.jumlahPenulis,
      akDasar: item.akDasar,
      persentaseAuthor: item.persentaseAuthor,
    });
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
    const ak = computeAKFromPenelitian({ ...form });
    if (editingId) {
      updatePenelitian({ ...form, id: editingId, ak });
    } else {
      addPenelitian({ ...form, id: uuid(), ak });
    }
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  }

  const total = state.penelitian.reduce((s, i) => s + i.ak, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Publikasi ilmiah, buku, paten, dan kegiatan penelitian lainnya.</p>
          <p className="text-xs text-gray-400 mt-0.5">Formula penulis: Tunggal=100% · Pertama=60% · Kedua=40% · Ketiga+=20%</p>
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
              <label className="label">Jenis Publikasi / Kegiatan <span className="text-red-500">*</span></label>
              <select className="input-field" value={form.jenis} onChange={e => handleJenis(e.target.value as JenisPenelitian)} required>
                {JENIS_OPTIONS.map(([k, v]) => (
                  <option key={k} value={k}>{v.label} — {v.akDasar} AK</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Judul <span className="text-red-500">*</span></label>
              <input className="input-field" value={form.judul} onChange={e => setForm(p => ({ ...p, judul: e.target.value }))} required />
            </div>

            {(form.jenis.startsWith('jurnal') || form.jenis.startsWith('prosiding')) && (
              <>
                <div>
                  <label className="label">Nama Jurnal / Prosiding <span className="text-red-500">*</span></label>
                  <input className="input-field" value={form.namaJurnal ?? ''} onChange={e => setForm(p => ({ ...p, namaJurnal: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">ISSN</label>
                  <input className="input-field" value={form.issn ?? ''} onChange={e => setForm(p => ({ ...p, issn: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Volume</label>
                  <input className="input-field" value={form.volume ?? ''} onChange={e => setForm(p => ({ ...p, volume: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Nomor</label>
                  <input className="input-field" value={form.nomor ?? ''} onChange={e => setForm(p => ({ ...p, nomor: e.target.value }))} />
                </div>
              </>
            )}

            {(form.jenis.includes('buku') || form.jenis.includes('monografi')) && (
              <>
                <div>
                  <label className="label">Penerbit</label>
                  <input className="input-field" value={form.penerbit ?? ''} onChange={e => setForm(p => ({ ...p, penerbit: e.target.value }))} />
                </div>
                <div>
                  <label className="label">ISBN</label>
                  <input className="input-field" value={form.isbn ?? ''} onChange={e => setForm(p => ({ ...p, isbn: e.target.value }))} />
                </div>
              </>
            )}

            <div>
              <label className="label">Tahun <span className="text-red-500">*</span></label>
              <input type="number" min={1990} max={2099} className="input-field" value={form.tahun}
                onChange={e => setForm(p => ({ ...p, tahun: parseInt(e.target.value) || 0 }))} required />
            </div>

            {meta.hasAuthorship && (
              <>
                <div>
                  <label className="label">Posisi Penulis <span className="text-red-500">*</span></label>
                  <select className="input-field" value={form.posisiPenulis} onChange={e => handlePosisi(e.target.value as PosisiPenulis)}>
                    {POSISI_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label} ({o.pct})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Jumlah Penulis</label>
                  <input type="number" min={1} max={20} className="input-field" value={form.jumlahPenulis}
                    onChange={e => setForm(p => ({ ...p, jumlahPenulis: parseInt(e.target.value) || 1 }))} />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 bg-blue-100 -mx-4 -mb-4 px-4 py-3 rounded-b-lg">
            <div className="text-sm space-y-0.5">
              <div>
                <span className="text-gray-600">AK Dasar: </span>
                <span className="font-medium">{meta.akDasar}</span>
                {meta.hasAuthorship && (
                  <span className="text-gray-500"> × {authorPct}% = </span>
                )}
                <span className="font-bold text-blue-700 text-base ml-1">{previewAK} AK</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary text-sm" onClick={handleCancel}>Batal</button>
              <button type="submit" className="btn-primary text-sm">{editingId ? 'Perbarui' : 'Simpan'}</button>
            </div>
          </div>
        </form>
      )}

      {state.penelitian.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FlaskConical size={40} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada data penelitian</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="th">Publikasi / Kegiatan</th>
                <th className="th">Jurnal/Penerbit</th>
                <th className="th">Tahun</th>
                <th className="th">Posisi</th>
                <th className="th text-right">AK Dasar</th>
                <th className="th text-right">AK Final</th>
                <th className="th w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.penelitian.map(item => {
                const m = AK_PENELITIAN[item.jenis];
                const posisi = POSISI_OPTIONS.find(p => p.value === item.posisiPenulis);
                return (
                  <tr key={item.id} className={`hover:bg-gray-50 ${editingId === item.id ? 'bg-blue-50' : ''}`}>
                    <td className="td">
                      <div className="font-medium text-xs leading-snug max-w-xs">{item.judul}</div>
                      <div className="text-xs text-gray-400">{m.label}</div>
                    </td>
                    <td className="td text-gray-500 text-xs">{item.namaJurnal || item.penerbit || '—'}</td>
                    <td className="td">{item.tahun}</td>
                    <td className="td">
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {posisi?.pct}
                      </span>
                    </td>
                    <td className="td text-right text-gray-500">{item.akDasar}</td>
                    <td className="td text-right font-semibold text-blue-700">{item.ak}</td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(item)} className="text-blue-400 hover:text-blue-600 p-1" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deletePenelitian(item.id)} className="text-red-400 hover:text-red-600 p-1" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bg-gray-50 px-4 py-2 flex justify-between items-center border-t">
            <span className="text-xs text-gray-500">Total Penelitian</span>
            <span className="font-bold text-blue-700">{total} AK</span>
          </div>
        </div>
      )}
    </div>
  );
}
