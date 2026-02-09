import { createWorker } from './worker';
import type { NativeConnection, Worker } from '@temporalio/worker';

const RETRY_INTERVAL_MS = 5000;
const MAX_RETRIES = Infinity;

async function main() {
  let retries = 0;
  let currentWorker: Worker | null = null;
  let currentConnection: NativeConnection | null = null;

  // Register signal handlers once outside the loop
  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('Shutting down worker...');
    currentWorker?.shutdown();
    await currentConnection?.close();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);

  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'email-cadence';

  while (retries < MAX_RETRIES) {
    try {
      const { worker, connection } = await createWorker();
      currentWorker = worker;
      currentConnection = connection;
      console.log(`Temporal worker started. Listening on task queue: ${taskQueue}`);
      retries = 0;

      await worker.run();
      console.log('Worker stopped.');

      await connection.close();
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
        await currentConnection?.close();
        process.exit(1);
      }
    }
  }
}

main();
