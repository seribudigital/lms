"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(kelas)) 
    };
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
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        kelasId: true
      }
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
      select: {
        id: true,
        nama: true,
        email: true,
        role: true,
        kelasId: true
      }
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
  try {
    const file = formData.get("file") as File;
    const kelasId = formData.get("kelasId") as string;

    if (!file) {
      return { success: false, error: "File CSV tidak ditemukan" };
    }

    const fileContent = await file.text();
    const rowsRaw = fileContent.split(/\r?\n/);
    
    // Validasi Header (nama,email)
    if (rowsRaw.length < 2) {
      return { success: false, error: "File CSV kosong atau tidak valid" };
    }
    
    const header = rowsRaw[0].toLowerCase();
    if (!header.includes("nama") || !header.includes("email")) {
      return { success: false, error: "Format CSV salah. Pastikan header adalah 'nama' dan 'email'" };
    }

    const hashedPassword = await bcrypt.hash("siswa123", 10);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 1; i < rowsRaw.length; i++) {
        const line = rowsRaw[i].trim();
        if (!line) continue;
        
        let nama = '';
        let email = '';

        // Simple CSV parse safely
        if (line.includes(',')) {
            const parts = line.split(',');
            nama = parts[0].trim();
            email = parts[1].trim();
        } else if (line.includes(';')) {
            const parts = line.split(';');
            nama = parts[0].trim();
            email = parts[1].trim();
        }

        if (!nama || !email) {
            errorCount++;
            continue;
        }

        try {
            await prisma.user.create({
                data: {
                    nama: nama,
                    email: email,
                    password: hashedPassword,
                    role: "SISWA",
                    kelasId: kelasId || null
                }
            });
            successCount++;
        } catch (dbError: any) {
            console.error("Bulk DB Insert Error for", email, ":", dbError.message);
            errorCount++;
        }
    }

    revalidatePath("/admin/siswa");
    return { 
        success: true, 
        message: `Berhasil mengimpor ${successCount} siswa. ${errorCount > 0 ? `(${errorCount} gagal/duplikat)` : ''}` 
    };

  } catch (error: any) {
    console.error("Error bulk import:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat memproses berkas" };
  }
}
