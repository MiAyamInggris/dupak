import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { User, ClipboardList, BarChart3, FileText, Save, Upload } from 'lucide-react';
import { DupakProvider, useDupak } from './context/DupakContext';
import ProfilDosen from './pages/ProfilDosen';
import InputKegiatan from './pages/InputKegiatan';
import Rekapitulasi from './pages/Rekapitulasi';
import DupakForm from './pages/DupakForm';
import type { DupakState } from './types';

const STEPS = [
  { path: '/', label: 'Profil Dosen', icon: User, step: 1 },
  { path: '/input-kegiatan', label: 'Input Kegiatan', icon: ClipboardList, step: 2 },
  { path: '/rekapitulasi', label: 'Rekapitulasi', icon: BarChart3, step: 3 },
  { path: '/dupak-form', label: 'Form DUPAK', icon: FileText, step: 4 },
];

function SaveLoadButtons() {
  const { state, loadState } = useDupak();

  function handleSave() {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dupak_${state.profil.nama?.replace(/\s+/g, '_') || 'data'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data: DupakState = JSON.parse(ev.target?.result as string);
        loadState(data);
      } catch {
        alert('File tidak valid');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleSave} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
        <Save size={13} /> Simpan JSON
      </button>
      <label className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer transition-colors">
        <Upload size={13} /> Muat JSON
        <input type="file" accept=".json" className="hidden" onChange={handleLoad} />
      </label>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm hidden sm:block">DUPAK</span>
            <span className="text-gray-300 hidden sm:block">|</span>
            <span className="text-xs text-gray-400 hidden sm:block">Daftar Usulan Penetapan Angka Kredit</span>
          </div>
          <SaveLoadButtons />
        </div>
      </header>

      {/* Step nav */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = location.pathname === step.path;
              return (
                <NavLink
                  key={step.path}
                  to={step.path}
                  className={({ isActive: a }) =>
                    `flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                      a
                        ? 'border-blue-600 text-blue-700 font-semibold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                    }`
                  }
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.step}
                  </span>
                  <Icon size={14} className="hidden sm:block" />
                  <span className="hidden md:block">{step.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-gray-100 mt-8 py-4 text-center text-xs text-gray-400">
        DUPAK Dosen · Semua perhitungan sesuai regulasi PAK Jabatan Akademik Dosen
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DupakProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><ProfilDosen /></Layout>} />
          <Route path="/input-kegiatan" element={<Layout><InputKegiatan /></Layout>} />
          <Route path="/rekapitulasi" element={<Layout><Rekapitulasi /></Layout>} />
          <Route path="/dupak-form" element={<Layout><DupakForm /></Layout>} />
        </Routes>
      </BrowserRouter>
    </DupakProvider>
  );
}
