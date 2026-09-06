import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Firebase Admin an toàn trên Vercel
if (!getApps().length) {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountEnv) {
    try {
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(serviceAccountEnv);
      } catch {
        serviceAccount = JSON.parse(serviceAccountEnv.replace(/\\n/g, '\n'));
      }
      initializeApp({ credential: cert(serviceAccount) });
    } catch (error: any) {
      throw new Error(`Lỗi khởi tạo Firebase Admin: ${error.message}`);
    }
  } else {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let token = '';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1]?.trim() || '';
    } else if (req.body?.idToken && typeof req.body.idToken === 'string') {
      token = req.body.idToken.trim();
    } else if (req.body?.token && typeof req.body.token === 'string') {
      token = req.body.token.trim();
    }

    if (!token) {
      return res.status(401).json({ error: 'Thiếu hoặc sai định dạng token xác thực.' });
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    const email = decodedToken.email?.trim().toLowerCase();
    const uid = decodedToken.uid;
    const name = decodedToken.name || email?.split('@')[0] || 'Member';

    if (!email) {
      return res.status(400).json({ error: 'Token không chứa thông tin email.' });
    }

    // Truy vấn profile trên Supabase theo email
    const { data: profile, error: dbError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (dbError) {
      console.error('Supabase query error:', dbError);
      return res.status(500).json({ error: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }

    // Nếu chưa tồn tại -> tự động tạo bản ghi pending với id khớp tuyệt đối Firebase UID (TEXT)
    if (!profile) {
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: uid, // BẮT BUỘC: Đồng nhất ID bảng profiles chính là Firebase UID dạng text
            uid,
            firebase_uid: uid,
            email,
            name,
            full_name: name,
            status: 'pending',
            role: 'CADET',
          }
        ]);

      if (insertError) {
        console.error('Auto-insert profile error:', insertError);
        return res.status(500).json({ error: 'Không thể khởi tạo yêu cầu cấp quyền.' });
      }

      return res.status(403).json({
        success: false,
        status: 'pending',
        error: 'Tài khoản đã được ghi nhận! Đang chờ bạn cấp quyền ACTIVE trong cơ sở dữ liệu.'
      });
    }

    // Nếu đã tồn tại nhưng thiếu thông tin định danh hoặc lệch ID, tự động cập nhật
    if (!profile.firebase_uid || !profile.uid) {
      await supabaseAdmin
        .from('profiles')
        .update({ firebase_uid: uid, uid: uid })
        .eq('email', email);
    }

    if ((profile.status || '').toUpperCase() !== 'ACTIVE') {
      return res.status(403).json({ 
        success: false,
        status: profile.status,
        error: 'Tài khoản đang ở trạng thái chờ duyệt (Pending). Vui lòng cấp quyền ACTIVE trong cơ sở dữ liệu.' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Đồng bộ tài khoản thành công!',
      user: {
        id: profile.id,
        firebaseUid: uid,
        email: profile.email,
        name: profile.full_name || profile.name || name,
        role: profile.role || 'MEMBER',
        rankTier: profile.rank || 'CADET',
      }
    });
  } catch (error: any) {
    console.error('Auth sync error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Lỗi hệ thống nội bộ.' });
  }
}