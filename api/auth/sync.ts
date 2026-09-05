import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';

if (!getApps().length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountEnv) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccountEnv)),
    });
  } else {
    initializeApp();
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Thiếu hoặc sai định dạng token xác thực.' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) {
      return res.status(400).json({ error: 'Token không chứa thông tin email.' });
    }

    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('status')
      .eq('email', email)
      .single();

    if (dbError || !profile || profile.status !== 'ACTIVE') {
      return res.status(403).json({ 
        error: 'Tài khoản Firebase chưa được ACTIVE hoặc không có quyền truy cập.' 
      });
    }

    return res.status(200).json({ success: true, message: 'Đồng bộ tài khoản thành công!' });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Lỗi hệ thống nội bộ.' });
  }
}