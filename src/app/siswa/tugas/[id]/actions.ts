"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function startExam(tugasId: string) {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") return { success: false };

  const existing = await prisma.pengerjaan.findFirst({
    where: { tugasId, siswaId: session.user.id }
  });

  if (!existing) {
    await prisma.pengerjaan.create({
      data: { tugasId, siswaId: session.user.id, status: "DIKERJAKAN" }
    });
  }
  revalidatePath(`/siswa/tugas/${tugasId}`);
  return { success: true };
}

export async function submitExam(tugasId: string, jawabanSiswaArr: { soalId: string, pilihanId: string }[]) {
  const session = await auth();
  if (!session || session.user.role !== "SISWA") {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    let pengerjaan = await prisma.pengerjaan.findFirst({
      where: { tugasId, siswaId: userId }
    });

    if (pengerjaan?.status === "SELESAI" || pengerjaan?.status === "DINILAI") {
       return { success: false, error: "Ujian sudah dikerjakan sebelumnya." };
    }

    if (!pengerjaan) {
      pengerjaan = await prisma.pengerjaan.create({
        data: {
          tugasId,
          siswaId: userId,
          status: "DIKERJAKAN"
        }
      });
    }

    const soals = await prisma.soal.findMany({
      where: { tugasId },
      include: { pilihanJawaban: true }
    });

    let totalBenar = 0;
    const totalSoal = soals.length || 1;

    const jawabanCreates = jawabanSiswaArr.map(ans => {
      const soal = soals.find(s => s.id === ans.soalId);
      const chosenPil = soal?.pilihanJawaban.find(p => p.id === ans.pilihanId);
      const isBenar = chosenPil?.isBenar || false;
      
      if (isBenar) totalBenar += 1;

      return {
        pengerjaanId: pengerjaan!.id,
        soalId: ans.soalId,
        jawaban: chosenPil?.teks || "",
        isBenar,
        nilai: isBenar ? 10 : 0
      };
    });

    if (jawabanCreates.length > 0) {
      await prisma.jawabanSiswa.deleteMany({
        where: { pengerjaanId: pengerjaan.id }
      });

      await prisma.jawabanSiswa.createMany({
        data: jawabanCreates
      });
    }

    // Hitung Rasio = (Benar / Total) * 100
    const finalNilai = Math.round((totalBenar / totalSoal) * 100);

    await prisma.pengerjaan.update({
      where: { id: pengerjaan.id },
      data: {
        status: "SELESAI",
        nilai: finalNilai,
        waktuSelesai: new Date(),
      }
    });

    revalidatePath(`/siswa/tugas/${tugasId}`);
    return { success: true, nilai: finalNilai };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan jawaban" };
  }
}
