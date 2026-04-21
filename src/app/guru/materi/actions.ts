"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createMateri(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    return { success: false, error: "Unauthorized" };
  }

  const judul = formData.get("judul") as string;
  const konten = formData.get("konten") as string;
  const pertemuanId = formData.get("pertemuanId") as string;
  const newPertemuanJudul = formData.get("newPertemuanJudul") as string;
  const mapelId = formData.get("mapelId") as string;

  if (!judul || !konten || !pertemuanId) {
    return { success: false, error: "Semua kolom utama wajib diisi" };
  }

  try {
    let finalPertemuanId = pertemuanId;

    // Jika membuat pertemuan baru
    if (pertemuanId === "NEW") {
      if (!newPertemuanJudul || !mapelId) {
        return { success: false, error: "Judul pertemuan rekuisite wajib diisi" };
      }

      const maxPertemuanUrutan = await prisma.pertemuan.aggregate({
        where: { mataPelajaranId: mapelId },
        _max: { urutanPertemuan: true }
      });
      const nextPertemuanUrutan = (maxPertemuanUrutan._max.urutanPertemuan ?? 0) + 1;

      const newPertemuan = await prisma.pertemuan.create({
        data: {
          judul: newPertemuanJudul,
          urutanPertemuan: nextPertemuanUrutan,
          mataPelajaranId: mapelId,
        }
      });
      finalPertemuanId = newPertemuan.id;
    }

    // Cari urutan terbesar di pertemuan ini
    const maxUrutan = await prisma.materi.aggregate({
      where: { pertemuanId: finalPertemuanId },
      _max: { urutan: true }
    });

    const nextUrutan = (maxUrutan._max.urutan ?? 0) + 1;

    await prisma.materi.create({
      data: {
        judul,
        konten,
        pertemuanId: finalPertemuanId,
        urutan: nextUrutan
      }
    });

    revalidatePath("/guru/materi");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan materi" };
  }
}
