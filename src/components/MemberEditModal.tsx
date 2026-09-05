import React, { useState, useEffect } from 'react';
import { X, UserCheck, Check, AlertCircle } from 'lucide-react';
import { Member, RankLevel, SubBranchCode } from '../types';
import { SUB_BRANCHES } from '../data/initialData';

interface MemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null; // If null, mode is ADD
  onSave: (memberData: Member) => void;
}

const RANKS: { value: RankLevel; label: string }[] = [
  { value: 'CADET', label: 'CADET (Tập sự viên - Dưới 100 Merit)' },
  { value: 'OPERATOR', label: 'OPERATOR (Kỹ thuật viên ca trực - 100+ Merit)' },
  { value: 'LEAD', label: 'LEAD (Trưởng ca / Phó chủ nhiệm - 200+ Merit)' },
  { value: 'CHIEF', label: 'CHIEF (Chủ nhiệm / Tổng chỉ huy - 300+ Merit)' },
  { value: 'GRANDMASTER', label: 'GRANDMASTER (Huyền thoại - 500+ Merit)' },
];

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!member;

  const [name, setName] = useState(member?.name || '');
  const [studentId, setStudentId] = useState(member?.studentId || '');
  const [subBranchCode, setSubBranchCode] = useState<SubBranchCode>(
    member?.subBranchCode || 'OPS-1.1'
  );
  const [rank, setRank] = useState<RankLevel>(member?.rank || 'OPERATOR');
  const [phone, setPhone] = useState(member?.phone || '');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>(member?.gender || 'MALE');
  const [status, setStatus] = useState<Member['status']>(member?.status || 'ACTIVE');
  const [meritPoints, setMeritPoints] = useState<number>(member?.meritPoints ?? 100);
  const [demeritPoints, setDemeritPoints] = useState<number>(member?.demeritPoints ?? 0);
  const [shiftRole, setShiftRole] = useState(member?.shiftCommitment || 'Phụ trách vận hành máy in & 5S');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setStudentId(member.studentId);
      setSubBranchCode(member.subBranchCode);
      setRank(member.rank);
      setPhone(member.phone);
      setGender(member.gender);
      setStatus(member.status);
      setMeritPoints(member.meritPoints);
      setDemeritPoints(member.demeritPoints);
      setShiftRole(member.shiftCommitment);
    } else {
      setName('');
      setStudentId(`231${Math.floor(1000 + Math.random() * 9000)}`);
      setSubBranchCode('OPS-1.1');
      setRank('CADET');
      setPhone('0901234567');
      setGender('MALE');
      setStatus('ACTIVE');
      setMeritPoints(100);
      setDemeritPoints(0);
      setShiftRole('Tập sự viên vận hành phòng Lab');
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const code = member?.code || `MBR-2026-${Date.now().toString().slice(-4)}`;
    const id = member?.id || `MBR-${Date.now()}`;

    // Auto calculate warning level from demerit
    let warningLevel: Member['warningLevel'] = 'NONE';
    if (demeritPoints >= 50) warningLevel = 'LEVEL_3';
    else if (demeritPoints >= 30) warningLevel = 'LEVEL_2';
    else if (demeritPoints >= 15) warningLevel = 'LEVEL_1';

    onSave({
      id,
      code,
      name: name.trim(),
      studentId: studentId.trim(),
      email: member?.email || `${studentId.trim()}@stem-lab.vn`,
      phone: phone.trim(),
      branchCode: member?.branchCode || ('HR' as any),
      subBranchCode,
      rank,
      meritPoints: Number(meritPoints) || 0,
      demeritPoints: Number(demeritPoints) || 0,
      warningLevel,
      gender,
      status,
      joinedDate: member?.joinedDate || new Date().toISOString().split('T')[0],
      shiftCommitment: shiftRole.trim(),
      completedShifts: member?.completedShifts || 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bento-card w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                {isEditing ? 'CẬP NHẬT HỒ SƠ NHÂN SỰ' : 'THÊM NHÂN SỰ TÁC CHIẾN MỚI'}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {isEditing ? `[${member.code}] ${member.name}` : 'Tạo hồ sơ thành viên STEM Lab'}
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
        <form onSubmit={handleSubmit} className="p-5 max-h-[80vh] overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
                Họ và Tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
                placeholder="VD: Nguyễn Văn An"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
                Mã Số Sinh Viên (MSSV) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
                placeholder="VD: 23110045"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiểu Ban Trực Thuộc</label>
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Cấp Bậc Tác Chiến</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as RankLevel)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-sky-500 font-mono"
              >
                {RANKS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Số Điện Thoại Liên Hệ</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
                placeholder="090..."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Giới Tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE')}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              >
                <option value="MALE">Nam (Male)</option>
                <option value="FEMALE">Nữ (Female)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Trạng Thái Tác Chiến</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Member['status'])}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="ACTIVE">ACTIVE (Đang túc trực / Sẵn sàng)</option>
                <option value="ON_LEAVE">ON_LEAVE (Nghỉ phép theo quy định)</option>
                <option value="SUSPENDED">SUSPENDED (Đang chịu kỷ luật đình chỉ)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Vai Trò / Phân Công</label>
              <input
                type="text"
                value={shiftRole}
                onChange={(e) => setShiftRole(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                placeholder="VD: Trưởng ca kỹ thuật máy in 3D"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Điểm Thưởng (Merit)</label>
              <input
                type="number"
                value={meritPoints}
                onChange={(e) => setMeritPoints(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Điểm Phạt (Demerit)</label>
              <input
                type="number"
                value={demeritPoints}
                onChange={(e) => setDemeritPoints(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 text-xs font-mono font-bold outline-none focus:border-rose-500"
              />
            </div>
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
              <span>{isEditing ? 'Lưu Hồ Sơ' : 'Thêm Nhân Sự'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
