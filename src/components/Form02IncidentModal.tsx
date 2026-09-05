import React, { useState } from 'react';
import {
  FileSpreadsheet,
  X,
  AlertTriangle,
  Flame,
  Zap,
  Wrench,
  Shield,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { IncidentReport, SubBranchCode, Member } from '../types';

interface Form02IncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMember?: Member;
  allMembers: Member[];
  onSubmitIncident: (data: Omit<IncidentReport, 'id' | 'code'>) => void;
}

export const Form02IncidentModal: React.FC<Form02IncidentModalProps> = ({
  isOpen,
  onClose,
  activeMember,
  allMembers,
  onSubmitIncident,
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'RED_CODE'>('LEVEL_2');
  const [category, setCategory] = useState<'EQUIPMENT_DAMAGE' | 'ELECTRICAL' | 'FIRE_HAZARD' | 'CHEMICAL_SPILL' | 'INJURY' | 'DISPUTE_PR'>('EQUIPMENT_DAMAGE');
  const [subBranch, setSubBranch] = useState<SubBranchCode>('OPS-1.1');
  const [description, setDescription] = useState('');
  const [immediateAction, setImmediateAction] = useState('');
  const [compensationVnd, setCompensationVnd] = useState(0);
  const [reporterPhone, setReporterPhone] = useState(activeMember?.phone || '0912.000.111');
  const [spocContact, setSpocContact] = useState(`Trưởng Ban Chỉ Huy (Chief - 0912.445.889)`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const d = new Date();
    const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

    onSubmitIncident({
      title,
      severity,
      category,
      subBranch,
      description,
      immediateAction: immediateAction || 'Đã cách ly thiết bị và báo cáo chỉ huy trực ca.',
      damageCompensationVnd: Number(compensationVnd) || 0,
      reporterName: activeMember?.name || 'System',
      reporterPhone,
      status: 'OPEN',
      timestamp,
      singlePointOfContact: spocContact,
    });

    onClose();
  };

  const severityExplanations = {
    LEVEL_1: {
      label: 'Mức 1: Hỏng Hóc Thẩm Mỹ / Xước Nhẹ',
      desc: 'Trầy xước vỏ, bong tem mã vạch. Xử lý: Nhắc nhở, dán lại tem trong 24h. Trừ 5 điểm.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    LEVEL_2: {
      label: 'Mức 2: Hỏng Linh Kiện Hao Mòn / Thay Thế',
      desc: 'Nghẹt nozzle, đứt dây đai, que đo gãy chốt. Xử lý: Thay từ kho FIN-2.2, kiểm điểm ca trực. Trừ 10-15 điểm.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    LEVEL_3: {
      label: 'Mức 3: Hỏng Cấu Trúc / Chập Cháy Nặng',
      desc: 'Cháy bo mạch chính, nứt vỡ bàn nhiệt, biến dạng khung máy. Xử lý: Hội đồng thẩm định, bồi thường 30-50% chi phí. Trừ 30 điểm.',
      color: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    RED_CODE: {
      label: 'Mức 4 / RED CODE: Thảm Họa / Phá Hủy Hoàn Toàn',
      desc: 'Cháy nổ, đổ vỡ cồn lan rộng, thiết bị phá hủy 100%. Bồi thường 100% giá trị thẩm định, tước thẻ ID, cấm vào Lab.',
      color: 'bg-rose-50 text-rose-800 border-rose-300 font-bold',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-900 font-bold">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold border border-amber-800">
                  FORM 02
                </span>
                <span className="text-xs text-slate-400 font-mono">INCIDENT ASSESSMENT</span>
              </div>
              <h3 className="text-sm font-bold tracking-tight text-white mt-0.5">
                Biên Bản Giám Định Sự Cố & Phân Cấp Hỏng Hóc
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[78vh] overflow-y-auto space-y-4 text-xs">
          {/* Severity Classification */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-900">
              1. Phân Cấp Mức Độ Nghiêm Trọng (Theo Điều Lệ Lab)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'RED_CODE'] as const).map((lvl) => {
                const info = severityExplanations[lvl];
                return (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setSeverity(lvl)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      severity === lvl
                        ? `${info.color} ring-2 ring-sky-500 shadow-xs`
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold font-mono text-[11px] block">{info.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block leading-tight">
                      {info.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Tên sự cố / Mô tả tóm tắt (*)</label>
              <input
                type="text"
                required
                placeholder="VD: Rơi vỡ bàn kính máy in 3D trong quá trình gỡ mẫu in..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Loại hình rủi ro</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
              >
                <option value="EQUIPMENT_DAMAGE">Hư hỏng máy móc / Thiết bị (FDM/Resin/Laser)</option>
                <option value="ELECTRICAL">Chập điện / Quá tải / Đứt cáp nguồn</option>
                <option value="FIRE_HAZARD">Hỏa hoạn / Bốc khói pin / Bình CO2</option>
                <option value="CHEMICAL_SPILL">Tràn đổ dung môi IPA / Axit tẩy mạch</option>
                <option value="INJURY">Tai nạn vết thương / Cắt tay / Bỏng nhiệt</option>
                <option value="DISPUTE_PR">Tranh chấp đồ đạc / Khủng hoảng phát ngôn</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Tiểu ban thụ lý</label>
              <select
                value={subBranch}
                onChange={(e) => setSubBranch(e.target.value as SubBranchCode)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 font-mono"
              >
                <option value="OPS-1.1">OPS-1.1: Kỹ thuật In 3D & Chế tác</option>
                <option value="AST-2.1">AST-2.1: Quản lý Tài sản & Thiết bị</option>
                <option value="FIN-2.2">FIN-2.2: Vật tư Tiêu hao & Dự toán</option>
                <option value="PWR-3.1">PWR-3.1: Hạ tầng Điện & Mạng</option>
                <option value="SAF-3.2">SAF-3.2: An toàn, Hóa chất & PCCC</option>
                <option value="LOG-4.2">LOG-4.2: Hậu cần Đồ nặng & Vận chuyển</option>
                <option value="STG-5.1">STG-5.1: Sân khấu & Kỹ thuật Âm thanh</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Mô tả chi tiết nguyên nhân & hiện trường</label>
              <textarea
                rows={2}
                placeholder="Nguyên nhân chủ quan/khách quan, mã serial máy, thời điểm phát hiện..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Biện pháp khắc phục đã triển khai</label>
              <textarea
                rows={2}
                placeholder="VD: Đã gỡ bỏ mảnh vỡ kính, cách ly dây cắm nguồn, thay bàn phụ từ kho AST..."
                value={immediateAction}
                onChange={(e) => setImmediateAction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Dự toán bồi thường thiệt hại (VNĐ)</label>
              <input
                type="number"
                step={50000}
                placeholder="0"
                value={compensationVnd}
                onChange={(e) => setCompensationVnd(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Đầu mối phát ngôn độc quyền (SPOC)</label>
              <input
                type="text"
                value={spocContact}
                onChange={(e) => setSpocContact(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-sky-500 text-[11px]"
              />
            </div>
          </div>

          {/* SPOC Notice */}
          <div className="p-3 bg-slate-100 rounded-lg text-slate-600 text-[11px] leading-relaxed">
            <strong>Nguyên tắc phát ngôn SPOC:</strong> Không cá nhân nào được tự ý đưa ra kết luận hoặc chia sẻ hình ảnh hiện trường ra bên ngoài trước khi có chữ ký phê chuẩn của Hội đồng Kỹ thuật và Ban Chủ nhiệm Lab.
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-md font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Lưu Biên Bản Giám Định (Form 02)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
