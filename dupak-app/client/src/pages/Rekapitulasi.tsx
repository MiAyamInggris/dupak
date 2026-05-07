import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, TrendingUp, BookOpen, FlaskConical, Heart, Star, GraduationCap } from 'lucide-react';
import { useDupak } from '../context/DupakContext';
import { checkEligibility, computeRekap } from '../utils/calculations';
import { getJabatanRequirement } from '../utils/akTable';

function ProgressBar({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-400',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${colorMap[color] ?? 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatusBadge({ met }: { met: boolean }) {
  return met
    ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle size={11} /> Terpenuhi</span>
    : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><XCircle size={11} /> Belum</span>;
}

export default function Rekapitulasi() {
  const navigate = useNavigate();
  const { state } = useDupak();
  const { profil } = state;

  const req = getJabatanRequirement(profil.jabatanTarget, profil.golonganTarget);
  const akNeeded = req ? Math.max(req.akKumulatifTarget - profil.akKumulatifLama, 0) : 0;
  const rekap = useMemo(() => computeRekap(state, akNeeded), [state, akNeeded]);
  const eligibility = useMemo(() => checkEligibility(state), [state]);

  const unsurItems = [
    { label: 'Pendidikan Formal', ak: rekap.pendidikanFormal, icon: GraduationCap, color: 'purple' },
    { label: 'Pelaksanaan Pendidikan', ak: rekap.pelaksanaanPendidikan, icon: BookOpen, color: 'blue' },
    { label: 'Penelitian', ak: rekap.penelitian, icon: FlaskConical, color: 'green' },
    { label: 'Pengabdian (raw)', ak: rekap.pengabdian, icon: Heart, color: 'orange', capped: rekap.pengabdianCapped },
    { label: 'Penunjang (raw)', ak: rekap.penunjang, icon: Star, color: 'yellow', capped: rekap.penunjangCapped },
  ];

  const grandTotal = profil.akKumulatifLama + rekap.pendidikanFormal + rekap.totalNew;
  const akTarget = req?.akKumulatifTarget ?? 0;
  const totalProgress = akTarget > 0 ? Math.min((grandTotal / akTarget) * 100, 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rekapitulasi Angka Kredit</h1>
        <p className="text-sm text-gray-500">
          {profil.nama && <span className="font-medium">{profil.nama} · </span>}
          Target: {profil.jabatanTarget} ({profil.golonganTarget})
        </p>
      </div>

      {/* Eligibility Banner */}
      <div className={`rounded-xl p-5 border-2 ${eligibility.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-start gap-3">
          {eligibility.eligible
            ? <CheckCircle size={28} className="text-green-600 flex-shrink-0 mt-0.5" />
            : <XCircle size={28} className="text-red-500 flex-shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${eligibility.eligible ? 'text-green-800' : 'text-red-800'}`}>
              {eligibility.eligible ? 'MEMENUHI SYARAT KENAIKAN JABATAN' : 'BELUM MEMENUHI SYARAT'}
            </h2>
            <p className="text-sm mt-0.5 text-gray-600">
              Total AK Kumulatif: <strong>{grandTotal.toFixed(2)}</strong>
              {' '}/ Target: <strong>{akTarget}</strong>
              {eligibility.akGap > 0 && <span className="text-red-600"> (kurang {eligibility.akGap.toFixed(2)} AK)</span>}
            </p>
            {eligibility.issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {eligibility.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-red-700">
                    <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    {issue}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Total AK Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-500" /> Progres AK Kumulatif
        </h3>
        <div className="flex items-end gap-4 mb-3">
          <div>
            <div className="text-3xl font-bold text-gray-900">{grandTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Total AK saat ini</div>
          </div>
          <div className="text-gray-400 text-2xl">/</div>
          <div>
            <div className="text-2xl font-semibold text-gray-600">{akTarget}</div>
            <div className="text-sm text-gray-500">Target untuk {profil.jabatanTarget} ({profil.golonganTarget})</div>
          </div>
          <div className="ml-auto text-right">
            <div className={`text-2xl font-bold ${totalProgress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
              {totalProgress.toFixed(1)}%
            </div>
          </div>
        </div>
        <ProgressBar value={grandTotal} max={akTarget} color={totalProgress >= 100 ? 'green' : 'blue'} />

        <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-semibold text-gray-700">{profil.akKumulatifLama}</div>
            <div className="text-xs text-gray-500">AK Lama</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-blue-700">+{rekap.pendidikanFormal}</div>
            <div className="text-xs text-gray-500">Pend. Formal</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-blue-700">+{rekap.totalNew.toFixed(2)}</div>
            <div className="text-xs text-gray-500">AK Baru (Tridharma)</div>
          </div>
        </div>
      </div>

      {/* Unsur Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Rincian per Unsur</h3>
        <div className="space-y-3">
          {unsurItems.map(item => {
            const Icon = item.icon;
            const hasCap = item.capped !== undefined;
            const displayAK = hasCap ? item.capped : item.ak;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-${item.color}-100`}>
                  <Icon size={15} className={`text-${item.color}-600`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm font-bold text-gray-900 ml-2">
                      {displayAK.toFixed(2)} AK
                      {hasCap && item.ak !== item.capped && (
                        <span className="text-xs text-orange-500 ml-1">(dari {item.ak.toFixed(2)}, dikap)</span>
                      )}
                    </span>
                  </div>
                  <ProgressBar value={displayAK} max={Math.max(grandTotal, 1)} color={item.color === 'yellow' ? 'orange' : item.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution Check */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Cek Distribusi AK (dari AK Baru)</h3>
        <div className="space-y-4">
          {[eligibility.distribusiPendidikan, eligibility.distribusiPenelitian].map(dist => (
            <div key={dist.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge met={dist.met} />
                  <span className="text-sm font-medium text-gray-700">{dist.label}</span>
                </div>
                <div className="text-sm text-right">
                  <span className={`font-bold ${dist.met ? 'text-green-700' : 'text-red-700'}`}>{dist.actual.toFixed(1)}%</span>
                  <span className="text-gray-400 ml-1">/ min. {dist.min}%</span>
                </div>
              </div>
              <ProgressBar value={dist.actual} max={100} color={dist.met ? 'green' : 'red'} />
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          {[
            { label: 'Cap Pengabdian (maks 10%)', data: eligibility.capPengabdian },
            { label: 'Cap Penunjang (maks 10%)', data: eligibility.capPenunjang },
          ].map(({ label, data }) => (
            <div key={label} className={`rounded-lg p-3 border ${data.exceeded ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">{label}</span>
                {data.exceeded && <AlertTriangle size={13} className="text-orange-500" />}
              </div>
              <div className="text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Diinput:</span>
                  <span className="font-medium">{data.actual.toFixed(2)} AK</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Batas maks:</span>
                  <span className="font-medium">{data.max.toFixed(2)} AK</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1">
                  <span className="text-gray-500">Dihitung:</span>
                  <span className={`font-bold ${data.exceeded ? 'text-orange-600' : 'text-gray-800'}`}>{data.capped.toFixed(2)} AK</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="font-semibold text-gray-800">Tabel Rekapitulasi DUPAK</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-xs">
            <tr>
              <th className="th">Unsur</th>
              <th className="th text-right">AK Diinput</th>
              <th className="th text-right">AK Diperhitungkan</th>
              <th className="th text-right">% dari AK Baru</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="bg-gray-50">
              <td className="td font-medium text-gray-700">AK Kumulatif Lama</td>
              <td className="td text-right">{profil.akKumulatifLama}</td>
              <td className="td text-right font-semibold">{profil.akKumulatifLama}</td>
              <td className="td text-right text-gray-400">—</td>
            </tr>
            <tr>
              <td className="td font-medium text-gray-700">Pendidikan Formal</td>
              <td className="td text-right">{rekap.pendidikanFormal.toFixed(2)}</td>
              <td className="td text-right font-semibold">{rekap.pendidikanFormal.toFixed(2)}</td>
              <td className="td text-right text-gray-400">—</td>
            </tr>
            {[
              { label: 'Pelaksanaan Pendidikan', raw: rekap.pelaksanaanPendidikan, capped: rekap.pelaksanaanPendidikan },
              { label: 'Penelitian', raw: rekap.penelitian, capped: rekap.penelitian },
              { label: 'Pengabdian kepada Masyarakat', raw: rekap.pengabdian, capped: rekap.pengabdianCapped },
              { label: 'Penunjang Tridharma', raw: rekap.penunjang, capped: rekap.penunjangCapped },
            ].map(row => {
              const pct = rekap.totalNew > 0 ? (row.capped / rekap.totalNew) * 100 : 0;
              return (
                <tr key={row.label} className="hover:bg-gray-50">
                  <td className="td">{row.label}</td>
                  <td className="td text-right">{row.raw.toFixed(2)}</td>
                  <td className={`td text-right font-semibold ${row.raw !== row.capped ? 'text-orange-600' : ''}`}>
                    {row.capped.toFixed(2)}
                    {row.raw !== row.capped && <span className="text-xs ml-1">(dikap)</span>}
                  </td>
                  <td className="td text-right text-gray-600">{pct.toFixed(1)}%</td>
                </tr>
              );
            })}
            <tr className="bg-blue-50 font-bold">
              <td className="td text-blue-900">TOTAL AK KUMULATIF</td>
              <td className="td text-right text-blue-800">{grandTotal.toFixed(2)}</td>
              <td className="td text-right text-blue-900 text-base">{grandTotal.toFixed(2)}</td>
              <td className="td text-right text-blue-700">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button onClick={() => navigate('/input-kegiatan')} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} /> Input Kegiatan
        </button>
        <button onClick={() => navigate('/dupak-form')} className="btn-primary flex items-center gap-2">
          Cetak DUPAK <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
