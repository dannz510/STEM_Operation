import 'dotenv/config';
import express from 'express';
import { firebaseAuthSync } from './firebaseAuthSync.js';

const app = express();
const port = Number(process.env.AUTH_SERVER_PORT ?? 8787);

app.use(express.json());
app.use((request, response, next) => {
  const origin = request.headers.origin;
  if (origin === 'http://127.0.0.1:3000' || origin === 'http://127.0.0.1:3004' || origin === 'http://localhost:3000' || origin === 'http://localhost:3004') {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  }
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.post('/api/auth/sync', firebaseAuthSync);
app.get('/health', (_request, response) => response.json({ ok: true, service: 'stem-auth' }));

app.listen(port, () => {
  console.log(`STEM auth sync server listening on http://127.0.0.1:${port}`);
});
