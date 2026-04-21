import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, GraduationCap, Clock, MonitorPlay } from "lucide-react";
import { ActivityChart } from "./ActivityChart";
import DashboardLayout from "@/components/DashboardLayout";

export default async function AdminDashboard() {
  const session = await auth();

  // Proteksi ekstra di level komponen
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="p-4 md:p-8 text-white">
        <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Admin Workspace
            </h1>
            <p className="text-zinc-400 mt-2">Selamat datang kembali, {session.user.name}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-sm text-zinc-400">Sistem Online</span>
          </div>
        </header>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 auto-rows-[160px]">
          
          {/* Kotak Bento 1: Besar (Aktivitas Mingguan) */}
          <div className="col-span-1 md:col-span-2 row-span-2 bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.02)] ring-1 ring-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-emerald-400" />
                Aktivitas Mingguan
              </h3>
            </div>
            <ActivityChart />
          </div>

          {/* Kotak Bento 2: Kecil (Total Guru) */}
          <div className="col-span-1 border border-white/5 bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/70 transition-all flex flex-col justify-between group">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Total Guru</p>
              <h4 className="text-4xl font-bold mt-1 text-white">24</h4>
            </div>
          </div>

          {/* Kotak Bento 3: Kecil (Total Siswa) */}
          <div className="col-span-1 border border-white/5 bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/70 transition-all flex flex-col justify-between group">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-orange-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium">Total Siswa</p>
              <h4 className="text-4xl font-bold mt-1 text-white">356</h4>
            </div>
          </div>

          {/* Kotak Bento 4: Sedang (Aktivitas Terakhir) */}
          <div className="col-span-1 md:col-span-2 row-span-1 border border-white/5 bg-zinc-900/50 rounded-3xl p-6 backdrop-blur-md hover:bg-zinc-900/80 transition-all overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-zinc-400" />
              Pendaftaran & Log Terbaru
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></div>
                <p className="text-sm text-zinc-300 truncate">Budi Santoso login ke sistem</p>
                <span className="text-xs text-zinc-500 ml-auto flex-shrink-0">Baru saja</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <p className="text-sm text-zinc-300 truncate">Ahmad Fachrur memperbarui materi Fiqih</p>
                <span className="text-xs text-zinc-500 ml-auto flex-shrink-0">2 jam lalu</span>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
