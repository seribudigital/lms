"use client";

import { useState } from "react";
import { Plus, X, CheckCircle2, AlertCircle, FileText, Clock, Users, ArrowRight } from "lucide-react";
import { createTugas } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TugasClient({ mapelData, tugasData }: { mapelData: any[], tugasData: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form states
  const [selectedMapelId, setSelectedMapelId] = useState("");
  const [selectedPertemuanId, setSelectedPertemuanId] = useState("");
  const [newPertemuanJudul, setNewPertemuanJudul] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  const selectedMapel = mapelData.find(m => m.id === selectedMapelId);
  const pertemuanList = selectedMapel?.pertemuan || [];

  const handleCloseModal = () => {
    setIsOpen(false);
    setSelectedMapelId("");
    setSelectedPertemuanId("");
    setNewPertemuanJudul("");
    setJudul("");
    setDeskripsi("");
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMapelId || !selectedPertemuanId || !judul) {
      showToast('error', 'Semua kolom utama wajib diisi');
      return;
    }

    if (selectedPertemuanId === "NEW" && !newPertemuanJudul) {
      showToast('error', 'Silakan ketik judul pertemuan baru');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('mapelId', selectedMapelId);
    formData.append('pertemuanId', selectedPertemuanId);
    if (selectedPertemuanId === "NEW") {
      formData.append('newPertemuanJudul', newPertemuanJudul);
    }
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);

    const res = await createTugas(formData);
    setLoading(false);

    if (res.success) {
      handleCloseModal();
      showToast('success', 'Tugas berhasil ditambahkan');
      router.push(`/guru/tugas/${res.id}`);
    } else {
      showToast('error', res.error || 'Terjadi kesalahan sistem');
    }
  };

  return (
    <div className="font-sans text-white p-4 md:p-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
            Kelola Tugas & Ujian
          </h1>
          <p className="text-zinc-400 mt-2">Buat soal dan pengerjaan untuk mengukur pemahaman siswa.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <Plus className="w-5 h-5" />
          Buat Tugas Ujian
        </button>
      </header>

      {/* Daftar Tugas (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tugasData.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
             <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
               <FileText className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-semibold text-zinc-300">Belum ada tugas</h3>
             <p className="text-zinc-500 mt-2">Mulai buat ujian baru untuk murid Anda.</p>
          </div>
        ) : (
          tugasData.map((tugas) => (
            <Link key={tugas.id} href={`/guru/tugas/${tugas.id}`} className="group border border-white/5 bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/80 transition-all flex flex-col relative overflow-hidden ring-1 ring-white/5 shadow-[0_0_20px_rgba(255,255,255,0.02)] h-full block">
               <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                   {tugas.pertemuan.mataPelajaran.nama}
                 </div>
                 <div className="text-xs text-zinc-500 flex items-center gap-1">
                   <Clock className="w-3 h-3" /> Pert. {tugas.pertemuan.urutanPertemuan}
                 </div>
               </div>

               <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-400 transition-colors line-clamp-2 relative z-10">
                 {tugas.judul}
               </h3>
               
               <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1 relative z-10">
                 {tugas.deskripsi || "Tanpa deskripsi"}
               </p>

               <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-500 font-medium relative z-10">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> {tugas._count.soal} Soal
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-emerald-300 transition-colors">
                        <Users className="w-3.5 h-3.5" /> {tugas._count.pengerjaan} Jawaban
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500">
                    Buka <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
               </div>
            </Link>
          ))
        )}
      </div>

      {/* Modal Tambah Tugas Sama Dengan Modal Materi */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="relative w-full max-w-xl bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-all animate-in zoom-in-95 duration-200">
            <div className="absolute inset-0 bg-emerald-500/5 blur-xl pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-xl font-bold text-white">Buat Tugas / Ujian</h2>
                <p className="text-xs text-zinc-400 mt-1">Siapkan cangkang ujian sebelum mengisi bank soal.</p>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 relative z-10 max-h-[70vh] overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Pilih Mapel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Mata Pelajaran</label>
                  <select 
                    value={selectedMapelId}
                    onChange={(e) => {
                      setSelectedMapelId(e.target.value);
                      setSelectedPertemuanId(""); // reset pertemuan
                      setNewPertemuanJudul("");
                    }}
                    required
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none transition-colors"
                  >
                    <option value="" disabled className="text-zinc-500">Pilih Mata Pelajaran</option>
                    {mapelData.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nama} - ({m.kelas.map((k: any) => k.nama).join(", ")})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pilih Pertemuan (Show only if Mapel selected) */}
                {selectedMapelId && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-medium text-emerald-400">Pertemuan</label>
                    <select 
                      value={selectedPertemuanId}
                      onChange={(e) => {
                        setSelectedPertemuanId(e.target.value);
                        setNewPertemuanJudul("");
                      }}
                      required
                      className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none transition-colors"
                    >
                      <option value="" disabled className="text-emerald-500/50">Pilih Pertemuan</option>
                      {pertemuanList.length === 0 ? (
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">Belum ada pertemuan di mapel ini</option>
                      ) : (
                        pertemuanList.map((p: any) => (
                          <option key={p.id} value={p.id} className="bg-zinc-900">
                            Pertemuan {p.urutanPertemuan}: {p.judul}
                          </option>
                        ))
                      )}
                      {/* Selalu tambahkan opsi pembuatan pertemuan baru */}
                      <option value="NEW" className="bg-zinc-900 text-emerald-400 font-bold">✨ + Buat Pertemuan Baru</option>
                    </select>
                  </div>
                )}

                {/* Input Pertemuan Baru Khusus jika dropdown bernilai "NEW" */}
                {selectedPertemuanId === "NEW" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 pl-4 border-l-2 border-emerald-500/50 ml-2 mt-3">
                    <label className="text-sm font-medium text-emerald-400">Judul Pertemuan Baru</label>
                    <input
                      type="text"
                      value={newPertemuanJudul}
                      onChange={(e) => setNewPertemuanJudul(e.target.value)}
                      required
                      placeholder="Contoh: Bab 1 - Bilangan Bulat"
                      className="w-full rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                    />
                  </div>
                )}

                {/* Judul Tugas */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Judul Ujian/Tugas</label>
                  <input
                    type="text"
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    required
                    placeholder="Contoh: Kuis Harian 1"
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors"
                  />
                </div>

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Deskripsi (Opsional)</label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    rows={3}
                    placeholder="Contoh: Kerjakan dengan jujur."
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-colors"
                  ></textarea>
                </div>

                {/* Footer Modal Actions */}
                <div className="pt-4 flex justify-end gap-3 mt-8 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedPertemuanId}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {loading ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : "Lanjut Buat Soal"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
