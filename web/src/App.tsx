import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import BottomNavigation from './components/BottomNavigation';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinHouseholdPage from './pages/JoinHouseholdPage';
import DashboardPage from './pages/DashboardPage';
import ChoresPage from './pages/ChoresPage';
import EarningsPage from './pages/EarningsPage';
import RewardsPage from './pages/RewardsPage';
import { notificationService } from './services/notifications';
import { offlineSyncService } from './services/offlineSync';
import './App.css';

type AuthMode = 'login' | 'register' | 'join';

const AuthFlow: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  return (
    <>
      {authMode === 'login' && <LoginPage onModeChange={setAuthMode} />}
      {authMode === 'register' && <RegisterPage onModeChange={setAuthMode} />}
      {authMode === 'join' && <JoinHouseholdPage onModeChange={setAuthMode} />}
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Hide loading screen when app is ready
  useEffect(() => {
    if (!isLoading) {
      document.body.classList.add('app-loaded');
    }
  }, [isLoading]);

  // Initialize services
  useEffect(() => {
    if (isAuthenticated) {
      // Request notification permissions
      notificationService.requestPermission();
      
      // Setup offline sync
      offlineSyncService.syncPendingActions();
      
      // Register for background sync
      offlineSyncService.registerBackgroundSync('chore-sync');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return null; // Loading screen is handled by index.html
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chores" element={<ChoresPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
};

// Offline status indicator
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm font-medium z-50">
      📶 You're offline - changes will sync when reconnected
    </div>
  );
};

// Install PWA prompt
const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg z-30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Install ChoreMe</p>
          <p className="text-sm text-primary-100">Add to your home screen for a better experience</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => setShowInstall(false)}
            className="px-3 py-1 text-sm bg-primary-700 rounded"
          >
            Later
          </button>
          <button
            onClick={handleInstall}
            className="px-3 py-1 text-sm bg-white text-primary-600 rounded font-medium"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
          <OfflineIndicator />
          <InstallPrompt />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;