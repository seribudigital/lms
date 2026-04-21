"use client";

import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ 
  children, 
  user 
}: { 
  children: React.ReactNode; 
  user: { name?: string | null; role?: string | null; email?: string | null } 
}) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex h-screen bg-zinc-950 font-sans text-white overflow-hidden print:overflow-visible print:h-auto selection:bg-emerald-500/30">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 border-r border-white/10 bg-zinc-900/50 backdrop-blur-xl flex-col justify-between hidden md:flex print:hidden">
        <div>
          <div className="p-6">
            <h2 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              SeribuDigital
            </h2>
            <div className="mt-1 text-xs text-zinc-500 font-semibold px-0.5 uppercase tracking-wider">
              {user.role} PANEL
            </div>
          </div>
          
          <nav className="px-4 mt-6 space-y-2">
            <Link 
              href={`/${user.role?.toLowerCase()}`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 font-medium transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            {user.role === 'ADMIN' && (
              <Link 
                href="/admin/siswa"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 font-medium transition-colors"
              >
                <Users className="w-5 h-5" />
                Manajemen Siswa
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-3 rounded-lg bg-black/40 mb-4 border border-white/5 flex flex-col shadow-inner">
             <span className="text-sm font-semibold truncate text-zinc-200">{user.name}</span>
             <span className="text-xs text-zinc-500 truncate mt-0.5">{user.email || 'Email tidak tersedia'}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium text-sm group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto print:overflow-visible relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20 print:hidden">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            SeribuDigital
          </h2>
          <button onClick={handleLogout} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        
        {/* Child Next.js Page */}
        <div className="p-0">
          {children}
        </div>
      </main>
    </div>
  );
}
