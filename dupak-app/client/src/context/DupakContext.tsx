import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import type {
  DupakState,
  ProfilDosen,
  PendidikanFormal,
  PelaksanaanPendidikan,
  KegiatanPenelitian,
  KegiatanPengabdian,
  KegiatanPenunjang,
  SINTAPublication,
} from '../types';
import { AK_PENELITIAN } from '../utils/akTable';
import { computeAKFromPenelitian, getAuthorshipPercentage } from '../utils/calculations';

const defaultProfil: ProfilDosen = {
  nama: '',
  nip: '',
  nidn: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: 'L',
  jabatanAkademik: 'Asisten Ahli',
  jabatanTarget: 'Lektor',
  pangkat: '',
  golongan: 'IIIb',
  golonganTarget: 'IIIc',
  unitKerja: '',
  fakultas: '',
  programStudi: '',
  bidangIlmu: '',
  periodeStart: '',
  periodeEnd: '',
  akKumulatifLama: 0,
};

const initialState: DupakState = {
  profil: defaultProfil,
  pendidikanFormal: [],
  pelaksanaanPendidikan: [],
  penelitian: [],
  pengabdian: [],
  penunjang: [],
};

type Action =
  | { type: 'SET_PROFIL'; payload: ProfilDosen }
  | { type: 'ADD_PENDIDIKAN_FORMAL'; payload: PendidikanFormal }
  | { type: 'UPDATE_PENDIDIKAN_FORMAL'; payload: PendidikanFormal }
  | { type: 'DELETE_PENDIDIKAN_FORMAL'; id: string }
  | { type: 'ADD_PELAKSANAAN'; payload: PelaksanaanPendidikan }
  | { type: 'UPDATE_PELAKSANAAN'; payload: PelaksanaanPendidikan }
  | { type: 'DELETE_PELAKSANAAN'; id: string }
  | { type: 'ADD_PENELITIAN'; payload: KegiatanPenelitian }
  | { type: 'ADD_PENELITIAN_BATCH'; payload: KegiatanPenelitian[] }
  | { type: 'UPDATE_PENELITIAN'; payload: KegiatanPenelitian }
  | { type: 'DELETE_PENELITIAN'; id: string }
  | { type: 'ADD_PENGABDIAN'; payload: KegiatanPengabdian }
  | { type: 'UPDATE_PENGABDIAN'; payload: KegiatanPengabdian }
  | { type: 'DELETE_PENGABDIAN'; id: string }
  | { type: 'ADD_PENUNJANG'; payload: KegiatanPenunjang }
  | { type: 'UPDATE_PENUNJANG'; payload: KegiatanPenunjang }
  | { type: 'DELETE_PENUNJANG'; id: string }
  | { type: 'LOAD_STATE'; payload: DupakState };

