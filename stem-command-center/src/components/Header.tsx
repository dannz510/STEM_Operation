import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-100 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-slate-900">BAN QUẢN LÝ TIỀN CẦN & VẬN HÀNH SỰ KIỆN</h1>
      <nav>
        <ul className="flex space-x-4">
          <li><a href="#dashboard" className="text-slate-600 hover:text-slate-900">Tổng Quan</a></li>
          <li><a href="#assets" className="text-slate-600 hover:text-slate-900">Tài Sản</a></li>
          <li><a href="#loans" className="text-slate-600 hover:text-slate-900">Phiếu Mượn</a></li>
          <li><a href="#members" className="text-slate-600 hover:text-slate-900">Nhân Sự</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;