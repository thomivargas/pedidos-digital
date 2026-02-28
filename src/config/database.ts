import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiples instancias de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) global.prisma = new PrismaClient();
  prisma = global.prisma;
}

// Manejo de cierre de conexiones
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export { prisma };
