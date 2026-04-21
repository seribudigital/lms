import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";

export default async function DetilMateriSiswa(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kelasId: true }
  });

  if (!dbUser?.kelasId) {
    redirect("/siswa/materi");
  }

  const materi = await prisma.materi.findUnique({
    where: { id: params.id },
    include: {
      pertemuan: {
        include: {
          mataPelajaran: {
            include: {
              kelas: true
            }
          }
        }
      }
    }
  });

  if (!materi) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-zinc-400">Materi tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  // Cek apakah kelas siswa berhak melihat materi ini
  const isAuthorized = materi.pertemuan.mataPelajaran.kelas.some(k => k.id === dbUser.kelasId);
  if (!isAuthorized) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-red-500 font-medium">Anda tidak berhak mengakses materi kelas ini.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="font-sans text-white p-4 md:p-8">
        <Link 
          href="/siswa/materi" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-orange-400 font-medium mb-8 transition-colors -ml-2 p-2 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Materi
        </Link>
        
        <article className="max-w-4xl mx-auto bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
          
          <header className="mb-10 border-b border-white/10 pb-8 relative z-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-500/20">
                {materi.pertemuan.mataPelajaran.nama}
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400 text-sm bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                <Clock className="w-3.5 h-3.5" /> Pertemuan {materi.pertemuan.urutanPertemuan}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {materi.judul}
            </h1>
            
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <BookOpen className="w-4 h-4" /> Modul Materi Kelas {materi.pertemuan.mataPelajaran.kelas.map(k => k.nama).join(", ")}
            </div>
          </header>

          <div className="relative z-10">
            {/* Standard rendering for content since it's textarea (plain string) */}
            <div className="text-lg leading-relaxed text-zinc-300 whitespace-pre-wrap font-medium">
              {materi.konten}
            </div>
          </div>
        </article>
      </div>
    </DashboardLayout>
  );
}
