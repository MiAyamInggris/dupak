import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, GraduationCap, BookOpen, FlaskConical, Heart, Star } from 'lucide-react';
import { useDupak } from '../context/DupakContext';
import PendidikanFormalTab from '../components/tabs/PendidikanFormalTab';
import PelaksanaanPendidikanTab from '../components/tabs/PelaksanaanPendidikanTab';
import PenelitianTab from '../components/tabs/PenelitianTab';
import PengabdianTab from '../components/tabs/PengabdianTab';
import PenunjangTab from '../components/tabs/PenunjangTab';

const TABS = [
  { id: 0, label: 'Pendidikan Formal', icon: GraduationCap, color: 'purple', unsur: 'Unsur Pendidikan' },
  { id: 1, label: 'Pelaksanaan Pendidikan', icon: BookOpen, color: 'blue', unsur: 'Unsur Pendidikan' },
  { id: 2, label: 'Penelitian', icon: FlaskConical, color: 'green', unsur: 'Unsur Penelitian' },
  { id: 3, label: 'Pengabdian', icon: Heart, color: 'orange', unsur: 'Unsur Pengabdian' },
  { id: 4, label: 'Penunjang', icon: Star, color: 'yellow', unsur: 'Unsur Penunjang' },
] as const;

const COLOR_MAP = {
  purple: { tab: 'border-purple-500 text-purple-700 bg-purple-50', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  blue: { tab: 'border-blue-500 text-blue-700 bg-blue-50', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  green: { tab: 'border-green-500 text-green-700 bg-green-50', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  orange: { tab: 'border-orange-500 text-orange-700 bg-orange-50', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  yellow: { tab: 'border-yellow-500 text-yellow-700 bg-yellow-50', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
};

export default function InputKegiatan() {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const { state } = useDupak();

  const counts = [
    state.pendidikanFormal.length,
    state.pelaksanaanPendidikan.length,
    state.penelitian.length,
    state.pengabdian.length,
    state.penunjang.length,
  ];

  const totals = [
    state.pendidikanFormal.reduce((s, i) => s + i.ak, 0),
    state.pelaksanaanPendidikan.reduce((s, i) => s + i.ak, 0),
    state.penelitian.reduce((s, i) => s + i.ak, 0),
    state.pengabdian.reduce((s, i) => s + i.ak, 0),
    state.penunjang.reduce((s, i) => s + i.ak, 0),
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Input Kegiatan</h1>
        <p className="text-sm text-gray-500">
          Masukkan semua kegiatan Tridharma selama periode penilaian.
          {state.profil.nama && <span className="font-medium text-gray-700"> — {state.profil.nama}</span>}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const colors = COLOR_MAP[tab.color];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                isActive
                  ? `${colors.tab} shadow-sm`
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.id + 1}</span>
              {counts[tab.id] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${colors.badge}`}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab header */}
      <div className="flex items-center gap-3 mb-4">
        {(() => {
          const tab = TABS[activeTab];
          const Icon = tab.icon;
          const colors = COLOR_MAP[tab.color];
          return (
            <>
              <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{tab.unsur}</span>
              <span className="text-gray-300">·</span>
              <Icon size={16} className="text-gray-500" />
              <h2 className="text-base font-semibold text-gray-800">{tab.label}</h2>
              {counts[activeTab] > 0 && (
                <span className="ml-auto text-sm font-bold text-gray-700">
                  Subtotal: <span className="text-blue-600">{totals[activeTab]} AK</span>
                </span>
              )}
            </>
          );
        })()}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[300px]">
        {activeTab === 0 && <PendidikanFormalTab />}
        {activeTab === 1 && <PelaksanaanPendidikanTab />}
        {activeTab === 2 && <PenelitianTab />}
        {activeTab === 3 && <PengabdianTab />}
        {activeTab === 4 && <PenunjangTab />}
      </div>

      {/* Summary bar */}
      <div className="mt-4 bg-gray-800 text-white rounded-xl px-5 py-3 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-gray-400">AK Baru:</span>
        {TABS.map((tab, i) => (
          <span key={tab.id} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${COLOR_MAP[tab.color].dot}`} />
            <span className="text-gray-300">{tab.label.split(' ')[0]}:</span>
            <span className="font-semibold">{totals[i]}</span>
          </span>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={() => navigate('/')} className="btn-secondary flex items-center gap-2">
          <ChevronLeft size={16} /> Profil Dosen
        </button>
        <div className="flex gap-2">
          {activeTab > 0 && (
            <button onClick={() => setActiveTab(t => t - 1)} className="btn-secondary text-sm">
              Tab Sebelumnya
            </button>
          )}
          {activeTab < 4 ? (
            <button onClick={() => setActiveTab(t => t + 1)} className="btn-primary text-sm">
              Tab Berikutnya
            </button>
          ) : (
            <button onClick={() => navigate('/rekapitulasi')} className="btn-primary flex items-center gap-2">
              Lihat Rekapitulasi <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
