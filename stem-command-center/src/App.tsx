import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AssetInventoryTab } from './components/tabs/AssetInventoryTab';
import { LoanFormsTab } from './components/tabs/LoanFormsTab';
import { ShiftRosterTab } from './components/tabs/ShiftRosterTab';
import { GamificationHrTab } from './components/tabs/GamificationHrTab';
import { EventArenaTab } from './components/tabs/EventArenaTab';
import { DashboardTab } from './components/tabs/DashboardTab';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initialData } from './data/initialData';
import { Member, Asset, LoanTicket } from './types';

const App = () => {
  const [members, setMembers] = useState<Member[]>(initialData.members);
  const [assets, setAssets] = useState<Asset[]>(initialData.assets);
  const [loans, setLoans] = useState<LoanTicket[]>(initialData.loans);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    const storedData = localStorage.getItem('stem_lab_v4_data');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setMembers(parsedData.members);
      setAssets(parsedData.assets);
      setLoans(parsedData.loans);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stem_lab_v4_data', JSON.stringify({ members, assets, loans }));
  }, [members, assets, loans]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const showToast = (message: string) => {
    toast(message);
  };

  return (
    <div className="app-container">
      <Header onTabChange={handleTabChange} />
      <div className="tab-content">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'assets' && <AssetInventoryTab assets={assets} />}
        {activeTab === 'loans' && <LoanFormsTab loans={loans} />}
        {activeTab === 'shifts' && <ShiftRosterTab />}
        {activeTab === 'gamification' && <GamificationHrTab />}
        {activeTab === 'events' && <EventArenaTab />}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;