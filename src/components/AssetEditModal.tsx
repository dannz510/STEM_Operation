import React, { useState, useEffect } from 'react';
import { X, Box, Check, AlertCircle } from 'lucide-react';
import { Asset, AssetCategory, SubBranchCode } from '../types';
import { SUB_BRANCHES } from '../data/initialData';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onSave: (updatedAsset: Asset) => void;
}

const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: '3D_PRINTER', label: 'Máy In 3D (FDM / Resin)' },
  { value: 'CNC_LASER', label: 'Máy CNC & Khắc Laser' },
  { value: 'MEASUREMENT', label: 'Thiết Bị Đo Lường & Nguồn' },
  { value: 'ROBOTICS', label: 'Robotics & Sa Bàn Tác Chiến' },
  { value: 'ELECTRONICS', label: 'Điện Tử, Vi Điều Khiển & Hàn' },
  { value: 'CONSUMABLE', label: 'Vật Tư & Phụ Kiện' },
];

export const AssetEditModal: React.FC<AssetEditModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSave,
}) => {
  if (!isOpen || !asset) return null;

  const [name, setName] = useState(asset.name);
  const [category, setCategory] = useState<AssetCategory>(asset.category);
  const [branchOwner, setBranchOwner] = useState<SubBranchCode>(asset.branchOwner);
  const [location, setLocation] = useState(asset.location);
  const [valueVnd, setValueVnd] = useState(asset.valueVnd);
  const [serialNumber, setSerialNumber] = useState(asset.serialNumber);
  const [specifications, setSpecifications] = useState(asset.specifications);
  const [notes, setNotes] = useState(asset.notes || '');
  const [status, setStatus] = useState<Asset['status']>(asset.status);
  const [sealStatus, setSealStatus] = useState<Asset['sealStatus']>(asset.sealStatus);

  useEffect(() => {
    if (asset) {
      setName(asset.name);
      setCategory(asset.category);
      setBranchOwner(asset.branchOwner);
      setLocation(asset.location);
      setValueVnd(asset.valueVnd);
      setSerialNumber(asset.serialNumber);
      setSpecifications(asset.specifications);
      setNotes(asset.notes || '');
      setStatus(asset.status);
      setSealStatus(asset.sealStatus);
    }
  }, [asset]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...asset,
      name: name.trim(),
      category,
      branchOwner,
      location: location.trim(),
      valueVnd: Number(valueVnd) || 0,
      serialNumber: serialNumber.trim(),
      specifications: specifications.trim(),
      notes: notes.trim(),
      status,
      sealStatus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bento-card w-full max-w-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                CHỈNH SỬA THÔNG TIN TÀI SẢN KHO
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                [{asset.code}] {asset.name}
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
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
              Tên Thiết Bị / Tài Sản <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-medium"
              placeholder="VD: Máy In 3D Bambu Lab X1-Carbon..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Danh Mục Thiết Bị</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiểu Ban Quản Lý (Owner)</label>
              <select
                value={branchOwner}
                onChange={(e) => setBranchOwner(e.target.value as SubBranchCode)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
              >
                {SUB_BRANCHES.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Vị Trí Định Vị 5S</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                placeholder="VD: Zone A - Kệ 01 Khay 3"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Giá Trị Tài Sản (VNĐ)</label>
              <input
                type="number"
                value={valueVnd}
                onChange={(e) => setValueVnd(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
                placeholder="VD: 15000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Số Serial (S/N)</label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-mono outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Trạng Thái Khả Dụng</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Asset['status'])}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-sky-500 font-mono"
              >
                <option value="AVAILABLE">AVAILABLE (Trong kho sẵn sàng)</option>
                <option value="IN_USE">IN_USE (Đang cho mượn / bàn giao)</option>
                <option value="MAINTENANCE">MAINTENANCE (Bảo trì / Giám định)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Trạng Thái Niêm Phong (Seal)</label>
              <select
                value={sealStatus}
                onChange={(e) => setSealStatus(e.target.value as Asset['sealStatus'])}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:border-sky-500 font-mono"
              >
                <option value="SEALED">SEALED (Tem niêm phong nguyên vẹn)</option>
                <option value="BROKEN">BROKEN (Đã tháo / Mở niêm phong)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Ghi Chú Vận Hành</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
                placeholder="Ghi chú thêm về thiết bị..."
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Thông Số Kỹ Thuật (Specs)</label>
            <textarea
              rows={2}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              placeholder="Thông số kỹ thuật..."
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
