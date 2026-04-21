"use client";

import { useState } from "react";
import { Plus, Upload, Download, Edit, Search, User, Trash2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { createSiswaManual, updateSiswa, bulkImportSiswa } from "./actions";
import { useRouter } from "next/navigation";

export default function SiswaClient({ initialSiswa, kelasOptions }: { initialSiswa: any[], kelasOptions: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isModalManualOpen, setIsModalManualOpen] = useState(false);
  const [isModalBulkOpen, setIsModalBulkOpen] = useState(false);

  // Form States (Manual)
  const [formMode, setFormMode] = useState<"ADD" | "EDIT">("ADD");
  const [editId, setEditId] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kelasId, setKelasId] = useState("");

  // Form States (Bulk)
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkKelasId, setBulkKelasId] = useState("");

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadTemplate = () => {
    // Generate CSV Template with nama,email
    const csvContent = "data:text/csv;charset=utf-8,nama,email\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_siswa.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddManual = () => {
    setFormMode("ADD");
    setNama("");
    setEmail("");
    setKelasId("");
    setIsModalManualOpen(true);
  };

  const openEditManual = (siswa: any) => {
    setFormMode("EDIT");
    setEditId(siswa.id);
    setNama(siswa.nama);
    setEmail(siswa.email);
    setKelasId(siswa.kelasId || "");
    setIsModalManualOpen(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("nama", nama);
    formData.append("email", email);
    formData.append("kelasId", kelasId);

    let res;
    if (formMode === "ADD") {
      res = await createSiswaManual(formData);
    } else {
      formData.append("id", editId);
      res = await updateSiswa(formData);
    }

    setLoading(false);
    if (res.success) {
      showToast('success', formMode === "ADD" ? 'Siswa berhasil ditambahkan' : 'Data siswa berhasil diperbarui');
      setIsModalManualOpen(false);
      router.refresh();
    } else {
      showToast('error', res.error || 'Terjadi kesalahan');
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      showToast('error', 'Pilih file CSV terlebih dahulu');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", bulkFile);
    formData.append("kelasId", bulkKelasId);

    const res = await bulkImportSiswa(formData) as { success: boolean, message?: string, error?: string };
    
    setLoading(false);
    if (res.success) {
      showToast('success', res.message || 'Bulk import berhasil');
      setIsModalBulkOpen(false);
      setBulkFile(null);
      setBulkKelasId("");
      router.refresh();
    } else {
      showToast('error', res.error || 'Gagal melakukan bulk import');
    }
  };

  const filteredSiswa = initialSiswa.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans text-white p-4 md:p-8 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6 relative">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2 tracking-tight">
            Manajemen Siswa
          </h1>
          <p className="text-zinc-400">Total {initialSiswa.length} siswa terdaftar di seluruh kelas.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button 
            onClick={openAddManual}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-colors border border-white/10"
          >
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
          <button 
            onClick={() => setIsModalBulkOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] border border-blue-500/30"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </header>

      {/* Filter / Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/10 rounded-xl bg-zinc-900/50 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <Download className="w-4 h-4" /> Download Template CSV
        </button>
      </div>

      {/* Tabel View Shadcn-like */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-900/50 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 border-b border-white/10 text-zinc-400 font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Kelas</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSiswa.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    Belum ada data siswa.
                  </td>
                </tr>
              ) : (
                filteredSiswa.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">{siswa.nama}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{siswa.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-white/5">
                        {siswa.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {siswa.kelas ? (
                        <span className="text-blue-400 font-medium">{siswa.kelas.tingkat} {siswa.kelas.nama}</span>
                      ) : (
                        <span className="text-zinc-600 italic">Belum ada kelas</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEditManual(siswa)}
                        className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                        title="Edit Siswa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Manual CRUD */}
      {isModalManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalManualOpen(false)}></div>
           <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-all animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950">
                 <div>
                   <h2 className="text-xl font-bold text-white">{formMode === "ADD" ? 'Tambah Siswa Manual' : 'Edit Data Siswa'}</h2>
                   <p className="text-xs text-zinc-400 mt-1">{formMode === "ADD" ? 'Gunakan password bawaan: siswa123' : 'Perbarui data siswa saat ini'}</p>
                 </div>
                 <button onClick={() => setIsModalManualOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6">
                <form id="manual-form" onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={nama} 
                      onChange={(e) => setNama(e.target.value)} 
                      required
                      placeholder="Contoh: Ahmad Fadhil"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Email Utama</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required
                      placeholder="Contoh: ahmad@lms.com"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white placeholder-zinc-600 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Asal Kelas</label>
                    <select
                      value={kelasId}
                      onChange={(e) => setKelasId(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                    >
                      <option value="">-- Pilih Kelas (Opsional) --</option>
                      {kelasOptions.map((k) => (
                        <option key={k.id} value={k.id}>{k.tingkat} {k.nama}</option>
                      ))}
                    </select>
                  </div>
                </form>
              </div>

              <div className="p-4 border-t border-white/10 bg-zinc-950 flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsModalManualOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Batal
                </button>
                <button type="submit" form="manual-form" disabled={loading} className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal Bulk Upload CSV */}
      {isModalBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalBulkOpen(false)}></div>
           <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10 transform transition-all animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950">
                 <div>
                   <h2 className="text-xl font-bold text-white">Bulk Import CSV</h2>
                   <p className="text-xs text-zinc-400 mt-1">Impor banyak siswa sekaligus secara masal menggunakan berkas CSV.</p>
                 </div>
                 <button onClick={() => setIsModalBulkOpen(false)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="p-6">
                <form id="bulk-form" onSubmit={handleBulkSubmit} className="space-y-6">
                  
                  {/* Select Kelas Untuk Import */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Tugaskan Siswa ke Kelas</label>
                    <select
                      value={bulkKelasId}
                      onChange={(e) => setBulkKelasId(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none shadow-inner"
                    >
                      <option value="">-- Wajib Pilih Kelas --</option>
                      {kelasOptions.map((k) => (
                        <option key={k.id} value={k.id}>{k.tingkat} {k.nama}</option>
                      ))}
                    </select>
                  </div>

                  {/* Input File CSV */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300">File CSV (Karakteristik: nama, email)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-blue-500/50 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                            <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold text-white">Klik untuk memilih file</span> atau seret kesini.</p>
                            <p className="text-xs text-zinc-500">{bulkFile ? bulkFile.name : 'Maks 5MB. Format: .csv'}</p>
                        </div>
                        <input type="file" className="hidden" accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} />
                    </label>
                  </div>

                </form>
              </div>

              <div className="p-4 border-t border-white/10 bg-zinc-950 flex justify-end gap-3 flex-shrink-0">
                <button type="button" onClick={() => setIsModalBulkOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Batal
                </button>
                <button type="submit" form="bulk-form" disabled={loading || !bulkFile || !bulkKelasId} className="inline-flex items-center px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {loading ? 'Membaca File...' : 'Mulai Import'}
                </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
