import { Asset } from '../types';
import { requireSupabase } from '../lib/supabase';

export interface AssetBorrowResult {
  id: string;
  asset_id: string;
  borrower_id: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'DISPUTED';
  borrowed_at: string;
  expected_return_at: string;
  returned_at: string | null;
  condition_on_loan: string;
  condition_on_return: string | null;
  note: string | null;
  request_id: string;
}

interface AssetRow {
  id: string;
  code: string;
  name: string;
  category: string;
  branch_owner: string | null;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED' | 'LOST';
  location: string;
  serial_number: string | null;
  value_vnd: number;
  qr_token: string;
  tags: string[];
  metadata: Record<string, unknown>;
  last_maintenance: string | null;
  notes: string;
}

export async function listWorkspaceAssets(workspaceId: string): Promise<AssetRow[]> {
  const { data, error } = await requireSupabase()
    .from('assets')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name');

  if (error) throw error;
  return (data ?? []) as AssetRow[];
}

export async function borrowAsset(input: {
  workspaceId: string;
  assetId: string;
  expectedReturnAt: string;
  requestId: string;
  note?: string;
}): Promise<AssetBorrowResult> {
  const { data, error } = await requireSupabase().rpc('borrow_asset', {
    target_workspace: input.workspaceId,
    target_asset: input.assetId,
    expected_return: input.expectedReturnAt,
    request: input.requestId,
    note_text: input.note ?? '',
  });

  if (error) throw error;
  return data as AssetBorrowResult;
}

export async function returnAsset(input: {
  workspaceId: string;
  loanId: string;
  condition: string;
  requestId: string;
}): Promise<AssetBorrowResult> {
  const { data, error } = await requireSupabase().rpc('return_asset', {
    target_workspace: input.workspaceId,
    target_loan: input.loanId,
    return_condition: input.condition,
    request: input.requestId,
  });

  if (error) throw error;
  return data as AssetBorrowResult;
}

export function assetRowToLegacyAsset(row: AssetRow): Asset {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category as Asset['category'],
    branchOwner: (row.branch_owner ?? 'AST-2.1') as Asset['branchOwner'],
    status: row.status === 'IN_USE' ? 'IN_USE' : row.status === 'AVAILABLE' ? 'AVAILABLE' : 'MAINTENANCE',
    location: row.location,
    valueVnd: row.value_vnd,
    serialNumber: row.serial_number ?? '',
    qrCode: row.qr_token,
    lastMaintenance: row.last_maintenance ?? '',
    specifications: typeof row.metadata.specifications === 'string' ? row.metadata.specifications : '',
    notes: row.notes,
    sealStatus: 'SEALED',
  };
}
