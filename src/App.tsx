// src/App.tsx
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { usePersistentState } from './hooks/usePersistentState';
import { useSyncedState } from './hooks/useSyncedState';
import { useWorkspace } from './lib/workspaceContext';
import {
  OperatingMode,
  EventPhase,
  Asset,
  LoanTicket,
  Member,
  ShiftRoster,
  IncidentReport,
  ConsumableItem,
  MeritDemeritLog,
  TabKey,
  SubBranchCode,
  TaskItem,
  TaskStatus,
  ScheduleItem,
  AppNotification,
  SyncStatus,
} from './types';
import {
  INITIAL_MEMBERS,
  INITIAL_ASSETS,
  INITIAL_LOANS,
  INITIAL_ROSTERS,
  INITIAL_INCIDENTS,
  INITIAL_CONSUMABLES,
  INITIAL_MERIT_LOGS,
  generateCode,
} from './data/initialData';

import { Header } from './components/Header';
import { Logo } from './components/brand';
import { RedCodeModal } from './components/RedCodeModal';
import { QrAssetModal } from './components/QrAssetModal';
import { Form01LoanModal } from './components/Form01LoanModal';
import { Form02IncidentModal } from './components/Form02IncidentModal';
import { MeritRecordModal } from './components/MeritRecordModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { SyncStatusBadge } from './components/SyncStatusBadge';

import { DashboardTab } from './components/tabs/DashboardTab';
import { AssetInventoryTab } from './components/tabs/AssetInventoryTab';
import { LoanFormsTab } from './components/tabs/LoanFormsTab';
import { ShiftRosterTab } from './components/tabs/ShiftRosterTab';
import { GamificationHrTab } from './components/tabs/GamificationHrTab';
import { EventArenaTab } from './components/tabs/EventArenaTab';
import { CodexWikiTab } from './components/tabs/CodexWikiTab';
import { TaskScheduleTab } from './components/tabs/TaskScheduleTab';

const QrScannerModal = lazy(() => import('./components/QrScannerModal').then((module) => ({ default: module.QrScannerModal })));

