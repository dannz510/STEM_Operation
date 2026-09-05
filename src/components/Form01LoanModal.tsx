import React, { useState } from 'react';
import {
  FileText,
  X,
  CheckCircle2,
  Calendar,
  User,
  ShieldCheck,
  Camera,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { Asset, Member, LoanTicket } from '../types';

interface Form01LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  selectedAsset: Asset | null;
  activeMember?: Member;
  onCreateLoan: (loanData: Omit<LoanTicket, 'id'>) => void;
}

export const Form01LoanModal: React.FC<Form01LoanModalProps> = ({
  isOpen,
  onClose,
  assets,
  selectedAsset,
  activeMember,
  onCreateLoan,
}) => {
  const [assetId, setAssetId] = useState(selectedAsset ? selectedAsset.id : assets[0]?.id || '');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerRole, setBorrowerRole] = useState('Sinh viên NCKH / Đội thi Robocon');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [borrowerUnit, setBorrowerUnit] = useState('Khoa Cơ Khí / CLB STEM');
  const [loanDurationHours, setLoanDurationHours] = useState('4');
  const [purpose, setPurpose] = useState('');
  const [conditionOnLoan, setConditionOnLoan] = useState('Thiết bị nguyên vẹn, đầy đủ phụ kiện, cáp nguồn, đã test khởi động bình thường.');
  const [depositVnd, setDepositVnd] = useState(0);
  const [cctvVerified, setCctvVerified] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);

  if (!isOpen) return null;

  const currentAsset = assets.find((a) => a.id === assetId) || selectedAsset || assets[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim() || !borrowerPhone.trim() || !termsAgreed || !currentAsset) return;

    const now = new Date();
    const returnTime = new Date(now.getTime() + parseInt(loanDurationHours, 10) * 3600000);

    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const formatDt = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    onCreateLoan({
      ticketCode: `FORM01-${Date.now().toString().slice(-6)}`,
      borrowerName,
      borrowerRole,
      borrowerPhone,
      borrowerUnit,
      assetId: currentAsset.id,
      assetCode: currentAsset.code,
      assetName: currentAsset.name,
      loanTime: formatDt(now),
      expectedReturnTime: formatDt(returnTime),
      purpose: purpose || 'Nghiên cứu khoa học & gia công mô hình dự án STEM',
      conditionOnLoan,
      status: 'ACTIVE',
      approverName: activeMember?.name || 'System',
      approverRank: activeMember?.rank || 'CADET',
      depositVnd: Number(depositVnd) || 0,
      threeLayerVerification: {
        cctvTimestamp: `CAM-LAB-${Date.now().toString().slice(-8)}`,
        inspectorName: `${activeMember?.name || 'System'} (${activeMember?.subBranchCode || 'OPS-1.1'})`,
        reconciliationDone: cctvVerified,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bento-card bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-lg overflow-hidden shadow-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded text-white font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-bold border border-sky-800">
                  FORM 01
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DIGITAL LOAN PROTOCOL</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight text-white mt-0.5">
                Biên Bản Bàn Giao & Hợp Đồng Trách Nhiệm Thiết Bị
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[78vh] overflow-y-auto space-y-4 text-xs">
          {/* Asset Selection */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="block font-bold text-slate-900 dark:text-white font-mono text-[11px] uppercase tracking-wider">
              1. Chọn Thiết Bị Cần Bàn Giao
            </label>
            <select
              value={currentAsset?.id}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded font-mono text-xs outline-none focus:border-sky-500"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id} disabled={a.status !== 'AVAILABLE'}>
                  [{a.code}] {a.name} — {a.status === 'AVAILABLE' ? 'SẴN SÀNG' : 'ĐANG BẬN/MƯỢN'}
                </option>
              ))}
            </select>
            {currentAsset && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                <span>Vị trí: <strong className="text-slate-800 dark:text-slate-200">{currentAsset.location}</strong></span>
                <span>Giá trị: <strong className="text-slate-800 dark:text-slate-200">{new Intl.NumberFormat('vi-VN').format(currentAsset.valueVnd)} đ</strong></span>
                <span>Tiểu ban: <strong className="text-slate-800 dark:text-slate-200">{currentAsset.branchOwner}</strong></span>
              </div>
            )}
          </div>

          {/* Borrower Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Họ tên người mượn (*)</label>
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn Nam"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại liên hệ (*)</label>
              <input
                type="text"
                required
                placeholder="VD: 0988.123.456"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đối tượng / Vai trò</label>
              <select
                value={borrowerRole}
                onChange={(e) => setBorrowerRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              >
                <option value="Sinh viên NCKH / Đội thi Robocon">Sinh viên NCKH / Đội thi Robocon</option>
                <option value="Giảng viên / Hướng dẫn đồ án">Giảng viên / Hướng dẫn đồ án</option>
                <option value="Ban Tổ Chức Sự Kiện STEM">Ban Tổ Chức Sự Kiện STEM</option>
                <option value="Tiểu Ban Kỹ Thuật Nội Bộ">Tiểu Ban Kỹ Thuật Nội Bộ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Đơn vị / Lớp / Khoa</label>
              <input
                type="text"
                placeholder="VD: Khoa Cơ Điện Tử K21"
                value={borrowerUnit}
                onChange={(e) => setBorrowerUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              />
            </div>
          </div>

          {/* Loan Duration & Purpose */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Thời lượng mượn dự kiến</label>
              <select
                value={loanDurationHours}
                onChange={(e) => setLoanDurationHours(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              >
                <option value="2">2 Giờ (Trong ca trực)</option>
                <option value="4">4 Giờ (1 Buổi)</option>
                <option value="8">8 Giờ (Cả ngày)</option>
                <option value="24">24 Giờ (Qua đêm - Yêu cầu Lead duyệt)</option>
                <option value="72">72 Giờ (Cuối tuần sự kiện)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tiền cọc / Ký gửi (VNĐ)</label>
              <input
                type="number"
                step={50000}
                placeholder="0"
                value={depositVnd}
                onChange={(e) => setDepositVnd(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mục đích sử dụng cụ thể</label>
              <input
                type="text"
                placeholder="VD: Cân chỉnh mạch điều khiển động cơ cho giải đấu STEM..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tình trạng ngoại quan khi bàn giao</label>
              <textarea
                rows={2}
                value={conditionOnLoan}
                onChange={(e) => setConditionOnLoan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white outline-none focus:border-sky-500 font-sans"
              />
            </div>
          </div>

          {/* 3-Layer Proof & Approver */}
          <div className="p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5 font-mono text-[11px]">
                <Camera className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Xác thực Minh chứng 3 Lớp (CCTV + Đối soát)
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cctvVerified}
                  onChange={(e) => setCctvVerified(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="font-semibold text-sky-900 dark:text-sky-300 text-[11px]">Đã ghi nhận góc máy CCTV</span>
              </label>
            </div>
            <div className="text-[11px] text-sky-800 dark:text-sky-400 font-mono">
              Cán bộ duyệt phiếu: <strong>{activeMember?.name || 'System'}</strong> ([{activeMember?.rank || 'CADET'}] - {activeMember?.subBranchCode || 'OPS-1.1'})
            </div>
          </div>

          {/* Legal Agreement */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
              />
              <span className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed">
                <strong>Cam kết pháp lý & Điều lệ Lab:</strong> Người mượn cam kết tuân thủ 100% quy chuẩn an toàn điện/hóa chất, giữ gìn tài sản nguyên vẹn và hoàn trả đúng hạn. Nếu xảy ra hư hại, chấp hành phân cấp bồi thường theo Điều lệ Lab (Mức 1 đến Mức 4).
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded font-mono text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!termsAgreed}
              className="px-4 py-1.5 text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Ký Duyệt & Bàn Giao Thiết Bị
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
