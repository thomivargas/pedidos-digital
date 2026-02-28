import { env } from './config/env';
import { prisma } from './config/database';
import app from './app';

async function bootstrap() {
  // Verificar conexión a la base de datos antes de levantar el servidor
  try {
    await prisma.$connect();
    console.log('✅ Conectado a la base de datos');
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${env.PORT}`);
    console.log(`📋 Ambiente: ${env.NODE_ENV}`);
    console.log(`🔍 Health check: http://localhost:${env.PORT}/health`);
  });

  // ─── Graceful shutdown ──────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    console.log(`\n⚠️  ${signal} recibido — cerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('👋 Servidor cerrado correctamente');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Capturar errores no manejados para evitar caídas silenciosas
  process.on('uncaughtException', (err) => {
    console.error('💥 uncaughtException:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('💥 unhandledRejection:', reason);
    process.exit(1);
  });
}

bootstrap();
