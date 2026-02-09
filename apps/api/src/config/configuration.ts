export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
  temporal: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'email-cadence',
  },
});
