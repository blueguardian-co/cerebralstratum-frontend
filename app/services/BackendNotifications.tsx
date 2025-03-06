import { useEffect } from "react";
import apiClient, { configureHeaders } from "../components/ApiClient";
import { useAuth } from "../providers/AuthProvider";

type BackendNotification = {
    id: number,
    title: string,
    description: string,
    severity: 'success' | 'warning' | 'info',
    timestamp: string,
    read: boolean,
}

type BackendNotificationServiceProps = {
    backendNotifications: BackendNotification;
    setBackendNotifications: React.Dispatch<React.SetStateAction<BackendNotification>>;
};

export default function BackendNotificationService(
    {backendNotifications, setBackendNotifications}: BackendNotificationServiceProps
): null {
    const { token } = useAuth();

    useEffect(() => {
        let mounted = true;

        const fetchBackendNotifications = async () => {
            if (!token || !mounted) return;

            try {
                // Configure headers dynamically with the token
                configureHeaders(token);
                const response = await apiClient.get('/q/health');

                if (!mounted) return;
                if (!backendNotifications) return;

                if (response.status !== 200) {
                    if (backendNotifications.title === 'Connection to the backend is unhealthy') {
                        return;
                    }
                    setBackendNotifications(
                        {
                            id: 0,
                            title: 'Connection to the backend is unhealthy',
                            description: 'There is something degrading the connection with the backend.',
                            severity: 'warning',
                            timestamp: new Date().toDateString(),
                            read: false,
                        }
                    );
                    return;
                }
                if (response.status === 200) {
                    if (backendNotifications.title === 'Backend online') {
                        return;
                    }
                    setBackendNotifications(
                        {
                            id: 0,
                            title: 'Backend online',
                            description: 'Successfully connected to the backend.',
                            severity: 'success',
                            timestamp: new Date().toDateString(),
                            read: false,
                        }
                    );
                    return;
                }
            } catch(error) {
                if (!mounted) return;

                if (backendNotifications.title === 'Error connecting to the backend') {
                    return;
                }
                setBackendNotifications(
                    {
                        id: 0,
                        title: 'Error connecting to the backend',
                        description: 'There is an error when connecting to the backend.',
                        severity: 'warning',
                        timestamp: new Date().toDateString(),
                        read: false,
                    }
                );
                console.error('Error fetching backend notifications:', error);
            }
        };
        fetchBackendNotifications();
        const intervalId = setInterval(fetchBackendNotifications, 3000); // Poll every 3 seconds

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
        
    }, [token]);
    return null;
};