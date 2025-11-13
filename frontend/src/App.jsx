import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppDashboard from './pages/AppDashboard';
import NotFound from './pages/NotFound';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    // Simple routing based on hash
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === '404') {
        setCurrentPage('404');
      } else if (hash === 'login') {
        setCurrentPage('auth');
        setAuthPage('login');
      } else if (hash === 'register') {
        setCurrentPage('auth');
        setAuthPage('register');
      } else {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If authenticated, always show dashboard (except for 404)
  if (isAuthenticated && currentPage !== '404') {
    return <AppDashboard />;
  }

  if (currentPage === '404') {
    return <NotFound />;
  }

  if (currentPage === 'auth') {
    if (authPage === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />;
    }
    return <LoginPage onSwitchToRegister={() => setAuthPage('register')} />;
  }

  return <LandingPage onLogin={() => (window.location.hash = 'login')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
