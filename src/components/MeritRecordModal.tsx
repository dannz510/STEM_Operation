import React, { useState } from 'react';
import {
  Award,
  X,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  AlertOctagon,
  User,
} from 'lucide-react';
import { Member, SubBranchCode } from '../types';

interface MeritRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  activeMember?: Member;
  preselectedMemberId?: string;
  onRecordPoints: (data: {
    memberId: string;
    type: 'MERIT' | 'DEMERIT';
    points: number;
    ruleCode: string;
    reason: string;
  }) => void;
}

export const MeritRecordModal: React.FC<MeritRecordModalProps> = ({
  isOpen,
  onClose,
  members,
  activeMember,
  preselectedMemberId,
  onRecordPoints,
}) => {
  const [targetMemberId, setTargetMemberId] = useState(preselectedMemberId || members[0]?.id || '');
  const [pointType, setPointType] = useState<'MERIT' | 'DEMERIT'>('MERIT');
  const [points, setPoints] = useState<number>(15);
  const [ruleCode, setRuleCode] = useState('MERIT-R02');
  const [customReason, setCustomReason] = useState('');

  React.useEffect(() => {
    if (preselectedMemberId) {
      setTargetMemberId(preselectedMemberId);
    } else if (members[0]?.id) {
      setTargetMemberId(members[0].id);
    }
  }, [preselectedMemberId, isOpen]);

  if (!isOpen) return null;

  const targetMember = members.find((m) => m.id === targetMemberId) || members[0];

  const meritPresets = [
    { code: 'MERIT-R01', pts: 5, label: '+5 Điểm: Vệ sinh 5S phòng Lab xuất sắc sau ca trực' },
    { code: 'MERIT-R02', pts: 15, label: '+15 Điểm: Bảo trì định kỳ máy in FDM/Resin đạt chuẩn' },
    { code: 'MERIT-R03', pts: 20, label: '+20 Điểm: Trực thay ca đột xuất / Tăng ca đêm sự kiện' },
    { code: 'MERIT-R04', pts: 30, label: '+30 Điểm: Khắc phục sự cố kỹ thuật sa bàn trong 15 phút' },
    { code: 'MERIT-R05', pts: 50, label: '+50 Điểm: Cứu nguy sự cố thảm họa RED CODE thành công' },
  ];

  const demeritPresets = [
    { code: 'DEMERIT-D01', pts: 5, label: '-5 Điểm: Đi trễ ca trực > 10 phút không lý do' },
    { code: 'DEMERIT-D02', pts: 10, label: '-10 Điểm: Không thực hiện 5S bàn giao cuối ca' },
    { code: 'DEMERIT-D03', pts: 30, label: '-30 Điểm: Làm hỏng thiết bị Mức 2 do bất cẩn không báo' },
    { code: 'DEMERIT-D04', pts: 50, label: '-50 Điểm: Vi phạm an toàn cồn/điện hoặc quy tắc phát ngôn SPOC' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMember) return;

    let selectedPreset = pointType === 'MERIT' 
      ? meritPresets.find(p => p.pts === points) 
      : demeritPresets.find(p => p.pts === points);

    const reason = customReason || selectedPreset?.label || 'Ghi nhận điểm tác chiến định kỳ';

    onRecordPoints({
      memberId: targetMember.id,
      type: pointType,
      points,
      ruleCode: selectedPreset?.code || (pointType === 'MERIT' ? 'MERIT-CUSTOM' : 'DEMERIT-CUSTOM'),
      reason,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${pointType === 'MERIT' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-slate-300 font-bold block">
                HỆ THỐNG GAMIFICATION & KỶ LUẬT
              </span>
              <h3 className="text-sm font-bold tracking-tight text-white mt-0.5">
                Ghi Nhận Điểm Tác Chiến (Merit / Demerit)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Target Member */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Thành viên ghi nhận</label>
            <select
              value={targetMember?.id}
              onChange={(e) => setTargetMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md font-sans text-xs focus:ring-1 focus:ring-sky-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.rank}] {m.name} - {m.subBranchCode} (Hiện có: +{m.meritPoints} / -{m.demeritPoints})
                </option>
              ))}
            </select>
          </div>

          {/* Type Switcher */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setPointType('MERIT');
                setPoints(15);
              }}
              className={`p-3 rounded-lg border text-center font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                pointType === 'MERIT'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>CỘNG MERIT (+)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPointType('DEMERIT');
                setPoints(10);
              }}
              className={`p-3 rounded-lg border text-center font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                pointType === 'DEMERIT'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-500'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <MinusCircle className="w-4 h-4 text-rose-600" />
              <span>TRỪ DEMERIT (-)</span>
            </button>
          </div>

          {/* Quick Presets based on Operational Manual */}
          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Chọn mức điểm quy định (Theo Điều Lệ Lab)
            </label>
            <div className="space-y-1.5">
              {(pointType === 'MERIT' ? meritPresets : demeritPresets).map((preset) => (
                <button
                  type="button"
                  key={preset.code}
                  onClick={() => {
                    setPoints(preset.pts);
                    setRuleCode(preset.code);
                    setCustomReason(preset.label);
                  }}
                  className={`w-full p-2.5 rounded border text-left cursor-pointer text-[11px] transition-all flex items-center justify-between ${
                    points === preset.pts
                      ? pointType === 'MERIT'
                        ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-900 ring-1 ring-emerald-400'
                        : 'bg-rose-50 border-rose-400 font-bold text-rose-900 ring-1 ring-rose-400'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{preset.label}</span>
                  <span className="font-mono text-xs font-black">
                    {pointType === 'MERIT' ? `+${preset.pts}` : `-${preset.pts}`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Description */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Lý do cụ thể / Biên bản đính kèm</label>
            <textarea
              rows={2}
              placeholder="Nhập ghi chú chi tiết nếu có..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 font-sans"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
            Người ghi nhận: <strong>{activeMember?.name || 'System'}</strong> ([{activeMember?.rank || 'CADET'}] - {activeMember?.subBranchCode || 'OPS-1.1'})
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-md font-bold shadow-xs flex items-center gap-1.5 cursor-pointer ${
                pointType === 'MERIT' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác Nhận Cập Nhật Điểm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
