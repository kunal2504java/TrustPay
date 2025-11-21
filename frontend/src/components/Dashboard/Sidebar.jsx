import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheckIcon, LayoutDashboardIcon, PlusCircleIcon, LogOutIcon, UserIcon, SettingsIcon } from '../Icons';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon /> },
    { id: 'create', label: 'Create Escrow', icon: <PlusCircleIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> }
  ];

  return (
    <motion.div
      initial={{ width: '80px' }}
      animate={{ width: isOpen ? '256px' : '80px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="bg-black/40 backdrop-blur-xl border-r border-white/10 text-white h-screen fixed left-0 top-0 flex flex-col z-50"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10 flex items-center justify-center">
        <div className="flex items-center space-x-2 overflow-hidden">
          <ShieldCheckIcon className="text-indigo-400 flex-shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xl bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent whitespace-nowrap trustpay-brand"
              >
                TrustPay
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map(item => (
          <motion.button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg mb-2 transition-all ${
              activePage === item.id
                ? 'bg-gradient-to-r from-gray-700 to-gray-900 font-semibold shadow-lg'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} mb-4`}>
          <div className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.vpa || user?.email || 'No UPI ID'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button 
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${isOpen ? 'justify-center space-x-2' : 'justify-center'} px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded-lg transition font-semibold backdrop-blur-sm`}
        >
          <LogOutIcon />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
