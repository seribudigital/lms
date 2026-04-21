"use server"

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function createSoal(formData: FormData) {
  const session = await auth();
  if (!session || session.user.role !== "GURU") {
    return { success: false, error: "Unauthorized" };
  }

  const tugasId = formData.get("tugasId") as string;
  const pertanyaan = formData.get("pertanyaan") as string;
  const teksA = formData.get("teksA") as string;
  const teksB = formData.get("teksB") as string;
  const teksC = formData.get("teksC") as string;
  const teksD = formData.get("teksD") as string;
  const kunci = formData.get("kunci") as string;

  if (!tugasId || !pertanyaan || !teksA || !teksB || !teksC || !teksD || !kunci) {
    return { success: false, error: "Lengkapi semua baris soal dan tentukan kunci jawaban." };
  }

  try {
    const maxSoal = await prisma.soal.aggregate({
      where: { tugasId },
      _max: { urutan: true }
    });
    const nextUrutan = (maxSoal._max.urutan ?? 0) + 1;

    await prisma.soal.create({
      data: {
        tugasId,
        pertanyaan,
        tipe: "PILIHAN_GANDA",
        bobot: 1,
        urutan: nextUrutan,
        pembahasan: "", 
        pilihanJawaban: {
          create: [
            { label: "A", teks: teksA, isBenar: kunci === "A" },
            { label: "B", teks: teksB, isBenar: kunci === "B" },
            { label: "C", teks: teksC, isBenar: kunci === "C" },
            { label: "D", teks: teksD, isBenar: kunci === "D" },
          ]
        }
      }
    });

    revalidatePath(`/guru/tugas/${tugasId}`);
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Gagal menyimpan soal" };
  }
}
