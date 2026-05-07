import { useState } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { nidnService } from '../services/nidn.service';
import type { PDDIKTIDosenProfile, SINTAResult } from '../services/nidn.service';

interface NIDNLookupProps {
  onProfileFound: (profile: PDDIKTIDosenProfile) => void;
  onSINTAFound: (data: SINTAResult) => void;
}

type FetchStep = 'idle' | 'searching' | 'selecting' | 'fetching_detail' | 'done' | 'error';

export default function NIDNLookup({ onProfileFound, onSINTAFound }: NIDNLookupProps) {
  const [nidn, setNidn] = useState('');
  const [sintaId, setSintaId] = useState('');
  const [step, setStep] = useState<FetchStep>('idle');
  const [results, setResults] = useState<PDDIKTIDosenProfile[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [sintaStatus, setSintaStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [sintaPubCount, setSintaPubCount] = useState(0);

  const isLoadingPDDIKTI = step === 'searching' || step === 'fetching_detail';

  async function handleNIDNSearch() {
    if (!nidn || nidn.length < 10) {
      setErrorMsg('NIDN harus 10 digit');
      setStep('error');
      return;
    }
    setStep('searching');
    setErrorMsg('');
    setResults([]);

    try {
      const dosenList = await nidnService.searchByNIDN(nidn);
      if (dosenList.length === 0) {
        setErrorMsg('Data dosen tidak ditemukan di PDDIKTI. Periksa NIDN Anda atau isi data secara manual.');
        setStep('error');
        return;
      }
      if (dosenList.length === 1) {
        await selectDosen(dosenList[0]);
      } else {
        setResults(dosenList);
        setStep('selecting');
      }
    } catch {
      setErrorMsg('Gagal terhubung ke PDDIKTI. Silakan isi data secara manual.');
      setStep('error');
    }
  }

  async function selectDosen(dosen: PDDIKTIDosenProfile) {
    setStep('fetching_detail');
    try {
      const detail = await nidnService.getDosenDetail(dosen.id);
      onProfileFound({ ...dosen, ...detail });
    } catch {
      // Fallback: use search result directly if detail fetch fails
      onProfileFound(dosen);
    }
    setStep('done');
  }

  async function handleSINTAFetch() {
    if (!sintaId.trim()) {
      return;
    }
    setSintaStatus('loading');
    try {
      const data = await nidnService.fetchSINTA(sintaId.trim());
      onSINTAFound(data);
      setSintaPubCount(data.publications.total);
      setSintaStatus('done');
    } catch {
      setSintaStatus('error');
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Search size={15} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-blue-900">Ambil Data Otomatis</h3>
          <p className="text-sm text-blue-700 mt-0.5">
            Masukkan NIDN untuk mengambil profil dari PDDIKTI secara otomatis. Opsional: tambahkan SINTA ID untuk mengimpor data publikasi penelitian.
          </p>
          <p className="text-xs text-blue-500 mt-1 italic">
            Data diambil dari PDDIKTI dan SINTA secara otomatis. Mohon verifikasi keakuratan data sebelum mengajukan DUPAK resmi.
          </p>
        </div>
      </div>

      {/* PDDIKTI Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          NIDN <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">(10 digit)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nidn}
            onChange={e => setNidn(e.target.value.replace(/\D/g, '').slice(0, 10))}
            onKeyDown={e => e.key === 'Enter' && handleNIDNSearch()}
            placeholder="contoh: 0012345678"
            maxLength={10}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleNIDNSearch}
            disabled={isLoadingPDDIKTI}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {isLoadingPDDIKTI
              ? <><Loader2 size={15} className="animate-spin" /> Mencari...</>
              : <><Search size={15} /> Cari PDDIKTI</>
            }
          </button>
        </div>
      </div>

      {/* Multiple results — let user choose */}
      {step === 'selecting' && results.length > 0 && (
        <div className="mb-4 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <p className="text-sm font-medium text-gray-700 px-4 py-2 bg-gray-50 border-b">
            Ditemukan {results.length} dosen — pilih yang sesuai:
          </p>
          {results.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => selectDosen(d)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 transition-colors"
            >
              <p className="font-medium text-gray-900 text-sm">{d.nama}</p>
              <p className="text-xs text-gray-500">{d.nama_pt} — {d.nama_prodi}</p>
              <p className="text-xs text-blue-600">NIDN: {d.nidn}</p>
            </button>
          ))}
        </div>
      )}

      {/* PDDIKTI success */}
      {step === 'done' && (
        <div className="mb-4 flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
          <CheckCircle size={16} />
          <span>Data profil berhasil diambil dari PDDIKTI dan telah mengisi formulir di bawah.</span>
        </div>
      )}

      {/* PDDIKTI error */}
      {step === 'error' && errorMsg && (
        <div className="mb-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SINTA Section */}
      <div className="border-t border-blue-200 pt-4 mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SINTA ID
          <span className="text-gray-400 font-normal ml-1">(opsional — untuk impor data publikasi)</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Temukan SINTA ID Anda di{' '}
          <a
            href="https://sinta.kemdikbud.go.id/authors"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            sinta.kemdikbud.go.id/authors
          </a>
          {' '}— angka di URL profil Anda (misal: 6123456)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={sintaId}
            onChange={e => setSintaId(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && handleSINTAFetch()}
            placeholder="contoh: 6123456"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleSINTAFetch}
            disabled={sintaStatus === 'loading' || !sintaId.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {sintaStatus === 'loading'
              ? <><Loader2 size={15} className="animate-spin" /> Mengambil...</>
              : <><BookOpen size={15} /> Impor dari SINTA</>
            }
          </button>
        </div>

        {sintaStatus === 'done' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            <CheckCircle size={15} />
            <span>
              {sintaPubCount} publikasi dari SINTA berhasil diimpor ke tab Penelitian. Mohon konfirmasi jenis jurnal dan peran penulis.
            </span>
          </div>
        )}
        {sintaStatus === 'error' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            <AlertCircle size={15} className="flex-shrink-0" />
            <span>Gagal mengambil data SINTA. SINTA mungkin tidak tersedia saat ini — silakan isi data publikasi secara manual.</span>
          </div>
        )}
      </div>
    </div>
  );
}
