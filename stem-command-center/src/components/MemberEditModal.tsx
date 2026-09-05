import React, { useState } from 'react';
import { Member } from '../types';

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
  onSave: (updatedMember: Member) => void;
}

const MemberEditModal: React.FC<MemberEditModalProps> = ({ member, onClose, onSave }) => {
  const [name, setName] = useState(member.name);
  const [studentId, setStudentId] = useState(member.studentId);
  const [subTeam, setSubTeam] = useState(member.subTeam);
  const [role, setRole] = useState(member.role);

  const handleSave = () => {
    const updatedMember = {
      ...member,
      name,
      studentId,
      subTeam,
      role,
    };
    onSave(updatedMember);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Member</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Sub Team</label>
          <input
            type="text"
            value={subTeam}
            onChange={(e) => setSubTeam(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border border-slate-300 rounded-md p-2 w-full"
          >
            <option value="CADET">Cadet</option>
            <option value="OPERATOR">Operator</option>
            <option value="LEAD">Lead</option>
            <option value="CHIEF">Chief</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="mr-2 bg-gray-300 text-gray-700 rounded-md px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white rounded-md px-4 py-2">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberEditModal;