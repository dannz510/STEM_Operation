// ─── Sync Infrastructure ─────────────────────────────────────────────────────

export interface SyncableEntity {
  id: string;
  updatedAt: string; // ISO-8601, used for Last-Write-Wins conflict resolution
  version?: number;  // Optimistic locking counter
}

export interface SyncPayload<T> {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'task' | 'schedule' | 'member' | 'asset' | 'loan' | 'incident' | 'roster' | 'consumable' | 'merit_log';
  data: T;
  clientTimestamp: number; // Date.now() ms
  deviceId: string;        // Persistent device identifier
}

export type SyncStatus = 'synced' | 'pending' | 'offline';

// ─── App Domain Types ─────────────────────────────────────────────────────────

export type OperatingMode = 'NORMAL' | 'EVENT';
export type EventPhase = 'PRE_EVENT' | 'IN_EVENT' | 'POST_EVENT' | 'D_MINUS_1' | 'D_DAY' | 'D_PLUS_1';

export type TabKey = 'DASHBOARD' | 'ASSETS' | 'LOANS' | 'ROSTER' | 'TASKS' | 'GAMIFICATION' | 'EVENT' | 'CODEX';

export type TaskStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskItem extends SyncableEntity {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName?: string;
  pointsReward: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface ScheduleItem extends SyncableEntity {
  id: string;
  title: string;
  userId: string;
  userName: string;
  startAt: string;
  endAt: string;
  status: 'CONFIRMED' | 'CANCELLED';
  colorCode: string;
  updatedAt: string;
  version?: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CodexSection {
  id: string;
  title: string;
  content: string;
}

export type RankLevel = 'CADET' | 'OPERATOR' | 'LEAD' | 'CHIEF' | 'GRANDMASTER';

export type SubBranchCode =
  | 'OPS-1.1' // Kỹ thuật In 3D & Máy Chế tác
  | 'HR-1.2'  // Quản trị Nhân sự & Huấn luyện
  | 'AST-2.1' // Quản lý Tài sản & Thiết bị
  | 'FIN-2.2' // Quản lý Vật tư Tiêu hao & Dự toán
  | 'PWR-3.1' // Hạ tầng Điện & Mạng
  | 'SAF-3.2' // An toàn, Hóa chất & PCCC
  | 'LAY-4.1' // Không gian & Bố trí Mặt bằng
  | 'LOG-4.2' // Hậu cần Đồ nặng & Vận chuyển
  | 'PRO-4.3' // Lễ tân & Chăm sóc VIP
  | 'STG-5.1' // Điều phối Sân khấu & Âm thanh Ánh sáng
  | 'WKI-5.2'; // Số hóa Hồ sơ & Thư viện Tri thức

export type BranchCode = 'FAB_HR' | 'INV_FIN' | 'INFRA_SAF' | 'LOG_PRO' | 'STG_WKI';

export interface SubBranchInfo {
  code: SubBranchCode;
  name: string;
  branchName: string;
  branchCode: BranchCode;
  leaderTitle: string;
  targetGenderRatio: string;
  normalMission: string;
  eventMission: string;
  keyAssets: string[];
  sopCodes: string[];
  crossSupport?: string;
  coreCompetencies?: string[];
  kpiChecklist?: string[];
  jobDescription?: string;
}

export interface Member {
  id: string;
  code: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  branchCode: BranchCode;
  subBranchCode: SubBranchCode;
  rank: RankLevel;
  meritPoints: number;
  demeritPoints: number;
  warningLevel: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
  gender: 'MALE' | 'FEMALE';
  status: 'ACTIVE' | 'ON_DUTY' | 'EXAM_MODE' | 'SUSPENDED';
  joinedDate: string;
  avatarUrl?: string;
  shiftCommitment: string;
  completedShifts?: number;
}

export type AssetStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DAMAGED_L1' | 'DAMAGED_L2' | 'DAMAGED_L3' | 'DAMAGED_L4';
export type AssetCategory =
  | '3D_PRINTER'
  | 'CNC_LASER'
  | 'MECHANICAL_TOOL'
  | 'ELECTRONICS'
  | 'AV_EVENT'
  | 'SAFETY_EQUIP'
  | 'MEASUREMENT'
  | 'ROBOTICS'
  | 'CONSUMABLE';

export interface Asset {
  id: string;
  code: string; // e.g., AST-FDM-01
  name: string;
  category: AssetCategory;
  branchOwner: SubBranchCode;
  status: AssetStatus;
  location: string;
  valueVnd: number;
  serialNumber: string;
  qrCode: string;
  lastMaintenance: string;
  specifications: string;
  notes: string;
  currentBorrower?: string;
  sealStatus: 'SEALED' | 'UNSEALED' | 'BROKEN';
}

export interface ConsumableItem {
  id: string;
  code?: string;
  name: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  unitPriceVnd?: number;
  category: string;
  lastRestocked: string;
  subBranch: SubBranchCode;
  specs?: string;
}

export interface LoanTicket {
  id: string;
  ticketCode: string; // Form 01 - #LN-2025-001
  borrowerName: string;
  borrowerRole?: string; // Sinh viên / Giảng viên / Đội thi STEM
  borrowerPhone: string;
  borrowerUnit: string;
  assetId?: string;
  assetCode: string;
  assetName: string;
  loanTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  purpose: string;
  conditionOnLoan: string;
  conditionOnReturn?: string;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'DISPUTED';
  approverName: string;
  approverRank: RankLevel;
  depositVnd?: number;
  threeLayerVerification: {
    cctvTimestamp: string;
    inspectorName: string;
    reconciliationDone: boolean;
  };
}

export interface ShiftRoster {
  id: string;
  date: string;
  shiftNumber?: 1 | 2 | 3;
  shiftName?: string;
  shiftTime?: string;
  operatorId?: string;
  operatorName?: string;
  cadetId?: string;
  cadetName?: string;
  leadOperatorId?: string;
  leadOperatorName?: string;
  leadOperatorRank?: string;
  cadetAssistantId?: string;
  cadetAssistantName?: string;
  subBranch?: string;
  isProxyDuty?: boolean;
  handover5S: {
    sortDone: boolean;         // Sàng lọc
    setInOrderDone: boolean;   // Sắp xếp
    shineDone: boolean;        // Sạch sẽ
    standardizeDone: boolean;  // Săn sóc
    sustainDone: boolean;      // Sẵn sàng
    machinesCalibrated: boolean;
    powerIsolated: boolean;
    chemicalCabinetLocked: boolean;
  };
  notes?: string;
  verifiedByCctv?: boolean;
  isCompleted: boolean;
}

export type HandoverChecklist5S = ShiftRoster['handover5S'];

export interface MeritDemeritLog {
  id: string;
  memberId: string;
  memberName: string;
  subBranchCode: SubBranchCode;
  type: 'MERIT' | 'DEMERIT';
  points: number;
  ruleCode: string;
  reason: string;
  timestamp: string;
  recordedBy: string;
  loggedByName?: string;
}

export interface IncidentReport {
  id: string;
  code: string; // Form 02 - INC-2025-001
  title: string;
  severity: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'RED_CODE';
  category?: 'EQUIPMENT_DAMAGE' | 'ELECTRICAL' | 'FIRE_HAZARD' | 'CHEMICAL_SPILL' | 'INJURY' | 'DISPUTE_PR';
  subBranch: SubBranchCode;
  description: string;
  immediateAction: string;
  damageCompensationVnd?: number;
  reporterName: string;
  reporterPhone: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  timestamp: string;
  singlePointOfContact: string; // Rule of SPOC
  compensationStatus?: string;
}

export interface RadioChannel {
  channelNumber: number;
  channelName: string;
  frequency: string;
  leadRole: string;
  protocol: string;
  allowedSubBranches: SubBranchCode[];
}

export interface EventStageCue {
  id: string;
  timeOffset: string;
  scene: string;
  action: string;
  responsibleSubBranch: SubBranchCode;
  audioVisualCue: string;
  status: 'PENDING' | 'LIVE' | 'COMPLETED' | 'STANDBY';
}
