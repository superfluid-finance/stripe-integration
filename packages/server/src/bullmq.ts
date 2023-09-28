import { Queue } from 'bullmq';

const myQueue = new Queue('foo', {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
});

export async function addJobs() {
  await myQueue.add('myJobName', { foo: 'bar' });
  await myQueue.add('myJobName', { qux: 'baz' });
}
