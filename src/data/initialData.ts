import {
  SubBranchInfo,
  Member,
  Asset,
  ConsumableItem,
  LoanTicket,
  ShiftRoster,
  MeritDemeritLog,
  IncidentReport,
  CodexSection,
} from '../types';

// 11 Tiểu ban cố định theo Cơ cấu Dual-Mode (chỉ giữ metadata, không có dữ liệu mẫu)
export const SUB_BRANCHES: SubBranchInfo[] = [
  {
    code: 'OPS-1.1',
    name: 'Tổng Chỉ Huy & Vận Hành',
    branchName: 'Nhánh 1: Điều hành & Nhân sự',
    branchCode: 'FAB_HR',
    leaderTitle: 'Tổng Chỉ Huy (Lab Leader & Chief)',
    targetGenderRatio: 'Co-ed (Nam / Nữ)',
    normalMission: 'Quản trị toàn diện Lab, thiết lập chu kỳ Sprint OKRs/KPIs, duy trì văn hóa kỷ luật kỹ thuật & phê duyệt ngân sách.',
    eventMission: 'Tổng chỉ huy hiện trường FOH; phê duyệt Master Script/Cue Sheet, khớp nối 5 nhánh, xử lý khủng hoảng trong 3 phút.',
    crossSupport: 'Hỗ trợ HR-1.2 giải quyết mâu thuẫn nội bộ & phối hợp PRO-4.3 đón tiếp đoàn khách đặc biệt, BGH.',
    coreCompetencies: ['Quản trị dự án Agile/Scrum', 'Tư duy hệ thống', 'Ra quyết định dưới áp lực cao'],
    kpiChecklist: [
      '100% Sprint được lập kế hoạch và nghiệm thu đúng hạn',
      'Sự kiện an toàn 100% về người, điện đà và thiết bị',
      'Tỷ lệ giữ chân nhân sự (Retention Rate) > 85%',
      'Mọi sự cố hiện trường được xử lý trong tối đa 3 phút'
    ],
    keyAssets: ['AST-FDM-01', 'AST-FDM-02'],
    sopCodes: ['SOP-OPS-01', 'SOP-OPS-02'],
  },
  {
    code: 'HR-1.2',
    name: 'Nhân Sự & Văn Hóa Lab',
    branchName: 'Nhánh 1: Điều hành & Nhân sự',
    branchCode: 'FAB_HR',
    leaderTitle: 'Trưởng tiểu ban Nhân sự & Member Care',
    targetGenderRatio: 'Ưu tiên Nữ (Mát tay kết nối, tinh tế hậu trường)',
    normalMission: 'Lập lịch trực ca 1+1, điểm danh check-in/out, quản lý chìa khóa, vận hành Buddy System cho lớp 10-11.',
    eventMission: 'Hậu phương & Năng lượng Ekip: Khảo sát thực đơn, phân phát cơm hộp, nước uống, snack, trạm tiếp sức cho MC và Kỹ thuật.',
    crossSupport: 'Hỗ trợ Setup mặt đất (Nhánh 4) & Hỗ trợ kỹ thuật phần cứng, cuộn dây, sạc pin (Nhánh 3).',
    coreCompetencies: ['Quản lý nhân sự', 'Giao tiếp thấu cảm', 'Chăm sóc đời sống & hậu cần'],
    kpiChecklist: [
      '100% ca trực có người mở/đóng cửa và vệ sinh sạch sẽ',
      'Không có thành viên mới nghỉ tự do mà không được hỗ trợ',
      '100% Ekip sự kiện được cung cấp đủ cơm/nước đúng giờ',
      'Khu vực Hậu trường sự kiện luôn gọn gàng, sạch rác'
    ],
    keyAssets: [],
    sopCodes: ['SOP-HR-01', 'SOP-HR-02'],
  },
  {
    code: 'AST-2.1',
    name: 'Kiểm Toán Tài Sản & Kho',
    branchName: 'Nhánh 2: Kiểm kê Tài sản, Hồ sơ & Tài chính',
    branchCode: 'INV_FIN',
    leaderTitle: 'Thủ kho & Kiểm toán Thiết bị (Asset Auditor)',
    targetGenderRatio: 'Co-ed (Ưu tiên Nữ - Tỉ mỉ, nguyên tắc)',
    normalMission: 'Duy trì Master Google Sheets 100% tài sản, phân loại đồ trường/CLB, dán nhãn QR Code/Asset Tag, duyệt Form 01 mượn-trả.',
    eventMission: 'Xuất kho theo checklist Form 01, trực trạm quản lý thiết bị dã chiến, kiểm đếm thu hồi 100% sau sự kiện (Zero Asset Loss).',
    crossSupport: 'Hỗ trợ Lễ tân VIP kiểm đếm cúp/quà (Nhánh 4) & hỗ trợ Floor Manager bấm giờ, kiểm tra đạo cụ (Nhánh 5).',
    coreCompetencies: ['Quản trị dữ liệu số hóa', 'Kiểm toán kho', 'Nguyên tắc bảo toàn tài sản'],
    kpiChecklist: [
      'Khớp 100% dữ liệu kho thực tế và Google Sheets',
      '0% thiết bị ra khỏi Lab mà không có Form ký duyệt',
      '100% Laptop tài trợ và sạc dán mã QR đồng bộ',
      'Thu hồi 100% tài sản xuất kho trong vòng 2h post-event'
    ],
    keyAssets: ['AST-VEX-01', 'AST-OSC-01'],
    sopCodes: ['SOP-AST-01', 'SOP-AST-02'],
  },
  {
    code: 'FIN-2.2',
    name: 'Tài Chính & Chuỗi Cung Ứng',
    branchName: 'Nhánh 2: Kiểm kê Tài sản, Hồ sơ & Tài chính',
    branchCode: 'INV_FIN',
    leaderTitle: 'CSCO & Purchasing Officer',
    targetGenderRatio: 'Co-ed (Ưu tiên Nữ - Quản lý tiền chặt chẽ)',
    normalMission: 'Khảo sát giá từ 2-3 nguồn, đàm phán mua nhựa in 3D/ốc vít, cập nhật sổ thu-chi PETTY_CASH_TRACKER, lưu trữ hóa đơn.',
    eventMission: 'Quản lý quỹ tiền mặt dự phòng (Petty Cash), điều phối kinh phí hậu cần, đội cơ động mua sắm vật tư khẩn cấp tại hiện trường.',
    crossSupport: 'Hỗ trợ Lễ tân VIP rà soát phong bì/giải thưởng (Nhánh 4) & hỗ trợ giữ nhịp thời gian FOH (Nhánh 5).',
    coreCompetencies: ['Quản lý dòng tiền', 'Tối ưu chi phí mua sắm', 'Minh bạch chứng từ hóa đơn'],
    kpiChecklist: [
      '100% giao dịch có hóa đơn, chứng từ hoặc biên nhận',
      'Khớp 100% tiền mặt thực tế và sổ quỹ điện tử',
      'Mua sắm vật tư luôn khảo sát ít nhất 2-3 nguồn giá',
      'Quyết toán tài chính sự kiện hoàn tất trong 24h post-event'
    ],
    keyAssets: [],
    sopCodes: ['SOP-FIN-01'],
  },
  {
    code: 'PWR-3.1',
    name: 'Hạ Tầng Điện & Trạm Năng Lượng',
    branchName: 'Nhánh 3: Kỹ thuật & Hạ tầng Lab',
    branchCode: 'INFRA_SAF',
    leaderTitle: 'Power & Battery Specialist',
    targetGenderRatio: '100% Nam (Chịu tải điện đà, đi dây dã chiến)',
    normalMission: 'Quản lý tủ sạc tập trung, cách ly pin LiPo phồng/hỏng, gom gọn dây nguồn máy in/kính hiển vi, ngắt Aptomat tổng trước khi về.',
    eventMission: 'Kéo đường điện dã chiến, dán nẹp/băng keo vải (Gaff tape) 100% dây qua lối đi chống vấp, lập trạm sạc tập trung cho Robot/Laptop/Media.',
    crossSupport: 'Hỗ trợ Logistics bê sa bàn gần ổ điện (Nhánh 4) & hỗ trợ thay pin nhanh cho Robot tại Pit Zone (Nhánh 5).',
    coreCompetencies: ['An toàn điện áp cao/hạ thế', 'Quản lý an toàn Pin LiPo', 'Thi công cáp dã chiến'],
    kpiChecklist: [
      '0% sự cố vấp ngã do dây điện chăng trên lối đi',
      'Phát hiện và cách ly 100% pin phồng/hỏng',
      '0% sự cố sập Aptomat/quá tải nguồn điện',
      'Dây điện được cuộn tròn gọn gàng, thu hồi đủ sau sự kiện'
    ],
    keyAssets: ['AST-PWR-01'],
    sopCodes: ['SOP-PWR-01', 'SOP-PWR-02'],
  },
  {
    code: 'SAF-3.2',
    name: 'An Toàn Lab & Sơ Cứu Cơ Bản',
    branchName: 'Nhánh 3: Kỹ thuật & Hạ tầng Lab',
    branchCode: 'INFRA_SAF',
    leaderTitle: 'Safety & First-Aid Officer',
    targetGenderRatio: 'Co-ed (Cặp đôi Nam - Nữ: Nữ tủ thuốc/kính hiển vi, Nam cáng cứu hộ/bình CO2)',
    normalMission: 'Duy trì tủ thuốc đầy đủ cồn/băng gạc, kiểm tra hạn dùng, kiểm tra bình chữa cháy CO2 không bị che lấp, bảo quản kính hiển vi sạch sẽ.',
    eventMission: 'Túi y tế dã chiến tại hiện trường, trực sơ cứu bỏng keo/vết cắt mỏ hàn, nắm đầu mối liên lạc Y tế trường / BGH / 115 khi có ca nặng.',
    crossSupport: 'Cùng PWR-3.1 cấm để nước gần ổ điện & hỗ trợ Logistics dọn dẹp hiện trường an toàn (Nhánh 4).',
    coreCompetencies: ['Sơ cấp cứu cơ bản', 'An toàn PCCC & Hóa chất', 'Phản ứng khủng hoảng y tế'],
    kpiChecklist: [
      'Tủ thuốc Lab sẵn sàng 100% dụng cụ sơ cứu cơ bản',
      '100% vết thương nhẹ được sơ cứu đúng chuẩn trong 1 phút',
      'Bình chữa cháy luôn ở vị trí dễ thấy, dễ lấy',
      'Quyền điều động khẩn cấp ngắt điện khi có nguy cơ cháy nổ'
    ],
    keyAssets: ['AST-SAF-01', 'AST-MIC-01'],
    sopCodes: ['SOP-SAF-01', 'SOP-SAF-02'],
  },
  {
    code: 'LAY-4.1',
    name: 'Quy Hoạch Không Gian & Standard 5S',
    branchName: 'Nhánh 4: Bàn giao Không gian & Lễ tân',
    branchCode: 'LOG_PRO',
    leaderTitle: '5S & Space Layout Specialist',
    targetGenderRatio: 'Co-ed (Nam làm cơ khí/Shadow board, Nữ dán nhãn quy hoạch)',
    normalMission: 'Phân chia Zone A-E trong Lab, làm bảng vẽ bóng dụng cụ (Shadow Board) quét mắt 3s là biết thiếu đồ, duy trì Seiri-Seiton-Seiso-Seiketsu-Shitsuke.',
    eventMission: 'Khảo sát và vẽ sơ đồ 2D Layout mặt bằng sự kiện (Sân khấu, Sa bàn, FOH, Pit, Ghế VIP, Luồng khán giả), cắm mốc định vị cho Logistics.',
    crossSupport: 'Hỗ trợ Logistics kê bàn ghế đúng bản vẽ & hỗ trợ Power Grid chỉ định tuyến đi dây điện chìm/bám tường thẩm mỹ.',
    coreCompetencies: ['Tư duy quy hoạch kiến trúc/mặt bằng', 'Tiêu chuẩn Lean 5S', 'Tối ưu luồng di chuyển Traffic Flow'],
    kpiChecklist: [
      '100% dụng cụ cầm tay có bảng vẽ bóng Shadow Board',
      'Bản vẽ 2D Layout sự kiện duyệt trước giờ G ít nhất 2 ngày',
      'Thực tế setup khớp 100% so với sơ đồ thiết kế',
      'Trả lại 100% nguyên trạng mặt bằng sạch đẹp trong 1.5h'
    ],
    keyAssets: [],
    sopCodes: ['SOP-5S-01'],
  },
  {
    code: 'LOG-4.2',
    name: 'Logistics & Setup Hạ Tầng Mặt Đất',
    branchName: 'Nhánh 4: Bàn giao Không gian & Lễ tân',
    branchCode: 'LOG_PRO',
    leaderTitle: 'Technical Logistics Lead',
    targetGenderRatio: '100% Nam ("Cơ bắp" của Lab, bê vác nặng, thi công nhanh)',
    normalMission: 'Quản lý kho bàn ghế dã chiến, khung backdrop, nẹp cao su, thang nhôm, xe đẩy, tiếp nhận vận chuyển đồ cồng kềnh.',
    eventMission: 'Vận chuyển thiết bị ra hiện trường; kê bàn ghế, dựng backdrop/standee, rải nẹp dây; pre-test micro/loa/máy chiếu; thu dọn trả mặt bằng sạch 100%.',
    crossSupport: 'Hỗ trợ Kỹ thuật viên bê khối sa bàn VEX nặng (Nhánh 3) & Stagehand chuyển bục phát biểu, đạo cụ MC (Nhánh 5).',
    coreCompetencies: ['Kho vận Logistics', 'Thi công hạ tầng mặt đất', 'Vận hành thiết bị AV cơ bản'],
    kpiChecklist: [
      'Hoàn thành 100% setup hạ tầng trước giờ G ít nhất 60 phút',
      '100% đường dây băng qua lối đi dán nẹp cao su an toàn',
      'Pre-test thành công Micro, Loa, Máy chiếu không lỗi',
      'Giải phóng và vệ sinh sạch mặt bằng trong 120 phút post-event'
    ],
    keyAssets: ['AST-AV-01'],
    sopCodes: ['SOP-LOG-01'],
  },
  {
    code: 'PRO-4.3',
    name: 'Lễ Tân & Đón Tiếp VIP',
    branchName: 'Nhánh 4: Bàn giao Không gian & Lễ tân',
    branchCode: 'LOG_PRO',
    leaderTitle: 'VIP Protocol & Hospitality Lead',
    targetGenderRatio: '100% Nữ ("Gương mặt đại diện", chỉn chu, giao tiếp lịch thiệp)',
    normalMission: 'Quy hoạch và giữ gìn Zone E (Góc tiếp khách/Giáo viên trong Lab), sẵn sàng trà bánh khi BGH/Cố vấn ghé thăm, lập sơ đồ VIP_SEAT_MAP.',
    eventMission: 'Đón tiếp tại cổng, cài hoa, dẫn BGH/Giám khảo vào đúng vị trí ghế; phục vụ nước/teabreak; bưng khay cúp, hoa, bằng khen trao giải trên sân khấu; tiễn khách.',
    crossSupport: 'Hỗ trợ kiểm đếm thu hồi quà thừa/bảng tên (Nhánh 2) & chăm sóc tiếp nước cho đội ngũ kỹ thuật hậu trường (Nhánh 1).',
    coreCompetencies: ['Nghi thức lễ tân ngoại giao', 'Giao tiếp lịch thiệp', 'Điều phối nghi thức trao giải'],
    kpiChecklist: [
      '100% khách VIP và BGH được đón tiếp đúng sơ đồ',
      'Bàn VIP sẵn sàng nước uống trước giờ mở màn 15 phút',
      '0 sự cố trao nhầm cúp, nhầm bằng khen hoặc phong bì',
      'Tác phong, trang phục đạt chuẩn 100% suốt thời gian sự kiện'
    ],
    keyAssets: [],
    sopCodes: ['SOP-PRO-01'],
  },
  {
    code: 'STG-5.1',
    name: 'Điều Phối Sân Khấu & MC',
    branchName: 'Nhánh 5: Sân khấu & Tri thức',
    branchCode: 'STG_WKI',
    leaderTitle: 'Stage Direction & Master Script Lead',
    targetGenderRatio: 'Co-ed (Cặp đôi MC On-stage + Floor Manager Off-stage)',
    normalMission: 'Soạn Master Script, lập Cue Sheet từng phút [Timeline - Lời MC - Slide/Video LED - Hiệu ứng Sound/Mic], tổ chức Rehearsal tổng duyệt.',
    eventMission: 'MC chính làm chủ sân khấu & phỏng vấn lấp buffer time; Floor Manager đứng dưới sàn dùng khẩu lệnh tay (Cueing Hands) điều phối nhịp thời gian & xếp hàng lượt lên.',
    crossSupport: 'Hỗ trợ Bàn FOH/AV nhắc tín hiệu nhạc/slide (Nhánh 3) & giữ nhịp cho đội Lễ tân bước lên trao cúp (Nhánh 4).',
    coreCompetencies: ['Biên tập kịch bản sự kiện', 'Giọng nói chuẩn & Stage Presence', 'Quản lý thời gian tính bằng giây'],
    kpiChecklist: [
      'Master Script & Cue Sheet hoàn thành trước sự kiện 3 ngày',
      'Độ lệch thời gian toàn chương trình không quá 5 phút',
      '100% sự cố kỹ thuật được lấp khoảng trống (Zero Dead Air)',
      '0 lỗi đọc sai tên/chức danh của Đại biểu, BGH, Nhà tài trợ'
    ],
    keyAssets: [],
    sopCodes: ['SOP-STG-01'],
  },
  {
    code: 'WKI-5.2',
    name: 'Lưu Trữ Tri Thức Kỹ Thuật',
    branchName: 'Nhánh 5: Sân khấu & Tri thức',
    branchCode: 'STG_WKI',
    leaderTitle: 'Tech Wiki Officer & Digital Archivist',
    targetGenderRatio: 'Co-ed (Tư duy tổng hợp, lưu trữ số Notion/Drive khoa học)',
    normalMission: 'Số hóa Lab Handbook (Quy trình máy in 3D, cân bàn nhiệt, code VEX C++/Python mẫu), tổ chức cây thư mục Drive/Notion 4 cấp, đào tạo onboarding.',
    eventMission: 'Thiết kế slide luật thi VEX, cơ cấu giải thưởng; xuất offline PDF dự phòng; túc trực FOH cập nhật điểm số real-time lên màn LED; đóng gói tư liệu sau 24h.',
    crossSupport: 'Đảm nhận vị trí Slide Operator tại bàn FOH (Nhánh 3) & hỗ trợ kiểm kê tài sản số/mã nguồn CAD (Nhánh 2).',
    coreCompetencies: ['Quản trị tri thức số (Notion/Drive)', 'Biên soạn tài liệu kỹ thuật', 'Thiết kế Visual & Slide Deck'],
    kpiChecklist: [
      '100% thiết bị trong Lab có bài hướng dẫn SOP số hóa',
      'Slide sự kiện test chạy thử 100% không lỗi font trước 24h',
      'Điểm số VEX cập nhật lên màn LED độ trễ dưới 30 giây',
      'Đóng gói toàn bộ tư liệu sự kiện lên Cloud trong 24h post-event'
    ],
    keyAssets: [],
    sopCodes: ['SOP-WKI-01', 'SOP-WKI-02'],
  },
];