export default function App() {
  const STORAGE_KEY = 'stem_v3_';

  // ─── Workspace & Auth Context ─────────────────────────────────────────────
  const { workspaceId } = useWorkspace();

  const [mode, setMode] = usePersistentState<OperatingMode>(`${STORAGE_KEY}mode`, 'NORMAL');
  const [eventPhase, setEventPhase] = usePersistentState<EventPhase>(`${STORAGE_KEY}event_phase`, 'D_DAY');
  const [theme, setTheme] = usePersistentState<'light' | 'dark'>(`${STORAGE_KEY}theme`, 'light');
  const [onboardingDone, setOnboardingDone] = usePersistentState<boolean>(`${STORAGE_KEY}onboarding_done`, false);
  const [activeTab, setActiveTab] = useState<TabKey>('DASHBOARD');

  const [members, setMembers] = usePersistentState<Member[]>(`${STORAGE_KEY}members`, INITIAL_MEMBERS);

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return members[0]?.id || '';
  });
  const activeMember = members.find((m) => m.id === activeMemberId);

  const [assets, setAssets] = usePersistentState<Asset[]>(`${STORAGE_KEY}assets`, INITIAL_ASSETS);
  const [loans, setLoans] = usePersistentState<LoanTicket[]>(`${STORAGE_KEY}loans`, INITIAL_LOANS);
  const [rosters, setRosters] = usePersistentState<ShiftRoster[]>(`${STORAGE_KEY}rosters`, INITIAL_ROSTERS);
  const [incidents, setIncidents] = usePersistentState<IncidentReport[]>(`${STORAGE_KEY}incidents`, INITIAL_INCIDENTS);
  const [consumables, setConsumables] = usePersistentState<ConsumableItem[]>(`${STORAGE_KEY}consumables`, INITIAL_CONSUMABLES);
  const [meritLogs, setMeritLogs] = usePersistentState<MeritDemeritLog[]>(`${STORAGE_KEY}merit_logs`, INITIAL_MERIT_LOGS);

  // ─── Synced State: Tasks & Schedules (Supabase + IndexedDB + Realtime) ────
  const {
    data: tasks,
    setData: setTasks,
    syncStatus: taskSyncStatus,
    pendingCount: taskPendingCount,
    upsertItem: upsertTask,
    deleteItem: deleteSyncedTask,
    flushNow: flushTasks,
  } = useSyncedState<TaskItem & { updatedAt: string }>(
    {
      tableName: 'tasks',
      cacheKey: 'tasks',
      workspaceId,
      entity: 'task',
      writeCommandType: 'UPDATE_TASK',
      fallback: [],
      realtime: true,
    }
  );

  const {
    data: schedules,
    setData: setSchedules,
    syncStatus: scheduleSyncStatus,
    pendingCount: schedulePendingCount,
    upsertItem: upsertSchedule,
    deleteItem: deleteSyncedSchedule,
    flushNow: flushSchedules,
  } = useSyncedState<ScheduleItem & { updatedAt: string }>(
    {
      tableName: 'schedules',
      cacheKey: 'schedules',
      workspaceId,
      entity: 'schedule',
      writeCommandType: 'UPDATE_SCHEDULE',
      fallback: [],
      realtime: true,
    }
  );

  // Combine sync status across entities
  const combinedSyncStatus: SyncStatus =
    taskSyncStatus === 'offline' || scheduleSyncStatus === 'offline'
      ? 'offline'
      : taskSyncStatus === 'pending' || scheduleSyncStatus === 'pending'
        ? 'pending'
        : 'synced';
  const combinedPendingCount = taskPendingCount + schedulePendingCount;

  const [notifications, setNotifications] = usePersistentState<AppNotification[]>(`${STORAGE_KEY}notifications`, []);

  const [isRedCodeOpen, setIsRedCodeOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [preselectedAssetForLoan, setPreselectedAssetForLoan] = useState<Asset | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isQrAssetModalOpen, setIsQrAssetModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<Asset | null>(null);
  const [isMeritRecordOpen, setIsMeritRecordOpen] = useState(false);
  const [preselectedMemberForMerit, setPreselectedMemberForMerit] = useState<string | undefined>(undefined);
  const [isGoogleWorkspaceOpen, setIsGoogleWorkspaceOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const addNotification = (title: string, message: string) => {
    setNotifications((current) => [{ id: generateCode('NTF'), title, message, read: false, createdAt: new Date().toISOString() }, ...current].slice(0, 30));
  };

  const handleToggleMode = () => {
    const nextMode = mode === 'NORMAL' ? 'EVENT' : 'NORMAL';
    setMode(nextMode);
    showToast(
      nextMode === 'EVENT'
        ? 'Đã kích hoạt EVENT MODE — trực chiến hiện trường'
        : 'Đã chuyển về NORMAL MODE — quản trị Lab'
    );
  };

  const handleTriggerRedCode = (data: {
    title: string;
    category: 'FIRE_HAZARD' | 'ELECTRICAL' | 'CHEMICAL_SPILL' | 'INJURY' | 'DISPUTE_PR';
    subBranch: SubBranchCode;
    description: string;
    immediateAction: string;
  }) => {
    const newIncident: IncidentReport = {
      id: `INC-${Date.now()}`,
      code: generateCode('INC'),
      title: data.title,
      category: data.category,
      subBranch: data.subBranch,
      severity: 'RED_CODE',
      description: data.description,
      immediateAction: data.immediateAction,
      reporterName: activeMember?.name || 'System',
      reporterPhone: activeMember?.phone || '',
      timestamp: new Date().toISOString(),
      status: 'INVESTIGATING',
      singlePointOfContact: activeMember?.name || 'OPS-1.1',
    };
    setIncidents([newIncident, ...incidents]);
    setMode('EVENT');
    setEventPhase('D_DAY');
    showToast('RED CODE đã kích hoạt — toàn quân ra mặt đất');
    addNotification('RED CODE được kích hoạt', newIncident.title);
  };

  const handleCreateLoanTicket = (newLoan: Omit<LoanTicket, 'id'>) => {
    const created: LoanTicket = { ...newLoan, id: generateCode('LN') };
    setLoans([created, ...loans]);
    setAssets((prev) => prev.map((a) => (a.code === created.assetCode ? { ...a, status: 'IN_USE' } : a)));
    showToast(`Đã lập phiếu mượn #${created.ticketCode}`);
    addNotification('Phiếu mượn mới', `${created.assetName} · ${created.borrowerName}`);
  };

  const handleReturnLoan = (loanId: string, returnCondition: string) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;
    setLoans((prev) => prev.map((l) => (l.id === loanId ? {
      ...l,
      status: 'RETURNED',
      actualReturnTime: new Date().toISOString().split('T')[0],
      conditionOnReturn: returnCondition,
    } : l)));
    setAssets((prev) => prev.map((a) => a.code === loan.assetCode ? { ...a, status: 'AVAILABLE', sealStatus: 'SEALED' } : a));
    showToast(`Nghiệm thu trả thiết bị #${loan.assetCode} thành công`);
    if (loan.borrowerName === activeMember?.name && (!loan.expectedReturnTime || new Date() <= new Date(loan.expectedReturnTime))) {
      const points = 10;
      setMembers((prev) => prev.map((member) => member.id === activeMember.id ? { ...member, meritPoints: member.meritPoints + points } : member));
      addNotification('Thưởng điểm trả thiết bị', `+${points} Merit cho ${activeMember.name}`);
    }
  };

  const handleCreateIncident = (newIncident: Omit<IncidentReport, 'id' | 'code'>) => {
    const created: IncidentReport = { ...newIncident, id: generateCode('INC'), code: generateCode('INC') };
    setIncidents([created, ...incidents]);
    showToast(`Ghi nhận sự cố #${created.code}`);
    addNotification('Sự cố mới cần xử lý', created.title);
  };

  const handleToggleSeal = (assetId: string) => {
    setAssets((prev) => prev.map((a) =>
      a.id === assetId ? { ...a, sealStatus: a.sealStatus === 'SEALED' ? 'BROKEN' : 'SEALED' } : a
    ));
  };

  const handleAddNewAsset = (newAsset: Omit<Asset, 'id'>) => {
    const created: Asset = { ...newAsset, id: generateCode('AST') };
    setAssets([created, ...assets]);
    showToast(`Đã nhập thiết bị [${created.name}] vào kho`);
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    showToast(`Đã lưu cập nhật [${updatedAsset.name}]`);
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== assetId));
    showToast('Đã xóa thiết bị khỏi kho');
  };

  const handleRestockConsumable = (id: string, amount: number) => {
    setConsumables((prev) => prev.map((c) =>
      c.id === id ? { ...c, currentStock: c.currentStock + amount, lastRestocked: new Date().toISOString().split('T')[0] } : c
    ));
    showToast(`Đã nhập +${amount} vật tư`);
  };

  const handleUseConsumable = (id: string, amount: number) => {
    setConsumables((prev) => prev.map((c) =>
      c.id === id ? { ...c, currentStock: Math.max(0, c.currentStock - amount) } : c
    ));
    showToast(`Đã xuất -${amount} vật tư`);
  };

  const handleAddNewConsumable = (item: Omit<ConsumableItem, 'id'>) => {
    const created: ConsumableItem = { ...item, id: generateCode('CONS') };
    setConsumables([created, ...consumables]);
    showToast(`Đã thêm vật tư [${created.name}]`);
  };

  const handleEditLoan = (updatedLoan: LoanTicket) => {
    setLoans((prev) => prev.map((l) => (l.id === updatedLoan.id ? updatedLoan : l)));
    showToast(`Đã cập nhật phiếu #${updatedLoan.ticketCode}`);
  };

  const handleDeleteLoan = (loanId: string) => {
    const loanToDelete = loans.find((l) => l.id === loanId);
    if (loanToDelete?.status === 'ACTIVE') {
      setAssets((prev) => prev.map((a) => a.code === loanToDelete.assetCode ? { ...a, status: 'AVAILABLE' } : a));
    }
    setLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToast('Đã xóa phiếu mượn');
  };

  const handleToggleIncidentStatus = (incidentId: string) => {
    setIncidents((prev) => prev.map((i) =>
      i.id === incidentId ? { ...i, status: i.status === 'RESOLVED' ? 'INVESTIGATING' : 'RESOLVED' } : i
    ));
  };

  const handleDeleteIncident = (incidentId: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
    showToast('Đã xóa biên bản sự cố');
  };

  const handleQrDetected = (value: string) => {
    const scannedCode = value.match(/\/assets\/([^/?#]+)/i)?.[1] || value;
    const normalizedCode = decodeURIComponent(scannedCode).trim();
    const matchedAsset = assets.find((asset) => asset.code === normalizedCode || asset.qrCode === normalizedCode);

    setIsQrScannerOpen(false);
    if (!matchedAsset) {
      showToast(`Không tìm thấy tài sản [${normalizedCode}]`);
      return;
    }

    setSelectedAssetForQr(matchedAsset);
    setIsQrAssetModalOpen(true);
    showToast(`Đã mở hồ sơ tài sản [${matchedAsset.code}]`);
  };

  const handleAddNewMember = (newMember: Omit<Member, 'id'>) => {
    const created: Member = { ...newMember, id: generateCode('MBR') };
    setMembers([created, ...members]);
    showToast(`Đã thêm nhân sự [${created.name}]`);
  };

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    showToast(`Đã cập nhật [${updatedMember.name}]`);
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    showToast('Đã xóa nhân sự');
  };

  const handleAddNewShift = (newShift: Omit<ShiftRoster, 'id'>) => {
    const created: ShiftRoster = { ...newShift, id: generateCode('SHIFT') };
    setRosters([created, ...rosters]);
    showToast('Đã thiết lập ca trực mới');
  };

  const handleDeleteShift = (shiftId: string) => {
    setRosters((prev) => prev.filter((s) => s.id !== shiftId));
    showToast('Đã hủy ca trực');
  };

  const handleToggle5SItem = (shiftId: string, itemKey: keyof ShiftRoster['handover5S']) => {
    setRosters((prev) => prev.map((r) =>
      r.id === shiftId ? { ...r, handover5S: { ...r.handover5S, [itemKey]: !r.handover5S[itemKey] } } : r
    ));
  };

  const handleCompleteShift = (shiftId: string) => {
    const shift = rosters.find((r) => r.id === shiftId);
    if (!shift) return;
    setRosters((prev) => prev.map((r) => (r.id === shiftId ? { ...r, isCompleted: true } : r)));
    const leadId = shift.leadOperatorId;
    const cadetId = shift.cadetAssistantId;
    setMembers((prev) => prev.map((m) => {
      if (m.id === leadId || m.id === cadetId) {
        return { ...m, meritPoints: m.meritPoints + 10, completedShifts: (m.completedShifts || 0) + 1 };
      }
      return m;
    }));
    showToast('Hoàn thành ca trực +10 Merit cho kíp trực');
  };

  const handleRecordPoints = (data: {
    memberId: string;
    type: 'MERIT' | 'DEMERIT';
    points: number;
    ruleCode: string;
    reason: string;
  }) => {
    const target = members.find((m) => m.id === data.memberId);
    if (!target) return;
    const newLog: MeritDemeritLog = {
      id: generateCode('LOG'),
      memberId: target.id,
      memberName: target.name,
      subBranchCode: target.subBranchCode,
      type: data.type,
      points: data.points,
      ruleCode: data.ruleCode,
      reason: data.reason,
      timestamp: new Date().toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }),
      recordedBy: activeMember?.name || 'System',
    };
    setMeritLogs([newLog, ...meritLogs]);
    setMembers((prev) => prev.map((m) => {
      if (m.id !== data.memberId) return m;
      const updatedMerit = data.type === 'MERIT' ? m.meritPoints + data.points : m.meritPoints;
      const updatedDemerit = data.type === 'DEMERIT' ? m.demeritPoints + data.points : m.demeritPoints;
      let updatedRank = m.rank;
      if (updatedMerit >= 500) updatedRank = 'GRANDMASTER';
      else if (updatedMerit >= 300 && (m.rank === 'LEAD' || m.rank === 'OPERATOR')) updatedRank = 'CHIEF';
      else if (updatedMerit >= 200 && m.rank === 'OPERATOR') updatedRank = 'LEAD';
      else if (updatedMerit >= 100 && m.rank === 'CADET') updatedRank = 'OPERATOR';
      let updatedWarn = m.warningLevel;
      if (updatedDemerit >= 50) updatedWarn = 'LEVEL_3';
      else if (updatedDemerit >= 30) updatedWarn = 'LEVEL_2';
      else if (updatedDemerit >= 15) updatedWarn = 'LEVEL_1';
      return { ...m, meritPoints: updatedMerit, demeritPoints: updatedDemerit, rank: updatedRank, warningLevel: updatedWarn };
    }));
    showToast(
      data.type === 'MERIT'
        ? `Thưởng +${data.points} Merit cho ${target.name}`
        : `Phạt -${data.points} Demerit đối với ${target.name}`
    );
  };

  const handleCreateTask = (task: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => {
    const now = new Date().toISOString();
    const newTask: TaskItem = {
      ...task,
      id: generateCode('TASK'),
      createdAt: now,
      updatedAt: now,
      version: 0,
    };
    // Optimistic local update + sync to Supabase
    setTasks((current) => [newTask, ...current]);
    void upsertTask(newTask);
    showToast(`Đã tạo task [${task.title}]`);
    addNotification('Task mới được tạo', task.title);
  };

  const handleMoveTask = (taskId: string, status: TaskStatus) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    const now = new Date().toISOString();
    const updatedTask: TaskItem = {
      ...task,
      status,
      updatedAt: now,
      version: (task.version ?? 0) + 1,
    };
    // Optimistic update
    setTasks((current) => current.map((item) => item.id === taskId ? updatedTask : item));
    void upsertTask(updatedTask);
    if (status === 'DONE' && task.status !== 'DONE' && task.assigneeId) {
      const completedEarly = !task.dueDate || Date.now() <= new Date(task.dueDate).getTime();
      const earnedPoints = task.pointsReward + (completedEarly ? 15 : 0);
      setMembers((current) => current.map((member) => member.id === task.assigneeId ? { ...member, meritPoints: member.meritPoints + earnedPoints } : member));
      addNotification('Task hoàn thành', `${task.title} · +${earnedPoints} Merit`);
      showToast(`Hoàn thành task +${earnedPoints} Merit`);
    }
  };

  const handleCreateSchedule = (schedule: Omit<ScheduleItem, 'id' | 'updatedAt' | 'version'>): string | undefined => {
    const hasConflict = schedules.some((current) => (
      current.userId === schedule.userId
      && current.status === 'CONFIRMED'
      && new Date(schedule.startAt).getTime() < new Date(current.endAt).getTime()
      && new Date(schedule.endAt).getTime() > new Date(schedule.startAt).getTime()
    ));
    if (hasConflict) return 'Lịch vừa chọn bị trùng với một lịch đã xác nhận.';
    const now = new Date().toISOString();
    const newSchedule: ScheduleItem = {
      ...schedule,
      id: generateCode('SCHED'),
      updatedAt: now,
      version: 0,
    };
    setSchedules((current) => [newSchedule, ...current]);
    void upsertSchedule(newSchedule);
    showToast(`Đã xác nhận lịch [${schedule.title}]`);
    addNotification('Lịch mới được xác nhận', `${schedule.title} · ${schedule.userName}`);
    return undefined;
  };

  const isEvent = mode === 'EVENT';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className="app-shell min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Header
        mode={mode}
        eventPhase={eventPhase}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onToggleMode={handleToggleMode}
        onEventPhaseChange={setEventPhase}
        onOpenRedCode={() => setIsRedCodeOpen(true)}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onOpenWorkspace={() => setIsGoogleWorkspaceOpen(true)}
        onOpenSettings={() => setIsAccountSettingsOpen(true)}
        notifications={notifications}
        onMarkNotificationRead={(id) => setNotifications((current) => current.map((notification) => notification.id === id ? { ...notification, read: true } : notification))}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        activeMember={activeMember}
        members={members}
        onSelectActiveMember={setActiveMemberId}
        activeLoanCount={loans.filter((l) => l.status === 'ACTIVE').length}
        unresolvedIncidentCount={incidents.filter((i) => i.status !== 'RESOLVED').length}
      />

      {/* Event Mode Banner - Clinical High Contrast */}
      {isEvent && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 transition-colors">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider text-[11px]">
              EVENT MODE LIVE · {eventPhase}
            </span>
            <span className="text-rose-400 dark:text-rose-600">|</span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono hidden sm:inline">
              Toàn bộ 11 Tiểu ban ra mặt đất · Kênh đàm 1 (Chỉ huy) & Kênh 2 (Kỹ thuật) sẵn sàng
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {activeTab === 'DASHBOARD' && (
          <DashboardTab
            mode={mode}
            eventPhase={eventPhase}
            assets={assets}
            loans={loans}
            members={members}
            rosters={rosters}
            incidents={incidents}
            meritLogs={meritLogs}
            activeMember={activeMember}
            tasks={tasks}
            onOpenNewLoan={() => { setPreselectedAssetForLoan(null); setIsLoanModalOpen(true); }}
            onOpenNewIncident={() => setIsIncidentModalOpen(true)}
            onOpenMeritRecord={() => { setPreselectedMemberForMerit(undefined); setIsMeritRecordOpen(true); }}
            onSelectAsset={(asset) => { setSelectedAssetForQr(asset); setIsQrAssetModalOpen(true); }}
            onSwitchTab={(tab) => setActiveTab(tab as TabKey)}
          />
        )}

        {activeTab === 'ASSETS' && (
          <AssetInventoryTab
            assets={assets}
            consumables={consumables}
            onSelectAsset={(asset) => { setSelectedAssetForQr(asset); setIsQrAssetModalOpen(true); }}
            onToggleSeal={handleToggleSeal}
            onAddNewAsset={handleAddNewAsset}
            onEditAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
            onRestockConsumable={handleRestockConsumable}
            onUseConsumable={handleUseConsumable}
            onAddNewConsumable={handleAddNewConsumable}
            onOpenLoanForAsset={(asset) => { setPreselectedAssetForLoan(asset); setIsLoanModalOpen(true); }}
          />
        )}

        {activeTab === 'LOANS' && (
          <LoanFormsTab
            loans={loans}
            incidents={incidents}
            activeMember={activeMember}
            onOpenNewLoan={() => { setPreselectedAssetForLoan(null); setIsLoanModalOpen(true); }}
            onOpenNewIncident={() => setIsIncidentModalOpen(true)}
            onReturnLoan={handleReturnLoan}
            onEditLoan={handleEditLoan}
            onDeleteLoan={handleDeleteLoan}
            onToggleIncidentStatus={handleToggleIncidentStatus}
            onDeleteIncident={handleDeleteIncident}
          />
        )}

        {activeTab === 'ROSTER' && (
          <ShiftRosterTab
            shifts={rosters}
            members={members}
            onToggle5SItem={handleToggle5SItem}
            onCompleteShift={handleCompleteShift}
            onAddNewShift={handleAddNewShift}
            onDeleteShift={handleDeleteShift}
          />
        )}

        {activeTab === 'TASKS' && (
          <TaskScheduleTab
            tasks={tasks}
            schedules={schedules}
            members={members}
            onCreateTask={handleCreateTask}
            onMoveTask={handleMoveTask}
            onCreateSchedule={handleCreateSchedule}
          />
        )}

        {activeTab === 'GAMIFICATION' && (
          <GamificationHrTab
            members={members}
            meritLogs={meritLogs}
            onOpenMeritRecord={(memberId) => { setPreselectedMemberForMerit(memberId); setIsMeritRecordOpen(true); }}
            onAddNewMember={handleAddNewMember}
            onEditMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
          />
        )}

        {activeTab === 'EVENT' && (
          <EventArenaTab
            eventPhase={eventPhase}
            onSetEventPhase={setEventPhase}
            onOpenRedCode={() => setIsRedCodeOpen(true)}
          />
        )}

        {activeTab === 'CODEX' && <CodexWikiTab />}
      </main>

      {/* Footer status rail */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060913]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 select-none">
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400">SYSTEM READY</span>
            </span>
            <span className="hidden sm:inline">11 Tiểu Ban · 5 Nhánh Chuyên Môn</span>
            <span className="hidden md:inline">{assets.length} Thiết bị kho</span>
            <span className="hidden md:inline">{loans.filter((l) => l.status === 'ACTIVE').length} Phiếu mượn mở</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-700 dark:text-slate-300">
            {/* Sync status indicator */}
            <SyncStatusBadge status={combinedSyncStatus} pendingCount={combinedPendingCount} />
            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
            <Logo size={12} variant="mark" />
            <span className="hidden sm:inline font-mono">STEM.Lab OS · Minimal Studio</span>
          </div>
        </div>
      </footer>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-3.5 py-2 rounded-md shadow-lg text-xs font-medium flex items-center gap-2 border border-slate-700 animate-slide-up max-w-[90vw]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-soft shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <RedCodeModal
        isOpen={isRedCodeOpen}
        onClose={() => setIsRedCodeOpen(false)}
        onSubmitIncident={handleTriggerRedCode as any}
      />

      <QrAssetModal
        isOpen={isQrAssetModalOpen}
        onClose={() => setIsQrAssetModalOpen(false)}
        asset={selectedAssetForQr}
        onToggleSeal={handleToggleSeal}
        onOpenLoanForAsset={(asset) => { setPreselectedAssetForLoan(asset); setIsLoanModalOpen(true); }}
      />

      <Suspense fallback={null}>
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          onDetected={handleQrDetected}
        />
      </Suspense>

      <Form01LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        assets={assets}
        activeMember={activeMember}
        selectedAsset={preselectedAssetForLoan}
        onCreateLoan={handleCreateLoanTicket}
      />

      <Form02IncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        activeMember={activeMember}
        allMembers={members}
        onSubmitIncident={handleCreateIncident}
      />

      <MeritRecordModal
        isOpen={isMeritRecordOpen}
        onClose={() => { setIsMeritRecordOpen(false); setPreselectedMemberForMerit(undefined); }}
        members={members}
        activeMember={activeMember}
        preselectedMemberId={preselectedMemberForMerit}
        onRecordPoints={handleRecordPoints}
      />

      <GoogleWorkspaceModal
        isOpen={isGoogleWorkspaceOpen}
        onClose={() => setIsGoogleWorkspaceOpen(false)}
      />

      <AccountSettingsModal
        isOpen={isAccountSettingsOpen}
        onClose={() => setIsAccountSettingsOpen(false)}
        member={activeMember}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
        onUpdateMember={handleUpdateMember}
      />

      <OnboardingOverlay
        isOpen={!onboardingDone && Boolean(activeMember)}
        onClose={() => setOnboardingDone(true)}
        onOpenScanner={() => setIsQrScannerOpen(true)}
        onOpenTasks={() => setActiveTab('TASKS')}
      />
    </div>
  );
}