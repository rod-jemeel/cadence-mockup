import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from './activities/email.activities';

export async function createWorker() {
  const connection = await NativeConnection.connect({
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  });

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'email-cadence',
    workflowsPath: require.resolve('./workflows/cadence.workflow'),
    activities,
  });

  return { worker, connection };
}
