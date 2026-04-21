import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default async function SiswaDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="p-4 md:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
          <h1 className="text-3xl font-bold text-orange-500">Dashboard Siswa</h1>
          <p className="text-zinc-400 mt-2">Semangat belajar, {session.user.name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/siswa/tugas" className="block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 hover:border-orange-500/50 transition-all cursor-pointer h-full group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-400 transition-colors">Tugas Kuliah / Ujian</h3>
              <p className="text-3xl font-bold text-orange-400">Aktif</p>
              <p className="text-zinc-400 text-sm mt-2 font-medium group-hover:text-zinc-300">Lihat ujian atau tugas yang perlu dikerjakan.</p>
            </div>
          </Link>
          <Link href="/siswa/materi" className="block focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 hover:border-orange-500/50 transition-all cursor-pointer flex items-center justify-center h-full group">
              <span className="font-medium group-hover:text-orange-400 transition-colors text-lg">Jelajahi Materi <span className="inline-block transform group-hover:translate-x-1 transition-transform">&rarr;</span></span>
            </div>
          </Link>
        </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
