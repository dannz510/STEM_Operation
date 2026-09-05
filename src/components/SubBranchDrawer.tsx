import React, { useEffect } from 'react';
import { X, ShieldCheck, Zap, Users, ArrowRight, CheckSquare, Compass, Award, FileText } from 'lucide-react';
import { SubBranchInfo, OperatingMode, Member } from '../types';

interface SubBranchDrawerProps {
  subBranch: SubBranchInfo | null;
  mode: OperatingMode;
  members: Member[];
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const SubBranchDrawer: React.FC<SubBranchDrawerProps> = ({
  subBranch,
  mode,
  members,
  onClose,
  onNavigateTab,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (subBranch) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [subBranch, onClose]);

  if (!subBranch) return null;

  const branchMembers = members.filter((m) => m.subBranchCode === subBranch.code);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-12">
        <div className="w-screen max-w-xl bg-white dark:bg-[#090D16] border-l border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
          {/* Drawer Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-[#0B1120]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 px-2 py-0.5">
                  {subBranch.code}
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {subBranch.branchName}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {subBranch.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Chức danh lãnh đạo: <strong className="text-slate-800 dark:text-slate-200">{subBranch.leaderTitle}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              title="Đóng ngăn kéo (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {/* At-a-glance Status Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                  Đặc thù & Giới tính
                </span>
                <strong className="text-xs text-slate-900 dark:text-white font-medium block mt-1">
                  {subBranch.targetGenderRatio}
                </strong>
              </div>
              <div className="p-3 border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40">
                <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                  Quân số tác chiến
                </span>
                <div className="flex items-center justify-between mt-1">
                  <strong className="text-xs text-slate-900 dark:text-white font-mono font-bold">
                    {branchMembers.length} thành viên
                  </strong>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SẴN SÀNG
                  </span>
                </div>
              </div>
            </div>

            {/* Dual-Mode Missions */}
            <div className="border border-slate-200 dark:border-slate-800/80 p-3.5 space-y-3 bg-white dark:bg-slate-900/30">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Compass size={14} className="text-sky-600 dark:text-sky-400" />
                  Nhiệm Vụ Cơ Chế Dual-Mode
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  Hiện tại: {mode} MODE
                </span>
              </div>

              <div className="space-y-2">
                <div className={`p-2.5 border transition-all ${mode === 'NORMAL' ? 'border-sky-500/50 bg-sky-50/50 dark:bg-sky-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-700 dark:text-sky-400 uppercase">
                    <span>● Normal Mode</span>
                    <span className="text-slate-400 dark:text-slate-500">· Vận hành Lab thường nhật</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs">
                    {subBranch.normalMission}
                  </p>
                </div>

                <div className={`p-2.5 border transition-all ${mode === 'EVENT' ? 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20' : 'border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-rose-700 dark:text-rose-400 uppercase">
                    <span>● Event Mode</span>
                    <span className="text-slate-400 dark:text-slate-500">· Trực chiến hiện trường D-Day</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300 text-xs">
                    {subBranch.eventMission}
                  </p>
                </div>
              </div>
            </div>

            {/* Cross-Functional Support */}
            {subBranch.crossSupport && (
              <div className="border border-slate-200 dark:border-slate-800/80 p-3.5 bg-white dark:bg-slate-900/30">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white mb-1.5">
                  <Zap size={14} className="text-amber-500" />
                  Khả Năng Hỗ Trợ Chéo (Cross-Functional Support)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {subBranch.crossSupport}
                </p>
              </div>
            )}

            {/* Core Competencies */}
            {subBranch.coreCompetencies && subBranch.coreCompetencies.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800/80 p-3.5 bg-white dark:bg-slate-900/30">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white mb-2">
                  <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  Chuyên Môn & Kỹ Năng Cốt Lõi
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {subBranch.coreCompetencies.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] border border-slate-200 dark:border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Checklist */}
            {subBranch.kpiChecklist && subBranch.kpiChecklist.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800/80 p-3.5 bg-white dark:bg-slate-900/30">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white mb-2">
                  <CheckSquare size={14} className="text-sky-600 dark:text-sky-400" />
                  Tiêu Chí Đánh Giá Hoàn Thành Nhiệm Vụ (KPI Checklist)
                </div>
                <div className="space-y-1.5">
                  {subBranch.kpiChecklist.map((kpi, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="font-mono text-sky-600 dark:text-sky-400 font-bold shrink-0 mt-0.5">[{index + 1}]</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">{kpi}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branch Personnel list */}
            <div className="border border-slate-200 dark:border-slate-800/80 p-3.5 bg-white dark:bg-slate-900/30">
              <div className="flex items-center justify-between font-bold uppercase tracking-wider text-[11px] text-slate-900 dark:text-white mb-2">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Nhân Sự Phụ Trách ({branchMembers.length})
                </div>
                {onNavigateTab && (
                  <button
                    onClick={() => { onClose(); onNavigateTab('GAMIFICATION'); }}
                    className="text-[10px] font-mono text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5"
                  >
                    Xem chi tiết <ArrowRight size={10} />
                  </button>
                )}
              </div>
              {branchMembers.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 italic text-[11px]">
                  Chưa có nhân sự gán trực tiếp cho tiểu ban này.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {branchMembers.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          {m.name.split(' ').slice(-1)[0][0]}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-xs">{m.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{m.code} · {m.rank}</div>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {m.meritPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] flex items-center gap-2">
            {onNavigateTab && (
              <>
                <button
                  onClick={() => { onClose(); onNavigateTab('TASKS'); }}
                  className="flex-1 py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-slate-500 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText size={14} /> Giao Việc Cho Tiểu Ban
                </button>
                <button
                  onClick={() => { onClose(); onNavigateTab('CODEX'); }}
                  className="py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Award size={14} /> Điều Lệ Codex
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
