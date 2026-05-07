import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DupakState, RekapUnsur, EligibilityResult } from '../types';
import { AK_PELAKSANAAN, AK_PENELITIAN, AK_PENGABDIAN, AK_PENUNJANG } from './akTable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

export function generatePDF(
  state: DupakState,
  rekap: RekapUnsur,
  eligibility: EligibilityResult,
  grandTotal: number
) {
  const { profil } = state;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = margin;

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function addPage() {
    doc.addPage();
    y = margin;
  }

  function checkPage(needed = 20) {
    if (y + needed > 280) addPage();
  }

  function sectionHeader(roman: string, title: string, r: number, g: number, b: number) {
    checkPage(12);
    doc.setFillColor(r, g, b);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${roman}  ${title}`, margin + 3, y + 5);
    doc.setTextColor(0, 0, 0);
    y += 9;
  }

  // ── Page 1: Header ───────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DAFTAR USULAN PENETAPAN ANGKA KREDIT', pageW / 2, y + 6, { align: 'center' });
  doc.setFontSize(9);
  doc.text('JABATAN AKADEMIK DOSEN', pageW / 2, y + 12, { align: 'center' });
  y += 18;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Untuk Kenaikan ke: ${profil.jabatanTarget} (${profil.golonganTarget})`, pageW / 2, y, { align: 'center' });
  y += 8;

  doc.setDrawColor(0);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Section I: Biodata ───────────────────────────────────────────────────
  sectionHeader('I', 'KETERANGAN PERORANGAN', 50, 50, 50);

  const biodataRows: [string, string][] = [
    ['Nama', profil.nama || '—'],
    ['NIP', profil.nip || '—'],
    ['NIDN', profil.nidn || '—'],
    ['Tempat / Tgl Lahir', profil.tempatLahir && profil.tanggalLahir
      ? `${profil.tempatLahir}, ${new Date(profil.tanggalLahir).toLocaleDateString('id-ID')}`
      : '—'],
    ['Jenis Kelamin', profil.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
    ['Jabatan Akademik', profil.jabatanAkademik],
    ['Pangkat / Golongan', `${profil.pangkat || '—'} / ${profil.golongan}`],
    ['Perguruan Tinggi', profil.unitKerja || '—'],
    ['Fakultas / Prodi', `${profil.fakultas || '—'} / ${profil.programStudi || '—'}`],
    ['Bidang Ilmu', profil.bidangIlmu || '—'],
    ['Periode Penilaian', profil.periodeStart && profil.periodeEnd
      ? `${new Date(profil.periodeStart).toLocaleDateString('id-ID')} s.d. ${new Date(profil.periodeEnd).toLocaleDateString('id-ID')}`
      : '—'],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: biodataRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: contentW - 45 } },
    theme: 'plain',
    didParseCell: (data) => {
      if (data.column.index === 0) data.cell.styles.textColor = [80, 80, 80];
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section II: Pendidikan Formal ────────────────────────────────────────
  sectionHeader('II', 'UNSUR PENDIDIKAN FORMAL', 88, 28, 135);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Jenjang', 'Bidang Ilmu', 'Perguruan Tinggi', 'Tahun', 'AK']],
    body: state.pendidikanFormal.length
      ? state.pendidikanFormal.map((item, i) => [i + 1, item.jenjang, item.bidangIlmu, item.institusi, item.tahunLulus, item.ak])
      : [['', '', '', 'Tidak ada data', '', '']],
    foot: [['', '', '', '', 'Subtotal:', rekap.pendidikanFormal.toFixed(2)]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [200, 180, 230], textColor: [40, 0, 80] },
    footStyles: { fillColor: [230, 220, 245], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 5: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section III: Pelaksanaan Pendidikan ──────────────────────────────────
  checkPage(15);
  sectionHeader('III', 'PELAKSANAAN PENDIDIKAN', 37, 99, 235);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Kegiatan', 'Detail', 'Tahun', 'AK']],
    body: state.pelaksanaanPendidikan.length
      ? state.pelaksanaanPendidikan.map((item, i) => {
        const m = AK_PELAKSANAAN[item.jenis];
        const detail = item.jenis === 'mengajar'
          ? `${item.mataKuliah || ''}, ${item.sks} SKS${item.teamTeaching ? ` (tim ${item.jumlahTeam})` : ''}`
          : item.keterangan || '';
        return [i + 1, m.label, detail, item.tahunAkademik || '—', item.ak.toFixed(2)];
      })
      : [['', '', 'Tidak ada data', '', '']],
    foot: [['', '', '', 'Subtotal:', rekap.pelaksanaanPendidikan.toFixed(2)]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [180, 210, 255], textColor: [10, 50, 120] },
    footStyles: { fillColor: [220, 235, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 4: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section IV: Penelitian ────────────────────────────────────────────────
  checkPage(15);
  sectionHeader('IV', 'PENELITIAN', 22, 128, 58);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Judul / Jenis', 'Jurnal/Penerbit', 'Thn', 'Posisi', 'AK Dasar', 'AK Final']],
    body: state.penelitian.length
      ? state.penelitian.map((item, i) => {
        const posisiMap: Record<string, string> = { tunggal: '100%', pertama: '60%', kedua: '40%', ketiga_dst: '20%' };
        return [
          i + 1,
          `${item.judul}\n[${AK_PENELITIAN[item.jenis].label}]`,
          item.namaJurnal || item.penerbit || '—',
          item.tahun,
          posisiMap[item.posisiPenulis],
          item.akDasar,
          item.ak.toFixed(2),
        ];
      })
      : [['', '', 'Tidak ada data', '', '', '', '']],
    foot: [['', '', '', '', '', 'Subtotal:', rekap.penelitian.toFixed(2)]],
    margin: { left: margin, right: margin },
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [180, 230, 195], textColor: [10, 80, 30] },
    footStyles: { fillColor: [210, 240, 220], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 5: { halign: 'right' }, 6: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section V: Pengabdian ─────────────────────────────────────────────────
  checkPage(15);
  sectionHeader('V', 'PENGABDIAN KEPADA MASYARAKAT', 217, 119, 6);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Judul Kegiatan / Jenis', 'Tempat', 'Tahun', 'AK']],
    body: state.pengabdian.length
      ? state.pengabdian.map((item, i) => [
        i + 1,
        `${item.judul}\n[${AK_PENGABDIAN[item.jenis].label}]`,
        item.tempatKegiatan || '—',
        item.tahun,
        item.ak.toFixed(2),
      ])
      : [['', '', 'Tidak ada data', '', '']],
    foot: [
      ['', '', '', 'Total (raw):', rekap.pengabdian.toFixed(2)],
      ['', '', '', `Subtotal (cap 10% = ${eligibility.capPengabdian.max.toFixed(2)}):`, rekap.pengabdianCapped.toFixed(2)],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [255, 220, 170], textColor: [100, 50, 0] },
    footStyles: { fillColor: [255, 235, 200], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 4: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section VI: Penunjang ─────────────────────────────────────────────────
  checkPage(15);
  sectionHeader('VI', 'PENUNJANG TRIDHARMA', 161, 138, 0);

  autoTable(doc, {
    startY: y,
    head: [['No', 'Nama Kegiatan', 'Jenis', 'Tahun', 'AK']],
    body: state.penunjang.length
      ? state.penunjang.map((item, i) => [
        i + 1, item.nama, AK_PENUNJANG[item.jenis].label, item.tahun, item.ak.toFixed(2),
      ])
      : [['', '', 'Tidak ada data', '', '']],
    foot: [
      ['', '', '', 'Total (raw):', rekap.penunjang.toFixed(2)],
      ['', '', '', `Subtotal (cap 10% = ${eligibility.capPenunjang.max.toFixed(2)}):`, rekap.penunjangCapped.toFixed(2)],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 7.5, cellPadding: 1.5 },
    headStyles: { fillColor: [255, 240, 180], textColor: [80, 60, 0] },
    footStyles: { fillColor: [255, 248, 210], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 8 }, 4: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 6;

  // ── Section VII: Rekapitulasi ─────────────────────────────────────────────
  checkPage(60);
  sectionHeader('VII', 'REKAPITULASI ANGKA KREDIT', 30, 30, 30);

  autoTable(doc, {
    startY: y,
    head: [['Unsur', 'AK Diperhitungkan', '% dari AK Baru', 'Syarat Min.', 'Status']],
    body: [
      ['AK Kumulatif Lama', profil.akKumulatifLama.toString(), '—', '—', '—'],
      ['Pendidikan Formal', rekap.pendidikanFormal.toFixed(2), '—', '—', '—'],
      ['Pelaksanaan Pendidikan',
        rekap.pelaksanaanPendidikan.toFixed(2),
        rekap.totalNew > 0 ? `${((rekap.pelaksanaanPendidikan / rekap.totalNew) * 100).toFixed(1)}%` : '0%',
        `≥ ${eligibility.distribusiPendidikan.min}%`,
        eligibility.distribusiPendidikan.met ? '✓' : '✗'],
      ['Penelitian',
        rekap.penelitian.toFixed(2),
        rekap.totalNew > 0 ? `${((rekap.penelitian / rekap.totalNew) * 100).toFixed(1)}%` : '0%',
        `≥ ${eligibility.distribusiPenelitian.min}%`,
        eligibility.distribusiPenelitian.met ? '✓' : '✗'],
      ['Pengabdian (setelah cap)',
        rekap.pengabdianCapped.toFixed(2),
        rekap.totalNew > 0 ? `${((rekap.pengabdianCapped / rekap.totalNew) * 100).toFixed(1)}%` : '0%',
        '≤ 10%', '—'],
      ['Penunjang (setelah cap)',
        rekap.penunjangCapped.toFixed(2),
        rekap.totalNew > 0 ? `${((rekap.penunjangCapped / rekap.totalNew) * 100).toFixed(1)}%` : '0%',
        '≤ 10%', '—'],
    ],
    foot: [['TOTAL AK KUMULATIF', grandTotal.toFixed(2), '100%', `≥ ${eligibility.akTarget}`, eligibility.eligible ? '✓ LULUS' : '✗ BELUM']],
    margin: { left: margin, right: margin },
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    footStyles: {
      fillColor: eligibility.eligible ? [22, 163, 74] : [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'center' }, 4: { halign: 'center' } },
  });
  y = doc.lastAutoTable.finalY + 8;

  // ── Signature ──────────────────────────────────────────────────────────
  checkPage(45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`${profil.unitKerja || '.....................'}, ${today}`, pageW / 2, y, { align: 'center' });
  y += 6;

  const leftX = margin + 20;
  const rightX = pageW - margin - 20;

  doc.text('Yang Mengusulkan,', leftX, y, { align: 'center' });
  doc.text('Mengetahui,', rightX, y, { align: 'center' });
  y += 5;
  doc.setFontSize(7.5);
  doc.text('Dosen Pengusul', leftX, y, { align: 'center' });
  doc.text('Dekan / Pimpinan Unit Kerja', rightX, y, { align: 'center' });
  y += 20;

  doc.line(leftX - 25, y, leftX + 25, y);
  doc.line(rightX - 25, y, rightX + 25, y);
  y += 4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.text(profil.nama || '..............................', leftX, y, { align: 'center' });
  doc.text('..............................', rightX, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`NIP. ${profil.nip || '....................'}`, leftX, y, { align: 'center' });
  doc.text('NIP. ....................', rightX, y, { align: 'center' });

  // ── Footer ──────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `DUPAK — ${profil.nama || 'Dosen'} | Halaman ${i} dari ${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const filename = `DUPAK_${profil.nama?.replace(/\s+/g, '_') || 'Dosen'}_${profil.jabatanTarget.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
