import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheckIcon, LayoutDashboardIcon, PlusCircleIcon, LogOutIcon, UserIcon, SettingsIcon, FileTextIcon } from '../Icons';

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboardIcon /> },
    { id: 'create', label: 'Create Escrow', icon: <PlusCircleIcon /> },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { id: 'audit', label: 'Audit Records', icon: <FileTextIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> }
  ];

  return (
    <motion.div
      initial={{ width: '80px' }}
      animate={{ width: isOpen ? '256px' : '80px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      className="bg-[#1f1f1f] border-r border-[#2a2a2a] text-white h-screen fixed left-0 top-0 flex flex-col z-50"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-[#2a2a2a] flex items-center justify-center">
        <div className="flex items-center space-x-2 overflow-hidden">
          <ShieldCheckIcon className="text-white flex-shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-xl text-white whitespace-nowrap trustpay-brand"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
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
            className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-lg mb-2 transition-all relative ${activePage === item.id
                ? 'text-white font-semibold'
                : 'text-[#888888] hover:text-white hover:bg-[#242424]'
              }`}
          >
            {activePage === item.id && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r" />
            )}
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
      <div className="p-4 border-t border-[#2a2a2a]">
        <div className={`flex items-center ${isOpen ? 'space-x-3' : 'justify-center'} mb-4`}>
          <div className="w-10 h-10 bg-[#242424] border border-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0">
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
                <p className="font-semibold text-sm truncate text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-[#888888] truncate">{user?.vpa || user?.email || 'No UPI ID'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={onLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center ${isOpen ? 'justify-center space-x-2' : 'justify-center'} px-4 py-2 bg-[#242424] hover:bg-[#2a2a2a] border border-[#2a2a2a] rounded-lg transition font-medium text-[#888888]`}
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
