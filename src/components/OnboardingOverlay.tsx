import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, QrCode, Sparkles, Target, X } from 'lucide-react';

interface OnboardingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  onOpenTasks: () => void;
}

const steps = [
  { title: 'Bắt đầu với Quét Nhanh', text: 'Quét QR để mở hồ sơ thiết bị, mượn/trả hoặc báo hỏng trong một luồng duy nhất.', icon: QrCode },
  { title: 'Theo dõi công việc', text: 'Tạo task, chuyển trạng thái Kanban và kiểm tra lịch trùng trước khi xác nhận ca.', icon: Target },
  { title: 'Xây Rank bằng hành động tốt', text: 'Điểm, badge và leaderboard phản ánh tiến độ vận hành minh bạch, không phải hoạt động ảo.', icon: Sparkles },
];

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ isOpen, onClose, onOpenScanner, onOpenTasks }) => {
  const [step, setStep] = useState(0);
  if (!isOpen) return null;
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  const finish = () => {
    if (isLast) {
      onClose();
      return;
    }
    setStep((currentStep) => currentStep + 1);
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <section className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky-700">Newbie starter quest · {step + 1}/{steps.length}</span><button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700" title="Bỏ qua"><X className="h-4 w-4" /></button></div>
        <div className="mt-5 grid h-14 w-14 place-items-center bg-sky-50 text-sky-700"><Icon className="h-7 w-7" /></div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">{current.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{current.text}</p>
        <div className="mt-5 flex gap-1">{steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 ${index <= step ? 'bg-sky-600' : 'bg-slate-200'}`} />)}</div>
        <div className="mt-5 flex items-center justify-between"><button type="button" onClick={onClose} className="text-xs font-bold text-slate-500">Bỏ qua hướng dẫn</button><button type="button" onClick={finish} className="flex items-center gap-2 bg-sky-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-800">{isLast ? <><CheckCircle2 className="h-4 w-4" />Hoàn tất</> : <><ArrowRight className="h-4 w-4" />Tiếp tục</>}</button></div>
        </section>
    </div>
  );
};
