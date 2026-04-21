import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import MateriClient from "./MateriClient";

export default async function KelolaMateriPage() {
  const session = await auth();

  if (!session || session.user.role !== "GURU") {
    redirect("/login");
  }

  // Ambil MataPelajaran milik Guru ini beserta Kelas & Pertemuan
  const mapelList = await prisma.mataPelajaran.findMany({
    where: { guruId: session.user.id },
    include: {
      kelas: true,
      pertemuan: {
        orderBy: { urutanPertemuan: 'asc' }
      }
    }
  });

  // Ambil semua Materi dari Pertemuan-Pertemuan di atas
  const pertemuanIds = mapelList.flatMap(m => m.pertemuan.map(p => p.id));
  const materiList = await prisma.materi.findMany({
    where: { pertemuanId: { in: pertemuanIds } },
    include: {
      pertemuan: {
        include: {
          mataPelajaran: {
            include: { kelas: true }
          }
        }
      }
    },
    orderBy: [
      { pertemuan: { mataPelajaranId: 'asc' } },
      { pertemuan: { urutanPertemuan: 'asc' } },
      { urutan: 'asc' }
    ]
  });

  return (
    <DashboardLayout user={session.user}>
      <MateriClient mapelData={mapelList} materiData={materiList} />
    </DashboardLayout>
  );
}
