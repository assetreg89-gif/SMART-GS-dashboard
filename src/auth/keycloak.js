import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'smart-gs',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'smart-gs-frontend'
};

export const keycloak = new Keycloak(keycloakConfig);

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
    redirectUri: window.location.origin
  });
};

export const loginWithKeycloakStandard = () => {
  return keycloak.login({
    redirectUri: window.location.origin
  });
};

export const logoutKeycloak = () => {
  return keycloak.logout({
    redirectUri: window.location.origin
  });
};
