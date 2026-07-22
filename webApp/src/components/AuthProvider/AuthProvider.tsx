import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Keycloak from 'keycloak-js';
import { config } from '../../config.ts';
import { clearAuthToken, setAuthToken } from '../../api/client.ts';

export interface AuthUser {
  givenName?: string;
  familyName?: string;
  email?: string;
  preferredUsername?: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Module-level singleton — keycloak-js must not be initialized more than once
// (StrictMode double-invokes effects; initOnce guards against that).
const kc = new Keycloak({
  url: config.keycloakUrl,
  realm: config.keycloakRealm,
  clientId: config.keycloakClientId,
});

function userFromToken(): AuthUser | null {
  const parsed = kc.tokenParsed;
  if (!parsed) return null;
  return {
    givenName: parsed.given_name,
    familyName: parsed.family_name,
    email: parsed.email,
    preferredUsername: parsed.preferred_username,
  };
}

let initPromise: Promise<boolean> | null = null;

function initOnce(): Promise<boolean> {
  if (!initPromise) {
    initPromise = kc.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  }
  return initPromise;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    kc.onAuthSuccess = () => {
      if (kc.token) {
        setAuthToken(kc.token);
        setToken(kc.token);
        setUser(userFromToken());
        setIsAuthenticated(true);
      }
    };

    kc.onAuthRefreshSuccess = () => {
      if (kc.token) {
        setAuthToken(kc.token);
        setToken(kc.token);
        setUser(userFromToken());
      }
    };

    kc.onAuthLogout = () => {
      clearAuthToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    kc.onAuthError = () => {
      clearAuthToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    initOnce()
      .then((authenticated) => {
        if (authenticated && kc.token) {
          setAuthToken(kc.token);
          setToken(kc.token);
          setUser(userFromToken());
          setIsAuthenticated(true);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    intervalRef.current = setInterval(() => {
      kc.updateToken(90).catch(() => {
        clearAuthToken();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      });
    }, 30_000);

    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        user,
        login: () => void kc.login(),
        logout: () => void kc.logout(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
