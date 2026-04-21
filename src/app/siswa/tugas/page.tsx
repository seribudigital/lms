import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { FileText, Clock, ChevronRight, CheckCircle2 } from "lucide-react";

export default async function SiswaTugasPage() {
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kelasId: true }
  });

  if (!dbUser?.kelasId) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-zinc-400">Anda belum terdaftar di kelas manapun.</div>
      </DashboardLayout>
    );
  }

  // Fetch Tugas for this student's class
  const tugasList = await prisma.tugas.findMany({
    where: {
      pertemuan: {
        mataPelajaran: {
          kelas: {
            some: { id: dbUser.kelasId }
          }
        }
      }
    },
    include: {
      pertemuan: {
        include: { mataPelajaran: true }
      },
      pengerjaan: {
        where: { siswaId: session.user.id }
      },
      _count: { select: { soal: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardLayout user={session.user}>
      <div className="font-sans text-white p-4 md:p-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Tugas & Ujian
          </h1>
          <p className="text-zinc-400 mt-2">Daftar evaluasi yang perlu Anda kerjakan.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tugasList.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
               <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
                 <FileText className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-semibold text-zinc-300">Belum ada tugas</h3>
               <p className="text-zinc-500 mt-2">Belum ada ujian dari guru Anda.</p>
            </div>
          ) : (
            tugasList.map((tugas) => {
              const pengerjaan = tugas.pengerjaan[0];
              const isSelesai = pengerjaan?.status === "SELESAI" || pengerjaan?.status === "DINILAI";

              return (
                <Link key={tugas.id} href={`/siswa/tugas/${tugas.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-3xl h-full">
                  <div className={`border bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/80 transition-all flex flex-col relative overflow-hidden ring-1 shadow-[0_0_20px_rgba(255,255,255,0.02)] h-full ${isSelesai ? 'border-zinc-500/50 ring-zinc-500/20 opacity-80' : 'border-white/5 ring-white/5 hover:ring-orange-500/30'}`}>
                     
                     {!isSelesai && <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>}
                     
                     <div className="flex justify-between items-start mb-4 relative z-10">
                       <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                         {tugas.pertemuan.mataPelajaran.nama}
                       </div>
                       
                       {isSelesai ? (
                         <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Selesai ({pengerjaan.nilai})
                         </div>
                       ) : (
                         <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] uppercase font-bold border border-white/10">
                            Durasi {tugas.durasi} Menit
                         </div>
                       )}
                     </div>

                     <h3 className={`text-lg font-bold mb-2 transition-colors line-clamp-2 relative z-10 ${isSelesai ? 'text-zinc-300' : 'text-zinc-100 group-hover:text-orange-400'}`}>
                       {tugas.judul}
                     </h3>
                     
                     <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1 relative z-10">
                       {tugas.deskripsi || "Tanpa deskripsi"}
                     </p>

                     <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-500 font-medium relative z-10">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" /> {tugas._count.soal} Soal
                        </div>
                        <div className={`flex items-center gap-1 ${isSelesai ? 'text-zinc-400' : 'text-orange-500'}`}>
                          {isSelesai ? 'Lihat Hasil' : 'Kerjakan'} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                     </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
