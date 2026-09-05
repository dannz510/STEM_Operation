import React, { useState } from 'react';
import { LoanTicket } from '../types';

interface LoanEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanTicket: LoanTicket;
  onUpdate: (updatedTicket: LoanTicket) => void;
}

const LoanEditModal: React.FC<LoanEditModalProps> = ({ isOpen, onClose, loanTicket, onUpdate }) => {
  const [borrowerName, setBorrowerName] = useState(loanTicket.borrowerName);
  const [dueDate, setDueDate] = useState(loanTicket.dueDate);
  const [status, setStatus] = useState(loanTicket.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTicket = { ...loanTicket, borrowerName, dueDate, status };
    onUpdate(updatedTicket);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold">Edit Loan Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Borrower Name</label>
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            >
              <option value="ON_LOAN">On Loan</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 bg-gray-300 text-white rounded-md px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanEditModal;