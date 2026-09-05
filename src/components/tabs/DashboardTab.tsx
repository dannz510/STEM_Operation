import React, { useState } from 'react';
import {
  Activity,
  Box,
  Layers,
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  FileText,
  Award,
  Zap,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import {
  OperatingMode,
  EventPhase,
  Asset,
  LoanTicket,
  Member,
  ShiftRoster,
  IncidentReport,
  MeritDemeritLog,
  TaskItem,
  SubBranchInfo,
} from '../../types';
import { SUB_BRANCHES } from '../../data/initialData';
import { SubBranchDrawer } from '../SubBranchDrawer';

interface DashboardTabProps {
  mode: OperatingMode;
  eventPhase: EventPhase;
  assets: Asset[];
  loans: LoanTicket[];
  members: Member[];
  rosters: ShiftRoster[];
  incidents: IncidentReport[];
  meritLogs: MeritDemeritLog[];
  activeMember?: Member;
  tasks: TaskItem[];
  onOpenNewLoan: () => void;
  onOpenNewIncident: () => void;
  onOpenMeritRecord: () => void;
  onSelectAsset: (asset: Asset) => void;
  onSwitchTab: (tabId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  mode,
  eventPhase,
  assets,
  loans,
  members,
  rosters,
  incidents,
  meritLogs,
  activeMember,
  tasks,
  onOpenNewLoan,
  onOpenNewIncident,
  onOpenMeritRecord,
  onSelectAsset,
  onSwitchTab,
}) => {
  const [selectedSubBranch, setSelectedSubBranch] = useState<SubBranchInfo | null>(null);

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const activeShift = rosters.find((roster) => !roster.isCompleted) ?? rosters[0];
  const openIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  const fiveSChecks = activeShift
    ? [
        activeShift.handover5S.sortDone,
        activeShift.handover5S.setInOrderDone,
        activeShift.handover5S.shineDone,
        activeShift.handover5S.standardizeDone,
        activeShift.handover5S.sustainDone,
      ]
    : [false, false, false, false, false];
  const completedFiveSChecks = fiveSChecks.filter(Boolean).length;

  const totalAssetValue = assets.reduce((sum, a) => sum + a.valueVnd, 0);
  const availableAssetCount = assets.filter((a) => a.status === 'AVAILABLE').length;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const isEvent = mode === 'EVENT';

  return (
    <div className="space-y-4">
      {/* 1. TOP COMMAND CONTROL BANNER - DUAL-MODE HIGH DENSITY */}
      <div
        className={`bento-card p-4 transition-all ${
          !isEvent
            ? 'bg-white dark:bg-slate-900/90'
            : 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-9 h-9 flex items-center justify-center shrink-0 border ${
                !isEvent
                  ? 'border-sky-200 dark:border-sky-800/80 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400'
                  : 'border-rose-500 bg-rose-600 text-white animate-pulse'
              }`}
            >
              {!isEvent ? <SlidersHorizontal size={18} /> : <Radio size={18} />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`signal-pill ${!isEvent ? 'signal-sync' : 'signal-critical'}`}>
                  {!isEvent ? 'DUAL-MODE: NORMAL (IN-LAB OPS)' : `DUAL-MODE: EVENT LIVE [${eventPhase}]`}
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                  CHÂU THÀNH STEM LAB · 11 TIỂU BAN
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                {!isEvent
                  ? 'Ban Quản Lý Tiền Cần & Vận Hành Sự Kiện · Châu Thành STEM'
                  : 'Ban Chỉ Huy Mặt Đất D-Day: Điều Phối Sự Kiện & Cứu Hộ Kỹ Thuật'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {!isEvent
                  ? 'Quản trị kỷ luật Lab, duy trì 5S, kiểm soát 100% xuất-nhập tài sản và phân bổ nguồn lực'
                  : 'Kênh đàm 1 (Chỉ huy) & Kênh 2 (Kỹ thuật) đang mở · Toàn bộ 11 tiểu ban ra mặt đất'}
              </p>
            </div>
          </div>

          {/* Quick Command Action Launchers */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onOpenNewLoan}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Lập biên bản bàn giao Form 01"
            >
              <Plus size={13} />
              <span>Bàn Giao (Form 01)</span>
            </button>

            <button
              onClick={onOpenNewIncident}
              className="px-3 py-1.5 border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Ghi nhận sự cố kỹ thuật Form 02"
            >
              <AlertTriangle size={13} />
              <span>Sự Cố (Form 02)</span>
            </button>

            <button
              onClick={onOpenMeritRecord}
              className="px-3 py-1.5 border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              title="Ghi nhận điểm Merit / Demerit"
            >
              <Award size={13} />
              <span>Ghi Điểm</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. FOUR GOLDEN KPI METRIC CARDS (HIGH DENSITY BENTO) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Assets */}
        <div className="bento-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Tổng Thiết Bị (AST)</span>
            <Box size={14} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{assets.length}</span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {availableAssetCount} Sẵn sàng
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Định giá kho:</span>
            <strong className="text-slate-800 dark:text-slate-200">{formatVnd(totalAssetValue)}</strong>
          </div>
        </div>

        {/* Card 2: Open Loans */}
        <div className="bento-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Phiếu Mượn (Form 01)</span>
            <FileText size={14} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{activeLoans.length}</span>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
              Ký Số 3 Lớp
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Đối soát CCTV:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">100% Khớp</strong>
          </div>
        </div>

        {/* Card 3: Personnel */}
        <div className="bento-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Nhân Sự Tác Chiến</span>
            <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{members.length}</span>
            <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold">
              4 Cấp Bậc
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Tổ chức:</span>
            <strong className="text-slate-800 dark:text-slate-200">11 Tiểu Ban · 5 Nhánh</strong>
          </div>
        </div>

        {/* Card 4: Safety & Fire Status */}
        <div className="bento-card p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider">An Toàn & PCCC (SAF)</span>
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                openIncidents.length === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {openIncidents.length === 0 ? 'LEVEL 0' : `LEVEL ${openIncidents.length}`}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {openIncidents.length === 0 ? 'AN TOÀN' : `${openIncidents.length} Cần xử lý`}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
            <span>Tủ sạc pin LiPo:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">Cách ly an toàn</strong>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE ROW: 5S COMPLIANCE + 11 SUB-BRANCH MATRIX (BENTO DRILL-DOWN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left Column: Active Shift & 5S Handover Status */}
        <div className="bento-card p-4 flex flex-col justify-between gap-3 border-l-2 border-l-sky-600 dark:border-l-sky-400">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Ca Trực 1+1 (No-Chief Protocol)
                </h3>
              </div>
              {activeShift ? (
                <span className="signal-pill signal-ready">
                  {activeShift.shiftName || `Ca ${activeShift.shiftNumber ?? '—'}`}
                </span>
              ) : (
                <span className="signal-pill signal-neutral">CHƯA THIẾT LẬP</span>
              )}
            </div>

            {activeShift ? (
              <div className="space-y-1.5 text-xs">
                <div className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[9px] font-mono uppercase font-bold block">
                      OPERATOR (TRƯỞNG CA)
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeShift.operatorName || 'Chưa phân công'}
                    </strong>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    PROXY LEAD
                  </span>
                </div>

                <div className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[9px] font-mono uppercase font-bold block">
                      CADET (PHỤ TÁ 5S)
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white">
                      {activeShift.cadetName || 'Chưa phân công'}
                    </strong>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    TẬP SỰ
                  </span>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Chưa có ca trực đang hoạt động.
              </div>
            )}

            {/* 5S Handover Visual Gauge Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-1.5">
                <span>Tiêu Chuẩn 5S Handover</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{completedFiveSChecks}/5 PASS</span>
              </div>

              {/* Progress visual bar segments */}
              <div className="grid grid-cols-5 gap-1 mb-2">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all ${
                      fiveSChecks[idx]
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <div className="space-y-1 text-[10px] font-mono">
                {[
                  ['S1: Seiri (Sàng lọc rác in/phần thừa)', fiveSChecks[0]],
                  ['S2: Seiton (Sắp xếp khay Shadow Board)', fiveSChecks[1]],
                  ['S3: Seiso (Lau kính hiển vi/cồn 90°)', fiveSChecks[2]],
                  ['S4: Seiketsu (Cân bàn nhiệt máy in 3D)', fiveSChecks[3]],
                  ['S5: Shitsuke (Ký số Form & Bàn giao)', fiveSChecks[4]],
                ].map(([label, complete]) => (
                  <div className="flex justify-between" key={label as string}>
                    <span className="text-slate-500 dark:text-slate-400">{label as string}</span>
                    <span className={complete ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400'}>
                      {complete ? 'PASS ●' : 'PENDING ○'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSwitchTab('ROSTER')}
            className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 mt-1"
          >
            <span>Mở Bảng Kiểm 5S Toàn Diện</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Right 2 Columns: 11 Sub-Branches Bento Matrix Cards */}
        <div className="lg:col-span-2 bento-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Ma Trận Tác Chiến 11 Tiểu Ban (Nhấp Để Xem Cấu Hình)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                11 SUB-BRANCH MATRIX
              </span>
            </div>

            {/* Matrix Grid: High-density bento cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
              {SUB_BRANCHES.map((b) => {
                const subBranchMembers = members.filter((m) => m.subBranchCode === b.code);
                return (
                  <div
                    key={b.code}
                    onClick={() => setSelectedSubBranch(b)}
                    className="bento-matrix-card group"
                    title="Nhấp để mở bảng điều khiển chi tiết"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400 text-xs">
                        {b.code}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60">
                        {b.targetGenderRatio.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {b.name}
                    </h4>

                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                      {!isEvent ? b.normalMission : b.eventMission}
                    </p>

                    {/* Progress indicator metric */}
                    <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500">
                      <span>{subBranchMembers.length} Nhân sự</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        Sẵn sàng <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>NHÁNH CHỦ LỰC: OPS-1.1 · AST-2.1 · PWR-3.1 · LAY-4.1 · STG-5.1</span>
            <button
              onClick={() => onSwitchTab('CODEX')}
              className="text-sky-600 dark:text-sky-400 font-bold hover:underline"
            >
              Điều Lệ Vận Hành (Codex) →
            </button>
          </div>
        </div>
      </div>

      {/* 4. LOWER ROW: ACTIVE LOANS BENTO TABLE & RECENT MERIT DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: Active Loan Tickets (Form 01) */}
        <div className="lg:col-span-2 bento-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <FileText size={14} className="text-sky-600 dark:text-sky-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Phiếu Mượn Mở (Form 01 - Minh Chứng 3 Lớp)
                </h3>
              </div>
              <button
                onClick={() => onSwitchTab('LOANS')}
                className="text-[10px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400 hover:underline"
              >
                Quản lý phiếu ({loans.length}) →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                    <th className="p-2">Mã Phiếu</th>
                    <th className="p-2">Thiết Bị</th>
                    <th className="p-2">Người Mượn & Đơn Vị</th>
                    <th className="p-2">Hạn Trả</th>
                    <th className="p-2">Cán Bộ Ký</th>
                    <th className="p-2 text-right">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="font-mono divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeLoans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400 text-xs font-mono">
                        Toàn bộ thiết bị đang lưu tại kho an toàn. Không có phiếu mượn mở.
                      </td>
                    </tr>
                  ) : (
                    activeLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-2 font-bold text-sky-600 dark:text-sky-400">{l.ticketCode}</td>
                        <td className="p-2 font-sans font-medium text-slate-900 dark:text-white">{l.assetName}</td>
                        <td className="p-2 font-sans text-slate-700 dark:text-slate-300">
                          {l.borrowerName} <span className="text-slate-400 text-[10px]">({l.borrowerUnit})</span>
                        </td>
                        <td className="p-2 text-slate-500 dark:text-slate-400">{l.expectedReturnTime}</td>
                        <td className="p-2 font-sans text-slate-600 dark:text-slate-400">{l.approverName}</td>
                        <td className="p-2 text-right">
                          <span className="signal-pill signal-warn">ON_LOAN</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>XÁC THỰC: Form 01 Số Hóa · Tem Niêm Phong QR · Đối Soát CCTV</span>
            <button
              onClick={onOpenNewLoan}
              className="text-sky-600 dark:text-sky-400 font-bold uppercase hover:underline"
            >
              + Tạo Phiếu Mới
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Merit Matrix & Recent Activity */}
        <div className="bento-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Merit Matrix & Nhật Ký
                </h3>
              </div>
              <button
                onClick={() => onSwitchTab('GAMIFICATION')}
                className="text-[10px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400 hover:underline"
              >
                Vinh danh →
              </button>
            </div>

            <div className="space-y-2">
              {meritLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-2 border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {log.memberName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {log.ruleCode} · {log.reason}
                    </div>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold shrink-0 ${
                      log.type === 'MERIT'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {log.type === 'MERIT' ? `+${log.points}` : `-${log.points}`}
                  </span>
                </div>
              ))}
              {meritLogs.length === 0 && (
                <p className="p-4 text-center text-slate-400 font-mono text-xs">
                  Chưa có lịch sử điểm.
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
            <span>SÀN RANK: OP 100 · LD 300</span>
            <button
              onClick={onOpenMeritRecord}
              className="text-emerald-600 dark:text-emerald-400 font-bold uppercase hover:underline"
            >
              + Ghi Điểm
            </button>
          </div>
        </div>
      </div>

      {/* 5. Sub-Branch Drill-Down Drawer */}
      <SubBranchDrawer
        subBranch={selectedSubBranch}
        mode={mode}
        members={members}
        onClose={() => setSelectedSubBranch(null)}
        onNavigateTab={(tab) => onSwitchTab(tab)}
      />
    </div>
  );
};

export default DashboardTab;
