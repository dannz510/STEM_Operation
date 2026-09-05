import React, { useEffect, useRef, useState } from 'react';
import { Camera, CheckCircle2, Keyboard, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (value: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onDetected }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const scanner = new Html5Qrcode('asset-qr-reader');
    scannerRef.current = scanner;
    setCameraError('');
    setIsScanning(true);

    void scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (!active) return;
          active = false;
          onDetected(decodedText);
          void scanner.stop().catch(() => undefined);
        },
        () => undefined,
      )
      .catch(() => {
        if (active) {
          setCameraError('Không thể mở camera. Hãy cấp quyền camera hoặc nhập mã tài sản thủ công.');
          setIsScanning(false);
        }
      });

    return () => {
      active = false;
      setIsScanning(false);
      if (scannerRef.current?.isScanning) {
        void scannerRef.current.stop().catch(() => undefined);
      }
      scannerRef.current = null;
    };
  }, [isOpen, onDetected]);

  if (!isOpen) return null;

  const handleManualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualCode.trim()) return;
    onDetected(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <section className="w-full max-w-md overflow-hidden border border-slate-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-sky-300" />
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-sky-300">Asset action flow</p>
              <h2 className="text-sm font-bold">Quét mã tài sản</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-300 hover:text-white" title="Đóng">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="overflow-hidden border border-slate-200 bg-slate-950">
            <div id="asset-qr-reader" className="min-h-[280px]" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            {isScanning ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Camera className="h-3.5 w-3.5" />}
            {cameraError || (isScanning ? 'Đưa QR vào khung để quét.' : 'Đang chờ camera...')}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            fallback
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <label className="relative flex-1">
              <Keyboard className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Nhập AST-..."
                className="w-full border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </label>
            <button type="submit" className="bg-sky-700 px-3 text-xs font-bold text-white hover:bg-sky-800">Mở</button>
          </form>
        </div>
      </section>
    </div>
  );
};
