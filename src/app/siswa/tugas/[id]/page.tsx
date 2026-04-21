import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import ExamClient from "./ExamClient";

export default async function PengerjaanTugasPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || session.user.role !== "SISWA") {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { kelasId: true }
  });

  if (!dbUser?.kelasId) redirect("/siswa/tugas");

  const tugas = await prisma.tugas.findUnique({
    where: { id: params.id },
    include: {
      pertemuan: { include: { mataPelajaran: { include: { kelas: true } } } },
      soal: {
        orderBy: { urutan: 'asc' },
        include: { pilihanJawaban: { orderBy: { label: 'asc' } } }
      },
      pengerjaan: {
        where: { siswaId: session.user.id },
        include: { jawabanSiswa: true }
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

  const isAuthorized = tugas.pertemuan.mataPelajaran.kelas.some(k => k.id === dbUser.kelasId);
  if (!isAuthorized) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-red-500 font-medium">Anda tidak berhak mengakses ujian kelas ini.</div>
      </DashboardLayout>
    );
  }

  if (tugas.soal.length === 0) {
    return (
      <DashboardLayout user={session.user}>
        <div className="p-8 text-center text-zinc-400 mt-20 bg-white/5 rounded-3xl mx-4">Soal ujian belum tersedia. Silakan hubungi guru Anda.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={session.user}>
      <ExamClient tugas={tugas} />
    </DashboardLayout>
  );
}
