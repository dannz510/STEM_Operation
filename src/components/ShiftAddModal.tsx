import React, { useState } from 'react';
import { X, CalendarCheck2, Check } from 'lucide-react';
import { ShiftRoster, Member, SubBranchCode } from '../types';
import { SUB_BRANCHES } from '../data/initialData';

interface ShiftAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddShift: (newShift: Omit<ShiftRoster, 'id'>) => void;
}

export const ShiftAddModal: React.FC<ShiftAddModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddShift,
}) => {
  if (!isOpen) return null;

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shiftTime, setShiftTime] = useState<'08:00 - 12:00' | '13:30 - 17:30' | '18:00 - 21:00'>(
    '13:30 - 17:30'
  );
  const [subBranchCode, setSubBranchCode] = useState<SubBranchCode>('OPS-1.1');

  // Filter possible leads (rank != CADET) and cadets
  const leadCandidates = members.filter((m) => m.rank !== 'CADET');
  const cadetCandidates = members;

  const [leadOperatorId, setLeadOperatorId] = useState<string>(
    leadCandidates[0]?.id || members[0]?.id || ''
  );
  const [cadetAssistantId, setCadetAssistantId] = useState<string>(
    cadetCandidates[1]?.id || members[0]?.id || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lead = members.find((m) => m.id === leadOperatorId);
    const cadet = members.find((m) => m.id === cadetAssistantId);

    if (!lead || !cadet) return;

    onAddShift({
      date,
      shiftTime,
      leadOperatorId: lead.id,
      leadOperatorName: lead.name,
      leadOperatorRank: lead.rank,
      cadetAssistantId: cadet.id,
      cadetAssistantName: cadet.name,
      subBranch: subBranchCode,
      handover5S: {
        sortDone: false,
        setInOrderDone: false,
        shineDone: false,
        standardizeDone: false,
        sustainDone: false,
        machinesCalibrated: false,
        powerIsolated: false,
        chemicalCabinetLocked: false,
      },
      verifiedByCctv: true,
      isCompleted: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bento-card w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                QUY TẮC 1+1 HANDOVER
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Thiết Lập Ca Trực & Bàn Giao 5S Mới
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Ngày Trực</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Khung Giờ Ca Trực</label>
            <select
              value={shiftTime}
              onChange={(e) => setShiftTime(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-sky-500 font-mono"
            >
              <option value="08:00 - 12:00">Ca Sáng (08:00 - 12:00)</option>
              <option value="13:30 - 17:30">Ca Chiều (13:30 - 17:30)</option>
              <option value="18:00 - 21:00">Ca Tối (18:00 - 21:00)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiểu Ban Tác Chiến Trực Thuộc</label>
            <select
              value={subBranchCode}
              onChange={(e) => setSubBranchCode(e.target.value as SubBranchCode)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
            >
              {SUB_BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
              Trưởng Ca Kỹ Thuật (Operator / Lead) <span className="text-rose-500">*</span>
            </label>
            <select
              value={leadOperatorId}
              onChange={(e) => setLeadOperatorId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.rank}] {m.name} ({m.subBranchCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
              Phụ Tá / Thực Tập Sinh (Cadet) <span className="text-rose-500">*</span>
            </label>
            <select
              value={cadetAssistantId}
              onChange={(e) => setCadetAssistantId(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.rank}] {m.name} ({m.subBranchCode})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Tạo Ca Trực</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
