import React, { useState, useEffect } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { LoanTicket } from '../types';

interface LoanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanTicket | null;
  onSave: (updatedLoan: LoanTicket) => void;
}

export const LoanEditModal: React.FC<LoanEditModalProps> = ({
  isOpen,
  onClose,
  loan,
  onSave,
}) => {
  if (!isOpen || !loan) return null;

  const [borrowerName, setBorrowerName] = useState(loan.borrowerName);
  const [borrowerPhone, setBorrowerPhone] = useState(loan.borrowerPhone);
  const [borrowerUnit, setBorrowerUnit] = useState(loan.borrowerUnit);
  const [purpose, setPurpose] = useState(loan.purpose);
  const [expectedReturnTime, setExpectedReturnTime] = useState(loan.expectedReturnTime);
  const [depositVnd, setDepositVnd] = useState(loan.depositVnd || 0);
  const [conditionOnLoan, setConditionOnLoan] = useState(loan.conditionOnLoan);
  const [status, setStatus] = useState<LoanTicket['status']>(loan.status);

  useEffect(() => {
    if (loan) {
      setBorrowerName(loan.borrowerName);
      setBorrowerPhone(loan.borrowerPhone);
      setBorrowerUnit(loan.borrowerUnit);
      setPurpose(loan.purpose);
      setExpectedReturnTime(loan.expectedReturnTime);
      setDepositVnd(loan.depositVnd || 0);
      setConditionOnLoan(loan.conditionOnLoan);
      setStatus(loan.status);
    }
  }, [loan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowerName.trim()) return;

    onSave({
      ...loan,
      borrowerName: borrowerName.trim(),
      borrowerPhone: borrowerPhone.trim(),
      borrowerUnit: borrowerUnit.trim(),
      purpose: purpose.trim(),
      expectedReturnTime,
      depositVnd: Number(depositVnd) || 0,
      conditionOnLoan: conditionOnLoan.trim(),
      status,
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
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                CẬP NHẬT PHIẾU BÀN GIAO FORM 01
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                [{loan.ticketCode}] {loan.assetName}
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
                Họ Tên Người Mượn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Số Điện Thoại</label>
              <input
                type="tel"
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Đơn Vị / Đội Thi / Nhóm</label>
              <input
                type="text"
                value={borrowerUnit}
                onChange={(e) => setBorrowerUnit(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Hạn Trả Dự Kiến</label>
              <input
                type="text"
                value={expectedReturnTime}
                onChange={(e) => setExpectedReturnTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiền Đặt Cọc (VNĐ)</label>
              <input
                type="number"
                value={depositVnd}
                onChange={(e) => setDepositVnd(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Trạng Thái Phiếu</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-sky-500"
              >
                <option value="ACTIVE">ACTIVE (Đang mượn ngoài Lab)</option>
                <option value="RETURNED">RETURNED (Đã hoàn trả / nghiệm thu)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Mục Đích Sử Dụng</label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tình Trạng Khi Bàn Giao</label>
            <input
              type="text"
              value={conditionOnLoan}
              onChange={(e) => setConditionOnLoan(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
            />
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
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
