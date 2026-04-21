import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 px-4 relative overflow-hidden text-zinc-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex flex-col items-center justify-center z-10 w-full max-w-4xl text-center pb-20 pt-32">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
          Platform Pembelajaran Modern
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-6 drop-shadow-sm leading-tight">
          LMS Masa Depan <br className="hidden sm:block" />
          <span className="text-emerald-400">SeribuDigital</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          Kemudahan mengajar dan belajar diringkas dalam satu platform. Pantau perkembangan siswa, kelola materi, dan jalankan evaluasi dengan lebih efisien dan terstruktur.
        </p>

        <Link 
          href="/login"
          className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-8 font-semibold text-white transition-all duration-300 hover:bg-emerald-500 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <span className="mr-2 text-lg">Mulai Belajar</span>
          <svg 
            className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </main>

      <footer className="w-full z-10 py-8 text-center text-sm text-zinc-500 border-t border-white/10 mt-auto">
        <p className="flex items-center justify-center gap-1.5">
          &copy; {new Date().getFullYear()} SeribuDigital. Dibuat dengan 
          <svg className="w-4 h-4 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          di Banten, Serang.
        </p>
      </footer>
    </div>
  );
}
