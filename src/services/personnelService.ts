import { requireSupabase } from '../lib/supabase';

export type WorkspaceRole = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'MEMBER';

export interface WorkspaceMembership {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  sub_branch_code: string | null;
  joined_at: string;
  active: boolean;
}

export async function onboardPersonnel(input: {
  workspaceId: string;
  email: string;
  role?: WorkspaceRole;
}): Promise<WorkspaceMembership> {
  const { data, error } = await requireSupabase().rpc('onboard_personnel', {
    target_workspace: input.workspaceId,
    target_email: input.email.trim().toLowerCase(),
    target_role: input.role ?? 'MEMBER',
  });

  if (error) {
    if (error.message.includes('MEMBER_NOT_FOUND')) {
      throw new Error('MEMBER_NOT_FOUND: Email này chưa tạo tài khoản trên hệ thống.');
    }
    if (error.message.includes('ACCOUNT_INACTIVE')) {
      throw new Error('ACCOUNT_INACTIVE: Tài khoản của email này chưa được kích hoạt.');
    }
    throw error;
  }

  return data as WorkspaceMembership;
}
