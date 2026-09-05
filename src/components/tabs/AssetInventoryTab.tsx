import React, { useState, useMemo } from 'react';
import {
  Box,
  Search,
  QrCode,
  Lock,
  Unlock,
  Plus,
  Package,
  Edit2,
  Trash2,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Minus,
} from 'lucide-react';
import { Asset, ConsumableItem, AssetCategory, SubBranchCode } from '../../types';
import { SUB_BRANCHES } from '../../data/initialData';
import { AssetEditModal } from '../AssetEditModal';

interface AssetInventoryTabProps {
  assets: Asset[];
  consumables: ConsumableItem[];
  onSelectAsset: (asset: Asset) => void;
  onToggleSeal: (assetId: string) => void;
  onAddNewAsset: (newAsset: Omit<Asset, 'id'>) => void;
  onEditAsset: (updatedAsset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
  onRestockConsumable: (id: string, amount: number) => void;
  onUseConsumable: (id: string, amount: number) => void;
  onAddNewConsumable: (item: Omit<ConsumableItem, 'id'>) => void;
  onOpenLoanForAsset: (asset: Asset) => void;
}

type SortField = 'name' | 'valueVnd' | 'code' | 'status';
type SortOrder = 'asc' | 'desc';

export const AssetInventoryTab: React.FC<AssetInventoryTabProps> = ({
  assets,
  consumables,
  onSelectAsset,
  onToggleSeal,
  onAddNewAsset,
  onEditAsset,
  onDeleteAsset,
  onRestockConsumable,
  onUseConsumable,
  onAddNewConsumable,
  onOpenLoanForAsset,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ASSETS' | 'CONSUMABLES'>('ASSETS');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');

  // Sort State
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal State for Edit
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isAddingAsset, setIsAddingAsset] = useState(false);

  // New Asset Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<AssetCategory>('3D_PRINTER');
  const [newBranch, setNewBranch] = useState<SubBranchCode>('OPS-1.1');
  const [newLocation, setNewLocation] = useState('Zone A (Khu Chế Tác)');
  const [newValueVnd, setNewValueVnd] = useState(15000000);
  const [newSerial, setNewSerial] = useState('');
  const [newSpecs, setNewSpecs] = useState('');

  // Consumables quick add state
  const [isAddingConsumable, setIsAddingConsumable] = useState(false);
  const [consName, setConsName] = useState('');
  const [consCategory, setConsCategory] = useState('Vật liệu in FDM');
  const [consStock, setConsStock] = useState(10);
  const [consMin, setConsMin] = useState(3);
  const [consUnit, setConsUnit] = useState('Cuộn (1kg)');
  const [consBranch, setConsBranch] = useState<SubBranchCode>('OPS-1.1');

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((a) => {
        const matchesSearch =
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
        const matchesBranch = branchFilter === 'ALL' || a.branchOwner === branchFilter;
        return matchesSearch && matchesCategory && matchesStatus && matchesBranch;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.name.localeCompare(b.name, 'vi');
        } else if (sortField === 'valueVnd') {
          comp = a.valueVnd - b.valueVnd;
        } else if (sortField === 'code') {
          comp = a.code.localeCompare(b.code);
        } else if (sortField === 'status') {
          comp = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [assets, searchTerm, categoryFilter, statusFilter, branchFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCreateAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const code = `AST-${newCategory.slice(0, 3)}-${Date.now().toString().slice(-4)}`;
    onAddNewAsset({
      code,
      name: newName.trim(),
      category: newCategory,
      branchOwner: newBranch,
      status: 'AVAILABLE',
      location: newLocation.trim() || 'Kho Tiền Cần STEM',
      valueVnd: Number(newValueVnd) || 5000000,
      serialNumber: newSerial.trim() || `SN-${Date.now().toString().slice(-6)}`,
      qrCode: `STEM-${code}`,
      lastMaintenance: new Date().toISOString().split('T')[0],
      specifications: newSpecs.trim() || 'Thiết bị tiêu chuẩn phòng Lab STEM ISO 5S',
      notes: 'Nhập kho mới; đã dán tem niêm phong và đối soát CCTV.',
      sealStatus: 'SEALED',
    });

    setIsAddingAsset(false);
    setNewName('');
    setNewSerial('');
    setNewSpecs('');
  };

  const handleCreateConsumableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consName.trim()) return;

    onAddNewConsumable({
      name: consName.trim(),
      category: consCategory,
      currentStock: Number(consStock) || 1,
      minThreshold: Number(consMin) || 1,
      unit: consUnit.trim() || 'Đơn vị',
      subBranch: consBranch,
      lastRestocked: new Date().toISOString().split('T')[0],
      specs: 'Vật tư phục vụ ca trực thực hành STEM',
    });

    setIsAddingConsumable(false);
    setConsName('');
  };

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalFilteredValue = filteredAssets.reduce((sum, a) => sum + a.valueVnd, 0);

