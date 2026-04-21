import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import TugasClient from "./TugasClient";

export default async function KelolaTugasPage() {
  const session = await auth();

  if (!session || session.user.role !== "GURU") {
    redirect("/login");
  }

  // Fetch MataPelajaran & Pertemuan
  const mapelList = await prisma.mataPelajaran.findMany({
    where: { guruId: session.user.id },
    include: {
      kelas: true,
      pertemuan: { orderBy: { urutanPertemuan: 'asc' } }
    }
  });

  // Fetch all Tugas belonging to this Guru's mapel
  const pertemuanIds = mapelList.flatMap(m => m.pertemuan.map(p => p.id));
  const tugasList = await prisma.tugas.findMany({
    where: { pertemuanId: { in: pertemuanIds } },
    include: {
      pertemuan: { include: { mataPelajaran: { include: { kelas: true } } } },
      _count: { select: { soal: true, pengerjaan: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <DashboardLayout user={session.user}>
      <TugasClient mapelData={mapelList} tugasData={tugasList} />
    </DashboardLayout>
  );
}
