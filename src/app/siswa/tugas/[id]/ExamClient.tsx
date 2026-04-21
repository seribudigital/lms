"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, FileText, Send, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startExam, submitExam } from "./actions";

export default function ExamClient({ tugas }: { tugas: any }) {
  const router = useRouter();
  const pengerjaanInfo = tugas.pengerjaan[0];
  const isStarted = pengerjaanInfo && pengerjaanInfo.status !== null;
  const isSelesai = pengerjaanInfo?.status === "SELESAI" || pengerjaanInfo?.status === "DINILAI";
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // State untuk menyimpan jawaban yang dipilih { soalId: pilihanId }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStart = async () => {
    setLoading(true);
    await startExam(tugas.id);
    setLoading(false);
  };

  const handleSubmit = async () => {
    // Validasi apakah dijawab semua
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < tugas.soal.length) {
      if (!window.confirm(`Anda baru menjawab ${answeredCount} dari ${tugas.soal.length} soal. Yakin ingin mengirim sekarang?`)) {
        return;
      }
    } else {
      if (!window.confirm("Kirim jawaban sekarang? Proses ini tidak dapat dibatalkan.")) {
        return;
      }
    }

    setLoading(true);
    const arr = Object.entries(answers).map(([soalId, pilihanId]) => ({ soalId, pilihanId }));
    const res = await submitExam(tugas.id, arr);
    setLoading(false);

    if (res.success) {
      showToast('success', `Terkumpul! Nilai Anda: ${res.nilai}`);
      setTimeout(() => router.push('/siswa/tugas'), 2000);
    } else {
      showToast('error', res.error || 'Terjadi kesalahan sistem');
    }
  };

  if (!isStarted) {
    return (
      <div className="font-sans text-white p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center mt-10 md:mt-20">
        <div className="bg-zinc-900/50 border border-white/10 p-10 md:p-16 rounded-3xl w-full text-center relative overflow-hidden backdrop-blur-xl shrink-0 shadow-[0_0_40px_rgba(249,115,22,0.05)]">
           <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none"></div>
           <BookOpen className="w-16 h-16 text-orange-500 mx-auto mb-6 relative z-10" />
           <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 relative z-10">{tugas.judul}</h1>
           <p className="text-zinc-400 mb-8 max-w-lg mx-auto relative z-10">{tugas.deskripsi || "Persiapkan diri Anda sebaik mungkin. Jangan lupa berdoa!"}</p>
           
           <div className="flex flex-wrap justify-center gap-6 mb-12 relative z-10">
              <div className="flex flex-col items-center p-4 bg-black/30 rounded-2xl border border-white/5 min-w-[120px]">
                <FileText className="w-6 h-6 text-orange-400 mb-2" />
                <span className="text-2xl font-bold">{tugas.soal.length}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Soal</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-black/30 rounded-2xl border border-white/5 min-w-[120px]">
                <Clock className="w-6 h-6 text-orange-400 mb-2" />
                <span className="text-2xl font-bold">{tugas.durasi}</span>
                <span className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Menit</span>
              </div>
           </div>

           <button 
             onClick={handleStart}
             disabled={loading}
             className="relative z-10 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-lg shadow-[0_0_30px_-5px_rgba(249,115,22,0.5)] transition-all hover:scale-105"
           >
             {loading ? 'Memuat...' : 'Mulai Ujian Sekarang'}
           </button>
           <div className="mt-6 relative z-10">
            <Link href="/siswa/tugas" className="text-zinc-400 hover:text-orange-400 text-sm">Kembali</Link>
           </div>
        </div>
      </div>
    );
  }

  // Jika sudah selesai
  if (isSelesai) {
    return (
      <div className="font-sans text-white p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center mt-10">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-10 md:p-16 rounded-3xl w-full text-center relative overflow-hidden backdrop-blur-xl">
           <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6 relative z-10" />
           <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">Ujian Telah Diselesaikan</h1>
           <p className="text-zinc-400 mb-8 relative z-10">Anda telah menyelesaikan tugas {tugas.judul}.</p>
           
           <div className="inline-block p-8 bg-black/30 rounded-2xl border border-emerald-500/20 mb-8 w-48 relative z-10">
              <span className="text-xs text-emerald-400/70 uppercase tracking-widest block mb-2 font-bold">NILAI ANDA</span>
              <span className="text-6xl font-black text-emerald-400">{pengerjaanInfo.nilai}</span>
           </div>

           <div className="relative z-10">
            <Link href="/siswa/tugas" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all inline-block border border-white/10">
              Kembali ke Daftar Tugas
            </Link>
           </div>
        </div>
      </div>
    );
  }

  // Tampilan Mengerjakan
  return (
    <div className="font-sans text-white p-4 md:p-8 max-w-4xl mx-auto pb-32">
       {/* Toast Notification */}
       {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Sticky Header with Timer MVP style (Just showing static duration for now) */}
      <div className="sticky top-4 z-40 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl mb-8 flex justify-between items-center px-6">
         <div>
            <h2 className="font-bold text-orange-500">{tugas.judul}</h2>
            <div className="text-xs text-zinc-400 mt-1">{Object.keys(answers).length} dari {tugas.soal.length} terjawab</div>
         </div>
         <button 
           onClick={handleSubmit}
           disabled={loading}
           className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)] transition-all transform hover:scale-105 disabled:opacity-50"
         >
            {loading ? 'Memproses...' : <><Send className="w-4 h-4" /> Kirim Jawaban</>}
         </button>
      </div>

      <div className="space-y-8">
        {tugas.soal.map((s: any, idx: number) => (
           <div key={s.id} className="bg-zinc-900/60 border border-white/5 hover:border-white/10 transition-colors rounded-3xl p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row gap-6">
                 {/* Nomor Soal Label */}
                 <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center border border-orange-500/20 shadow-inner">
                       {idx + 1}
                    </div>
                 </div>

                 <div className="flex-1 space-y-6">
                    <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-200 whitespace-pre-wrap">
                       {s.pertanyaan}
                    </p>

                    <div className="space-y-3">
                       {s.pilihanJawaban.map((pj: any) => {
                         const isSelected = answers[s.id] === pj.id;
                         return (
                           <div 
                             key={pj.id}
                             onClick={() => setAnswers(prev => ({...prev, [s.id]: pj.id}))}
                             className={`group flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-white/5'}`}
                           >
                             <div className="pt-0.5">
                                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-zinc-600 bg-transparent group-hover:border-zinc-400'}`}>
                                   {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white"></div>}
                                </div>
                             </div>
                             <div className="flex gap-3">
                                <span className={`font-bold mt-0.5 ${isSelected ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{pj.label}.</span>
                                <span className={`font-medium ${isSelected ? 'text-orange-200' : 'text-zinc-300 group-hover:text-zinc-200'}`}>{pj.teks}</span>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
}
