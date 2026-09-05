import React, { useState } from 'react';
import {
  ShieldAlert,
  X,
  PhoneCall,
  Flame,
  Zap,
  Activity,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { SubBranchCode } from '../types';

interface RedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitIncident: (data: {
    title: string;
    category: 'FIRE_HAZARD' | 'ELECTRICAL' | 'CHEMICAL_SPILL' | 'INJURY' | 'DISPUTE_PR';
    subBranch: SubBranchCode;
    description: string;
    immediateAction: string;
  }) => void;
}

export const RedCodeModal: React.FC<RedCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmitIncident,
}) => {
  const [incidentTitle, setIncidentTitle] = useState('');
  const [category, setCategory] = useState<'FIRE_HAZARD' | 'ELECTRICAL' | 'CHEMICAL_SPILL' | 'INJURY' | 'DISPUTE_PR'>('FIRE_HAZARD');
  const [subBranch, setSubBranch] = useState<SubBranchCode>('SAF-3.2');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) return;
    onSubmitIncident({
      title: incidentTitle,
      category,
      subBranch,
      description,
      immediateAction: actionTaken,
    });
    setIncidentTitle('');
    setDescription('');
    setActionTaken('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-xl border border-rose-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Red Alert Header */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-700/80 rounded-lg animate-pulse">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-rose-800 tracking-wider font-bold">
                  PRIORITY 1 ESCALATION
                </span>
                <span className="text-xs font-mono text-rose-200">KÊNH 4: 462.6375 MHz</span>
              </div>
              <h2 className="text-lg font-black tracking-tight mt-0.5">
                QUY TRÌNH XỬ LÝ KHỦNG HOẢNG TỐI CẤP (RED CODE PROTOCOL)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-rose-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Emergency 5-Step Clinical Drill */}
          <div className="border border-rose-200 bg-rose-50/60 rounded-lg p-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-rose-800 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              5 BƯỚC HÀNH ĐỘNG TRỰC CHIẾN TỨC THÌ (BẮT BUỘC THỰC THI)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-md border border-rose-100 flex items-start gap-2.5">
                <span className="font-mono font-bold text-sm text-rose-600">01</span>
                <div>
                  <strong className="block text-slate-900 font-semibold">Phong Tỏa Hiện Trường:</strong>
                  <span className="text-slate-600">
                    Cách ly bán kính 5m, không cho người không có nhiệm vụ tiếp cận khu vực sự cố.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-rose-100 flex items-start gap-2.5">
                <span className="font-mono font-bold text-sm text-rose-600">02</span>
                <div>
                  <strong className="block text-slate-900 font-semibold">Cắt Nguồn Điện & Cô Lập:</strong>
                  <span className="text-slate-600">
                    Aptomat tổng lập tức OFF; cách ly hóa chất dung môi cồn IPA/Resin khỏi nguồn nhiệt.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-rose-100 flex items-start gap-2.5">
                <span className="font-mono font-bold text-sm text-rose-600">03</span>
                <div>
                  <strong className="block text-slate-900 font-semibold">Sơ Cứu Cấp Tốc (SAF-3.2):</strong>
                  <span className="text-slate-600">
                    Dùng bình CO2 dập lửa điện/nhựa (CẤM dùng nước). Bỏng hóa chất: rửa nước sạch liên tục 15 phút.
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-rose-100 flex items-start gap-2.5">
                <span className="font-mono font-bold text-sm text-rose-600">04</span>
                <div>
                  <strong className="block text-slate-900 font-semibold">Gọi Chi Viện Y Tế / PCCC:</strong>
                  <span className="text-slate-600">
                    Hotline Cấp cứu: <strong>115</strong> | PCCC: <strong>114</strong> | Y tế Trường: <strong>024.3854.499</strong>
                  </span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-rose-100 md:col-span-2 flex items-start gap-2.5">
                <span className="font-mono font-bold text-sm text-rose-600">05</span>
                <div>
                  <strong className="block text-slate-900 font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    Kỷ Luật Phát Ngôn (Rule of Single Point of Contact - SPOC):
                  </strong>
                  <span className="text-slate-600">
                    TUYỆT ĐỐI KHÔNG quay phim, chụp ảnh, livestream, hoặc chia sẻ thông tin lên mạng xã hội. Mọi thông tin phát ngôn DUY NHẤT thuộc về Trưởng Ban (Chief). Vi phạm sẽ bị tước thẻ ID Lab và kỷ luật đuổi khỏi tổ chức.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Incident Form 02 Trigger */}
          <form onSubmit={handleSubmit} className="border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                Ghi Nhận Sự Cố Khẩn Cấp (Form 02 Fast-Log)
              </h4>
              <span className="text-xs font-mono text-slate-500">Mã tự sinh: FORM02-REC-LIVE</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiêu đề sự cố / Tình trạng</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cháy chập nguồn máy in laser hoặc đổ vỡ cồn IPA..."
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Phân loại thảm họa</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="FIRE_HAZARD">Cháy nổ / Nguy cơ hỏa hoạn (Bình CO2)</option>
                  <option value="ELECTRICAL">Chập điện / Quá tải / Giật điện</option>
                  <option value="CHEMICAL_SPILL">Tràn đổ hóa chất / Axit / Dung môi Cồn</option>
                  <option value="INJURY">Tai nạn thương tích / Bỏng nhiệt / Cắt tay</option>
                  <option value="DISPUTE_PR">Khủng hoảng truyền thông / Tranh chấp ngoài</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tiểu ban thụ lý chính</label>
                <select
                  value={subBranch}
                  onChange={(e) => setSubBranch(e.target.value as SubBranchCode)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                >
                  <option value="SAF-3.2">SAF-3.2: An toàn, Hóa chất & PCCC</option>
                  <option value="PWR-3.1">PWR-3.1: Hạ tầng Điện & Mạng</option>
                  <option value="OPS-1.1">OPS-1.1: Kỹ thuật In 3D & Máy Chế tác</option>
                  <option value="LOG-4.2">LOG-4.2: Hậu cần Đồ nặng & Vận chuyển</option>
                  <option value="STG-5.1">STG-5.1: Điều phối Sân khấu & AV</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Biện pháp xử lý ngay tại chỗ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã dùng bình CO2 dập tắt lúc 10h12, ngắt aptomat số 3..."
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Mô tả chi tiết diễn biến & nhân chứng</label>
                <textarea
                  rows={2}
                  placeholder="Thời gian xảy ra, người phát hiện, các bước đã sơ cứu và hiện trạng..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Lưu Báo Cáo Sự Cố Khẩn
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
