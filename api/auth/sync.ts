import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';

if (!getApps().length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountEnv) {
    throw new Error('Thiếu biến môi trường FIREBASE_SERVICE_ACCOUNT_JSON trên Vercel.');
  }

  try {
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountEnv);
    } catch {
      serviceAccount = JSON.parse(serviceAccountEnv.replace(/\\n/g, '\n'));
    }

    initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error: any) {
    throw new Error(`Lỗi khởi tạo Firebase Admin: ${error.message}`);
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
    const uid = decodedToken.uid;
    const name = decodedToken.name || email?.split('@')[0] || 'Member';

    if (!email) {
      return res.status(400).json({ error: 'Token không chứa thông tin email.' });
    }

    // Kiểm tra xem profile đã tồn tại trong Supabase chưa
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    // Nếu chưa tồn tại (Lỗi PGRST116 là code của Supabase khi không tìm thấy bản ghi .single())
    if (!profile) {
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            uid,
            email,
            name,
            status: 'pending', // Đặt trạng thái chờ duyệt tự động
            role: 'CADET',     // Role mặc định ban đầu
          }
        ]);

      if (insertError) {
        console.error('Auto-insert profile error:', insertError);
        return res.status(500).json({ error: 'Không thể khởi tạo yêu cầu cấp quyền.' });
      }

      return res.status(403).json({
        success: false,
        status: 'pending',
        error: 'Tài khoản đã được ghi nhận! Đang chờ bạn vào Supabase đổi status thành ACTIVE để duyệt.'
      });
    }

    if (dbError) {
      console.error('Supabase query error:', dbError);
      return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }

    // Nếu đã tồn tại nhưng chưa ACTIVE
    if (profile.status !== 'ACTIVE') {
      return res.status(403).json({ 
        success: false,
        status: profile.status,
        error: 'Tài khoản đang ở trạng thái chờ duyệt (Pending). Vui lòng cấp quyền ACTIVE trong cơ sở dữ liệu.' 
      });
    }

    return res.status(200).json({ success: true, message: 'Đồng bộ tài khoản thành công!' });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Lỗi hệ thống nội bộ.' });
  }
}