  return (
    <div className="space-y-4">
      {/* Sub-navigation Switcher & Quick Add */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="inline-flex border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('ASSETS')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ASSETS'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Box className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Danh Mục Thiết Bị ({assets.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('CONSUMABLES')}
            className={`px-3 py-1.5 transition-all flex items-center gap-1.5 ${
              activeSubTab === 'CONSUMABLES'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Kho Vật Tư Tiêu Hao ({consumables.length})</span>
          </button>
        </div>

        {activeSubTab === 'ASSETS' ? (
          <button
            onClick={() => setIsAddingAsset(!isAddingAsset)}
            id="asset-toggle-add-btn"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingAsset ? 'Đóng Form Nhập' : '+ Nhập Thiết Bị Mới'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddingConsumable(!isAddingConsumable)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingConsumable ? 'Đóng Form' : '+ Thêm Loại Vật Tư Mới'}</span>
          </button>
        )}
      </div>

      {/* FORM ADD ASSET (COLLAPSIBLE) */}
      {isAddingAsset && activeSubTab === 'ASSETS' && (
        <form
          onSubmit={handleCreateAssetSubmit}
          className="bento-card p-4 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Phiếu Nhập Thiết Bị Mới Vào Kho Tiền Cần</span>
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Tự động gán mã QR & cấp tem niêm phong</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">
                Tên Thiết Bị <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Máy In 3D Bambu Lab P1S..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Phân Loại</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as AssetCategory)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="3D_PRINTER">Máy In 3D (FDM / Resin)</option>
                <option value="CNC_LASER">Máy CNC & Khắc Laser</option>
                <option value="MEASUREMENT">Thiết Bị Đo Lường & Nguồn</option>
                <option value="ROBOTICS">Robotics & Sa Bàn Tác Chiến</option>
                <option value="ELECTRONICS">Điện Tử & Vi Điều Khiển</option>
                <option value="CONSUMABLE">Vật Tư & Phụ Kiện</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiểu Ban Quản Lý</label>
              <select
                value={newBranch}
                onChange={(e) => setNewBranch(e.target.value as SubBranchCode)}
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
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Vị Trí Định Vị 5S</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="VD: Zone A - Bàn in số 2"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Giá Trị Tài Sản (VNĐ)</label>
              <input
                type="number"
                value={newValueVnd}
                onChange={(e) => setNewValueVnd(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Số Serial (S/N)</label>
              <input
                type="text"
                value={newSerial}
                onChange={(e) => setNewSerial(e.target.value)}
                placeholder="Để trống sẽ tự tạo"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Thông Số Kỹ Thuật (Specs)</label>
            <input
              type="text"
              value={newSpecs}
              onChange={(e) => setNewSpecs(e.target.value)}
              placeholder="VD: Khổ in 256x256x256mm, tốc độ 500mm/s, nhiệt độ đầu phun 300°C..."
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddingAsset(false)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Xác Nhận Nhập Kho
            </button>
          </div>
        </form>
      )}

      {/* FORM ADD CONSUMABLE (COLLAPSIBLE) */}
      {isAddingConsumable && activeSubTab === 'CONSUMABLES' && (
        <form
          onSubmit={handleCreateConsumableSubmit}
          className="bento-card p-4 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Thêm Loại Vật Tư Tiêu Hao Mới</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tên Vật Tư *</label>
              <input
                type="text"
                required
                value={consName}
                onChange={(e) => setConsName(e.target.value)}
                placeholder="VD: Nhựa In PLA+ Đen..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Chủng Loại</label>
              <input
                type="text"
                value={consCategory}
                onChange={(e) => setConsCategory(e.target.value)}
                placeholder="VD: Vật liệu in 3D"
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Tiểu Ban Phụ Trách</label>
              <select
                value={consBranch}
                onChange={(e) => setConsBranch(e.target.value as SubBranchCode)}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 font-mono"
              >
                {SUB_BRANCHES.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Số Lượng Ban Đầu</label>
              <input
                type="number"
                value={consStock}
                onChange={(e) => setConsStock(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Ngưỡng Báo Động (Tối thiểu)</label>
              <input
                type="number"
                value={consMin}
                onChange={(e) => setConsMin(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 font-mono text-[11px]">Đơn Vị Tính</label>
              <input
                type="text"
                value={consUnit}
                onChange={(e) => setConsUnit(e.target.value)}
                placeholder="Cuộn / Bình / Hộp..."
                className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddingConsumable(false)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors"
            >
              Lưu Vật Tư
            </button>
          </div>
        </form>
      )}

      {/* ASSETS VIEW */}
      {activeSubTab === 'ASSETS' && (
        <div className="space-y-3">
          {/* Filter, Search & Summary Bar */}
          <div className="bento-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo tên máy, mã AST, số serial, vị trí 5S..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-sky-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="ALL">Tất Cả Phân Loại</option>
                <option value="3D_PRINTER">Máy In 3D</option>
                <option value="CNC_LASER">Máy CNC / Laser</option>
                <option value="MEASUREMENT">Đo Lường & Nguồn</option>
                <option value="ROBOTICS">Robotics</option>
                <option value="ELECTRONICS">Điện Tử</option>
                <option value="CONSUMABLE">Vật Tư</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono font-semibold"
              >
                <option value="ALL">Tất Cả Trạng Thái</option>
                <option value="AVAILABLE">Sẵn Sàng (In-Lab)</option>
                <option value="IN_USE">Đang Bàn Giao (On-Loan)</option>
                <option value="MAINTENANCE">Đang Bảo Trì</option>
              </select>

              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs outline-none focus:border-sky-500 font-mono"
              >
                <option value="ALL">Tất Cả Tiểu Ban</option>
                {SUB_BRANCHES.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-mono">
            <span>
              Kết quả: <strong className="text-slate-900 dark:text-white">{filteredAssets.length}</strong> / {assets.length} thiết bị
            </span>
            <span>
              Tổng giá trị lọc: <strong className="text-slate-900 dark:text-white">{formatVnd(totalFilteredValue)}</strong>
            </span>
          </div>

          {/* Asset Data Table */}
          <div className="bento-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-mono">
                  <tr>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('code')}>
                      <div className="flex items-center gap-1">
                        <span>Mã AST</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">
                        <span>Tên Thiết Bị & Thông Số</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3">Số Serial</th>
                    <th className="p-3">Tiểu Ban</th>
                    <th className="p-3">Vị Trí 5S</th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('valueVnd')}>
                      <div className="flex items-center gap-1">
                        <span>Giá Trị</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => handleSort('status')}>
                      <div className="flex items-center gap-1">
                        <span>Trạng Thái</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="p-3 text-center">Niêm Phong</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                        Không tìm thấy thiết bị nào khớp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold font-mono text-sky-700 dark:text-sky-400">
                          <button
                            onClick={() => onSelectAsset(asset)}
                            className="flex items-center gap-1.5 hover:underline"
                            title="Bấm xem QR Card & Chi Tiết"
                          >
                            <QrCode className="w-3.5 h-3.5 text-slate-400" />
                            <span>{asset.code}</span>
                          </button>
                        </td>

                        <td className="p-3 max-w-xs">
                          <strong className="text-slate-900 dark:text-white block font-semibold text-xs truncate">
                            {asset.name}
                          </strong>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {asset.specifications}
                          </span>
                        </td>

                        <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {asset.serialNumber}
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            {asset.branchOwner}
                          </span>
                        </td>

                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            {asset.location}
                          </span>
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {formatVnd(asset.valueVnd)}
                        </td>

                        <td className="p-3">
                          {asset.status === 'AVAILABLE' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 border border-emerald-200 dark:border-emerald-800/60 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Sẵn Sàng
                            </span>
                          ) : asset.status === 'IN_USE' ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 font-bold text-[10px] bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 border border-amber-200 dark:border-amber-800/60 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              Đang Mượn
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-300 font-bold text-[10px] bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 border border-rose-200 dark:border-rose-800/60 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Bảo Trì
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <button
                            onClick={() => onToggleSeal(asset.id)}
                            className={`p-1.5 border transition-colors ${
                              asset.sealStatus === 'SEALED'
                                ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-emerald-200 dark:border-emerald-800/60'
                                : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border-rose-200 dark:border-rose-800/60'
                            }`}
                            title={asset.sealStatus === 'SEALED' ? 'Tem niêm phong nguyên vẹn (Đạt)' : 'Đã mở niêm phong'}
                          >
                            {asset.sealStatus === 'SEALED' ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {asset.status === 'AVAILABLE' && (
                              <button
                                onClick={() => onOpenLoanForAsset(asset)}
                                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-mono font-semibold transition-colors"
                                title="Lập phiếu bàn giao Form 01 cho máy này"
                              >
                                Bàn Giao
                              </button>
                            )}

                            <button
                              onClick={() => setEditingAsset(asset)}
                              className="p-1 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                              title="Sửa thông tin thiết bị"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Xác nhận xóa thiết bị [${asset.name}] (${asset.code}) khỏi kho?`)) {
                                  onDeleteAsset(asset.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                              title="Xóa thiết bị"
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

      {/* CONSUMABLES VIEW */}
      {activeSubTab === 'CONSUMABLES' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 dark:bg-amber-950/30 p-3.5 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <span className="font-bold font-mono">Định mức vật tư tiêu hao phòng Lab (FIN-2.2 & SAF-3.2)</span>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  Tự động cảnh báo khi tồn kho chạm ngưỡng an toàn tối thiểu. Nhập/xuất trực tiếp vào state hệ thống.
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-xs bg-white dark:bg-slate-900 px-2.5 py-1 border border-amber-200 dark:border-amber-800/60 text-slate-900 dark:text-white">
              {consumables.length} Chủng loại
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {consumables.map((item) => {
              const isLowStock = item.currentStock <= item.minThreshold;
              return (
                <div
                  key={item.id}
                  className={`bento-card p-4 transition-all space-y-3 ${
                    isLowStock ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                        {item.subBranch}
                      </span>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-xs mt-1">{item.name}</h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{item.category}</span>
                    </div>

                    {isLowStock ? (
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-mono font-bold border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        THIẾU HỤT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ĐỦ ĐỊNH MỨC
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Hiện có trong kho</span>
                      <strong className={`font-mono text-base font-bold ${isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                        {item.currentStock} {item.unit}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Ngưỡng tối thiểu</span>
                      <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {item.minThreshold} {item.unit}
                      </span>
                    </div>
                  </div>

                  {/* Stock Adjust Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Cập nhật: {item.lastRestocked}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onUseConsumable(item.id, 1)}
                        disabled={item.currentStock <= 0}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                        title="Xuất dùng 1 đơn vị"
                      >
                        <Minus className="w-3 h-3" />
                        <span>Xuất 1</span>
                      </button>

                      <button
                        onClick={() => onRestockConsumable(item.id, 5)}
                        className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                        title="Nhập thêm 5 đơn vị"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nhập +5</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset Edit Modal */}
      <AssetEditModal
        isOpen={!!editingAsset}
        onClose={() => setEditingAsset(null)}
        asset={editingAsset}
        onSave={onEditAsset}
      />
    </div>
  );
};
