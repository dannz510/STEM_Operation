import React, { useState } from 'react';
import { Modal } from 'react-modal';
import { Member } from '../types';

interface MeritRecordModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  members: Member[];
  onRecordMerit: (memberId: string, points: number, reason: string) => void;
}

const MeritRecordModal: React.FC<MeritRecordModalProps> = ({
  isOpen,
  onRequestClose,
  members,
  onRecordMerit,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMemberId && points > 0) {
      onRecordMerit(selectedMemberId, points, reason);
      onRequestClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <h2>Record Merit Points</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="member">Select Member:</label>
          <select
            id="member"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">Select a member</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="points">Points:</label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            min="1"
          />
        </div>
        <div>
          <label htmlFor="reason">Reason:</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <button type="submit">Record Merit</button>
        <button type="button" onClick={onRequestClose}>Cancel</button>
      </form>
    </Modal>
  );
};

export default MeritRecordModal;