import prisma from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Memulai proses seeding...");

  // Hapus data lama agar menghindari duplikasi jika script dijalankan ulang (Opsional)
  // Untuk referensi foreign key, penghapusan lebih aman dari tabel anakan atau via Cascade.
  console.log("Menyiapkan database...");

  // 1. Password umum yang di-hash
  const adminPassword = await bcrypt.hash("admin123", 10);
  const guruPassword = await bcrypt.hash("guru123", 10);
  const siswaPassword = await bcrypt.hash("siswa123", 10);

  // 2. Buat User: Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@lms.com" },
    update: {},
    create: {
      email: "admin@lms.com",
      nama: "Administrator Utama",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Berhasil membuat admin: ${admin.email}`);

  // 3. Buat User: Guru
  const guru = await prisma.user.upsert({
    where: { email: "guru@lms.com" },
    update: {},
    create: {
      email: "guru@lms.com",
      nama: "Ahmad Fachrur, S.Pd",
      password: guruPassword,
      role: "GURU",
    },
  });
  console.log(`Berhasil membuat guru: ${guru.email}`);

  // 4. Buat Kelas Dashboard Dummy
  const kelas7A = await prisma.kelas.upsert({
    where: { nama: "VII-A" },
    update: {},
    create: {
      nama: "VII-A",
      tingkat: "VII",
      waliKelasId: guru.id,
    },
  });
  console.log(`Berhasil membuat kelas: ${kelas7A.nama}`);

  // 5. Buat User: Siswa
  const siswa = await prisma.user.upsert({
    where: { email: "siswa@lms.com" },
    update: {},
    create: {
      email: "siswa@lms.com",
      nama: "Budi Santoso",
      password: siswaPassword,
      role: "SISWA",
      kelasId: kelas7A.id,
    },
  });
  console.log(`Berhasil membuat siswa: ${siswa.email}`);

  // 6. Buat Mata Pelajaran Dummy
  const mapelFikih = await prisma.mataPelajaran.upsert({
    where: { kode: "FQH" },
    update: {},
    create: {
      nama: "Fiqih",
      kode: "FQH",
      deskripsi: "Pelajaran Ilmu Fiqih dasar untuk Madrasah",
      guruId: guru.id,
      kelas: {
        connect: [{ id: kelas7A.id }],
      },
    },
  });

  const mapelMtk = await prisma.mataPelajaran.upsert({
    where: { kode: "MTK" },
    update: {},
    create: {
      nama: "Matematika",
      kode: "MTK",
      deskripsi: "Matematika Aljabar dan Logika",
      guruId: guru.id,
      kelas: {
        connect: [{ id: kelas7A.id }],
      },
    },
  });

  console.log("Berhasil membuat Mata Pelajaran!");
  console.log("Seeding database selesai. ✅");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
