import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { createClient } from '@supabase/supabase-js';
import type { Request, Response } from 'express';

const firebaseAdmin = getApps().length > 0
  ? getApps()[0]
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

const adminAuth = getAuth(firebaseAdmin);
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export async function firebaseAuthSync(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const idToken = typeof req.body?.idToken === 'string' ? req.body.idToken : '';
  if (!idToken) {
    res.status(400).json({ error: 'MISSING_ID_TOKEN' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email?.trim().toLowerCase();
    if (!email) {
      res.status(400).json({ error: 'EMAIL_REQUIRED' });
      return;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id,email,full_name,status,rank,firebase_uid')
      .eq('email', email)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) {
      res.status(403).json({ error: 'MEMBER_NOT_FOUND', message: 'Email chưa được đăng ký trong danh sách nhân sự.' });
      return;
    }
    if (profile.status !== 'ACTIVE') {
      res.status(403).json({ error: 'ACCOUNT_INACTIVE', message: 'Tài khoản chưa được kích hoạt.' });
      return;
    }

    if (!profile.firebase_uid) {
      const { error: identityError } = await supabaseAdmin
        .from('profiles')
        .update({ firebase_uid: decodedToken.uid })
        .eq('id', profile.id);
      if (identityError) throw identityError;
    }

    const workspaceId = typeof req.body.workspaceId === 'string' ? req.body.workspaceId : '';
    let role = 'MEMBER';
    if (workspaceId) {
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from('workspace_memberships')
        .select('role,active')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profile.id)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!membership?.active) {
        res.status(403).json({ error: 'WORKSPACE_ACCESS_DENIED' });
        return;
      }
      role = membership.role;
    }

    res.status(200).json({
      success: true,
      user: {
        id: profile.id,
        firebaseUid: decodedToken.uid,
        email: profile.email,
        name: profile.full_name || decodedToken.name || 'Thành viên STEM',
        role,
        rankTier: profile.rank,
      },
    });
  } catch (error) {
    console.error('Firebase auth sync failed', error instanceof Error ? error.message : error);
    res.status(401).json({ error: 'AUTH_SYNC_FAILED' });
  }
}
