import React, { createContext, useContext, useState, useEffect } from 'react';
import { keycloak, initKeycloak, loginWithKeycloakGoogle, loginWithKeycloakStandard, logoutKeycloak } from './keycloak';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'smart_gs_auth_user';
const STORAGE_KEY_TOKEN = 'smart_gs_auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState(import.meta.env.VITE_AUTH_MODE || 'simulator');

  useEffect(() => {
    const checkAuth = async () => {
      if (authMode === 'keycloak') {
        const authenticated = await initKeycloak();
        if (authenticated && keycloak.tokenParsed) {
          const profile = {
            id: keycloak.tokenParsed.sub,
            name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username || 'User Telkom',
            email: keycloak.tokenParsed.email || 'user@telkom.co.id',
            avatar: keycloak.tokenParsed.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            role: keycloak.tokenParsed.realm_access?.roles?.includes('admin_gs') ? 'admin_gs' : 'employee',
            unit_kerja: 'General Support Telkom Regional 3',
            provider: 'keycloak_google'
          };
          setUser(profile);
          setToken(keycloak.token);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          localStorage.setItem(STORAGE_KEY_TOKEN, keycloak.token);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [authMode]);

  // Login dengan Akun Google
  const loginWithGoogle = () => {
    if (authMode === 'keycloak') {
      loginWithKeycloakGoogle();
    } else {
      // Simulator Mode: Buat profil Google realistis
      const demoGoogleUser = {
        id: 'google-usr-' + Date.now(),
        name: 'Pegawai Telkom Regional 3',
        email: 'pegawai.telkom@telkom.co.id',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'employee',
        unit_kerja: 'General Support Telkom Regional 3',
        provider: 'google'
      };
      setUser(demoGoogleUser);
      setToken('simulated_jwt_google_token_' + Date.now());
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoGoogleUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, 'simulated_jwt_google_token');
    }
  };

  // Login dengan Keycloak SSO
  const loginWithKeycloak = () => {
    if (authMode === 'keycloak') {
      loginWithKeycloakStandard();
    } else {
      const demoKeycloakUser = {
        id: 'kc-usr-admin-01',
        name: 'Admin GS Regional 3',
        email: 'admin.gs@telkom.co.id',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'admin_gs',
        unit_kerja: 'Sekretariat & GS Regional 3',
        provider: 'keycloak'
      };
      setUser(demoKeycloakUser);
      setToken('simulated_jwt_kc_token_' + Date.now());
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoKeycloakUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, 'simulated_jwt_kc_token');
    }
  };

  // Login Cepat Simulasi (Khusus Development di Laptop)
  const loginDemo = (role = 'admin_gs') => {
    const demoProfiles = {
      admin_gs: {
        id: 'demo-admin-gs-01',
        name: 'Budi Santoso (Admin GS)',
        email: 'budi.santoso@telkom.co.id',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        role: 'admin_gs',
        unit_kerja: 'General Support & Facility Management',
        provider: 'demo'
      },
      employee: {
        id: 'demo-employee-02',
        name: 'Siti Rahmawati (Pegawai)',
        email: 'siti.rahmawati@telkom.co.id',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        role: 'employee',
        unit_kerja: 'Divisi Enterprise & Government',
        provider: 'demo'
      }
    };

    const selected = demoProfiles[role] || demoProfiles.admin_gs;
    setUser(selected);
    setToken('simulated_jwt_' + role + '_' + Date.now());
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(selected));
    localStorage.setItem(STORAGE_KEY_TOKEN, 'simulated_jwt_' + role);
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    if (authMode === 'keycloak' && keycloak.authenticated) {
      logoutKeycloak();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(user),
        authMode,
        loginWithGoogle,
        loginWithKeycloak,
        loginDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
