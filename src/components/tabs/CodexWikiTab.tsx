import React, { useState } from 'react';
import {
  Printer,
  Search,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { CODEX_SECTIONS } from '../../data/initialData';

export const CodexWikiTab: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState(CODEX_SECTIONS[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);

  const selectedSection =
    CODEX_SECTIONS.find((s) => s.id === selectedSectionId) ||
    CODEX_SECTIONS[0] || {
      id: 'empty',
      title: 'Chưa có dữ liệu',
      content: 'Đang cập nhật văn kiện quy tắc...',
    };

  const filteredSections = CODEX_SECTIONS.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAiSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiSearching(true);
    setTimeout(() => {
      setIsAiSearching(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('red code') || q.includes('cháy') || q.includes('sự cố')) {
        setAiAnswer(
          'Theo Điều Lệ Chương IV (SOP-RED-01): Quy trình kích hoạt RED CODE chỉ do Tổng Chỉ Huy (Chief) ban hành khi xảy ra cháy nổ, chập điện 3 pha, hoặc mất mát tài sản > 20 triệu VNĐ. Bước 1: Bấm còi báo động & ngắt cầu dao tổng PWR-3.1 trong 10 giây; Bước 2: Sơ tán người qua Cửa Thoát Hiểm Đông; Bước 3: SPOC An toàn báo cáo Ban Giám Hiệu trong 15 phút.'
        );
      } else if (q.includes('5s') || q.includes('bàn giao') || q.includes('ca')) {
        setAiAnswer(
          'Theo Điều Lệ Chương III (Mục 3.1): Bàn giao ca trực tuân theo Quy tắc 1+1 (01 Operator + 01 Cadet). Không thành viên nào được rời vị trí khi ca tiếp theo chưa có mặt đủ quân số. Bảng kiểm 5S gồm 5 bước bắt buộc: Sàng lọc phế phẩm in, Sắp xếp dụng cụ vào khay silhouette, Lau kính máy cồn IPA, Hiệu chuẩn đầu đùn, và Ký sổ nhật ký điện tử.'
        );
      } else if (q.includes('thăng cấp') || q.includes('cấp bậc') || q.includes('merit')) {
        setAiAnswer(
          'Theo Điều Lệ Chương I (Mục 1.2): 4 Cấp bậc tác chiến gồm CADET (0-99 Merit), OPERATOR (100-199 Merit), LEAD (200-299 Merit), CHIEF (≥300 Merit). Đề xuất thăng cấp thực hiện qua Form 03 kèm điều kiện không có án kỷ luật Mức 2-3 trong kỳ.'
        );
      } else {
        setAiAnswer(
          `Trích lục Điều Lệ STEM Lab: Với câu hỏi "${aiQuestion}", hệ thống khuyến nghị tra cứu tại Chương II (11 Tiểu ban chuyên môn) và Chương III (Quy chế mượn trả Form 01). Mọi hoạt động luân chuyển thiết bị đều yêu cầu xác thực 3 lớp (Ký số, Tem QR niêm phong, và CCTV timestamp).`
        );
      }
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5">
      {/* Header Banner */}
      <div className="bento-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                CODEX WIKI // WKI-5.2 KHO TRI THỨC SỐ
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">BẢN QUY CHUẨN ĐẦY ĐỦ</span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-1">
              Điều Lệ Tác Chiến & Cẩm Nang Vận Hành Dual-Mode STEM Lab
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Văn bản quy định nội bộ cao nhất đối với toàn thể cán bộ và thành viên phòng Lab STEM THPT Châu Thành.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>In Bản Chuẩn</span>
          </button>
        </div>
      </div>

      {/* AI Grounded Assistant Quick Query Box */}
      <div className="bento-card p-3.5 space-y-2.5 bg-sky-50/40 dark:bg-sky-950/20 border-sky-200/60 dark:border-sky-900/40">
        <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider">
            TRỢ LÝ TRA CỨU ĐIỀU LỆ & QUY TRÌNH LAB (AI SEARCH GROUNDING)
          </h4>
        </div>

        <form onSubmit={handleAiSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Hỏi nhanh: 'Quy trình xử lý RED CODE?', 'Điều kiện thăng cấp Operator?', 'Checklist 5S'..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
          />
          <button
            type="submit"
            disabled={isAiSearching}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded cursor-pointer whitespace-nowrap transition-colors"
          >
            {isAiSearching ? 'Tra Cứu...' : 'Tra Cứu'}
          </button>
        </form>

        {aiAnswer && (
          <div className="p-3 bg-white dark:bg-slate-900 rounded border border-sky-200 dark:border-sky-900/60 text-xs text-slate-900 dark:text-white space-y-1">
            <span className="font-mono text-[9px] font-bold text-sky-600 dark:text-sky-400 block uppercase tracking-wider">
              KẾT QUẢ ĐỐI SOÁT TRÍCH LỤC TỪ ĐIỀU LỆ LAB:
            </span>
            <p className="leading-relaxed font-sans text-[11px] text-slate-700 dark:text-slate-300">{aiAnswer}</p>
          </div>
        )}
      </div>

      {/* Main Codex Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo chương mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>

          <div className="bento-card rounded overflow-hidden p-1 space-y-0.5">
            {filteredSections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setSelectedSectionId(sec.id)}
                className={`w-full text-left p-2 rounded text-xs cursor-pointer transition-colors flex items-start gap-1.5 ${
                  selectedSectionId === sec.id
                    ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-bold border border-sky-200 dark:border-sky-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                    selectedSectionId === sec.id ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'
                  }`}
                />
                <span className="line-clamp-2 leading-snug text-xs">{sec.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Detail Reader */}
        <div className="lg:col-span-3 bento-card p-5 space-y-3.5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 uppercase block tracking-wider">
              VĂN KIỆN CHÍNH THỨC
            </span>
            <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900 dark:text-white mt-1 font-sans">
              {selectedSection?.title}
            </h2>
          </div>

          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
            {selectedSection?.content}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-500 dark:text-slate-400 font-mono text-[9px]">
            <span>MÃ LƯU TRỮ: WKI-CODEX-{selectedSection?.id?.toUpperCase() || 'EMPTY'}</span>
            <span>HIỆU LỰC: BAN HẬU CẦN & QUẢN LÝ PHÒNG LAB STEM</span>
          </div>
        </div>
      </div>
    </div>
  );
};