// Demo seed keeps the local fallback usable; production data comes from Supabase.
export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'MBR-DEMO-OPS', code: 'OPS-001', name: 'Nguyễn Minh An', studentId: 'CT-001',
    email: 'an.demo@example.com', phone: '0900000001', branchCode: 'FAB_HR', subBranchCode: 'OPS-1.1',
    rank: 'CHIEF', meritPoints: 320, demeritPoints: 0, warningLevel: 'NONE', gender: 'MALE',
    status: 'ACTIVE', joinedDate: '2026-08-01', shiftCommitment: 'Điều hành tổng thể', completedShifts: 8,
  },
  {
    id: 'MBR-DEMO-SAF', code: 'SAF-001', name: 'Trần Ngọc Hà', studentId: 'CT-002',
    email: 'ha.demo@example.com', phone: '0900000002', branchCode: 'INFRA_SAF', subBranchCode: 'SAF-3.2',
    rank: 'OPERATOR', meritPoints: 145, demeritPoints: 0, warningLevel: 'NONE', gender: 'FEMALE',
    status: 'ON_DUTY', joinedDate: '2026-08-03', shiftCommitment: 'An toàn Lab & sơ cứu', completedShifts: 5,
  },
];
export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-DEMO-3D', code: 'AST-FDM-01', name: 'Máy in 3D Ender 3 V2', category: '3D_PRINTER',
    branchOwner: 'OPS-1.1', status: 'AVAILABLE', location: 'Zone A · Shadow Board 01', valueVnd: 6500000,
    serialNumber: 'ENDER3-DEMO-01', qrCode: 'AST-FDM-01', lastMaintenance: '2026-08-28',
    specifications: 'FDM · 220 x 220 x 250 mm · PLA/ABS', notes: 'Đã cân bàn và test nozzle.', sealStatus: 'SEALED',
  },
  {
    id: 'AST-DEMO-VEX', code: 'AST-VEX-02', name: 'Bộ VEX IQ Competition', category: 'ROBOTICS',
    branchOwner: 'PWR-3.1', status: 'IN_USE', location: 'Pit Zone · Kệ VEX', valueVnd: 12000000,
    serialNumber: 'VEX-IQ-DEMO-02', qrCode: 'AST-VEX-02', lastMaintenance: '2026-08-24',
    specifications: 'VEX IQ · bộ điều khiển · pin NiMH · phụ kiện cơ khí', notes: 'Đang phục vụ buổi test robot.', sealStatus: 'UNSEALED',
  },
  {
    id: 'AST-DEMO-METER', code: 'AST-MTR-03', name: 'Multimeter số', category: 'MEASUREMENT',
    branchOwner: 'PWR-3.1', status: 'AVAILABLE', location: 'Zone B · Tủ điện', valueVnd: 850000,
    serialNumber: 'MTR-DEMO-03', qrCode: 'AST-MTR-03', lastMaintenance: '2026-08-20',
    specifications: 'DC/AC voltage · continuity · resistance', notes: 'Cất trong hộp chống sốc.', sealStatus: 'SEALED',
  },
];
export const INITIAL_LOANS: LoanTicket[] = [];
export const INITIAL_ROSTERS: ShiftRoster[] = [{
  id: 'SHIFT-DEMO-01', date: '2026-09-05', shiftNumber: 1, shiftName: 'Ca 1 · Post-School', shiftTime: '16:30 - 18:30',
  operatorId: 'MBR-DEMO-OPS', operatorName: 'Nguyễn Minh An', leadOperatorId: 'MBR-DEMO-OPS', leadOperatorName: 'Nguyễn Minh An', leadOperatorRank: 'CHIEF',
  cadetId: 'MBR-DEMO-SAF', cadetName: 'Trần Ngọc Hà', cadetAssistantId: 'MBR-DEMO-SAF', cadetAssistantName: 'Trần Ngọc Hà', subBranch: 'OPS-1.1 / SAF-3.2',
  handover5S: { sortDone: true, setInOrderDone: true, shineDone: false, standardizeDone: false, sustainDone: false, machinesCalibrated: true, powerIsolated: false, chemicalCabinetLocked: true },
  notes: 'Ca mẫu để kiểm tra quy trình bàn giao 5S.', verifiedByCctv: false, isCompleted: false,
}];
export const INITIAL_INCIDENTS: IncidentReport[] = [];
export const INITIAL_CONSUMABLES: ConsumableItem[] = [{
  id: 'CONS-DEMO-PLA', code: 'CONS-PLA-01', name: 'Nhựa PLA 1.75mm', unit: 'cuộn', currentStock: 4, minThreshold: 2,
  unitPriceVnd: 420000, category: 'Vật tư in 3D', lastRestocked: '2026-08-30', subBranch: 'OPS-1.1', specs: 'PLA · 1kg/cuộn',
}];
export const INITIAL_MERIT_LOGS: MeritDemeritLog[] = [];

// Codex/Sổ tay - để trống, người dùng tự biên soạn
export const CODEX_SECTIONS: CodexSection[] = [];

// Mã code tự sinh khi tạo mới
export const generateCode = (prefix: string): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 1000).toString(36).toUpperCase().padStart(2, '0');
  return `${prefix}-${ts.slice(-4)}${rand}`;
};