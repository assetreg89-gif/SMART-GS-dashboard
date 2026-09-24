import Keycloak from 'keycloak-js';

// Parse issuer jika tersedia (misal: https://auth.treg3.com/realms/smart)
const issuer = import.meta.env.VITE_KEYCLOAK_ISSUER;
let defaultUrl = import.meta.env.VITE_KEYCLOAK_URL || 'https://auth.treg3.com';
let defaultRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'smart';

if (issuer) {
  try {
    const parsed = new URL(issuer);
    defaultUrl = parsed.origin;
    const parts = parsed.pathname.split('/').filter(Boolean);
    const realmsIndex = parts.indexOf('realms');
    if (realmsIndex !== -1 && parts[realmsIndex + 1]) {
      defaultRealm = parts[realmsIndex + 1];
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

