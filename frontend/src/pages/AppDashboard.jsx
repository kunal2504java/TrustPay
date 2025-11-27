import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardListPage from '../components/Dashboard/DashboardListPage';
import CreateEscrowFormPage from '../components/Dashboard/CreateEscrowFormPage';
import EscrowDetailPage from '../components/Dashboard/EscrowDetailPage';
import AuditRecordsPage from '../components/Dashboard/AuditRecordsPage';
import AnalyticsPage from '../components/Dashboard/AnalyticsPage';

export default function AppDashboard() {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedEscrowId, setSelectedEscrowId] = useState(null);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />

      {/* Content area with responsive margin for collapsed sidebar */}
      <div className="ml-20 p-8 transition-all duration-300">
        {activePage === 'dashboard' && (
          <DashboardListPage setActivePage={setActivePage} setSelectedEscrowId={setSelectedEscrowId} />
        )}
        {activePage === 'create' && <CreateEscrowFormPage setActivePage={setActivePage} setSelectedEscrowId={setSelectedEscrowId} />}
        {activePage === 'analytics' && <AnalyticsPage />}
        {activePage === 'audit' && <AuditRecordsPage />}
        {activePage === 'detail' && (
          <EscrowDetailPage escrowId={selectedEscrowId} setActivePage={setActivePage} />
        )}
        {activePage === 'settings' && (
          <div className="bg-[#242424] border border-[#2a2a2a] rounded-lg p-8">
            <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
            <p className="text-[#888888]">Settings page coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
