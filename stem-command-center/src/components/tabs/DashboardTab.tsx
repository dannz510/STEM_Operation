import React from 'react';

const DashboardTab: React.FC = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-700">Welcome to the Dashboard! Here you can find an overview of key metrics and information related to the operations.</p>
            {/* Additional dashboard components and metrics can be added here */}
        </div>
    );
};

export default DashboardTab;