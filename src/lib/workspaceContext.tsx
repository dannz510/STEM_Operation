// src/lib/workspaceContext.tsx
// Provides authenticated user session + workspace resolution across the entire app.
// Wraps AuthGate / FirebaseAuthGate to expose workspaceId and userId to children.

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { isFirebaseConfigured, SyncedFirebaseUser } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspaceContextValue {
  /** Current Supabase session, or null if not logged in / using Firebase / guest */
  session: Session | null;
  /** Firebase-synced user, if using Firebase auth */
  firebaseUser: SyncedFirebaseUser | null;
  /** Resolved user ID (Supabase uid or Firebase uid) */
  userId: string | null;
  /** Active workspace ID. Null until resolved or in guest mode. */
  workspaceId: string | null;
  /** Whether the workspace is being resolved */
  isResolvingWorkspace: boolean;
  /** True if user is in guest/offline mode (no auth) */
  isGuest: boolean;
  /** Force refresh workspace resolution */
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue>({
  session: null,
  firebaseUser: null,
  userId: null,
  workspaceId: null,
  isResolvingWorkspace: false,
  isGuest: false,
  refreshWorkspace: async () => {},
});

// ─── Firebase User Bridge ─────────────────────────────────────────────────────

const FIREBASE_USER_SESSION_KEY = 'stem_v3_fb_user';

export function storeFirebaseUser(user: SyncedFirebaseUser): void {
  sessionStorage.setItem(FIREBASE_USER_SESSION_KEY, JSON.stringify(user));
}

export function clearFirebaseUser(): void {
  sessionStorage.removeItem(FIREBASE_USER_SESSION_KEY);
}

function readFirebaseUser(): SyncedFirebaseUser | null {
  try {
    const raw = sessionStorage.getItem(FIREBASE_USER_SESSION_KEY);
    return raw ? (JSON.parse(raw) as SyncedFirebaseUser) : null;
  } catch {
    return null;
  }
}

// ─── Workspace Resolution ─────────────────────────────────────────────────────

async function resolveOrCreateWorkspace(userId: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    // 1. Try to find an existing workspace membership
    const { data: memberships, error: memberError } = await supabase
      .from('workspace_memberships')
      .select('workspace_id')
      .eq('user_id', userId)
      .eq('active', true)
      .limit(1);

    if (!memberError && memberships && memberships.length > 0) {
      return memberships[0].workspace_id as string;
    }

    // 2. No workspace found — create a default one
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    const workspaceName = profile?.full_name
      ? `${profile.full_name}'s Lab`
      : profile?.email
        ? `${profile.email.split('@')[0]}'s Lab`
        : 'My STEM Lab';

    const slug = workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    const { data: newWorkspace, error: createError } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName, slug: `${slug}-${Date.now()}` })
      .select('id')
      .single();

    if (createError || !newWorkspace) {
      console.error('[WorkspaceContext] Failed to create workspace:', createError?.message);
      return null;
    }

    const workspaceId = newWorkspace.id as string;

    // 3. Add the user as ADMIN of their own workspace
    const { error: membershipError } = await supabase
      .from('workspace_memberships')
      .insert({ workspace_id: workspaceId, user_id: userId, role: 'ADMIN', active: true });

    if (membershipError) {
      console.error('[WorkspaceContext] Failed to add membership:', membershipError.message);
    }

    return workspaceId;
  } catch (err) {
    console.error('[WorkspaceContext] Unexpected error resolving workspace:', err);
    return null;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

const WORKSPACE_CACHE_KEY = 'stem_v3_workspace_id';
const WORKSPACE_USER_CACHE_KEY = 'stem_v3_workspace_owner_uid';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<SyncedFirebaseUser | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isResolvingWorkspace, setIsResolvingWorkspace] = useState(false);
  const isGuest = window.localStorage.getItem('stem_v3_guest_mode') === 'true';

  const userId = session?.user?.id ?? firebaseUser?.id ?? null;

  const resolveWorkspace = useCallback(async (uid: string, force = false) => {
    if (!uid) return;

    setIsResolvingWorkspace(true);
    try {
      // Check if cached workspace belongs to the exact same user
      const cachedUid = window.localStorage.getItem(WORKSPACE_USER_CACHE_KEY);
      const cachedWorkspace = window.localStorage.getItem(WORKSPACE_CACHE_KEY);

      if (!force && cachedUid === uid && cachedWorkspace) {
        setWorkspaceId(cachedWorkspace);
        setIsResolvingWorkspace(false);
        return;
      }

      // Resolve from database
      const resolved = await resolveOrCreateWorkspace(uid);
      if (resolved) {
        window.localStorage.setItem(WORKSPACE_CACHE_KEY, resolved);
        window.localStorage.setItem(WORKSPACE_USER_CACHE_KEY, uid);
        setWorkspaceId(resolved);
      } else {
        setWorkspaceId(null);
      }
    } catch (err) {
      console.error('[WorkspaceContext] Error in resolveWorkspace:', err);
    } finally {
      setIsResolvingWorkspace(false);
    }
  }, []);

  // Supabase session listener
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || isFirebaseConfigured) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user?.id) {
        void resolveWorkspace(data.session.user.id);
      } else {
        window.localStorage.removeItem(WORKSPACE_CACHE_KEY);
        window.localStorage.removeItem(WORKSPACE_USER_CACHE_KEY);
        setWorkspaceId(null);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        void resolveWorkspace(nextSession.user.id);
      } else {
        // Logged out — clear workspace cache & user scope
        window.localStorage.removeItem(WORKSPACE_CACHE_KEY);
        window.localStorage.removeItem(WORKSPACE_USER_CACHE_KEY);
        setWorkspaceId(null);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [resolveWorkspace]);

  // Firebase user bridge
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const fb = readFirebaseUser();
    if (fb) {
      setFirebaseUser(fb);
      void resolveWorkspace(fb.id);
    }
  }, [resolveWorkspace]);

  const refreshWorkspace = useCallback(async () => {
    if (userId) {
      await resolveWorkspace(userId, true);
    }
  }, [userId, resolveWorkspace]);

  const value: WorkspaceContextValue = {
    session,
    firebaseUser,
    userId,
    workspaceId,
    isResolvingWorkspace,
    isGuest,
    refreshWorkspace,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext);
}