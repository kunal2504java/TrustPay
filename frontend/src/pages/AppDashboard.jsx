import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Dashboard/Sidebar';
import DashboardListPage from '../components/Dashboard/DashboardListPage';
import CreateEscrowFormPage from '../components/Dashboard/CreateEscrowFormPage';
import EscrowDetailPage from '../components/Dashboard/EscrowDetailPage';

export default function AppDashboard() {
  const { logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedEscrowId, setSelectedEscrowId] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={logout} />

      <div className="ml-64 p-8">
        {activePage === 'dashboard' && (
          <DashboardListPage setActivePage={setActivePage} setSelectedEscrowId={setSelectedEscrowId} />
        )}
        {activePage === 'create' && <CreateEscrowFormPage setActivePage={setActivePage} />}
        {activePage === 'detail' && (
          <EscrowDetailPage escrowId={selectedEscrowId} setActivePage={setActivePage} />
        )}
      </div>
    </div>
  );
}
