import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import SoalClient from "./SoalClient";

export default async function DetilTugasPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || session.user.role !== "GURU") {
    redirect("/login");
  }

  const tugas = await prisma.tugas.findUnique({
    where: { id: params.id },
    include: {
      pertemuan: {
        include: {
          mataPelajaran: {
            include: { kelas: true }
          }
        }
      },
      soal: {
        orderBy: { urutan: 'asc' },
        include: { pilihanJawaban: { orderBy: { label: 'asc' } } }
      },
      pengerjaan: {
        include: {
          siswa: true
        },
        orderBy: {
          waktuSelesai: 'desc'
        }
      }
    }
  });

  if (!tugas) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-zinc-400">Tugas tidak ditemukan.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session.user}>
      <SoalClient tugas={tugas} />
    </DashboardLayout>
  );
}
