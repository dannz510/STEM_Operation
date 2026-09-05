import React, { useState } from 'react';
import { showToast } from '../utils/toast'; // Assuming there's a utility for showing toast notifications
import { LoanTicket } from '../types'; // Assuming LoanTicket type is defined in types.ts

const Form01LoanModal: React.FC<{ onClose: () => void; onSubmit: (ticket: LoanTicket) => void }> = ({ onClose, onSubmit }) => {
  const [assetCode, setAssetCode] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerUnit, setBorrowerUnit] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assetCode || !borrowerName || !borrowerUnit || !borrowDate || !dueDate) {
      showToast('⛔ Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const newTicket: LoanTicket = {
      id: `LOAN-${Date.now()}`,
      assetId: assetCode,
      assetName: assetCode, // Assuming asset name is the same as asset code for simplicity
      borrowerName,
      borrowerUnit,
      borrowDate,
      dueDate,
      status: 'ON_LOAN',
    };

    onSubmit(newTicket);
    onClose();
  };

  return (
    <div className="modal">
      <h2 className="text-lg font-bold">Tạo Phiếu Mượn</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="assetCode">Mã Tài Sản</label>
          <input
            type="text"
            id="assetCode"
            value={assetCode}
            onChange={(e) => setAssetCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="borrowerName">Tên Người Mượn</label>
          <input
            type="text"
            id="borrowerName"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="borrowerUnit">Đơn Vị Người Mượn</label>
          <input
            type="text"
            id="borrowerUnit"
            value={borrowerUnit}
            onChange={(e) => setBorrowerUnit(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="borrowDate">Ngày Mượn</label>
          <input
            type="date"
            id="borrowDate"
            value={borrowDate}
            onChange={(e) => setBorrowDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="dueDate">Ngày Trả</label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Tạo Phiếu Mượn</button>
        <button type="button" onClick={onClose}>Hủy</button>
      </form>
    </div>
  );
};

export default Form01LoanModal;