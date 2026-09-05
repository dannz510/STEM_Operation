import React, { useState } from 'react';
import { Asset } from '../types';

interface AssetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSave: (updatedAsset: Asset) => void;
}

const AssetEditModal: React.FC<AssetEditModalProps> = ({ isOpen, onClose, asset, onSave }) => {
  const [name, setName] = useState(asset.name);
  const [specs, setSpecs] = useState(asset.specs);
  const [serial, setSerial] = useState(asset.serial);
  const [location, setLocation] = useState(asset.location);
  const [value, setValue] = useState(asset.value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAsset = { ...asset, name, specs, serial, location, value };
    onSave(updatedAsset);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Edit Asset</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-slate-300 rounded-md p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Specifications</label>
            <input
              type="text"
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="border border-slate-300 rounded-md p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Serial Number</label>
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="border border-slate-300 rounded-md p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border border-slate-300 rounded-md p-2 w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="border border-slate-300 rounded-md p-2 w-full"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 bg-gray-300 text-gray-700 rounded-md px-4 py-2">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white rounded-md px-4 py-2">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetEditModal;