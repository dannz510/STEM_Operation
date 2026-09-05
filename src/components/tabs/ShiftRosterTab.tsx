import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckSquare,
  ShieldCheck,
  Camera,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { ShiftRoster, Member, SubBranchCode } from '../../types';
import { SUB_BRANCHES } from '../../data/initialData';
import { ShiftAddModal } from '../ShiftAddModal';

interface ShiftRosterTabProps {
  shifts: ShiftRoster[];
  members: Member[];
  onToggle5SItem: (shiftId: string, itemKey: keyof ShiftRoster['handover5S']) => void;
  onCompleteShift: (shiftId: string) => void;
  onAddNewShift: (newShift: Omit<ShiftRoster, 'id'>) => void;
  onDeleteShift: (shiftId: string) => void;
}

const CHECKLIST_LABELS: { key: keyof ShiftRoster['handover5S']; title: string; desc: string }[] = [
  { key: 'sortDone', title: '1. Sàng lọc (Seiri)', desc: 'Loại bỏ phế liệu in, rác cắt CNC, dây điện hỏng' },
  { key: 'setInOrderDone', title: '2. Sắp xếp (Seiton)', desc: 'Dụng cụ về đúng khay vạch kẻ 5S, kìm/nhíp về bảng treo' },
  { key: 'shineDone', title: '3. Sạch sẽ (Seiso)', desc: 'Hút bụi sàn Lab, lau sạch bàn in 3D & mặt kính laser' },
  { key: 'standardizeDone', title: '4. Săn sóc (Seiketsu)', desc: 'Dán nhãn tài sản, kiểm tra tem niêm phong thiết bị' },
  { key: 'sustainDone', title: '5. Sẵn sàng (Shitsuke)', desc: 'Ký biên bản giao ca 1+1, sẵn sàng cho kíp trực tiếp theo' },
  { key: 'machinesCalibrated', title: 'Cân Bàn & Tra Dầu', desc: 'Hiệu chuẩn Z-offset máy in 3D, bôi mỡ trục ti' },
  { key: 'powerIsolated', title: 'Ngắt Nguồn Điện Lab', desc: 'Cắt aptomat từng nhánh, rút phích sấy nhựa in' },
  { key: 'chemicalCabinetLocked', title: 'Khóa Tủ Hóa Chất & Cồn', desc: 'Khóa tủ cồn IPA, keo dán nhựa và kẹp thẻ niêm phong' },
];

export const ShiftRosterTab: React.FC<ShiftRosterTabProps> = ({
  shifts,
  members,
  onToggle5SItem,
  onCompleteShift,
  onAddNewShift,
  onDeleteShift,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      if (selectedBranch === 'ALL') return true;
      return s.subBranch === selectedBranch;
    });
  }, [shifts, selectedBranch]);

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold font-mono text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>LỊCH TRỰC 1+1 & BÀN GIAO TIÊU CHUẨN 5S PHÒNG LAB</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mỗi ca gồm 1 Kỹ thuật viên (Operator/Lead) + 1 Tập sự viên (Cadet). Nghiệm thu 8 hạng mục 5S trước khi rời Lab.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono"
          >
            <option value="ALL">Tất Cả Tiểu Ban</option>
            {SUB_BRANCHES.map((b) => (
              <option key={b.code} value={b.code}>
                {b.code}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            id="shift-open-add-btn"
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thiết Lập Ca Trực Mới</span>
          </button>
        </div>
      </div>

      {/* Shifts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredShifts.length === 0 ? (
          <div className="col-span-2 bento-card p-8 text-center text-slate-400 text-xs font-mono">
            Không có ca trực nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredShifts.map((shift) => {
            // Count done items
            const doneCount = Object.values(shift.handover5S).filter(Boolean).length;
            const totalItems = 8;
            const isAllDone = doneCount === totalItems;

            return (
              <div
                key={shift.id}
                className={`bento-card overflow-hidden transition-all ${
                  shift.isCompleted ? 'border-emerald-500/40' : ''
                }`}
              >
                {/* Shift Card Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 bg-sky-600/20 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold">
                      {shift.subBranch}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white text-xs font-semibold font-mono">
                          {shift.date}
                        </strong>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {shift.shiftTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {shift.isCompleted ? (
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ĐÃ BÀN GIAO XONG
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-800/60">
                        ĐANG TRỰC ({doneCount}/{totalItems})
                      </span>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`Xác nhận xóa ca trực [${shift.date} - ${shift.shiftTime}]?`)) {
                          onDeleteShift(shift.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                      title="Xóa ca trực này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Personnel on Duty */}
                <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Trưởng Ca (Operator / Lead)
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {shift.leadOperatorName}
                    </strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 text-sky-700 dark:text-sky-400 font-bold inline-block">
                      {shift.leadOperatorRank}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      Phụ Tá (Cadet)
                    </span>
                    <strong className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      {shift.cadetAssistantName}
                    </strong>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold inline-block">
                      CADET
                    </span>
                  </div>
                </div>

                {/* 5S Checklist Interactive Grid */}
                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      Checklist Bàn Giao 5S Cuối Ca
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Đạt {doneCount} / {totalItems}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {CHECKLIST_LABELS.map((item) => {
                      const isChecked = !!shift.handover5S[item.key];
                      return (
                        <label
                          key={item.key}
                          className={`flex items-start gap-2 p-2 border cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onToggle5SItem(shift.id, item.key)}
                            className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className={`block font-semibold text-[11px] ${isChecked ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {item.desc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer & Handover Action */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    <Camera className="w-3.5 h-3.5 text-slate-400" />
                    <span>CCTV Giám Sát: Đã xác thực</span>
                  </div>

                  {!shift.isCompleted && (
                    <button
                      onClick={() => onCompleteShift(shift.id)}
                      disabled={!isAllDone}
                      className={`px-3 py-1.5 font-mono font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                        isAllDone
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider cursor-pointer'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      }`}
                      title={isAllDone ? 'Hoàn thành và cộng điểm Merit cho ca trực' : 'Cần tích đủ 8 mục 5S'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ký Biên Bản & Đóng Ca (+10 Merit)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Shift Modal */}
      <ShiftAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        members={members}
        onAddShift={onAddNewShift}
      />
    </div>
  );
};
