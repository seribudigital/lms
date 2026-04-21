import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";

export default async function SiswaMateriPage() {
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  // Get User's kelasId
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kelasId: true }
  });

  if (!dbUser?.kelasId) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-4 md:p-8 text-white text-center">
          <p className="text-zinc-400">Anda belum terdaftar di kelas manapun.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Find materi intended for this class
  const materiList = await prisma.materi.findMany({
    where: {
      pertemuan: {
        mataPelajaran: {
          kelas: {
            some: {
              id: dbUser.kelasId
            }
          }
        }
      }
    },
    include: {
      pertemuan: {
        include: {
          mataPelajaran: true
        }
      }
    },
    orderBy: [
      { pertemuan: { mataPelajaranId: 'asc' } },
      { pertemuan: { urutanPertemuan: 'asc' } },
      { urutan: 'asc' }
    ]
  });

  return (
    <DashboardLayout user={session.user}>
      <div className="font-sans text-white p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Jelajahi Materi
          </h1>
          <p className="text-zinc-400 mt-2">Kumpulan materi pembelajaran untuk kelas Anda terpilih dengan rapih.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiList.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-md">
               <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 mb-4">
                 <BookOpen className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-semibold text-zinc-300">Belum ada materi</h3>
               <p className="text-zinc-500 mt-2">Materi dari guru Anda akan muncul berjejer di sini.</p>
            </div>
          ) : (
            materiList.map((materi) => (
              <Link key={materi.id} href={`/siswa/materi/${materi.id}`} className="group block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-3xl h-full">
                <div className="border border-white/5 bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/80 transition-all flex flex-col relative overflow-hidden ring-1 ring-white/5 hover:ring-orange-500/30 shadow-[0_0_20px_rgba(255,255,255,0.02)] h-full">
                   <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                   
                   <div className="flex justify-between items-start mb-4 relative z-10">
                     <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider">
                       {materi.pertemuan.mataPelajaran.nama}
                     </div>
                     <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[10px] uppercase font-bold border border-white/10">
                        Tersedia
                     </div>
                   </div>

                   <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-orange-400 transition-colors line-clamp-2 relative z-10">
                     {materi.judul}
                   </h3>
                   
                   <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1 relative z-10">
                     {materi.konten}
                   </p>

                   <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-zinc-500 font-medium relative z-10">
                      <div className="flex items-center gap-1 group-hover:text-orange-300 transition-colors">
                        <Clock className="w-3.5 h-3.5" /> Pert. {materi.pertemuan.urutanPertemuan}
                      </div>
                      <div className="flex items-center gap-1 text-orange-500">
                        Baca Modul <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                   </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
