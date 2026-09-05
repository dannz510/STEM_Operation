import React from 'react';

const RedCodeModal = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-lg p-6 z-10">
        <h2 className="text-lg font-semibold">Red Code Incident</h2>
        <p>Please provide details about the red code incident.</p>
        {/* Add form fields here for incident details */}
        <div className="mt-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>
            Submit
          </button>
          <button className="bg-gray-300 text-gray-700 px-4 py-2 rounded ml-2" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedCodeModal;