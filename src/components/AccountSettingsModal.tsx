import React, { useState, useEffect } from 'react';
import { X, User, Shield, Bell, Save } from 'lucide-react';

interface Member {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
}

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave?: (updatedData: { name: string; phone: string }) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
}) => {
  // 1. Khai báo toàn bộ Hooks ở top-level tuyệt đối (tuân thủ Rules of Hooks)
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [name, setName] = useState<string>(member?.name ?? '');
  const [phone, setPhone] = useState<string>(member?.phone ?? '');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 2. Khắc phục triệt để lỗi stale state bằng cách đồng bộ lại khi prop `member` thay đổi
  useEffect(() => {
    if (member) {
      setName(member.name ?? '');
      setPhone(member.phone ?? '');
    }
  }, [member]);

  // Điều kiện return đặt sau tất cả các khai báo Hook
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({ name, phone });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save account settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="text-lg font-semibold tracking-wide text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            Cài Đặt Tài Khoản & Cá Nhân Hóa
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Hồ Sơ
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" /> Bảo Mật
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" /> Thông Báo
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Hệ Thống
                </label>
                <input
                  type="email"
                  value={member?.email ?? ''}
                  disabled
                  className="w-full bg-slate-900/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-sm text-slate-300 py-4">
              <p className="text-slate-400">Quản lý phiên đăng nhập và phân quyền tích hợp Google Workspace của tiểu ban.</p>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
              >
                Đăng xuất tất cả thiết bị khác
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 text-sm text-slate-300 py-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 border-slate-800 text-blue-500 focus:ring-0 w-4 h-4" />
                <span>Nhận cảnh báo khi task bị quá hạn hoặc xung đột lịch trình</span>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};