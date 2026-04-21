import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import prisma from "@/lib/prisma";
import SiswaClient from "./SiswaClient";

export default async function AdminSiswaPage() {
  const session = await auth();

  // Pastikan hanya ADMIN yang dapat mengakses halaman ini
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Ambil semua data siswa, sertakan relasi kelasnya
  const siswa = await prisma.user.findMany({
    where: { role: "SISWA" },
    include: { kelas: true },
    orderBy: { nama: 'asc' }
  });

  // Ambil semua daftar kelas untuk opsi penugasan pada form
  const kelas = await prisma.kelas.findMany({
    orderBy: [
      { tingkat: 'asc' },
      { nama: 'asc' }
    ]
  });

  return (
    <DashboardLayout user={session.user}>
      <SiswaClient initialSiswa={siswa} kelasOptions={kelas} />
    </DashboardLayout>
  );
}
