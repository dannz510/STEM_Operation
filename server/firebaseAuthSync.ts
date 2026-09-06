import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

// Khởi tạo Firebase Admin linh hoạt (hỗ trợ cả JSON string hoặc biến riêng lẻ)
function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountEnv) {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);
      return initializeApp({ credential: cert(serviceAccount) });
    } catch {
      const cleanedJson = JSON.parse(serviceAccountEnv.replace(/\\n/g, '\n'));
      return initializeApp({ credential: cert(cleanedJson) });
    }
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const firebaseAdmin = getFirebaseAdminApp();
const adminAuth = getAuth(firebaseAdmin);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export async function firebaseAuthSync(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Phương thức không được hỗ trợ.' });
  }

  // Hỗ trợ trích xuất token linh hoạt: từ Authorization Header hoặc từ JSON Body
  let idToken = '';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    idToken = authHeader.split('Bearer ')[1]?.trim() || '';
  } else if (req.body?.idToken && typeof req.body.idToken === 'string') {
    idToken = req.body.idToken.trim();
  } else if (req.body?.token && typeof req.body.token === 'string') {
    idToken = req.body.token.trim();
  }

  if (!idToken) {
    return res.status(401).json({ error: 'MISSING_ID_TOKEN', message: 'Thiếu hoặc sai định dạng token xác thực.' });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();
    const uid = decodedToken.uid;
    const name = decodedToken.name || email?.split('@')[0] || 'Thành viên STEM';

    if (!email) {
      return res.status(400).json({ error: 'EMAIL_REQUIRED', message: 'Token Firebase không chứa thông tin email.' });
    }

    // 1. Kiểm tra profile trong Supabase theo email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error('Supabase profile query error:', profileError);
      return res.status(500).json({ error: 'DATABASE_ERROR', message: 'Lỗi truy vấn cơ sở dữ liệu.' });
    }

    // Nếu chưa tồn tại profile, tự động tạo mới với trạng thái pending để quản trị viên duyệt
    if (!profile) {
      const insertPayload = {
        email,
        full_name: name,
        name: name,
        firebase_uid: uid,
        uid: uid,
        status: 'pending',
        role: 'CADET',
      };

      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([insertPayload]);

      if (insertError) {
        console.error('Auto-insert profile error:', insertError);
        return res.status(500).json({ error: 'PROFILE_CREATION_FAILED', message: 'Không thể khởi tạo yêu cầu cấp quyền tài khoản.' });
      }

      return res.status(403).json({
        success: false,
        status: 'pending',
        error: 'ACCOUNT_PENDING',
        message: 'Tài khoản đã được ghi nhận! Đang chờ kích hoạt trạng thái ACTIVE.',
      });
    }

    // 2. Kiểm tra trạng thái tài khoản
    const accountStatus = (profile.status || '').toUpperCase();
    if (accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        status: profile.status,
        error: 'ACCOUNT_INACTIVE',
        message: 'Tài khoản chưa được kích hoạt hoặc đang ở trạng thái chờ duyệt.',
      });
    }

    // 3. Đồng bộ cập nhật firebase_uid / uid nếu chưa có
    if (!profile.firebase_uid && !profile.uid) {
      await supabaseAdmin
        .from('profiles')
        .update({ firebase_uid: uid, uid: uid })
        .eq('id', profile.id);
    }

    // 4. Kiểm tra Workspace Membership nếu có truyền workspaceId
    const workspaceId = typeof req.body?.workspaceId === 'string' ? req.body.workspaceId : '';
    let role = profile.role || 'MEMBER';
    
    if (workspaceId) {
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from('workspace_memberships')
        .select('role, active')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (membershipError) {
        console.error('Workspace membership query error:', membershipError);
      } else if (membership) {
        if (!membership.active) {
          return res.status(403).json({ error: 'WORKSPACE_ACCESS_DENIED', message: 'Bạn không có quyền truy cập workspace này.' });
        }
        role = membership.role || role;
      }
    }

    return res.status(200).json({
      success: true,
      user: {
        id: profile.id,
        firebaseUid: uid,
        email: profile.email,
        name: profile.full_name || profile.name || name,
        role,
        rankTier: profile.rank || profile.rankTier || 'CADET',
      },
    });
  } catch (error: any) {
    console.error('Firebase auth sync failed:', error instanceof Error ? error.message : error);
    return res.status(401).json({ error: 'AUTH_SYNC_FAILED', message: 'Xác thực token thất bại hoặc đã hết hạn.' });
  }
}