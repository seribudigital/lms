"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Plus, X, List, Layers, Users, BookOpen, Printer } from "lucide-react";
import Link from "next/link";
import { createSoal } from "./actions";
import { useRouter } from "next/navigation";

export default function SoalClient({ tugas }: { tugas: any }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"SOAL" | "HASIL">("SOAL");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [pertanyaan, setPertanyaan] = useState("");
  const [teksA, setTeksA] = useState("");
  const [teksB, setTeksB] = useState("");
  const [teksC, setTeksC] = useState("");
  const [teksD, setTeksD] = useState("");
  const [kunci, setKunci] = useState<"A"|"B"|"C"|"D"|null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setPertanyaan("");
    setTeksA("");
    setTeksB("");
    setTeksC("");
    setTeksD("");
    setKunci(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kunci) {
      showToast('error', 'Kunci jawaban wajib dipilih');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('tugasId', tugas.id);
    formData.append('pertanyaan', pertanyaan);
    formData.append('teksA', teksA);
    formData.append('teksB', teksB);
    formData.append('teksC', teksC);
    formData.append('teksD', teksD);
    formData.append('kunci', kunci);

    const res = await createSoal(formData);
    setLoading(false);

    if (res.success) {
      handleCloseModal();
      showToast('success', 'Soal berhasil ditambahkan');
      router.refresh();
    } else {
      showToast('error', res.error || 'Terjadi kesalahan sistem');
    }
  };

  // Kalkulasi Rekap Semua Siswa
  const semuaSiswaMap = new Map();
  tugas.pertemuan?.mataPelajaran?.kelas?.forEach((k: any) => {
    k.siswa?.forEach((s: any) => {
      if (!semuaSiswaMap.has(s.id)) {
        semuaSiswaMap.set(s.id, s);
      }
    });
  });
  
  const semuaSiswa = Array.from(semuaSiswaMap.values())
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama));
  
  const pengerjaanBySiswa = new Map();
  tugas.pengerjaan?.forEach((p: any) => {
    pengerjaanBySiswa.set(p.siswaId, p);
  });

  const rekapSiswa = semuaSiswa.map((siswa: any) => {
    const p = pengerjaanBySiswa.get(siswa.id);
    return {
      id: siswa.id,
      nama: siswa.nama,
      pengerjaan: p,
      status: p ? (p.waktuSelesai ? 'Selesai' : 'Mengerjakan') : 'Belum Mengerjakan'
    };
  });

  return (
    <div className="font-sans text-white p-4 md:p-8 max-w-6xl mx-auto print:p-0 print:text-black print:bg-white print:max-w-none">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <Link 
        href="/guru/tugas" 
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 font-medium mb-6 transition-colors -ml-2 p-2 rounded-lg hover:bg-white/5 w-fit print:hidden"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tugas
      </Link>

      <header className="mb-8 border-b border-white/10 pb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-6 relative print:hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-500/20">
              {tugas.pertemuan.mataPelajaran.nama}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400 text-sm bg-black/30 px-3 py-1 rounded-lg border border-white/5">
              Pertemuan {tugas.pertemuan.urutanPertemuan}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
               Total Soal: {tugas.soal.length}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            {tugas.judul}
          </h1>
          <p className="text-zinc-400">{tugas.deskripsi || "Tanpa deskripsi"}</p>
        </div>

        {activeTab === "SOAL" && (
          <button 
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500 whitespace-nowrap relative z-10"
          >
            <Plus className="w-5 h-5" />
            Tambah Soal Pilihan Ganda
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar print:hidden">
        <button 
          onClick={() => setActiveTab("SOAL")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "SOAL" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          <Layers className="w-4 h-4" /> Bank Soal
        </button>
        <button 
          onClick={() => setActiveTab("HASIL")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "HASIL" ? "border-emerald-500 text-emerald-400" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
        >
          <Users className="w-4 h-4" /> Hasil & Rekapitulasi ({tugas.pengerjaan.length}/{semuaSiswa.length} Siswa)
        </button>
      </div>

      {/* Tab Content: SOAL */}
      {activeTab === "SOAL" && (
        <div className="space-y-6">
          {tugas.soal.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl bg-zinc-900/30 backdrop-blur-md">
              <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
                <List className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300">Bank Soal Kosong</h3>
              <p className="text-zinc-500 mt-2">Pastikan untuk mengisi bank soal agar siswa bisa mengerjakan ujian.</p>
            </div>
          ) : (
            tugas.soal.map((s: any, idx: number) => (
              <div key={s.id} className="bg-zinc-900/50 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm border border-emerald-500/20">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg text-zinc-100 font-medium mb-4 whitespace-pre-wrap">{s.pertanyaan}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {s.pilihanJawaban.map((pj: any) => (
                        <div key={pj.id} className={`flex items-center gap-3 p-3 rounded-xl border ${pj.isBenar ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/5 bg-black/20'}`}>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${pj.isBenar ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {pj.label}
                          </div>
                          <span className={`${pj.isBenar ? 'text-emerald-300 font-medium' : 'text-zinc-400'}`}>{pj.teks}</span>
                          {pj.isBenar && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: HASIL */}
      {activeTab === "HASIL" && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center print:hidden mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Rekapitulasi Nilai</h2>
              <p className="text-sm text-zinc-400">Total {semuaSiswa.length} siswa di kelas yang mengambil tugas ini.</p>
            </div>
            <button 
              onClick={() => window.print()} 
              className="inline-flex items-center gap-2 px-4 py-2 mt-2 sm:mt-0 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-zinc-400"
            >
              <Printer className="w-4 h-4" /> Cetak / Ekspor PDF
            </button>
          </div>

          {/* Title for Print Media Only */}
          <div className="hidden print:block mb-6 pt-4 text-center border-b pb-4">
            <h1 className="text-2xl font-bold uppercase mb-2">Rekapitulasi Nilai Siswa</h1>
            <p className="text-sm font-semibold">{tugas.pertemuan?.mataPelajaran?.nama} - Pertemuan {tugas.pertemuan?.urutanPertemuan}</p>
            <p className="text-sm">{tugas.judul}</p>
          </div>

          <div className="overflow-hidden border border-white/10 rounded-3xl bg-zinc-900/50 backdrop-blur-xl print:border-zinc-300 print:bg-transparent print:rounded-none">
            {rekapSiswa.length === 0 ? (
              <div className="py-20 text-center print:hidden">
                <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">Belum ada siswa di kelas mata pelajaran ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto print:overflow-visible">
                <table className="w-full text-left border-collapse print:border print:border-zinc-300">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 print:border-zinc-300 print:bg-zinc-100 text-xs uppercase tracking-wider text-zinc-400 print:text-zinc-800 font-semibold">
                      <th className="p-4 pl-6 print:py-2 print:border print:border-zinc-300">No</th>
                      <th className="p-4 print:py-2 print:border print:border-zinc-300">Nama Siswa</th>
                      <th className="p-4 print:py-2 print:border print:border-zinc-300">Status</th>
                      <th className="p-4 print:py-2 print:border print:border-zinc-300">Waktu Selesai</th>
                      <th className="p-4 text-center pr-6 print:py-2 print:border print:border-zinc-300 print:pr-4">Nilai (100)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 print:divide-zinc-300">
                    {rekapSiswa.map((siswa, idx) => (
                      <tr key={siswa.id} className={`hover:bg-white/5 transition-colors group print:text-black print:hover:bg-transparent ${!siswa.pengerjaan ? 'bg-black/20 print:bg-transparent' : ''}`}>
                        <td className="p-4 pl-6 text-zinc-500 font-medium print:py-2 print:border print:border-zinc-300 w-12">{idx + 1}</td>
                        <td className="p-4 text-zinc-200 font-medium print:text-black print:py-2 print:border print:border-zinc-300">{siswa.nama}</td>
                        <td className="p-4 print:py-2 print:border print:border-zinc-300">
                           {siswa.status === 'Selesai' ? (
                             <span className="text-emerald-400 font-medium text-sm print:text-black">Sudah Mengerjakan</span>
                           ) : siswa.status === 'Mengerjakan' ? (
                             <span className="text-blue-400 font-medium text-sm print:text-black">Sedang Mengerjakan</span>
                           ) : (
                             <span className="text-red-400 font-medium text-sm print:text-black">Belum Mengerjakan</span>
                           )}
                        </td>
                        <td className="p-4 text-zinc-400 text-sm print:text-black print:py-2 print:border print:border-zinc-300">
                          {siswa.pengerjaan?.waktuSelesai ? new Date(siswa.pengerjaan.waktuSelesai).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="p-4 text-center pr-6 print:py-2 print:border print:border-zinc-300 print:pr-4">
                          {siswa.pengerjaan && siswa.pengerjaan.nilai !== null ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold border print:border-none print:px-0 print:py-0 ${siswa.pengerjaan.nilai >= 70 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:text-black' : 'bg-red-500/10 text-red-400 border-red-500/20 print:text-black'}`}>
                              {siswa.pengerjaan.nilai}
                            </span>
                          ) : (
                            <span className="text-zinc-600 font-medium print:text-black">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Tambah Soal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950 relative z-20 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Tambah Soal Baru</h2>
                <p className="text-xs text-zinc-400 mt-1">Buat deskripsi soal dan opsi jawaban pilihan ganda.</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto relative z-10 custom-scrollbar">
              <form id="soal-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Pertanyaan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Pertanyaan Soal</label>
                  <textarea
                    value={pertanyaan}
                    onChange={(e) => setPertanyaan(e.target.value)}
                    required
                    rows={4}
                    placeholder="Ketik pertanyaan di sini..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-colors"
                  ></textarea>
                </div>

                {/* Pilihan Jawaban */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <label className="text-sm font-medium text-emerald-400">Opsi Jawaban & Kunci</label>
                    <span className="text-xs text-zinc-500">Klik radio box untuk set kunci jawaban</span>
                  </div>

                  {[
                    { label: "A", val: teksA, set: setTeksA },
                    { label: "B", val: teksB, set: setTeksB },
                    { label: "C", val: teksC, set: setTeksC },
                    { label: "D", val: teksD, set: setTeksD },
                  ].map((opt) => (
                    <div key={opt.label} className={`flex items-start gap-4 p-3 rounded-xl border transition-all ${kunci === opt.label ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/5 bg-zinc-900/30 hover:border-white/20'}`}>
                      <div className="pt-2 pl-1">
                        <label className="relative flex cursor-pointer items-center rounded-full">
                          <input 
                            type="radio" 
                            name="kunci_jawaban" 
                            className="peer sr-only" 
                            checked={kunci === opt.label}
                            onChange={() => setKunci(opt.label as any)}
                          />
                          <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${kunci === opt.label ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-500 bg-transparent'}`}>
                             {kunci === opt.label && <div className="h-2.5 w-2.5 rounded-full bg-white"></div>}
                          </div>
                        </label>
                      </div>
                      <div className="flex-1 flex gap-3">
                        <div className={`mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg font-bold text-sm ${kunci === opt.label ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/40 text-zinc-500'}`}>
                          {opt.label}
                        </div>
                        <textarea
                          value={opt.val}
                          onChange={(e) => opt.set(e.target.value)}
                          required
                          rows={2}
                          placeholder={`Teks pilihan ${opt.label}...`}
                          className={`w-full rounded-lg border-0 bg-black/20 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 resize-none text-sm transition-colors ${kunci === opt.label ? 'bg-emerald-500/5' : ''}`}
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div className="p-4 md:px-6 md:py-4 border-t border-white/10 bg-zinc-950 flex justify-end gap-3 shrink-0 relative z-20">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              >
                Batal
              </button>
              <button
                type="submit"
                form="soal-form"
                disabled={loading || !kunci}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Simpan Soal"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
