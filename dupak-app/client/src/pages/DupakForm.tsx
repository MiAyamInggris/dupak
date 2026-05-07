import React, { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Printer, FileText } from 'lucide-react';
import { useDupak } from '../context/DupakContext';
import { checkEligibility, computeRekap } from '../utils/calculations';
import { getJabatanRequirement, AK_PELAKSANAAN, AK_PENELITIAN, AK_PENGABDIAN, AK_PENUNJANG } from '../utils/akTable';
import { generatePDF } from '../utils/pdfGenerator';

export default function DupakForm() {
  const navigate = useNavigate();
  const { state } = useDupak();
  const { profil } = state;
  const formRef = useRef<HTMLDivElement>(null);

  const req = getJabatanRequirement(profil.jabatanTarget, profil.golonganTarget);
  const akNeeded = req ? Math.max(req.akKumulatifTarget - profil.akKumulatifLama, 0) : 0;
  const rekap = useMemo(() => computeRekap(state, akNeeded), [state, akNeeded]);
  const eligibility = useMemo(() => checkEligibility(state), [state]);
  const grandTotal = profil.akKumulatifLama + rekap.pendidikanFormal + rekap.totalNew;

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  function handleDownloadPDF() {
    generatePDF(state, rekap, eligibility, grandTotal);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulir DUPAK</h1>
          <p className="text-sm text-gray-500">Daftar Usulan Penetapan Angka Kredit</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer size={15} /> Cetak
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 text-sm">
            <Download size={15} /> Unduh PDF
          </button>
        </div>
      </div>

      {/* Printable DUPAK Form */}
      <div ref={formRef} className="bg-white border border-gray-300 rounded-xl shadow-sm dupak-form print:shadow-none print:rounded-none">

        {/* Header */}
        <div className="border-b-2 border-gray-800 p-6 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">FORMULIR</p>
          <h2 className="text-xl font-bold text-gray-900">DAFTAR USULAN PENETAPAN ANGKA KREDIT</h2>
          <p className="text-sm text-gray-600 mt-1">JABATAN AKADEMIK DOSEN</p>
          <div className="mt-3 inline-block border border-gray-400 px-6 py-1">
            <p className="text-sm font-medium text-gray-700">
              Untuk Kenaikan ke: <strong>{profil.jabatanTarget} ({profil.golonganTarget})</strong>
            </p>
          </div>
        </div>

        {/* Section I: Biodata */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-gray-800 text-white text-xs flex items-center justify-center">I</span>
            KETERANGAN PERORANGAN
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['Nama', profil.nama || '—'],
              ['NIP', profil.nip || '—'],
              ['NIDN', profil.nidn || '—'],
              ['Tempat / Tgl Lahir', profil.tempatLahir && profil.tanggalLahir ? `${profil.tempatLahir}, ${new Date(profil.tanggalLahir).toLocaleDateString('id-ID')}` : '—'],
              ['Jenis Kelamin', profil.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
              ['Jabatan Akademik', profil.jabatanAkademik],
              ['Pangkat / Golongan', `${profil.pangkat || '—'} / ${profil.golongan}`],
              ['Perguruan Tinggi', profil.unitKerja || '—'],
              ['Fakultas', profil.fakultas || '—'],
              ['Program Studi', profil.programStudi || '—'],
              ['Bidang Ilmu', profil.bidangIlmu || '—'],
              ['Periode Penilaian', profil.periodeStart && profil.periodeEnd ? `${new Date(profil.periodeStart).toLocaleDateString('id-ID')} s.d. ${new Date(profil.periodeEnd).toLocaleDateString('id-ID')}` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-500 w-40 flex-shrink-0">{label}</span>
                <span className="text-gray-300 flex-shrink-0">:</span>
                <span className="font-medium text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section II: Unsur Pendidikan Formal */}
        <UnsurSection
          romanNum="II"
          title="UNSUR PENDIDIKAN FORMAL"
          color="purple"
        >
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak w-8">No</th>
                <th className="th-dupak">Jenjang</th>
                <th className="th-dupak">Bidang Ilmu</th>
                <th className="th-dupak">Perguruan Tinggi</th>
                <th className="th-dupak">Tahun Lulus</th>
                <th className="th-dupak text-right">AK</th>
              </tr>
            </thead>
            <tbody>
              {state.pendidikanFormal.length === 0
                ? <tr><td colSpan={6} className="td-dupak text-center text-gray-400">—</td></tr>
                : state.pendidikanFormal.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="td-dupak text-center">{i + 1}</td>
                    <td className="td-dupak font-medium">{item.jenjang}</td>
                    <td className="td-dupak">{item.bidangIlmu}</td>
                    <td className="td-dupak">{item.institusi}</td>
                    <td className="td-dupak text-center">{item.tahunLulus}</td>
                    <td className="td-dupak text-right font-semibold">{item.ak}</td>
                  </tr>
                ))
              }
              <SubtotalRow label="Subtotal Pendidikan Formal" ak={rekap.pendidikanFormal} />
            </tbody>
          </table>
        </UnsurSection>

        {/* Section III: Pelaksanaan Pendidikan */}
        <UnsurSection romanNum="III" title="PELAKSANAAN PENDIDIKAN" color="blue">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak w-8">No</th>
                <th className="th-dupak">Kegiatan</th>
                <th className="th-dupak">Detail</th>
                <th className="th-dupak">Tahun</th>
                <th className="th-dupak text-right">AK</th>
              </tr>
            </thead>
            <tbody>
              {state.pelaksanaanPendidikan.length === 0
                ? <tr><td colSpan={5} className="td-dupak text-center text-gray-400">—</td></tr>
                : state.pelaksanaanPendidikan.map((item, i) => {
                  const m = AK_PELAKSANAAN[item.jenis];
                  const detail = item.jenis === 'mengajar'
                    ? `${item.mataKuliah}, ${item.sks} SKS${item.teamTeaching ? ` (tim ${item.jumlahTeam})` : ''}, ${item.semester} ${item.tahunAkademik}`
                    : item.keterangan || '';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="td-dupak text-center">{i + 1}</td>
                      <td className="td-dupak font-medium">{m.label}</td>
                      <td className="td-dupak text-gray-600">{detail}</td>
                      <td className="td-dupak text-center">{item.tahunAkademik || '—'}</td>
                      <td className="td-dupak text-right font-semibold">{item.ak}</td>
                    </tr>
                  );
                })
              }
              <SubtotalRow label="Subtotal Pelaksanaan Pendidikan" ak={rekap.pelaksanaanPendidikan} />
            </tbody>
          </table>
        </UnsurSection>

        {/* Section IV: Penelitian */}
        <UnsurSection romanNum="IV" title="PENELITIAN" color="green">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak w-8">No</th>
                <th className="th-dupak">Judul / Jenis</th>
                <th className="th-dupak">Jurnal / Penerbit</th>
                <th className="th-dupak">Tahun</th>
                <th className="th-dupak">Posisi</th>
                <th className="th-dupak text-right">AK Dasar</th>
                <th className="th-dupak text-right">AK Final</th>
              </tr>
            </thead>
            <tbody>
              {state.penelitian.length === 0
                ? <tr><td colSpan={7} className="td-dupak text-center text-gray-400">—</td></tr>
                : state.penelitian.map((item, i) => {
                  const posisiLabel = { tunggal: '100%', pertama: '60%', kedua: '40%', ketiga_dst: '20%' }[item.posisiPenulis];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="td-dupak text-center">{i + 1}</td>
                      <td className="td-dupak">
                        <div className="font-medium leading-snug">{item.judul}</div>
                        <div className="text-gray-400">{AK_PENELITIAN[item.jenis].label}</div>
                      </td>
                      <td className="td-dupak text-gray-600">{item.namaJurnal || item.penerbit || '—'}</td>
                      <td className="td-dupak text-center">{item.tahun}</td>
                      <td className="td-dupak text-center">
                        <span className="bg-blue-100 text-blue-700 px-1 rounded text-xs">{posisiLabel}</span>
                      </td>
                      <td className="td-dupak text-right">{item.akDasar}</td>
                      <td className="td-dupak text-right font-semibold">{item.ak}</td>
                    </tr>
                  );
                })
              }
              <SubtotalRow label="Subtotal Penelitian" ak={rekap.penelitian} />
            </tbody>
          </table>
        </UnsurSection>

        {/* Section V: Pengabdian */}
        <UnsurSection romanNum="V" title="PENGABDIAN KEPADA MASYARAKAT" color="orange">
          <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded mb-2">
            Cap 10%: maks. {eligibility.capPengabdian.max.toFixed(2)} AK dari total yang dibutuhkan
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak w-8">No</th>
                <th className="th-dupak">Judul Kegiatan</th>
                <th className="th-dupak">Tempat</th>
                <th className="th-dupak">Tahun</th>
                <th className="th-dupak text-right">AK</th>
              </tr>
            </thead>
            <tbody>
              {state.pengabdian.length === 0
                ? <tr><td colSpan={5} className="td-dupak text-center text-gray-400">—</td></tr>
                : state.pengabdian.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="td-dupak text-center">{i + 1}</td>
                    <td className="td-dupak">
                      <div className="font-medium">{item.judul}</div>
                      <div className="text-gray-400">{AK_PENGABDIAN[item.jenis].label}</div>
                    </td>
                    <td className="td-dupak text-gray-600">{item.tempatKegiatan || '—'}</td>
                    <td className="td-dupak text-center">{item.tahun}</td>
                    <td className="td-dupak text-right font-semibold">{item.ak}</td>
                  </tr>
                ))
              }
              <tr className="bg-gray-50 text-xs text-gray-500">
                <td colSpan={4} className="td-dupak text-right">Total sebelum cap:</td>
                <td className="td-dupak text-right">{rekap.pengabdian.toFixed(2)}</td>
              </tr>
              <SubtotalRow label="Subtotal Pengabdian (setelah cap)" ak={rekap.pengabdianCapped} />
            </tbody>
          </table>
        </UnsurSection>

        {/* Section VI: Penunjang */}
        <UnsurSection romanNum="VI" title="PENUNJANG TRIDHARMA" color="yellow">
          <div className="text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded mb-2">
            Cap 10%: maks. {eligibility.capPenunjang.max.toFixed(2)} AK dari total yang dibutuhkan
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak w-8">No</th>
                <th className="th-dupak">Nama Kegiatan</th>
                <th className="th-dupak">Jenis</th>
                <th className="th-dupak">Tahun</th>
                <th className="th-dupak text-right">AK</th>
              </tr>
            </thead>
            <tbody>
              {state.penunjang.length === 0
                ? <tr><td colSpan={5} className="td-dupak text-center text-gray-400">—</td></tr>
                : state.penunjang.map((item, i) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="td-dupak text-center">{i + 1}</td>
                    <td className="td-dupak font-medium">{item.nama}</td>
                    <td className="td-dupak text-gray-600">{AK_PENUNJANG[item.jenis].label}</td>
                    <td className="td-dupak text-center">{item.tahun}</td>
                    <td className="td-dupak text-right font-semibold">{item.ak}</td>
                  </tr>
                ))
              }
              <tr className="bg-gray-50 text-xs text-gray-500">
                <td colSpan={4} className="td-dupak text-right">Total sebelum cap:</td>
                <td className="td-dupak text-right">{rekap.penunjang.toFixed(2)}</td>
              </tr>
              <SubtotalRow label="Subtotal Penunjang (setelah cap)" ak={rekap.penunjangCapped} />
            </tbody>
          </table>
        </UnsurSection>

        {/* Section VII: Grand Total */}
        <div className="p-6 border-t-2 border-gray-800">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-gray-800 text-white text-xs flex items-center justify-center">VII</span>
            REKAPITULASI ANGKA KREDIT
          </h3>
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="th-dupak">Unsur</th>
                <th className="th-dupak text-right">AK</th>
                <th className="th-dupak text-right">% dari AK Baru</th>
                <th className="th-dupak text-center">Syarat Min.</th>
                <th className="th-dupak text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="td-dupak">AK Kumulatif Lama</td>
                <td className="td-dupak text-right font-medium">{profil.akKumulatifLama}</td>
                <td className="td-dupak text-right text-gray-400">—</td>
                <td className="td-dupak text-center text-gray-400">—</td>
                <td className="td-dupak text-center text-gray-400">—</td>
              </tr>
              <tr>
                <td className="td-dupak">Pendidikan Formal</td>
                <td className="td-dupak text-right font-medium">{rekap.pendidikanFormal.toFixed(2)}</td>
                <td className="td-dupak text-right text-gray-400">—</td>
                <td className="td-dupak text-center text-gray-400">—</td>
                <td className="td-dupak text-center">✓</td>
              </tr>
              {[
                { label: 'Pelaksanaan Pendidikan', ak: rekap.pelaksanaanPendidikan, min: req?.minPendidikanPct, dist: eligibility.distribusiPendidikan },
                { label: 'Penelitian', ak: rekap.penelitian, min: req?.minPenelitianPct, dist: eligibility.distribusiPenelitian },
                { label: 'Pengabdian (setelah cap)', ak: rekap.pengabdianCapped, min: null, dist: null },
                { label: 'Penunjang (setelah cap)', ak: rekap.penunjangCapped, min: null, dist: null },
              ].map(row => {
                const pct = rekap.totalNew > 0 ? (row.ak / rekap.totalNew) * 100 : 0;
                return (
                  <tr key={row.label}>
                    <td className="td-dupak">{row.label}</td>
                    <td className="td-dupak text-right font-medium">{row.ak.toFixed(2)}</td>
                    <td className="td-dupak text-right">{pct.toFixed(1)}%</td>
                    <td className="td-dupak text-center text-gray-500">{row.min ? `≥ ${row.min}%` : '≤ 10%'}</td>
                    <td className="td-dupak text-center">
                      {row.dist ? (row.dist.met ? '✓' : '✗') : (row.ak <= (rekap.totalNew * 0.1 + 0.01) ? '✓' : '⚠')}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-600 text-white font-bold">
                <td className="td-dupak">TOTAL AK KUMULATIF</td>
                <td className="td-dupak text-right text-lg">{grandTotal.toFixed(2)}</td>
                <td className="td-dupak text-right">100%</td>
                <td className="td-dupak text-center">≥ {eligibility.akTarget}</td>
                <td className="td-dupak text-center text-lg">{eligibility.eligible ? '✓' : '✗'}</td>
              </tr>
            </tbody>
          </table>

          <div className={`mt-4 p-4 rounded-lg border-2 text-center font-bold text-lg ${eligibility.eligible ? 'border-green-400 bg-green-50 text-green-800' : 'border-red-400 bg-red-50 text-red-800'}`}>
            {eligibility.eligible
              ? `MEMENUHI SYARAT untuk kenaikan ke ${profil.jabatanTarget} (${profil.golonganTarget})`
              : `BELUM MEMENUHI SYARAT — Kekurangan ${eligibility.akGap.toFixed(2)} AK`
            }
          </div>
        </div>

        {/* Signature Section */}
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center text-sm">
              <p className="text-gray-600 mb-1">Yang Mengusulkan,</p>
              <p className="text-gray-500 text-xs mb-16">Dosen Pengusul</p>
              <div className="border-b border-gray-400 mb-1" />
              <p className="font-semibold">{profil.nama || '................................'}</p>
              <p className="text-gray-500 text-xs">NIP. {profil.nip || '...........................'}</p>
            </div>
            <div className="text-center text-sm">
              <p className="text-gray-600 mb-1">Mengetahui,</p>
              <p className="text-gray-500 text-xs mb-16">Dekan / Pimpinan Unit Kerja</p>
              <div className="border-b border-gray-400 mb-1" />
              <p className="font-semibold">.............................................</p>
              <p className="text-gray-500 text-xs">NIP. .............................</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">{profil.unitKerja || ''}, {today}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => navigate('/rekapitulasi')} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} /> Rekapitulasi
        </button>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer size={15} /> Cetak
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 text-sm">
            <Download size={15} /> Unduh PDF
            <FileText size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function UnsurSection({
  romanNum, title, color, children,
}: {
  romanNum: string;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-700',
    blue: 'bg-blue-700',
    green: 'bg-green-700',
    orange: 'bg-orange-600',
    yellow: 'bg-yellow-600',
  };
  return (
    <div className="border-b border-gray-200">
      <div className={`px-6 py-2 ${colorMap[color] ?? 'bg-gray-700'}`}>
        <h3 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
          <span className="w-5 h-5 rounded border border-white/50 text-white text-xs flex items-center justify-center font-bold">{romanNum}</span>
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SubtotalRow({ label, ak }: { label: string; ak: number }) {
  return (
    <tr className="bg-gray-100 font-semibold text-xs">
      <td colSpan={5} className="td-dupak text-right text-gray-600">{label}:</td>
      <td colSpan={2} className="td-dupak text-right text-gray-900">{ak.toFixed(2)} AK</td>
    </tr>
  );
}
