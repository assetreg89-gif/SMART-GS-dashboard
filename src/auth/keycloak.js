import Keycloak from 'keycloak-js';

// Parse issuer jika tersedia (misal: https://auth.treg3.com/auth/realms/smart atau https://auth.treg3.com/realms/smart)
const issuer = import.meta.env.VITE_KEYCLOAK_ISSUER;
let defaultUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://auth.treg3.com/auth';
let defaultRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'smart';

if (issuer) {
  try {
    const parsed = new URL(issuer);
    const parts = parsed.pathname.split('/').filter(Boolean);
    const realmsIndex = parts.indexOf('realms');
    
    if (realmsIndex !== -1 && parts[realmsIndex + 1]) {
      defaultRealm = parts[realmsIndex + 1];
      // Ambil path prefix sebelum 'realms' (misal: /auth)
      const prefix = parts.slice(0, realmsIndex).join('/');
      defaultUrl = parsed.origin + (prefix ? '/' + prefix : '');
    } else {
      defaultUrl = parsed.origin + (parsed.pathname.endsWith('/') ? parsed.pathname.slice(0, -1) : parsed.pathname);
    }
  } catch (e) {
    console.warn('Error parsing VITE_KEYCLOAK_ISSUER:', e);
  }
}

const keycloakConfig = {
  url: defaultUrl,
  realm: defaultRealm,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'smart-gs'
};

export const keycloak = new Keycloak(keycloakConfig);

const getRedirectUri = () => {
  const customRedirect = import.meta.env.VITE_KEYCLOAK_REDIRECT_URI;
  
  // Jika di domain produksi (bukan localhost), selalu gunakan origin domain produksi
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }

  if (customRedirect && customRedirect.trim() !== '') {
    if (customRedirect.startsWith('/')) {
      return `${window.location.origin}${customRedirect}`;
    }
    return customRedirect;
  }
  return window.location.origin;
};

export const initKeycloak = async () => {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
    });
    return authenticated;
  } catch (error) {
    console.warn('Keycloak Server belum dapat dihubungi (akan menggunakan mode fallback/simulator):', error);
    return false;
  }
};

export const loginWithKeycloakGoogle = () => {
  return keycloak.login({
    idpHint: 'google',
    redirectUri: getRedirectUri()
  });
};

export const loginWithKeycloakStandard = () => {
  return keycloak.login({
    redirectUri: getRedirectUri()
  });
};

export const logoutKeycloak = () => {
  return keycloak.logout({
    redirectUri: window.location.origin
  });
};
