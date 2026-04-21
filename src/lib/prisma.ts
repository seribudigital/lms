// ============================================================
// Prisma Client Singleton - LMS MTs/MA
// ============================================================
// File ini memastikan hanya ada SATU instance Prisma Client
// di seluruh aplikasi. Penting untuk serverless environment
// (Vercel, dll) agar tidak terjadi error "too many connections".
//
// Cara kerja:
// - Di development: Prisma Client disimpan di globalThis agar
//   tidak membuat koneksi baru setiap kali hot-reload.
// - Di production: Prisma Client dibuat sekali dan digunakan
//   ulang di seluruh request.
// ============================================================

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
