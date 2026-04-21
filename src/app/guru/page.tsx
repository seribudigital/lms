import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";

export default async function GuruDashboard() {
  const session = await auth();

  if (!session || session.user.role !== "GURU") {
    redirect("/login");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="p-4 md:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-500">Dashboard Guru</h1>
          <p className="text-zinc-400 mt-2">Selamat mengajar, {session.user.name}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/guru/materi" className="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer h-full group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Kelola Materi</h3>
              <p className="text-zinc-400 text-sm">Tambahkan materi pelajaran atau modul baru.</p>
            </div>
          </Link>
          <Link href="/guru/tugas" className="block focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:bg-white/10 hover:border-emerald-500/50 transition-all cursor-pointer h-full group">
              <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">Buat Tugas/Ujian</h3>
              <p className="text-zinc-400 text-sm">Buat soal pilihan ganda atau essay.</p>
            </div>
          </Link>
        </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
