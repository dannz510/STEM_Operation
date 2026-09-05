import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Edit2,
  Trash2,
  ArrowUpDown,
  RotateCcw,
  ShieldAlert,
  Clock,
  Check,
} from 'lucide-react';
import { LoanTicket, IncidentReport, Member, RankLevel } from '../../types';
import { LoanEditModal } from '../LoanEditModal';

interface LoanFormsTabProps {
  loans: LoanTicket[];
  incidents: IncidentReport[];
  activeMember?: Member;
  onOpenNewLoan: () => void;
  onOpenNewIncident: () => void;
  onReturnLoan: (ticketId: string, conditionOnReturn: string) => void;
  onEditLoan: (updatedLoan: LoanTicket) => void;
  onDeleteLoan: (loanId: string) => void;
  onToggleIncidentStatus: (incidentId: string) => void;
  onDeleteIncident: (incidentId: string) => void;
}

type LoanSortField = 'loanTime' | 'borrowerName' | 'assetName' | 'status';
type SortOrder = 'asc' | 'desc';

export const LoanFormsTab: React.FC<LoanFormsTabProps> = ({
  loans,
  incidents,
  activeMember,
  onOpenNewLoan,
  onOpenNewIncident,
  onReturnLoan,
  onEditLoan,
  onDeleteLoan,
  onToggleIncidentStatus,
  onDeleteIncident,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'FORM01' | 'FORM02' | 'FORM03'>('FORM01');

  // Search & Filter for Loans
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'RETURNED'>('ALL');
  const [sortField, setSortField] = useState<LoanSortField>('loanTime');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Return Loan State Modal / Inline
  const [returningLoan, setReturningLoan] = useState<LoanTicket | null>(null);
  const [returnCondition, setReturnCondition] = useState('Thiết bị hoạt động tốt 100%, nguyên tem niêm phong.');

  // Edit Loan State
  const [editingLoan, setEditingLoan] = useState<LoanTicket | null>(null);

  // Form 03 Rank-up petition form state
  const [targetRank, setTargetRank] = useState<RankLevel>('OPERATOR');
  const [petitionNotes, setPetitionNotes] = useState('');
  const [petitionSubmitted, setPetitionSubmitted] = useState(false);

  // Filtered & Sorted Loans
  const filteredLoans = useMemo(() => {
    return loans
      .filter((l) => {
        const matchesSearch =
          l.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.borrowerUnit.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'loanTime') {
          comp = a.loanTime.localeCompare(b.loanTime);
        } else if (sortField === 'borrowerName') {
          comp = a.borrowerName.localeCompare(b.borrowerName, 'vi');
        } else if (sortField === 'assetName') {
          comp = a.assetName.localeCompare(b.assetName, 'vi');
        } else if (sortField === 'status') {
          comp = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [loans, searchTerm, statusFilter, sortField, sortOrder]);

  const handleSort = (field: LoanSortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningLoan) return;

    onReturnLoan(returningLoan.id, returnCondition);
    setReturningLoan(null);
  };

  const handleRankUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPetitionSubmitted(true);
    setTimeout(() => {
      setPetitionSubmitted(false);
      setPetitionNotes('');
    }, 2500);
  };

  const formatVnd = (amount?: number) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tab Navigation: Studio Minimum */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('FORM01')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'FORM01'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <FileText size={13} className="text-sky-600 dark:text-sky-400" />
            <span>Form 01: Sổ Mượn Trả ({loans.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('FORM02')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'FORM02'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <AlertTriangle size={13} className="text-amber-600 dark:text-amber-400" />
            <span>Form 02: Sự Cố ({incidents.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('FORM03')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'FORM03'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <TrendingUp size={13} className="text-emerald-600 dark:text-emerald-400" />
            <span>Form 03: Đơn Thăng Cấp</span>
          </button>
        </div>

        {activeSubTab === 'FORM01' && (
          <button
            onClick={onOpenNewLoan}
            id="loan-open-new-btn"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus size={13} />
            <span>+ Lập Hợp Đồng Form 01</span>
          </button>
        )}

        {activeSubTab === 'FORM02' && (
          <button
            onClick={onOpenNewIncident}
            id="incident-open-new-btn"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus size={13} />
            <span>+ Lập Biên Bản Form 02</span>
          </button>
        )}
      </div>

      {/* FORM 01 - LOAN TICKETS MANAGEMENT */}
      {activeSubTab === 'FORM01' && (
        <div className="space-y-3">
          {/* Search, Filter & Metrics Bar */}
          <div className="bento-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phiếu, người mượn, tên thiết bị, đơn vị..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono outline-none"
              >
                <option value="ALL">Tất Cả Trạng Thái</option>
                <option value="ACTIVE">Đang Mượn Ngoài Lab</option>
                <option value="RETURNED">Đã Hoàn Trả & Nghiệm Thu</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
            <span>
              Danh sách: <strong className="text-slate-900 dark:text-white">{filteredLoans.length}</strong> / {loans.length} phiếu
            </span>
            <span>
              Đang lưu hành: <strong className="text-amber-600 dark:text-amber-400">{loans.filter((l) => l.status === 'ACTIVE').length}</strong> thiết bị
            </span>
          </div>

          {/* Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('loanTime')}>
                      <div className="flex items-center gap-1">
                        <span>Mã Phiếu & Ngày Mượn</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('borrowerName')}>
                      <div className="flex items-center gap-1">
                        <span>Người Mượn & Đơn Vị</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('assetName')}>
                      <div className="flex items-center gap-1">
                        <span>Thiết Bị Mượn</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Hạn Trả Dự Kiến</th>
                    <th className="p-3">Tiền Cọc</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        <span>Trạng Thái</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">CCTV Đối Soát</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                        Không tìm thấy phiếu mượn nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <strong className="text-sky-700 dark:text-sky-400 font-mono font-bold block">{loan.ticketCode}</strong>
                          <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {loan.loanTime}
                          </span>
                        </td>

                        <td className="p-3">
                          <strong className="text-slate-900 dark:text-white block font-semibold">{loan.borrowerName}</strong>
                          <span className="text-[11px] text-slate-500">
                            {loan.borrowerUnit} • {loan.borrowerPhone}
                          </span>
                        </td>

                        <td className="p-3">
                          <strong className="text-slate-900 dark:text-white block font-semibold">{loan.assetName}</strong>
                          <span className="font-mono text-[10px] text-slate-500">{loan.assetCode}</span>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {loan.expectedReturnTime}
                        </td>

                        <td className="p-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {formatVnd(loan.depositVnd)}
                        </td>

                        <td className="p-3">
                          {loan.status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 border border-amber-200 dark:border-amber-800/60 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Đang Mượn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Đã Hoàn Trả
                            </span>
                          )}
                        </td>

                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                            {loan.threeLayerVerification.cctvTimestamp}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {loan.status === 'ACTIVE' && (
                              <button
                                onClick={() => {
                                  setReturningLoan(loan);
                                  setReturnCondition('Thiết bị hoạt động tốt 100%, nguyên tem niêm phong.');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono font-semibold transition-colors flex items-center gap-1"
                                title="Nghiệm thu hoàn trả và phục hồi trạng thái thiết bị"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Trả Máy</span>
                              </button>
                            )}

                            <button
                              onClick={() => setEditingLoan(loan)}
                              className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                              title="Sửa thông tin phiếu"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa phiếu mượn [${loan.ticketCode}]?`)) {
                                  onDeleteLoan(loan.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Xóa phiếu mượn"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM 02 - INCIDENTS MANAGEMENT */}
      {activeSubTab === 'FORM02' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bento-card p-3 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cấp 1 (&lt; 200k)</span>
              <div className="font-bold text-slate-900 dark:text-white text-sm font-mono">Trừ 10 Merit</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Tự bồi hoàn vật tư, khắc phục trong 24h.</p>
            </div>
            <div className="bento-card p-3 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cấp 2 (200k - 1tr)</span>
              <div className="font-bold text-amber-600 dark:text-amber-400 text-sm font-mono">Trừ 20 Merit</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Đình chỉ mượn 7 ngày; Trưởng ca giám sát.</p>
            </div>
            <div className="bento-card p-3 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cấp 3 (1tr - 5tr)</span>
              <div className="font-bold text-rose-600 dark:text-rose-400 text-sm font-mono">Trừ 50 Merit</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Hội đồng kỷ luật; Bồi hoàn 50-100% khấu hao.</p>
            </div>
            <div className="bento-card p-3 text-xs space-y-1">
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider">Cấp 4 (&gt; 5tr / Red Code)</span>
              <div className="font-bold text-rose-700 dark:text-rose-500 text-sm font-mono">Tước Thẻ Lab</div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Trách nhiệm pháp lý & bồi thường toàn diện.</p>
            </div>
          </div>

          {/* Incident Reports Table */}
          <div className="bento-card overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h4 className="font-mono font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Danh Sách Biên Bản Giám Định Sự Cố Form 02 ({incidents.length})</span>
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-3">Mã & Ngày Ghi Nhận</th>
                    <th className="p-3">Tiêu Đề & Sự Cố</th>
                    <th className="p-3">Mức Độ</th>
                    <th className="p-3">Người Báo Cáo</th>
                    <th className="p-3">Biện Pháp Xử Lý Ngay</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {incidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                        Hiện tại không có sự cố kỹ thuật nào được ghi nhận.
                      </td>
                    </tr>
                  ) : (
                    incidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <strong className="text-rose-700 dark:text-rose-400 font-mono font-bold block">{inc.code}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{inc.timestamp}</span>
                        </td>

                        <td className="p-3 max-w-xs">
                          <strong className="text-slate-900 dark:text-white block font-semibold">{inc.title}</strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{inc.description}</span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                              inc.severity === 'RED_CODE'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                                : inc.severity === 'LEVEL_3'
                                ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="text-slate-900 dark:text-white font-medium block">{inc.reporterName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{inc.reporterPhone}</span>
                        </td>

                        <td className="p-3 max-w-xs text-[11px] text-slate-600 dark:text-slate-400">
                          {inc.immediateAction}
                        </td>

                        <td className="p-3">
                          {inc.status === 'RESOLVED' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800 font-mono">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Đã Xử Lý Xong
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 border border-amber-200 dark:border-amber-800 font-mono">
                              Đang Khắc Phục
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onToggleIncidentStatus(inc.id)}
                              className={`px-2 py-1 text-[10px] font-mono font-semibold transition-colors ${
                                inc.status === 'RESOLVED'
                                  ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {inc.status === 'RESOLVED' ? 'Mở Lại' : 'Đóng Sự Cố'}
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa biên bản sự cố [${inc.code}]?`)) {
                                  onDeleteIncident(inc.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Xóa biên bản sự cố"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FORM 03 - RANK UP PETITION */}
      {activeSubTab === 'FORM03' && (
        <div className="max-w-2xl mx-auto bento-card p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Form 03: Đơn Đề Xuất Xét Duyệt Thăng Cấp Bậc Tác Chiến
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gửi trực tiếp lên Hội Đồng Ban Chủ Nhiệm và Tổng Chỉ Huy xem xét thăng hạng dựa trên điểm Merit tích lũy.
            </p>
          </div>

          {petitionSubmitted ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                Đã gửi Đơn Đề Xuất Thăng Cấp lên Hội Đồng Ban Chủ Nhiệm thành công! Hệ thống sẽ thông báo kết quả sau phiên họp tuần.
              </span>
            </div>
          ) : (
            <form onSubmit={handleRankUpSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Nhân Sự Đề Xuất</label>
                  <input
                    type="text"
                    disabled
                    value={`${activeMember?.name || 'System'} (${activeMember?.code || 'SYSTEM'})`}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Cấp Bậc Hiện Tại</label>
                  <input
                    type="text"
                    disabled
                    value={activeMember?.rank || 'CADET'}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Cấp Bậc Xin Thăng Hạng</label>
                <select
                  value={targetRank}
                  onChange={(e) => setTargetRank(e.target.value as RankLevel)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-xs outline-none focus:border-sky-500 font-mono"
                >
                  <option value="OPERATOR">OPERATOR (Yêu cầu &gt;= 100 Merit)</option>
                  <option value="LEAD">LEAD (Yêu cầu &gt;= 200 Merit & 20 ca trực)</option>
                  <option value="CHIEF">CHIEF (Yêu cầu &gt;= 300 Merit & phê chuẩn)</option>
                  <option value="GRANDMASTER">GRANDMASTER (Huyền thoại)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
                  Thành Tích & Minh Chứng Tác Chiến Cụ Thể
                </label>
                <textarea
                  rows={4}
                  required
                  value={petitionNotes}
                  onChange={(e) => setPetitionNotes(e.target.value)}
                  placeholder="Liệt kê các ca trực 5S xuất sắc, sự kiện D-Day đã tham gia điều phối, sáng kiến kỹ thuật..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Nộp Đơn Đề Xuất</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Return Loan Dialog Modal */}
      {returningLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bento-card w-full max-w-md border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nghiệm Thu Hoàn Trả Thiết Bị
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  [{returningLoan.ticketCode}] {returningLoan.assetName}
                </span>
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
                  Tình Trạng Thiết Bị Khi Hoàn Trả
                </label>
                <textarea
                  rows={3}
                  required
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 font-mono">
                Khi xác nhận, thiết bị sẽ tự động chuyển về trạng thái <strong>SẴN SÀNG (AVAILABLE)</strong>, khôi phục tem niêm phong và ghi sổ hoàn cọc cho người mượn.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningLoan(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  Xác Nhận Nghiệm Thu & Nhận Lại Máy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Loan Modal */}
      <LoanEditModal
        isOpen={!!editingLoan}
        onClose={() => setEditingLoan(null)}
        loan={editingLoan}
        onSave={onEditLoan}
      />
    </div>
  );
};
