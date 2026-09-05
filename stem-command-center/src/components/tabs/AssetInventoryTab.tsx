import React, { useEffect, useState } from 'react';
import { Asset } from '../../types';
import AssetEditModal from '../AssetEditModal';

const AssetInventoryTab: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const storedAssets = localStorage.getItem('stem_assets');
        if (storedAssets) {
            setAssets(JSON.parse(storedAssets));
        }
    }, []);

    const handleEditAsset = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedAsset(null);
    };

    const handleAssetUpdate = (updatedAsset: Asset) => {
        setAssets((prevAssets) =>
            prevAssets.map((asset) =>
                asset.id === updatedAsset.id ? updatedAsset : asset
            )
        );
        localStorage.setItem('stem_assets', JSON.stringify(assets));
        handleModalClose();
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Asset Inventory</h2>
            <table className="min-w-full bg-white border border-slate-200">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Name</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset) => (
                        <tr key={asset.id}>
                            <td className="py-2 px-4 border-b">{asset.id}</td>
                            <td className="py-2 px-4 border-b">{asset.name}</td>
                            <td className="py-2 px-4 border-b">{asset.status}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    className="text-blue-600 hover:underline"
                                    onClick={() => handleEditAsset(asset)}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && (
                <AssetEditModal
                    asset={selectedAsset}
                    onClose={handleModalClose}
                    onUpdate={handleAssetUpdate}
                />
            )}
        </div>
    );
};

export default AssetInventoryTab;