function reducer(state: DupakState, action: Action): DupakState {
  switch (action.type) {
    case 'SET_PROFIL':
      return { ...state, profil: action.payload };

    case 'ADD_PENDIDIKAN_FORMAL':
      return { ...state, pendidikanFormal: [...state.pendidikanFormal, action.payload] };
    case 'UPDATE_PENDIDIKAN_FORMAL':
      return { ...state, pendidikanFormal: state.pendidikanFormal.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_PENDIDIKAN_FORMAL':
      return { ...state, pendidikanFormal: state.pendidikanFormal.filter(i => i.id !== action.id) };

    case 'ADD_PELAKSANAAN':
      return { ...state, pelaksanaanPendidikan: [...state.pelaksanaanPendidikan, action.payload] };
    case 'UPDATE_PELAKSANAAN':
      return { ...state, pelaksanaanPendidikan: state.pelaksanaanPendidikan.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_PELAKSANAAN':
      return { ...state, pelaksanaanPendidikan: state.pelaksanaanPendidikan.filter(i => i.id !== action.id) };

    case 'ADD_PENELITIAN':
      return { ...state, penelitian: [...state.penelitian, action.payload] };
    case 'ADD_PENELITIAN_BATCH':
      return { ...state, penelitian: [...state.penelitian, ...action.payload] };
    case 'UPDATE_PENELITIAN':
      return { ...state, penelitian: state.penelitian.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_PENELITIAN':
      return { ...state, penelitian: state.penelitian.filter(i => i.id !== action.id) };

    case 'ADD_PENGABDIAN':
      return { ...state, pengabdian: [...state.pengabdian, action.payload] };
    case 'UPDATE_PENGABDIAN':
      return { ...state, pengabdian: state.pengabdian.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_PENGABDIAN':
      return { ...state, pengabdian: state.pengabdian.filter(i => i.id !== action.id) };

    case 'ADD_PENUNJANG':
      return { ...state, penunjang: [...state.penunjang, action.payload] };
    case 'UPDATE_PENUNJANG':
      return { ...state, penunjang: state.penunjang.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_PENUNJANG':
      return { ...state, penunjang: state.penunjang.filter(i => i.id !== action.id) };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface DupakContextValue {
  state: DupakState;
  setProfil: (p: ProfilDosen) => void;
  addPendidikanFormal: (i: PendidikanFormal) => void;
  updatePendidikanFormal: (i: PendidikanFormal) => void;
  deletePendidikanFormal: (id: string) => void;
  addPelaksanaan: (i: PelaksanaanPendidikan) => void;
  updatePelaksanaan: (i: PelaksanaanPendidikan) => void;
  deletePelaksanaan: (id: string) => void;
  addPenelitian: (i: KegiatanPenelitian) => void;
  updatePenelitian: (i: KegiatanPenelitian) => void;
  deletePenelitian: (id: string) => void;
  addPengabdian: (i: KegiatanPengabdian) => void;
  updatePengabdian: (i: KegiatanPengabdian) => void;
  deletePengabdian: (id: string) => void;
  addPenunjang: (i: KegiatanPenunjang) => void;
  updatePenunjang: (i: KegiatanPenunjang) => void;
  deletePenunjang: (id: string) => void;
  addPublikasiFromSINTA: (pubs: SINTAPublication[]) => void;
  loadState: (s: DupakState) => void;
}

const DupakContext = createContext<DupakContextValue | null>(null);

export function DupakProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setProfil = useCallback((p: ProfilDosen) => dispatch({ type: 'SET_PROFIL', payload: p }), []);
  const addPendidikanFormal = useCallback((i: PendidikanFormal) => dispatch({ type: 'ADD_PENDIDIKAN_FORMAL', payload: i }), []);
  const updatePendidikanFormal = useCallback((i: PendidikanFormal) => dispatch({ type: 'UPDATE_PENDIDIKAN_FORMAL', payload: i }), []);
  const deletePendidikanFormal = useCallback((id: string) => dispatch({ type: 'DELETE_PENDIDIKAN_FORMAL', id }), []);
  const addPelaksanaan = useCallback((i: PelaksanaanPendidikan) => dispatch({ type: 'ADD_PELAKSANAAN', payload: i }), []);
  const updatePelaksanaan = useCallback((i: PelaksanaanPendidikan) => dispatch({ type: 'UPDATE_PELAKSANAAN', payload: i }), []);
  const deletePelaksanaan = useCallback((id: string) => dispatch({ type: 'DELETE_PELAKSANAAN', id }), []);
  const addPenelitian = useCallback((i: KegiatanPenelitian) => dispatch({ type: 'ADD_PENELITIAN', payload: i }), []);
  const updatePenelitian = useCallback((i: KegiatanPenelitian) => dispatch({ type: 'UPDATE_PENELITIAN', payload: i }), []);
  const deletePenelitian = useCallback((id: string) => dispatch({ type: 'DELETE_PENELITIAN', id }), []);
  const addPengabdian = useCallback((i: KegiatanPengabdian) => dispatch({ type: 'ADD_PENGABDIAN', payload: i }), []);
  const updatePengabdian = useCallback((i: KegiatanPengabdian) => dispatch({ type: 'UPDATE_PENGABDIAN', payload: i }), []);
  const deletePengabdian = useCallback((id: string) => dispatch({ type: 'DELETE_PENGABDIAN', id }), []);
  const addPenunjang = useCallback((i: KegiatanPenunjang) => dispatch({ type: 'ADD_PENUNJANG', payload: i }), []);
  const updatePenunjang = useCallback((i: KegiatanPenunjang) => dispatch({ type: 'UPDATE_PENUNJANG', payload: i }), []);
  const deletePenunjang = useCallback((id: string) => dispatch({ type: 'DELETE_PENUNJANG', id }), []);
  const loadState = useCallback((s: DupakState) => dispatch({ type: 'LOAD_STATE', payload: s }), []);

  const addPublikasiFromSINTA = useCallback((pubs: SINTAPublication[]) => {
    const mapped: KegiatanPenelitian[] = pubs.map(pub => {
      const jenis = pub.type === 'scopus' ? 'jurnal_intl_q1q2' as const : 'jurnal_nas_s1s2' as const;
      const akDasar = AK_PENELITIAN[jenis].akDasar;
      const persentaseAuthor = getAuthorshipPercentage('pertama') * 100;
      const ak = computeAKFromPenelitian({ jenis, akDasar, posisiPenulis: 'pertama', persentaseAuthor, jumlahPenulis: 1, judul: pub.title, tahun: pub.year });
      return {
        id: uuid(),
        jenis,
        judul: pub.title,
        namaJurnal: pub.journal,
        tahun: pub.year,
        posisiPenulis: 'pertama',
        jumlahPenulis: 1,
        akDasar,
        persentaseAuthor,
        ak,
        needsReview: true,
      };
    });
    dispatch({ type: 'ADD_PENELITIAN_BATCH', payload: mapped });
  }, []);

  return (
    <DupakContext.Provider value={{
      state,
      setProfil, addPendidikanFormal, updatePendidikanFormal, deletePendidikanFormal,
      addPelaksanaan, updatePelaksanaan, deletePelaksanaan,
      addPenelitian, updatePenelitian, deletePenelitian,
      addPengabdian, updatePengabdian, deletePengabdian,
      addPenunjang, updatePenunjang, deletePenunjang,
      addPublikasiFromSINTA,
      loadState,
    }}>
      {children}
    </DupakContext.Provider>
  );
}

export function useDupak(): DupakContextValue {
  const ctx = useContext(DupakContext);
  if (!ctx) throw new Error('useDupak must be used within DupakProvider');
  return ctx;
}
