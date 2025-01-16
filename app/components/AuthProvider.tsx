import React, { useEffect, useState, createContext, useContext, ReactNode } from "react";
// @ts-ignore
import Keycloak, { KeycloakConfig, KeycloakInstance } from "keycloak-js";
import { jwtDecode } from "jwt-decode";

// -------- Keycloak Configuration -------- //
const keycloakConfig: KeycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8080",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "cerebral-stratum",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENTID || "cerebral-stratum-frontend",
};

const keycloak = new Keycloak(keycloakConfig);

// -------- Context Setup -------- //
type AuthContextValue = {
    isAuthenticated: boolean;
    token: string | undefined;
    user: KeycloakTokenPayload | null;
    keycloak: KeycloakInstance;
    login: () => void;
    logout: () => void;
    refreshToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// -------- AuthProvider Component -------- //
interface AuthProviderProps {
    children: ReactNode;
}

type KeycloakTokenPayload = {
    given_name?: string;
    family_name?: string;
    email?: string;
    preferred_username?: string;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<KeycloakTokenPayload | null>(null);
    const [isAuthInitialized, setIsAuthInitialized] = useState(false);

    const decodeToken = (token: string) => {
        try {
            // @ts-ignore
            const decoded: KeycloakTokenPayload = jwtDecode(token);
            setUser(decoded);
        } catch (error) {
            console.error("Failed to decode token:", error);
        }
    };

    const initKeycloak = async () => {
        try {
            const authenticated = await keycloak.init({
                flow: "standard",
                onLoad: "check-sso",
                pkceMethod: "S256",
                checkLoginIframe: false,
            });

            if (authenticated) {
                setIsAuthenticated(true);
                setToken(keycloak.token);
                decodeToken(keycloak.token);
            } else {
                console.info("User is not logged in");
            }
            setIsAuthInitialized(true);
        } catch (error) {
            console.error("Keycloak initialization error:", error);
            setIsAuthInitialized(true); // Prevent blocking UI indefinitely
        }
    };

    // Periodically refresh the token
    const refreshToken = async () => {
        try {
            if (!keycloak.refreshToken) {
                logout()
            }
            const refreshed: boolean = await keycloak.updateToken(90);
            if (refreshed) {
                setToken(keycloak.token);
                decodeToken(keycloak.token);
            }
        } catch (error) {
            logout();
        }
    };

    // Login method (manual trigger)
    const login = async () => {
        try {
            await keycloak.login({
                prompt: "login",
            }); // Triggers the Keycloak login flow
            setIsAuthenticated(true);
            setToken(keycloak.token);
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    // Logout method
    const logout = async () => {
        try {
            await keycloak.logout({
                redirectUri: window.location.origin, // Redirect to home after logout
            });
            setIsAuthenticated(false);
            setToken(undefined);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Initialize Keycloak on component mount
    useEffect(() => {
        initKeycloak();

        // Set up periodic token refresh (every 30 seconds)
        const refreshInterval = setInterval(() => {
            if (keycloak.authenticated) {
                refreshToken();
            }
        }, 30000);

        return () => clearInterval(refreshInterval); // Cleanup on component unmount
    }, []);

    if (!isAuthInitialized) {
        return <div>Keycloak Initialising...</div>; // Show a loading state while initializing
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, user, keycloak, login, logout, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
};

// -------- useAuth Hook -------- //
// A custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthProvider;