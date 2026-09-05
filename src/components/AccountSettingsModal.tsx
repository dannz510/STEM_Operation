import React, { useState } from 'react';
import { Bell, KeyRound, Palette, ShieldCheck, UserRound, X } from 'lucide-react';
import { Member } from '../types';
import { RankBadge } from './RankBadge';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUpdateMember: (member: Member) => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  member,
  theme,
  onToggleTheme,
  onUpdateMember,
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
  const [name, setName] = useState(member?.name ?? '');
  const [phone, setPhone] = useState(member?.phone ?? '');
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const saveProfile = () => {
    if (!member || !name.trim()) return;
    onUpdateMember({ ...member, name: name.trim(), phone });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-[65] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section className="w-full max-w-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
          <div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">Account hub</p><h2 className="mt-1 text-base font-bold">Cài đặt tài khoản</h2></div>
          <button type="button" onClick={onClose} className="p-1 text-slate-300 hover:text-white" title="Đóng"><X className="h-4 w-4" /></button>
        </header>
        <div className="flex border-b border-slate-200 bg-slate-50 px-4">
          {[
            ['PROFILE', 'Hồ sơ', UserRound],
            ['SECURITY', 'Bảo mật', ShieldCheck],
            ['NOTIFICATIONS', 'Thông báo', Bell],
          ].map(([key, label, Icon]) => (
            <button key={key as string} type="button" onClick={() => setActiveTab(key as typeof activeTab)} className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-bold ${activeTab === key ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500'}`}><Icon className="h-3.5 w-3.5" />{label as string}</button>
          ))}
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          {activeTab === 'PROFILE' && <>
            <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-3">
              <div className="grid h-12 w-12 place-items-center bg-slate-900 text-lg font-bold text-white">{member?.name?.split(' ').slice(-2).map((part) => part[0]).join('') || '?'}</div>
              <div className="flex-1"><strong className="text-sm text-slate-900">{member?.name || 'Chưa chọn thành viên'}</strong><p className="mt-1 text-[10px] text-slate-500">{member?.email || 'Local demo profile'}</p></div>
              {member && <RankBadge rank={member.rank} points={member.meritPoints} />}
            </div>
            <label className="block text-xs font-semibold text-slate-700">Tên hiển thị<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label>
            <label className="block text-xs font-semibold text-slate-700">Số điện thoại<input value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 text-sm" /></label>
            <div className="flex items-center justify-between border border-slate-200 p-3"><div><p className="text-xs font-bold text-slate-800">Giao diện</p><p className="text-[10px] text-slate-500">{theme === 'light' ? 'Light Mode · Clinical Clean' : 'Dark Mode · Cyber Navy'}</p></div><button type="button" onClick={onToggleTheme} className="border border-slate-300 px-3 py-1.5 text-xs font-bold"><Palette className="mr-1 inline h-3.5 w-3.5" />Đổi theme</button></div>
            <button type="button" onClick={saveProfile} className="bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800">{saved ? 'Đã lưu' : 'Lưu hồ sơ'}</button>
          </>}
          {activeTab === 'SECURITY' && <div className="space-y-3"><div className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-3"><ShieldCheck className="h-5 w-5 text-emerald-700" /><div><strong className="text-xs text-emerald-900">Phiên Supabase Auth</strong><p className="text-[10px] text-emerald-700">Session được refresh tự động và token không lưu trong localStorage của ứng dụng.</p></div></div><button type="button" className="flex w-full items-center gap-2 border border-slate-300 px-3 py-2 text-left text-xs font-bold text-slate-700"><KeyRound className="h-4 w-4 text-sky-700" />Thiết lập 2FA Authenticator</button><div className="border border-slate-200 p-3"><p className="text-xs font-bold text-slate-800">Thiết bị đang đăng nhập</p><p className="mt-1 text-[10px] text-slate-500">Thiết bị hiện tại · Phiên hoạt động</p></div></div>}
          {activeTab === 'NOTIFICATIONS' && <div className="space-y-2">{[['Task mới', emailEnabled, setEmailEnabled], ['Nhắc hạn mượn/trả', pushEnabled, setPushEnabled]].map(([label, checked, setter]) => <label key={label as string} className="flex items-center justify-between border border-slate-200 p-3 text-xs font-semibold text-slate-700"><span className="flex items-center gap-2"><Bell className="h-4 w-4 text-sky-700" />{label as string}</span><input type="checkbox" checked={checked as boolean} onChange={(event) => (setter as React.Dispatch<React.SetStateAction<boolean>>)(event.target.checked)} /></label>)}<p className="pt-2 text-[10px] text-slate-500">Thiết lập được lưu local trong demo và sẽ đồng bộ notification_preferences khi Supabase workspace được bật.</p></div>}
        </div>
      </section>
    </div>
  );
};
