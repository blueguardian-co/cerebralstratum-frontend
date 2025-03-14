import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient, { configureHeaders } from "../components/ApiClient";
import { useAuth } from "../providers/AuthProvider";

export interface Status {
    summary: string;
    overall: string;
    battery: number;
}

export type Device = {
    uuid: string;
    name: string | null;
    description: string | null;
    registered: Date;
    keycloak_user_id: string;
    keycloak_org_id: string | null;
    image_path: string | null;
    status: Status;
};

type DevicesContextType = {
    devices: Device[];
    setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
    selectedDevices: string[];
    setSelectedDevices: React.Dispatch<React.SetStateAction<string[]>>;
    isLoading: boolean;
    error: string | null;
    fetchDevices: () => Promise<void>;
};

const DevicesContext = createContext<DevicesContextType | undefined>(undefined);

const MyDevicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, token } = useAuth();
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDevices = async () => {
        setIsLoading(true);
        setError(null);
        if (!isAuthenticated) {
            return;
        }
        try {
            configureHeaders(token);
            const response = await apiClient.get("/api/v1/devices/mine");
            if (response.status === 200) {
                setDevices(response.data);
            } else {
                throw new Error("Failed to fetch devices.");
            }
        } catch (error) {
            console.error("Error fetching devices:", error);
            setError("Failed to fetch devices. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <DevicesContext.Provider
            value={{ devices, setDevices, selectedDevices, setSelectedDevices, isLoading, error, fetchDevices }}
        >
            {children}
        </DevicesContext.Provider>
    );
};

export const useMyDevices = (): DevicesContextType => {
    const context = useContext(DevicesContext);
    if (!context) {
        throw new Error("useMyDevices context must be used within a MyDevicesProvider component.");
    }
    return context;
};

export default MyDevicesProvider;