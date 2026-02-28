import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminEmail = 'admin@pedidosdigital.com';
  const existeAdmin = await prisma.usuario.findUnique({ where: { correo: adminEmail } });

  if (!existeAdmin) {
    await prisma.usuario.create({
      data: {
        correo: adminEmail,
        contrasena: await bcrypt.hash('Admin1234!', 10),
        nombre: 'Administrador',
        rol: 'ADMIN',
      },
    });
    console.log('✅ Admin creado → admin@pedidosdigital.com / Admin1234!');
  } else {
    console.log('ℹ️  Admin ya existe');
  }

  // ─── Vendedor de prueba ───────────────────────────────────────────────────
  const vendedorEmail = 'vendedor@pedidosdigital.com';
  const existeVendedor = await prisma.usuario.findUnique({ where: { correo: vendedorEmail } });

  if (!existeVendedor) {
    await prisma.usuario.create({
      data: {
        correo: vendedorEmail,
        contrasena: await bcrypt.hash('Vendedor1234!', 10),
        nombre: 'Vendedor Demo',
        rol: 'VENDEDOR',
      },
    });
    console.log('✅ Vendedor creado → vendedor@pedidosdigital.com / Vendedor1234!');
  } else {
    console.log('ℹ️  Vendedor demo ya existe');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
