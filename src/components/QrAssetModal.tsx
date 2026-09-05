import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  X,
  Camera,
  ShieldCheck,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Printer,
} from 'lucide-react';
import { Asset } from '../types';

interface QrAssetModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleSeal: (assetId: string) => void;
  onOpenLoanForAsset: (asset: Asset) => void;
}

export const QrAssetModal: React.FC<QrAssetModalProps> = ({
  asset,
  isOpen,
  onClose,
  onToggleSeal,
  onOpenLoanForAsset,
}) => {
  const [activeTab, setActiveTab] = useState<'CARD' | 'PROOF' | 'MAINTENANCE'>('CARD');

  if (!isOpen || !asset) return null;

  const formatVnd = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  const qrValue = `${window.location.origin}/assets/${encodeURIComponent(asset.code)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-sky-400" />
            <div>
              <span className="text-[11px] font-mono text-sky-300 font-bold uppercase tracking-wider block">
                THẺ ĐỊNH DANH TÀI SẢN KỸ THUẬT SỐ // ISO 5S
              </span>
              <h3 className="text-sm font-bold tracking-tight text-white">{asset.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('CARD')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'CARD'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Thẻ QR & Thông Tin
          </button>
          <button
            onClick={() => setActiveTab('PROOF')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'PROOF'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Quy Trình Minh Chứng 3 Lớp
          </button>
          <button
            onClick={() => setActiveTab('MAINTENANCE')}
            className={`py-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'MAINTENANCE'
                ? 'border-sky-600 text-sky-700 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Lịch Sử Bảo Trì & Hiệu Chuẩn
          </button>
        </div>

        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {activeTab === 'CARD' && (
            <div className="space-y-4">
              {/* Virtual Printed Asset Tag */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center justify-center p-2 bg-white rounded border border-slate-200 shadow-2xs">
                  <QRCodeSVG
                    value={qrValue}
                    size={112}
                    level="M"
                    marginSize={2}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    title={`Asset ${asset.code}`}
                  />
                  <span className="font-mono text-[10px] font-bold text-slate-700 mt-1">
                    {asset.qrCode}
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      MÃ: {asset.code}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                        asset.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : asset.status === 'IN_USE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {asset.status === 'AVAILABLE'
                        ? 'SẴN SÀNG'
                        : asset.status === 'IN_USE'
                        ? 'ĐANG MƯỢN'
                        : 'BẢO TRÌ'}
                    </span>
                  </div>

                  <div className="font-medium text-slate-800">
                    <strong>Số Serial:</strong> <span className="font-mono">{asset.serialNumber}</span>
                  </div>
                  <div className="font-medium text-slate-800">
                    <strong>Tiểu ban phụ trách:</strong> <span className="font-mono">{asset.branchOwner}</span>
                  </div>
                  <div className="font-medium text-slate-800">
                    <strong>Vị trí 5S:</strong> {asset.location}
                  </div>
                  <div className="font-medium text-slate-800">
                    <strong>Giá trị thẩm định:</strong>{' '}
                    <span className="font-mono font-bold text-slate-900">{formatVnd(asset.valueVnd)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-600">Niêm phong:</span>
                    <button
                      onClick={() => onToggleSeal(asset.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                        asset.sealStatus === 'SEALED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {asset.sealStatus === 'SEALED' ? (
                        <>
                          <Lock className="w-3 h-3" /> ĐÃ NIÊM PHONG
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" /> CHƯA NIÊM PHONG
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-600" />
                  Thông Số Kỹ Thuật & Cấu Hình Vận Hành
                </h4>
                <p className="text-slate-700 bg-white p-2.5 rounded border border-slate-100 font-mono text-[11px]">
                  {asset.specifications}
                </p>
                <div className="text-[11px] text-slate-500 italic">
                  <strong>Ghi chú kiểm tra:</strong> {asset.notes}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PROOF' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <h4 className="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  Quy Chuẩn Đối Soát 3 Lớp (Bảo Vệ Tài Sản Không Thất Thoát)
                </h4>
                <p className="text-sky-800 text-[11px]">
                  Áp dụng cho toàn bộ thiết bị giá trị cao &gt; 5.000.000 VNĐ khi luân chuyển hoặc mượn ra khỏi Lab.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-slate-700" />
                      Lớp 1: CCTV Timestamp & Hình Ảnh Hiện Trạng
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ĐÃ ĐỐI SOÁT
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Hệ thống tự động liên kết mã ghi hình camera tại cửa kho khi quét mã QR lúc bàn giao hoặc nhận hoàn trả.
                  </p>
                  <div className="font-mono text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded">
                    Mã CCTV tham chiếu: CAM-01-LAB-REC-20250305-0830
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-slate-700" />
                      Lớp 2: Biên Bản Giám Định Kỹ Thuật (Form 01)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> HOÀN TẤT
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Thủ kho tiểu ban AST-2.1 và Người mượn cùng kiểm tra ngoại quan (vỏ máy, phụ kiện cáp nguồn, đầu đùn/que đo).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-slate-700" />
                      Lớp 3: Đối Soát Hồ Sơ Số Hóa (Cloud Ledger)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> KHỚP 100%
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Đồng bộ trạng thái tức thì lên cơ sở dữ liệu và bảng Google Sheets quản trị tài sản phòng Lab.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MAINTENANCE' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-900">Lần hiệu chuẩn gần nhất:</span>
                <span className="font-mono text-sky-700 font-bold">{asset.lastMaintenance}</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-mono">2025-02-28:</strong>
                    <span className="text-slate-600 ml-1">
                      Hiệu chuẩn cân bằng bàn nhiệt, vệ sinh trục z và bôi mỡ chuyên dụng Magnalube.
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5" />
                  <div>
                    <strong className="text-slate-800 font-mono">2025-01-10:</strong>
                    <span className="text-slate-600 ml-1">
                      Kiểm định định kỳ đầu năm; dán tem niêm phong an toàn số AST-2025-S09.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-white cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            In Tem Mã Vạch QR
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Đóng
            </button>
            {asset.status === 'AVAILABLE' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLoanForAsset(asset);
                }}
                className="px-3.5 py-1.5 rounded font-bold text-white bg-sky-600 hover:bg-sky-700 cursor-pointer shadow-xs"
              >
                Lập Phiếu Mượn (Form 01)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
