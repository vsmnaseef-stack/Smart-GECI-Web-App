import app                       from './app';
import { env }                    from './config/env';
import { connectDb, disconnectDb } from './config/db';

const PORT = env.PORT;

async function bootstrap(): Promise<void> {
  // ── attempt DB connection (non-fatal) ────────────────────────────────────
  await connectDb();

  // ── start HTTP server ────────────────────────────────────────────────────
  const server = app.listen(PORT, () => {
    console.log('──────────────────────────────────────────────');
    console.log(`  🚀 Smart GECI API`);
    console.log(`  Environment : ${env.NODE_ENV}`);
    console.log(`  Listening   : http://localhost:${PORT}`);
    console.log(`  Health      : http://localhost:${PORT}/api/health`);
    console.log('──────────────────────────────────────────────');
  });

  // ── graceful shutdown ────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal} — shutting down gracefully…`);
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      await disconnectDb();
      process.exit(0);
    });

    // Force exit after 10 s if connections don't drain
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
  });

  // Catch uncaught synchronous exceptions
  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err.message);
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  console.error('[Server] Bootstrap failed:', err);
  process.exit(1);
});
