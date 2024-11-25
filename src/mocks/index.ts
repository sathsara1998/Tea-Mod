import { server } from './server';
import { worker } from './browser';

if (typeof window === 'undefined') {
  server.listen()
} else {
  worker.start()
}
export {}
