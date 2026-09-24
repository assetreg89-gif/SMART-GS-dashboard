import React, { createContext, useContext, useState, useEffect } from 'react';
import { keycloak, initKeycloak, loginWithKeycloakStandard, logoutKeycloak } from './keycloak';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'smart_gs_auth_user';
const STORAGE_KEY_TOKEN = 'smart_gs_auth_token';

export const AuthProvider = ({ children }) => {
  const [authMode] = useState(import.meta.env.VITE_AUTH_MODE || 'simulator');
  const [user, setUser] = useState(() => {
    // In simulator mode, check localStorage for previous session
    if ((import.meta.env.VITE_AUTH_MODE || 'simulator') !== 'keycloak') {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (authMode === 'keycloak') {
        const authenticated = await initKeycloak();
        if (authenticated && keycloak.tokenParsed) {
          const profile = {
            id: keycloak.tokenParsed.sub,
            name: keycloak.tokenParsed.name || keycloak.tokenParsed.preferred_username || 'Pegawai Telkom Regional 3',
            email: keycloak.tokenParsed.email || 'user@telkom.co.id',
            avatar: keycloak.tokenParsed.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
            role: keycloak.tokenParsed.realm_access?.roles?.includes('admin_gs') ? 'admin_gs' : 'employee',
            unit_kerja: 'General Support Telkom Regional 3',
            provider: 'keycloak'
          };
          if (isMounted) {
            setUser(profile);
            setToken(keycloak.token);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
            localStorage.setItem(STORAGE_KEY_TOKEN, keycloak.token);
          }
        } else {
          // If not authenticated via Keycloak, clear session state to enforce login page
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem(STORAGE_KEY_USER);
            localStorage.removeItem(STORAGE_KEY_TOKEN);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [authMode]);

  // Unified Single Login via Keycloak SSO
  const login = () => {
    if (authMode === 'keycloak') {
      loginWithKeycloakStandard();
    } else {
      // Simulator Mode Fallback (for local testing without active Keycloak instance)
      const demoUser = {
        id: 'kc-usr-regional3',
        name: 'Pegawai Telkom Regional 3',
        email: 'pegawai.telkom@telkom.co.id',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        role: 'employee',
        unit_kerja: 'General Support Telkom Regional 3',
        provider: 'keycloak'
      };
      setUser(demoUser);
      setToken('simulated_jwt_kc_token_' + Date.now());
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(demoUser));
      localStorage.setItem(STORAGE_KEY_TOKEN, 'simulated_jwt_kc_token');
    }
  };

  // Aliases for compatibility
  const loginWithKeycloak = login;
  const loginWithGoogle = login;

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
        login,
        loginWithKeycloak,
        loginWithGoogle,
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

