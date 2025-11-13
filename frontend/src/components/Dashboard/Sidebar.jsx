import { useAuth } from '../../context/AuthContext';
import { ShieldCheckIcon, LayoutDashboardIcon, PlusCircleIcon, LogOutIcon, UserIcon } from '../Icons';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const { user } = useAuth();
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon /> },
    { id: 'create', label: 'Create Escrow', icon: <PlusCircleIcon /> }
  ];

  return (
    <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="text-indigo-400" />
          <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">TrustPay</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all ${
              activePage === item.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold shadow-lg'
                : 'hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
          <div>
            <p className="font-semibold text-sm">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400">{user?.vpa || user?.email || 'No UPI ID'}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition font-semibold backdrop-blur-sm"
        >
          <LogOutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
