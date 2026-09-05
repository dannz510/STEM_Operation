import React, { useState, useEffect } from 'react';
import { Logo, Icons } from './brand';

export interface GoogleWorkspaceLink {
  id: string;
  service: 'drive' | 'docs' | 'sheets' | 'forms' | 'calendar' | 'gmail' | 'tasks';
  label: string;
  url: string;
  description: string;
  addedAt: string;
  addedBy?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICE_META: Record<GoogleWorkspaceLink['service'], { label: string; icon: React.ReactNode; color: string }> = {
  drive: {
    label: 'Google Drive',
    icon: <Icons.IconCloud size={16} />,
    color: '#FBBC04',
  },
  docs: {
    label: 'Google Docs',
    icon: <Icons.IconDoc size={16} />,
    color: '#4285F4',
  },
  sheets: {
    label: 'Google Sheets',
    icon: <Icons.IconSheet size={16} />,
    color: '#34A853',
  },
  forms: {
    label: 'Google Forms',
    icon: <Icons.IconForm size={16} />,
    color: '#A142F4',
  },
  calendar: {
    label: 'Calendar',
    icon: <Icons.IconCalendar size={16} />,
    color: '#EA4335',
  },
  gmail: {
    label: 'Gmail',
    icon: <Icons.IconInbox size={16} />,
    color: '#EA4335',
  },
  tasks: {
    label: 'Tasks',
    icon: <Icons.IconCheck size={16} />,
    color: '#4285F4',
  },
};

const STORAGE_KEY = 'stem_v3_google_links';

export const GoogleWorkspaceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [links, setLinks] = useState<GoogleWorkspaceLink[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [service, setService] = useState<GoogleWorkspaceLink['service']>('drive');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  }, [links]);

  if (!isOpen) return null;

  const handleAdd = () => {
    setError('');
    if (!label.trim() || !url.trim()) {
      setError('Vui lòng nhập đầy đủ Tên và URL');
      return;
    }
    try {
      const u = new URL(url.trim());
      if (!/google\.com|docs\.google|drive\.google|sheets\.google|forms\.google|calendar\.google|mail\.google/.test(u.hostname)) {
        setError('URL phải thuộc tên miền Google (docs.google.com, drive.google.com, ...)');
        return;
      }
    } catch {
      setError('URL không hợp lệ');
      return;
    }

    const newLink: GoogleWorkspaceLink = {
      id: `GWS-${Date.now()}`,
      service,
      label: label.trim(),
      url: url.trim(),
      description: description.trim(),
      addedAt: new Date().toISOString(),
    };
    setLinks([newLink, ...links]);
    setLabel('');
    setUrl('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const groupedByService = links.reduce<Record<string, GoogleWorkspaceLink[]>>((acc, link) => {
    (acc[link.service] ||= []).push(link);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Logo size={28} variant="mark" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">OPS · 1.1 · Leadership</p>
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">Google Workspace — Trung tâm kết nối</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded transition-colors text-slate-500">
            <Icons.IconX size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* LEFT: Add new link */}
          <section className="lg:col-span-2 p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Thêm liên kết mới</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Dịch vụ</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(SERVICE_META) as GoogleWorkspaceLink['service'][]).map((s) => {
                    const meta = SERVICE_META[s];
                    return (
                      <button
                        key={s}
                        onClick={() => setService(s)}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs font-medium transition-all ${
                          service === s
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span style={{ color: service === s ? '#fff' : meta.color }}>{meta.icon}</span>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên hiển thị <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="VD: Master Sheet Tài sản 2026"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL Google <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm font-mono focus:outline-none focus:border-slate-900 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:border-slate-900 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700">
                  <Icons.IconAlertTriangle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-1.5 bg-slate-900 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-slate-800 transition-colors"
              >
                <Icons.IconPlus size={14} />
                Lưu liên kết
              </button>
            </div>
          </section>

          {/* RIGHT: List */}
          <section className="lg:col-span-3 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Đã kết nối ({links.length})
              </h3>
            </div>

            {links.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-lg py-12 px-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 mb-3 text-slate-400">
                  <Icons.IconCloud size={20} />
                </div>
                <p className="text-sm text-slate-600 font-medium">Chưa có liên kết nào</p>
                <p className="text-xs text-slate-400 mt-1">Thêm Drive/Docs/Sheets/Forms để Ban Chỉ Huy truy cập nhanh.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedByService).map(([svc, items]) => {
                  const meta = SERVICE_META[svc as GoogleWorkspaceLink['service']];
                  return (
                    <div key={svc}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span style={{ color: meta.color }}>{meta.icon}</span>
                        <span className="text-xs font-bold text-slate-700">{meta.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">{items.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {items.map((link) => (
                          <div
                            key={link.id}
                            className="group flex items-start gap-3 px-3 py-2.5 bg-white border border-slate-100 hover:border-slate-300 rounded-lg transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-sm font-semibold text-slate-900 hover:text-slate-700 truncate"
                              >
                                {link.label}
                              </a>
                              {link.description && (
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{link.description}</p>
                              )}
                              <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{link.url}</p>
                            </div>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Icons.IconExternal size={14} />
                            </a>
                            <button
                              onClick={() => handleDelete(link.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Icons.IconX size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default GoogleWorkspaceModal;