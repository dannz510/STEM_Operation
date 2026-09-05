import React, { useState } from 'react';
import {
  Swords,
  Radio,
  Tv,
  Layers,
  Wrench,
  Flame,
  Zap,
  Clock,
  ShieldAlert,
  Wifi,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { EventPhase } from '../../types';

interface EventArenaTabProps {
  eventPhase: EventPhase;
  onSetEventPhase: (phase: EventPhase) => void;
  onOpenRedCode: () => void;
}

export const EventArenaTab: React.FC<EventArenaTabProps> = ({
  eventPhase,
  onSetEventPhase,
  onOpenRedCode,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ARENA' | 'STAGE' | 'RADIO' | 'RESCUE'>('ARENA');
  const [radioChannel, setRadioChannel] = useState<'CH1' | 'CH2' | 'CH3'>('CH1');

  const cueSheetItems = [
    { time: '07:00 - 07:30', task: 'Kiểm tra hạ tầng điện 3 pha & UPS nguồn dự phòng cho màn LED', lead: 'PWR-3.1', status: 'HOÀN TẤT' },
    { time: '07:30 - 08:00', task: 'Đo kiểm độ phẳng sa bàn, test camera góc rộng sa bàn thi đấu', lead: 'ARE-1.2', status: 'HOÀN TẤT' },
    { time: '08:00 - 08:30', task: 'Đón tiếp đại biểu VIP, phát bộ đàm Call-Signs cho Ban Chỉ Huy', lead: 'PRO-4.3', status: 'HOÀN TẤT' },
    { time: '08:30 - 09:00', task: 'Lễ khai mạc: Âm thanh, micro MC, clip giới thiệu trên màn LED', lead: 'STG-5.1', status: 'ĐANG DIỄN RA' },
    { time: '09:00 - 11:30', task: 'Các trận đấu vòng bảng Robocon diễn ra đồng thời tại 2 sân', lead: 'ARE-1.2', status: 'CHUẨN BỊ' },
    { time: '11:30 - 12:00', task: 'Phục vụ suất ăn nhanh, kiểm kê an toàn cháy nổ khu vực Pit', lead: 'LOG-4.2', status: 'CHỜ' },
  ];

  return (
    <div className="space-y-3.5">
      {/* Top Event Operations Header Banner */}
      <div className="bento-card p-3.5 bg-slate-900 border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-none">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-rose-400 border border-slate-700">
                D-DAY COMMAND OPS // TÁC CHIẾN HIỆN TRƯỜNG
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">11 TIỂU BAN RA MẶT ĐẤT</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-white mt-1">
              Trung Tâm Điều Hành Tác Chiến Hiện Trường (Event Arena)
            </h3>
          </div>
        </div>

        {/* Event Phase Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded border border-slate-800 text-xs font-mono shrink-0">
          {(['D_MINUS_1', 'D_DAY', 'D_PLUS_1'] as EventPhase[]).map((phase) => (
            <button
              key={phase}
              type="button"
              onClick={() => onSetEventPhase(phase)}
              className={`px-3 py-1 rounded cursor-pointer transition-all text-[10px] font-bold uppercase ${
                eventPhase === phase
                  ? 'bg-sky-600 text-white font-mono'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {phase === 'D_MINUS_1' ? 'D-1 (SETUP)' : phase === 'D_DAY' ? 'D-DAY (TRỰC CHIẾN)' : 'D+1 (THU QUÂN)'}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="inline-flex rounded p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider">
          <button
            type="button"
            onClick={() => setActiveSubTab('ARENA')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ARENA'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Sa Bàn (ARE-1.2)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('STAGE')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'STAGE'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Sân Khấu & Cue Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('RADIO')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'RADIO'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Mạng Bộ Đàm</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('RESCUE')}
            className={`px-3 py-1.5 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSubTab === 'RESCUE'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Cứu Trợ 15 Phút</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenRedCode}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer flex items-center gap-1.5 transition-colors border border-rose-500/40"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>KÍCH HOẠT RED CODE</span>
        </button>
      </div>

      {/* 1. ARENA & SA BÀN SUB-TAB */}
      {activeSubTab === 'ARENA' && (
        <div className="space-y-3.5">
          <div className="bento-card p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Sơ Đồ Bố Trí Mặt Bằng Sa Bàn Thi Đấu (Arena Floor Plan)
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Nhà thi đấu đa năng • Kích thước 24m x 15m • Tiêu chuẩn thi đấu Robocon STEM
                </p>
              </div>
              <span className="font-mono text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                ARE-1.2 & LAY-4.1
              </span>
            </div>

            {/* Visual Arena Layout Grid */}
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-white font-mono text-xs space-y-3.5">
              <div className="flex flex-wrap justify-between items-center gap-2 text-slate-400 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  [MẶT BẰNG CHÍNH] KHU THI ĐẤU KHÔNG GIAN KÍN
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  NGUỒN CẤP ỔN ĐỊNH: 220V - 100A (3 PHA CHÍNH)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                {/* Pit area */}
                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 font-bold text-xs">KHU VỰC PIT KỸ THUẬT</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">32 BÀN</span>
                  </div>
                  <p className="text-[10px] text-slate-300">Khu vực căn chỉnh và chuẩn bị robot cho các đội thi.</p>
                  <div className="text-[9px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800">
                    <div>• Ổ cắm 220V/5A tại từng bàn</div>
                    <div>• 04 Trạm hàn hakko 936 cố định</div>
                  </div>
                </div>

                {/* Main arena */}
                <div className="p-3 bg-sky-950/40 rounded border-2 border-sky-500 space-y-1 text-left relative overflow-hidden">
                  <div className="absolute -right-2 -top-2 w-10 h-10 bg-sky-500/10 rounded-full blur-xs"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-300 font-bold text-xs">SA BÀN THI ĐẤU CHÍNH</span>
                    <span className="text-[9px] bg-sky-600 text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-bold">8m x 4m • Mặt gỗ MDF phủ bạt PVC bóng</p>
                  <div className="text-[9px] text-sky-200/80 space-y-0.5 pt-1 border-t border-sky-900">
                    <div>• 02 Camera góc rộng truyền thẳng LED</div>
                    <div>• Cảm biến laser tính giờ tự động (ARE-1.2)</div>
                  </div>
                </div>

                {/* Audience area */}
                <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold text-xs">KHÁN ĐÀI & KHU VIP</span>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">280 CHỖ</span>
                  </div>
                  <p className="text-[10px] text-slate-300">250 GhGhế khán giả + 30 Khách mời & Ban Giám khảo.</p>
                  <div className="text-[9px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800">
                    <div>• Rào chắn an ninh 2m quanh sân</div>
                    <div>• Kiểm soát vé ra vào QR do SEC-4.2 phụ trách</div>
                  </div>
                </div>
              </div>

              {/* Security & Safety Telemetry Bar */}
              <div className="p-2.5 bg-slate-900/90 rounded border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  Sơ cứu y tế: <strong className="text-white">Cửa Đông (SAF-3.2)</strong>
                </span>
                <span>Bình chữa cháy CO2: <strong className="text-white">4 Điểm góc sa bàn</strong></span>
                <span>Chỉ huy sa bàn: <strong className="text-white">Trần Quốc Toản (ARE-1.2)</strong></span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Wifi className="w-3 h-3" />
                  Mesh Network: <strong>5.0 GHz Kênh 36</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STAGE & CUE SHEET SUB-TAB */}
      {activeSubTab === 'STAGE' && (
        <div className="bento-card p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Kịch Bản Điều Phối Sân Khấu & Cue Sheet Chi Tiết (STG-5.1)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Lịch trình phối hợp âm thanh, ánh sáng, màn hình LED và chỉ huy MC
              </p>
            </div>
            <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
              D-DAY TIMELINE
            </span>
          </div>

          <div className="space-y-2">
            {cueSheetItems.map((cue, index) => (
              <div
                key={index}
                className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px]">
                      {cue.time}
                    </span>
                    <strong className="text-slate-900 dark:text-white text-xs">{cue.task}</strong>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-mono">
                    Đơn vị phụ trách: <strong className="text-slate-700 dark:text-slate-300">{cue.lead}</strong>
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap self-start sm:self-center ${
                    cue.status === 'HOÀN TẤT'
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      : cue.status === 'ĐANG DIỄN RA'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold'
                      : cue.status === 'CHUẨN BỊ'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cue.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RADIO & CALL SIGN SUB-TAB */}
      {activeSubTab === 'RADIO' && (
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { ch: 'CH1', name: 'KÊNH 1: TỔNG CHỈ HUY & AN NINH', desc: 'Dành riêng cho Chief, Lead các tiểu ban, SPOC an toàn và tiếp đón VIP.', freq: 'UHF 462.5625 MHz' },
              { ch: 'CH2', name: 'KÊNH 2: KỸ THUẬT SA BÀN & CỨU HỘ', desc: 'Dành cho đội kỹ thuật 3D, sa bàn, sửa chữa robot 15 phút, điện PWR-3.1.', freq: 'UHF 462.5875 MHz' },
              { ch: 'CH3', name: 'KÊNH 3: HẬU CẦN & KHÁNH TIẾT', desc: 'Dành cho tiếp tế suất ăn, đón khách VIP, trao giải, micro MC.', freq: 'UHF 462.6125 MHz' },
            ].map((c) => (
              <div
                key={c.ch}
                onClick={() => setRadioChannel(c.ch as any)}
                className={`bento-card p-3.5 text-xs cursor-pointer transition-all space-y-2 ${
                  radioChannel === c.ch
                    ? 'border-sky-500 ring-1 ring-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">{c.ch}</span>
                  <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400">{c.freq}</span>
                </div>
                <strong className="block text-xs font-bold text-slate-900 dark:text-white">{c.name}</strong>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {c.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="bento-card p-4 space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-[10px] font-mono uppercase tracking-wider">
              DANH MỤC MẬT DANH TÁC CHIẾN (CALL-SIGNS) THEO ĐIỀU LỆ
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">ALPHA 1 (CHIEF)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Tổng chỉ huy trưởng ban</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">BRAVO 1 (ARENA LEAD)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Chỉ huy trưởng sa bàn thi đấu</span>
              </div>
              <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">CHARLIE 1 (STAGE LEAD)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">Chỉ huy trưởng âm thanh ánh sáng</span>
              </div>
              <div className="p-2.5 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                <span className="font-bold text-rose-600 dark:text-rose-400 block text-xs">DELTA 1 (SAFETY SPOC)</span>
                <span className="text-[10px] text-rose-700/80 dark:text-rose-400/80 font-sans">Đầu mối an toàn & sơ cứu</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. RESCUE & 15-MIN REPAIR SUB-TAB */}
      {activeSubTab === 'RESCUE' && (
        <div className="bento-card p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                Đội Phản Ứng Nhanh Cứu Trợ Kỹ Thuật 15 Phút (Technical Rapid Pit)
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Quy trình ứng cứu khẩn cấp cho các đội tuyển gặp sự cố robot trước giờ lên sàn đấu
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
              SOP-RES-15
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
              <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">BƯỚC 1: TIẾP NHẬN (0-2 PHÚT)</span>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                Đội thi mang robot vào Trạm Pit số 1. Kỹ thuật viên kiểm tra pin LiPo, chập mạch, ngoại quan động cơ.
              </p>
            </div>

            <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
              <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">BƯỚC 2: XỬ LÝ (2-12 PHÚT)</span>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                Hàn nối dây cáp đứt, thay bánh răng in 3D dự phòng (kho FIN-2.2), nạp lại firmware qua USB-C.
              </p>
            </div>

            <div className="p-3 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-1">
              <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">BƯỚC 3: TEST SA BÀN (12-15 PHÚT)</span>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                Chạy thử 30 giây trên sa bàn test số 2. Xác nhận an toàn và bàn giao robot lại cho đội thi vào sân.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
