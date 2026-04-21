"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import Papa from "papaparse";

export async function createKelas(nama: string, tingkat: string) {
  try {
    if (!nama || !tingkat) return { success: false, error: "Nama dan Tingkat wajib diisi" };
    
    const kelas = await prisma.kelas.create({
      data: {
        nama: nama.toUpperCase(),
        tingkat: tingkat.toUpperCase(),
      }
    });

    revalidatePath("/admin/siswa");
    return { success: true, data: kelas };
  } catch (error: any) {
    console.error("Error creating kelas:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Nama kelas sudah ada" };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function createSiswaManual(formData: FormData) {
  // ... existing code ...
  try {
    const nama = formData.get("nama") as string;
    const email = formData.get("email") as string;
    const kelasId = formData.get("kelasId") as string;

    if (!nama || !email) {
      return { success: false, error: "Nama dan email wajib diisi" };
    }

    // Default password "siswa123"
    const hashedPassword = await bcrypt.hash("siswa123", 10);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        password: hashedPassword,
        role: "SISWA",
        kelasId: kelasId || null,
      },
    });

    revalidatePath("/admin/siswa");
    return { success: true, data: newUser };
  } catch (error: any) {
    console.error("Error creating siswa:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Email sudah terdaftar" };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function updateSiswa(formData: FormData) {
  // ... existing code ...
  try {
    const id = formData.get("id") as string;
    const nama = formData.get("nama") as string;
    const email = formData.get("email") as string;
    const kelasId = formData.get("kelasId") as string;

    if (!id || !nama || !email) {
      return { success: false, error: "ID, Nama, dan Email wajib diisi" };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        nama,
        email,
        kelasId: kelasId || null,
      },
    });

    revalidatePath("/admin/siswa");
    return { success: true, data: updatedUser };
  } catch (error: any) {
    console.error("Error updating siswa:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Email sudah dipakai pengguna lain" };
    }
    return { success: false, error: "Terjadi kesalahan internal" };
  }
}

export async function bulkImportSiswa(formData: FormData) {
  // ... existing code ...
  try {
    const file = formData.get("file") as File;
    const kelasId = formData.get("kelasId") as string;

    if (!file) {
      return { success: false, error: "File CSV tidak ditemukan" };
    }

    const fileContent = await file.text();

    return new Promise((resolve) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as Array<{ nama: string; email: string }>;
          
          if (!rows || rows.length === 0) {
            resolve({ success: false, error: "File CSV kosong atau tidak valid" });
            return;
          }

          if (!('nama' in rows[0]) || !('email' in rows[0])) {
            resolve({ success: false, error: "Format CSV salah. Pastikan header adalah 'nama' dan 'email'" });
            return;
          }

          try {
            const hashedPassword = await bcrypt.hash("siswa123", 10);
            let successCount = 0;
            let errorCount = 0;

            for (const row of rows) {
              const { nama, email } = row;
              
              if (!nama || !email) {
                errorCount++;
                continue; // Skip invalid rows
              }

              try {
                await prisma.user.create({
                  data: {
                    nama: nama.trim(),
                    email: email.trim(),
                    password: hashedPassword,
                    role: "SISWA",
                    kelasId: kelasId || null
                  }
                });
                successCount++;
              } catch (dbError: any) {
                console.error("Failed to insert row:", row, dbError.message);
                errorCount++;
              }
            }

            revalidatePath("/admin/siswa");
            resolve({ 
              success: true, 
              message: `Berhasil mengimpor ${successCount} siswa. ${errorCount > 0 ? `(${errorCount} gagal/duplikat)` : ''}` 
            });

          } catch (error: any) {
             console.error("Bulk insert process error:", error);
             resolve({ success: false, error: error.message || "Gagal memproses baris ke database" });
          }
        },
        error: (error: any) => {
          console.error("PapaParse error:", error);
          resolve({ success: false, error: "Gagal memparsing CSV" });
        }
      });
    });

  } catch (error: any) {
    console.error("Error bulk import:", error);
    return { success: false, error: "Terjadi kesalahan saat mengunggah fle" };
  }
}
