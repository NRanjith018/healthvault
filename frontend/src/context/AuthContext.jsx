import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authAPI,
  patientAPI,
  doctorAPI,
  checkBackendHealth,
  getOperatingMode,
  getBackendStatus,
  setManualMode,
  subscribeToModeChange
} from '../services/api';
import { demoGetCurrentUser, resetDemoData, initDemoStorage } from '../services/demoService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('demo');
  const [backendStatus, setBackendStatus] = useState({ online: false, dbConnected: false, checked: false });
  const [toastMessage, setToastMessage] = useState(null);

  // Show temporary toast notification
  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    // 1. Initialize demo storage if needed
    initDemoStorage();

    // 2. Subscribe to mode changes
    const unsubscribe = subscribeToModeChange(({ mode: newMode, status }) => {
      setMode(newMode);
      setBackendStatus(status);
    });

    // 3. Health check backend on mount
    const initAuth = async () => {
      try {
        const { mode: initialMode, status } = await checkBackendHealth();
        setMode(initialMode);
        setBackendStatus(status);

        if (initialMode === 'demo') {
          showToast('Demo Mode Active – Using Sample Data (Offline Ready)', 'info');
          // Check if there is an existing demo session
          const demoSession = demoGetCurrentUser();
          if (demoSession) {
            setUser(demoSession.user);
            setProfile(demoSession.profile);
          }
        } else {
          // Check live session token
          const token = localStorage.getItem('hv_auth_token');
          const savedUser = localStorage.getItem('hv_auth_user');
          if (token && savedUser) {
            try {
              const parsed = JSON.parse(savedUser);
              setUser(parsed.user);
              setProfile(parsed.profile);
            } catch (e) {
              localStorage.removeItem('hv_auth_token');
              localStorage.removeItem('hv_auth_user');
            }
          }
        }
      } catch (err) {
        setMode('demo');
        showToast('Demo Mode Active – Using Sample Data', 'info');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login(email, password);
      setUser(res.user);
      setProfile(res.profile);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const registerPatient = async (data) => {
    try {
      const res = await authAPI.registerPatient(data);
      setUser(res.user);
      setProfile(res.profile);
      showToast('Registration successful! Welcome to HealthVault.', 'success');
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const registerDoctor = async (data) => {
    try {
      const res = await authAPI.registerDoctor(data);
      showToast(res.message || 'Doctor account registered. Pending Administrator approval.', 'info');
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    setProfile(null);
    showToast('You have been logged out successfully.', 'info');
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      if (user.role === 'patient') {
        const p = await patientAPI.getProfile(user.id);
        setProfile(p);
      } else if (user.role === 'doctor') {
        const d = await doctorAPI.getProfile(user.id);
        setProfile(d);
      }
    } catch (e) {
      console.warn('Failed to refresh profile:', e);
    }
  };

  const switchMode = (newMode) => {
    setManualMode(newMode);
    setMode(newMode);
    showToast(`Switched to ${newMode === 'live' ? 'Live Mode (Backend API)' : 'Demo Mode (Local Data)'}`, 'info');
  };

  const handleResetDemo = () => {
    resetDemoData();
    // Re-read current user in demo mode
    const demoSession = demoGetCurrentUser();
    if (demoSession) {
      setUser(demoSession.user);
      setProfile(demoSession.profile);
    }
    showToast('Demo data successfully reset to initial defaults!', 'success');
  };

  const recheckConnection = async () => {
    showToast('Checking backend connection...', 'info');
    const { mode: newMode, status } = await checkBackendHealth();
    setMode(newMode);
    setBackendStatus(status);
    if (newMode === 'live') {
      showToast('Backend and Database connected! Live Mode active.', 'success');
    } else {
      showToast(status.message, 'warning');
    }
  };

  const value = {
    user,
    profile,
    loading,
    mode,
    backendStatus,
    toastMessage,
    showToast,
    login,
    registerPatient,
    registerDoctor,
    logout,
    refreshProfile,
    switchMode,
    handleResetDemo,
    recheckConnection
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
