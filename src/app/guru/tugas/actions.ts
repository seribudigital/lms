"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createTugas(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    return { success: false, error: "Unauthorized" };
  }

  const judul = formData.get("judul") as string;
  const deskripsi = formData.get("deskripsi") as string;
  const pertemuanId = formData.get("pertemuanId") as string;
  const mapelId = formData.get("mapelId") as string;
  const newPertemuanJudul = formData.get("newPertemuanJudul") as string;

  if (!judul || !pertemuanId) {
    return { success: false, error: "Judul dan Pertemuan wajib diisi" };
  }

  try {
    let finalPertemuanId = pertemuanId;

    if (pertemuanId === "NEW") {
      if (!newPertemuanJudul || !mapelId) {
        return { success: false, error: "Judul pertemuan baru wajib diisi" };
      }

      const maxP = await prisma.pertemuan.aggregate({
        where: { mataPelajaranId: mapelId },
        _max: { urutanPertemuan: true }
      });
      const nextU = (maxP._max.urutanPertemuan ?? 0) + 1;

      const newPertemuan = await prisma.pertemuan.create({
        data: {
          judul: newPertemuanJudul,
          urutanPertemuan: nextU,
          mataPelajaranId: mapelId,
        }
      });
      finalPertemuanId = newPertemuan.id;
    }

    const newTugas = await prisma.tugas.create({
      data: {
        judul,
        deskripsi,
        pertemuanId: finalPertemuanId,
        nilaiMaks: 100,
        durasi: 60,
      }
    });

    revalidatePath("/guru/tugas");
    return { success: true, id: newTugas.id };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan tugas" };
  }
}
