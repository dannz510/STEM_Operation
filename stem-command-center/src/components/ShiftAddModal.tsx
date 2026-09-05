import React, { useState } from 'react';
import { Modal } from 'react-modal';
import { Shift } from '../types';

interface ShiftAddModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onAddShift: (shift: Shift) => void;
}

const ShiftAddModal: React.FC<ShiftAddModalProps> = ({ isOpen, onRequestClose, onAddShift }) => {
  const [shiftName, setShiftName] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [shiftTime, setShiftTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift: Shift = {
      id: `SHIFT-${Date.now()}`,
      name: shiftName,
      date: shiftDate,
      time: shiftTime,
    };
    onAddShift(newShift);
    onRequestClose();
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Add Shift">
      <h2>Add New Shift</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="shiftName">Shift Name:</label>
          <input
            type="text"
            id="shiftName"
            value={shiftName}
            onChange={(e) => setShiftName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="shiftDate">Date:</label>
          <input
            type="date"
            id="shiftDate"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="shiftTime">Time:</label>
          <input
            type="time"
            id="shiftTime"
            value={shiftTime}
            onChange={(e) => setShiftTime(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Shift</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
    </Modal>
  );
};

export default ShiftAddModal;