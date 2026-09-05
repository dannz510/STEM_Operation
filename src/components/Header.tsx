import React, { useState, useEffect } from 'react';
import { Moon, Search, Sun, X, Bell, QrCode, AlertTriangle, Cloud, Settings, Menu } from 'lucide-react';
import { AppNotification, OperatingMode, EventPhase, TabKey, Member } from '../types';
import { Logo, Icons } from './brand';
import { RankBadge } from './RankBadge';

interface Props {
  mode: OperatingMode;
  eventPhase: EventPhase;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onToggleMode: () => void;
  onEventPhaseChange: (phase: EventPhase) => void;
  onOpenRedCode: () => void;
  onOpenQrScanner: () => void;
  onOpenWorkspace: () => void;
  onOpenSettings: () => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  activeMember: Member | undefined;
  members: Member[];
  onSelectActiveMember: (id: string) => void;
  activeLoanCount: number;
  unresolvedIncidentCount: number;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'DASHBOARD', label: 'Tổng quan', icon: <Icons.IconGrid size={13} /> },
  { key: 'ASSETS', label: 'Tài sản', icon: <Icons.IconBox size={13} /> },
  { key: 'LOANS', label: 'Mượn/Trả', icon: <Icons.IconClipboard size={13} /> },
  { key: 'ROSTER', label: 'Lịch trực', icon: <Icons.IconCalendar size={13} /> },
  { key: 'TASKS', label: 'Công việc', icon: <Icons.IconClipboard size={13} /> },
  { key: 'GAMIFICATION', label: 'Nhân sự', icon: <Icons.IconUsers size={13} /> },
  { key: 'EVENT', label: 'Sự kiện', icon: <Icons.IconActivity size={13} /> },
  { key: 'CODEX', label: 'Quy tắc', icon: <Icons.IconBook size={13} /> },
];

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export const Header: React.FC<Props> = ({
  mode,
  eventPhase,
  activeTab,
  onTabChange,
  onToggleMode,
  onEventPhaseChange,
  onOpenRedCode,
  onOpenQrScanner,
  onOpenWorkspace,
  onOpenSettings,
  notifications,
  onMarkNotificationRead,
  theme,
  onToggleTheme,
  activeMember,
  members,
  onSelectActiveMember,
  activeLoanCount,
  unresolvedIncidentCount,
}) => {
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const now = useClock();
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const date = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const isEvent = mode === 'EVENT';
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const filteredTabs = TABS.filter((tab) => tab.label.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  return (
    <header className="bento-header sticky top-0 z-40">
      {/* Top Command Control Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-13 border-b border-slate-200 dark:border-slate-800/80">
          {/* Brand Emblem & System Identifier */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2">
              <Logo size={28} variant="mark" />
              <div className="min-w-0 leading-none">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                    STEM.Lab
                  </span>
                  <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-bold">/OS</span>
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">
                  CHÂU THÀNH · COMMAND
                </div>
              </div>
            </div>

            {/* Operating Mode Indicator Badge */}
            <div className="hidden md:flex items-center">
              <span className={`signal-pill ${isEvent ? 'signal-critical' : 'signal-ready'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isEvent ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                {isEvent ? `EVENT · ${eventPhase}` : 'NORMAL OPS'}
              </span>
            </div>
          </div>

          {/* Center: System Telemetry Clock (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-600">SYS_TIME:</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">{time}</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>{date}</span>
          </div>

          {/* Right Action Tools & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Command Search (Ctrl+K) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors"
              title="Tìm kiếm nhanh (Ctrl+K)"
            >
              <Search size={13} className="text-slate-400" />
              <span className="hidden md:inline text-[11px]">Lệnh điều khiển</span>
              <kbd className="hidden sm:inline font-mono text-[9px] px-1 py-0.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Ctrl K
              </kbd>
            </button>

            {/* Dual Mode Switcher Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-0.5">
              <button
                onClick={() => mode !== 'NORMAL' && onToggleMode()}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                  !isEvent
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Chuyển sang Chế độ Thường nhật (In-Lab)"
              >
                Normal
              </button>
              <button
                onClick={() => mode !== 'EVENT' && onToggleMode()}
                className={`px-2 py-1 text-[10px] font-mono font-bold uppercase transition-all ${
                  isEvent
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
                title="Chuyển sang Chế độ Sự kiện (Field Live)"
              >
                Event
              </button>
            </div>

            {/* Event Phase Selector when in EVENT mode */}
            {isEvent && (
              <select
                value={eventPhase}
                onChange={(e) => onEventPhaseChange(e.target.value as EventPhase)}
                className="hidden sm:block text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 px-1.5 py-1 focus:outline-none"
              >
                <option value="D_MINUS_1">D-1 (Setup)</option>
                <option value="D_DAY">D-Day (Live)</option>
                <option value="D_PLUS_1">D+1 (Thu quân)</option>
                <option value="PRE_EVENT">Pre-Event</option>
                <option value="IN_EVENT">In-Event</option>
                <option value="POST_EVENT">Post-Event</option>
              </select>
            )}

            {/* User Profile / RBAC switcher */}
            <div className="relative">
              <button
                onClick={() => setMemberMenuOpen(!memberMenuOpen)}
                className="flex items-center gap-1.5 p-1 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-colors"
                title="Tài khoản & Định danh cá nhân"
              >
                <div className="w-6 h-6 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-mono font-bold flex items-center justify-center border border-slate-700 dark:border-slate-700">
                  {activeMember?.name ? activeMember.name.split(' ').slice(-1)[0][0] : '—'}
                </div>
                <div className="hidden lg:block text-left leading-none pr-1">
                  <div className="text-[11px] font-semibold text-slate-900 dark:text-white truncate max-w-[100px]">
                    {activeMember?.name || 'Chưa chọn'}
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeMember?.subBranchCode || 'OPS-1.1'}
                  </div>
                </div>
                {activeMember && <RankBadge rank={activeMember.rank} compact />}
              </button>

              {memberMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMemberMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-72 bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 z-40 shadow-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                        Định Danh Cá Nhân (RBAC)
                      </p>
                      {activeMember && (
                        <p className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">
                          {activeMember.name} · {activeMember.subBranchCode}
                        </p>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            onSelectActiveMember(m.id);
                            setMemberMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60 last:border-0 ${
                            m.id === activeMember?.id ? 'bg-sky-50/60 dark:bg-sky-950/30' : ''
                          }`}
                        >
                          <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center">
                            {m.name.split(' ').slice(-1)[0][0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                              {m.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 truncate">
                              {m.subBranchCode} · {m.rank}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Fast Utility Actions */}
            <button
              onClick={onOpenQrScanner}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              title="Quét mã QR tài sản"
            >
              <QrCode size={14} />
            </button>

            <button
              onClick={onToggleTheme}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              title={theme === 'light' ? 'Chuyển sang Dark Mode (Obsidian)' : 'Chuyển sang Light Mode (Clinical)'}
            >
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
                title="Thông báo hệ thống"
              >
                <Bell size={14} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center bg-sky-600 text-white font-mono text-[8px] font-bold px-0.5">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 mt-1 w-80 bg-white dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 z-40 shadow-xl overflow-hidden text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 font-mono text-[10px] uppercase font-bold text-slate-500">
                      Nhật Ký Thông Báo Hệ Thống
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-slate-400 font-mono text-xs">Không có thông báo mới.</p>
                      ) : (
                        notifications.slice(0, 6).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => onMarkNotificationRead(item.id)}
                            className="p-3 border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                              <span>{item.title}</span>
                              {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                              {item.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Red Code Alert Button */}
            <button
              onClick={onOpenRedCode}
              className={`p-1.5 border transition-colors flex items-center gap-1 ${
                unresolvedIncidentCount > 0
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 animate-pulse'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:border-rose-300'
              }`}
              title="Kích hoạt Báo động Khẩn cấp (RED CODE)"
            >
              <AlertTriangle size={14} className={unresolvedIncidentCount > 0 ? 'text-rose-600' : ''} />
              {unresolvedIncidentCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-rose-600">
                  {unresolvedIncidentCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
              title="Cấu hình hệ thống (Settings)"
            >
              <Settings size={14} />
            </button>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
              title="Menu di động"
            >
              <Menu size={14} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Rail: Clean, 1px indicators, generous spacing */}
        <nav className="hidden lg:flex items-center gap-1 h-10 overflow-x-auto text-xs font-medium">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  active
                    ? 'text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span className={active ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>

                {/* Sub-badge counters */}
                {tab.key === 'LOANS' && activeLoanCount > 0 && (
                  <span className="font-mono text-[9px] px-1 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold">
                    {activeLoanCount}
                  </span>
                )}

                {/* Active Indicator 1px line */}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-slate-900 dark:bg-sky-400" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Command Palette Modal (Ctrl+K) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-xs"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090D16] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 px-3.5 py-2.5">
              <Search className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên phân hệ hoặc thao tác nhanh..."
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
              <span className="font-mono text-[10px] text-slate-400 border border-slate-200 dark:border-slate-800 px-1 py-0.5">
                ESC
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto p-1 text-xs">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    onTabChange(tab.key);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sky-600 dark:text-sky-400">{tab.icon}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{tab.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">CHUYỂN TAB ↵</span>
                </button>
              ))}
              {filteredTabs.length === 0 && (
                <p className="p-6 text-center text-xs text-slate-400 font-mono">
                  Không tìm thấy thao tác phù hợp.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060913] p-2">
          <div className="grid grid-cols-4 gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  onTabChange(tab.key);
                  setMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center gap-1 p-2 text-[10px] font-mono font-medium border ${
                  activeTab === tab.key
                    ? 'border-slate-900 dark:border-sky-400 bg-slate-900 dark:bg-sky-950/40 text-white'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;