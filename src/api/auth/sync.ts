import type { VercelRequest, VercelResponse } from '@vercel/node';
import { firebaseAuthSync } from '../../../server/firebaseAuthSync.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cấu hình CORS cho Vercel Function
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Chuyển tiếp request vào logic xử lý cũ của Express
  return firebaseAuthSync(req as any, res as any);
}