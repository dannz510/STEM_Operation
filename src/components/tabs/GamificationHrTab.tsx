import React, { useState, useMemo } from 'react';
import {
  Medal,
  Users,
  SlidersHorizontal,
  Search,
  Plus,
  ShieldAlert,
  Edit2,
  Trash2,
  ArrowUpDown,
  Award,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Member, MeritDemeritLog, RankLevel, SubBranchCode } from '../../types';
import { SUB_BRANCHES } from '../../data/initialData';
import { MemberEditModal } from '../MemberEditModal';
import { RankGlyph } from '../brand/UIAssets';

interface GamificationHrTabProps {
  members: Member[];
  meritLogs: MeritDemeritLog[];
  onOpenMeritRecord: (preselectedMemberId?: string) => void;
  onAddNewMember: (newMember: Omit<Member, 'id'>) => void;
  onEditMember: (updatedMember: Member) => void;
  onDeleteMember: (memberId: string) => void;
}

type SortField = 'netPoints' | 'name' | 'studentId' | 'rank';
type SortOrder = 'asc' | 'desc';

export const GamificationHrTab: React.FC<GamificationHrTabProps> = ({
  members,
  meritLogs,
  onOpenMeritRecord,
  onAddNewMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [activeSubView, setActiveSubView] = useState<'LEADERBOARD' | 'DIRECTORY' | 'GENDER_MATRIX'>('LEADERBOARD');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [rankFilter, setRankFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');

  // Sort
  const [sortField, setSortField] = useState<SortField>('netPoints');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Member Edit / Add Modal state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filtered & Sorted Members
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        const matchesSearch =
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.studentId.includes(searchTerm) ||
          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.subBranchCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBranch = branchFilter === 'ALL' || m.subBranchCode === branchFilter;
        const matchesRank = rankFilter === 'ALL' || m.rank === rankFilter;
        const matchesGender = genderFilter === 'ALL' || m.gender === genderFilter;
        return matchesSearch && matchesBranch && matchesRank && matchesGender;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'netPoints') {
          const netA = a.meritPoints - a.demeritPoints;
          const netB = b.meritPoints - b.demeritPoints;
          comp = netA - netB;
        } else if (sortField === 'name') {
          comp = a.name.localeCompare(b.name, 'vi');
        } else if (sortField === 'studentId') {
          comp = a.studentId.localeCompare(b.studentId);
        } else if (sortField === 'rank') {
          comp = a.rank.localeCompare(b.rank);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [members, searchTerm, branchFilter, rankFilter, genderFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const penalizedMembers = members.filter((m) => m.warningLevel !== 'NONE' || m.demeritPoints > 0);

  const maleCount = members.filter((m) => m.gender === 'MALE').length;
  const femaleCount = members.filter((m) => m.gender === 'FEMALE').length;
  const totalCount = members.length;
  const femaleRatio = totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0;

  // Top 5 Contributors
  const topContributors = useMemo(() => {
    return [...members]
      .sort((a, b) => b.meritPoints - b.demeritPoints - (a.meritPoints - a.demeritPoints))
      .slice(0, 5);
  }, [members]);

  return (
    <div className="space-y-4">
      {/* Sub-view Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveSubView('LEADERBOARD')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubView === 'LEADERBOARD'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Bảng Vàng Tác Chiến & Cảnh Cáo</span>
          </button>
          <button
            onClick={() => setActiveSubView('DIRECTORY')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubView === 'DIRECTORY'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Hồ Sơ Nhân Sự ({members.length})</span>
          </button>
          <button
            onClick={() => setActiveSubView('GENDER_MATRIX')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubView === 'GENDER_MATRIX'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Phân Bổ Giới Tính 11 Tiểu Ban</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            id="hr-add-member-btn"
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhân Sự Mới</span>
          </button>

          <button
            onClick={() => onOpenMeritRecord()}
            id="hr-record-points-btn"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>+ Ghi Nhận Merit / Demerit</span>
          </button>
        </div>
      </div>

      {/* LEADERBOARD VIEW */}
      {activeSubView === 'LEADERBOARD' && (
        <div className="space-y-4">
          {/* 5 Ranks Progression Roadmap */}
          <div className="bento-card p-4 space-y-3">
            <h4 className="font-bold font-mono text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>5 CẤP BẬC TÁC CHIẾN (CHƯƠNG I - HỆ THỐNG TIÊU CHUẨN THĂNG HẠNG)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="p-3.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">CADET</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    &lt; 100 Merit
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">Tập sự viên Lab</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Phụ tá ca trực 1+1, không tự ý ký xuất máy.</p>
              </div>

              <div className="p-3.5 border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-950/30 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold font-mono text-sky-800 dark:text-sky-300">OPERATOR</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 font-semibold">
                    100+ Merit
                  </span>
                </div>
                <div className="text-[11px] text-sky-700 dark:text-sky-400">Kỹ thuật viên ca trực</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Được độc lập vận hành máy FDM, ký Form 01 xuất mượn.</p>
              </div>

              <div className="p-3.5 border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold font-mono text-indigo-800 dark:text-indigo-300">LEAD</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 font-semibold">
                    200+ Merit
                  </span>
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400">Trưởng ca & Điều phối</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Duyệt ca trực, chủ trì khắc phục sự cố Form 02.</p>
              </div>

              <div className="p-3.5 border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold font-mono text-amber-800 dark:text-amber-300">CHIEF</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold">
                    300+ Merit
                  </span>
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400">Tổng chỉ huy Lab</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Quyền kích hoạt Red Code, đại diện ký hợp đồng tài sản.</p>
              </div>

              <div className="p-3.5 border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-bold font-mono text-amber-900 dark:text-amber-200">GRANDMASTER</strong>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-semibold">500+ Merit</span>
                </div>
                <div className="text-[11px] text-amber-800 dark:text-amber-300">Huyền thoại vận hành</div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Mentor toàn Lab, duyệt chiến lược và bảo trợ hệ thống.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top 5 Contributors */}
            <div className="bento-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Top Đóng Góp Tác Chiến (Highest Net Merit)
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Top 5 vinh danh</span>
              </div>

              <div className="space-y-2">
                {topContributors.map((m, idx) => {
                  const netPoints = m.meritPoints - m.demeritPoints;
                  return (
                    <div
                      key={m.id}
                      className="p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 flex items-center justify-center font-bold font-mono text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <RankGlyph rank={m.rank} size={24} />
                            <strong className="text-slate-900 dark:text-white font-semibold text-xs">{m.name}</strong>
                            <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-mono font-bold">
                              {m.rank}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {m.studentId} • Tiểu ban: {m.subBranchCode}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono block">
                          +{netPoints} pts
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          (+{m.meritPoints} / -{m.demeritPoints})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discipline & Warnings Panel */}
            <div className="bento-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Cảnh Cáo Kỷ Luật & Trừ Điểm Demerit
                </h3>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  {penalizedMembers.length} Trường hợp
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {penalizedMembers.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-mono">
                    Không có nhân sự nào đang bị cảnh cáo hoặc có điểm phạt.
                  </div>
                ) : (
                  penalizedMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 dark:text-white font-bold text-xs">{m.name}</strong>
                        <span className="font-mono text-[9px] font-bold text-rose-800 dark:text-rose-300 bg-white dark:bg-slate-900 px-2 py-0.5 border border-rose-300 dark:border-rose-800">
                          {m.warningLevel === 'LEVEL_1'
                            ? 'CẢNH CÁO CẤP 1'
                            : m.warningLevel === 'LEVEL_2'
                            ? 'ĐÌNH CHỈ CẤP 2'
                            : m.warningLevel === 'LEVEL_3'
                            ? 'TƯỚC THẺ ID LAB'
                            : 'CÓ ĐIỂM PHẠT'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono flex items-center justify-between">
                        <span>Tiểu ban: {m.subBranchCode} • MSSV: {m.studentId}</span>
                        <strong className="text-rose-600 dark:text-rose-400 font-bold">-{m.demeritPoints} Demerit</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEMBER DIRECTORY */}
      {activeSubView === 'DIRECTORY' && (
        <div className="space-y-3">
          {/* Search and Filters Bar */}
          <div className="bento-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên, MSSV, mã MBR, tiểu ban chuyên môn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="ALL">Tất Cả Tiểu Ban</option>
                {SUB_BRANCHES.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>

              <select
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono font-semibold"
              >
                <option value="ALL">Tất Cả Cấp Bậc</option>
                <option value="CADET">CADET</option>
                <option value="OPERATOR">OPERATOR</option>
                <option value="LEAD">LEAD</option>
                <option value="CHIEF">CHIEF</option>
                <option value="GRANDMASTER">GRANDMASTER</option>
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="ALL">Tất Cả Giới Tính</option>
                <option value="MALE">Nam (Male)</option>
                <option value="FEMALE">Nữ (Female)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
            <span>
              Hiển thị: <strong className="text-slate-900 dark:text-white">{filteredMembers.length}</strong> / {members.length} nhân sự
            </span>
          </div>

          {/* Members Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Họ Tên & Mã</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('studentId')}>
                      <div className="flex items-center gap-1">
                        <span>MSSV</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Tiểu Ban</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('rank')}>
                      <div className="flex items-center gap-1">
                        <span>Cấp Bậc</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Giới Tính</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('netPoints')}>
                      <div className="flex items-center gap-1">
                        <span>Điểm Tác Chiến (Net)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3">Số Điện Thoại</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 text-xs font-mono">
                        Không tìm thấy nhân sự nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const net = m.meritPoints - m.demeritPoints;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3">
                            <strong className="text-slate-900 dark:text-white block font-semibold">{m.name}</strong>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">{m.code}</span>
                          </td>

                          <td className="p-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {m.studentId}
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                              {m.subBranchCode}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                                m.rank === 'CHIEF' || m.rank === 'GRANDMASTER'
                                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/60'
                                  : m.rank === 'LEAD'
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60'
                                  : m.rank === 'OPERATOR'
                                  ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800/60'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {m.rank}
                            </span>
                          </td>

                          <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400">
                            {m.gender === 'FEMALE' ? (
                              <span className="text-pink-600 dark:text-pink-400 font-medium">Nữ</span>
                            ) : (
                              <span className="text-slate-600 dark:text-slate-400 font-medium">Nam</span>
                            )}
                          </td>

                          <td className="p-3 font-mono">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-xs">
                              +{net} pts
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (+{m.meritPoints} / -{m.demeritPoints})
                            </span>
                          </td>

                          <td className="p-3">
                            {m.status === 'ACTIVE' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Túc Trực
                              </span>
                            ) : m.status === 'EXAM_MODE' || m.status === 'ON_LEAVE' ? (
                              <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700 font-mono">
                                Nghỉ Phép
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-bold text-[10px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 border border-rose-200 dark:border-rose-800/60 font-mono">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Đình Chỉ
                              </span>
                            )}
                          </td>

                          <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            {m.phone}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenMeritRecord(m.id)}
                                className="px-2 py-1 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-[10px] font-mono font-semibold border border-sky-200 dark:border-sky-800/60 transition-colors"
                                title="Thưởng / Phạt điểm cho nhân sự này"
                              >
                                Điểm
                              </button>

                              <button
                                onClick={() => setEditingMember(m)}
                                className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                                title="Sửa hồ sơ nhân sự"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Xác nhận xóa nhân sự [${m.name}] (${m.studentId}) khỏi danh sách?`)) {
                                    onDeleteMember(m.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                title="Xóa nhân sự"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GENDER MATRIX VIEW */}
      {activeSubView === 'GENDER_MATRIX' && (
        <div className="space-y-4">
          <div className="bento-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider">
                Mục Tiêu Cân Bằng Giới Tính (Quy Định CLB STEM Châu Thành)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chính sách ưu tiên tuyển dụng & tạo điều kiện cho Nữ sinh trong các nhánh Kỹ thuật & Công nghệ.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Nam</span>
                <strong className="text-sm font-bold text-slate-900 dark:text-white">{maleCount}</strong>
              </div>
              <div className="text-center">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Nữ</span>
                <strong className="text-sm font-bold text-pink-600 dark:text-pink-400">{femaleCount}</strong>
              </div>
              <div className="text-center pl-3 border-l border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Tỉ Lệ Nữ Hiện Tại</span>
                <strong className="text-sm font-bold text-sky-700 dark:text-sky-400">{femaleRatio}%</strong>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SUB_BRANCHES.map((branch) => {
              const branchMembers = members.filter((m) => m.subBranchCode === branch.code);
              const bMale = branchMembers.filter((m) => m.gender === 'MALE').length;
              const bFemale = branchMembers.filter((m) => m.gender === 'FEMALE').length;
              const bTotal = branchMembers.length;
              const bRatio = bTotal > 0 ? Math.round((bFemale / bTotal) * 100) : 0;

              return (
                <div key={branch.code} className="bento-card p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                      {branch.code}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{bTotal} Nhân sự</span>
                  </div>

                  <h4 className="font-semibold text-slate-900 dark:text-white text-xs">{branch.name}</h4>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 overflow-hidden flex">
                      <div
                        style={{ width: `${100 - bRatio}%` }}
                        className="bg-slate-400 dark:bg-slate-600 h-full"
                        title={`Nam: ${bMale}`}
                      />
                      <div
                        style={{ width: `${bRatio}%` }}
                        className="bg-pink-500 h-full"
                        title={`Nữ: ${bFemale}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>Nam: {bMale}</span>
                      <span className="text-pink-600 dark:text-pink-400 font-semibold">Nữ: {bFemale} ({bRatio}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Edit / Add Modal */}
      <MemberEditModal
        isOpen={isAddModalOpen || !!editingMember}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={(savedMember) => {
          if (editingMember) {
            onEditMember(savedMember);
          } else {
            onAddNewMember(savedMember);
          }
        }}
      />
    </div>
  );
};
