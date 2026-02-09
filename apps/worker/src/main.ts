import { createWorker } from './worker';

const RETRY_INTERVAL_MS = 5000;
const MAX_RETRIES = Infinity;

async function main() {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const worker = await createWorker();
      console.log('Temporal worker started. Listening on task queue: email-cadence');
      retries = 0;

      // Graceful shutdown
      let shuttingDown = false;
      const shutdown = async () => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log('Shutting down worker...');
        worker.shutdown();
      };
      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);

      await worker.run();
      console.log('Worker stopped.');
      return;
    } catch (err) {
      retries++;
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('ConnectError') || msg.includes('TransportError') || msg.includes('connect')) {
        console.log(
          `Temporal not available (attempt ${retries}). Retrying in ${RETRY_INTERVAL_MS / 1000}s... (Start Temporal at ${process.env.TEMPORAL_ADDRESS || 'localhost:7233'})`,
        );
        await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
      } else {
        console.error('Worker failed:', err);
        process.exit(1);
      }
    }
  }
}

main();
